import { groq } from "next-sanity";

export const allCategoriesQuery = groq`*[_type == "category"] | order(sortOrder asc, title asc){
  _id,
  title,
  "slug": slug.current
}`;

export const indexProjectsQuery = groq`*[_type == "project"] | order(year desc, title asc){
  _id,
  title,
  "slug": slug.current,
  "categories": categories[]->{ _id, title, "slug": slug.current },
  year
}`;

export const allProjectsWithSlidesQuery = groq`*[_type == "project"] | order(_createdAt asc){
  _id,
  title,
  "slug": slug.current,
  description,
  textTheme,
  textThemeCustomColor,
  slides[]{
    layout,
    mediaType,
    image,
    imageUrl,
    videoUrl,
    caption,
    containPadding,
    backgroundColor,
    textTheme,
    textThemeCustomColor,
    "items": items[]{
      mediaType,
      image,
      imageUrl,
      videoUrl,
      fit,
      containPadding
    }
  }
}`;

export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]`;

export const infoPageQuery = groq`*[_type == "infoPage" && _id == "info-page"][0]{
  introParagraphs[]{
    content
  },
  sections[]{
    title,
    sectionType,
    listItems[]{
      text,
      url
    },
    contactAddress,
    contactEmails,
    contactLinks[]{
      header,
      text,
      url
    },
    columns[]{
      heading,
      items[]
    }
  }
}`;

