import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  Film,
  Globe,
  Hash,
  Link2,
  Plus,
  Save,
  Star,
  Tag,
  Trash2,
  Users,
} from 'lucide-react'
import {
  createMovie,
  updateMovie,
  deleteMovie,
  fetchMovieById,
  fetchGenres,
  searchCastMembers,
  createCastMember,
  updateCastMemberPhoto,
  type MovieInput,
} from '@/lib/api'
import { cn, slugify } from '@/utils/helpers'
import type { Genre, Movie } from '@/types'

export function AdminMovieForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // All available genres
  const [allGenres, setAllGenres] = useState<Genre[]>([])
  const [selectedGenreIds, setSelectedGenreIds] = useState<Set<string>>(new Set())

  // Cast
  const [movieCast, setMovieCast] = useState<Array<{ castMemberId: string; name: string; characterName: string; photoUrl: string }>>([])
  const [castSearch, setCastSearch] = useState('')
  const [castSearchResults, setCastSearchResults] = useState<Array<{ id: string; name: string }>>([])

  // Download links
  const [downloadLinks, setDownloadLinks] = useState<Array<{ quality: '1080p' | '720p' | '480p'; url: string; fileSizeBytes: number; destinationLabel: string }>>([])

  // Form fields
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    posterUrl: '',
    backdropUrl: '',
    trailerUrl: '',
    releaseYear: new Date().getFullYear(),
    runtimeMinutes: 120,
    rating: 7.0,
    status: 'draft' as Movie['status'],
    featured: false,
  })

  // Load data
  useEffect(() => {
    async function load() {
      setLoading(true)
      const [genres] = await Promise.all([fetchGenres()])
      setAllGenres(genres)

      if (id) {
        const movie = await fetchMovieById(id)
        if (movie) {
          setForm({
            title: movie.title,
            slug: movie.slug,
            description: movie.description,
            posterUrl: movie.posterUrl,
            backdropUrl: movie.backdropUrl,
            trailerUrl: movie.trailerUrl ?? '',
            releaseYear: movie.releaseYear,
            runtimeMinutes: movie.runtimeMinutes ?? 120,
            rating: movie.rating,
            status: movie.status,
            featured: movie.featured,
          })
          setSelectedGenreIds(new Set(movie.genres.map((g) => g.id)))
          setMovieCast(movie.cast.map((c) => ({ castMemberId: c.id, name: c.name, characterName: c.characterName ?? '', photoUrl: c.photoUrl ?? '' })))
          setDownloadLinks(movie.downloadLinks.map((dl) => ({ quality: dl.quality, url: dl.url, fileSizeBytes: dl.fileSizeBytes ?? 0, destinationLabel: dl.destinationLabel })))
        }
      }
      setLoading(false)
    }
    void load()
  }, [id])

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && form.title) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.title) }))
    }
  }, [form.title, isEditing])

  // Search cast
  useEffect(() => {
    if (castSearch.length < 2) {
      setCastSearchResults([])
      return
    }
    let cancelled = false
    void searchCastMembers(castSearch).then((results) => {
      if (!cancelled) setCastSearchResults(results.filter((r) => !movieCast.some((c) => c.castMemberId === r.id)))
    })
    return () => { cancelled = true }
  }, [castSearch, movieCast])

  const setField = (key: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const toggleGenre = (genreId: string) => {
    setSelectedGenreIds((prev) => {
      const next = new Set(prev)
      if (next.has(genreId)) next.delete(genreId)
      else next.add(genreId)
      return next
    })
  }

  const addCastMember = async (name: string) => {
    // Try to find existing
    const existing = castSearchResults.find((r) => r.name === name)
    if (existing) {
      setMovieCast((prev) => [...prev, { castMemberId: existing.id, name: existing.name, characterName: '', photoUrl: '' }])
      setCastSearch('')
      setCastSearchResults([])
      return
    }
    // Create new
    const member = await createCastMember(name)
    if (member) {
      setMovieCast((prev) => [...prev, { castMemberId: member.id, name: member.name, characterName: '', photoUrl: '' }])
    } else {
      // Fallback: use a temp ID for demo mode
      setMovieCast((prev) => [...prev, { castMemberId: `temp-${Date.now()}`, name, characterName: '', photoUrl: '' }])
    }
    setCastSearch('')
    setCastSearchResults([])
  }

  const updateCastCharacter = (index: number, characterName: string) => {
    setMovieCast((prev) => prev.map((c, i) => (i === index ? { ...c, characterName } : c)))
  }

  const updateCastPhoto = (index: number, photoUrl: string) => {
    setMovieCast((prev) => prev.map((c, i) => (i === index ? { ...c, photoUrl } : c)))
  }

  const removeCastMember = (index: number) => {
    setMovieCast((prev) => prev.filter((_, i) => i !== index))
  }

  const addDownloadLink = () => {
    const used = new Set(downloadLinks.map((dl) => dl.quality))
    const available: Array<'1080p' | '720p' | '480p'> = ['1080p', '720p', '480p']
    const next = available.find((q) => !used.has(q))
    if (next) {
      setDownloadLinks((prev) => [...prev, { quality: next, url: '', fileSizeBytes: 0, destinationLabel: 'Streamly CDN' }])
    }
  }

  const updateDownloadLink = (index: number, key: string, value: string | number) => {
    setDownloadLinks((prev) => prev.map((dl, i) => (i === index ? { ...dl, [key]: value } : dl)))
  }

  const removeDownloadLink = (index: number) => {
    setDownloadLinks((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.slug.trim()) {
      setError('Title and slug are required.')
      return
    }
    setSaving(true)
    setError('')

    const input: MovieInput = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      posterUrl: form.posterUrl.trim(),
      backdropUrl: form.backdropUrl.trim(),
      trailerUrl: form.trailerUrl.trim(),
      releaseYear: form.releaseYear,
      runtimeMinutes: form.runtimeMinutes,
      rating: form.rating,
      status: form.status,
      featured: form.featured,
      genreIds: [...selectedGenreIds],                      cast: movieCast.map((c) => ({ castMemberId: c.castMemberId, characterName: c.characterName, photoUrl: c.photoUrl })), 
      downloadLinks: downloadLinks.filter((dl) => dl.url.trim()),
    }

    try {
      if (isEditing && id) {
        await updateMovie(id, input)
      } else {
        await createMovie(input)
      }
      // Update cast member photos
      for (const c of movieCast) {
        if (c.photoUrl && c.castMemberId && !c.castMemberId.startsWith('temp-')) {
          await updateCastMemberPhoto(c.castMemberId, c.photoUrl)
        }
      }
      navigate('/admin/movies')
    } catch {
      setError('Failed to save movie. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this movie?')) return
    setSaving(true)
    await deleteMovie(id)
    navigate('/admin/movies')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-streamly-purple border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/admin/movies')}
          className="group inline-flex items-center gap-2 text-sm font-semibold text-streamly-text-secondary transition-colors hover:text-streamly-text"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to movies
        </button>
        {isEditing ? (
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-button border border-streamly-error/30 bg-streamly-error/10 px-4 text-[13px] font-semibold text-streamly-error transition-all hover:bg-streamly-error/20"
          >
            <Trash2 className="h-4 w-4" />
            Delete movie
          </button>
        ) : null}
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
        {error ? (
          <div className="rounded-button border border-streamly-error/30 bg-streamly-error/10 px-4 py-3 text-sm text-streamly-error">
            {error}
          </div>
        ) : null}

        {/* ── Basic Info ── */}
        <section className="premium-card space-y-6 p-6">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-streamly-purple" />
            <h2 className="text-base font-bold text-streamly-text">Basic Information</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[13px] font-semibold text-streamly-text-secondary">Title *</label>
              <input
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                type="text"
                required
                placeholder="e.g. Neon Horizon"
                className="h-11 w-full rounded-button border border-streamly-border bg-white/3 px-4 text-sm text-streamly-text placeholder:text-streamly-text-muted focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-streamly-text-secondary">Slug *</label>
              <input
                value={form.slug}
                onChange={(e) => setField('slug', e.target.value)}
                type="text"
                required
                placeholder="neon-horizon"
                className="h-11 w-full rounded-button border border-streamly-border bg-white/3 px-4 text-sm text-streamly-text placeholder:text-streamly-text-muted focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-streamly-text-secondary">Status</label>
              <select
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
                className="h-11 w-full rounded-button border border-streamly-border bg-white/3 px-4 text-sm text-streamly-text focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[13px] font-semibold text-streamly-text-secondary">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                rows={4}
                placeholder="A short synopsis of the movie..."
                className="w-full rounded-button border border-streamly-border bg-white/3 px-4 py-3 text-sm text-streamly-text placeholder:text-streamly-text-muted focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-streamly-text-secondary">
                <Calendar className="h-3.5 w-3.5" />
                Release Year
              </label>
              <input
                value={form.releaseYear}
                onChange={(e) => setField('releaseYear', parseInt(e.target.value) || 2025)}
                type="number"
                min={1888}
                max={2100}
                className="h-11 w-full rounded-button border border-streamly-border bg-white/3 px-4 text-sm text-streamly-text focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-streamly-text-secondary">
                <Clock className="h-3.5 w-3.5" />
                Runtime (minutes)
              </label>
              <input
                value={form.runtimeMinutes}
                onChange={(e) => setField('runtimeMinutes', parseInt(e.target.value) || 0)}
                type="number"
                min={1}
                className="h-11 w-full rounded-button border border-streamly-border bg-white/3 px-4 text-sm text-streamly-text focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-streamly-text-secondary">
                <Star className="h-3.5 w-3.5" />
                Rating (0–10)
              </label>
              <input
                value={form.rating}
                onChange={(e) => setField('rating', parseFloat(e.target.value) || 0)}
                type="number"
                min={0}
                max={10}
                step={0.1}
                className="h-11 w-full rounded-button border border-streamly-border bg-white/3 px-4 text-sm text-streamly-text focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
              />
            </div>

            <div className="flex items-end">
              <label className="inline-flex cursor-pointer items-center gap-3 rounded-button border border-streamly-border bg-white/3 px-4 py-3 text-sm font-medium text-streamly-text-secondary transition-colors hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setField('featured', e.target.checked)}
                  className="h-4 w-4 rounded border-streamly-border bg-streamly-surface text-streamly-purple focus:ring-streamly-purple/40"
                />
                Featured on homepage
              </label>
            </div>
          </div>
        </section>

        {/* ── Media ── */}
        <section className="premium-card space-y-6 p-6">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-streamly-cyan" />
            <h2 className="text-base font-bold text-streamly-text">Media & Links</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-streamly-text-secondary">
                <Link2 className="h-3.5 w-3.5" />
                Poster URL
              </label>
              <input
                value={form.posterUrl}
                onChange={(e) => setField('posterUrl', e.target.value)}
                type="url"
                placeholder="https://image.tmdb.org/t/p/w600/..."
                className="h-11 w-full rounded-button border border-streamly-border bg-white/3 px-4 text-sm text-streamly-text placeholder:text-streamly-text-muted focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
              />
              {form.posterUrl ? (
                <div className="mt-3 h-32 w-22 overflow-hidden rounded-lg border border-streamly-border">
                  <img src={form.posterUrl} alt="Poster preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              ) : null}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-streamly-text-secondary">
                <Link2 className="h-3.5 w-3.5" />
                Backdrop URL
              </label>
              <input
                value={form.backdropUrl}
                onChange={(e) => setField('backdropUrl', e.target.value)}
                type="url"
                placeholder="https://image.tmdb.org/t/p/w1280/..."
                className="h-11 w-full rounded-button border border-streamly-border bg-white/3 px-4 text-sm text-streamly-text placeholder:text-streamly-text-muted focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
              />
              {form.backdropUrl ? (
                <div className="mt-3 h-24 w-full overflow-hidden rounded-lg border border-streamly-border">
                  <img src={form.backdropUrl} alt="Backdrop preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              ) : null}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-streamly-text-secondary">
                <Link2 className="h-3.5 w-3.5" />
                Trailer URL (YouTube)
              </label>
              <input
                value={form.trailerUrl}
                onChange={(e) => setField('trailerUrl', e.target.value)}
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                className="h-11 w-full rounded-button border border-streamly-border bg-white/3 px-4 text-sm text-streamly-text placeholder:text-streamly-text-muted focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
              />
            </div>
          </div>
        </section>

        {/* ── Genres ── */}
        <section className="premium-card space-y-6 p-6">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-streamly-indigo" />
            <h2 className="text-base font-bold text-streamly-text">Genres</h2>
            <span className="ml-auto text-xs text-streamly-text-muted">{selectedGenreIds.size} selected</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {allGenres.map((genre) => (
              <button
                key={genre.id}
                type="button"
                onClick={() => toggleGenre(genre.id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-300',
                  selectedGenreIds.has(genre.id)
                    ? 'border-streamly-purple/60 bg-streamly-purple/20 text-streamly-text shadow-[0_0_20px_-8px_rgba(139,92,246,0.5)]'
                    : 'border-streamly-border bg-white/3 text-streamly-text-secondary hover:border-streamly-border-light hover:text-streamly-text',
                )}
              >
                <span>{genre.icon}</span>
                {genre.name}
              </button>
            ))}
          </div>
        </section>

        {/* ── Cast ── */}
        <section className="premium-card space-y-6 p-6">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-streamly-gold" />
            <h2 className="text-base font-bold text-streamly-text">Cast</h2>
            <span className="ml-auto text-xs text-streamly-text-muted">{movieCast.length} members</span>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              value={castSearch}
              onChange={(e) => setCastSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void addCastMember(castSearch)
                }
              }}
              type="text"
              placeholder="Search or type a new cast member name..."
              className="h-11 w-full rounded-button border border-streamly-border bg-white/3 px-4 text-sm text-streamly-text placeholder:text-streamly-text-muted focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
            />
            {castSearchResults.length > 0 ? (
              <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-button border border-streamly-border bg-streamly-dark shadow-xl">
                {castSearchResults.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => void addCastMember(member.name)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-streamly-text-secondary transition-colors hover:bg-white/5 hover:text-streamly-text"
                  >
                    <Users className="h-3.5 w-3.5 text-streamly-text-muted" />
                    {member.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => void addCastMember(castSearch)}
                  className="flex w-full items-center gap-3 border-t border-streamly-border px-4 py-2.5 text-left text-sm font-medium text-streamly-purple transition-colors hover:bg-white/5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add "{castSearch}" as new
                </button>
              </div>
            ) : castSearch.length >= 2 ? (
              <button
                type="button"
                onClick={() => void addCastMember(castSearch)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-streamly-purple/30 bg-streamly-purple/10 px-3 py-1 text-[11px] font-semibold text-streamly-purple hover:bg-streamly-purple/20"
              >
                Add new
              </button>
            ) : null}
          </div>

          {/* Cast list */}
          {movieCast.length > 0 ? (
            <div className="space-y-2">
              {movieCast.map((member, index) => (
                <div key={member.castMemberId} className="flex items-center gap-3 rounded-button border border-streamly-border bg-white/2 px-3 py-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-streamly-purple/25 to-streamly-blue/15 text-[11px] font-bold text-streamly-purple">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-streamly-text">{member.name}</span>
                  <input
                    value={member.characterName}
                    onChange={(e) => updateCastCharacter(index, e.target.value)}
                    type="text"
                    placeholder="Character name"
                    className="h-8 w-36 rounded border border-streamly-border bg-transparent px-3 text-xs text-streamly-text placeholder:text-streamly-text-muted focus:border-streamly-purple/60 focus:outline-none"
                  />
                  <input
                    value={member.photoUrl}
                    onChange={(e) => updateCastPhoto(index, e.target.value)}
                    type="url"
                    placeholder="Photo URL"
                    className="h-8 w-44 rounded border border-streamly-border bg-transparent px-3 text-xs text-streamly-text placeholder:text-streamly-text-muted focus:border-streamly-purple/60 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeCastMember(index)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-streamly-text-muted transition-colors hover:bg-streamly-error/12 hover:text-streamly-error"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-streamly-text-muted py-4">No cast members added yet</p>
          )}
        </section>

        {/* ── Download Links ── */}
        <section className="premium-card space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-streamly-success" />
              <h2 className="text-base font-bold text-streamly-text">Download Links</h2>
            </div>
            <button
              type="button"
              onClick={addDownloadLink}
              disabled={downloadLinks.length >= 3}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-streamly-success/30 bg-streamly-success/10 px-3 text-[13px] font-semibold text-streamly-success transition-all hover:bg-streamly-success/20 disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
              Add quality
            </button>
          </div>

          {downloadLinks.length > 0 ? (
            <div className="space-y-3">
              {downloadLinks.map((dl, index) => (
                <div key={index} className="rounded-button border border-streamly-border bg-white/2 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-streamly-purple/30 bg-streamly-purple/12 px-3 py-1 text-xs font-bold text-streamly-purple">
                        {dl.quality}
                      </span>
                      <span className="text-xs text-streamly-text-muted">· {dl.destinationLabel}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDownloadLink(index)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-streamly-text-muted transition-colors hover:bg-streamly-error/12 hover:text-streamly-error"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-[11px] font-semibold text-streamly-text-muted">URL</label>
                      <input
                        value={dl.url}
                        onChange={(e) => updateDownloadLink(index, 'url', e.target.value)}
                        type="url"
                        placeholder="https://cdn.streamly.app/..."
                        className="h-10 w-full rounded border border-streamly-border bg-transparent px-3 text-sm text-streamly-text placeholder:text-streamly-text-muted focus:border-streamly-purple/60 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-streamly-text-muted">
                        <Hash className="inline h-3 w-3" /> File size (MB)
                      </label>
                      <input
                        value={dl.fileSizeBytes ? Math.round(dl.fileSizeBytes / 1048576) : ''}
                        onChange={(e) => updateDownloadLink(index, 'fileSizeBytes', (parseInt(e.target.value) || 0) * 1048576)}
                        type="number"
                        placeholder="1400"
                        className="h-10 w-full rounded border border-streamly-border bg-transparent px-3 text-sm text-streamly-text placeholder:text-streamly-text-muted focus:border-streamly-purple/60 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-streamly-text-muted">Destination label</label>
                    <input
                      value={dl.destinationLabel}
                      onChange={(e) => updateDownloadLink(index, 'destinationLabel', e.target.value)}
                      type="text"
                      placeholder="Streamly CDN"
                      className="h-10 w-full rounded border border-streamly-border bg-transparent px-3 text-sm text-streamly-text placeholder:text-streamly-text-muted focus:border-streamly-purple/60 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-streamly-text-muted py-4">
              No download links added. Click "Add quality" to add one.
            </p>
          )}
        </section>

        {/* ── Submit ── */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() => navigate('/admin/movies')}
            className="btn-secondary h-11 px-6 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary h-11 px-6 text-sm"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : isEditing ? 'Update movie' : 'Create movie'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminMovieForm
