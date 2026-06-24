'use client'

import { useEffect } from 'react'
import { isMobileUserAgent } from '../lib/isMobile'

/** Scroll down past this to animate svh → lvh. */
const EXPAND_SCROLL_PX = 8
/** Scroll back above this to animate lvh → svh (hysteresis avoids flicker). */
const COLLAPSE_SCROLL_PX = 4

const VIEWPORT_ANIM_MS = 450
const VIEWPORT_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'

type ViewportMode = 'collapsed' | 'expanded'

function measureViewportUnit(unit: 'svh' | 'lvh'): number {
  const probe = document.createElement('div')
  probe.style.cssText = `position:fixed;top:0;left:0;height:100${unit};width:0;visibility:hidden;pointer-events:none;`
  document.body.appendChild(probe)
  const height = probe.offsetHeight
  probe.remove()
  return height
}

function getSections() {
  return Array.from(document.querySelectorAll<HTMLElement>('.project-viewport-height'))
}

function pinSectionHeights(sections: HTMLElement[], height: number) {
  sections.forEach((el) => {
    el.style.height = `${height}px`
  })
}

function clearSectionHeights(sections: HTMLElement[]) {
  sections.forEach((el) => {
    el.style.height = ''
    el.style.transition = ''
  })
}

/**
 * On mobile, project sections use 100svh at the top (browser chrome visible) and
 * animate to 100lvh once the user scrolls down. Scrolling back to the top
 * animates back to svh so the transition tracks the browser UI in both directions.
 */
export function MobileViewportHeightExpand() {
  useEffect(() => {
    if (!isMobileUserAgent()) return

    const root = document.documentElement
    let mode: ViewportMode = root.classList.contains('viewport-expanded') ? 'expanded' : 'collapsed'
    let animating = false
    let cancelAnimation: (() => void) | null = null

    const setModeInstant = (next: ViewportMode) => {
      mode = next
      root.classList.remove('viewport-expanding', 'viewport-collapsing')
      if (next === 'expanded') {
        root.classList.add('viewport-expanded')
      } else {
        root.classList.remove('viewport-expanded')
      }
    }

    const animateSections = (
      sections: HTMLElement[],
      fromHeight: number,
      toHeight: number,
      animClass: 'viewport-expanding' | 'viewport-collapsing',
      onComplete: () => void
    ) => {
      cancelAnimation?.()

      if (Math.abs(toHeight - fromHeight) < 1) {
        clearSectionHeights(sections)
        onComplete()
        return
      }

      animating = true
      root.classList.remove('viewport-expanding', 'viewport-collapsing')
      root.classList.add(animClass)

      pinSectionHeights(sections, fromHeight)
      sections.forEach((el) => {
        el.style.transition = `height ${VIEWPORT_ANIM_MS}ms ${VIEWPORT_EASING}`
      })

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          pinSectionHeights(sections, toHeight)
        })
      })

      let finished = false
      const cleanup = () => {
        if (finished) return
        finished = true
        cancelAnimation = null
        animating = false

        // Hold the final pixel height for one frame before handing off to CSS units.
        pinSectionHeights(sections, toHeight)
        sections.forEach((el) => {
          el.style.transition = ''
        })

        requestAnimationFrame(() => {
          clearSectionHeights(sections)
          root.classList.remove('viewport-expanding', 'viewport-collapsing')
          onComplete()
        })
      }

      cancelAnimation = cleanup

      sections[0].addEventListener(
        'transitionend',
        (event) => {
          if (event.propertyName === 'height') cleanup()
        },
        { once: true }
      )

      window.setTimeout(cleanup, VIEWPORT_ANIM_MS + 80)
    }

    const expand = () => {
      if (mode === 'expanded' || animating) return

      const sections = getSections()
      if (!sections.length) {
        setModeInstant('expanded')
        return
      }

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const fromHeight = sections[0].getBoundingClientRect().height
      const toHeight = measureViewportUnit('lvh')

      if (reducedMotion) {
        setModeInstant('expanded')
        return
      }

      animateSections(sections, fromHeight, toHeight, 'viewport-expanding', () => {
        setModeInstant('expanded')
      })
    }

    const collapse = () => {
      if (mode === 'collapsed' || animating) return

      const sections = getSections()
      if (!sections.length) {
        setModeInstant('collapsed')
        return
      }

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      // Measure lvh height while expanded CSS is still active.
      const fromHeight = sections[0].getBoundingClientRect().height
      const toHeight = measureViewportUnit('svh')

      if (reducedMotion) {
        setModeInstant('collapsed')
        return
      }

      // Pin lvh in pixels before dropping expanded CSS — prevents instant snap to svh.
      pinSectionHeights(sections, fromHeight)
      root.classList.remove('viewport-expanded')

      animateSections(sections, fromHeight, toHeight, 'viewport-collapsing', () => {
        setModeInstant('collapsed')
      })
    }

    const syncToScroll = () => {
      const y = window.scrollY
      if (y >= EXPAND_SCROLL_PX) {
        expand()
      } else if (y <= COLLAPSE_SCROLL_PX) {
        collapse()
      }
    }

    syncToScroll()
    window.addEventListener('scroll', syncToScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', syncToScroll)
      cancelAnimation?.()
    }
  }, [])

  return null
}
