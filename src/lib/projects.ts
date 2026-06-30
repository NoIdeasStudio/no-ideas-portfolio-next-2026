import type { PortableTextBlock } from '@portabletext/types'
import type { TwoUpItem, TwoUpSpacing } from '../components/ProjectCarousel'
import type { ProjectCategory } from '../components/ProjectInfoPanel'
import type { HomepageProject } from '../components/HomepageInfiniteLoop'
import { sanityImageServeUrl, type SanityImageWithAssetUrl } from '../sanity/lib/image'
import { portableTextPlain } from '../sanity/lib/portableTextPlain'
import { seedProjects } from '../data/seed-projects'
import { fetchSanity } from '../sanity/lib/fetch'
import {
  allProjectsWithSlidesQuery,
  projectBySlugQuery,
  projectSlugsForSitemapQuery,
  siteLayoutQuery,
} from './sanity.queries'
import { sortByOrderIds } from './sortByOrderIds'
import type { SeoFields } from './metadata'

type SiteLayout = {
  projectOrderIds?: string[] | null
  categoryOrderIds?: string[] | null
}

type SlideItem = {
  layout: string
  mediaType: string
  image?: SanityImageWithAssetUrl
  imageUrl?: string
  videoUrl?: string
  lottieUrl?: string | null
  animatedSvgUrl?: string | null
  caption?: string
  containPadding?: string | null
  twoUpSpacing?: string | null
  backgroundColor?: string | null
  backgroundVideoUrl?: string | null
  textTheme?: string | null
  textThemeCustomColor?: string | null
  items?: Array<{
    mediaType: string
    image?: SanityImageWithAssetUrl
    imageUrl?: string
    videoUrl?: string
    lottieUrl?: string | null
    animatedSvgUrl?: string | null
    backgroundVideoUrl?: string | null
    fit?: string | null
    containPadding?: string | null
  }>
}

type TwoUpSlideItem = NonNullable<SlideItem['items']>[number]

function bothTwoUpItemsContainWithPadding(items: [TwoUpSlideItem, TwoUpSlideItem]) {
  return (
    items[0].fit === 'contain' &&
    items[1].fit === 'contain' &&
    items[0].containPadding !== '0' &&
    items[1].containPadding !== '0'
  )
}

function resolveTwoUpSpacing(
  spacing: string | null | undefined,
  items: [TwoUpSlideItem, TwoUpSlideItem],
): TwoUpSpacing {
  if (!bothTwoUpItemsContainWithPadding(items)) return 'default'
  if (spacing === 'equalCentered' || spacing === 'equalHugGutter') return spacing
  return 'default'
}

type RawProject = {
  _id: string
  title: string
  slug: string
  description?: unknown
  extendedDescription?: unknown
  visitUrl?: string | null
  recognition?: unknown
  credits?: unknown
  categories?: ProjectCategory[]
  year?: string | null
  textTheme?: string | null
  textThemeCustomColor?: string | null
  slides?: SlideItem[]
}

function resolveThemeColor(
  textTheme?: string | null,
  textThemeCustomColor?: string | null
): string {
  if (textTheme === 'dark') return '#000'
  if (textTheme === 'custom' && textThemeCustomColor) return textThemeCustomColor
  return '#fff'
}

function mapProject(project: RawProject): HomepageProject {
  return {
    ...project,
    themeColor: resolveThemeColor(project.textTheme, project.textThemeCustomColor),
    categories: project.categories ?? [],
    visitUrl: project.visitUrl ?? null,
    recognition: (project.recognition ?? null) as PortableTextBlock[] | null,
    credits: (project.credits ?? null) as PortableTextBlock[] | null,
    extendedDescription: (project.extendedDescription ?? null) as PortableTextBlock[] | null,
    year: project.year ?? null,
    slides: (project.slides ?? []).map((slide) => {
      const bg = slide.backgroundColor ?? '#000000'
      if (slide.layout === 'twoUp' && slide.items?.length === 2) {
        const mapTwoUpItem = (item: TwoUpSlideItem): TwoUpItem => ({
          mediaType: item.mediaType as 'image' | 'video' | 'lottie' | 'animatedSvg',
          imageUrl: sanityImageServeUrl(item.image ?? null, item.imageUrl ?? null),
          videoUrl: item.videoUrl ?? null,
          lottieUrl: item.lottieUrl ?? null,
          animatedSvgUrl: item.animatedSvgUrl ?? null,
          backgroundVideoUrl: item.backgroundVideoUrl ?? null,
          fit: (item.fit as 'cover' | 'contain') ?? 'cover',
          containPadding: item.containPadding ?? '0',
        })
        const items: [TwoUpItem, TwoUpItem] = [
          mapTwoUpItem(slide.items[0]),
          mapTwoUpItem(slide.items[1]),
        ]
        const twoUpSpacing = resolveTwoUpSpacing(slide.twoUpSpacing, [slide.items[0], slide.items[1]])
        return {
          layout: 'twoUp' as const,
          items,
          twoUpSpacing,
          backgroundColor: bg,
          backgroundVideoUrl: slide.backgroundVideoUrl ?? null,
          themeColor:
            slide.textTheme != null
              ? resolveThemeColor(slide.textTheme, slide.textThemeCustomColor)
              : undefined,
        }
      }
      const imageUrl = sanityImageServeUrl(slide.image ?? null, slide.imageUrl ?? null)
      return {
        layout: slide.layout as 'fullBleed' | 'contain',
        mediaType: slide.mediaType as 'image' | 'video' | 'lottie' | 'animatedSvg',
        imageUrl,
        videoUrl: slide.videoUrl ?? null,
        lottieUrl: slide.lottieUrl ?? null,
        animatedSvgUrl: slide.animatedSvgUrl ?? null,
        caption: slide.caption ?? null,
        containPadding: slide.containPadding ?? '0',
        backgroundColor: bg,
        backgroundVideoUrl: slide.backgroundVideoUrl ?? null,
        themeColor:
          slide.textTheme != null
            ? resolveThemeColor(slide.textTheme, slide.textThemeCustomColor)
            : undefined,
      }
    }),
  }
}

function seedFallbackProjects(): HomepageProject[] {
  return seedProjects.map((p) => ({
    _id: p._id,
    title: p.title,
    slug: p.slug,
    description: null,
    themeColor: '#fff',
    slides: p.slides.map((s) => ({
      layout: s.layout,
      mediaType: s.mediaType,
      imageUrl: s.imageUrl ?? null,
      videoUrl: s.videoUrl ?? null,
      caption: s.caption ?? null,
      backgroundColor: '#000000',
    })),
  }))
}

async function fetchRawProjects(): Promise<RawProject[]> {
  const [layout, data] = await Promise.all([
    fetchSanity<SiteLayout | null>(siteLayoutQuery),
    fetchSanity<RawProject[]>(allProjectsWithSlidesQuery),
  ])

  if (!data || data.length === 0) return []
  return sortByOrderIds(data, layout?.projectOrderIds)
}

export async function getAllProjects(): Promise<HomepageProject[]> {
  const raw = await fetchRawProjects()
  if (raw.length === 0) return seedFallbackProjects()
  return raw.map(mapProject)
}

export async function getProjectBySlug(slug: string): Promise<HomepageProject | null> {
  const raw = await fetchSanity<RawProject | null>(projectBySlugQuery, { slug })
  if (raw) return mapProject(raw)

  const fallback = seedFallbackProjects().find((project) => project.slug === slug)
  return fallback ?? null
}

export type ProjectSeoData = {
  title: string
  slug: string
  descriptionPlain: string
  seo: SeoFields
  seoImage?: { asset?: unknown } | null
  year?: string | null
  visitUrl?: string | null
  _updatedAt?: string | null
}

export async function getProjectSeoBySlug(slug: string): Promise<ProjectSeoData | null> {
  const project = await fetchSanity<{
    title?: string | null
    slug?: string | null
    description?: unknown
    year?: string | null
    visitUrl?: string | null
    _updatedAt?: string | null
    seo?: SeoFields | null
    seoImageFallback?: { asset?: unknown } | null
  } | null>(projectBySlugQuery, { slug }, { perspective: 'published', stega: false })

  if (!project?.slug) return null

  const descriptionPlain = portableTextPlain(project.description)
  const seo = project.seo ?? {}

  return {
    title: project.title?.trim() || project.slug,
    slug: project.slug,
    descriptionPlain,
    seo: {
      ...seo,
      image: seo.image ?? project.seoImageFallback ?? null,
    },
    seoImage: seo.image ?? project.seoImageFallback ?? null,
    year: project.year ?? null,
    visitUrl: project.visitUrl ?? null,
    _updatedAt: project._updatedAt ?? null,
  }
}

export async function getProjectSitemapEntries(): Promise<
  Array<{ slug: string; updatedAt?: string | null }>
> {
  return fetchSanity(projectSlugsForSitemapQuery, {}, { perspective: 'published', stega: false })
}
