import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      // Let the page paint before jumping to an anchor (#comments).
      const target = document.querySelector(hash)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, search, hash])

  return null
}

export function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="relative flex min-h-screen flex-col bg-streamly-black">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-streamly-purple focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <ScrollToTop />
      <Navbar />

      <main id="main" className="flex-1" key={pathname}>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default Layout
