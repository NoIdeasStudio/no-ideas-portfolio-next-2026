import { defineArrayMember, defineField, defineType } from 'sanity'

/** One block of content: a list, contact block, or column group. */
export const infoSectionObject = defineType({
  name: 'infoSection',
  type: 'object',
  title: 'Section',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Section title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sectionType',
      type: 'string',
      title: 'Section type',
      options: {
        list: [
          { title: 'List (e.g. Services, Press)', value: 'list' },
          { title: 'Contact (address, emails, links)', value: 'contact' },
          { title: 'Columns (e.g. Select Clients)', value: 'columns' },
        ],
        layout: 'radio',
      },
      initialValue: 'list',
      validation: (Rule) => Rule.required(),
    }),
    // --- List (Services, Press) ---
    defineField({
      name: 'listItems',
      type: 'array',
      title: 'List items',
      hidden: ({ parent }) => parent?.sectionType !== 'list',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'listItem',
          fields: [
            { name: 'text', type: 'string', title: 'Text', validation: (Rule) => Rule.required() },
            { name: 'url', type: 'url', title: 'URL (optional)' },
          ],
          preview: {
            select: { text: 'text' },
            prepare({ text }) {
              return { title: text || 'Item' }
            },
          },
        }),
      ],
    }),
    // --- Contact ---
    defineField({
      name: 'contactAddress',
      type: 'text',
      title: 'Address',
      rows: 2,
      hidden: ({ parent }) => parent?.sectionType !== 'contact',
    }),
    defineField({
      name: 'contactEmails',
      type: 'array',
      title: 'Email lines',
      hidden: ({ parent }) => parent?.sectionType !== 'contact',
      of: [{ type: 'string' }],
      description: 'One string per line (e.g. info@noideas.biz)',
    }),
    defineField({
      name: 'contactLinks',
      type: 'array',
      title: 'Links',
      hidden: ({ parent }) => parent?.sectionType !== 'contact',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'contactLink',
          fields: [
            {
              name: 'header',
              type: 'string',
              title: 'Header (optional)',
              description: 'Label shown above the link (e.g. "Publishing" above "Book Ideas"). Adds spacing above this item.',
            },
            { name: 'text', type: 'string', title: 'Label', validation: (Rule) => Rule.required() },
            { name: 'url', type: 'url', title: 'URL', validation: (Rule) => Rule.required() },
          ],
          preview: {
            select: { text: 'text', header: 'header' },
            prepare({ text, header }) {
              return { title: header ? `${header} → ${text || 'Link'}` : text || 'Link' }
            },
          },
        }),
      ],
    }),
    // --- Columns (e.g. Select Clients) ---
    defineField({
      name: 'columns',
      type: 'array',
      title: 'Columns',
      hidden: ({ parent }) => parent?.sectionType !== 'columns',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'infoColumn',
          title: 'Column',
          fields: [
            { name: 'heading', type: 'string', title: 'Column heading' },
            {
              name: 'items',
              type: 'array',
              title: 'Items',
              of: [{ type: 'string' }],
            },
          ],
          preview: {
            select: { heading: 'heading' },
            prepare({ heading }) {
              return { title: heading || 'Column' }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', sectionType: 'sectionType' },
    prepare({ title, sectionType }) {
      return {
        title: title || 'Section',
        subtitle: sectionType === 'list' ? 'List' : sectionType === 'contact' ? 'Contact' : 'Columns',
      }
    },
  },
})
