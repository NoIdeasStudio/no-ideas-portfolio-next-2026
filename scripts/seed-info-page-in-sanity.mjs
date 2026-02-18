/**
 * Creates or replaces the Info page document in Sanity with seed content
 * matching https://www.noideas.website/info
 *
 * Run from project root:
 *   SANITY_API_TOKEN=your_write_token node scripts/seed-info-page-in-sanity.mjs
 */

import { createClient } from '@sanity/client'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

function loadEnv() {
  const path = resolve(process.cwd(), '.env.local')
  if (!existsSync(path)) return
  const content = readFileSync(path, 'utf8')
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
  }
}

loadEnv()

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN

if (!projectId || !token) {
  console.error('Need NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN in .env.local')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token,
})

const infoPageDoc = {
  _id: 'info-page',
  _type: 'infoPage',
  title: 'Info',
  introParagraphs: [
    {
      _type: 'introParagraph',
      _key: 'intro-1',
      content: [
        {
          _type: 'block',
          _key: 'b1',
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: 's1',
              text: "No Ideas is a graphic design studio in Brooklyn, New York. We create visual identities, websites, printed matter, editorial design, and art direction for commercial and cultural clients. Our goal is to thoughtfully engage with content as a driving force for both concept and form. Our publishing imprint, Book Ideas, released it's first publication DESIGN HARDER in 2025.\n\nNo Ideas is the design practice of Devin Washburn and Philip DiBello. We also teach design and typography at Parsons School of Design and the School of Visual Arts, respectively.",
              marks: [],
            },
          ],
          markDefs: [],
        },
      ],
    },
  ],
  sections: [
    {
      _type: 'infoSection',
      _key: 'services',
      title: 'Services',
      sectionType: 'list',
      listItems: [
        { _type: 'listItem', _key: 's1', text: 'Creative Direction' },
        { _type: 'listItem', _key: 's2', text: 'Art Direction' },
        { _type: 'listItem', _key: 's3', text: 'Web Design' },
        { _type: 'listItem', _key: 's4', text: 'Web Development' },
        { _type: 'listItem', _key: 's5', text: 'Brand & Identity' },
        { _type: 'listItem', _key: 's6', text: 'Brand Strategy' },
        { _type: 'listItem', _key: 's7', text: 'Campaign Development' },
        { _type: 'listItem', _key: 's8', text: 'Digital Design' },
        { _type: 'listItem', _key: 's9', text: 'Book & Editorial Design' },
        { _type: 'listItem', _key: 's10', text: 'Environment & Exhibition Design' },
      ],
    },
    {
      _type: 'infoSection',
      _key: 'press',
      title: 'Press',
      sectionType: 'list',
      listItems: [
        { _type: 'listItem', _key: 'p1', text: 'A--Z Radio', url: 'https://www.nytimes.com/2023/12/08/books/review/best-book-covers-2023.html' },
        { _type: 'listItem', _key: 'p2', text: 'The New York Times: Best Book Covers of 2023', url: 'https://www.nytimes.com/2023/12/08/books/review/best-book-covers-2023.html' },
        { _type: 'listItem', _key: 'p3', text: 'Graphic Support Group', url: 'https://open.spotify.com/episode/3sNLumJSu5ArX43rNGMnAQ?si=d662b807c89f4e8b&nd=1' },
        { _type: 'listItem', _key: 'p4', text: 'AIGA 50 Books 50 Covers, 2022', url: 'https://50books50covers.secure-platform.com/a/gallery/rounds/310/details/60946' },
        { _type: 'listItem', _key: 'p5', text: 'Idea Magazine #391', url: 'http://www.idea-mag.com/en/idea_magazine/391/' },
        { _type: 'listItem', _key: 'p6', text: "It's Nice That (1)", url: 'https://www.itsnicethat.com/articles/no-ideas-american-chordata-publication-graphic-design-300819' },
        { _type: 'listItem', _key: 'p7', text: "It's Nice That (2)", url: 'https://www.itsnicethat.com/news/wiedenkennedy-the-community-spirit-branding-graphic-design-020222' },
        { _type: 'listItem', _key: 'p8', text: 'AIGA Eye on Design', url: 'https://eyeondesign.aiga.org/the-endless-life-cycle-of-book-cover-trends/' },
        { _type: 'listItem', _key: 'p9', text: 'magCulture', url: 'https://magculture.com/blogs/journal/the-baffler-56' },
        { _type: 'listItem', _key: 'p10', text: 'Print Magazine', url: 'https://www.printmag.com/brand-of-the-day/shaking-up-the-sommelier-branding/' },
        { _type: 'listItem', _key: 'p11', text: 'Siteinspire', url: 'https://www.siteinspire.com/directory/7413-no-ideas' },
        { _type: 'listItem', _key: 'p12', text: 'Hoverstates', url: 'https://www.hoverstat.es/features/devin-washburn/' },
        { _type: 'listItem', _key: 'p13', text: 'klikkentheke (1)', url: 'https://klikkentheke.com/catalogue/sesamy/' },
        { _type: 'listItem', _key: 'p14', text: 'klikkentheke (2)', url: 'https://klikkentheke.com/catalogue/the-kaplans/' },
        { _type: 'listItem', _key: 'p15', text: 'hallointer.net', url: 'https://hallointer.net/' },
        { _type: 'listItem', _key: 'p16', text: 'Typewolf', url: 'https://www.typewolf.com/site-of-the-day/sackville' },
        { _type: 'listItem', _key: 'p17', text: 'The Responsive', url: 'https://the-responsive.com/chef-rory/' },
      ],
    },
    {
      _type: 'infoSection',
      _key: 'contact',
      title: 'Contact',
      sectionType: 'contact',
      contactAddress: '20 Grand Ave #610\nBrooklyn, New York 11205',
      contactEmails: ['info@noideas.biz', 'jobs@noideas.biz', 'artsubmissions @noideas.biz'],
      contactLinks: [
        { _type: 'contactLink', _key: 'c1', text: 'Instagram', url: 'https://instagram.com' },
        { _type: 'contactLink', _key: 'c2', text: 'Twitter', url: 'https://twitter.com' },
        { _type: 'contactLink', _key: 'c3', text: 'Newsletter', url: '#' },
        { _type: 'contactLink', _key: 'c4', header: 'Publishing', text: 'Book Ideas', url: 'https://www.bookideas.website/' },
      ],
    },
    {
      _type: 'infoSection',
      _key: 'clients',
      title: 'Select Clients',
      sectionType: 'columns',
      columns: [
        {
          _type: 'infoColumn',
          _key: 'col1',
          heading: 'Arts & Culture',
          items: [
            'The Baffler',
            'Verso Books',
            'Art in Dumbo',
            'Artadia',
            'The New School',
            'Saint-Gaudens Memorial',
            'Frere-Jones Type',
            'Mighty Oak',
            'Serengeti',
            'American Chordata',
            'Zach Vitale',
            'Wieden+Kennedy',
          ],
        },
        {
          _type: 'infoColumn',
          _key: 'col2',
          heading: 'Retail',
          items: [
            'Sackville & Co.',
            'Widow Jane',
            "Morgenstern's",
            'Polly Wales',
            'SommSelect',
            'The Community Spirit',
          ],
        },
        {
          _type: 'infoColumn',
          _key: 'col3',
          heading: 'Media',
          items: [
            'Figma',
            'The New York Times',
            'Buzzfeed',
            'Stripe Press',
            'Eater',
            'Vespucci',
            'Complex',
            'Penguin',
            'Random House',
            'FSG',
            'Abrams Books',
            'Astra House',
            'Sesamy Agency',
          ],
        },
      ],
    },
  ],
}

async function run() {
  // Write to both draft and published so Studio has an editable draft and the site has content.
  const draftDoc = { ...infoPageDoc, _id: 'drafts.info-page' }
  const publishedDoc = { ...infoPageDoc, _id: 'info-page' }
  await client.createOrReplace(draftDoc)
  await client.createOrReplace(publishedDoc)
  console.log('Info page: draft (drafts.info-page) and published (info-page) created/updated.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
