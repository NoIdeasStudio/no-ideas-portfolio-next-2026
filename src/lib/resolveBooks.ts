import { books, type BookSpec } from '../data/books'

export type HomepageOrderItem = {
  kind: 'project' | 'bookSlideshow'
  projectId?: string | null
}

export type BookCatalogEntry = {
  slug?: string | null
  title?: string | null
  description?: string | null
  coverUrl?: string | null
  varnishUrl?: string | null
  foilUrl?: string | null
  debossUrl?: string | null
}

function overlayMaps(
  maps: BookSpec['maps'],
  entry: BookCatalogEntry,
): BookSpec['maps'] {
  const cover = entry.coverUrl || maps?.cover
  const foil = entry.foilUrl || maps?.foil
  const varnish = entry.varnishUrl || maps?.varnish
  const deboss = entry.debossUrl || maps?.deboss
  if (!cover) return maps
  return {
    cover,
    ...(foil ? { foil } : {}),
    ...(varnish ? { varnish } : {}),
    ...(deboss ? { deboss } : {}),
  }
}

function applyCatalogEntry(spec: BookSpec, entry: BookCatalogEntry): BookSpec {
  return {
    ...spec,
    title: entry.title?.trim() || spec.title,
    description: entry.description?.trim() || undefined,
    maps: overlayMaps(spec.maps, entry),
  }
}

/**
 * Walk the slideshow order. Skip slugs that are not built in code.
 * A missing catalog keeps the code list, so the viewer still works before the documents exist.
 */
export function resolveVisibleBooks(
  catalog: BookCatalogEntry[] | null | undefined,
): BookSpec[] {
  if (!catalog) return books
  const bySlug = new Map(books.map((book) => [book.slug, book]))
  const visible: BookSpec[] = []
  for (const entry of catalog) {
    if (!entry?.slug) continue
    const spec = bySlug.get(entry.slug)
    if (!spec) continue
    visible.push(applyCatalogEntry(spec, entry))
  }
  return visible
}
