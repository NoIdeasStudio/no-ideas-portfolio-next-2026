import { HomepageInfiniteLoop } from '../components/HomepageInfiniteLoop'
import { ScrollToHash } from '../components/ScrollToHash'
import { SplashOverlay } from '../components/SplashOverlay'
import { getAllProjects } from '../lib/projects'

// Revalidate so Sanity changes (e.g. background color) show up without a full rebuild
export const revalidate = 60

export default async function HomePage() {
  const projects = await getAllProjects()

  const themeObserverProjects = projects.map((p) => ({ slug: p.slug }))

  return (
    <div id="homepage">
      <SplashOverlay />
      <ScrollToHash />
      <HomepageInfiniteLoop
        projects={projects}
        themeObserverProjects={themeObserverProjects}
      />
    </div>
  )
}
