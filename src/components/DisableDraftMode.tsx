'use client'

import { useDraftModeEnvironment } from 'next-sanity/hooks'

export function DisableDraftMode() {
  const environment = useDraftModeEnvironment()

  if (environment !== 'live' && environment !== 'unknown') return null

  return (
    <a
      href="/api/draft-mode/disable"
      className="fixed bottom-4 right-4 z-[9999] rounded bg-black px-4 py-2 text-sm text-white"
    >
      Exit preview
    </a>
  )
}
