import { groq } from "next-sanity";

/** Singleton: ordered project and category ids for homepage and projects page. */
export const siteLayoutQuery = groq`*[_type == "siteLayout" && _id == "site-layout"][0]{
  "projectOrderIds": projectOrder[]->._id,
  "categoryOrderIds": categoryOrder[]->._id
}`;

export const allCategoriesQuery = groq`*[_type == "category"]{
  _id,
  title,
  "slug": slug.current
}`;

export const indexProjectsQuery = groq`*[_type == "project"]{
  _id,
  title,
  "slug": slug.current,
  "categories": categories[]->{ _id, title, "slug": slug.current },
  year
}`;

export const allProjectsWithSlidesQuery = groq`*[_type == "project"]{
  _id,
  title,
  "slug": slug.current,
  description,
  extendedDescription,
  visitUrl,
  recognition,
  credits,
  "categories": categories[]->{ _id, title, "slug": slug.current },
  year,
  textTheme,
  textThemeCustomColor,
  slides[]{
    layout,
    mediaType,
    image {
      asset,
      crop,
      hotspot,
      "assetUrl": asset->url
    },
    imageUrl,
    "videoUrl": coalesce(videoFile.asset->url, videoUrl),
    "videoUrlWebm": select(hasTransparency == true => videoFileWebm.asset->url),
    "lottieUrl": lottieFile.asset->url,
    "animatedSvgUrl": coalesce(animatedSvgFile.asset->url, animatedSvgUrl),
    caption,
    containPadding,
    "twoUpSpacing": coalesce(twoUpSpacing, select(twoUpEqualGutter == true => "equalCentered", "default")),
    backgroundColor,
    "backgroundVideoUrl": coalesce(backgroundVideoFile.asset->url, backgroundVideoUrl),
    "backgroundVideoUrlWebm": select(backgroundHasTransparency == true => backgroundVideoFileWebm.asset->url),
    textTheme,
    textThemeCustomColor,
    "items": items[]{
      mediaType,
      image {
        asset,
        crop,
        hotspot,
        "assetUrl": asset->url
      },
      imageUrl,
      "videoUrl": coalesce(videoFile.asset->url, videoUrl),
      "videoUrlWebm": select(hasTransparency == true => videoFileWebm.asset->url),
      "lottieUrl": lottieFile.asset->url,
      "animatedSvgUrl": coalesce(animatedSvgFile.asset->url, animatedSvgUrl),
      "backgroundVideoUrl": coalesce(backgroundVideoFile.asset->url, backgroundVideoUrl),
      "backgroundVideoUrlWebm": select(backgroundHasTransparency == true => backgroundVideoFileWebm.asset->url),
      fit,
      containPadding
    }
  }
}`;

export const siteSettingsQuery = groq`*[_type == "siteSettings" && _id == "site-settings"][0]{
  title,
  siteUrl,
  googleAnalyticsId,
  favicon,
  appleTouchIcon,
  seo {
    "title": coalesce(title, ""),
    "description": coalesce(description, ""),
    image,
    noIndex
  }
}`;

const newsMediaFields = groq`{
  layout,
  containPadding,
  mediaType,
  image {
    asset,
    crop,
    hotspot,
    "assetUrl": asset->url
  },
  imageUrl,
  "videoUrl": coalesce(videoFile.asset->url, videoUrl),
  "videoUrlWebm": select(hasTransparency == true => videoFileWebm.asset->url),
  "lottieUrl": lottieFile.asset->url,
  "animatedSvgUrl": coalesce(animatedSvgFile.asset->url, animatedSvgUrl),
  caption,
  backgroundTransparent,
  backgroundColor,
  "backgroundVideoUrl": coalesce(backgroundVideoFile.asset->url, backgroundVideoUrl),
  "backgroundVideoUrlWebm": select(backgroundHasTransparency == true => backgroundVideoFileWebm.asset->url)
}`;

export const projectBySlugQuery = groq`*[_type == "project" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  description,
  extendedDescription,
  visitUrl,
  recognition,
  credits,
  "categories": categories[]->{ _id, title, "slug": slug.current },
  year,
  textTheme,
  textThemeCustomColor,
  _updatedAt,
  seo {
    "title": coalesce(title, ""),
    "description": coalesce(description, ""),
    image,
    noIndex
  },
  "seoImageFallback": slides[0].image,
  slides[]{
    layout,
    mediaType,
    image {
      asset,
      crop,
      hotspot,
      "assetUrl": asset->url
    },
    imageUrl,
    "videoUrl": coalesce(videoFile.asset->url, videoUrl),
    "videoUrlWebm": select(hasTransparency == true => videoFileWebm.asset->url),
    "lottieUrl": lottieFile.asset->url,
    "animatedSvgUrl": coalesce(animatedSvgFile.asset->url, animatedSvgUrl),
    caption,
    containPadding,
    "twoUpSpacing": coalesce(twoUpSpacing, select(twoUpEqualGutter == true => "equalCentered", "default")),
    backgroundColor,
    "backgroundVideoUrl": coalesce(backgroundVideoFile.asset->url, backgroundVideoUrl),
    "backgroundVideoUrlWebm": select(backgroundHasTransparency == true => backgroundVideoFileWebm.asset->url),
    textTheme,
    textThemeCustomColor,
    "items": items[]{
      mediaType,
      image {
        asset,
        crop,
        hotspot,
        "assetUrl": asset->url
      },
      imageUrl,
      "videoUrl": coalesce(videoFile.asset->url, videoUrl),
      "videoUrlWebm": select(hasTransparency == true => videoFileWebm.asset->url),
      "lottieUrl": lottieFile.asset->url,
      "animatedSvgUrl": coalesce(animatedSvgFile.asset->url, animatedSvgUrl),
      "backgroundVideoUrl": coalesce(backgroundVideoFile.asset->url, backgroundVideoUrl),
      "backgroundVideoUrlWebm": select(backgroundHasTransparency == true => backgroundVideoFileWebm.asset->url),
      fit,
      containPadding
    }
  }
}`;

export const projectSlugsForSitemapQuery = groq`*[_type == "project" && defined(slug.current) && seo.noIndex != true]{
  "slug": slug.current,
  "updatedAt": _updatedAt
}`;

export const infoPageSeoQuery = groq`*[_type == "infoPage" && _id == "info-page"][0]{
  seo {
    "title": coalesce(title, ""),
    "description": coalesce(description, ""),
    image,
    noIndex
  }
}`;

export const infoPageQuery = groq`*[_type == "infoPage" && _id == "info-page"][0]{
  seo {
    "title": coalesce(title, ""),
    "description": coalesce(description, ""),
    image,
    noIndex
  },
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
  },
  newsSection{
    title,
    rows[]{
      layout,
      posts[]{
        aspectRatio,
        limitViewportHeight,
        sidePadding,
        publishedAt,
        description,
        slides[]${newsMediaFields}
      }
    }
  }
}`;

