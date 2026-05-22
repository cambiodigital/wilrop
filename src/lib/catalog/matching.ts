import type {
  CatalogSourceType,
  DestinationCandidate,
  DestinationMatchInput,
  DestinationMatchReport,
} from './types'

const CUID_PATTERN = /^c[a-z0-9]{8,}$/i

export function normalizeCatalogText(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeCatalogSlug(value: string | null | undefined): string {
  return normalizeCatalogText(value).replace(/\s+/g, '-')
}

export function isLikelyCuid(value: string | null | undefined): boolean {
  return CUID_PATTERN.test((value ?? '').trim())
}

export function resolveDestinationMatch(
  input: DestinationMatchInput,
  destinations: DestinationCandidate[],
): Omit<DestinationMatchReport, 'entity' | 'entityId' | 'legacyValue' | 'dryRun'> {
  const bySlug = findUniqueDestination(
    destinations,
    (destination) => normalizeCatalogSlug(destination.slug) === normalizeCatalogSlug(input.slug),
  )

  if (input.slug && bySlug.status === 'matched') {
    return { matchedId: bySlug.destination.id, strategy: 'slug' }
  }

  if (input.slug && bySlug.status === 'ambiguous') {
    return ambiguous('slug matched multiple destinations', bySlug.destinations)
  }

  const id = input.id?.trim()
  const byId = findUniqueDestination(destinations, (destination) => destination.id === id)

  if (id && byId.status === 'matched') {
    return { matchedId: byId.destination.id, strategy: 'cuid' }
  }

  if (id && byId.status === 'ambiguous') {
    return ambiguous('id matched multiple destinations', byId.destinations)
  }

  const normalizedName = normalizeCatalogText(input.name)
  const byName = findUniqueDestination(
    destinations,
    (destination) => normalizeCatalogText(destination.name) === normalizedName,
  )

  if (normalizedName && byName.status === 'matched') {
    return { matchedId: byName.destination.id, strategy: 'name' }
  }

  if (normalizedName && byName.status === 'ambiguous') {
    return ambiguous('normalized name matched multiple destinations', byName.destinations)
  }

  return {
    strategy: 'unresolved',
    reason: 'No destination matched by slug, id, or normalized name.',
  }
}

export function createDestinationMatchReport(params: {
  entity: CatalogSourceType
  entityId: string
  input: DestinationMatchInput
  destinations: DestinationCandidate[]
  dryRun?: boolean
}): DestinationMatchReport {
  const match = resolveDestinationMatch(params.input, params.destinations)

  return {
    entity: params.entity,
    entityId: params.entityId,
    legacyValue: describeLegacyDestinationValue(params.input),
    dryRun: params.dryRun ?? true,
    ...match,
  }
}

function describeLegacyDestinationValue(input: DestinationMatchInput): string {
  return [input.slug, input.id, input.name]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(' | ') || '(empty)'
}

function ambiguous(reason: string, destinations: DestinationCandidate[]) {
  return {
    strategy: 'ambiguous' as const,
    reason,
    candidates: destinations.map(({ id, slug, name }) => ({ id, slug, name })),
  }
}

function findUniqueDestination(
  destinations: DestinationCandidate[],
  predicate: (destination: DestinationCandidate) => boolean,
):
  | { status: 'matched'; destination: DestinationCandidate }
  | { status: 'ambiguous'; destinations: DestinationCandidate[] }
  | { status: 'missing' } {
  const matches = destinations.filter(predicate)

  if (matches.length === 1) {
    return { status: 'matched', destination: matches[0] }
  }

  if (matches.length > 1) {
    return { status: 'ambiguous', destinations: matches }
  }

  return { status: 'missing' }
}
