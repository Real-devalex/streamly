import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Star, Tv, Eye } from 'lucide-react'
import { fetchSeries, deleteSeries } from '@/lib/api'
import type { Series } from '@/types'

export function AdminSeries() {
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const loadSeries = () => {
    setLoading(true)
    fetchSeries({ sort: 'rating' }).then((s) => {
      setSeries(s)
      setLoading(false)
    })
  }

  useEffect(() => { loadSeries() }, [])

  const filtered = series.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    const ok = await deleteSeries(id)
    if (ok) setSeries((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <input
            type="text"
            placeholder="Search series…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-purple-500/60 focus:outline-none focus:ring-2 focus:ring-purple-500/20 sm:w-72"
          />
          <Tv className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        </div>
        <Link
          to="/admin/series/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:shadow-purple-500/30"
        >
          <Plus className="h-4 w-4" /> Add series
        </Link>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center text-center">
          <Tv className="mb-3 h-12 w-12 text-neutral-700" />
          <p className="text-neutral-400">{searchTerm ? 'No matching series' : 'No series yet'}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/3">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <th className="px-5 py-3">Series</th>
                <th className="hidden px-5 py-3 md:table-cell">Rating</th>
                <th className="hidden px-5 py-3 md:table-cell">Seasons</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-white/3">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.posterUrl || `https://placehold.co/80x120/1a1a2e/6366f1?text=${encodeURIComponent(s.title[0])}`}
                        alt=""
                        className="h-12 w-8 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-semibold text-white">{s.title}</p>
                        <p className="text-xs text-neutral-500">{s.releaseYear}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3 md:table-cell">
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Star className="h-3 w-3 fill-yellow-400" /> {s.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="hidden px-5 py-3 md:table-cell">
                    <span className="text-neutral-300">{s.totalSeasons}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      s.status === 'published' ? 'bg-green-500/15 text-green-400' :
                      s.status === 'draft' ? 'bg-yellow-500/15 text-yellow-400' :
                      'bg-neutral-500/15 text-neutral-400'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/series/${s.slug}`}
                        className="grid h-8 w-8 place-items-center rounded-lg text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/admin/series/edit/${s.id}`}
                        className="grid h-8 w-8 place-items-center rounded-lg text-neutral-400 transition-colors hover:bg-purple-500/15 hover:text-purple-400"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(s.id, s.title)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-neutral-400 transition-colors hover:bg-red-500/15 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminSeries
