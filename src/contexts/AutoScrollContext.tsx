'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

const isMobile = () =>
  typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent)

const SCROLL_DURATION_SEC = 120
const DELAY_AFTER_WHEEL_MS = 1500
const DELAY_AFTER_MOUSE_MS = 15000
const DELAY_AFTER_CAROUSEL_MS = 15000
const INITIAL_DELAY_MS = 2700
const INITIAL_DELAY_FROM_PROJECT_MS = 15000
const SMOOTH_SCROLL_TO_PROJECT_MS = 800

type AutoScrollContextValue = {
  /** Pause auto-scroll and resume after delay (e.g. 1500 for wheel, 15000 for carousel). */
  pauseAndResumeAfter: (delayMs: number) => void
  /** Scroll project section to top and pause auto-scroll for longer (e.g. after clicking carousel). Pass isLoopCopy: true for duplicate block so we don't jump to top. */
  onCarouselInteraction: (projectSlug: string, options?: { isLoopCopy?: boolean }) => void
  /** Set height of one full loop (enables infinite scroll). Call from homepage with measured first-block height. */
  setLoopHeight: (height: number) => void
}

const AutoScrollContext = createContext<AutoScrollContextValue | null>(null)

export function useAutoScroll() {
  return useContext(AutoScrollContext)
}

type AutoScrollProviderProps = { children: ReactNode }

export function AutoScrollProvider({ children }: AutoScrollProviderProps) {
  const pathname = usePathname()
  const autoScrollActiveRef = useRef(true)
  const userInteractingRef = useRef(false)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasStartedRef = useRef(false)
  const loopHeightRef = useRef<number>(0)

  const stopAutoScroll = useCallback(() => {
    gsap.killTweensOf(window)
  }, [])

  const startAutoScroll = useCallback(() => {
    if (!autoScrollActiveRef.current || userInteractingRef.current) return
    const loopHeight = loopHeightRef.current
    const targetY = loopHeight > 0 ? loopHeight : 'max'
    gsap.to(window, {
      scrollTo: { y: targetY, autoKill: false },
      duration: SCROLL_DURATION_SEC,
      ease: 'none',
      onComplete: () => {
        if (loopHeight > 0 && typeof window !== 'undefined') {
          window.scrollTo(0, 0)
        }
        startAutoScroll()
      },
    })
  }, [])

  const resetAutoScrollTimer = useCallback(
    (delayMs: number) => {
      stopAutoScroll()
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
        scrollTimeoutRef.current = null
      }
      scrollTimeoutRef.current = setTimeout(() => {
        userInteractingRef.current = false
        scrollTimeoutRef.current = null
        startAutoScroll()
      }, delayMs)
    },
    [stopAutoScroll, startAutoScroll]
  )

  const pauseAndResumeAfter = useCallback(
    (delayMs: number) => {
      userInteractingRef.current = true
      resetAutoScrollTimer(delayMs)
    },
    [resetAutoScrollTimer]
  )

  const scrollProjectToTop = useCallback((slug: string) => {
    const el = document.getElementById(slug)
    if (!el) return
    const loopHeight = loopHeightRef.current
    let startY = window.scrollY
    if (loopHeight > 0 && startY >= loopHeight) {
      startY = startY % loopHeight
    }
    const targetY = el.getBoundingClientRect().top + startY
    const distance = targetY - startY
    if (Math.abs(distance) < 2) return

    const start = performance.now()
    let rafId: number

    function ease(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / SMOOTH_SCROLL_TO_PROJECT_MS, 1)
      const eased = ease(progress)
      window.scrollTo(0, startY + distance * eased)
      if (progress < 1) rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
  }, [])

  const onCarouselInteraction = useCallback(
    (projectSlug: string, options?: { isLoopCopy?: boolean }) => {
      userInteractingRef.current = true
      stopAutoScroll()
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
        scrollTimeoutRef.current = null
      }
      // Never scroll to top when interacting with the duplicate block (avoids jump)
      if (!options?.isLoopCopy) {
        scrollProjectToTop(projectSlug)
      }
      scrollTimeoutRef.current = setTimeout(() => {
        userInteractingRef.current = false
        scrollTimeoutRef.current = null
        startAutoScroll()
      }, DELAY_AFTER_CAROUSEL_MS)
    },
    [stopAutoScroll, scrollProjectToTop, startAutoScroll]
  )

  const setLoopHeight = useCallback((height: number) => {
    loopHeightRef.current = height
  }, [])

  const contextValue: AutoScrollContextValue = {
    pauseAndResumeAfter,
    onCarouselInteraction,
    setLoopHeight,
  }

  useEffect(() => {
    if (pathname !== '/' || isMobile() || hasStartedRef.current) return
    if (typeof window === 'undefined') return

    gsap.registerPlugin(ScrollToPlugin)

    const referrer = document.referrer
    const cameFromIndex = referrer.includes('/projects')
    const hasAnchor =
      typeof window !== 'undefined' &&
      window.location.hash &&
      window.location.hash !== ''
    const cameFromProjectClick = cameFromIndex && hasAnchor
    const initialDelay = cameFromProjectClick
      ? INITIAL_DELAY_FROM_PROJECT_MS
      : INITIAL_DELAY_MS

    function onWheel() {
      userInteractingRef.current = true
      resetAutoScrollTimer(DELAY_AFTER_WHEEL_MS)
    }

    function onMousedown() {
      userInteractingRef.current = true
      resetAutoScrollTimer(DELAY_AFTER_MOUSE_MS)
    }

    function wrapScrollPosition() {
      if (!userInteractingRef.current) return
      const loopHeight = loopHeightRef.current
      if (loopHeight <= 0) return
      const y = window.scrollY
      if (y >= loopHeight) {
        window.scrollTo(0, y - loopHeight)
      } else if (y < 0) {
        window.scrollTo(0, y + loopHeight)
      }
    }

    const timeoutId = setTimeout(() => {
      hasStartedRef.current = true
      window.addEventListener('wheel', onWheel, { passive: true })
      document.addEventListener('mousedown', onMousedown, { passive: true })
      window.addEventListener('scroll', wrapScrollPosition, { passive: true })
      startAutoScroll()
    }, initialDelay)

    return () => {
      clearTimeout(timeoutId)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
        scrollTimeoutRef.current = null
      }
      window.removeEventListener('wheel', onWheel)
      document.removeEventListener('mousedown', onMousedown)
      window.removeEventListener('scroll', wrapScrollPosition)
      stopAutoScroll()
      hasStartedRef.current = false
    }
  }, [pathname, startAutoScroll, resetAutoScrollTimer, stopAutoScroll])

  return (
    <AutoScrollContext.Provider value={contextValue}>
      {children}
    </AutoScrollContext.Provider>
  )
}
