import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Compass, Loader2 } from 'lucide-react'
import { fetchGenres, fetchMoviesByGenreSlug } from '@/lib/api'
import { cn } from '@/utils/helpers'
import type { Genre, Movie } from '@/types'

export function Genres() {
  const [genres, setGenres] = useState<Genre[]>([])
  const [genreMovies, setGenreMovies] = useState<Record<string, Movie[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const g = await fetchGenres()
      setGenres(g)
      const movieMap: Record<string, Movie[]> = {}
      await Promise.all(
        g.map(async (genre) => { movieMap[genre.slug] = await fetchMoviesByGenreSlug(genre.slug) })
      )
      setGenreMovies(movieMap)
      setLoading(false)
    }
    void load()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-streamly-purple" />
      </div>
    )
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-streamly-border">
        <div className="aurora -top-40 left-1/4 h-80 w-80 bg-streamly-purple/20" />
        <div className="aurora -bottom-32 right-1/4 h-80 w-80 bg-streamly-cyan/12" />

        <div className="relative mx-auto max-w-4xl px-4 pb-14 pt-44 text-center sm:px-6 sm:pt-52">
          <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-streamly-purple">
            <Compass className="h-3.5 w-3.5 text-streamly-cyan" />
            {genres.length} collections
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-streamly-text sm:text-5xl">
            Every mood has a <span className="gradient-text">genre</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-streamly-text-secondary">
            From rain-soaked sci-fi to hand-painted animation. Pick a door and let the algorithm
            take the night off.
          </p>
        </div>
      </header>

      {/* Grid */}
      <section className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="stagger-children grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {genres.map((genre) => {
            const titles = genreMovies[genre.slug] ?? []
            return (
              <Link
                key={genre.id}
                to={`/genre/${genre.slug}`}
                className="group relative overflow-hidden rounded-card border border-streamly-border bg-streamly-card p-6 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2"
              >
                {/* Colour wash */}
                <span
                  className="absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    backgroundImage: `radial-gradient(130% 110% at 0% 0%, ${genre.color}26 0%, transparent 62%)`,
                  }}
                />
                <span
                  className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-25 blur-3xl transition-opacity duration-500 group-hover:opacity-50"
                  style={{ backgroundColor: genre.color }}
                />

                <div className="relative flex items-start justify-between">
                  <span
                    className="grid h-14 w-14 place-items-center rounded-2xl border text-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                    style={{
                      borderColor: `${genre.color}55`,
                      backgroundColor: `${genre.color}1a`,
                    }}
                  >
                    {genre.icon}
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] font-semibold text-streamly-text-secondary">
                    {titles.length} {titles.length === 1 ? 'title' : 'titles'}
                  </span>
                </div>

                <h2 className="relative mt-6 text-2xl font-bold tracking-tight text-streamly-text">
                  {genre.name}
                </h2>

                {/* Poster stack */}
                <div className="relative mt-5 flex items-center">
                  <div className="flex -space-x-4">
                    {titles.slice(0, 3).map((movie, index) => (
                      <div
                        key={movie.id}
                        className={cn(
                          'h-20 w-14 overflow-hidden rounded-lg border border-white/12 bg-streamly-surface shadow-[0_10px_24px_-12px_rgba(0,0,0,1)]',
                          'transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1',
                        )}
                        style={{
                          zIndex: 3 - index,
                          rotate: `${(index - 1) * 4}deg`,
                          transitionDelay: `${index * 60}ms`,
                        }}
                      >
                        <img
                          src={movie.posterUrl}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                    {titles.length === 0 ? (
                      <div className="h-20 w-14 rounded-lg border border-dashed border-streamly-border-light" />
                    ) : null}
                  </div>

                  <span
                    className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold transition-transform duration-300 group-hover:translate-x-1"
                    style={{ color: genre.color }}
                  >
                    Explore
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>

                <span
                  className="absolute inset-x-0 bottom-0 h-px scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  style={{ background: `linear-gradient(90deg, transparent, ${genre.color}, transparent)` }}
                />
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default Genres
