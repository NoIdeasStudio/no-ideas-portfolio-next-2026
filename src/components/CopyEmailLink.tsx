'use client'

import { useCallback, useRef, useState } from 'react'

type CopyEmailLinkProps = {
  email: string
}

export function CopyEmailLink({ email }: CopyEmailLinkProps) {
  const cleanEmail = email.replace(/\s/g, '')
  const [hovering, setHovering] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setPos({ x: e.clientX, y: e.clientY })
  }, [])

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      try {
        await navigator.clipboard.writeText(cleanEmail)
      } catch {
        return
      }

      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current)
      setCopied(true)
      copiedTimeoutRef.current = setTimeout(() => {
        setCopied(false)
        copiedTimeoutRef.current = null
      }, 1200)
    },
    [cleanEmail],
  )

  return (
    <>
      <a
        href={`mailto:${cleanEmail}?Subject=new%20biz`}
        className="info-email-copy"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        {email}
      </a>
      {hovering ? (
        <span
          className="info-email-copy-cursor type-secondary"
          style={{ left: pos.x, top: pos.y }}
          aria-hidden="true"
        >
          {copied ? 'copied!' : 'copy'}
        </span>
      ) : null}
    </>
  )
}
