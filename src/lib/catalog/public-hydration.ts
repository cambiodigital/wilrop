/**
 * Public hydration helpers — pure, testable normalization for public-facing
 * destination detail, hotel, package, and excursion data loaded through
 * relational join models with legacy fallback.
 *
 * These are consumed by server components (RSC) that hydrate catalog data
 * for public portal pages. Kept pure so they can be verified without a DB.
 */

// ─── JSON Array Parsing ────────────────────────────────────────────

export function parseJsonArray<T = unknown>(
  raw: string | null | undefined,
): T[] {
  try {
    const parsed = JSON.parse(raw ?? '[]')
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

// ─── isTemplate Fallback ────────────────────────────────────────────

/**
 * When zero real (non-template) active rows exist for an entity type,
 * the public query MUST include templates so empty pages are avoided.
 *
 * Returns `true` when only templates exist (realActiveCount === 0),
 * meaning `isTemplate` should be set to `true` in the where clause.
 */
export function resolveIsTemplateFallback(
  realActiveCount: number,
): boolean {
  return realActiveCount === 0
}

// ─── Entity Normalization ───────────────────────────────────────────

export interface NormalizedPackage {
  id: string
  slug: string
  title: string
  description: string
  image: string
  price: number
  originalPrice: number | null
  category: string
  rating: number
  duration: string
  difficulty: string
  groupSize: string
  soldOut: boolean
  includes: string[]
  departureDates: string[]
  active: boolean
  isTemplate: boolean
}

export function normalizePackage(
  pkg: Record<string, unknown>,
): NormalizedPackage {
  return {
    id: String(pkg.id ?? ''),
    slug: String(pkg.slug ?? ''),
    title: String(pkg.title ?? ''),
    description: String(pkg.description ?? ''),
    image: String(pkg.image ?? ''),
    price: Number(pkg.price ?? 0),
    originalPrice: pkg.originalPrice != null ? Number(pkg.originalPrice) : null,
    category: String(pkg.category ?? ''),
    rating: Number(pkg.rating ?? 0),
    duration: String(pkg.duration ?? ''),
    difficulty: String(pkg.difficulty ?? 'Fácil'),
    groupSize: String(pkg.groupSize ?? ''),
    soldOut: Boolean(pkg.soldOut),
    includes: parseJsonArray<string>(String(pkg.includes ?? '[]')),
    departureDates: parseJsonArray<string>(String(pkg.departureDates ?? '[]')),
    active: Boolean(pkg.active ?? true),
    isTemplate: Boolean(pkg.isTemplate ?? true),
  }
}

export interface NormalizedHotel {
  id: string
  slug: string
  name: string
  cityId: string
  cityName: string
  stars: number
  rating: number
  reviewCount: number
  priceFrom: number
  images: string[]
  description: string
  featured: boolean
  active: boolean
  isTemplate: boolean
  address: string
  rooms: unknown[]
  amenities: string[]
  tags: string[]
}

export function normalizeHotel(
  hotel: Record<string, unknown>,
): NormalizedHotel {
  return {
    id: String(hotel.id ?? ''),
    slug: String(hotel.slug ?? ''),
    name: String(hotel.name ?? ''),
    cityId: String(hotel.cityId ?? ''),
    cityName: String(hotel.cityName ?? ''),
    stars: Number(hotel.stars ?? 3),
    rating: Number(hotel.rating ?? 0),
    reviewCount: Number(hotel.reviewCount ?? 0),
    priceFrom: Number(hotel.priceFrom ?? 0),
    images: parseJsonArray<string>(String(hotel.images ?? '[]')),
    description: String(hotel.description ?? ''),
    featured: Boolean(hotel.featured),
    active: Boolean(hotel.active ?? true),
    isTemplate: Boolean(hotel.isTemplate ?? true),
    address: String(hotel.address ?? ''),
    rooms: parseJsonArray<unknown>(String(hotel.rooms ?? '[]')),
    amenities: parseJsonArray<string>(String(hotel.amenities ?? '[]')),
    tags: parseJsonArray<string>(String(hotel.tags ?? '[]')),
  }
}

export interface NormalizedExcursion {
  id: string
  slug: string
  name: string
  destinationId: string
  destinationName: string
  cityName: string
  description: string
  images: string[]
  duration: string
  difficulty: string
  basePrice: number
  childPrice: number
  category: string
  rating: number
  featured: boolean
  active: boolean
  isTemplate: boolean
  includes: string[]
  excludes: string[]
  requirements: string[]
  shortDesc: string
  groupSize: string
}

export function normalizeExcursion(
  excursion: Record<string, unknown>,
): NormalizedExcursion {
  return {
    id: String(excursion.id ?? ''),
    slug: String(excursion.slug ?? ''),
    name: String(excursion.name ?? ''),
    destinationId: String(excursion.destinationId ?? ''),
    destinationName: String(excursion.destinationName ?? ''),
    cityName: String(excursion.cityName ?? ''),
    description: String(excursion.description ?? ''),
    images: parseJsonArray<string>(String(excursion.images ?? '[]')),
    duration: String(excursion.duration ?? ''),
    difficulty: String(excursion.difficulty ?? 'Fácil'),
    basePrice: Number(excursion.basePrice ?? 0),
    childPrice: Number(excursion.childPrice ?? 0),
    category: String(excursion.category ?? ''),
    rating: Number(excursion.rating ?? 0),
    featured: Boolean(excursion.featured),
    active: Boolean(excursion.active ?? true),
    isTemplate: Boolean(excursion.isTemplate ?? true),
    includes: parseJsonArray<string>(String(excursion.includes ?? '[]')),
    excludes: parseJsonArray<string>(String(excursion.excludes ?? '[]')),
    requirements: parseJsonArray<string>(String(excursion.requirements ?? '[]')),
    shortDesc: String(excursion.shortDesc ?? ''),
    groupSize: String(excursion.groupSize ?? ''),
  }
}

// ─── Transport normalization ────────────────────────────────────────

export interface NormalizedTransport {
  id: string
  name: string
  routeType: string
  origin: string
  destination: string
  cityId: string
  cityName: string
  durationMins: number
  basePrice: number
  pricePerExtra: number
  includes: string[]
  notes: string
  active: boolean
  isTemplate: boolean
  providerId: string
  provider: {
    id: string
    name: string
    vehicleType: string
    capacity: number
  }
}

export function normalizeTransport(
  transport: Record<string, unknown>,
): NormalizedTransport {
  const providerData = transport.provider as Record<string, unknown> | null | undefined
  const provider = providerData
    ? {
        id: String(providerData.id ?? ''),
        name: String(providerData.name ?? 'Proveedor no especificado'),
        vehicleType: String(providerData.vehicleType ?? 'auto'),
        capacity: Number(providerData.capacity ?? 4),
      }
    : {
        id: '',
        name: 'Proveedor no especificado',
        vehicleType: 'auto',
        capacity: 4,
      }

  return {
    id: String(transport.id ?? ''),
    name: String(transport.name ?? ''),
    routeType: String(transport.routeType ?? ''),
    origin: String(transport.origin ?? ''),
    destination: String(transport.destination ?? ''),
    cityId: String(transport.cityId ?? ''),
    cityName: String(transport.cityName ?? ''),
    durationMins: Number(transport.durationMins ?? 0),
    basePrice: Number(transport.basePrice ?? 0),
    pricePerExtra: Number(transport.pricePerExtra ?? 0),
    includes: parseJsonArray<string>(String(transport.includes ?? '[]')),
    notes: String(transport.notes ?? ''),
    active: Boolean(transport.active ?? true),
    isTemplate: Boolean(transport.isTemplate ?? true),
    providerId: String(transport.providerId ?? ''),
    provider,
  }
}

// ─── Cruise normalization ───────────────────────────────────────────

export interface NormalizedCruiseCabin {
  id: string
  cruiseId: string
  name: string
  capacity: number
  beds: string
  basePrice: number
  originalPrice: number | null
  includes: string[]
  cabinImage: string
  active: boolean
}

export function normalizeCruiseCabin(
  cabin: Record<string, unknown>,
): NormalizedCruiseCabin {
  return {
    id: String(cabin.id ?? ''),
    cruiseId: String(cabin.cruiseId ?? ''),
    name: String(cabin.name ?? ''),
    capacity: Number(cabin.capacity ?? 2),
    beds: String(cabin.beds ?? '2 camas individuales'),
    basePrice: Number(cabin.basePrice ?? 0),
    originalPrice: cabin.originalPrice != null ? Number(cabin.originalPrice) : null,
    includes: parseJsonArray<string>(String(cabin.includes ?? '[]')),
    cabinImage: String(cabin.cabinImage ?? ''),
    active: Boolean(cabin.active ?? true),
  }
}

export interface NormalizedCruise {
  id: string
  slug: string
  name: string
  description: string
  shipName: string
  operator: string
  durationDays: number
  images: string[]
  includes: string[]
  itinerary: unknown[]
  rating: number
  reviewCount: number
  priceFrom: number
  tags: string[]
  featured: boolean
  active: boolean
  isTemplate: boolean
  primaryDestinationId: string | null
  cabins: NormalizedCruiseCabin[]
}

export function normalizeCruise(
  cruise: Record<string, unknown>,
): NormalizedCruise {
  const cabinsData = Array.isArray(cruise.cabins) ? cruise.cabins : []
  const normalizedCabins = cabinsData.map((c) => normalizeCruiseCabin(c as Record<string, unknown>))

  return {
    id: String(cruise.id ?? ''),
    slug: String(cruise.slug ?? ''),
    name: String(cruise.name ?? ''),
    description: String(cruise.description ?? ''),
    shipName: String(cruise.shipName ?? ''),
    operator: String(cruise.operator ?? ''),
    durationDays: Number(cruise.durationDays ?? 3),
    images: parseJsonArray<string>(String(cruise.images ?? '[]')),
    includes: parseJsonArray<string>(String(cruise.includes ?? '[]')),
    itinerary: parseJsonArray<unknown>(String(cruise.itinerary ?? '[]')),
    rating: Number(cruise.rating ?? 0),
    reviewCount: Number(cruise.reviewCount ?? 0),
    priceFrom: Number(cruise.priceFrom ?? 0),
    tags: parseJsonArray<string>(String(cruise.tags ?? '[]')),
    featured: Boolean(cruise.featured),
    active: Boolean(cruise.active ?? true),
    isTemplate: Boolean(cruise.isTemplate ?? true),
    primaryDestinationId: cruise.primaryDestinationId ? String(cruise.primaryDestinationId) : null,
    cabins: normalizedCabins,
  }
}

// ─── Destination-Package relation resolution ────────────────────────

export interface DestinationPackageJoinRow {
  packageId: string
  destinationId: string
  active?: boolean
}

/**
 * Resolve the set of related destination IDs for each package from
 * DestinationPackage join rows. Used to enrich public API responses so
 * client components can filter destinations by real relations instead of
 * legacy string comparison (p.destinationId === d.id).
 *
 * Returns a Map<packageId, destinationIds[]>.
 */
export function resolvePackageDestinationIds(
  joinRows: DestinationPackageJoinRow[],
): Map<string, string[]> {
  const map = new Map<string, string[]>()
  for (const row of joinRows) {
    // Exclude inactive join rows from public result
    if (row.active === false) continue
    const ids = map.get(row.packageId) ?? []
    ids.push(row.destinationId)
    map.set(row.packageId, ids)
  }
  return map
}

// ─── Destination Filter Resolution ──────────────────────────────────

export interface ResolvedDestinationFilter {
  destinationId: string
  destination: { id: string; name: string; slug: string }
}

/**
 * Resolve a destination ID from a slug or direct ID query parameter.
 * Returns null when no filter is provided or the destination is not found.
 *
 * Shared by public API routes that accept `destinationId` or `destinationSlug`.
 */
export async function resolveDestinationFilter(
  db: { destination: { findFirst: (args: any) => Promise<any> } },
  slugOrId: string | null,
): Promise<ResolvedDestinationFilter | null> {
  if (!slugOrId) return null

  const destination = await db.destination.findFirst({
    where: {
      OR: [{ id: slugOrId }, { slug: slugOrId }],
      active: true,
    },
    select: { id: true, name: true, slug: true },
  })

  if (!destination) return null
  return { destinationId: destination.id, destination }
}

// ─── Filter helpers for join-row results ────────────────────────────

export interface JoinRowWithEntity<T> {
  featured?: boolean
  sortOrder?: number
  active?: boolean
  // The related entity — shape depends on Prisma include
  [key: string]: unknown
}

/**
 * Filter and sort join rows by entity active/isTemplate status,
 * returning the related entity objects in sort order.
 */
export function extractEntitiesFromJoinRows<T>(
  joinRows: JoinRowWithEntity<T>[],
  entityKey: string,
  isTemplateFallback: boolean,
  fallbackSortKey?: string,
): T[] {
  const filtered = joinRows
    .filter((row) => {
      const entity = row[entityKey] as Record<string, unknown> | undefined
      if (!entity) return false
      const active = entity.active !== false
      const isTemplate = Boolean(entity.isTemplate ?? true)
      return active && isTemplate === isTemplateFallback
    })
    .sort((a, b) => {
      const sa = Number(a.sortOrder ?? 0)
      const sb = Number(b.sortOrder ?? 0)
      return sa - sb
    })

  return filtered.map((row) => row[entityKey] as T)
}
