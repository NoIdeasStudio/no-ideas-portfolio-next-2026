'use client'

import { usePathname, useSelectedLayoutSegment } from 'next/navigation'

/**
 * True when the active route is `/`.
 *
 * Prefer the root layout segment over `usePathname() === '/'`: in production
 * SSG of the homepage, `usePathname()` can be null/empty, so the header
 * "selected" flip and `#homepage` wrapper never apply until a client navigation.
 */
export function useIsHomepage() {
  const segment = useSelectedLayoutSegment()
  const pathname = usePathname()
  return segment === null || pathname === '/'
}
