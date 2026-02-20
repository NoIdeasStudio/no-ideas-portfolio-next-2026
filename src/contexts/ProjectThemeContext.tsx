'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

type ProjectThemeContextValue = {
  themeColor: string | null
  setThemeColor: (color: string | null) => void
  /** Slug of the project section currently in view (homepage). Active carousel uses this to push its effective theme. */
  activeProjectSlug: string | null
  setActiveProjectSlug: (slug: string | null) => void
  /** Title of the active project (for header). Set by the active carousel. */
  activeProjectTitle: string | null
  setActiveProjectTitle: (title: string | null) => void
  /** Slug of the project whose description is open (clicking header title toggles). */
  descriptionOpenSlug: string | null
  setDescriptionOpenSlug: (slug: string | null) => void
}

const ProjectThemeContext = createContext<ProjectThemeContextValue | null>(null)

export function ProjectThemeProvider({ children }: { children: ReactNode }) {
  const [themeColor, setThemeColor] = useState<string | null>(null)
  const [activeProjectSlug, setActiveProjectSlug] = useState<string | null>(null)
  const [activeProjectTitle, setActiveProjectTitle] = useState<string | null>(null)
  const [descriptionOpenSlug, setDescriptionOpenSlug] = useState<string | null>(null)
  return (
    <ProjectThemeContext.Provider
      value={{
        themeColor,
        setThemeColor,
        activeProjectSlug,
        setActiveProjectSlug,
        activeProjectTitle,
        setActiveProjectTitle,
        descriptionOpenSlug,
        setDescriptionOpenSlug,
      }}
    >
      {children}
    </ProjectThemeContext.Provider>
  )
}

export function useProjectTheme() {
  const ctx = useContext(ProjectThemeContext)
  return ctx
}
