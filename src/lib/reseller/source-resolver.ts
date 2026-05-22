// ---------------------------------------------------------------------------
// Typed contracts — one consistent shape regardless of source type.
// ---------------------------------------------------------------------------

/** Input contract: subset of {@link CatalogItemWithSource} needed by resolvers. */
export interface CatalogItemForPresentation {
  id: string
  sourceType: string
  sourceId: string
  customPrice: number | null
  customName: string
  customDescription: string
  active: boolean
  featured: boolean
  sourceData: Record<string, unknown>
}

export interface ResolvedSource {
  /** Display title — normalised from name / title / serviceName */
  title: string
  /** Primary image URL — normalised from images[0] / image */
  image: string
  /** Base price — normalised from priceFrom / basePrice / price */
  price: number
  /** Human-readable location — cityName / region / route */
  location: string
  /** Display description — normalised from description / notes */
  description: string
  /** Whether the source record is active */
  active: boolean
  /** Whether the source record is a template */
  isTemplate: boolean
  /** Source catalog type */
  sourceType: string
  /** Original source record id */
  sourceId: string
  /** Extra source-specific metadata (stars, category, provider, etc.) */
  metadata: Record<string, unknown>
}

export interface CatalogPresentation {
  /** Effective display title (customName || source.title) */
  title: string
  /** Effective image (always from source for now) */
  image: string
  /** Effective display price (customPrice ?? source.price) */
  price: number
  /** Original source base price before override */
  originalPrice: number
  /** Location label */
  location: string
  /** Effective description (customDescription || source.description) */
  description: string
  /** Whether the catalog item is active */
  active: boolean
  /** Whether the catalog item is featured */
  featured: boolean
  /** Whether the source is a template */
  isTemplate: boolean
  /** Source catalog type */
  sourceType: string
  /** Original source record id */
  sourceId: string
  /** Catalog item id (reseller row) */
  itemId: string
  /** Whether the reseller set a custom price */
  hasCustomPrice: boolean
  /** Whether the reseller set a custom name */
  hasCustomName: boolean
  /** Extra source-specific metadata */
  metadata: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Pure helpers — no side effects, testable without a database.
// ---------------------------------------------------------------------------

/**
 * Normalise inconsistent source-data shapes into a single {@link ResolvedSource}
 * contract.  Accepts the `sourceData` blob returned by `fetchSourceData` and the
 * source-type key.
 *
 * If `sourceData` is empty or the source type is unknown the result is still a
 * valid (empty) contract — callers can check `active` for guard logic.
 */
export function resolveSourceFields(
  sourceType: string,
  sourceData: Record<string, unknown>,
): ResolvedSource {
  const base: ResolvedSource = {
    title: '',
    image: '',
    price: 0,
    location: '',
    description: '',
    active: false,
    isTemplate: false,
    sourceType,
    sourceId: (sourceData.id as string) ?? '',
    metadata: {},
  }

  if (!sourceData || Object.keys(sourceData).length === 0) return base

  base.active = (sourceData.active as boolean) ?? false
  base.isTemplate = (sourceData.isTemplate as boolean) ?? false
  base.sourceId = (sourceData.id as string) ?? base.sourceId

  switch (sourceType) {
    case 'hotel': {
      base.title = (sourceData.name as string) ?? ''
      base.image = parseFirstImage(sourceData.images) ?? ''
      base.price = (sourceData.priceFrom as number) ?? 0
      base.location = (sourceData.cityName as string) ?? ''
      base.description = (sourceData.description as string) ?? ''
      base.metadata = {
        stars: sourceData.stars ?? 0,
      }
      break
    }
    case 'excursion': {
      base.title = (sourceData.name as string) ?? ''
      base.image = parseFirstImage(sourceData.images) ?? ''
      base.price = (sourceData.basePrice as number) ?? 0
      base.location = (sourceData.cityName as string) ?? ''
      base.description = (sourceData.description as string) ?? ''
      base.metadata = {
        category: sourceData.category ?? '',
      }
      break
    }
    case 'package': {
      base.title = (sourceData.title as string) ?? (sourceData.name as string) ?? ''
      base.image = (sourceData.image as string) ?? ''
      base.price = (sourceData.price as number) ?? 0
      base.location = (sourceData.destinationName as string) ?? ''
      base.description = (sourceData.description as string) ?? ''
      base.metadata = {
        category: sourceData.category ?? '',
      }
      break
    }
    case 'transport': {
      base.title = (sourceData.name as string) ?? ''
      base.price = (sourceData.basePrice as number) ?? 0
      base.location =
        sourceData.origin && sourceData.destination
          ? `${sourceData.origin as string} → ${sourceData.destination as string}`
          : ((sourceData.origin as string) ?? (sourceData.destination as string) ?? '')
      base.description = (sourceData.notes as string) ?? ''
      base.metadata = {
        providerId: sourceData.providerId ?? '',
        provider: sourceData.provider ?? null,
      }
      break
    }
    case 'destination': {
      base.title = (sourceData.name as string) ?? ''
      base.image = (sourceData.image as string) ?? ''
      base.price = (sourceData.priceFrom as number) ?? 0
      base.location = (sourceData.region as string) ?? ''
      base.description = (sourceData.description as string) ?? ''
      break
    }
    case 'room': {
      base.title = (sourceData.name as string) ?? ''
      base.price = (sourceData.basePrice as number) ?? 0
      base.location =
        sourceData.hotel && typeof sourceData.hotel === 'object'
          ? ((sourceData.hotel as Record<string, unknown>).cityName as string) ?? ''
          : ''
      base.metadata = {
        hotelId: sourceData.hotelId ?? '',
        maxGuests: sourceData.maxGuests ?? 0,
        beds: sourceData.beds ?? '',
        hotel: sourceData.hotel ?? null,
      }
      break
    }
  }

  return base
}

/**
 * Merge resolved source fields with a reseller catalog row's custom overrides
 * into a single presentation contract that components render directly.
 */
export function resolveCatalogPresentation(
  item: CatalogItemForPresentation,
): CatalogPresentation {
  const source = resolveSourceFields(item.sourceType, item.sourceData)

  const hasCustomName = item.customName.length > 0
  const hasCustomPrice = item.customPrice !== null

  return {
    title: hasCustomName ? item.customName : source.title,
    image: source.image,
    price: hasCustomPrice ? (item.customPrice as number) : source.price,
    originalPrice: source.price,
    location: source.location,
    description:
      (item.customDescription || source.description).slice(0, 200),
    active: item.active,
    featured: item.featured,
    isTemplate: source.isTemplate,
    sourceType: item.sourceType,
    sourceId: item.sourceId,
    itemId: item.id,
    hasCustomPrice,
    hasCustomName,
    metadata: source.metadata,
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function parseFirstImage(raw: unknown): string | null {
  if (typeof raw === 'string') {
    try {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr) && arr.length > 0) return String(arr[0])
    } catch {
      return raw || null
    }
  }
  if (Array.isArray(raw) && raw.length > 0) return String(raw[0])
  return null
}
