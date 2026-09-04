import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Film, Heart } from 'lucide-react'
import { MovieGrid } from '@/components/movie/MovieGrid'
import { useDownload } from '@/context/DownloadContext'
import { useAuth } from '@/context/AuthContext'
import { fetchWatchlist } from '@/lib/api'
import type { Movie } from '@/types'

export function Watchlist() {
  const { user } = useAuth()
  const { openDownload } = useDownload()
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    let cancelled = false
    void fetchWatchlist(user.id).then((data) => {
      if (!cancelled) { setMovies(data); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [user])

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-44 pb-24 text-center sm:px-6 sm:pt-52">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-streamly-purple/15 text-streamly-purple">
          <Bookmark className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-streamly-text">Your watchlist</h1>
        <p className="mt-2 text-sm text-streamly-text-secondary">
          Sign in to save movies you want to watch later.
        </p>
        <Link to="/auth/signin" className="btn-primary mt-6 inline-flex h-11 items-center gap-2 px-6 text-sm">
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="pb-8">
      <header className="relative overflow-hidden border-b border-streamly-border">
        <div className="aurora -top-40 left-1/2 h-80 w-80 bg-streamly-purple/18" />
        <div className="relative mx-auto max-w-[1600px] px-4 pb-10 pt-44 sm:px-6 sm:pt-52 lg:px-10">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-streamly-purple">
            <Heart className="h-3.5 w-3.5 fill-current text-streamly-cyan" />
            Your collection
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-streamly-text sm:text-4xl">
            Watchlist
          </h1>
          <p className="mt-2 text-sm text-streamly-text-secondary">
            {loading ? 'Loading...' : `${movies.length} ${movies.length === 1 ? 'movie' : 'movies'} saved`}
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-streamly-purple border-t-transparent" />
          </div>
        ) : movies.length > 0 ? (
          <MovieGrid movies={movies} onDownload={openDownload} />
        ) : (
          <div className="py-20 text-center">
            <Film className="mx-auto h-10 w-10 text-streamly-text-muted" />
            <p className="mt-4 text-sm text-streamly-text-secondary">
              Your watchlist is empty. Browse movies and tap the bookmark icon to save them here.
            </p>
            <Link to="/movies" className="btn-primary mt-4 inline-flex h-11 items-center gap-2 px-6 text-sm">
              Browse movies
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}

export default Watchlist
