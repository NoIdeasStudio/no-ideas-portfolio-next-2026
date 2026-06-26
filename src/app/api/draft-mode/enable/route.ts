import { defineEnableDraftMode } from 'next-sanity/draft-mode'

import { client } from '../../../../sanity/lib/client'
import { token } from '../../../../sanity/lib/token'

if (!token) {
  console.warn(
    '[draft-mode] Missing SANITY_API_READ_TOKEN. Add a Viewer token to .env.local and restart `npm run dev`.',
  )
}

export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token }),
})
