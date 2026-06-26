import type { Metadata } from 'next'
import { urlFor } from '../sanity/lib/image'
import { fetchSanity } from '../sanity/lib/fetch'
import { shouldBlockSearchIndexing } from '../sanity/lib/preview'
import { siteSettingsQuery } from './sanity.queries'

export type SeoFields = {
  title?: string | null
  description?: string | null
  image?: { asset?: unknown } | null
  noIndex?: boolean | null
}

export type SiteSettings = {
  title?: string | null
  siteUrl?: string | null
  favicon?: { asset?: unknown } | null
  appleTouchIcon?: { asset?: unknown } | null
  seo?: SeoFields | null
}

const FALLBACK_TITLE = 'No Ideas'
const FALLBACK_DESCRIPTION = 'Design and art direction studio.'

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return fetchSanity<SiteSettings | null>(siteSettingsQuery, {}, { stega: false })
}

export function resolveSiteUrl(settings?: SiteSettings | null): string {
  const cmsUrl = settings?.siteUrl?.trim()
  if (cmsUrl) return cmsUrl.replace(/\/$/, '')

  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (envUrl) return envUrl.replace(/\/$/, '')

  const vercelUrl = process.env.VERCEL_URL?.trim()
  if (vercelUrl) return `https://${vercelUrl}`

  return 'http://localhost:3000'
}

type PageSeoOptions = {
  path?: string
  seo?: SeoFields | null
  title?: string
  description?: string
}

export function buildPageMetadata(
  settings: SiteSettings | null,
  options: PageSeoOptions = {}
): Metadata {
  const siteName = settings?.title?.trim() || FALLBACK_TITLE
  const baseUrl = resolveSiteUrl(settings)
  const defaultDescription =
    settings?.seo?.description?.trim() || FALLBACK_DESCRIPTION

  const pageTitle = options.seo?.title?.trim() || options.title?.trim()
  const pageDescription =
    options.seo?.description?.trim() ||
    options.description?.trim() ||
    defaultDescription
  const ogImage = options.seo?.image ?? settings?.seo?.image
  const noIndex =
    shouldBlockSearchIndexing() ||
    options.seo?.noIndex === true ||
    settings?.seo?.noIndex === true
  const pageUrl = options.path ? `${baseUrl}${options.path}` : baseUrl

  const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: pageTitle || siteName,
    description: pageDescription,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      siteName,
      title: pageTitle || siteName,
      description: pageDescription,
      url: pageUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle || siteName,
      description: pageDescription,
    },
  }

  if (ogImage) {
    const imageUrl = urlFor(ogImage).width(1200).height(630).url()
    metadata.openGraph = {
      ...metadata.openGraph,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: pageTitle || siteName }],
    }
    metadata.twitter = {
      ...metadata.twitter,
      images: [imageUrl],
    }
  }

  if (noIndex) {
    metadata.robots = { index: false, follow: false }
  }

  return metadata
}

export function buildRootMetadata(settings: SiteSettings | null): Metadata {
  const siteName = settings?.title?.trim() || FALLBACK_TITLE
  const metadata = buildPageMetadata(settings)

  metadata.title = {
    default: siteName,
    template: `%s — ${siteName}`,
  }

  if (settings?.favicon) {
    metadata.icons = {
      icon: urlFor(settings.favicon).width(32).height(32).url(),
      ...(settings.appleTouchIcon && {
        apple: urlFor(settings.appleTouchIcon).width(180).height(180).url(),
      }),
    }
  }

  return metadata
}

export function buildOrganizationJsonLd(settings: SiteSettings | null, siteUrl: string) {
  const name = settings?.title?.trim() || FALLBACK_TITLE
  const description = settings?.seo?.description?.trim() || FALLBACK_DESCRIPTION

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url: siteUrl,
    description,
    ...(settings?.favicon && {
      logo: urlFor(settings.favicon).width(512).height(512).url(),
    }),
  }
}
