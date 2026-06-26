import { PortableText } from 'next-sanity'
import type { PortableTextBlock } from '@portabletext/types'
import type { Metadata } from 'next'
import { InfoPageFooter } from '../../components/InfoPageFooter'
import { InfoNewsZone } from '../../components/InfoNewsZone'
import { NewsSection, type NewsRowProps } from '../../components/NewsSection'
import type { NewsSlide } from '../../components/NewsPostSlideshow'
import { hasPortableText } from '../../sanity/lib/portableTextPlain'
import { fetchSanity } from '../../sanity/lib/fetch'
import { buildPageMetadata, getSiteSettings, type SeoFields } from '../../lib/metadata'
import { infoPageQuery, infoPageSeoQuery } from '../../lib/sanity.queries'
import { seedInfoPage } from '../../data/seed-info-page'
import { sanityImageServeUrl, type SanityImageWithAssetUrl } from '../../sanity/lib/image'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const [settings, page] = await Promise.all([
    getSiteSettings(),
    fetchSanity<{ seo?: SeoFields | null } | null>(
      infoPageSeoQuery,
      {},
      { perspective: 'published', stega: false },
    ),
  ])

  return buildPageMetadata(settings, {
    path: '/info',
    seo: page?.seo,
    title: 'Info',
    description: 'No Ideas is a graphic design studio in Brooklyn, New York.',
  })
}

type IntroParagraph = { content?: PortableTextBlock[] | null }
type ListItem = { text?: string | null; url?: string | null }
type ContactLink = { header?: string | null; text?: string | null; url?: string | null }
type Column = { heading?: string | null; items?: (string | null)[] | null }
type Section = {
  title?: string | null
  sectionType?: 'list' | 'contact' | 'columns' | null
  listItems?: ListItem[] | null
  contactAddress?: string | null
  contactEmails?: (string | null)[] | null
  contactLinks?: ContactLink[] | null
  columns?: Column[] | null
}
type RawNewsSlide = {
  layout?: 'fullBleed' | 'contain' | null
  containPadding?: string | null
  mediaType?: string | null
  image?: SanityImageWithAssetUrl | null
  imageUrl?: string | null
  videoUrl?: string | null
  lottieUrl?: string | null
  animatedSvgUrl?: string | null
  caption?: string | null
  backgroundColor?: string | null
  backgroundVideoUrl?: string | null
}

type InfoPageData = {
  introParagraphs?: IntroParagraph[] | null
  sections?: Section[] | null
  newsSection?: {
    title?: string | null
    rows?: Array<{
      layout?: 'full' | 'half' | null
      posts?: Array<{
        aspectRatio?: 'native' | 'square' | '3:4' | '4:3' | null
        limitViewportHeight?: boolean | null
        sidePadding?: boolean | null
        publishedAt?: string | null
        description?: PortableTextBlock[] | string | null
        slides?: RawNewsSlide[] | null
      }> | null
    }> | null
  } | null
} | null

type ListRowBlock = {
  kind: 'list-row'
  sections: Section[]
  contact?: Section | null
}

type ColumnsBlock = {
  kind: 'columns'
  section: Section
}

type InfoBlock = ListRowBlock | ColumnsBlock

function chunkSections<T>(sections: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < sections.length; i += size) {
    chunks.push(sections.slice(i, i + size))
  }
  return chunks
}

/** Walk Sanity sections in document order and build render blocks. */
function buildInfoBlocks(sections: Section[]): InfoBlock[] {
  const contactSection = sections.find((s) => s?.sectionType === 'contact') ?? null
  const blocks: InfoBlock[] = []
  let firstRowLists: Section[] = []
  let firstRowDone = false
  let overflowLists: Section[] = []

  const flushOverflowLists = () => {
    if (overflowLists.length === 0) return
    for (const row of chunkSections(overflowLists, 3)) {
      blocks.push({ kind: 'list-row', sections: row })
    }
    overflowLists = []
  }

  for (const section of sections) {
    if (!section?.sectionType) continue

    if (section.sectionType === 'list') {
      if (!firstRowDone) {
        firstRowLists.push(section)
        if (firstRowLists.length === 2) {
          blocks.push({
            kind: 'list-row',
            sections: firstRowLists,
            contact: contactSection,
          })
          firstRowLists = []
          firstRowDone = true
        }
      } else {
        overflowLists.push(section)
      }
      continue
    }

    if (section.sectionType === 'contact') {
      if (!firstRowDone && firstRowLists.length > 0) {
        blocks.push({
          kind: 'list-row',
          sections: firstRowLists,
          contact: section,
        })
        firstRowLists = []
        firstRowDone = true
      }
      continue
    }

    if (section.sectionType === 'columns') {
      flushOverflowLists()
      blocks.push({ kind: 'columns', section })
    }
  }

  if (!firstRowDone && firstRowLists.length > 0) {
    blocks.push({
      kind: 'list-row',
      sections: firstRowLists,
      contact: contactSection,
    })
  }
  flushOverflowLists()

  return blocks
}

function ListSectionColumn({ section }: { section: Section }) {
  return (
    <div className="text-4-12">
      <span className="heading">{section?.title}</span>
      {section?.listItems?.length ? (
        <ul className="info-list">
          {section.listItems.map((item, j) => (
            <li key={j}>
              {item?.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.text}
                </a>
              ) : (
                <span>{item?.text}</span>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function ContactSectionColumn({ section }: { section: Section }) {
  return (
    <div className="text-4-12 contact-col">
      <span className="heading">{section.title}</span>
      <div className="info-contact">
        {section.contactAddress && (
          <p>
            <a
              href="https://maps.app.goo.gl/iLnCGZA7umyqa8yq8"
              target="_blank"
              rel="noopener noreferrer"
            >
              {section.contactAddress.split('\n').map((line, k) => (
                <span key={k}>
                  {k > 0 && <br />}
                  {line}
                </span>
              ))}
            </a>
          </p>
        )}
        {section.contactEmails?.length ? (
          <p>
            {section.contactEmails.filter(Boolean).map((email, j) => (
              <span key={j}>
                <a href={`mailto:${email?.replace(/\s/g, '')}?Subject=new%20biz`}>
                  {email}
                </a>
                <br />
              </span>
            ))}
          </p>
        ) : null}
        {section.contactLinks?.length ? (
          <div className="info-contact-links">
            {section.contactLinks.map((link, j) => (
              <div
                key={j}
                className={link?.header ? 'info-contact-link-group' : undefined}
              >
                {link?.header ? (
                  <>
                    <span className="info-contact-link-header">{link.header}</span>
                    <br />
                  </>
                ) : null}
                <a href={link?.url ?? '#'} target="_blank" rel="noopener noreferrer">
                  {link?.text}
                </a>
                <br />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ColumnsSectionBlock({ section }: { section: Section }) {
  return (
    <>
      <div className="text-12-12 sub-section-header">{section.title}</div>
      <div className="info-section-row">
        {section.columns?.map((col, j) => (
          <div key={j} className="text-4-12">
            <span className="heading">{col?.heading}</span>
            <ul className="info-list">
              {(col?.items ?? []).filter(Boolean).map((item, k) => (
                <li key={k}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  )
}

async function getInfoPage(): Promise<InfoPageData> {
  const data = await fetchSanity<InfoPageData>(infoPageQuery)
  if (data?.introParagraphs?.length || data?.sections?.length) {
    return data
  }
  return seedInfoPage
}

function resolveNewsSlide(slide: RawNewsSlide): NewsSlide | null {
  if (!slide?.mediaType) return null
  const mediaType = slide.mediaType as NewsSlide['mediaType']
  const layout = slide.layout === 'contain' ? 'contain' : 'fullBleed'
  return {
    layout,
    mediaType,
    imageUrl: sanityImageServeUrl(slide.image ?? null, slide.imageUrl ?? null),
    videoUrl: slide.videoUrl ?? null,
    lottieUrl: slide.lottieUrl ?? null,
    animatedSvgUrl: slide.animatedSvgUrl ?? null,
    caption: slide.caption ?? null,
    containPadding: slide.containPadding ?? '0',
    backgroundColor: slide.backgroundColor ?? '#000000',
    backgroundVideoUrl: slide.backgroundVideoUrl ?? null,
  }
}

function resolveNewsRows(
  newsSection: NonNullable<InfoPageData>['newsSection']
): NewsRowProps[] {
  if (!newsSection?.rows?.length) return []

  return newsSection.rows
    .map((row) => {
      const layout = row.layout === 'half' ? 'half' : 'full'
      const posts = (row.posts ?? [])
        .map((post) => {
          const slides = (post.slides ?? [])
            .map(resolveNewsSlide)
            .filter((s): s is NewsSlide => s != null)
          if (!slides.length || !post.publishedAt || !hasPortableText(post.description)) return null
          return {
            aspectRatio: (post.aspectRatio === '4:3' ? '3:4' : post.aspectRatio ?? 'native') as
              | 'native'
              | 'square'
              | '3:4',
            limitViewportHeight: post.limitViewportHeight ?? false,
            sidePadding: post.sidePadding ?? false,
            slides,
            publishedAt: post.publishedAt,
            description: post.description,
          }
        })
        .filter((p): p is NonNullable<typeof p> => p != null)

      if (layout === 'half' && (posts.length < 1 || posts.length > 2)) return null
      if (layout === 'full' && posts.length !== 1) return null
      return { layout: layout as 'full' | 'half', posts }
    })
    .filter((r): r is NewsRowProps => r != null)
}

export default async function InfoPage() {
  const page = await getInfoPage()
  const introParagraphs = page?.introParagraphs ?? []
  const sections = page?.sections ?? []
  const blocks = buildInfoBlocks(sections)
  const newsRows = resolveNewsRows(page?.newsSection)

  return (
    <>
      <div className="info type-primary">
        <div className="info-section-row">
          <div className="text-12-12">
          {introParagraphs.map((p, i) => {
            const content = p?.content
            if (!content?.length) return null
            return (
              <div
                key={i}
                className={`info-intro-para ${i > 0 ? 'info-intro-para-indent' : ''}`}
              >
                <PortableText
                  value={content}
                  components={{
                    block: {
                      normal: ({ children }) => <p>{children}</p>,
                    },
                    marks: {
                      link: ({ value, children }) => (
                        <a
                          href={value?.href}
                          target={value?.blank ? '_blank' : undefined}
                          rel={value?.blank ? 'noopener noreferrer' : undefined}
                        >
                          {children}
                        </a>
                      ),
                    },
                  }}
                />
              </div>
            )
          })}
        </div>
        </div>

        {blocks.map((block, i) => {
        if (block.kind === 'list-row') {
          return (
            <div key={i} className="info-section-row">
              {block.sections.map((section, j) => (
                <ListSectionColumn key={j} section={section} />
              ))}
              {block.contact ? <ContactSectionColumn section={block.contact} /> : null}
            </div>
          )
        }

        return <ColumnsSectionBlock key={i} section={block.section} />
        })}

        <InfoPageFooter />
      </div>

      {newsRows.length > 0 && (
        <InfoNewsZone>
          <NewsSection title={page?.newsSection?.title} rows={newsRows} />
        </InfoNewsZone>
      )}
    </>
  )
}
