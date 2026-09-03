import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Clock,
  Download,
  Film,
  Play,
  Share2,
  Star,
  Users,
} from 'lucide-react'
import { CommentSection } from '@/components/community/CommentSection'
import { MovieGrid } from '@/components/movie/MovieGrid'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDownload } from '@/context/DownloadContext'
import { fetchMovieBySlug, fetchRelatedMovies } from '@/lib/api'
import { cn, formatFileSize, formatRuntime } from '@/utils/helpers'
import type { Movie } from '@/types'

export function MovieDetails() {
  const { slug = '' } = useParams()
  const { openDownload } = useDownload()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [related, setRelated] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [shareHint, setShareHint] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const found = await fetchMovieBySlug(slug)
      if (cancelled) return
      setMovie(found)
      if (found) {
        const rel = await fetchRelatedMovies(found, 5)
        if (!cancelled) setRelated(rel)
      }
      if (!cancelled) setLoading(false)
    }
    void load()
    return () => { cancelled = true }
  }, [slug])

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-streamly-purple border-t-transparent" />
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-40 sm:px-6">
        <EmptyState
          icon={<Film className="h-7 w-7" />}
          title="We could not find that title"
          message="It may have been archived or the link is out of date."
          action={
            <Link to="/movies" className="btn-primary h-11 px-6 text-sm">
              Browse the library
            </Link>
          }
        />
      </div>
    )
  }

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: movie.title, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setShareHint(true)
        window.setTimeout(() => setShareHint(false), 2200)
      }
    } catch {
      /* user dismissed — no-op */
    }
  }

  const best = movie.downloadLinks[0]

  return (
    <div className="pb-10">
      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-[70vh] w-full overflow-hidden">
        {/* Backdrop */}
        <div className="absolute inset-0">
          <img
            src={movie.backdropUrl}
            alt=""
            className="h-full w-full scale-105 object-cover animate-hero-zoom"
          />
        </div>
        <div className="hero-gradient-left absolute inset-0" />
        <div className="hero-gradient-bottom absolute inset-0" />
        <div className="absolute inset-0 bg-streamly-black/35" />
        <div className="film-grain absolute inset-0" />

        <div className="relative mx-auto max-w-[1600px] px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-10">
          {/* Breadcrumb */}
          <Link
            to="/movies"
            className="group inline-flex animate-fade-in items-center gap-2 text-xs font-semibold text-streamly-text-secondary transition-colors hover:text-streamly-text"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to library
          </Link>

          <div className="mt-6 flex flex-col gap-8 sm:mt-8 md:flex-row md:items-end md:gap-10">
            {/* Poster */}
            <div className="group relative w-40 shrink-0 animate-fade-up sm:w-48 lg:w-56">
              <div className="overflow-hidden rounded-2xl border border-white/12 shadow-[0_40px_80px_-30px_rgba(0,0,0,1)]">
                <img
                  src={movie.posterUrl}
                  alt={`${movie.title} poster`}
                  className="aspect-[2/3] w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
              </div>
              <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[28px] bg-gradient-to-br from-streamly-purple/30 to-streamly-cyan/20 blur-2xl opacity-60" />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-streamly-purple/40 bg-streamly-purple/12 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-streamly-purple backdrop-blur-md">
                  Streamly Original
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/40 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-streamly-text-secondary backdrop-blur-md">
                  {movie.status === 'published' ? 'Available now' : movie.status}
                </span>
              </div>

              <h1 className="mt-4 animate-fade-up text-4xl font-black leading-[0.98] tracking-tight text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.85)] sm:text-5xl lg:text-6xl">
                {movie.title}
              </h1>

              {/* Meta */}
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                <RatingRing rating={movie.rating} />
                <span className="inline-flex items-center gap-1.5 text-sm text-streamly-text-secondary">
                  <Calendar className="h-4 w-4" />
                  {movie.releaseYear}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-streamly-text-secondary">
                  <Clock className="h-4 w-4" />
                  {formatRuntime(movie.runtimeMinutes)}
                </span>
                <span className="rounded-md border border-white/15 bg-white/8 px-2 py-1 text-[11px] font-bold tracking-wider text-streamly-text">
                  4K HDR
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-streamly-text-secondary">
                  <Users className="h-4 w-4" />
                  {movie.cast.length} cast
                </span>
              </div>

              {/* Genres */}
              <div className="mt-5 flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <Link
                    key={genre.id}
                    to={`/genre/${genre.slug}`}
                    className="rounded-full border border-white/12 bg-black/35 px-3.5 py-1.5 text-xs font-medium text-streamly-text-secondary backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-streamly-purple/50 hover:text-streamly-text"
                  >
                    {genre.icon} {genre.name}
                  </Link>
                ))}
              </div>

              <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-streamly-text-secondary sm:text-base">
                {movie.description}
              </p>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => openDownload(movie)}
                  className="btn-primary h-13 px-7 text-[15px]"
                >
                  <Download className="h-4 w-4" />
                  Download {best?.quality}
                  <span className="ml-1 text-[11px] font-medium opacity-75">
                    {formatFileSize(best?.fileSizeBytes)}
                  </span>
                </button>

                {movie.trailerUrl ? (
                  <a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-secondary h-13 px-6 text-[15px]"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Watch trailer
                  </a>
                ) : null}

                <button
                  type="button"
                  onClick={() => setSaved((previous) => !previous)}
                  aria-pressed={saved}
                  className={cn(
                    'grid h-13 w-13 place-items-center rounded-button border transition-all duration-300',
                    saved
                      ? 'border-streamly-purple/60 bg-streamly-purple/15 text-streamly-purple'
                      : 'border-white/12 bg-white/5 text-streamly-text-secondary hover:border-white/25 hover:text-streamly-text',
                  )}
                  aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}
                  title={saved ? 'Saved to watchlist' : 'Save to watchlist'}
                >
                  <Bookmark className={cn('h-[18px] w-[18px]', saved && 'fill-current')} />
                </button>

                <button
                  type="button"
                  onClick={share}
                  className="grid h-13 w-13 place-items-center rounded-button border border-white/12 bg-white/5 text-streamly-text-secondary transition-all duration-300 hover:border-white/25 hover:text-streamly-text"
                  aria-label="Share"
                  title="Share"
                >
                  <Share2 className="h-[18px] w-[18px]" />
                </button>

                {shareHint ? (
                  <span className="animate-fade-in text-xs font-semibold text-streamly-cyan">
                    Link copied to clipboard
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ STATS STRIP ══════════ */}
      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[
            { label: 'Release year', value: movie.releaseYear.toString(), icon: Calendar },
            { label: 'Runtime', value: formatRuntime(movie.runtimeMinutes), icon: Clock },
            { label: 'Audience score', value: `${movie.rating.toFixed(1)} / 10`, icon: Star },
            { label: 'Max quality', value: best?.quality ?? '1080p', icon: Film },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="premium-card premium-card-hover flex items-center gap-4 p-4 sm:p-5"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-streamly-purple/22 to-streamly-blue/12 text-streamly-purple ring-1 ring-white/10">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-streamly-text-muted">
                  {label}
                </p>
                <p className="truncate text-lg font-bold text-streamly-text">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ CAST ══════════ */}
      <section className="mx-auto mt-16 max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <SectionHeader eyebrow="On screen" title="Top cast" />
        <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {movie.cast.map((member) => (
            <div
              key={member.id}
              className="group w-36 shrink-0 text-center sm:w-40"
            >
              <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-2xl border border-streamly-border bg-streamly-card transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5 group-hover:border-streamly-purple/50 sm:h-40 sm:w-40">
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70" />
              </div>
              <p className="mt-3 truncate text-sm font-semibold text-streamly-text">
                {member.name}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-streamly-text-muted">
                {member.characterName}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ COMMENTS ══════════ */}
      <section className="mx-auto mt-16 max-w-4xl px-4 sm:px-6">
        <CommentSection movieId={movie.id} movieTitle={movie.title} />
      </section>

      {/* ══════════ RELATED ══════════ */}
      {related.length > 0 ? (
        <section className="mx-auto mt-20 max-w-[1600px] px-4 sm:px-6 lg:px-10">
          <SectionHeader
            eyebrow="Up next"
            title="You might also like"
            actionLabel="Browse all"
            actionTo="/movies"
          />
          <MovieGrid movies={related} onDownload={openDownload} columns="wide" />
        </section>
      ) : null}
    </div>
  )
}

/** Circular gradient rating meter. */
function RatingRing({ rating }: { rating: number }) {
  const percent = Math.max(0, Math.min(100, (rating / 10) * 100))
  const radius = 20
  const circumference = 2 * Math.PI * radius

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-12 w-12">
        <svg viewBox="0 0 48 48" className="h-12 w-12 -rotate-90">
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="3.5"
          />
          <defs>
            <linearGradient id="rating-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="55%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke="url(#rating-gradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (percent / 100) * circumference}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-[13px] font-bold text-streamly-text">
          {Math.round(percent)}
        </span>
      </div>
      <div className="leading-tight">
        <p className="flex items-center gap-1 text-sm font-semibold text-streamly-gold">
          <Star className="h-3.5 w-3.5 fill-streamly-gold" />
          {rating.toFixed(1)}
        </p>
        <p className="text-[11px] text-streamly-text-muted">Audience</p>
      </div>
    </div>
  )
}

export default MovieDetails
