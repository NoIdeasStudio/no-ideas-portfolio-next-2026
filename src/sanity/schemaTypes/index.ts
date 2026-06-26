import { type SchemaTypeDefinition } from 'sanity'
import { categoryType } from './category'
import { infoPageType } from './infoPage'
import { infoSectionObject } from './infoSection'
import { introParagraphObject } from './introParagraph'
import { newsMediaItemObject } from './newsMediaItem'
import { newsPostObject } from './newsPost'
import { newsRowObject } from './newsRow'
import { projectType } from './project'
import { seoType } from './seoType'
import { siteLayoutType } from './siteLayout'
import { siteSettingsType } from './siteSettings'
import { slideObject } from './slide'
import { twoUpItemObject } from './twoUpItem'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    seoType,
    siteSettingsType,
    categoryType,
    projectType,
    siteLayoutType,
    slideObject,
    twoUpItemObject,
    introParagraphObject,
    infoSectionObject,
    newsMediaItemObject,
    newsPostObject,
    newsRowObject,
    infoPageType,
  ],
}
