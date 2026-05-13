import 'server-only'

import { unstable_noStore as noStore } from 'next/cache'
import { draftMode } from 'next/headers'

import { client } from './client'

const readToken = process.env.SANITY_API_READ_TOKEN

/**
 * Sanity client for server components and route handlers.
 * Uses draft content when Next.js Draft Mode is on and SANITY_API_READ_TOKEN is set.
 */
export async function getSanityClient() {
  const { isEnabled } = await draftMode()
  if (isEnabled && readToken?.trim()) {
    noStore()
    return client.withConfig({
      token: readToken,
      useCdn: false,
      perspective: 'drafts',
    })
  }
  return client
}
