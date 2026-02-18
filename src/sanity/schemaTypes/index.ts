import { type SchemaTypeDefinition } from 'sanity'
import { categoryType } from './category'
import { infoPageType } from './infoPage'
import { infoSectionObject } from './infoSection'
import { projectType } from './project'
import { slideObject } from './slide'
import { twoUpItemObject } from './twoUpItem'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [categoryType, projectType, slideObject, twoUpItemObject, infoSectionObject, infoPageType],
}
