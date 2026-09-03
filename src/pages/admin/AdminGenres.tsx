import { useEffect, useState } from 'react'
import {
  Compass,
  Edit3,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { fetchGenres, createGenre, updateGenre, deleteGenre, getGenreMovieCount } from '@/lib/api'
import { cn, slugify } from '@/utils/helpers'
import type { Genre } from '@/types'

const PRESET_COLORS = ['#f97316', '#22c55e', '#22d3ee', '#ef4444', '#a855f7', '#fbbf24', '#7c3aed', '#f472b6', '#38bdf8', '#64748b', '#14b8a6', '#8b5cf6']
const PRESET_ICONS = ['💥', '🧭', '🚀', '🔪', '🎭', '😂', '👻', '💖', '🎨', '🕵️', '🔍', '🪄', '🏆', '🎵', '🌍', '⚡']

export function AdminGenres() {
  const [genres, setGenres] = useState<Genre[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formIcon, setFormIcon] = useState('')
  const [formColor, setFormColor] = useState(PRESET_COLORS[0])
  const [saving, setSaving] = useState(false)

  const loadGenres = async () => {
    setLoading(true)
    const data = await fetchGenres()
    setGenres(data)
    const countMap: Record<string, number> = {}
    await Promise.all(data.map(async (g) => { countMap[g.slug] = await getGenreMovieCount(g.slug) }))
    setCounts(countMap)
    setLoading(false)
  }

  useEffect(() => { void loadGenres() }, [])

  const startEdit = (genre: Genre) => {
    setEditing(genre.id)
    setAdding(false)
    setFormName(genre.name)
    setFormSlug(genre.slug)
    setFormIcon(genre.icon ?? '')
    setFormColor(genre.color ?? PRESET_COLORS[0])
  }

  const startAdd = () => {
    setAdding(true)
    setEditing(null)
    setFormName('')
    setFormSlug('')
    setFormIcon(PRESET_ICONS[Math.floor(Math.random() * PRESET_ICONS.length)])
    setFormColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)])
  }

  const cancel = () => {
    setEditing(null)
    setAdding(false)
  }

  const handleSave = async () => {
    if (!formName.trim()) return
    setSaving(true)

    if (editing) {
      await updateGenre(editing, { name: formName.trim(), slug: formSlug || slugify(formName), icon: formIcon, color: formColor })
    } else {
      await createGenre({ name: formName.trim(), slug: formSlug || slugify(formName), icon: formIcon, color: formColor })
    }

    setSaving(false)
    cancel()
    await loadGenres()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this genre? Movies won\'t be deleted.')) return
    await deleteGenre(id)
    await loadGenres()
  }

  // Auto-generate slug
  useEffect(() => {
    if (adding && formName) setFormSlug(slugify(formName))
  }, [formName, adding])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-streamly-purple" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-streamly-text-secondary">
            <span className="font-bold text-streamly-text">{genres.length}</span> genres in the library
          </p>
        </div>
        <button
          type="button"
          onClick={startAdd}
          className="btn-primary h-10 px-4 text-[13px]"
        >
          <Plus className="h-4 w-4" />
          Add genre
        </button>
      </div>

      {/* Add/Edit form */}
      {(adding || editing) && (
        <div className="premium-card space-y-5 p-5 border-streamly-purple/40">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-streamly-text">
              {editing ? 'Edit genre' : 'New genre'}
            </h3>
            <button type="button" onClick={cancel} className="grid h-8 w-8 place-items-center rounded-lg text-streamly-text-muted hover:text-streamly-text">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-streamly-text-secondary">Name *</label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                type="text"
                placeholder="e.g. Sci-Fi"
                className="h-11 w-full rounded-button border border-streamly-border bg-white/3 px-4 text-sm text-streamly-text placeholder:text-streamly-text-muted focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-streamly-text-secondary">Slug</label>
              <input
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                type="text"
                placeholder="sci-fi"
                className="h-11 w-full rounded-button border border-streamly-border bg-white/3 px-4 text-sm text-streamly-text placeholder:text-streamly-text-muted focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-streamly-text-secondary">Icon</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormIcon(icon)}
                  className={cn(
                    'grid h-10 w-10 place-items-center rounded-xl border text-lg transition-all',
                    formIcon === icon
                      ? 'border-streamly-purple/60 bg-streamly-purple/20 scale-110 shadow-[0_0_15px_-5px_rgba(139,92,246,0.5)]'
                      : 'border-streamly-border bg-white/3 hover:border-streamly-border-light',
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-streamly-text-secondary">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormColor(color)}
                  className={cn(
                    'h-10 w-10 rounded-xl border-2 transition-all',
                    formColor === color ? 'scale-110 shadow-[0_0_15px_-3px_rgba(0,0,0,0.3)]' : 'border-transparent',
                  )}
                  style={{ backgroundColor: color, borderColor: formColor === color ? 'white' : undefined }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={cancel} className="btn-secondary h-10 px-4 text-[13px]">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || !formName.trim()}
              className="btn-primary h-10 px-4 text-[13px]"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Genre grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {genres.map((genre) => (
          <div
            key={genre.id}
            className="group premium-card premium-card-hover relative overflow-hidden p-5"
            style={{
              backgroundImage: `radial-gradient(120% 120% at 0% 0%, ${genre.color}1a 0%, transparent 55%)`,
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border text-2xl"
                  style={{ borderColor: `${genre.color}55`, backgroundColor: `${genre.color}1a` }}
                >
                  {genre.icon}
                </span>
                <div>
                  <h3 className="text-base font-bold text-streamly-text">{genre.name}</h3>
                  <p className="text-xs text-streamly-text-muted">
                    /{genre.slug} · {counts[genre.slug] ?? 0} titles
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => startEdit(genre)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-transparent text-streamly-text-muted transition-all hover:border-streamly-border-light hover:bg-white/6 hover:text-streamly-text"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(genre.id)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-transparent text-streamly-text-muted transition-all hover:border-streamly-error/40 hover:bg-streamly-error/10 hover:text-streamly-error"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <span
              className="absolute inset-x-0 bottom-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${genre.color}80, transparent)` }}
            />
          </div>
        ))}
      </div>

      {genres.length === 0 ? (
        <div className="premium-card px-5 py-14 text-center">
          <Compass className="mx-auto h-8 w-8 text-streamly-purple" />
          <p className="mt-4 text-sm font-semibold text-streamly-text">No genres yet</p>
          <p className="mt-1 text-[13px] text-streamly-text-muted">Create your first genre to organise the library.</p>
        </div>
      ) : null}
    </div>
  )
}

export default AdminGenres
