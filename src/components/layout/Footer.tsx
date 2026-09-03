import { Link } from 'react-router-dom'
import { ArrowUpRight, Mail } from 'lucide-react'
import logoImg from '@/assets/logo/streamly-logo.png'
import { genres } from '@/data/mock-movies'

const columns = [
  {
    title: 'Browse',
    links: [
      { label: 'All movies', to: '/movies' },
      { label: 'Top rated', to: '/movies?sort=rating' },
      { label: 'New releases', to: '/movies?sort=latest' },
      { label: 'Genres', to: '/genres' },
      { label: 'Search', to: '/search' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Discussions', to: '/movie/neon-horizon#comments' },
      { label: 'Reactions', to: '/movies?sort=rating' },
      { label: 'Report content', to: '/admin/reports' },
      { label: 'Moderators', to: '/admin/comments' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Streamly', to: '/' },
      { label: 'Careers', to: '/' },
      { label: 'Press kit', to: '/' },
      { label: 'Privacy', to: '/' },
      { label: 'Terms', to: '/' },
    ],
  },
]

/** Brand marks are inlined — lucide ships no social logos. */
const socials = [
  {
    label: 'X',
    href: 'https://x.com',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
  {
    label: 'GitHub',
    href: 'https://github.com',
    path: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-streamly-border bg-streamly-black">
      {/* Ambient glow */}
      <div className="aurora -top-40 left-1/2 h-72 w-[60rem] -translate-x-1/2 bg-streamly-purple/12" />
      <div className="gradient-rule absolute inset-x-0 top-0" aria-hidden="true" />

      <div className="relative mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10">
        {/* Top CTA */}
        <div className="mb-16 flex flex-col items-start justify-between gap-6 rounded-card border border-streamly-border bg-gradient-to-br from-streamly-purple/12 via-streamly-card/60 to-streamly-blue/8 p-6 sm:p-8 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-streamly-purple/25 to-streamly-blue/20 text-streamly-purple ring-1 ring-white/10">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-streamly-text">
                Never miss a release
              </h3>
              <p className="mt-1 max-w-md text-sm text-streamly-text-secondary">
                One email a week. New arrivals, hidden gems and the occasional deep dive. No spam, ever.
              </p>
            </div>
          </div>

          <form
            className="flex w-full max-w-md items-center gap-2 lg:w-auto"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="relative flex-1">
              <input
                type="email"
                required
                placeholder="you@example.com"
                aria-label="Email address"
                className="h-12 w-full rounded-button border border-streamly-border bg-black/40 pl-4 pr-4 text-sm text-streamly-text placeholder:text-streamly-text-muted focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/25"
              />
            </div>
            <button type="submit" className="btn-primary h-12 shrink-0 px-5 text-sm">
              Subscribe
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Main grid */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:pr-6">
            <Link to="/" className="inline-block" aria-label="Streamly home">
              <img src={logoImg} alt="Streamly" className="h-8 w-auto object-contain" />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-streamly-text-secondary">
              A cinematic home for the films you love. Discover, stream and download in
              studio-grade quality — from anywhere, on anything.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {socials.map(({ label, href, path }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-streamly-border bg-white/3 text-streamly-text-secondary transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-streamly-purple/50 hover:bg-streamly-purple/15 hover:text-streamly-text"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((column) => (
            <div key={column.title}>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-streamly-text">
                {column.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="group inline-flex items-center gap-1 text-sm text-streamly-text-secondary transition-colors duration-300 hover:text-streamly-text"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-60" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Genre rail */}
        <div className="mt-14 border-t border-streamly-border pt-8">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-streamly-text-muted">
            Explore genres
          </p>
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
            {genres.map((genre) => (
              <Link
                key={genre.id}
                to={`/genre/${genre.slug}`}
                className="group flex shrink-0 items-center gap-2 rounded-full border border-streamly-border bg-white/3 px-3.5 py-2 text-[13px] font-medium text-streamly-text-secondary transition-all duration-300 hover:-translate-y-0.5 hover:border-streamly-purple/50 hover:text-streamly-text"
                style={{ ['--tw-shadow-color' as string]: genre.color }}
              >
                <span aria-hidden="true">{genre.icon}</span>
                {genre.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-streamly-border pt-8 sm:flex-row">
          <p className="text-xs text-streamly-text-muted">
            © {year} Streamly. Built for people who stay for the credits.
          </p>
          <div className="flex items-center gap-6 text-xs text-streamly-text-muted">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-streamly-success" />
              All systems operational
            </span>
            <span className="hidden sm:inline">Made with care</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
