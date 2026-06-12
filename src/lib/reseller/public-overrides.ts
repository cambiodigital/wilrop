import { db } from "@/lib/db";
import {
  applyCatalogOverrides,
  type CatalogOverride,
} from "./public-overrides-utils";

export { applyCatalogOverrides };
export type { CatalogOverride };

export async function getCatalogOverridesMap(
  resellerId: string,
  sourceType: string,
): Promise<Map<string, CatalogOverride>> {
  const items = await db.resellerCatalog.findMany({
    where: {
      resellerId,
      sourceType,
      active: true,
    },
    select: {
      sourceId: true,
      customPrice: true,
      customName: true,
      customDescription: true,
    },
  });

  return new Map(items.map((item) => [item.sourceId, item]));
}
