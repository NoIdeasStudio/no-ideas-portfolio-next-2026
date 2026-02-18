import { HomepageThemeObserver } from '../components/HomepageThemeObserver'
import { ProjectCarousel, type TwoUpItem } from '../components/ProjectCarousel'
import { ScrollToHash } from '../components/ScrollToHash'
import { sanityClient } from '../lib/sanity.client'
import { allProjectsWithSlidesQuery } from '../lib/sanity.queries'
import { urlFor } from '../sanity/lib/image'
import { seedProjects } from '../data/seed-projects'

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
  image?: { asset?: { _ref?: string } }
  imageUrl?: string
  videoUrl?: string
  caption?: string
  containPadding?: string | null
  backgroundColor?: string | null
  textTheme?: string | null
  textThemeCustomColor?: string | null
  items?: Array<{
    mediaType: string
    image?: { asset?: { _ref?: string } }
    imageUrl?: string
    videoUrl?: string
    fit?: string | null
    containPadding?: string | null
  }>
}

async function getProjects() {
  const data = await sanityClient.fetch<Array<{
    _id: string
    title: string
    slug: string
    description?: string | null
    textTheme?: string | null
    textThemeCustomColor?: string | null
    slides?: SlideItem[]
  }>>(allProjectsWithSlidesQuery)

  if (!data || data.length === 0) {
    return seedProjects.map((p) => ({
      _id: p._id,
      title: p.title,
      slug: p.slug,
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

  return data.map((project) => ({
    ...project,
    themeColor: resolveThemeColor(project.textTheme, project.textThemeCustomColor),
    slides: (project.slides ?? []).map((slide) => {
      const bg = slide.backgroundColor ?? '#000000'
      if (slide.layout === 'twoUp' && slide.items?.length === 2) {
        const items = slide.items.map((item) => {
          const isContain = (item.fit as string) === 'contain'
          const imageUrl =
            item.imageUrl ||
            (item.image &&
              (isContain
                ? urlFor(item.image).width(960).fit('max').url()
                : urlFor(item.image).width(960).height(1080).url()))
          return {
            mediaType: item.mediaType as 'image' | 'video',
            imageUrl: imageUrl ?? null,
            videoUrl: item.videoUrl ?? null,
            fit: (item.fit as 'cover' | 'contain') ?? 'cover',
            containPadding: item.containPadding ?? '0',
          }
        }) as [TwoUpItem, TwoUpItem]
        return {
          layout: 'twoUp' as const,
          items,
          backgroundColor: bg,
          themeColor:
            slide.textTheme != null
              ? resolveThemeColor(slide.textTheme, slide.textThemeCustomColor)
              : undefined,
        }
      }
      const imageUrl =
        slide.imageUrl ||
        (slide.image &&
          (slide.layout === 'contain'
            ? urlFor(slide.image).width(1920).fit('max').url()
            : urlFor(slide.image).width(1920).height(1080).url()))
      return {
        layout: slide.layout as 'fullBleed' | 'contain',
        mediaType: slide.mediaType as 'image' | 'video',
        imageUrl: imageUrl ?? null,
        videoUrl: slide.videoUrl ?? null,
        caption: slide.caption ?? null,
        containPadding: slide.containPadding ?? '0',
        backgroundColor: bg,
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
      <ScrollToHash />
      <HomepageThemeObserver projects={themeObserverProjects} />
      {projects.map((project) => (
        <ProjectCarousel
          key={project._id}
          projectTitle={project.title}
          projectDescription={project.description ?? null}
          projectSlug={project.slug}
          themeColor={project.themeColor ?? '#fff'}
          slides={project.slides ?? []}
        />
      ))}
    </div>
  )
}
