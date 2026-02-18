/**
 * Fallback / seed content for the Info page when no Sanity document exists.
 * Matches structure from https://www.noideas.website/info
 */

/** Portable text block for intro paragraphs (rich text with optional links). */
function ptBlock(key: string, text: string, marks: string[] = []) {
  return {
    _type: 'block' as const,
    _key: key,
    style: 'normal' as const,
    children: [{ _type: 'span' as const, _key: `${key}-0`, text, marks }],
    markDefs: [],
  }
}

export const seedInfoPage = {
  introParagraphs: [
    {
      content: [
        ptBlock(
          'intro-1',
          "No Ideas is a graphic design studio in Brooklyn, New York. We create visual identities, websites, printed matter, editorial design, and art direction for commercial and cultural clients. Our goal is to thoughtfully engage with content as a driving force for both concept and form. Our publishing imprint, Book Ideas, released it's first publication DESIGN HARDER in 2025.\n\nNo Ideas is the design practice of Devin Washburn and Philip DiBello. We also teach design and typography at Parsons School of Design and the School of Visual Arts, respectively."
        ),
      ],
    },
  ],
  sections: [
    {
      title: 'Services',
      sectionType: 'list' as const,
      listItems: [
        { text: 'Creative Direction', url: null },
        { text: 'Art Direction', url: null },
        { text: 'Web Design', url: null },
        { text: 'Web Development', url: null },
        { text: 'Brand & Identity', url: null },
        { text: 'Brand Strategy', url: null },
        { text: 'Campaign Development', url: null },
        { text: 'Digital Design', url: null },
        { text: 'Book & Editorial Design', url: null },
        { text: 'Environment & Exhibition Design', url: null },
      ],
    },
    {
      title: 'Press',
      sectionType: 'list' as const,
      listItems: [
        { text: 'A--Z Radio', url: null },
        { text: 'The New York Times: Best Book Covers of 2023', url: null },
        { text: 'Graphic Support Group', url: null },
        { text: 'AIGA 50 Books 50 Covers, 2022', url: null },
        { text: 'Idea Magazine #391', url: null },
        { text: "It's Nice That (1)", url: null },
        { text: "It's Nice That (2)", url: null },
        { text: 'AIGA Eye on Design', url: null },
        { text: 'magCulture', url: null },
        { text: 'Print Magazine', url: null },
        { text: 'Siteinspire', url: null },
        { text: 'Hoverstates', url: null },
        { text: 'klikkentheke (1)', url: null },
        { text: 'klikkentheke (2)', url: null },
        { text: 'hallointer.net', url: null },
        { text: 'Typewolf', url: null },
        { text: 'The Responsive', url: null },
      ],
    },
    {
      title: 'Contact',
      sectionType: 'contact' as const,
      contactAddress: '20 Grand Ave #610\nBrooklyn, New York 11205',
      contactEmails: ['info@noideas.biz', 'jobs@noideas.biz', 'artsubmissions @noideas.biz'],
      contactLinks: [
        { text: 'Instagram', url: 'https://instagram.com' },
        { text: 'Twitter', url: 'https://twitter.com' },
        { text: 'Newsletter', url: '#' },
        { header: 'Publishing', text: 'Book Ideas', url: 'https://www.bookideas.website/' },
      ],
    },
    {
      title: 'Select Clients',
      sectionType: 'columns' as const,
      columns: [
        {
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
