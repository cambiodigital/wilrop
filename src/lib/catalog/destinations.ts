import { db } from '@/lib/db'
import {
  parseJsonArray,
  resolveIsTemplateFallback,
  normalizePackage,
  normalizeHotel,
  normalizeExcursion,
  normalizeTransport,
  normalizeCruise,
  extractEntitiesFromJoinRows,
} from '@/lib/catalog/public-hydration'
import type {
  NormalizedPackage,
  NormalizedHotel,
  NormalizedExcursion,
  NormalizedTransport,
  NormalizedCruise,
} from '@/lib/catalog/public-hydration'

// ─── isTemplate resolution ─────────────────────────────────────────

async function resolveTemplateFallbackForEntity(
  model: 'destination' | 'package' | 'hotel' | 'excursion' | 'transport' | 'cruise',
): Promise<boolean> {
  const where = { active: true, isTemplate: false }
  let count: number
  switch (model) {
    case 'destination':
      count = await db.destination.count({ where })
      break
    case 'package':
      count = await db.travelPackage.count({ where })
      break
    case 'hotel':
      count = await db.hotel.count({ where })
      break
    case 'excursion':
      count = await db.excursion.count({ where })
      break
    case 'transport':
      count = await db.transportService.count({ where })
      break
    case 'cruise':
      count = await db.cruise.count({ where })
      break
  }
  return resolveIsTemplateFallback(count)
}

// ─── Relational package hydration ───────────────────────────────────

async function getRelatedPackages(
  destinationId: string,
  isTemplateFallback: boolean,
): Promise<NormalizedPackage[]> {
  // 1. Try DestinationPackage join model first
  const joinRows = await db.destinationPackage.findMany({
    where: { destinationId, active: true },
    include: { package: true },
    orderBy: { sortOrder: 'asc' },
  })

  if (joinRows.length > 0) {
    const fromJoin = extractEntitiesFromJoinRows(joinRows, 'package', isTemplateFallback)
    if (fromJoin.length > 0) {
      return (fromJoin as Array<Record<string, unknown>>).map(normalizePackage).sort((a, b) => b.rating - a.rating)
    }
  }

  // 2. Fallback: primary destination FK on TravelPackage
  const viaFk = await db.travelPackage.findMany({
    where: { primaryDestinationId: destinationId, active: true, isTemplate: isTemplateFallback },
    orderBy: { rating: 'desc' },
  })
  if (viaFk.length > 0) {
    return viaFk.map((p) => normalizePackage(p as unknown as Record<string, unknown>))
  }

  // 3. Legacy fallback: string destinationId field
  const viaLegacy = await db.travelPackage.findMany({
    where: { destinationId, active: true, isTemplate: isTemplateFallback },
    orderBy: { rating: 'desc' },
  })
  return viaLegacy.map((p) => normalizePackage(p as unknown as Record<string, unknown>))
}

// ─── Relational hotel hydration ─────────────────────────────────────

async function getRelatedHotels(
  destinationId: string,
  destinationName: string,
  isTemplateFallback: boolean,
): Promise<NormalizedHotel[]> {
  // 1. Try DestinationHotel join model first
  const joinRows = await db.destinationHotel.findMany({
    where: { destinationId, active: true },
    include: { hotel: true },
    orderBy: { sortOrder: 'asc' },
  })

  if (joinRows.length > 0) {
    const fromJoin = extractEntitiesFromJoinRows(joinRows, 'hotel', isTemplateFallback)
    if (fromJoin.length > 0) {
      return (fromJoin as Array<Record<string, unknown>>).map(normalizeHotel)
    }
  }

  // 2. Fallback: Hotel.destinationId nullable FK
  const viaFk = await db.hotel.findMany({
    where: { destinationId, active: true, isTemplate: isTemplateFallback },
  })
  if (viaFk.length > 0) {
    return viaFk.map((h) => normalizeHotel(h as unknown as Record<string, unknown>))
  }

  // 3. Legacy fallback: cityId matches destination id OR cityName matches destination name
  const viaLegacy = await db.hotel.findMany({
    where: {
      active: true,
      isTemplate: isTemplateFallback,
      OR: [{ cityId: destinationId }, { cityName: destinationName }],
    },
  })
  return viaLegacy.map((h) => normalizeHotel(h as unknown as Record<string, unknown>))
}

// ─── Relational excursion hydration ─────────────────────────────────

async function getRelatedExcursions(
  destinationId: string,
  destinationName: string,
  isTemplateFallback: boolean,
): Promise<NormalizedExcursion[]> {
  // 1. Try DestinationExcursion join model first
  const joinRows = await db.destinationExcursion.findMany({
    where: { destinationId, active: true },
    include: { excursion: true },
    orderBy: { sortOrder: 'asc' },
  })

  if (joinRows.length > 0) {
    const fromJoin = extractEntitiesFromJoinRows(joinRows, 'excursion', isTemplateFallback)
    if (fromJoin.length > 0) {
      return (fromJoin as Array<Record<string, unknown>>).map(normalizeExcursion)
    }
  }

  // 2. Fallback: Excursion.destinationRefId nullable FK
  const viaFk = await db.excursion.findMany({
    where: { destinationRefId: destinationId, active: true, isTemplate: isTemplateFallback },
  })
  if (viaFk.length > 0) {
    return viaFk.map((e) => normalizeExcursion(e as unknown as Record<string, unknown>))
  }

  // 3. Legacy fallback: string destinationId field or destinationName match
  const viaLegacy = await db.excursion.findMany({
    where: {
      active: true,
      isTemplate: isTemplateFallback,
      OR: [{ destinationId }, { destinationName }],
    },
  })
  return viaLegacy.map((e) => normalizeExcursion(e as unknown as Record<string, unknown>))
}

// ─── Relational transport hydration ────────────────────────────────

async function getRelatedTransportServices(
  destinationId: string,
  destinationName: string,
  isTemplateFallback: boolean,
): Promise<NormalizedTransport[]> {
  // 1. Try DestinationTransportService join model first
  const joinRows = await db.destinationTransportService.findMany({
    where: { destinationId, active: true },
    include: {
      transportService: {
        include: {
          provider: {
            select: { id: true, name: true, vehicleType: true, capacity: true },
          },
        },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })

  if (joinRows.length > 0) {
    const fromJoin = extractEntitiesFromJoinRows(joinRows, 'transportService', isTemplateFallback)
    if (fromJoin.length > 0) {
      return (fromJoin as Array<Record<string, unknown>>).map(normalizeTransport)
    }
  }

  // 2. Fallback: TransportService nullable FKs (originDestinationId or destinationDestinationId)
  const viaFk = await db.transportService.findMany({
    where: {
      active: true,
      isTemplate: isTemplateFallback,
      OR: [
        { originDestinationId: destinationId },
        { destinationDestinationId: destinationId },
      ],
    },
    include: {
      provider: {
        select: { id: true, name: true, vehicleType: true, capacity: true },
      },
    },
  })
  if (viaFk.length > 0) {
    return viaFk.map((t) => normalizeTransport(t as unknown as Record<string, unknown>))
  }

  // 3. Legacy fallback: cityId matches destination id OR cityName matches destination name
  const viaLegacy = await db.transportService.findMany({
    where: {
      active: true,
      isTemplate: isTemplateFallback,
      OR: [{ cityId: destinationId }, { cityName: destinationName }],
    },
    include: {
      provider: {
        select: { id: true, name: true, vehicleType: true, capacity: true },
      },
    },
  })
  return viaLegacy.map((t) => normalizeTransport(t as unknown as Record<string, unknown>))
}

// ─── Relational cruise hydration ───────────────────────────────────

async function getRelatedCruises(
  destinationId: string,
  isTemplateFallback: boolean,
): Promise<NormalizedCruise[]> {
  // 1. Try DestinationCruise join model first
  const joinRows = await db.destinationCruise.findMany({
    where: { destinationId, active: true },
    include: { cruise: { include: { cabins: true } } },
    orderBy: { sortOrder: 'asc' },
  })

  if (joinRows.length > 0) {
    const fromJoin = extractEntitiesFromJoinRows(joinRows, 'cruise', isTemplateFallback)
    if (fromJoin.length > 0) {
      return (fromJoin as Array<Record<string, unknown>>).map(normalizeCruise)
    }
  }

  // 2. Fallback: primary destination ID on Cruise
  const viaFk = await db.cruise.findMany({
    where: { primaryDestinationId: destinationId, active: true, isTemplate: isTemplateFallback },
    include: { cabins: true },
  })
  
  return viaFk.map((c) => normalizeCruise(c as unknown as Record<string, unknown>))
}

// ─── Main data loader ───────────────────────────────────────────────

export async function getDestinationData(destinationId: string) {
  const isTemplateQuery = await resolveTemplateFallbackForEntity('destination')

  const destination = await db.destination.findFirst({
    where: {
      id: destinationId,
      active: true,
      isTemplate: isTemplateQuery,
    },
  })

  if (!destination) return null

  const highlights = parseJsonArray<string>(destination.highlights)

  const packagesIsTemplate = await resolveTemplateFallbackForEntity('package')
  const hotelsIsTemplate = await resolveTemplateFallbackForEntity('hotel')
  const excursionsIsTemplate = await resolveTemplateFallbackForEntity('excursion')
  const transportIsTemplate = await resolveTemplateFallbackForEntity('transport')
  const cruisesIsTemplate = await resolveTemplateFallbackForEntity('cruise')

  const [packages, hotels, excursions, transportServices, cruises] = await Promise.all([
    getRelatedPackages(destination.id, packagesIsTemplate),
    getRelatedHotels(destination.id, destination.name, hotelsIsTemplate),
    getRelatedExcursions(destination.id, destination.name, excursionsIsTemplate),
    getRelatedTransportServices(destination.id, destination.name, transportIsTemplate),
    getRelatedCruises(destination.id, cruisesIsTemplate),
  ])

  return {
    destination: {
      ...destination,
      highlights,
    },
    packages,
    hotels,
    excursions,
    transportServices,
    cruises,
  }
}
