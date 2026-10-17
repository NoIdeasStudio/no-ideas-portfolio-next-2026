import { books, type BookSpec } from '../data/books'
import { fetchSanity } from '../sanity/lib/fetch'
import { bookCatalogQuery, siteLayoutQuery } from './sanity.queries'
import { resolveVisibleBooks, type BookCatalogEntry, type HomepageOrderItem } from './resolveBooks'

export type { HomepageOrderItem }

export async function getVisibleBooks(): Promise<BookSpec[]> {
  try {
    const catalog = await fetchSanity<{ books?: Array<BookCatalogEntry | null> | null } | null>(
      bookCatalogQuery,
    )
    if (!catalog) return books
    const entries = (catalog.books ?? []).filter((entry): entry is BookCatalogEntry => entry != null)
    return resolveVisibleBooks(entries)
  } catch (err) {
    console.error('[Books] Failed to fetch from Sanity:', err)
    return books
  }
}

export async function getHomepageOrder(): Promise<HomepageOrderItem[] | null> {
  try {
    const layout = await fetchSanity<{ homepageOrder?: HomepageOrderItem[] | null } | null>(
      siteLayoutQuery,
    )
    return layout?.homepageOrder ?? null
  } catch (err) {
    console.error('[Books] Failed to fetch homepage order:', err)
    return null
  }
}
