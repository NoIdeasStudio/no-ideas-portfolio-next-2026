'use client'

import { useEffect } from 'react'
import { isMobileUserAgent } from '../lib/isMobile'

/** Scroll distance before locking slideshow height to the large viewport. */
const EXPAND_SCROLL_PX = 8

/**
 * On mobile, project sections start at 100svh (browser chrome visible).
 * After the user scrolls, lock to 100lvh so sections don't shrink when the
 * address bar reappears on scroll-up (dvh would follow that resize and jump).
 */
export function MobileViewportHeightExpand() {
  useEffect(() => {
    if (!isMobileUserAgent()) return

    const root = document.documentElement
    if (root.classList.contains('viewport-expanded')) return

    const expand = () => {
      root.classList.add('viewport-expanded')
      window.removeEventListener('scroll', onScroll)
    }

    const onScroll = () => {
      if (window.scrollY >= EXPAND_SCROLL_PX) expand()
    }

    if (window.scrollY >= EXPAND_SCROLL_PX) {
      expand()
      return
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return null
}
