import 'server-only'

import type { ClientPerspective } from '@sanity/client'

import { sanityFetch } from './live'

type FetchSanityOptions = {
  stega?: boolean
  perspective?: Exclude<ClientPerspective, 'raw'>
}

/** Fetch Sanity content. Uses draft perspective automatically when Draft Mode is enabled. */
export async function fetchSanity<T>(
  query: string,
  params: Record<string, unknown> = {},
  options: FetchSanityOptions = {},
): Promise<T> {
  const { data } = await sanityFetch({
    query,
    params,
    stega: options.stega,
    perspective: options.perspective,
  })

  return data as T
}
