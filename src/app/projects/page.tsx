import type { Metadata } from 'next'
import { fetchSanity } from '../../sanity/lib/fetch'
import {
  allCategoriesQuery,
  bookIndexQuery,
  indexProjectsQuery,
  siteLayoutQuery,
  allProjectsWithSlidesQuery,
} from '../../lib/sanity.queries'
import type { HomepageOrderItem } from '../../lib/resolveBooks'
import { buildPageMetadata, getSiteSettings } from '../../lib/metadata'
import { sortByOrderIds } from '../../lib/sortByOrderIds'
import { sanityImageGridUrl, type SanityImageWithAssetUrl } from '../../sanity/lib/image'
import {
  IndexPageClient,
  type IndexCategory,
  type IndexProject,
  type IndexGridItem,
} from '../../components/IndexPageClient'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  return buildPageMetadata(settings, {
    path: '/projects',
    title: 'Index',
    description: 'Index of projects by No Ideas.',
  })
}

const BOOK_COVERS_SLUG = 'book-covers'

type SiteLayout = {
  projectOrderIds?: string[] | null
  categoryOrderIds?: string[] | null
  homepageOrder?: HomepageOrderItem[] | null
}

type BookIndex = {
  title?: string | null
  year?: string | null
  categories?: Array<IndexCategory | null> | null
}

type RawSlide = {
  layout?: string
  mediaType?: string
  image?: SanityImageWithAssetUrl
  imageUrl?: string | null
  videoUrl?: string | null
  videoUrlWebm?: string | null
  items?: Array<{
    mediaType?: string
    image?: SanityImageWithAssetUrl
    imageUrl?: string | null
    videoUrl?: string | null
    videoUrlWebm?: string | null
    fit?: string | null
  }> | null
}

type RawProjectWithSlides = {
  _id: string
  title: string
  slug: string
  slides?: RawSlide[] | null
}

function bookCoversProject(book: BookIndex | null): IndexProject {
  const categories = (book?.categories ?? []).filter(
    (category): category is IndexCategory =>
      Boolean(category?._id && category.title && category.slug),
  )
  return {
    _id: BOOK_COVERS_SLUG,
    title: book?.title?.trim() || 'Book Covers',
    slug: BOOK_COVERS_SLUG,
    categories,
    year: book?.year?.trim() || null,
  }
}

/** Walk Site Layout. The book slideshow row sits wherever that marker is. */
function orderIndexProjects(
  projects: IndexProject[],
  layout: SiteLayout | null,
  book: BookIndex | null,
): IndexProject[] {
  const order = layout?.homepageOrder
  const hasMarker = order?.some((item) => item.kind === 'bookSlideshow')
  if (!order?.length || !hasMarker) {
    return sortByOrderIds(projects, layout?.projectOrderIds)
  }

  const byId = new Map(projects.map((project) => [project._id, project]))
  const ordered: IndexProject[] = []
  for (const item of order) {
    if (item.kind === 'bookSlideshow') {
      ordered.push(bookCoversProject(book))
      continue
    }
    const project = item.projectId ? byId.get(item.projectId) : undefined
    if (project) ordered.push(project)
  }
  return ordered
}

function buildGridItems(
  projects: RawProjectWithSlides[],
  orderIds: string[] | undefined | null
): IndexGridItem[] {
  const ordered = sortByOrderIds(projects, orderIds)
  const items: IndexGridItem[] = []
  for (const project of ordered) {
    const slug = project.slug ?? ''
    for (const slide of project.slides ?? []) {
      if (slide.layout === 'twoUp' && slide.items?.length === 2) {
        for (const item of slide.items) {
          const isContain = (item.fit as string) === 'contain'
          const imageUrl = sanityImageGridUrl(
            item.image ?? null,
            item.imageUrl ?? null,
            isContain ? 'contain' : 'coverSquare'
          )
          items.push({
            projectSlug: slug,
            mediaType: (item.mediaType as 'image' | 'video') ?? 'image',
            imageUrl: imageUrl ?? null,
            videoUrl: item.videoUrl ?? null,
            videoUrlWebm: item.videoUrlWebm ?? null,
            fit: (item.fit as 'cover' | 'contain') ?? 'cover',
          })
        }
      } else {
        const isContain = (slide.layout as string) === 'contain'
        const imageUrl = sanityImageGridUrl(
          slide.image ?? null,
          slide.imageUrl ?? null,
          isContain ? 'contain' : 'coverSquare'
        )
        items.push({
          projectSlug: slug,
          mediaType: (slide.mediaType as 'image' | 'video') ?? 'image',
          imageUrl: imageUrl ?? null,
          videoUrl: slide.videoUrl ?? null,
          videoUrlWebm: slide.videoUrlWebm ?? null,
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
    const [layout, categories, projects, projectsWithSlides, bookIndex] = await Promise.all([
      fetchSanity<SiteLayout | null>(siteLayoutQuery),
      fetchSanity<IndexCategory[]>(allCategoriesQuery),
      fetchSanity<IndexProject[]>(indexProjectsQuery),
      fetchSanity<RawProjectWithSlides[]>(allProjectsWithSlidesQuery),
      fetchSanity<BookIndex | null>(bookIndexQuery),
    ])
    const cats = categories ?? []
    const gridItems = buildGridItems(projectsWithSlides ?? [], layout?.projectOrderIds)
    return {
      categories: sortByOrderIds(cats, layout?.categoryOrderIds),
      projects: orderIndexProjects(projects ?? [], layout, bookIndex),
      gridItems,
    }
  } catch (err) {
    console.error('[Projects] Failed to fetch from Sanity:', err)
    return { categories: [], projects: [], gridItems: [] }
  }
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category: categorySlug } = await searchParams
  const { categories, projects, gridItems } = await getIndexData()

  const initialFilter =
    categorySlug != null
      ? (categories.find((cat) => cat.slug === categorySlug)?._id ?? 'all')
      : 'all'

  return (
    <IndexPageClient
      categories={categories}
      projects={projects}
      gridItems={gridItems}
      initialFilter={initialFilter}
    />
  )
}
