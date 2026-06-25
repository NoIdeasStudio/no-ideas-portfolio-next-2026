'use client'

import { useEffect, useRef, useState } from 'react'

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
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response = await fetch(src)
        if (!response.ok) {
          console.error('[AnimatedSvgPlayer] Failed to fetch SVG:', response.status, src)
          return
        }
        const text = await response.text()
        if (!cancelled) setSvgMarkup(text)
      } catch (err) {
        console.error('[AnimatedSvgPlayer] Failed to load SVG:', err)
      }
    }

    setSvgMarkup(null)
    void load()

    return () => {
      cancelled = true
    }
  }, [src])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !svgMarkup) return

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
  }, [svgMarkup, fit, autoplay])

  const fitClass = fit === 'contain' ? 'animated-svg-player--contain' : 'animated-svg-player--cover'

  return (
    <div
      ref={containerRef}
      className={`animated-svg-player ${fitClass}${autoplay ? '' : ' animated-svg-player--paused'} ${className ?? ''}`.trim()}
      aria-hidden
      {...(svgMarkup ? { dangerouslySetInnerHTML: { __html: svgMarkup } } : {})}
    />
  )
}
