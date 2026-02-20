'use client'

import { useEffect, useState } from 'react'

const FADE_DELAY_MS = 1400
const FADE_DURATION_MS = 500

/** If user came from index via project link (e.g. /#project-slug), hide splash immediately. */
function shouldHideSplashImmediately(): boolean {
  if (typeof window === 'undefined') return false
  const referrer = document.referrer
  const hasHash = Boolean(window.location.hash && window.location.hash !== '')
  return referrer.includes('/projects') && hasHash
}

export function SplashOverlay() {
  const [isFading, setIsFading] = useState(false)
  const [isRemoved, setIsRemoved] = useState(false)
  const [hideImmediately, setHideImmediately] = useState(false)

  useEffect(() => {
    if (shouldHideSplashImmediately()) {
      setHideImmediately(true)
      return
    }
    const timer = window.setTimeout(() => {
      setIsFading(true)
    }, FADE_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (hideImmediately) {
      document.body.style.overflow = ''
      return
    }
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [hideImmediately])

  useEffect(() => {
    if (hideImmediately) {
      setIsRemoved(true)
      document.body.style.overflow = ''
      return
    }
    if (!isFading) return
    const timer = window.setTimeout(() => {
      setIsRemoved(true)
      document.body.style.overflow = ''
    }, FADE_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [isFading, hideImmediately])

  if (isRemoved) return null

  return (
    <div
      className={`splash-overlay ${isFading ? 'splash-overlay--fading' : ''}`}
      aria-hidden
    >
      <div className="splash-overlay-text">No Ideas</div>
    </div>
  )
}
