import { defineLocations, presentationTool } from 'sanity/presentation'

import { getSitePreviewOrigin } from './env'

const previewAllowOrigins = (process.env.NEXT_PUBLIC_SANITY_PREVIEW_ALLOW_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

const projectLocations = defineLocations({
  select: {
    title: 'title',
    slug: 'slug.current',
  },
  resolve: (doc) => {
    const slug = typeof doc?.slug === 'string' ? doc.slug : null
    const hrefHome = slug ? `/#${slug}` : '/'
    const hrefIndex = slug ? `/projects#${slug}` : '/projects'
    return {
      locations: [
        { title: 'Home', href: hrefHome },
        { title: 'Index', href: hrefIndex },
      ],
    }
  },
})

const infoPageLocations = defineLocations({
  select: { title: 'title' },
  resolve: () => ({
    locations: [{ title: 'Info', href: '/info' }],
  }),
})

const siteLayoutLocations = defineLocations({
  select: { title: 'title' },
  resolve: () => ({
    locations: [
      { title: 'Home', href: '/' },
      { title: 'Index', href: '/projects' },
    ],
  }),
})

const categoryLocations = defineLocations({
  select: { title: 'title' },
  resolve: () => ({
    locations: [{ title: 'Index', href: '/projects' }],
  }),
})

export const presentation = presentationTool({
  previewUrl: {
    initial: getSitePreviewOrigin(),
    previewMode: {
      enable: '/api/draft-mode/enable',
    },
  },
  ...(previewAllowOrigins.length > 0 ? { allowOrigins: previewAllowOrigins } : {}),
  resolve: {
    mainDocuments: [
      { route: '/info', type: 'infoPage' },
      { route: '/', type: 'siteLayout' },
      { route: '/projects', type: 'siteLayout' },
    ],
    locations: {
      project: projectLocations,
      infoPage: infoPageLocations,
      siteLayout: siteLayoutLocations,
      category: categoryLocations,
    },
  },
})
