import { urlFor } from '../sanity/lib/image'
import type { ProjectSeoData } from '../lib/projects'

type ProjectJsonLdProps = {
  project: ProjectSeoData
  siteUrl: string
  siteName: string
}

export function ProjectJsonLd({ project, siteUrl, siteName }: ProjectJsonLdProps) {
  const pageUrl = `${siteUrl}/projects/${project.slug}`
  const description =
    project.seo.description?.trim() || project.descriptionPlain || undefined

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.seo.title?.trim() || project.title,
    url: pageUrl,
    ...(description && { description }),
    ...(project.year && { dateCreated: project.year }),
    ...(project.visitUrl && { sameAs: project.visitUrl }),
    creator: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
    },
    ...(project.seoImage && {
      image: urlFor(project.seoImage).width(1200).height(630).url(),
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
