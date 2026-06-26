'use client'

import { useEffect, useRef, type ReactNode } from 'react'

const INFO_ROOT_ID = 'info'
const NEWS_ZONE_CLASS = 'info--news-zone'

/** Toggle #info background when the news block crosses the top of the viewport. */
export function InfoNewsZone({ children }: { children: ReactNode }) {
  const zoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = document.getElementById(INFO_ROOT_ID)
    const zone = zoneRef.current
    if (!root || !zone) return

    const sync = () => {
      const inNewsZone = zone.getBoundingClientRect().top <= 0
      root.classList.toggle(NEWS_ZONE_CLASS, inNewsZone)
    }

    sync()
    window.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync, { passive: true })

    return () => {
      window.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
      root.classList.remove(NEWS_ZONE_CLASS)
    }
  }, [])

  return (
    <div ref={zoneRef} className="info-news-zone">
      {children}
    </div>
  )
}
