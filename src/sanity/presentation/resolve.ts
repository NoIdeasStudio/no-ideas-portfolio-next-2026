import { defineLocations, type PresentationPluginOptions } from 'sanity/presentation'

export const resolve: PresentationPluginOptions['resolve'] = {
  locations: {
    project: defineLocations({
      select: { title: 'title', slug: 'slug.current' },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || 'Project',
            href: doc?.slug ? `/projects/${doc.slug}` : '/',
          },
          { title: 'Homepage', href: '/' },
        ],
      }),
    }),
    infoPage: defineLocations({
      select: { title: 'title' },
      resolve: () => ({
        locations: [{ title: 'Info', href: '/info' }],
      }),
    }),
    siteSettings: defineLocations({
      select: { title: 'title' },
      resolve: () => ({
        locations: [{ title: 'Homepage', href: '/' }],
      }),
    }),
    siteLayout: defineLocations({
      select: { title: 'title' },
      resolve: () => ({
        locations: [
          { title: 'Homepage', href: '/' },
          { title: 'Index', href: '/projects' },
        ],
      }),
    }),
  },
}
