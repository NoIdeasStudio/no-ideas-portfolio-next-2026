import { sanityClient } from '../../lib/sanity.client'
import {
  allCategoriesQuery,
  indexProjectsQuery,
  siteLayoutQuery,
  allProjectsWithSlidesQuery,
} from '../../lib/sanity.queries'
import { urlFor } from '../../sanity/lib/image'
import {
  IndexPageClient,
  type IndexCategory,
  type IndexProject,
  type IndexGridItem,
} from '../../components/IndexPageClient'

export const revalidate = 60

export const metadata = {
  title: 'Index — No Ideas',
  description: 'Index of projects by No Ideas.',
}

type SiteLayout = {
  projectOrderIds?: string[] | null
  categoryOrderIds?: string[] | null
}

function sortByOrderIds<T extends { _id: string }>(
  items: T[],
  orderIds: string[] | undefined | null
): T[] {
  if (!orderIds?.length) return items
  const byId = new Map(items.map((i) => [i._id, i]))
  const ordered: T[] = []
  for (const id of orderIds) {
    const item = byId.get(id)
    if (item) ordered.push(item)
  }
  for (const item of items) {
    if (!orderIds.includes(item._id)) ordered.push(item)
  }
  return ordered
}

type RawSlide = {
  layout?: string
  mediaType?: string
  image?: { asset?: { _ref?: string } }
  imageUrl?: string | null
  videoUrl?: string | null
  items?: Array<{
    mediaType?: string
    image?: { asset?: { _ref?: string } }
    imageUrl?: string | null
    videoUrl?: string | null
    fit?: string | null
  }> | null
}

type RawProjectWithSlides = {
  _id: string
  title: string
  slug: string
  slides?: RawSlide[] | null
}

function buildGridItems(
  projects: RawProjectWithSlides[],
  orderIds: string[] | undefined | null
): IndexGridItem[] {
  const ordered = sortByOrderIds(projects, orderIds)
  const items: IndexGridItem[] = []
  const w = 800 // column width for grid thumb URLs
  for (const project of ordered) {
    const slug = project.slug ?? ''
    const title = project.title ?? ''
    for (const slide of project.slides ?? []) {
      if (slide.layout === 'twoUp' && slide.items?.length === 2) {
        for (const item of slide.items) {
          const isContain = (item.fit as string) === 'contain'
          const imageUrl =
            item.imageUrl ||
            (item.image &&
              (isContain
                ? urlFor(item.image).width(w).fit('max').url()
                : urlFor(item.image).width(w).height(w).fit('max').url()))
          items.push({
            projectSlug: slug,
            projectTitle: title,
            mediaType: (item.mediaType as 'image' | 'video') ?? 'image',
            imageUrl: imageUrl ?? null,
            videoUrl: item.videoUrl ?? null,
            fit: (item.fit as 'cover' | 'contain') ?? 'cover',
          })
        }
      } else {
        const isContain = (slide.layout as string) === 'contain'
        const imageUrl =
          slide.imageUrl ||
          (slide.image &&
            (isContain
              ? urlFor(slide.image).width(w).fit('max').url()
              : urlFor(slide.image).width(w).height(w).fit('max').url()))
        items.push({
          projectSlug: slug,
          projectTitle: title,
          mediaType: (slide.mediaType as 'image' | 'video') ?? 'image',
          imageUrl: imageUrl ?? null,
          videoUrl: slide.videoUrl ?? null,
          fit: isContain ? 'contain' : 'cover',
        })
      }
    }
  }
  return items
}

async function getIndexData(): Promise<{
  categories: IndexCategory[]
  projects: IndexProject[]
  gridItems: IndexGridItem[]
}> {
  try {
    const [layout, categories, projects, projectsWithSlides] = await Promise.all([
      sanityClient.fetch<SiteLayout | null>(siteLayoutQuery),
      sanityClient.fetch<IndexCategory[]>(allCategoriesQuery),
      sanityClient.fetch<IndexProject[]>(indexProjectsQuery),
      sanityClient.fetch<RawProjectWithSlides[]>(allProjectsWithSlidesQuery),
    ])
    const cats = categories ?? []
    const projs = projects ?? []
    const gridItems = buildGridItems(projectsWithSlides ?? [], layout?.projectOrderIds)
    return {
      categories: sortByOrderIds(cats, layout?.categoryOrderIds),
      projects: sortByOrderIds(projs, layout?.projectOrderIds),
      gridItems,
    }
  } catch (err) {
    console.error('[Projects] Failed to fetch from Sanity:', err)
    return { categories: [], projects: [], gridItems: [] }
  }
}

export default async function ProjectsPage() {
  const { categories, projects, gridItems } = await getIndexData()

  return (
    <IndexPageClient
      categories={categories}
      projects={projects}
      gridItems={gridItems}
    />
  )
}
