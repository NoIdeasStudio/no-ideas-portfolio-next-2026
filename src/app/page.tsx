import { HomepageInfiniteLoop } from '../components/HomepageInfiniteLoop'
import { ScrollToHash } from '../components/ScrollToHash'
import { SplashOverlay } from '../components/SplashOverlay'
import { getHomepageOrder, getVisibleBooks } from '../lib/books'
import { getAllProjects } from '../lib/projects'

// Revalidate so Sanity changes (e.g. background color) show up without a full rebuild
export const revalidate = 60

export default async function HomePage() {
  const [projects, books, homepageOrder] = await Promise.all([
    getAllProjects(),
    getVisibleBooks(),
    getHomepageOrder(),
  ])

  return (
    <div id="homepage">
      <SplashOverlay />
      <ScrollToHash />
      <HomepageInfiniteLoop
        projects={projects}
        books={books}
        homepageOrder={homepageOrder}
      />
    </div>
  )
}
