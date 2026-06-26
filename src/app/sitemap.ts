import type { MetadataRoute } from 'next'
import { getSiteSettings, resolveSiteUrl } from '../lib/metadata'
import { getProjectSitemapEntries } from '../lib/projects'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, projects] = await Promise.all([
    getSiteSettings(),
    getProjectSitemapEntries(),
  ])
  const baseUrl = resolveSiteUrl(settings)

  const staticRoutes: Array<{ path: string; priority: number }> = [
    { path: '', priority: 1 },
    { path: '/projects', priority: 0.8 },
    { path: '/info', priority: 0.8 },
  ]

  const staticEntries = staticRoutes.map(({ path, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority,
  }))

  const projectEntries = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticEntries, ...projectEntries]
}
