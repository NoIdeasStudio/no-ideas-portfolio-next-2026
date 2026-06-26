import { buildOrganizationJsonLd, type SiteSettings } from '../lib/metadata'

type SiteJsonLdProps = {
  settings: SiteSettings | null
  siteUrl: string
}

export function SiteJsonLd({ settings, siteUrl }: SiteJsonLdProps) {
  const jsonLd = buildOrganizationJsonLd(settings, siteUrl)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
