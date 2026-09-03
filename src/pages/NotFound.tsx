import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Clapperboard, Home, Search } from 'lucide-react'

export function NotFound() {
  const { pathname } = useLocation()

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-32">
      <div className="aurora left-1/2 top-1/4 h-80 w-80 -translate-x-1/2 bg-streamly-purple/20" />
      <div className="aurora bottom-0 right-1/4 h-72 w-72 bg-streamly-cyan/12" />
      <div className="film-grain absolute inset-0" />

      <div className="relative max-w-lg text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-streamly-border bg-white/3 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-streamly-text-secondary">
          <Clapperboard className="h-3.5 w-3.5 text-streamly-purple" />
          Error 404
        </span>

        <p className="mt-8 select-none text-[110px] font-black leading-none tracking-tighter sm:text-[150px]">
          <span className="gradient-text animate-gradient-x">404</span>
        </p>

        <h1 className="mt-2 text-2xl font-black tracking-tight text-streamly-text sm:text-3xl">
          This reel ran out
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-streamly-text-secondary">
          We could not find{' '}
          <code className="rounded bg-white/8 px-1.5 py-0.5 text-[13px] text-streamly-text">
            {pathname}
          </code>
          . It may have been moved, or the link went looking for popcorn.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="btn-primary h-12 px-6 text-sm">
            <Home className="h-4 w-4" />
            Back home
          </Link>
          <Link to="/search" className="btn-secondary h-12 px-6 text-sm">
            <Search className="h-4 w-4" />
            Search the library
          </Link>
        </div>

        <Link
          to="/movies"
          className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-streamly-text-muted transition-colors hover:text-streamly-text"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Or browse all movies
        </Link>
      </div>
    </div>
  )
}

export default NotFound
