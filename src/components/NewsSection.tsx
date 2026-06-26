import { NewsPostSlideshow, type NewsPostProps } from './NewsPostSlideshow'

export type NewsRowProps = {
  layout: 'full' | 'half'
  posts: NewsPostProps[]
}

export type NewsSectionProps = {
  title?: string | null
  rows: NewsRowProps[]
}

export function NewsSection({ title = 'News', rows }: NewsSectionProps) {
  if (!rows.length) return null

  return (
    <section className="info-news type-secondary" aria-label={title ?? 'News'}>
      <h2 className="info-news-heading">{title}</h2>
      <div className="info-news-rows">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`info-news-row${row.layout === 'half' ? ' info-news-row--half' : ''}`}
          >
            {row.posts.map((post, j) => (
              <NewsPostSlideshow key={j} {...post} />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
