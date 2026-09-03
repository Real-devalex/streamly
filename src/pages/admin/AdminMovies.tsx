import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Eye,
  Loader2,
  Pencil,
  Plus,
  Rocket,
  Search,
  Star,
  Trash2,
} from 'lucide-react'
import { fetchMovies, deleteMovie, updateMovie, notifyAllUsersOfNewContent, type MovieInput } from '@/lib/api'
import { cn, formatCompact, formatRuntime, hashSeed } from '@/utils/helpers'
import type { Movie } from '@/types'

const filters = ['all', 'published', 'upcoming', 'draft', 'archived'] as const
type Filter = (typeof filters)[number]

export function AdminMovies() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [publishing, setPublishing] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const data = await fetchMovies()
      setMovies(data)
      setLoading(false)
    }
    void load()
  }, [])

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
  }, [query, filter, movies])

  const handlePublish = async (movie: Movie) => {
    setPublishing(movie.id)
    const input: MovieInput = {
      title: movie.title,
      slug: movie.slug,
      description: movie.description,
      posterUrl: movie.posterUrl,
      backdropUrl: movie.backdropUrl,
      trailerUrl: movie.trailerUrl ?? '',
      releaseYear: movie.releaseYear,
      runtimeMinutes: movie.runtimeMinutes ?? 0,
      rating: movie.rating,
      status: 'published',
      featured: movie.featured,
      genreIds: movie.genres.map((g) => g.id),
      cast: movie.cast.map((c) => ({ castMemberId: c.id, characterName: c.characterName ?? '', photoUrl: c.photoUrl })),
      downloadLinks: movie.downloadLinks.map((dl) => ({
        quality: dl.quality,
        url: dl.url,
        fileSizeBytes: dl.fileSizeBytes ?? 0,
        destinationLabel: dl.destinationLabel,
      })),
    }
    await updateMovie(movie.id, input)
    await notifyAllUsersOfNewContent('movie', movie.title, movie.slug)
    setMovies((prev) => prev.map((m) => (m.id === movie.id ? { ...m, status: 'published' } : m)))
    setPublishing(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this movie permanently?')) return
    setDeleting(id)
    await deleteMovie(id)
    setMovies((prev) => prev.filter((m) => m.id !== id))
    setDeleting(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-streamly-purple" />
      </div>
    )
  }

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

          <button
            type="button"
            onClick={() => navigate('/admin/movies/new')}
            className="btn-primary h-10 px-4 text-[13px]"
          >
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
                <Row
                  key={movie.id}
                  movie={movie}
                  onDelete={handleDelete}
                  deleting={deleting === movie.id}
                  onPublish={handlePublish}
                  publishing={publishing === movie.id}
                />
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
        </div>
      </div>
    </div>
  )
}

function Row({
  movie,
  onDelete,
  deleting,
  onPublish,
  publishing,
}: {
  movie: Movie
  onDelete: (id: string) => void
  deleting: boolean
  onPublish: (movie: Movie) => void
  publishing: boolean
}) {
  const navigate = useNavigate()
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
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={movie.status} />
          {movie.status === 'upcoming' && movie.downloadLinks.length > 0 ? (
            <button
              type="button"
              onClick={() => onPublish(movie)}
              disabled={publishing}
              className="inline-flex items-center gap-1.5 rounded-full border border-streamly-success/35 bg-streamly-success/12 px-2.5 py-1 text-[11px] font-bold text-streamly-success transition-all duration-300 hover:-translate-y-0.5 hover:bg-streamly-success/20 disabled:opacity-50"
            >
              {publishing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Rocket className="h-3 w-3" />}
              Publish
            </button>
          ) : null}
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100">
          <IconButton label="View" icon={<Eye className="h-4 w-4" />} onClick={() => navigate(`/movie/${movie.slug}`)} />
          <IconButton label="Edit" icon={<Pencil className="h-4 w-4" />} onClick={() => navigate(`/admin/movies/edit/${movie.id}`)} />
          <IconButton
            label="Delete"
            icon={deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            onClick={() => onDelete(movie.id)}
            danger
          />
        </div>
      </td>
    </tr>
  )
}

function StatusBadge({ status }: { status: Movie['status'] }) {
  const tones = {
    published: 'border-streamly-success/30 bg-streamly-success/10 text-streamly-success',
    upcoming: 'border-streamly-warning/40 bg-streamly-warning/12 text-streamly-warning',
    draft: 'border-streamly-border-light bg-white/6 text-streamly-text-secondary',
    archived: 'border-streamly-error/30 bg-streamly-error/10 text-streamly-error',
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
  onClick,
}: {
  label: string
  icon: React.ReactNode
  danger?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
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
