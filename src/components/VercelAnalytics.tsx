'use client'

import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next'
import { isStudioPath } from '../lib/isStudioPath'

function shouldExcludeFromAnalytics(event: BeforeSendEvent) {
  try {
    return isStudioPath(new URL(event.url).pathname)
  } catch {
    return false
  }
}

export function VercelAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => (shouldExcludeFromAnalytics(event) ? null : event)}
    />
  )
}
