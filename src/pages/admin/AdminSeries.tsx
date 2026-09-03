import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Eye,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Rocket,
  Search,
  Star,
  Trash2,
  Tv,
} from 'lucide-react'
import { fetchSeries, fetchUpcomingSeries, deleteSeries, updateSeries, notifyAllUsersOfNewContent } from '@/lib/api'
import { cn } from '@/utils/helpers'
import type { ContentStatus, Series } from '@/types'

const filters = ['all', 'published', 'upcoming', 'draft', 'archived'] as const
type Filter = (typeof filters)[number]

export function AdminSeries() {
  const navigate = useNavigate()
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [publishing, setPublishing] = useState<string | null>(null)

  const loadSeries = () => {
    setLoading(true)
    Promise.all([fetchSeries({ sort: 'rating' }), fetchUpcomingSeries(50)]).then(([all, upcoming]) => {
      const merged = [...all]
      for (const item of upcoming) {
        if (!merged.some((s) => s.id === item.id)) merged.push(item)
      }
      setSeries(merged)
      setLoading(false)
    })
  }

  useEffect(() => { loadSeries() }, [])

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase()
    return series.filter((s) => {
      const matchesFilter = filter === 'all' || s.status === filter
      const matchesQuery =
        !term ||
        s.title.toLowerCase().includes(term) ||
        s.genres.some((genre) => genre.name.toLowerCase().includes(term))
      return matchesFilter && matchesQuery
    })
  }, [series, query, filter])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    const ok = await deleteSeries(id)
    if (ok) setSeries((prev) => prev.filter((s) => s.id !== id))
    setDeleting(null)
  }

  const handlePublish = async (item: Series) => {
    setPublishing(item.id)
    const updated = await updateSeries(item.id, {
      title: item.title,
      slug: item.slug,
      description: item.description,
      posterUrl: item.posterUrl,
      backdropUrl: item.backdropUrl,
      trailerUrl: item.trailerUrl ?? '',
      releaseYear: item.releaseYear,
      rating: item.rating,
      status: 'published',
      featured: item.featured,
      genreIds: item.genres.map((g) => g.id),
      cast: item.cast.map((c) => ({
        castMemberId: c.id,
        characterName: c.characterName ?? '',
        photoUrl: c.photoUrl,
      })),
    })
    if (updated) {
      await notifyAllUsersOfNewContent(
        'series',
        item.title,
        item.slug,
        item.totalSeasons > 0 ? `Season ${item.totalSeasons}` : undefined,
      )
      setSeries((prev) => prev.map((s) => (s.id === item.id ? { ...s, status: 'published' } : s)))
    }
    setPublishing(null)
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
            placeholder="Search series or genres…"
            aria-label="Search series"
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

          <Link to="/admin/series/new" className="btn-primary h-10 px-4 text-[13px]">
            <Plus className="h-4 w-4" />
            Add series
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-streamly-border bg-white/2">
                {['Series', 'Year', 'Seasons', 'Rating', 'Status', ''].map((heading) => (
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
              {rows.map((s) => (
                <tr
                  key={s.id}
                  className="group border-b border-streamly-border/60 transition-colors last:border-0 hover:bg-white/3"
                >
                  <td className="px-5 py-3.5">
                    <Link to={`/series/${s.slug}`} className="flex items-center gap-3.5">
                      <div className="h-14 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-streamly-surface">
                        {s.posterUrl ? (
                          <img src={s.posterUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-streamly-blue/25 to-streamly-purple/15 text-sm font-black text-white/30">
                            {s.title.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-streamly-text transition-colors group-hover:text-streamly-purple">
                          {s.title}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-streamly-text-muted">
                          {s.genres.map((genre) => genre.name).join(' · ') || 'No genres'}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-sm tabular-nums text-streamly-text-secondary">
                    {s.releaseYear || '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-sm text-streamly-text-secondary">
                      <Layers className="h-3.5 w-3.5 text-streamly-text-muted" />
                      {s.totalSeasons}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-streamly-gold">
                      <Star className="h-3.5 w-3.5 fill-streamly-gold" />
                      {s.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={s.status} />
                      {s.status === 'upcoming' && s.totalSeasons > 0 ? (
                        <button
                          type="button"
                          onClick={() => void handlePublish(s)}
                          disabled={publishing === s.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-streamly-success/35 bg-streamly-success/12 px-2.5 py-1 text-[11px] font-bold text-streamly-success transition-all duration-300 hover:-translate-y-0.5 hover:bg-streamly-success/20 disabled:opacity-50"
                        >
                          {publishing === s.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Rocket className="h-3 w-3" />
                          )}
                          Publish
                        </button>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                      <IconButton
                        label="Seasons"
                        icon={<Layers className="h-4 w-4" />}
                        onClick={() => navigate(`/admin/series/${s.id}/seasons`)}
                      />
                      <IconButton
                        label="View"
                        icon={<Eye className="h-4 w-4" />}
                        onClick={() => navigate(`/series/${s.slug}`)}
                      />
                      <IconButton
                        label="Edit"
                        icon={<Pencil className="h-4 w-4" />}
                        onClick={() => navigate(`/admin/series/edit/${s.id}`)}
                      />
                      <IconButton
                        label="Delete"
                        icon={
                          deleting === s.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )
                        }
                        onClick={() => void handleDelete(s.id, s.title)}
                        danger
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-white/5 text-streamly-text-muted">
              <Tv className="h-6 w-6" />
            </span>
            <p className="mt-4 text-sm font-semibold text-streamly-text">
              {query || filter !== 'all' ? 'No series match that search' : 'No series yet'}
            </p>
            <p className="mt-1 text-[13px] text-streamly-text-muted">
              {query || filter !== 'all'
                ? 'Try a different term or clear the status filter.'
                : 'Add your first show to get started.'}
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-streamly-border px-5 py-4">
          <p className="text-xs text-streamly-text-muted">
            Showing <span className="font-semibold text-streamly-text">{rows.length}</span> of{' '}
            <span className="font-semibold text-streamly-text">{series.length}</span> series
          </p>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: ContentStatus }) {
  const tones: Record<ContentStatus, string> = {
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
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        'grid h-9 w-9 place-items-center rounded-lg text-streamly-text-muted transition-all duration-300 hover:-translate-y-0.5',
        danger
          ? 'hover:bg-streamly-error/12 hover:text-streamly-error'
          : 'hover:bg-white/8 hover:text-streamly-text',
      )}
    >
      {icon}
    </button>
  )
}

export default AdminSeries
