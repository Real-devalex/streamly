import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ListFilter, SlidersHorizontal, Tv } from 'lucide-react'
import SeriesGrid from '@/components/series/SeriesGrid'
import { EmptyState } from '@/components/ui/EmptyState'
import { fetchSeries, fetchUpcomingSeries, fetchGenres } from '@/lib/api'
import { cn } from '@/utils/helpers'
import type { Genre, Series } from '@/types'

type SortKey = 'rating' | 'latest' | 'title' | 'year'

const sorts: Array<{ key: SortKey; label: string }> = [
  { key: 'rating', label: 'Highest rated' },
  { key: 'latest', label: 'Newest first' },
  { key: 'title', label: 'A → Z' },
  { key: 'year', label: 'Release year' },
]

const statuses = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Streaming' },
  { key: 'upcoming', label: 'Coming soon' },
] as const

export default function SeriesList() {
  const [params, setParams] = useSearchParams()
  const [series, setSeries] = useState<Series[]>([])
  const [genreList, setGenreList] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)

  const sort = (params.get('sort') as SortKey | null) ?? 'rating'
  const activeGenre = params.get('genre')
  const activeStatus = (params.get('status') as 'all' | 'published' | 'upcoming' | null) ?? 'all'

  useEffect(() => {
    async function load() {
      const [published, upcoming, genres] = await Promise.all([
        fetchSeries({ status: 'published', sort: 'rating' }),
        fetchUpcomingSeries(24),
        fetchGenres(),
      ])
      setSeries([...published, ...upcoming])
      setGenreList(genres)
      setLoading(false)
    }
    void load()
  }, [])

  const filtered = useMemo(() => {
    let list = [...series]
    if (activeStatus !== 'all') list = list.filter((s) => s.status === activeStatus)
    if (activeGenre) list = list.filter((s) => s.genres.some((g) => g.slug === activeGenre))

    switch (sort) {
      case 'latest':
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'title':
        list.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'year':
        list.sort((a, b) => b.releaseYear - a.releaseYear || b.rating - a.rating)
        break
      default:
        list.sort((a, b) => b.rating - a.rating)
    }
    return list
  }, [series, sort, activeGenre, activeStatus])

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  return (
    <div className="pb-8">
      {/* ══════════ HEADER ══════════ */}
      <header className="relative overflow-hidden border-b border-streamly-border">
        <div className="aurora -top-32 left-1/4 h-72 w-72 bg-streamly-blue/20" />
        <div className="aurora -bottom-24 right-1/4 h-72 w-72 bg-streamly-purple/15" />

        <div className="relative mx-auto max-w-[1600px] px-4 pb-10 pt-32 sm:px-6 sm:pb-12 lg:px-10">
          <div className="flex animate-fade-up items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-streamly-purple">
            <Tv className="h-3.5 w-3.5 text-streamly-cyan" />
            Episodic
          </div>
          <h1 className="mt-3 animate-fade-up text-4xl font-black tracking-tight text-streamly-text sm:text-5xl">
            TV <span className="gradient-text animate-gradient-x">series</span>
          </h1>
          <p className="mt-3 max-w-xl animate-fade-up text-[15px] leading-relaxed text-streamly-text-secondary">
            Binge-worthy shows and Streamly originals — full seasons, episode by episode.
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

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {/* Status */}
              <div className="flex items-center gap-1 rounded-full border border-streamly-border bg-white/3 p-1">
                {statuses.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => updateParam('status', option.key === 'all' ? null : option.key)}
                    className={cn(
                      'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300',
                      activeStatus === option.key
                        ? 'bg-gradient-to-r from-streamly-purple to-streamly-indigo text-white shadow-[0_10px_26px_-14px_rgba(139,92,246,0.95)]'
                        : 'text-streamly-text-muted hover:text-streamly-text',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Sort */}
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

      {/* ══════════ GRID ══════════ */}
      <section className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <div className="skeleton aspect-[2/3] w-full rounded-card" />
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Tv className="h-7 w-7" />}
            title="No series match those filters"
            message="Clear the genre or status filter to see the full catalogue."
            action={
              <Link to="/series" className="btn-primary h-11 px-6 text-sm">
                Reset filters
              </Link>
            }
          />
        ) : (
          <>
            <div className="mb-7 flex items-center justify-between">
              <p className="text-sm text-streamly-text-secondary">
                <span className="font-bold text-streamly-text">{filtered.length}</span>{' '}
                {filtered.length === 1 ? 'series' : 'series'}
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

            <SeriesGrid series={filtered} columns={5} />
          </>
        )}
      </section>
    </div>
  )
}
