import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react'
import { movies } from '@/data/mock-movies'
import { cn, formatCompact, formatRuntime, hashSeed } from '@/utils/helpers'
import type { Movie } from '@/types'

const filters = ['all', 'published', 'draft', 'archived'] as const
type Filter = (typeof filters)[number]

export function AdminMovies() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase()
    return movies.filter((movie) => {
      const matchesFilter = filter === 'all' || movie.status === filter
      const matchesQuery =
        !term ||
        movie.title.toLowerCase().includes(term) ||
        movie.genres.some((genre) => genre.name.toLowerCase().includes(term))
      return matchesFilter && matchesQuery
    })
  }, [query, filter])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-streamly-text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            placeholder="Search titles or genres…"
            aria-label="Search movies"
            className="h-11 w-full rounded-button border border-streamly-border bg-white/3 pl-10 pr-4 text-sm text-streamly-text placeholder:text-streamly-text-muted transition-colors focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-streamly-border bg-white/3 p-1">
            {filters.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-all duration-300',
                  filter === option
                    ? 'bg-gradient-to-r from-streamly-purple to-streamly-indigo text-white'
                    : 'text-streamly-text-muted hover:text-streamly-text',
                )}
              >
                {option}
              </button>
            ))}
          </div>

          <button type="button" className="btn-primary h-10 px-4 text-[13px]">
            <Plus className="h-4 w-4" />
            Add movie
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-streamly-border bg-white/2">
                {['Movie', 'Year', 'Runtime', 'Rating', 'Downloads', 'Status', ''].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-streamly-text-muted"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((movie) => (
                <Row key={movie.id} movie={movie} />
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-sm font-semibold text-streamly-text">No titles match that search</p>
            <p className="mt-1 text-[13px] text-streamly-text-muted">
              Try a different term or clear the status filter.
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-streamly-border px-5 py-4">
          <p className="text-xs text-streamly-text-muted">
            Showing <span className="font-semibold text-streamly-text">{rows.length}</span> of{' '}
            <span className="font-semibold text-streamly-text">{movies.length}</span> titles
          </p>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                type="button"
                className={cn(
                  'h-8 w-8 rounded-lg text-xs font-semibold transition-colors',
                  page === 1
                    ? 'bg-streamly-purple/20 text-streamly-purple ring-1 ring-streamly-purple/40'
                    : 'text-streamly-text-muted hover:bg-white/5 hover:text-streamly-text',
                )}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ movie }: { movie: Movie }) {
  const downloads = 40_000 + (hashSeed(movie.id) % 90_000)

  return (
    <tr className="group border-b border-streamly-border/60 transition-colors last:border-0 hover:bg-white/3">
      <td className="px-5 py-3.5">
        <Link to={`/movie/${movie.slug}`} className="flex items-center gap-3.5">
          <div className="h-14 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-streamly-surface">
            <img src={movie.posterUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-streamly-text transition-colors group-hover:text-streamly-purple">
              {movie.title}
            </p>
            <p className="mt-0.5 truncate text-xs text-streamly-text-muted">
              {movie.genres.map((genre) => genre.name).join(' · ')}
            </p>
          </div>
        </Link>
      </td>
      <td className="px-5 py-3.5 text-sm tabular-nums text-streamly-text-secondary">
        {movie.releaseYear}
      </td>
      <td className="px-5 py-3.5 text-sm text-streamly-text-secondary">
        {formatRuntime(movie.runtimeMinutes)}
      </td>
      <td className="px-5 py-3.5">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-streamly-gold">
          <Star className="h-3.5 w-3.5 fill-streamly-gold" />
          {movie.rating.toFixed(1)}
        </span>
      </td>
      <td className="px-5 py-3.5 text-sm tabular-nums text-streamly-text-secondary">
        {formatCompact(downloads)}
      </td>
      <td className="px-5 py-3.5">
        <StatusBadge status={movie.status} />
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100">
          <IconButton label="View" icon={<Eye className="h-4 w-4" />} />
          <IconButton label="Edit" icon={<Pencil className="h-4 w-4" />} />
          <IconButton
            label="Unpublish"
            icon={<EyeOff className="h-4 w-4" />}
          />
          <IconButton label="Delete" icon={<Trash2 className="h-4 w-4" />} danger />
          <IconButton label="More" icon={<MoreHorizontal className="h-4 w-4" />} />
        </div>
      </td>
    </tr>
  )
}

function StatusBadge({ status }: { status: Movie['status'] }) {
  const tones = {
    published: 'border-streamly-success/30 bg-streamly-success/10 text-streamly-success',
    draft: 'border-streamly-warning/30 bg-streamly-warning/10 text-streamly-warning',
    archived: 'border-streamly-border-light bg-white/5 text-streamly-text-muted',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize',
        tones[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

function IconButton({
  label,
  icon,
  danger = false,
}: {
  label: string
  icon: React.ReactNode
  danger?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'grid h-8 w-8 place-items-center rounded-lg border border-transparent text-streamly-text-muted transition-all duration-300 hover:-translate-y-0.5',
        danger
          ? 'hover:border-streamly-error/40 hover:bg-streamly-error/12 hover:text-streamly-error'
          : 'hover:border-streamly-border-light hover:bg-white/6 hover:text-streamly-text',
      )}
    >
      {icon}
    </button>
  )
}

export default AdminMovies
