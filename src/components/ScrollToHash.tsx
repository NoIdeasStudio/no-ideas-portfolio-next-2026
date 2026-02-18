'use client'

import { useEffect } from 'react'

const SCROLL_DURATION_MS = 600

/** Standard ease: smooth acceleration and deceleration (like CSS ease). */
function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * On the homepage, when the URL has a hash (e.g. /#project-slug from the index),
 * smooth-scroll to that element after mount. Uses a custom duration (slower than native).
 */
export function ScrollToHash() {
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return
    const id = hash.slice(1)
    const el = document.getElementById(id)
    if (!el) return

    const startY = window.scrollY
    const targetY = el.getBoundingClientRect().top + startY
    const distance = targetY - startY
    if (Math.abs(distance) < 1) return

    const start = performance.now()
    let rafId: number

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / SCROLL_DURATION_MS, 1)
      const eased = ease(progress)
      window.scrollTo(0, startY + distance * eased)
      if (progress < 1) rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return null
} 
