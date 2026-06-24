'use client'

import { useEffect } from 'react'
import { isMobileUserAgent } from '../lib/isMobile'

/** Scroll distance before locking slideshow height to the large viewport. */
const EXPAND_SCROLL_PX = 8

const EXPAND_DURATION_MS = 450
const EXPAND_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'

function measureViewportUnit(unit: 'svh' | 'lvh'): number {
  const probe = document.createElement('div')
  probe.style.cssText = `position:fixed;top:0;left:0;height:100${unit};width:0;visibility:hidden;pointer-events:none;`
  document.body.appendChild(probe)
  const height = probe.offsetHeight
  probe.remove()
  return height
}

/**
 * On mobile, project sections start at 100svh (browser chrome visible).
 * After the user scrolls, animate to 100lvh so sections don't shrink when the
 * address bar reappears on scroll-up.
 */
export function MobileViewportHeightExpand() {
  useEffect(() => {
    if (!isMobileUserAgent()) return

    const root = document.documentElement
    let expanding = false

    const finishExpand = (sections: HTMLElement[]) => {
      sections.forEach((el) => {
        el.style.height = ''
        el.style.transition = ''
      })
      root.classList.remove('viewport-expanding')
      root.classList.add('viewport-expanded')
      expanding = false
    }

    const expand = () => {
      if (
        expanding ||
        root.classList.contains('viewport-expanded') ||
        root.classList.contains('viewport-expanding')
      ) {
        return
      }

      window.removeEventListener('scroll', onScroll)

      const sections = Array.from(
        document.querySelectorAll<HTMLElement>('.project-viewport-height')
      )

      if (!sections.length) {
        root.classList.add('viewport-expanded')
        return
      }

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const fromHeight = sections[0].getBoundingClientRect().height
      const toHeight = measureViewportUnit('lvh')

      if (reducedMotion || Math.abs(toHeight - fromHeight) < 1) {
        root.classList.add('viewport-expanded')
        return
      }

      expanding = true
      root.classList.add('viewport-expanding')

      sections.forEach((el) => {
        el.style.height = `${fromHeight}px`
        el.style.transition = `height ${EXPAND_DURATION_MS}ms ${EXPAND_EASING}`
      })

      // Double rAF so the browser paints the start height before animating.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          sections.forEach((el) => {
            el.style.height = `${toHeight}px`
          })
        })
      })

      let finished = false
      const cleanup = () => {
        if (finished) return
        finished = true
        finishExpand(sections)
      }

      sections[0].addEventListener(
        'transitionend',
        (event) => {
          if (event.propertyName === 'height') cleanup()
        },
        { once: true }
      )

      window.setTimeout(cleanup, EXPAND_DURATION_MS + 80)
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
