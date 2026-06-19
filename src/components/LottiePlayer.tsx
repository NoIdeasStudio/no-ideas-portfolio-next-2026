'use client'

import { useEffect, useRef } from 'react'
import type { AnimationItem } from 'lottie-web'

type LottiePlayerProps = {
  src: string
  className?: string
  fit?: 'cover' | 'contain'
}

export function LottiePlayer({ src, className, fit = 'cover' }: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let animation: AnimationItem | undefined
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
        animation = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData,
          rendererSettings: {
            preserveAspectRatio: fit === 'contain' ? 'xMidYMid meet' : 'xMidYMid slice',
          },
        })
      } catch (err) {
        console.error('[LottiePlayer] Failed to load animation:', err)
      }
    }

    void load()

    return () => {
      cancelled = true
      animation?.destroy()
    }
  }, [src, fit])

  return (
    <div
      ref={containerRef}
      className={`lottie-player ${className ?? ''}`.trim()}
      aria-hidden
    />
  )
}
