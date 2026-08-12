'use client'

import { useEffect, useRef } from 'react'

export function CarouselVideo({
  src,
  webmSrc,
  className,
  isActive,
  isContain = false,
  autoPlay,
  onLoadedData,
}: {
  src: string
  webmSrc?: string | null
  className?: string
  isActive: boolean
  isContain?: boolean
  autoPlay?: boolean
  onLoadedData?: () => void
}) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (isActive) {
      void video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [isActive])

  const resolvedClassName =
    className ??
    (isContain
      ? 'video-contain max-h-full max-w-full object-contain w-auto h-auto'
      : 'video-cover absolute inset-0 h-full w-full object-cover')

  if (webmSrc) {
    return (
      <video
        ref={ref}
        className={resolvedClassName}
        playsInline
        muted
        loop
        preload="auto"
        autoPlay={autoPlay}
        onLoadedData={onLoadedData}
      >
        <source src={src} type='video/quicktime; codecs="hvc1"' />
        <source src={webmSrc} type="video/webm" />
      </video>
    )
  }

  return (
    <video
      ref={ref}
      src={src}
      className={resolvedClassName}
      playsInline
      muted
      loop
      preload="auto"
      autoPlay={autoPlay}
      onLoadedData={onLoadedData}
    />
  )
}
