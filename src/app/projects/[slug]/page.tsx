import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HomepageInfiniteLoop } from '../../../components/HomepageInfiniteLoop'
import { ProjectJsonLd } from '../../../components/ProjectJsonLd'
import { buildPageMetadata, getSiteSettings, resolveSiteUrl } from '../../../lib/metadata'
import { getProjectBySlug, getProjectSeoBySlug } from '../../../lib/projects'

export const revalidate = 60

type ProjectPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const [settings, project] = await Promise.all([
    getSiteSettings(),
    getProjectSeoBySlug(slug),
  ])

  if (!project) return {}

  return buildPageMetadata(settings, {
    path: `/projects/${project.slug}`,
    seo: project.seo,
    title: project.title,
    description: project.descriptionPlain || undefined,
  })
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const [settings, project, seo] = await Promise.all([
    getSiteSettings(),
    getProjectBySlug(slug),
    getProjectSeoBySlug(slug),
  ])

  if (!project || !seo) notFound()

  const siteUrl = resolveSiteUrl(settings)
  const siteName = settings?.title?.trim() || 'No Ideas'

  return (
    <div id="homepage">
      <ProjectJsonLd project={seo} siteUrl={siteUrl} siteName={siteName} />
      <HomepageInfiniteLoop
        projects={[project]}
        themeObserverProjects={[{ slug: project.slug }]}
        enableLoopDuplicate={false}
      />
    </div>
  )
}
