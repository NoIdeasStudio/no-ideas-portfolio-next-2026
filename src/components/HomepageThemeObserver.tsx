'use client'

import { useEffect, useRef } from 'react'
import { useProjectTheme } from '../contexts/ProjectThemeContext'

type ProjectThemeItem = { slug: string }

export function HomepageThemeObserver({ projects }: { projects: ProjectThemeItem[] }) {
  const { setActiveProjectSlug, setThemeColor } = useProjectTheme() ?? {
    setActiveProjectSlug: () => {},
    setThemeColor: () => {},
  }
  const ratiosRef = useRef<Record<string, number>>({})

  useEffect(() => {
    if (projects.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const slug = e.target.id
          if (slug) ratiosRef.current[slug] = e.intersectionRatio
        }
        // Prefer the topmost visible project (closest to top of viewport) so header color changes when project is near the top, not center
        let bestSlug: string | null = null
        let bestTop = Infinity
        for (const p of projects) {
          const slug = p.slug
          if (!slug || (ratiosRef.current[slug] ?? 0) <= 0) continue
          const el = document.getElementById(slug)
          if (!el) continue
          const top = el.getBoundingClientRect().top
          if (top < bestTop) {
            bestTop = top
            bestSlug = slug
          }
        }
        setActiveProjectSlug(bestSlug)
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    )

    const elements: Element[] = []
    for (const p of projects) {
      if (!p.slug) continue
      const el = document.getElementById(p.slug)
      if (el) {
        observer.observe(el)
        elements.push(el)
      }
    }

    setActiveProjectSlug(projects[0]?.slug ?? null)

    return () => {
      for (const el of elements) observer.unobserve(el)
      ratiosRef.current = {}
      setActiveProjectSlug(null)
      setThemeColor(null)
    }
  }, [projects, setActiveProjectSlug, setThemeColor])

  return null
}
