import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Projects')
        .child(S.documentTypeList('project').title('Projects')),
      S.listItem()
        .title('Info Page')
        .child(S.document().schemaType('infoPage').documentId('info-page')),
      ...S.documentTypeListItems().filter(
        (item) =>
          item.getId() !== 'category' &&
          item.getId() !== 'project' &&
          item.getId() !== 'infoPage',
      ),
      S.listItem()
        .title('Categories')
        .child(S.documentTypeList('category').title('Categories')),
    ])
