import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Save, Loader2, Plus, X, Search,
} from 'lucide-react'
import {
  fetchSeriesById, createSeries, updateSeries,
  fetchGenres, searchCastMembers, createCastMember,
} from '@/lib/api'
import type { Genre, CastMember } from '@/types'

interface CastEntry { castMemberId: string; characterName: string; name: string }

export function AdminSeriesForm() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [posterUrl, setPosterUrl] = useState('')
  const [backdropUrl, setBackdropUrl] = useState('')
  const [trailerUrl, setTrailerUrl] = useState('')
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear())
  const [rating, setRating] = useState(7.0)
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft')
  const [featured, setFeatured] = useState(false)

  const [allGenres, setAllGenres] = useState<Genre[]>([])
  const [selectedGenreIds, setSelectedGenreIds] = useState<Set<string>>(new Set())

  const [castEntries, setCastEntries] = useState<CastEntry[]>([])
  const [castSearch, setCastSearch] = useState('')
  const [castResults, setCastResults] = useState<CastMember[]>([])

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEditing)

  // Auto-generate slug
  const autoSlug = useMemo(() =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  [title])

  useEffect(() => {
    if (!isEditing) setSlug(autoSlug)
  }, [autoSlug, isEditing])

  // Load genres
  useEffect(() => { fetchGenres().then(setAllGenres) }, [])

  // Load existing series when editing
  useEffect(() => {
    if (!id) return
    fetchSeriesById(id).then((s) => {
      if (!s) return
      setTitle(s.title)
      setSlug(s.slug)
      setDescription(s.description)
      setPosterUrl(s.posterUrl)
      setBackdropUrl(s.backdropUrl)
      setTrailerUrl(s.trailerUrl ?? '')
      setReleaseYear(s.releaseYear)
      setRating(s.rating)
      setStatus(s.status)
      setFeatured(s.featured)
      setSelectedGenreIds(new Set(s.genres.map((g) => g.id)))
      setCastEntries(s.cast.map((c) => ({
        castMemberId: c.id,
        characterName: c.characterName ?? '',
        name: c.name,
      })))
      setLoading(false)
    })
  }, [id])

  // Cast search
  useEffect(() => {
    if (castSearch.length < 2) { setCastResults([]); return }
    const timer = setTimeout(() => {
      searchCastMembers(castSearch).then(setCastResults)
    }, 300)
    return () => clearTimeout(timer)
  }, [castSearch])

  const toggleGenre = (genreId: string) => {
    setSelectedGenreIds((prev) => {
      const next = new Set(prev)
      if (next.has(genreId)) next.delete(genreId)
      else next.add(genreId)
      return next
    })
  }

  const addCastMember = (member: CastMember) => {
    if (castEntries.some((c) => c.castMemberId === member.id)) return
    setCastEntries((prev) => [...prev, { castMemberId: member.id, characterName: '', name: member.name }])
    setCastSearch('')
    setCastResults([])
  }

  const addNewCastMember = async () => {
    const created = await createCastMember(castSearch)
    if (created) addCastMember(created)
  }

  const removeCast = (castMemberId: string) => {
    setCastEntries((prev) => prev.filter((c) => c.castMemberId !== castMemberId))
  }

  const updateCastCharacter = (castMemberId: string, characterName: string) => {
    setCastEntries((prev) => prev.map((c) =>
      c.castMemberId === castMemberId ? { ...c, characterName } : c,
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const input = {
      title, slug, description, posterUrl, backdropUrl, trailerUrl,
      releaseYear, rating, status, featured,
      genreIds: [...selectedGenreIds],
      cast: castEntries.map(({ castMemberId, characterName }) => ({ castMemberId, characterName })),
    }

    const result = isEditing && id
      ? await updateSeries(id, input)
      : await createSeries(input)

    setSaving(false)
    if (result) navigate('/admin/series')
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8">
      <button
        type="button"
        onClick={() => navigate('/admin/series')}
        className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to series
      </button>

      {/* Basic Info */}
      <section className="space-y-4 rounded-2xl border border-white/8 bg-white/3 p-6">
        <h2 className="text-lg font-bold text-white">Basic Info</h2>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-neutral-400">Title</label>
          <input
            type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-purple-500/60 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-neutral-400">Slug</label>
          <input
            type="text" required value={slug} onChange={(e) => setSlug(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-purple-500/60 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-neutral-400">Description</label>
          <textarea
            rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-purple-500/60 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-neutral-400">Release Year</label>
            <input
              type="number" value={releaseYear} onChange={(e) => setReleaseYear(Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-purple-500/60 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-neutral-400">Rating (0-10)</label>
            <input
              type="number" min={0} max={10} step={0.1} value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-purple-500/60 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input
              type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/20"
            />
            Featured
          </label>
          <select
            value={status} onChange={(e) => setStatus(e.target.value as typeof status)}
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-purple-500/60 focus:outline-none"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </section>

      {/* Media */}
      <section className="space-y-4 rounded-2xl border border-white/8 bg-white/3 p-6">
        <h2 className="text-lg font-bold text-white">Media</h2>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-neutral-400">Poster URL</label>
          <input
            type="url" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-purple-500/60 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            placeholder="https://..."
          />
          {posterUrl && (
            <img src={posterUrl} alt="" className="mt-3 h-32 w-20 rounded-lg object-cover ring-1 ring-white/10" />
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-neutral-400">Backdrop URL</label>
          <input
            type="url" value={backdropUrl} onChange={(e) => setBackdropUrl(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-purple-500/60 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            placeholder="https://..."
          />
          {backdropUrl && (
            <img src={backdropUrl} alt="" className="mt-3 h-20 w-full rounded-lg object-cover ring-1 ring-white/10" />
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-neutral-400">Trailer URL (YouTube)</label>
          <input
            type="url" value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-purple-500/60 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
      </section>

      {/* Genres */}
      <section className="space-y-4 rounded-2xl border border-white/8 bg-white/3 p-6">
        <h2 className="text-lg font-bold text-white">Genres</h2>
        <div className="flex flex-wrap gap-2">
          {allGenres.map((genre) => (
            <button
              key={genre.id} type="button" onClick={() => toggleGenre(genre.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                selectedGenreIds.has(genre.id)
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {genre.icon} {genre.name}
            </button>
          ))}
        </div>
      </section>

      {/* Cast */}
      <section className="space-y-4 rounded-2xl border border-white/8 bg-white/3 p-6">
        <h2 className="text-lg font-bold text-white">Cast</h2>

        {castEntries.length > 0 && (
          <div className="space-y-2">
            {castEntries.map((c) => (
              <div key={c.castMemberId} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
                <span className="flex-1 text-sm font-medium text-white">{c.name}</span>
                <input
                  type="text"
                  placeholder="Character name"
                  value={c.characterName}
                  onChange={(e) => updateCastCharacter(c.castMemberId, e.target.value)}
                  className="h-8 w-40 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white focus:border-purple-500/60 focus:outline-none"
                />
                <button type="button" onClick={() => removeCast(c.castMemberId)} className="text-neutral-500 hover:text-red-400">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search cast members…"
            value={castSearch}
            onChange={(e) => setCastSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-purple-500/60 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
          {castResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-2xl">
              {castResults.map((m) => (
                <button
                  key={m.id} type="button" onClick={() => addCastMember(m)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-white transition-colors hover:bg-white/10"
                >
                  {m.photoUrl ? (
                    <img src={m.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600/20 text-xs font-bold text-purple-400">{m.name[0]}</div>
                  )}
                  {m.name}
                </button>
              ))}
            </div>
          )}
          {castSearch.length >= 2 && castResults.length === 0 && (
            <button
              type="button" onClick={addNewCastMember}
              className="mt-2 flex items-center gap-2 rounded-xl bg-purple-600/20 px-4 py-2 text-sm text-purple-300 hover:bg-purple-600/30"
            >
              <Plus className="h-4 w-4" /> Create "{castSearch}" as new cast member
            </button>
          )}
        </div>
      </section>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          type="button" onClick={() => navigate('/admin/series')}
          className="rounded-xl border border-white/10 px-6 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit" disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:shadow-purple-500/30 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEditing ? 'Update series' : 'Create series'}
        </button>
      </div>
    </form>
  )
}

export default AdminSeriesForm
