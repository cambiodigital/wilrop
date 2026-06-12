export function replaceCatalogItemById<T extends { id: string }>(
  items: T[],
  nextItem: T,
): T[] {
  return items.map((item) => (item.id === nextItem.id ? nextItem : item));
}
