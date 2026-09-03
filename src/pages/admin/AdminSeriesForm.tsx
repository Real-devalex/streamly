import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Save, Loader2, Plus, X, Search,
  Tv, Star, Calendar, Tag, Users, Link2, Image as ImageIcon,
} from 'lucide-react'
import {
  fetchSeriesById, createSeries, updateSeries,
  fetchGenres, searchCastMembers, createCastMember,
  notifyAllUsersOfNewContent,
} from '@/lib/api'
import { TMDBSearchModal } from '@/components/tmdb/TMDBSearchModal'
import type { TmdbDetails } from '@/lib/tmdb'
import { cn } from '@/utils/helpers'
import type { ContentStatus, Genre, CastMember } from '@/types'

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
  const [status, setStatus] = useState<ContentStatus>('draft')
  const [originalStatus, setOriginalStatus] = useState<ContentStatus>('draft')
  const [tmdbOpen, setTmdbOpen] = useState(false)
  const [tmdbNotice, setTmdbNotice] = useState('')
  const [totalSeasons, setTotalSeasons] = useState(0)
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
      setOriginalStatus(s.status)
      setTotalSeasons(s.totalSeasons)
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

  const applyTmdb = async (details: TmdbDetails) => {
    setTitle(details.title)
    if (!isEditing) setSlug(details.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
    if (details.description) setDescription(details.description)
    if (details.posterUrl) setPosterUrl(details.posterUrl)
    if (details.backdropUrl) setBackdropUrl(details.backdropUrl)
    if (details.trailerUrl) setTrailerUrl(details.trailerUrl)
    if (details.releaseYear) setReleaseYear(details.releaseYear)
    if (details.rating) setRating(details.rating)
    if (details.totalSeasons) setTotalSeasons(details.totalSeasons)

    const slugs = new Set(details.genreSlugs)
    const names = new Set(details.genreNames.map((n) => n.toLowerCase()))
    const matched = allGenres.filter((g) => slugs.has(g.slug) || names.has(g.name.toLowerCase()))
    if (matched.length > 0) setSelectedGenreIds(new Set(matched.map((g) => g.id)))

    const entries: CastEntry[] = []
    for (const member of details.cast) {
      const existing = (await searchCastMembers(member.name)).find(
        (r) => r.name.toLowerCase() === member.name.toLowerCase(),
      )
      const created = existing ?? (await createCastMember(member.name))
      entries.push({
        castMemberId: created?.id ?? `temp-${member.name}`,
        characterName: member.characterName,
        name: member.name,
      })
    }
    if (entries.length > 0) setCastEntries(entries)

    setTmdbNotice(`Imported “${details.title}” from TMDB — review the fields and save.`)
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

    if (result && status === 'published' && originalStatus !== 'published') {
      await notifyAllUsersOfNewContent(
        'series',
        result.title,
        result.slug,
        totalSeasons > 0 ? `Season ${totalSeasons}` : undefined,
      )
    }

    setSaving(false)
    if (result) navigate('/admin/series')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-streamly-purple" />
      </div>
    )
  }

  const inputClass =
    'h-11 w-full rounded-button border border-streamly-border bg-white/3 px-4 text-sm text-streamly-text placeholder:text-streamly-text-muted transition-colors focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20'
  const labelClass = 'mb-1.5 block text-[13px] font-semibold text-streamly-text-secondary'

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8">
      <button
        type="button"
        onClick={() => navigate('/admin/series')}
        className="group inline-flex items-center gap-2 text-sm font-semibold text-streamly-text-secondary transition-colors hover:text-streamly-text"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
        Back to series
      </button>

      {/* TMDB auto-fill */}
      <section className="premium-card relative overflow-hidden p-5 sm:p-6">
        <div className="aurora -left-10 -top-14 h-40 w-40 bg-streamly-blue/25" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-streamly-purple">Auto-fill</p>
            <h2 className="mt-1.5 text-base font-bold text-streamly-text">Import this series from TMDB</h2>
            <p className="mt-1 text-[13px] text-streamly-text-secondary">
              Artwork, synopsis, seasons, rating, genres, trailer and top billed cast.
            </p>
          </div>
          <button type="button" onClick={() => setTmdbOpen(true)} className="btn-primary h-11 px-5 text-sm">
            🎬 Search TMDB
          </button>
        </div>
        {tmdbNotice ? (
          <p className="relative mt-4 animate-fade-up rounded-button border border-streamly-success/30 bg-streamly-success/10 px-4 py-2.5 text-[13px] text-streamly-success">
            {tmdbNotice}
          </p>
        ) : null}
      </section>

      <TMDBSearchModal
        open={tmdbOpen}
        kind="tv"
        initialQuery={title}
        onClose={() => setTmdbOpen(false)}
        onSelect={(details) => void applyTmdb(details)}
      />

      {/* Basic Info */}
      <section className="premium-card space-y-6 p-6">
        <div className="flex items-center gap-2">
          <Tv className="h-4 w-4 text-streamly-purple" />
          <h2 className="text-base font-bold text-streamly-text">Basic Information</h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Title *</label>
            <input
              type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Long Winter"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Slug *</label>
            <input
              type="text" required value={slug} onChange={(e) => setSlug(e.target.value)}
              placeholder="the-long-winter"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <select
              value={status} onChange={(e) => setStatus(e.target.value as ContentStatus)}
              className={inputClass}
            >
              <option value="draft">Draft</option>
              <option value="upcoming">Upcoming</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="A short synopsis of the series..."
              className="w-full rounded-button border border-streamly-border bg-white/3 px-4 py-3 text-sm text-streamly-text placeholder:text-streamly-text-muted transition-colors focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
            />
          </div>

          <div>
            <label className={labelClass}>
              <Calendar className="mr-1 inline h-3 w-3" /> Release year
            </label>
            <input
              type="number" value={releaseYear} onChange={(e) => setReleaseYear(Number(e.target.value))}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              <Star className="mr-1 inline h-3 w-3" /> Rating (0–10)
            </label>
            <input
              type="number" min={0} max={10} step={0.1} value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>

        {/* Featured toggle */}
        <div className="flex items-center justify-between rounded-button border border-streamly-border bg-white/2 px-4 py-3.5">
          <div>
            <p className="text-[13px] font-semibold text-streamly-text">Featured on homepage</p>
            <p className="mt-0.5 text-xs text-streamly-text-muted">
              Featured series appear in the hero rotation and trending rails.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={featured}
            onClick={() => setFeatured((prev) => !prev)}
            className={cn(
              'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300',
              featured ? 'bg-gradient-to-r from-streamly-purple to-streamly-indigo' : 'bg-white/12',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]',
                featured ? 'translate-x-[22px]' : 'translate-x-0.5',
              )}
            />
          </button>
        </div>
      </section>

      {/* Media */}
      <section className="premium-card space-y-6 p-6">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-streamly-cyan" />
          <h2 className="text-base font-bold text-streamly-text">Artwork &amp; media</h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Poster URL</label>
            <input
              type="url" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)}
              className={inputClass}
              placeholder="https://..."
            />
            {posterUrl ? (
              <img
                src={posterUrl}
                alt=""
                className="mt-3 h-32 w-20 animate-scale-in rounded-lg border border-white/10 object-cover"
              />
            ) : null}
          </div>

          <div>
            <label className={labelClass}>Backdrop URL</label>
            <input
              type="url" value={backdropUrl} onChange={(e) => setBackdropUrl(e.target.value)}
              className={inputClass}
              placeholder="https://..."
            />
            {backdropUrl ? (
              <img
                src={backdropUrl}
                alt=""
                className="mt-3 h-20 w-full animate-scale-in rounded-lg border border-white/10 object-cover"
              />
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>
              <Link2 className="mr-1 inline h-3 w-3" /> Trailer URL (YouTube)
            </label>
            <input
              type="url" value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)}
              className={inputClass}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </div>
      </section>

      {/* Genres */}
      <section className="premium-card space-y-5 p-6">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-streamly-indigo" />
          <h2 className="text-base font-bold text-streamly-text">Genres</h2>
          <span className="ml-auto text-xs text-streamly-text-muted">
            {selectedGenreIds.size} selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {allGenres.map((genre) => (
            <button
              key={genre.id} type="button" onClick={() => toggleGenre(genre.id)}
              className={cn(
                'rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-300 hover:-translate-y-0.5',
                selectedGenreIds.has(genre.id)
                  ? 'border-transparent bg-gradient-to-r from-streamly-purple to-streamly-indigo text-white shadow-[0_10px_28px_-14px_rgba(139,92,246,0.95)]'
                  : 'border-streamly-border bg-white/3 text-streamly-text-secondary hover:border-streamly-border-light hover:text-streamly-text',
              )}
            >
              {genre.icon} {genre.name}
            </button>
          ))}
        </div>
      </section>

      {/* Cast */}
      <section className="premium-card space-y-5 p-6">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-streamly-cyan" />
          <h2 className="text-base font-bold text-streamly-text">Cast</h2>
          <span className="ml-auto text-xs text-streamly-text-muted">
            {castEntries.length} member{castEntries.length !== 1 ? 's' : ''}
          </span>
        </div>

        {castEntries.length > 0 ? (
          <div className="space-y-2">
            {castEntries.map((c, index) => (
              <div
                key={c.castMemberId}
                style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                className="flex animate-fade-up flex-wrap items-center gap-3 rounded-button border border-streamly-border bg-white/3 px-4 py-3 transition-colors duration-300 hover:border-streamly-border-light"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-streamly-purple/25 to-streamly-blue/15 text-xs font-bold text-streamly-purple ring-1 ring-white/10">
                  {c.name.charAt(0)}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-streamly-text">
                  {c.name}
                </span>
                <input
                  type="text"
                  placeholder="Character name"
                  value={c.characterName}
                  onChange={(e) => updateCastCharacter(c.castMemberId, e.target.value)}
                  className="h-9 w-full rounded-lg border border-streamly-border bg-white/3 px-3 text-xs text-streamly-text placeholder:text-streamly-text-muted focus:border-streamly-purple/60 focus:outline-none sm:w-44"
                />
                <button
                  type="button"
                  onClick={() => removeCast(c.castMemberId)}
                  aria-label={`Remove ${c.name}`}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-streamly-text-muted transition-colors hover:bg-streamly-error/12 hover:text-streamly-error"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-streamly-text-muted">
            No cast members added yet.
          </p>
        )}

        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-streamly-text-muted" />
          <input
            type="text"
            placeholder="Search cast members…"
            value={castSearch}
            onChange={(e) => setCastSearch(e.target.value)}
            className="h-11 w-full rounded-button border border-streamly-border bg-white/3 pl-10 pr-4 text-sm text-streamly-text placeholder:text-streamly-text-muted transition-colors focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
          />

          {castResults.length > 0 ? (
            <div className="glass-strong absolute z-20 mt-2 w-full animate-scale-in overflow-hidden rounded-card shadow-[0_40px_90px_-30px_rgba(0,0,0,1)]">
              {castResults.map((m) => (
                <button
                  key={m.id} type="button" onClick={() => addCastMember(m)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-streamly-text transition-colors hover:bg-white/8"
                >
                  {m.photoUrl ? (
                    <img src={m.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10" />
                  ) : (
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-streamly-purple/25 to-streamly-blue/15 text-xs font-bold text-streamly-purple">
                      {m.name[0]}
                    </span>
                  )}
                  {m.name}
                </button>
              ))}
            </div>
          ) : null}

          {castSearch.length >= 2 && castResults.length === 0 ? (
            <button
              type="button" onClick={() => void addNewCastMember()}
              className="mt-2 inline-flex items-center gap-2 rounded-button border border-streamly-purple/30 bg-streamly-purple/12 px-4 py-2 text-[13px] font-semibold text-streamly-purple transition-all duration-300 hover:-translate-y-0.5 hover:bg-streamly-purple/20"
            >
              <Plus className="h-4 w-4" /> Create “{castSearch}” as new cast member
            </button>
          ) : null}
        </div>
      </section>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          type="button" onClick={() => navigate('/admin/series')}
          className="btn-secondary h-11 px-6 text-sm"
        >
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary h-11 px-6 text-sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving…' : isEditing ? 'Update series' : 'Create series'}
        </button>
      </div>
    </form>
  )
}

export default AdminSeriesForm
