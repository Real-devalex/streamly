import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Plus, Trash2, Edit3, ChevronDown, ChevronUp,
  Loader2, Tv, Save,
} from 'lucide-react'
import {
  fetchSeriesById, fetchSeasonsForSeries, createSeason,
  updateSeason, deleteSeason, createEpisode, updateEpisode,
  deleteEpisode, addEpisodeDownloadLink,
} from '@/lib/api'
import type { Series, Season, Episode } from '@/types'

export function AdminSeasonEpisodes() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [series, setSeries] = useState<Series | null>(null)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSeasonId, setExpandedSeasonId] = useState<string | null>(null)
  const [seasonEpisodes, setSeasonEpisodes] = useState<Record<string, Episode[]>>({})

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
    const { fetchSeasonWithEpisodes } = await import('@/lib/api')
    const data = await fetchSeasonWithEpisodes(seasonId)
    if (data) {
      setSeasonEpisodes((prev) => ({ ...prev, [seasonId]: data.episodes }))
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
    const season = await createSeason(id, newSeasonNum, newSeasonTitle || undefined)
    if (season) {
      setSeasons((prev) => [...prev, season].sort((a, b) => a.seasonNumber - b.seasonNumber))
      setShowAddSeason(false)
      setNewSeasonNum((prev) => prev + 1)
      setNewSeasonTitle('')
    }
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
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/series')} className="text-neutral-400 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">{series?.title ?? 'Series'}</h2>
          <p className="text-sm text-neutral-400">Manage seasons and episodes</p>
        </div>
      </div>

      {/* Seasons */}
      <div className="space-y-3">
        {seasons.map((season) => (
          <div key={season.id} className="overflow-hidden rounded-2xl border border-white/8 bg-white/3">
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={() => toggleSeason(season.id)}
                className="flex items-center gap-3"
              >
                {expandedSeasonId === season.id ? (
                  <ChevronUp className="h-5 w-5 text-neutral-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-neutral-400" />
                )}
                <span className="text-lg font-bold text-white">Season {season.seasonNumber}</span>
                {season.title && <span className="text-sm text-neutral-400">— {season.title}</span>}
                <span className="text-xs text-neutral-500">({season.episodeCount} eps)</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddEpisode(season.id)}
                  className="flex items-center gap-1 rounded-lg bg-purple-600/20 px-3 py-1.5 text-xs font-medium text-purple-300 hover:bg-purple-600/30"
                >
                  <Plus className="h-3 w-3" /> Add episode
                </button>
                <button
                  onClick={() => handleDeleteSeason(season.id)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-neutral-400 hover:bg-red-500/15 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {expandedSeasonId === season.id && (
              <div className="border-t border-white/8 px-6 py-4">
                {/* Add episode form */}
                {showAddEpisode === season.id && (
                  <div className="mb-4 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="mb-1 block text-[10px] font-semibold text-neutral-500">EP #</label>
                        <input
                          type="number" value={newEpNum} onChange={(e) => setNewEpNum(Number(e.target.value))}
                          className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-purple-500/60 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="mb-1 block text-[10px] font-semibold text-neutral-500">Title</label>
                        <input
                          type="text" value={newEpTitle} onChange={(e) => setNewEpTitle(e.target.value)}
                          className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-purple-500/60 focus:outline-none"
                          placeholder="Episode title"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-semibold text-neutral-500">Runtime (min)</label>
                        <input
                          type="number" value={newEpRuntime} onChange={(e) => setNewEpRuntime(Number(e.target.value))}
                          className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-purple-500/60 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="mb-1 block text-[10px] font-semibold text-neutral-500">Description</label>
                      <textarea
                        rows={2} value={newEpDesc} onChange={(e) => setNewEpDesc(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-purple-500/60 focus:outline-none"
                      />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleAddEpisode(season.id)}
                        disabled={!newEpTitle}
                        className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-40"
                      >
                        <Save className="h-3 w-3" /> Save
                      </button>
                      <button
                        onClick={() => setShowAddEpisode(null)}
                        className="rounded-lg border border-white/10 px-4 py-1.5 text-xs text-neutral-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Episodes list */}
                {seasonEpisodes[season.id] && seasonEpisodes[season.id].length > 0 ? (
                  <div className="space-y-2">
                    {seasonEpisodes[season.id].map((ep) => (
                      <div key={ep.id} className="flex items-center gap-4 rounded-xl bg-white/3 px-4 py-3">
                        <span className="w-8 text-center text-xs font-bold text-neutral-500">E{ep.episodeNumber}</span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-white">{ep.title}</p>
                          {ep.description && (
                            <p className="mt-0.5 truncate text-xs text-neutral-500">{ep.description}</p>
                          )}
                        </div>
                        {ep.runtimeMinutes && (
                          <span className="text-xs text-neutral-500">{ep.runtimeMinutes}m</span>
                        )}
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          ep.status === 'published' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'
                        }`}>
                          {ep.status}
                        </span>
                        <button
                          onClick={() => handleDeleteEpisode(season.id, ep.id)}
                          className="grid h-7 w-7 place-items-center rounded-lg text-neutral-400 hover:bg-red-500/15 hover:text-red-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-sm text-neutral-500">No episodes yet. Add one above.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Season */}
      {showAddSeason ? (
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">
          <h3 className="mb-3 text-sm font-bold text-white">Add Season</h3>
          <div className="flex gap-3">
            <div className="w-24">
              <label className="mb-1 block text-[10px] font-semibold text-neutral-500">Number</label>
              <input
                type="number" value={newSeasonNum} onChange={(e) => setNewSeasonNum(Number(e.target.value))}
                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-purple-500/60 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-[10px] font-semibold text-neutral-500">Title (optional)</label>
              <input
                type="text" value={newSeasonTitle} onChange={(e) => setNewSeasonTitle(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-purple-500/60 focus:outline-none"
                placeholder="e.g. The Final Season"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAddSeason}
              className="inline-flex items-center gap-1 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
            >
              <Plus className="h-4 w-4" /> Add Season
            </button>
            <button
              onClick={() => setShowAddSeason(false)}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddSeason(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/10 py-4 text-sm font-medium text-neutral-400 transition-colors hover:border-purple-500/30 hover:text-purple-300"
        >
          <Plus className="h-4 w-4" /> Add Season
        </button>
      )}
    </div>
  )
}

export default AdminSeasonEpisodes
