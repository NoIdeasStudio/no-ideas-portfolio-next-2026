/** Order items by id list. When orderIds is set, only items present in that list are returned. */
export function sortByOrderIds<T extends { _id: string }>(
  items: T[],
  orderIds: string[] | undefined | null
): T[] {
  if (!orderIds?.length) return items
  const byId = new Map(items.map((i) => [i._id, i]))
  const ordered: T[] = []
  for (const id of orderIds) {
    const item = byId.get(id)
    if (item) ordered.push(item)
  }
  return ordered
}
