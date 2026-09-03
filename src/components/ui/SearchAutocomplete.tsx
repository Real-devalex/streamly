import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Film, Search, Star, X } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { searchMoviesOnline } from '@/lib/api'
import { cn } from '@/utils/helpers'
import type { Movie } from '@/types'

interface SearchAutocompleteProps {
  defaultValue?: string
  placeholder?: string
  className?: string
  autoFocus?: boolean
  onSearch?: (query: string) => void
}

export function SearchAutocomplete({
  defaultValue = '',
  placeholder = 'Search movies, genres, cast...',
  className,
  autoFocus = false,
  onSearch,
}: SearchAutocompleteProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [results, setResults] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)

  const debouncedQuery = useDebounce(query, 250)

  // Fetch results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    void searchMoviesOnline(debouncedQuery).then((data) => {
      if (!cancelled) {
        setResults(data.slice(0, 8))
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [debouncedQuery])

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const submit = useCallback(
    (value: string) => {
      setOpen(false)
      setActiveIndex(-1)
      if (onSearch) {
        onSearch(value)
      } else {
        navigate(value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : '/search')
      }
    },
    [navigate, onSearch],
  )

  const goToMovie = useCallback(
    (movie: Movie) => {
      setOpen(false)
      setQuery(movie.title)
      navigate(`/movie/${movie.slug}`)
    },
    [navigate],
  )

  const itemCount = results.length

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((prev) => (prev + 1) % Math.max(itemCount, 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => (prev - 1 + itemCount) % Math.max(itemCount, 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < results.length) {
          goToMovie(results[activeIndex])
        } else {
          submit(query)
        }
      } else if (e.key === 'Escape') {
        setOpen(false)
        setActiveIndex(-1)
        inputRef.current?.blur()
      }
    },
    [activeIndex, itemCount, results, query, submit, goToMovie],
  )

  const showDropdown = open && (query.trim().length > 0)

  return (
    <div className={cn('relative', className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(query)
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-streamly-text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
              setActiveIndex(-1)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            type="search"
            autoComplete="off"
            autoFocus={autoFocus}
            placeholder={placeholder}
            aria-label="Search"
            aria-expanded={showDropdown}
            aria-controls="search-listbox"
            aria-activedescendant={activeIndex >= 0 ? `search-item-${activeIndex}` : undefined}
            role="combobox"
            className="h-12 w-full rounded-button border border-streamly-border bg-white/5 pl-12 pr-10 text-sm text-streamly-text placeholder:text-streamly-text-muted focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setResults([])
                inputRef.current?.focus()
              }}
              className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-streamly-text-muted hover:bg-white/8 hover:text-streamly-text"
              aria-label="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <button type="submit" className="btn-primary h-12 shrink-0 px-5 text-sm">
          Search
        </button>
      </form>

      {/* Dropdown */}
      {showDropdown ? (
        <div
          ref={listRef}
          id="search-listbox"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-modal border border-streamly-border bg-streamly-card/98 shadow-[0_30px_80px_-20px_rgba(0,0,0,1)] backdrop-blur-2xl"
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-streamly-purple border-t-transparent" />
            </div>
          ) : results.length > 0 ? (
            <>
              {results.map((movie, index) => (
                <button
                  key={movie.id}
                  id={`search-item-${index}`}
                  role="option"
                  aria-selected={activeIndex === index}
                  onClick={() => goToMovie(movie)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    'flex w-full items-center gap-4 px-4 py-3 text-left transition-colors',
                    activeIndex === index ? 'bg-white/8' : 'hover:bg-white/5',
                  )}
                >
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt=""
                      className="h-12 w-8 shrink-0 rounded-md object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="grid h-12 w-8 shrink-0 place-items-center rounded-md bg-white/5 text-streamly-text-muted">
                      <Film className="h-4 w-4" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-streamly-text">
                      {movie.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-streamly-text-muted">
                      <span>{movie.releaseYear}</span>
                      {movie.genres.length > 0 ? (
                        <>
                          <span className="text-streamly-border">|</span>
                          <span>{movie.genres.slice(0, 2).map((g) => g.name).join(', ')}</span>
                        </>
                      ) : null}
                    </p>
                  </div>
                  {movie.rating > 0 ? (
                    <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-streamly-gold">
                      <Star className="h-3 w-3 fill-streamly-gold" />
                      {movie.rating.toFixed(1)}
                    </span>
                  ) : null}
                </button>
              ))}
              <button
                onClick={() => submit(query)}
                className="flex w-full items-center gap-3 border-t border-streamly-border px-4 py-3 text-sm font-semibold text-streamly-purple transition-colors hover:bg-white/5"
              >
                <Search className="h-4 w-4" />
                See all results for "{query}"
              </button>
            </>
          ) : (
            <div className="py-8 text-center">
              <Film className="mx-auto h-8 w-8 text-streamly-text-muted" />
              <p className="mt-2 text-sm text-streamly-text-muted">No results found</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default SearchAutocomplete
