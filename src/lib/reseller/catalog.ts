import { db } from '@/lib/db'
import type { CatalogItemInput, UpdateCatalogItemInput, CatalogFilters } from './catalog-validators'

export interface CatalogItemWithSource {
  id: string
  sourceType: string
  sourceId: string
  customPrice: number | null
  customName: string
  customDescription: string
  active: boolean
  featured: boolean
  sortOrder: number
  sourceData: Record<string, unknown>
}

export async function getResellerCatalog(resellerId: string, filters?: CatalogFilters): Promise<CatalogItemWithSource[]> {
  const catalog = await db.resellerCatalog.findMany({
    where: {
      resellerId,
      ...(filters?.sourceType ? { sourceType: filters.sourceType } : {}),
      ...(filters?.active !== undefined ? { active: filters.active } : {}),
      ...(filters?.featured !== undefined ? { featured: filters.featured } : {}),
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  const items = await Promise.all(catalog.map(async (item) => {
    const sourceData = await fetchSourceData(item.sourceType, item.sourceId)
    return {
      id: item.id,
      sourceType: item.sourceType,
      sourceId: item.sourceId,
      customPrice: item.customPrice,
      customName: item.customName,
      customDescription: item.customDescription,
      active: item.active,
      featured: item.featured,
      sortOrder: item.sortOrder,
      sourceData,
    }
  }))

  return items
}

export async function addToCatalog(resellerId: string, input: CatalogItemInput): Promise<CatalogItemWithSource> {
  const catalog = await db.resellerCatalog.create({
    data: {
      resellerId,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      customPrice: input.customPrice,
      customName: input.customName || '',
      customDescription: input.customDescription || '',
      active: input.active,
      featured: input.featured,
      sortOrder: input.sortOrder,
    },
  })

  const sourceData = await fetchSourceData(catalog.sourceType, catalog.sourceId)

  return {
    id: catalog.id,
    sourceType: catalog.sourceType,
    sourceId: catalog.sourceId,
    customPrice: catalog.customPrice,
    customName: catalog.customName,
    customDescription: catalog.customDescription,
    active: catalog.active,
    featured: catalog.featured,
    sortOrder: catalog.sortOrder,
    sourceData,
  }
}

export async function updateCatalogItem(
  _resellerId: string,
  itemId: string,
  input: UpdateCatalogItemInput,
): Promise<CatalogItemWithSource> {
  const existing = await db.resellerCatalog.findUnique({
    where: { id: itemId },
  })

  if (!existing) {
    throw new Error('Item de catálogo no encontrado')
  }

  const catalog = await db.resellerCatalog.update({
    where: { id: itemId },
    data: {
      ...(input.customPrice !== undefined ? { customPrice: input.customPrice } : {}),
      ...(input.customName !== undefined ? { customName: input.customName } : {}),
      ...(input.customDescription !== undefined ? { customDescription: input.customDescription } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
      ...(input.featured !== undefined ? { featured: input.featured } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    },
  })

  const sourceData = await fetchSourceData(catalog.sourceType, catalog.sourceId)

  return {
    id: catalog.id,
    sourceType: catalog.sourceType,
    sourceId: catalog.sourceId,
    customPrice: catalog.customPrice,
    customName: catalog.customName,
    customDescription: catalog.customDescription,
    active: catalog.active,
    featured: catalog.featured,
    sortOrder: catalog.sortOrder,
    sourceData,
  }
}

export async function removeFromCatalog(resellerId: string, itemId: string): Promise<void> {
  const existing = await db.resellerCatalog.findUnique({
    where: { id: itemId },
  })

  if (!existing || existing.resellerId !== resellerId) {
    throw new Error('Item de catálogo no encontrado o sin permisos')
  }

  await db.resellerCatalog.delete({
    where: { id: itemId },
  })
}

export async function toggleFeatured(resellerId: string, itemId: string): Promise<CatalogItemWithSource> {
  const existing = await db.resellerCatalog.findUnique({
    where: { id: itemId },
  })

  if (!existing || existing.resellerId !== resellerId) {
    throw new Error('Item de catálogo no encontrado o sin permisos')
  }

  const catalog = await db.resellerCatalog.update({
    where: { id: itemId },
    data: { featured: !existing.featured },
  })

  const sourceData = await fetchSourceData(catalog.sourceType, catalog.sourceId)

  return {
    id: catalog.id,
    sourceType: catalog.sourceType,
    sourceId: catalog.sourceId,
    customPrice: catalog.customPrice,
    customName: catalog.customName,
    customDescription: catalog.customDescription,
    active: catalog.active,
    featured: catalog.featured,
    sortOrder: catalog.sortOrder,
    sourceData,
  }
}

export async function getCatalogCount(resellerId: string): Promise<number> {
  return db.resellerCatalog.count({
    where: { resellerId, active: true },
  })
}

async function fetchSourceData(sourceType: string, sourceId: string): Promise<Record<string, unknown>> {
  try {
    switch (sourceType) {
      case 'hotel': {
        const hotel = await db.hotel.findUnique({
          where: { id: sourceId },
          select: { id: true, name: true, cityName: true, stars: true, priceFrom: true, images: true, description: true, active: true, isTemplate: true },
        })
        if (!hotel || hotel.isTemplate) return {}
        return {
          ...hotel,
          images: JSON.parse(hotel.images || '[]') as string[],
        }
      }
      case 'excursion': {
        const excursion = await db.excursion.findUnique({
          where: { id: sourceId },
          select: { id: true, name: true, cityName: true, basePrice: true, images: true, description: true, category: true, active: true, isTemplate: true },
        })
        if (!excursion || excursion.isTemplate) return {}
        return {
          ...excursion,
          images: JSON.parse(excursion.images || '[]') as string[],
        }
      }
      case 'package': {
        const pkg = await db.travelPackage.findUnique({
          where: { id: sourceId },
          select: { id: true, title: true, destinationName: true, price: true, image: true, description: true, category: true, active: true, isTemplate: true },
        })
        if (!pkg || pkg.isTemplate) return {}
        return { ...pkg }
      }
      case 'transport': {
        const transport = await db.transportService.findUnique({
          where: { id: sourceId },
          select: {
            id: true,
            name: true,
            origin: true,
            destination: true,
            basePrice: true,
            notes: true,
            active: true,
            isTemplate: true,
            providerId: true,
            provider: { select: { name: true, vehicleType: true, capacity: true } },
          },
        })
        if (!transport || transport.isTemplate) return {}
        return { ...transport }
      }
      case 'destination': {
        const dest = await db.destination.findUnique({
          where: { id: sourceId },
          select: { id: true, name: true, region: true, description: true, image: true, priceFrom: true, active: true, isTemplate: true },
        })
        if (!dest || dest.isTemplate) return {}
        return { ...dest }
      }
      case 'room': {
        const room = await db.roomType.findUnique({
          where: { id: sourceId },
          select: {
            id: true,
            name: true,
            basePrice: true,
            maxGuests: true,
            beds: true,
            active: true,
            hotelId: true,
            hotel: { select: { name: true, cityName: true } },
          },
        })
        if (!room) return {}
        return { ...room }
      }
      default:
        return {}
    }
  } catch {
    return {}
  }
}
