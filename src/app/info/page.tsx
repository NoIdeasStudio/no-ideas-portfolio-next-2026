import { PortableText } from 'next-sanity'
import type { PortableTextBlock } from '@portabletext/types'
import { sanityClient } from '../../lib/sanity.client'
import { infoPageQuery } from '../../lib/sanity.queries'
import { seedInfoPage } from '../../data/seed-info-page'

export const revalidate = 60

export const metadata = {
  title: 'Info — No Ideas',
  description: 'No Ideas is a graphic design studio in Brooklyn, New York.',
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
type InfoPageData = {
  introParagraphs?: IntroParagraph[] | null
  sections?: Section[] | null
} | null

async function getInfoPage(): Promise<InfoPageData> {
  const data = await sanityClient.fetch<InfoPageData>(infoPageQuery)
  if (data?.introParagraphs?.length || data?.sections?.length) {
    return data
  }
  return seedInfoPage
}

export default async function InfoPage() {
  const page = await getInfoPage()
  const introParagraphs = page?.introParagraphs ?? []
  const sections = page?.sections ?? []

  // Split sections into: intro row, then Services/Press/Contact row, then "Select Clients" + columns row
  const listSections = sections.filter((s) => s?.sectionType === 'list')
  const contactSection = sections.find((s) => s?.sectionType === 'contact')
  const columnsSection = sections.find((s) => s?.sectionType === 'columns')

  const firstRowListSections = listSections.slice(0, 2) // Services, Press
  const contactInFirstRow = contactSection
  const clientsSection = columnsSection

  return (
    <div className="info type-size-1">
      {/* Intro: full width, rich text with links; indent every paragraph except the first */}
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

      {/* Services, Press, Contact: three columns */}
      <div className="info-section-row">
        {firstRowListSections.map((section, i) => (
          <div key={i} className="text-4-12">
            <span className="heading">{section?.title}</span>
            {section?.listItems?.length ? (
              <ul className="info-list">
                {section.listItems.map((item, j) => (
                  <li key={j}>
                    {item?.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
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
        ))}
        {contactInFirstRow && (
          <div className="text-4-12 contact-col">
            <span className="heading">{contactInFirstRow.title}</span>
            <div className="info-contact">
              {contactInFirstRow.contactAddress && (
                <p>
                  <a
                    href="https://maps.app.goo.gl/iLnCGZA7umyqa8yq8"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {contactInFirstRow.contactAddress.split('\n').map((line, k) => (
                      <span key={k}>
                        {k > 0 && <br />}
                        {line}
                      </span>
                    ))}
                  </a>
                </p>
              )}
              {contactInFirstRow.contactEmails?.length ? (
                <p>
                  {contactInFirstRow.contactEmails.filter(Boolean).map((email, j) => (
                    <span key={j}>
                      <a href={`mailto:${email?.replace(/\s/g, '')}?Subject=new%20biz`}>
                        {email}
                      </a>
                      <br />
                    </span>
                  ))}
                </p>
              ) : null}
              {contactInFirstRow.contactLinks?.length ? (
                <div className="info-contact-links">
                  {contactInFirstRow.contactLinks.map((link, j) => (
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
                      <a
                        href={link?.url ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link?.text}
                      </a>
                      <br />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Select Clients: sub-section header + three columns */}
      {clientsSection && (
        <>
          <div className="text-12-12 sub-section-header">
            {clientsSection.title}
          </div>
          <div className="info-section-row">
            {clientsSection.columns?.map((col, j) => (
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
      )}
    </div>
  )
}
