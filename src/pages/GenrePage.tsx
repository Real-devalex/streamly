import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clapperboard, Loader2 } from 'lucide-react'
import { MovieGrid } from '@/components/movie/MovieGrid'
import { useDownload } from '@/context/DownloadContext'
import { fetchGenreBySlug, fetchMoviesByGenreSlug } from '@/lib/api'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Genre, Movie } from '@/types'

const blurbs: Record<string, string> = {
  action: 'Chases, detonations and one very tired stunt double.',
  adventure: 'Maps with edges, horizons with promises.',
  'sci-fi': 'Tomorrow, but make it rain-soaked and neon.',
  thriller: 'Hold your breath. Now hold it a little longer.',
  drama: 'People being extraordinary in ordinary rooms.',
  comedy: 'Timing is everything, and these have it.',
  horror: 'Lights off, volume up, regrets optional.',
  romance: 'Two people, one city, terrible timing.',
  animation: 'Every frame painted on purpose.',
  crime: 'Nobody here is a reliable narrator.',
  mystery: 'The answer was in the first ten minutes.',
  fantasy: 'Rules? Yes. Ours? No.',
}

export function GenrePage() {
  const { slug = '' } = useParams()
  const { openDownload } = useDownload()
  const [genre, setGenre] = useState<Genre | null>(null)
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [g, m] = await Promise.all([fetchGenreBySlug(slug), fetchMoviesByGenreSlug(slug)])
      if (!cancelled) {
        setGenre(g)
        setMovies(m)
        setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [slug])

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-streamly-purple" />
      </div>
    )
  }

  if (!genre) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-40 sm:px-6">
        <EmptyState
          icon={<Clapperboard className="h-7 w-7" />}
          title="Genre not found"
          message="That collection does not exist — yet."
          action={
            <Link to="/genres" className="btn-primary h-11 px-6 text-sm">
              Browse all genres
            </Link>
          }
        />
      </div>
    )
  }

  const topRated = [...movies].sort((a, b) => b.rating - a.rating)[0]

  return (
    <div className="pb-8">
      {/* Hero band */}
      <header className="relative overflow-hidden border-b border-streamly-border">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            backgroundImage: `radial-gradient(120% 120% at 10% 0%, ${genre.color}33 0%, transparent 55%), radial-gradient(90% 90% at 100% 100%, ${genre.color}1f 0%, transparent 60%)`,
          }}
        />
        <div className="aurora -bottom-40 left-1/3 h-72 w-72" style={{ backgroundColor: genre.color, opacity: 0.18 }} />
        <div className="hero-gradient-bottom absolute inset-0 opacity-60" />

        <div className="relative mx-auto max-w-[1600px] px-4 pb-12 pt-32 sm:px-6 sm:pb-14 lg:px-10">
          <Link
            to="/genres"
            className="group inline-flex items-center gap-2 text-xs font-semibold text-streamly-text-muted transition-colors hover:text-streamly-text"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
            All genres
          </Link>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div className="flex items-center gap-5">
              <span
                className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl border text-4xl shadow-[0_20px_50px_-20px_rgba(0,0,0,1)]"
                style={{ borderColor: `${genre.color}55`, backgroundColor: `${genre.color}1f` }}
              >
                {genre.icon}
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-streamly-text-muted">
                  Collection
                </p>
                <h1 className="mt-1.5 text-4xl font-black tracking-tight text-streamly-text sm:text-5xl">
                  {genre.name}
                </h1>
                <p className="mt-2 max-w-lg text-[15px] text-streamly-text-secondary">
                  {blurbs[genre.slug] ?? 'A hand-picked collection from the Streamly library.'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-center backdrop-blur-md">
                <p className="text-2xl font-black text-streamly-text">{movies.length}</p>
                <p className="text-[11px] uppercase tracking-wider text-streamly-text-muted">
                  Titles
                </p>
              </div>
              {topRated ? (
                <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-center backdrop-blur-md">
                  <p className="text-2xl font-black text-streamly-gold">
                    {topRated.rating.toFixed(1)}
                  </p>
                  <p className="text-[11px] uppercase tracking-wider text-streamly-text-muted">
                    Top rated
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Grid */}
      <section className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-10">
        <MovieGrid
          movies={movies}
          onDownload={openDownload}
          emptyTitle="This collection is still being curated"
          emptyMessage="Check back soon — new titles land every Friday."
        />
      </section>
    </div>
  )
}

export default GenrePage
