'use client'

import { useEffect, useRef } from 'react'
import { useProjectTheme } from '../contexts/ProjectThemeContext'

type ProjectThemeItem = { slug: string }

function pickActiveSlug(projects: ProjectThemeItem[]): string | null {
  const atOrPastTop: { slug: string; top: number }[] = []
  const belowTop: { slug: string; top: number }[] = []
  for (const p of projects) {
    const slug = p.slug
    if (!slug) continue
    const el = document.getElementById(slug)
    if (!el) continue
    const top = el.getBoundingClientRect().top
    if (top <= 0) atOrPastTop.push({ slug, top })
    else belowTop.push({ slug, top })
  }
  if (atOrPastTop.length > 0) {
    const inView = atOrPastTop.reduce((a, b) => (a.top > b.top ? a : b))
    return inView.slug
  }
  if (belowTop.length > 0) {
    const next = belowTop.reduce((a, b) => (a.top < b.top ? a : b))
    return next.slug
  }
  return null
}

export function HomepageThemeObserver({ projects }: { projects: ProjectThemeItem[] }) {
  const { setActiveProjectSlug, setThemeColor, setActiveProjectTitle } = useProjectTheme() ?? {
    setActiveProjectSlug: () => {},
    setThemeColor: () => {},
    setActiveProjectTitle: () => {},
  }

  useEffect(() => {
    if (projects.length === 0) return

    const update = () => {
      const bestSlug = pickActiveSlug(projects)
      setActiveProjectSlug(bestSlug)
      if (bestSlug == null) setActiveProjectTitle(null)
    }

    const observer = new IntersectionObserver(
      () => update(),
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

    update()
    window.addEventListener('scroll', update, { passive: true })

    return () => {
      window.removeEventListener('scroll', update)
      for (const el of elements) observer.unobserve(el)
      setActiveProjectSlug(null)
      setActiveProjectTitle(null)
      setThemeColor(null)
    }
  }, [projects, setActiveProjectSlug, setActiveProjectTitle, setThemeColor])

  return null
}
