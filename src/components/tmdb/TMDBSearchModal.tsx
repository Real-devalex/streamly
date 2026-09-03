import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Clapperboard, Loader2, Search, Star, X } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import {
  fetchTmdbDetails,
  isTmdbConfigured,
  searchTmdb,
  type TmdbDetails,
  type TmdbKind,
  type TmdbSearchResult,
} from '@/lib/tmdb'
import { cn } from '@/utils/helpers'

export interface TMDBSearchModalProps {
  open: boolean
  kind: TmdbKind
  initialQuery?: string
  onClose: () => void
  onSelect: (details: TmdbDetails) => void
}

export function TMDBSearchModal({ open, kind, initialQuery = '', onClose, onSelect }: TMDBSearchModalProps) {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<TmdbSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [importingId, setImportingId] = useState<number | null>(null)
  const [touched, setTouched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounced = useDebounce(query, 350)

  useEffect(() => {
    if (!open) return
    setQuery(initialQuery)
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120)
    return () => window.clearTimeout(timer)
  }, [open, initialQuery])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const term = debounced.trim()
    if (term.length < 2) {
      setResults([])
      setSearching(false)
      return
    }
    let cancelled = false
    setSearching(true)
    setTouched(true)
    void searchTmdb(kind, term).then((found) => {
      if (cancelled) return
      setResults(found)
      setSearching(false)
    })
    return () => {
      cancelled = true
    }
  }, [debounced, kind, open])

  if (!open) return null

  const handlePick = async (result: TmdbSearchResult) => {
    setImportingId(result.id)
    const details = await fetchTmdbDetails(kind, result.id)
    setImportingId(null)
    if (details) {
      onSelect(details)
      onClose()
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div
        className="fixed inset-0 animate-fade-in bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Search TMDB for ${kind === 'movie' ? 'movies' : 'series'}`}
        className="glass-strong relative z-10 my-auto w-full max-w-5xl animate-scale-in overflow-hidden rounded-modal shadow-[0_60px_140px_-40px_rgba(0,0,0,1)]"
      >
        {/* Header */}
        <div className="relative overflow-hidden border-b border-white/8 px-5 py-5 sm:px-8">
          <div className="aurora -left-10 -top-16 h-48 w-48 bg-streamly-purple/25" />
          <div className="aurora -right-10 -top-20 h-48 w-48 bg-streamly-cyan/20" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-streamly-purple">
                <Clapperboard className="h-3.5 w-3.5 text-streamly-cyan" />
                TMDB auto-fill
              </p>
              <h2 className="mt-2 text-xl font-black tracking-tight text-streamly-text sm:text-2xl">
                Import {kind === 'movie' ? 'a movie' : 'a series'} from{' '}
                <span className="gradient-text animate-gradient-x">TMDB</span>
              </h2>
              <p className="mt-1 text-[13px] text-streamly-text-secondary">
                Pick a title and every field — poster, backdrop, cast, trailer, genres — fills itself in.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close TMDB search"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-streamly-text-secondary transition-all duration-300 hover:rotate-90 hover:border-streamly-error/40 hover:text-streamly-text"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search input */}
          <div className="relative mt-6">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-streamly-text-muted" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              placeholder={`Search TMDB ${kind === 'movie' ? 'movies' : 'TV series'}…`}
              className="h-14 w-full rounded-button border border-streamly-border bg-black/40 pl-12 pr-12 text-[15px] text-streamly-text placeholder:text-streamly-text-muted transition-colors focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
            />
            {searching ? (
              <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-streamly-purple" />
            ) : null}
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[58vh] overflow-y-auto px-5 py-6 sm:px-8">
          {!isTmdbConfigured ? (
            <div className="flex items-start gap-3 rounded-card border border-streamly-warning/30 bg-streamly-warning/8 p-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-streamly-warning" />
              <div>
                <p className="text-sm font-semibold text-streamly-text">TMDB API key missing</p>
                <p className="mt-1 text-[13px] text-streamly-text-secondary">
                  Add <code className="rounded bg-black/40 px-1.5 py-0.5 text-streamly-cyan">VITE_TMDB_API_KEY</code> to
                  your environment and reload to enable auto-fill.
                </p>
              </div>
            </div>
          ) : searching && results.length === 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="skeleton aspect-[2/3] w-full rounded-card" />
                  <div className="skeleton h-3.5 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/3 rounded" />
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="stagger-children grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {results.map((result) => (
                <article
                  key={result.id}
                  className="premium-card premium-card-hover group relative overflow-hidden"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-streamly-surface">
                    {result.posterUrl ? (
                      <img
                        src={result.posterUrl}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-streamly-purple/30 to-streamly-blue/20 text-4xl font-black text-white/25">
                        {result.title.charAt(0)}
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                    <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-white/12 bg-black/60 px-2 py-1 text-[11px] font-bold text-streamly-gold backdrop-blur-md">
                      <Star className="h-3 w-3 fill-streamly-gold text-streamly-gold" />
                      {result.rating.toFixed(1)}
                    </span>
                  </div>

                  <div className="p-3">
                    <h3 className="truncate text-[13px] font-semibold text-streamly-text">{result.title}</h3>
                    <p className="mt-0.5 text-[11px] text-streamly-text-muted">{result.year ?? '—'}</p>
                    <button
                      type="button"
                      onClick={() => void handlePick(result)}
                      disabled={importingId !== null}
                      className={cn('btn-primary mt-3 h-9 w-full text-[12px]', importingId === result.id && 'animate-glow-pulse')}
                    >
                      {importingId === result.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Importing…
                        </>
                      ) : (
                        'Use this'
                      )}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="py-14 text-center">
              <span className="mx-auto grid h-16 w-16 animate-float place-items-center rounded-full border border-white/10 bg-white/5 text-streamly-purple">
                <Clapperboard className="h-7 w-7" />
              </span>
              <p className="mt-5 text-sm font-semibold text-streamly-text">
                {touched && !searching ? 'No matches on TMDB' : 'Start typing a title'}
              </p>
              <p className="mt-1 text-[13px] text-streamly-text-muted">
                {touched && !searching
                  ? 'Try a shorter or original-language title.'
                  : 'Search TMDB and pull posters, cast, trailers and genres in one click.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default TMDBSearchModal
