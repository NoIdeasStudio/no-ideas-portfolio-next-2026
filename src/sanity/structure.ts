import {CogIcon} from '@sanity/icons'
import type {StructureResolver} from 'sanity/structure'

const EXCLUDED_FROM_AUTO_LIST = [
  'siteSettings',
  'siteLayout',
  'infoPage',
  'project',
  'category',
] as const

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('site-settings')
            .title('Site Settings'),
        ),
      S.listItem()
        .title('Site Layout')
        .child(
          S.document()
            .schemaType('siteLayout')
            .documentId('site-layout')
            .title('Site Layout'),
        ),
      S.divider(),
      S.listItem()
        .title('Projects')
        .child(S.documentTypeList('project').title('Projects')),
      S.listItem()
        .title('Info Page')
        .child(S.document().schemaType('infoPage').documentId('info-page')),
      S.listItem()
        .title('Categories')
        .child(S.documentTypeList('category').title('Categories')),
      ...S.documentTypeListItems().filter(
        (item) =>
          !EXCLUDED_FROM_AUTO_LIST.includes(
            item.getId() as (typeof EXCLUDED_FROM_AUTO_LIST)[number],
          ),
      ),
    ])
