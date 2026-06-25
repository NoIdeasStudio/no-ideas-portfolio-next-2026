import type { PortableTextBlock } from '@portabletext/types'
import { HomepageInfiniteLoop } from '../components/HomepageInfiniteLoop'
import { type TwoUpItem } from '../components/ProjectCarousel'
import type { ProjectCategory } from '../components/ProjectInfoPanel'
import { ScrollToHash } from '../components/ScrollToHash'
import { SplashOverlay } from '../components/SplashOverlay'
import { sanityClient } from '../lib/sanity.client'
import { allProjectsWithSlidesQuery, siteLayoutQuery } from '../lib/sanity.queries'
import { sortByOrderIds } from '../lib/sortByOrderIds'
import { sanityImageServeUrl, type SanityImageWithAssetUrl } from '../sanity/lib/image'
import { seedProjects } from '../data/seed-projects'

type SiteLayout = {
  projectOrderIds?: string[] | null
  categoryOrderIds?: string[] | null
}

// Revalidate so Sanity changes (e.g. background color) show up without a full rebuild
export const revalidate = 60

function resolveThemeColor(
  textTheme?: string | null,
  textThemeCustomColor?: string | null
): string {
  if (textTheme === 'dark') return '#000'
  if (textTheme === 'custom' && textThemeCustomColor) return textThemeCustomColor
  return '#fff'
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

async function getProjects() {
  const [layout, data] = await Promise.all([
    sanityClient.fetch<SiteLayout | null>(siteLayoutQuery),
    sanityClient.fetch<Array<{
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
    }>>(allProjectsWithSlidesQuery),
  ])

  const raw = data && data.length > 0 ? sortByOrderIds(data, layout?.projectOrderIds) : []

  if (raw.length === 0) {
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

  return raw.map((project) => ({
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
        return {
          layout: 'twoUp' as const,
          items,
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
  }))
}

export default async function HomePage() {
  const projects = await getProjects()

  const themeObserverProjects = projects.map((p) => ({ slug: p.slug }))

  return (
    <div id="homepage">
      <SplashOverlay />
      <ScrollToHash />
      <HomepageInfiniteLoop
        projects={projects}
        themeObserverProjects={themeObserverProjects}
      />
    </div>
  )
}
