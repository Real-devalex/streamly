import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Trash2, ChevronDown, Clock,
  Loader2, Save, Layers, Film, X,
} from 'lucide-react'
import {
  fetchSeriesById, fetchSeasonsForSeries, createSeason,
  deleteSeason, createEpisode,
  deleteEpisode, fetchSeasonWithEpisodes,
} from '@/lib/api'
import { cn } from '@/utils/helpers'
import type { Series, Season, Episode } from '@/types'

export function AdminSeasonEpisodes() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [series, setSeries] = useState<Series | null>(null)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSeasonId, setExpandedSeasonId] = useState<string | null>(null)
  const [seasonEpisodes, setSeasonEpisodes] = useState<Record<string, Episode[]>>({})
  const [loadingEpisodes, setLoadingEpisodes] = useState<string | null>(null)
  const [savingEpisode, setSavingEpisode] = useState(false)
  const [savingSeason, setSavingSeason] = useState(false)

  // Add season form
  const [showAddSeason, setShowAddSeason] = useState(false)
  const [newSeasonNum, setNewSeasonNum] = useState(1)
  const [newSeasonTitle, setNewSeasonTitle] = useState('')

  // Add episode form
  const [showAddEpisode, setShowAddEpisode] = useState<string | null>(null)
  const [newEpNum, setNewEpNum] = useState(1)
  const [newEpTitle, setNewEpTitle] = useState('')
  const [newEpDesc, setNewEpDesc] = useState('')
  const [newEpRuntime, setNewEpRuntime] = useState(0)

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetchSeriesById(id),
      fetchSeasonsForSeries(id),
    ]).then(([s, seas]) => {
      setSeries(s)
      setSeasons(seas)
      setNewSeasonNum(seas.length + 1)
      setLoading(false)
    })
  }, [id])

  const loadEpisodes = async (seasonId: string) => {
    setLoadingEpisodes(seasonId)
    try {
      const data = await fetchSeasonWithEpisodes(seasonId)
      if (data) {
        setSeasonEpisodes((prev) => ({ ...prev, [seasonId]: data.episodes }))
      }
    } finally {
      setLoadingEpisodes(null)
    }
  }

  const toggleSeason = async (seasonId: string) => {
    if (expandedSeasonId === seasonId) {
      setExpandedSeasonId(null)
    } else {
      setExpandedSeasonId(seasonId)
      if (!seasonEpisodes[seasonId]) {
        await loadEpisodes(seasonId)
      }
    }
  }

  const handleAddSeason = async () => {
    if (!id) return
    setSavingSeason(true)
    const season = await createSeason(id, newSeasonNum, newSeasonTitle || undefined)
    if (season) {
      setSeasons((prev) => [...prev, season].sort((a, b) => a.seasonNumber - b.seasonNumber))
      setShowAddSeason(false)
      setNewSeasonNum((prev) => prev + 1)
      setNewSeasonTitle('')
    }
    setSavingSeason(false)
  }

  const handleDeleteSeason = async (seasonId: string) => {
    if (!confirm('Delete this season and all its episodes?')) return
    const ok = await deleteSeason(seasonId)
    if (ok) {
      setSeasons((prev) => prev.filter((s) => s.id !== seasonId))
      setSeasonEpisodes((prev) => { const n = { ...prev }; delete n[seasonId]; return n })
    }
  }

  const handleAddEpisode = async (seasonId: string) => {
    setSavingEpisode(true)
    const ep = await createEpisode(seasonId, {
      episodeNumber: newEpNum, title: newEpTitle, description: newEpDesc || undefined,
      runtimeMinutes: newEpRuntime || undefined,
    })
    if (ep) {
      setSeasonEpisodes((prev) => ({
        ...prev,
        [seasonId]: [...(prev[seasonId] ?? []), ep].sort((a, b) => a.episodeNumber - b.episodeNumber),
      }))
      setShowAddEpisode(null)
      setNewEpNum((prev) => prev + 1)
      setNewEpTitle('')
      setNewEpDesc('')
      setNewEpRuntime(0)
    }
    setSavingEpisode(false)
  }

  const handleDeleteEpisode = async (seasonId: string, episodeId: string) => {
    if (!confirm('Delete this episode?')) return
    const ok = await deleteEpisode(episodeId)
    if (ok) {
      setSeasonEpisodes((prev) => ({
        ...prev,
        [seasonId]: (prev[seasonId] ?? []).filter((e) => e.id !== episodeId),
      }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-streamly-purple" />
      </div>
    )
  }

  const inputClass =
    'h-10 w-full rounded-button border border-streamly-border bg-white/3 px-3 text-sm text-streamly-text placeholder:text-streamly-text-muted transition-colors focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20'
  const labelClass = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-streamly-text-muted'

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/series')}
            aria-label="Back to series"
            className="grid h-10 w-10 place-items-center rounded-full border border-streamly-border bg-white/3 text-streamly-text-secondary transition-all duration-300 hover:-translate-x-0.5 hover:border-streamly-purple/40 hover:text-streamly-text"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-streamly-purple">
              Season manager
            </p>
            <h2 className="mt-1 truncate text-xl font-black tracking-tight text-streamly-text sm:text-2xl">
              {series?.title ?? 'Series'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-streamly-border bg-white/3 px-4 py-2 text-xs font-semibold text-streamly-text-secondary">
          <Layers className="h-3.5 w-3.5 text-streamly-cyan" />
          {seasons.length} season{seasons.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Seasons */}
      <div className="space-y-3">
        {seasons.map((season) => {
          const isExpanded = expandedSeasonId === season.id
          const episodes = seasonEpisodes[season.id]

          return (
            <div
              key={season.id}
              className={cn(
                'premium-card overflow-hidden transition-colors duration-400',
                isExpanded && 'border-streamly-purple/40',
              )}
            >
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <button
                  type="button"
                  onClick={() => void toggleSeason(season.id)}
                  aria-expanded={isExpanded}
                  className="group flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 shrink-0 text-streamly-text-muted transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                      isExpanded && 'rotate-180 text-streamly-purple',
                    )}
                  />
                  <span
                    className={cn(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[13px] font-black ring-1 ring-white/10 transition-all duration-500',
                      isExpanded
                        ? 'bg-gradient-to-br from-streamly-purple to-streamly-indigo text-white'
                        : 'bg-white/6 text-streamly-text-secondary group-hover:text-streamly-text',
                    )}
                  >
                    S{season.seasonNumber}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-bold text-streamly-text">
                      Season {season.seasonNumber}
                      {season.title ? (
                        <span className="ml-2 text-sm font-medium text-streamly-text-muted">
                          {season.title}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-xs text-streamly-text-muted">
                      {season.episodeCount} episode{season.episodeCount !== 1 ? 's' : ''}
                    </span>
                  </span>
                </button>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddEpisode(season.id)
                      if (!isExpanded) void toggleSeason(season.id)
                    }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-streamly-purple/30 bg-streamly-purple/12 px-3 text-[12px] font-semibold text-streamly-purple transition-all duration-300 hover:-translate-y-0.5 hover:bg-streamly-purple/20"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add episode
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteSeason(season.id)}
                    aria-label="Delete season"
                    className="grid h-9 w-9 place-items-center rounded-lg text-streamly-text-muted transition-all duration-300 hover:-translate-y-0.5 hover:bg-streamly-error/12 hover:text-streamly-error"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div
                className={cn(
                  'grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                  isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                )}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-streamly-border px-5 py-4">
                    {/* Add episode form */}
                    {showAddEpisode === season.id ? (
                      <div className="mb-4 animate-scale-in rounded-card border border-streamly-purple/25 bg-streamly-purple/6 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="inline-flex items-center gap-2 text-[13px] font-bold text-streamly-text">
                            <Film className="h-3.5 w-3.5 text-streamly-purple" />
                            New episode
                          </h4>
                          <button
                            type="button"
                            onClick={() => setShowAddEpisode(null)}
                            aria-label="Cancel"
                            className="grid h-7 w-7 place-items-center rounded-full text-streamly-text-muted transition-colors hover:bg-white/8 hover:text-streamly-text"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-4">
                          <div>
                            <label className={labelClass}>EP #</label>
                            <input
                              type="number"
                              value={newEpNum}
                              onChange={(e) => setNewEpNum(Number(e.target.value))}
                              className={inputClass}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className={labelClass}>Title</label>
                            <input
                              type="text"
                              value={newEpTitle}
                              onChange={(e) => setNewEpTitle(e.target.value)}
                              className={inputClass}
                              placeholder="Episode title"
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Runtime (min)</label>
                            <input
                              type="number"
                              value={newEpRuntime}
                              onChange={(e) => setNewEpRuntime(Number(e.target.value))}
                              className={inputClass}
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className={labelClass}>Description</label>
                          <textarea
                            rows={2}
                            value={newEpDesc}
                            onChange={(e) => setNewEpDesc(e.target.value)}
                            placeholder="What happens in this episode?"
                            className="w-full rounded-button border border-streamly-border bg-white/3 px-3 py-2.5 text-sm text-streamly-text placeholder:text-streamly-text-muted transition-colors focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
                          />
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() => void handleAddEpisode(season.id)}
                            disabled={!newEpTitle || savingEpisode}
                            className="btn-primary h-10 px-5 text-[13px]"
                          >
                            {savingEpisode ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Save className="h-3.5 w-3.5" />
                            )}
                            Save episode
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddEpisode(null)}
                            className="btn-secondary h-10 px-5 text-[13px]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {/* Episodes list */}
                    {loadingEpisodes === season.id ? (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="skeleton h-14 w-full rounded-button" />
                        ))}
                      </div>
                    ) : episodes && episodes.length > 0 ? (
                      <div className="space-y-2">
                        {episodes.map((ep, index) => (
                          <div
                            key={ep.id}
                            style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                            className="group flex animate-fade-up items-center gap-4 rounded-button border border-streamly-border bg-white/3 px-4 py-3 transition-all duration-300 hover:border-streamly-border-light hover:bg-white/6"
                          >
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/6 text-[11px] font-black tabular-nums text-streamly-text-muted">
                              {ep.episodeNumber}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-streamly-text">{ep.title}</p>
                              {ep.description ? (
                                <p className="mt-0.5 truncate text-xs text-streamly-text-muted">
                                  {ep.description}
                                </p>
                              ) : null}
                            </div>
                            {ep.runtimeMinutes ? (
                              <span className="hidden items-center gap-1 text-xs text-streamly-text-muted sm:inline-flex">
                                <Clock className="h-3 w-3" />
                                {ep.runtimeMinutes}m
                              </span>
                            ) : null}
                            <span
                              className={cn(
                                'rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                                ep.status === 'published'
                                  ? 'border-streamly-success/30 bg-streamly-success/10 text-streamly-success'
                                  : 'border-streamly-border-light bg-white/6 text-streamly-text-secondary',
                              )}
                            >
                              {ep.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => void handleDeleteEpisode(season.id, ep.id)}
                              aria-label="Delete episode"
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-streamly-text-muted opacity-60 transition-all duration-300 hover:bg-streamly-error/12 hover:text-streamly-error group-hover:opacity-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="py-6 text-center text-sm text-streamly-text-muted">
                        No episodes yet. Add the first one above.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Season */}
      {showAddSeason ? (
        <div className="premium-card animate-scale-in space-y-4 border-streamly-purple/25 p-6">
          <h3 className="inline-flex items-center gap-2 text-sm font-bold text-streamly-text">
            <Layers className="h-4 w-4 text-streamly-purple" />
            Add a season
          </h3>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="sm:w-28">
              <label className={labelClass}>Number</label>
              <input
                type="number"
                value={newSeasonNum}
                onChange={(e) => setNewSeasonNum(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Title (optional)</label>
              <input
                type="text"
                value={newSeasonTitle}
                onChange={(e) => setNewSeasonTitle(e.target.value)}
                className={inputClass}
                placeholder="e.g. The Final Season"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void handleAddSeason()}
              disabled={savingSeason}
              className="btn-primary h-10 px-5 text-[13px]"
            >
              {savingSeason ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add season
            </button>
            <button
              type="button"
              onClick={() => setShowAddSeason(false)}
              className="btn-secondary h-10 px-5 text-[13px]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddSeason(true)}
          className="group flex w-full items-center justify-center gap-2 rounded-card border-2 border-dashed border-streamly-border py-5 text-sm font-semibold text-streamly-text-muted transition-all duration-400 hover:border-streamly-purple/40 hover:bg-streamly-purple/5 hover:text-streamly-purple"
        >
          <Plus className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-90" />
          Add season
        </button>
      )}
    </div>
  )
}

export default AdminSeasonEpisodes
