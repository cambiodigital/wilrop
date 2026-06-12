export function buildCatalogItemScope(itemId: string, resellerId: string) {
  return {
    id: itemId,
    resellerId,
  };
}
