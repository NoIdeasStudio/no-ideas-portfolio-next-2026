import { defineField, defineType } from 'sanity'

/** Reusable SEO fields for site-wide defaults and per-page overrides. */
export const seoType = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Meta title',
      type: 'string',
      description:
        'Overrides the default title for search results and social shares. Keep under 60 characters.',
      validation: (Rule) => Rule.max(70).warning('Titles longer than 60 characters may be truncated in search results.'),
    }),
    defineField({
      name: 'description',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      description:
        'Short summary for Google and social previews. Aim for 150–160 characters.',
      validation: (Rule) =>
        Rule.max(200).warning('Descriptions longer than 160 characters may be truncated in search results.'),
    }),
    defineField({
      name: 'image',
      title: 'Social share image',
      type: 'image',
      description: 'Shown when this page is shared. Recommended size: 1200×630 px.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      description: 'When enabled, search engines are asked not to index this page.',
      initialValue: false,
    }),
  ],
})
