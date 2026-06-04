import { db } from "@/lib/db";
import type {
  CatalogItemInput,
  UpdateCatalogItemInput,
  CatalogFilters,
} from "./catalog-validators";

// Re-export typed source resolution for consumers that render catalog items.
export {
  resolveSourceFields,
  resolveCatalogPresentation,
} from "./source-resolver";
export type { ResolvedSource, CatalogPresentation } from "./source-resolver";

export interface CatalogItemWithSource {
  id: string;
  sourceType: string;
  sourceId: string;
  customPrice: number | null;
  customName: string;
  customDescription: string;
  active: boolean;
  featured: boolean;
  sortOrder: number;
  sourceData: Record<string, unknown>;
}

export async function getResellerCatalog(
  resellerId: string,
  filters?: CatalogFilters,
): Promise<CatalogItemWithSource[]> {
  const catalog = await db.resellerCatalog.findMany({
    where: {
      resellerId,
      ...(filters?.sourceType ? { sourceType: filters.sourceType } : {}),
      ...(filters?.active !== undefined ? { active: filters.active } : {}),
      ...(filters?.featured !== undefined
        ? { featured: filters.featured }
        : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const items = await Promise.all(
    catalog.map(async (item) => {
      const isDestination = item.sourceType === "destination";
      const hasAssignedParent =
        isDestination ||
        (await validateParentDestination(
          resellerId,
          item.sourceType,
          item.sourceId,
        ));

      if (!hasAssignedParent) return null;

      const sourceData = await fetchSourceData(item.sourceType, item.sourceId);
      if (Object.keys(sourceData).length === 0) return null;

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
      };
    }),
  );

  return items.filter((item): item is CatalogItemWithSource => item !== null);
}

export async function addToCatalog(
  resellerId: string,
  input: CatalogItemInput,
): Promise<CatalogItemWithSource> {
  const catalog = await db.resellerCatalog.create({
    data: {
      resellerId,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      customPrice: input.customPrice,
      customName: input.customName || "",
      customDescription: input.customDescription || "",
      active: input.active,
      featured: input.featured,
      sortOrder: input.sortOrder,
    },
  });

  const sourceData = await fetchSourceData(
    catalog.sourceType,
    catalog.sourceId,
  );

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
  };
}

export async function updateCatalogItem(
  resellerId: string,
  itemId: string,
  input: UpdateCatalogItemInput,
): Promise<CatalogItemWithSource> {
  const existing = await db.resellerCatalog.findUnique({
    where: { id: itemId },
  });

  if (!existing || existing.resellerId !== resellerId) {
    throw new Error("Item de catálogo no encontrado o sin permisos");
  }

  const catalog = await db.resellerCatalog.update({
    where: { id: itemId },
    data: {
      ...(input.customPrice !== undefined
        ? { customPrice: input.customPrice }
        : {}),
      ...(input.customName !== undefined
        ? { customName: input.customName }
        : {}),
      ...(input.customDescription !== undefined
        ? { customDescription: input.customDescription }
        : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
      ...(input.featured !== undefined ? { featured: input.featured } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    },
  });

  const sourceData = await fetchSourceData(
    catalog.sourceType,
    catalog.sourceId,
  );

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
  };
}

export async function removeFromCatalog(
  resellerId: string,
  itemId: string,
): Promise<void> {
  const existing = await db.resellerCatalog.findUnique({
    where: { id: itemId },
  });

  if (!existing || existing.resellerId !== resellerId) {
    throw new Error("Item de catálogo no encontrado o sin permisos");
  }

  await db.resellerCatalog.delete({
    where: { id: itemId },
  });
}

export async function toggleFeatured(
  resellerId: string,
  itemId: string,
): Promise<CatalogItemWithSource> {
  const existing = await db.resellerCatalog.findUnique({
    where: { id: itemId },
  });

  if (!existing || existing.resellerId !== resellerId) {
    throw new Error("Item de catálogo no encontrado o sin permisos");
  }

  const catalog = await db.resellerCatalog.update({
    where: { id: itemId },
    data: { featured: !existing.featured },
  });

  const sourceData = await fetchSourceData(
    catalog.sourceType,
    catalog.sourceId,
  );

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
  };
}

export async function getCatalogCount(resellerId: string): Promise<number> {
  return db.resellerCatalog.count({
    where: { resellerId, active: true },
  });
}

export async function syncResellerCatalogEntry(
  resellerId: string | null | undefined,
  sourceType: string,
  sourceId: string,
): Promise<void> {
  if (!resellerId) return;

  await db.resellerCatalog.upsert({
    where: {
      resellerId_sourceType_sourceId: {
        resellerId,
        sourceType,
        sourceId,
      },
    },
    create: {
      resellerId,
      sourceType,
      sourceId,
      active: true,
      featured: false,
      sortOrder: 0,
    },
    update: {},
  });
}

export async function removeResellerCatalogEntry(
  resellerId: string | null | undefined,
  sourceType: string,
  sourceId: string,
): Promise<void> {
  if (!resellerId) return;

  await db.resellerCatalog.deleteMany({
    where: {
      resellerId,
      sourceType,
      sourceId,
    },
  });
}

export async function handleResellerCatalogSync(
  oldResellerId: string | null,
  newResellerId: string | null | undefined,
  sourceType: string,
  sourceId: string,
): Promise<void> {
  const normalized = newResellerId || null;

  if (oldResellerId && oldResellerId !== normalized) {
    await removeResellerCatalogEntry(oldResellerId, sourceType, sourceId);
  }

  if (normalized) {
    await syncResellerCatalogEntry(normalized, sourceType, sourceId);
  }
}

/**
 * Validate that a non-destination product has at least one parent destination
 * already assigned to the reseller's catalog. Returns true if valid.
 * Destinations themselves skip this check.
 * Template products (global catalog) also skip — they should always be addable.
 */
export async function validateParentDestination(
  resellerId: string,
  sourceType: string,
  sourceId: string,
): Promise<boolean> {
  const sourceData = await fetchSourceData(sourceType, sourceId);
  if (Object.keys(sourceData).length === 0) return false;

  if (sourceType === "destination") return true;

  // Template products from the global catalog can always be added
  // without requiring a parent destination first.
  if (sourceData.isTemplate) return true;

  // Products created by this reseller are already scoped to their own catalog
  // and should be addable even if they are not attached to an admin-managed
  // destination spine yet.
  if (sourceData.resellerId === resellerId) return true;

  const assignedDests = await db.resellerCatalog.findMany({
    where: { resellerId, sourceType: "destination", active: true },
    select: { sourceId: true },
  });
  if (assignedDests.length === 0) return false;

  const destIds = new Set(assignedDests.map((d) => d.sourceId));

  switch (sourceType) {
    case "hotel": {
      const join = await db.destinationHotel.findFirst({
        where: {
          hotelId: sourceId,
          active: true,
          destinationId: { in: [...destIds] },
        },
        select: { id: true },
      });
      return !!join;
    }
    case "excursion": {
      const join = await db.destinationExcursion.findFirst({
        where: {
          excursionId: sourceId,
          active: true,
          destinationId: { in: [...destIds] },
        },
        select: { id: true },
      });
      return !!join;
    }
    case "package": {
      const join = await db.destinationPackage.findFirst({
        where: {
          packageId: sourceId,
          active: true,
          destinationId: { in: [...destIds] },
        },
        select: { id: true },
      });
      return !!join;
    }
    case "transport": {
      const join = await db.destinationTransportService.findFirst({
        where: {
          transportServiceId: sourceId,
          active: true,
          destinationId: { in: [...destIds] },
        },
        select: { id: true },
      });
      return !!join;
    }
    case "cruise": {
      const join = await db.destinationCruise.findFirst({
        where: {
          cruiseId: sourceId,
          active: true,
          destinationId: { in: [...destIds] },
        },
        select: { id: true },
      });
      return !!join;
    }
    default:
      return false;
  }
}

async function fetchSourceData(
  sourceType: string,
  sourceId: string,
): Promise<Record<string, unknown>> {
  try {
    switch (sourceType) {
      case "hotel": {
        const hotel = await db.hotel.findUnique({
          where: { id: sourceId },
          select: {
            id: true,
            name: true,
            cityName: true,
            stars: true,
            priceFrom: true,
            images: true,
            description: true,
            active: true,
            isTemplate: true,
            resellerId: true,
          },
        });
        if (!hotel || !hotel.active) return {};
        return {
          ...hotel,
          images: JSON.parse(hotel.images || "[]") as string[],
        };
      }
      case "excursion": {
        const excursion = await db.excursion.findUnique({
          where: { id: sourceId },
          select: {
            id: true,
            name: true,
            cityName: true,
            destinationId: true,
            destinationName: true,
            destinationRefId: true,
            basePrice: true,
            images: true,
            description: true,
            category: true,
            active: true,
            isTemplate: true,
            resellerId: true,
          },
        });
        if (!excursion || !excursion.active) return {};
        return {
          ...excursion,
          images: JSON.parse(excursion.images || "[]") as string[],
        };
      }
      case "package": {
        const pkg = await db.travelPackage.findUnique({
          where: { id: sourceId },
          select: {
            id: true,
            title: true,
            destinationName: true,
            price: true,
            image: true,
            description: true,
            category: true,
            active: true,
            isTemplate: true,
            resellerId: true,
          },
        });
        if (!pkg || !pkg.active) return {};
        return { ...pkg };
      }
      case "transport": {
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
            providerId: true,
            isTemplate: true,
            resellerId: true,
            provider: {
              select: { name: true, vehicleType: true, capacity: true },
            },
          },
        });
        if (!transport || !transport.active) return {};
        return { ...transport };
      }
      case "destination": {
        const dest = await db.destination.findUnique({
          where: { id: sourceId },
          select: {
            id: true,
            name: true,
            region: true,
            description: true,
            image: true,
            priceFrom: true,
            active: true,
            isTemplate: true,
            resellerId: true,
          },
        });
        if (!dest || !dest.active) return {};
        return { ...dest };
      }
      case "cruise": {
        const cruise = await db.cruise.findUnique({
          where: { id: sourceId },
          select: {
            id: true,
            name: true,
            shipName: true,
            operator: true,
            durationDays: true,
            priceFrom: true,
            images: true,
            description: true,
            active: true,
            isTemplate: true,
            resellerId: true,
          },
        });
        if (!cruise || !cruise.active) return {};
        return {
          ...cruise,
          images: JSON.parse(cruise.images || "[]") as string[],
        };
      }
      case "room": {
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
        });
        if (!room || !room.active) return {};
        return { ...room };
      }
      default:
        return {};
    }
  } catch {
    return {};
  }
}
