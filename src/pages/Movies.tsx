import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Film, ListFilter, Loader2, SlidersHorizontal } from 'lucide-react'
import { MovieGrid } from '@/components/movie/MovieGrid'
import { useDownload } from '@/context/DownloadContext'
import { fetchMovies, fetchGenres } from '@/lib/api'
import { cn } from '@/utils/helpers'
import type { Movie, Genre } from '@/types'

type SortKey = 'latest' | 'rating' | 'title' | 'year'

const sorts: Array<{ key: SortKey; label: string }> = [
  { key: 'latest', label: 'Newest first' },
  { key: 'rating', label: 'Highest rated' },
  { key: 'title', label: 'A → Z' },
  { key: 'year', label: 'Release year' },
]

export function Movies() {
  const [params, setParams] = useSearchParams()
  const { openDownload } = useDownload()
  const [allMovies, setAllMovies] = useState<Movie[]>([])
  const [genreList, setGenreList] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)

  const sort = (params.get('sort') as SortKey | null) ?? 'latest'
  const activeGenre = params.get('genre')

  useEffect(() => {
    async function load() {
      const [movies, genres] = await Promise.all([fetchMovies(), fetchGenres()])
      setAllMovies(movies)
      setGenreList(genres)
      setLoading(false)
    }
    void load()
  }, [])

  const filtered = useMemo(() => {
    let list: Movie[] = [...allMovies]
    if (activeGenre) {
      list = list.filter((movie) => movie.genres.some((genre) => genre.slug === activeGenre))
    }
    switch (sort) {
      case 'rating':
        list.sort((a, b) => b.rating - a.rating)
        break
      case 'title':
        list.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'year':
        list.sort((a, b) => b.releaseYear - a.releaseYear || b.rating - a.rating)
        break
      default:
        list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
    }
    return list
  }, [sort, activeGenre, allMovies])

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

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
        <div className="aurora -top-32 left-1/4 h-72 w-72 bg-streamly-purple/20" />
        <div className="aurora -bottom-24 right-1/4 h-72 w-72 bg-streamly-cyan/12" />

        <div className="relative mx-auto max-w-[1600px] px-4 pb-10 pt-32 sm:px-6 sm:pb-12 lg:px-10">
          <div className="flex animate-fade-up items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-streamly-purple">
            <Film className="h-3.5 w-3.5 text-streamly-cyan" />
            The library
          </div>
          <h1 className="mt-3 animate-fade-up text-4xl font-black tracking-tight text-streamly-text sm:text-5xl">
            All <span className="gradient-text">movies</span>
          </h1>
          <p className="mt-3 max-w-xl animate-fade-up text-[15px] leading-relaxed text-streamly-text-secondary">
            {allMovies.length} hand-picked titles, remastered and ready to download in up to Full HD.
          </p>

          {/* Controls */}
          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Genre chips */}
            <div className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              <button
                type="button"
                onClick={() => updateParam('genre', null)}
                className={cn(
                  'shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-300',
                  !activeGenre
                    ? 'border-transparent bg-gradient-to-r from-streamly-purple to-streamly-indigo text-white shadow-[0_10px_30px_-12px_rgba(139,92,246,0.9)]'
                    : 'border-streamly-border bg-white/3 text-streamly-text-secondary hover:border-streamly-border-light hover:text-streamly-text',
                )}
              >
                All
              </button>
              {genreList.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => updateParam('genre', genre.slug)}
                  className={cn(
                    'shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-300',
                    activeGenre === genre.slug
                      ? 'border-transparent bg-gradient-to-r from-streamly-purple to-streamly-indigo text-white shadow-[0_10px_30px_-12px_rgba(139,92,246,0.9)]'
                      : 'border-streamly-border bg-white/3 text-streamly-text-secondary hover:border-streamly-border-light hover:text-streamly-text',
                  )}
                >
                  <span className="mr-1.5" aria-hidden="true">
                    {genre.icon}
                  </span>
                  {genre.name}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden items-center gap-1.5 text-xs text-streamly-text-muted sm:inline-flex">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Sort
              </span>
              <div className="flex items-center gap-1 rounded-full border border-streamly-border bg-white/3 p-1">
                {sorts.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => updateParam('sort', option.key)}
                    className={cn(
                      'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300',
                      sort === option.key
                        ? 'bg-white/10 text-streamly-text shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]'
                        : 'text-streamly-text-muted hover:text-streamly-text',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Grid */}
      <section className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
        <div className="mb-7 flex items-center justify-between">
          <p className="text-sm text-streamly-text-secondary">
            <span className="font-bold text-streamly-text">{filtered.length}</span>{' '}
            {filtered.length === 1 ? 'title' : 'titles'}
            {activeGenre ? (
              <>
                {' '}
                in{' '}
                <span className="font-semibold text-streamly-text">
                  {genreList.find((genre) => genre.slug === activeGenre)?.name}
                </span>
              </>
            ) : null}
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs text-streamly-text-muted">
            <ListFilter className="h-3.5 w-3.5" />
            {sorts.find((option) => option.key === sort)?.label}
          </span>
        </div>

        <MovieGrid
          movies={filtered}
          onDownload={openDownload}
          emptyTitle="No titles match those filters"
          emptyMessage="Clear the genre filter or pick a different sort to see more."
        />
      </section>
    </div>
  )
}

export default Movies
