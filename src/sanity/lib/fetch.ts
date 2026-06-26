import 'server-only'

import type { ClientPerspective } from '@sanity/client'
import { draftMode } from 'next/headers'

import { client } from './client'
import { sanityFetch } from './live'
import { isStagingPreview } from './preview'
import { token } from './token'

type FetchSanityOptions = {
  stega?: boolean
  /** Use `published` for SEO metadata. Defaults to drafts on staging, published on production. */
  perspective?: Exclude<ClientPerspective, 'raw'>
}

/**
 * Fetch Sanity content.
 * - Production: published documents only
 * - Staging / Preview: drafts + published (requires SANITY_API_READ_TOKEN)
 * - Presentation (Draft Mode): handled by sanityFetch automatically
 */
export async function fetchSanity<T>(
  query: string,
  params: Record<string, unknown> = {},
  options: FetchSanityOptions = {},
): Promise<T> {
  const forcePublished = options.perspective === 'published'
  const isDraftMode = (await draftMode()).isEnabled

  if (isStagingPreview() && !forcePublished && !isDraftMode) {
    if (!token) {
      console.warn(
        '[staging] Missing SANITY_API_READ_TOKEN — showing published content only. Add a Viewer token to see drafts.',
      )
    } else {
      return client.withConfig({
        token,
        useCdn: false,
        perspective: 'previewDrafts',
      }).fetch<T>(query, params, { next: { revalidate: 60 } })
    }
  }

  const { data } = await sanityFetch({
    query,
    params,
    stega: options.stega ?? false,
    perspective: forcePublished ? 'published' : options.perspective,
  })

  return data as T
}
