export interface CatalogOverride {
  sourceId: string;
  customPrice: number | null;
  customName: string;
  customDescription: string;
}

type OverrideableCatalogFields = {
  title?: string;
  name?: string;
  notes?: string;
  description?: string;
  priceFrom?: number;
  basePrice?: number;
  price?: number;
};

export function applyCatalogOverrides<T extends Record<string, unknown>>(
  sourceType: string,
  item: T,
  override: CatalogOverride | undefined,
): T {
  if (!override) return item;

  const next: T & OverrideableCatalogFields = { ...item };

  if (override.customName) {
    if (sourceType === "package") {
      next.title = override.customName;
    } else {
      next.name = override.customName;
    }
  }

  if (override.customDescription) {
    if (sourceType === "transport") {
      next.notes = override.customDescription;
    } else {
      next.description = override.customDescription;
    }
  }

  if (override.customPrice !== null) {
    switch (sourceType) {
      case "hotel":
      case "cruise":
      case "destination":
        next.priceFrom = override.customPrice;
        break;
      case "excursion":
      case "transport":
      case "room":
        next.basePrice = override.customPrice;
        break;
      case "package":
        next.price = override.customPrice;
        break;
    }
  }

  return next as T;
}
