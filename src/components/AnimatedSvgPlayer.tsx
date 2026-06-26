'use client'

import { useEffect, useRef, useState } from 'react'
import { getCachedSvg, loadSvg } from '../lib/mediaAnimationCache'

type AnimatedSvgPlayerProps = {
  src: string
  className?: string
  fit?: 'cover' | 'contain'
  /** When false, CSS/SMIL animations are paused until set true. */
  autoplay?: boolean
}

export function AnimatedSvgPlayer({
  src,
  className,
  fit = 'cover',
  autoplay = true,
}: AnimatedSvgPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const injectedSrcRef = useRef<string | null>(null)
  const [svgMarkup, setSvgMarkup] = useState<string | null>(() => getCachedSvg(src) ?? null)

  useEffect(() => {
    const cached = getCachedSvg(src)
    if (cached) {
      setSvgMarkup(cached)
      return
    }

    let cancelled = false

    void loadSvg(src)
      .then((text) => {
        if (!cancelled) setSvgMarkup(text)
      })
      .catch((err) => {
        console.error('[AnimatedSvgPlayer] Failed to load SVG:', err)
      })

    return () => {
      cancelled = true
    }
  }, [src])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !svgMarkup) return

    if (injectedSrcRef.current !== src) {
      container.innerHTML = svgMarkup
      injectedSrcRef.current = src
    }

    const svg = container.querySelector('svg')
    if (!svg) return

    svg.setAttribute('width', '100%')
    svg.setAttribute('height', '100%')
    svg.setAttribute(
      'preserveAspectRatio',
      fit === 'contain' ? 'xMidYMid meet' : 'xMidYMid slice'
    )

    if (autoplay) {
      svg.unpauseAnimations?.()
    } else {
      svg.pauseAnimations?.()
    }
  }, [svgMarkup, fit, autoplay, src])

  const fitClass = fit === 'contain' ? 'animated-svg-player--contain' : 'animated-svg-player--cover'

  return (
    <div
      ref={containerRef}
      className={`animated-svg-player ${fitClass}${autoplay ? '' : ' animated-svg-player--paused'} ${className ?? ''}`.trim()}
      aria-hidden
    />
  )
}
