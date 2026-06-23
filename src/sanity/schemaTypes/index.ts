import { type SchemaTypeDefinition } from 'sanity'
import { categoryType } from './category'
import { infoPageType } from './infoPage'
import { infoSectionObject } from './infoSection'
import { introParagraphObject } from './introParagraph'
import { projectType } from './project'
import { siteLayoutType } from './siteLayout'
import { slideObject } from './slide'
import { twoUpItemObject } from './twoUpItem'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    categoryType,
    projectType,
    siteLayoutType,
    slideObject,
    twoUpItemObject,
    introParagraphObject,
    infoSectionObject,
    infoPageType,
  ],
}
