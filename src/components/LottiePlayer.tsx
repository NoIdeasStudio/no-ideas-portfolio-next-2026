'use client'

import { useEffect, useRef } from 'react'
import type { AnimationItem } from 'lottie-web'

type LottiePlayerProps = {
  src: string
  className?: string
  fit?: 'cover' | 'contain'
  /** When false, animation loads but stays paused until set true. */
  autoplay?: boolean
}

export function LottiePlayer({
  src,
  className,
  fit = 'cover',
  autoplay = true,
}: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<AnimationItem | undefined>(undefined)
  const autoplayRef = useRef(autoplay)
  autoplayRef.current = autoplay

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false

    async function load() {
      try {
        const [{ default: lottie }, response] = await Promise.all([
          import('lottie-web'),
          fetch(src),
        ])
        if (cancelled || !containerRef.current) return
        if (!response.ok) {
          console.error('[LottiePlayer] Failed to fetch animation:', response.status, src)
          return
        }
        const animationData = await response.json()
        if (cancelled || !containerRef.current) return
        const animation = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: false,
          animationData,
          rendererSettings: {
            preserveAspectRatio: fit === 'contain' ? 'xMidYMid meet' : 'xMidYMid slice',
          },
        })
        animationRef.current = animation
        if (autoplayRef.current) animation.play()
      } catch (err) {
        console.error('[LottiePlayer] Failed to load animation:', err)
      }
    }

    animationRef.current = undefined
    void load()

    return () => {
      cancelled = true
      animationRef.current?.destroy()
      animationRef.current = undefined
    }
  }, [src, fit])

  useEffect(() => {
    const animation = animationRef.current
    if (!animation) return
    if (autoplay) animation.play()
    else animation.pause()
  }, [autoplay])

  return (
    <div
      ref={containerRef}
      className={`lottie-player ${className ?? ''}`.trim()}
      aria-hidden
    />
  )
}
