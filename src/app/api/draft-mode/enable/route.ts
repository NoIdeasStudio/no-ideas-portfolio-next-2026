import { defineEnableDraftMode } from 'next-sanity/draft-mode'

import { client } from '../../../../sanity/lib/client'

const token = process.env.SANITY_API_READ_TOKEN?.trim()
const draftClient = token ? client.withConfig({ token }) : null

const handlers = draftClient ? defineEnableDraftMode({ client: draftClient }) : null

export async function GET(request: Request) {
  if (!handlers) {
    return new Response('Missing SANITY_API_READ_TOKEN (Viewer token with read access to drafts).', {
      status: 503,
    })
  }
  return handlers.GET(request)
}
