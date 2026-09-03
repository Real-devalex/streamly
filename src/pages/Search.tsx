import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Film, Search, TrendingUp } from 'lucide-react'
import { SearchAutocomplete } from '@/components/ui/SearchAutocomplete'
import { MovieGrid } from '@/components/movie/MovieGrid'
import { useDownload } from '@/context/DownloadContext'
import { searchMoviesOnline, fetchTrendingMovies } from '@/lib/api'
import { cn } from '@/utils/helpers'
import type { Movie } from '@/types'

const POPULAR_SEARCHES = ['Sci-Fi', 'Thriller', 'Heist', 'Animation', '2025', 'Horror', 'Romance']

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const { openDownload } = useDownload()
  const urlQuery = params.get('q') ?? ''
  const [results, setResults] = useState<Movie[]>([])
  const [trending, setTrending] = useState<Movie[]>([])
  const [searching, setSearching] = useState(false)

  // Load trending on mount
  useEffect(() => {
    void fetchTrendingMovies(5).then(setTrending)
  }, [])

  // Search when query changes
  useEffect(() => {
    if (!urlQuery.trim()) { setResults([]); return }
    let cancelled = false
    setSearching(true)
    void searchMoviesOnline(urlQuery).then((data) => {
      if (!cancelled) { setResults(data); setSearching(false) }
    })
    return () => { cancelled = true }
  }, [urlQuery])

  const hasQuery = urlQuery.trim().length > 0

  return (
    <div className="pb-8">
      {/* Search header */}
      <header className="relative overflow-hidden border-b border-streamly-border">
        <div className="aurora -top-40 left-1/3 h-80 w-80 bg-streamly-purple/18" />
        <div className="aurora -bottom-32 right-0 h-80 w-80 bg-streamly-blue/12" />

        <div className="relative mx-auto max-w-4xl px-4 pb-12 pt-32 sm:px-6 sm:pt-36">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-streamly-purple">
            <Search className="h-3.5 w-3.5 text-streamly-cyan" />
            Instant search
          </div>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-streamly-text sm:text-4xl">
            Find your next <span className="gradient-text">obsession</span>
          </h1>

          <div className="mt-8">
            <SearchAutocomplete
              defaultValue={urlQuery}
              placeholder='Try "sci-fi", "heist", or a cast member...'
              autoFocus={!urlQuery}
              onSearch={(q) => {
                const next = new URLSearchParams(params)
                if (q.trim()) next.set('q', q.trim())
                else next.delete('q')
                setParams(next, { replace: true })
              }}
            />
          </div>

          {!hasQuery ? (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-xs text-streamly-text-muted">Popular searches</span>
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(params)
                    next.set('q', term)
                    setParams(next, { replace: true })
                  }}
                  className="rounded-full border border-streamly-border bg-white/3 px-3 py-1.5 text-xs font-medium text-streamly-text-secondary transition-all duration-300 hover:-translate-y-0.5 hover:border-streamly-purple/50 hover:text-streamly-text"
                >
                  {term}
                </button>
              ))}
              <span className="ml-auto hidden text-[11px] text-streamly-text-muted sm:inline">
                Press <kbd className="rounded border border-streamly-border-light px-1.5 py-0.5">/</kbd> to focus
              </span>
            </div>
          ) : null}
        </div>
      </header>

      {/* Results */}
      <section className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
        {hasQuery ? (
          <>
            <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-streamly-text">
                {searching ? 'Searching...' : results.length} {results.length === 1 ? 'result' : 'results'}
                <span className="ml-2 text-sm font-medium text-streamly-text-muted">
                  for "{urlQuery}"
                </span>
              </h2>
            </div>

            <MovieGrid
              movies={results}
              onDownload={openDownload}
              emptyTitle={`No matches for "${urlQuery}"`}
              emptyMessage="Check the spelling, or try a genre, a year, or an actor's name."
            />
          </>
        ) : (
          <>
            <div className="mb-7 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-streamly-purple" />
              <h2 className="text-lg font-bold text-streamly-text">Trending right now</h2>
            </div>
            <MovieGrid movies={trending} onDownload={openDownload} />

            <div className={cn('mt-16 grid gap-4 sm:grid-cols-3')}>
              {[
                {
                  title: 'Search by mood',
                  copy: 'Type a genre — "thriller", "animation" — and we will do the rest.',
                },
                {
                  title: 'Search by cast',
                  copy: 'Remember the face but not the film? Search the actor\'s name.',
                },
                {
                  title: 'Search by year',
                  copy: 'Looking for a 2025 release? Just type the year.',
                },
              ].map((item) => (
                <div key={item.title} className="premium-card premium-card-hover p-5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-streamly-purple/25 to-streamly-blue/15 text-streamly-purple ring-1 ring-white/10">
                    <Film className="h-4 w-4" />
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-streamly-text">{item.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-streamly-text-secondary">
                    {item.copy}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default SearchPage
