import type { MetadataRoute } from 'next'
import { getSiteSettings, resolveSiteUrl } from '../lib/metadata'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings()
  const baseUrl = resolveSiteUrl(settings)
  const noIndex = settings?.seo?.noIndex === true

  return {
    rules: noIndex
      ? { userAgent: '*', disallow: '/' }
      : { userAgent: '*', allow: '/' },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
