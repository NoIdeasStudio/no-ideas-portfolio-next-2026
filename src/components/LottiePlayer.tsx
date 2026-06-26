'use client'

import { useEffect, useRef } from 'react'
import type { AnimationItem } from 'lottie-web'
import { getCachedLottieData, loadLottieData } from '../lib/mediaAnimationCache'

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
  const loadedSrcRef = useRef<string | null>(null)
  const autoplayRef = useRef(autoplay)
  autoplayRef.current = autoplay

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false

    async function load(animationData: unknown) {
      try {
        const { default: lottie } = await import('lottie-web')
        if (cancelled || !containerRef.current) return

        animationRef.current?.destroy()
        animationRef.current = undefined

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
        loadedSrcRef.current = src
        if (autoplayRef.current) animation.play()
      } catch (err) {
        console.error('[LottiePlayer] Failed to load animation:', err)
      }
    }

    const cached = getCachedLottieData(src)
    if (cached) {
      void load(cached)
      return () => {
        cancelled = true
        animationRef.current?.destroy()
        animationRef.current = undefined
        loadedSrcRef.current = null
      }
    }

    void loadLottieData(src)
      .then((animationData) => {
        if (!cancelled) void load(animationData)
      })
      .catch((err) => {
        console.error('[LottiePlayer] Failed to fetch animation:', err)
      })

    return () => {
      cancelled = true
      animationRef.current?.destroy()
      animationRef.current = undefined
      loadedSrcRef.current = null
    }
  }, [src, fit])

  useEffect(() => {
    const animation = animationRef.current
    if (!animation || loadedSrcRef.current !== src) return
    if (autoplay) animation.play()
    else animation.pause()
  }, [autoplay, src])

  return (
    <div
      ref={containerRef}
      className={`lottie-player ${className ?? ''}`.trim()}
      aria-hidden
    />
  )
}
