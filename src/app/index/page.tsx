import { sanityClient } from '../../lib/sanity.client'
import {
  allCategoriesQuery,
  indexProjectsQuery,
} from '../../lib/sanity.queries'
import {
  IndexPageClient,
  type IndexCategory,
  type IndexProject,
} from '../../components/IndexPageClient'

export const revalidate = 60

export const metadata = {
  title: 'Index — No Ideas',
  description: 'Index of projects by No Ideas.',
}

async function getIndexData(): Promise<{
  categories: IndexCategory[]
  projects: IndexProject[]
}> {
  const [categories, projects] = await Promise.all([
    sanityClient.fetch<IndexCategory[]>(allCategoriesQuery),
    sanityClient.fetch<IndexProject[]>(indexProjectsQuery),
  ])
  return {
    categories: categories ?? [],
    projects: projects ?? [],
  }
}

export default async function IndexPage() {
  const { categories, projects } = await getIndexData()

  return <IndexPageClient categories={categories} projects={projects} />
}
