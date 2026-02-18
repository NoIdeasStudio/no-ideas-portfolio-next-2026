import { defineField, defineType } from "sanity";

export default defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96
      },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3
    }),
    defineField({
      name: "meta",
      title: "Meta (years, role, etc.)",
      type: "string"
    }),
    defineField({
      name: "externalLabel",
      title: "External Link Label",
      type: "string"
    }),
    defineField({
      name: "externalUrl",
      title: "External URL",
      type: "url"
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }]
    })
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "meta"
    }
  }
});

