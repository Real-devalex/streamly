import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Star, Calendar, Clock, Tv, ChevronDown,
  Play, Download, ExternalLink, Layers, Share2, Users,
} from 'lucide-react'
import { fetchSeriesBySlug } from '@/lib/api'
import { EmptyState } from '@/components/ui/EmptyState'
import { Reveal } from '@/components/ui/Reveal'
import type { SeriesWithSeasons, Season, Episode } from '@/types'
import { cn, formatFileSize, formatRuntime } from '@/utils/helpers'

export default function SeriesDetails() {
  const { slug } = useParams<{ slug: string }>()
  const [series, setSeries] = useState<SeriesWithSeasons | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null)
  const [seasonData, setSeasonData] = useState<Record<string, Episode[]>>({})
  const [loadingEpisodes, setLoadingEpisodes] = useState(false)
  const [shareHint, setShareHint] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    fetchSeriesBySlug(slug).then((s) => {
      setSeries(s)
      setLoading(false)
      // Auto-expand first season
      if (s && s.seasons.length > 0) {
        setExpandedSeason(s.seasons[0].id)
      }
    })
  }, [slug])

  // Load episodes when season is expanded
  useEffect(() => {
    if (!expandedSeason || seasonData[expandedSeason]) return

    setLoadingEpisodes(true)
    import('@/lib/api').then(({ fetchSeasonWithEpisodes }) => {
      fetchSeasonWithEpisodes(expandedSeason).then((seasonWithEps) => {
        if (seasonWithEps) {
          setSeasonData((prev) => ({ ...prev, [expandedSeason]: seasonWithEps.episodes }))
        }
        setLoadingEpisodes(false)
      })
    })
  }, [expandedSeason, seasonData])

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-streamly-purple border-t-transparent" />
      </div>
    )
  }

  if (!series) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-40 sm:px-6">
        <EmptyState
          icon={<Tv className="h-7 w-7" />}
          title="We could not find that series"
          message="It may have been archived or the link is out of date."
          action={
            <Link to="/series" className="btn-primary h-11 px-6 text-sm">
              Browse all series
            </Link>
          }
        />
      </div>
    )
  }

  const isUpcoming = series.status === 'upcoming'

  const toggleSeason = (seasonId: string) => {
    setExpandedSeason((prev) => (prev === seasonId ? null : seasonId))
  }

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: series.title, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setShareHint(true)
        window.setTimeout(() => setShareHint(false), 2200)
      }
    } catch {
      /* user dismissed — no-op */
    }
  }

  return (
    <div className="pb-10">
      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-[70vh] w-full overflow-hidden pt-20">
        {/* Backdrop */}
        <div className="absolute inset-0">
          {series.backdropUrl ? (
            <img
              src={series.backdropUrl}
              alt=""
              className="h-full w-full scale-105 object-cover animate-hero-zoom"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-streamly-purple/30 via-streamly-dark to-streamly-black" />
          )}
        </div>
        <div className="hero-gradient-left absolute inset-0" />
        <div className="hero-gradient-bottom absolute inset-0" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-streamly-black via-streamly-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-streamly-black/25" />
        <div className="film-grain absolute inset-0" />

        <div className="relative mx-auto max-w-[1600px] px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-10">
          {/* Breadcrumb */}
          <Link
            to="/series"
            className="group inline-flex animate-fade-in items-center gap-2 text-xs font-semibold text-streamly-text-secondary transition-colors hover:text-streamly-text"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
            All series
          </Link>

          <div className="mt-6 flex flex-col gap-8 sm:mt-8 md:flex-row md:items-end md:gap-10">
            {/* Poster */}
            <div className="group relative w-40 shrink-0 animate-fade-up sm:w-48 lg:w-56">
              <div className="overflow-hidden rounded-2xl border border-white/12 shadow-[0_40px_80px_-30px_rgba(0,0,0,1)]">
                {series.posterUrl ? (
                  <img
                    src={series.posterUrl}
                    alt={`${series.title} poster`}
                    className="aspect-[2/3] w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                ) : (
                  <div className="grid aspect-[2/3] w-full place-items-center bg-gradient-to-br from-streamly-blue/30 to-streamly-purple/20 text-6xl font-black text-white/25">
                    {series.title.charAt(0)}
                  </div>
                )}
              </div>
              <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[28px] bg-gradient-to-br from-streamly-purple/30 to-streamly-cyan/20 opacity-60 blur-2xl" />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-streamly-purple/40 bg-streamly-purple/12 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-streamly-purple backdrop-blur-md">
                  <Tv className="h-3 w-3" />
                  TV Series
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/40 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-streamly-text-secondary backdrop-blur-md">
                  {series.status === 'published'
                    ? 'Streaming now'
                    : isUpcoming
                      ? '🎬 Coming soon'
                      : series.status}
                </span>
              </div>

              <h1 className="mt-4 animate-fade-up text-4xl font-black leading-[0.98] tracking-tight text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.85)] sm:text-5xl lg:text-6xl">
                {series.title}
              </h1>

              {/* Meta */}
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                {!isUpcoming ? <RatingRing rating={series.rating} /> : null}
                {series.releaseYear > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-sm text-streamly-text-secondary">
                    <Calendar className="h-4 w-4" />
                    {series.releaseYear}
                  </span>
                ) : null}
                {series.totalSeasons > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-sm text-streamly-text-secondary">
                    <Layers className="h-4 w-4" />
                    {series.totalSeasons} season{series.totalSeasons !== 1 ? 's' : ''}
                  </span>
                ) : null}
                {series.totalEpisodes > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-sm text-streamly-text-secondary">
                    <Play className="h-4 w-4" />
                    {series.totalEpisodes} episodes
                  </span>
                ) : null}
                {series.cast.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-sm text-streamly-text-secondary">
                    <Users className="h-4 w-4" />
                    {series.cast.length} cast
                  </span>
                ) : null}
              </div>

              {/* Genres */}
              {series.genres.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {series.genres.map((genre) => (
                    <Link
                      key={genre.id}
                      to={`/genre/${genre.slug}`}
                      className="rounded-full border border-white/12 bg-black/35 px-3.5 py-1.5 text-xs font-medium text-streamly-text-secondary backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-streamly-purple/50 hover:text-streamly-text"
                    >
                      {genre.icon} {genre.name}
                    </Link>
                  ))}
                </div>
              ) : null}

              {series.description ? (
                <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-streamly-text-secondary sm:text-base">
                  {series.description}
                </p>
              ) : null}

              {/* Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {isUpcoming ? (
                  <span className="inline-flex h-13 items-center gap-2 rounded-button border border-streamly-warning/40 bg-streamly-warning/10 px-7 text-[15px] font-bold text-streamly-warning">
                    <Clock className="h-4 w-4 animate-spin-slow" />
                    Premieres {series.releaseYear || 'soon'}
                  </span>
                ) : series.seasons.length > 0 ? (
                  <a href="#seasons" className="btn-primary h-13 px-7 text-[15px]">
                    <Play className="h-4 w-4 fill-current" />
                    Browse episodes
                  </a>
                ) : null}

                {series.trailerUrl ? (
                  <a
                    href={series.trailerUrl}
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

      {/* ══════════ CAST ══════════ */}
      {series.cast.length > 0 ? (
        <Reveal className="mx-auto mt-14 max-w-[1600px] px-4 sm:px-6 lg:px-10">
          <h2 className="text-xl font-black tracking-tight text-streamly-text sm:text-2xl">
            Top billed cast
          </h2>
          <div className="scrollbar-hide mask-fade-r -mx-4 mt-6 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
            {series.cast.map((member) => (
              <div key={member.id} className="w-[104px] shrink-0 text-center sm:w-[120px]">
                <div className="relative mx-auto h-[104px] w-[104px] overflow-hidden rounded-full border border-white/10 bg-streamly-surface transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 sm:h-[120px] sm:w-[120px]">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-streamly-purple/25 to-streamly-blue/15 text-2xl font-black text-white/30">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="mt-3 truncate text-[13px] font-semibold text-streamly-text">
                  {member.name}
                </p>
                {member.characterName ? (
                  <p className="mt-0.5 truncate text-[11px] text-streamly-text-muted">
                    {member.characterName}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </Reveal>
      ) : null}

      {/* ══════════ SEASONS & EPISODES ══════════ */}
      {series.seasons.length > 0 ? (
        <Reveal className="mx-auto mt-16 max-w-[1600px] px-4 sm:px-6 lg:px-10">
          <div id="seasons" className="scroll-mt-28">
            <h2 className="text-xl font-black tracking-tight text-streamly-text sm:text-2xl">
              Seasons &amp; episodes
            </h2>
            <p className="mt-1.5 text-sm text-streamly-text-secondary">
              {series.totalSeasons || series.seasons.length} season
              {(series.totalSeasons || series.seasons.length) !== 1 ? 's' : ''} · pick one to expand.
            </p>

            <div className="mt-6 space-y-3">
              {series.seasons.map((season) => (
                <SeasonAccordion
                  key={season.id}
                  season={season}
                  isExpanded={expandedSeason === season.id}
                  episodes={seasonData[season.id]}
                  isLoading={expandedSeason === season.id && loadingEpisodes}
                  onToggle={() => toggleSeason(season.id)}
                />
              ))}
            </div>
          </div>
        </Reveal>
      ) : null}

      {/* ══════════ TRAILER ══════════ */}
      {series.trailerUrl ? (
        <Reveal className="mx-auto mt-16 max-w-[1600px] px-4 sm:px-6 lg:px-10">
          <h2 className="text-xl font-black tracking-tight text-streamly-text sm:text-2xl">Trailer</h2>
          <div className="premium-card mt-6 aspect-video overflow-hidden p-0">
            <iframe
              src={series.trailerUrl.replace('watch?v=', 'embed/')}
              className="h-full w-full"
              allowFullScreen
              title={`${series.title} trailer`}
            />
          </div>
        </Reveal>
      ) : null}
    </div>
  )
}

/* ── Rating ring ─────────────────────────────────────────────── */

function RatingRing({ rating }: { rating: number }) {
  const pct = Math.max(0, Math.min(100, (rating / 10) * 100))
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className="relative grid h-12 w-12 place-items-center rounded-full"
        style={{
          background: `conic-gradient(var(--color-streamly-gold) ${pct}%, rgba(255,255,255,0.1) ${pct}%)`,
        }}
      >
        <span className="grid h-[42px] w-[42px] place-items-center rounded-full bg-streamly-black text-[13px] font-black tabular-nums text-streamly-gold">
          {rating.toFixed(1)}
        </span>
      </span>
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-streamly-text-secondary">
        <Star className="h-3.5 w-3.5 fill-streamly-gold text-streamly-gold" />
        Audience
      </span>
    </span>
  )
}

/* ── Season Accordion ────────────────────────────────────────── */

function SeasonAccordion({
  season, isExpanded, episodes, isLoading, onToggle,
}: {
  season: Season
  isExpanded: boolean
  episodes?: Episode[]
  isLoading: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={cn(
        'premium-card overflow-hidden transition-colors duration-400',
        isExpanded && 'border-streamly-purple/40',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-300 hover:bg-white/4 sm:px-6"
      >
        <div className="flex min-w-0 items-center gap-3">
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
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold text-streamly-text">
              Season {season.seasonNumber}
              {season.title ? (
                <span className="ml-2 text-sm font-medium text-streamly-text-muted">
                  {season.title}
                </span>
              ) : null}
            </p>
            <p className="mt-0.5 text-xs text-streamly-text-muted">
              {season.episodeCount} episode{season.episodeCount !== 1 ? 's' : ''}
              {season.releaseYear ? ` · ${season.releaseYear}` : ''}
            </p>
          </div>
        </div>

        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-streamly-text-muted transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
            isExpanded && 'rotate-180 text-streamly-purple',
          )}
        />
      </button>

      <div
        className={cn(
          'grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-streamly-border">
            {isLoading ? (
              <div className="space-y-3 p-5 sm:p-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="skeleton h-16 w-28 shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="skeleton h-3.5 w-1/3 rounded" />
                      <div className="skeleton h-3 w-2/3 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : episodes && episodes.length > 0 ? (
              <div className="divide-y divide-streamly-border/60">
                {episodes.map((ep) => (
                  <EpisodeRow key={ep.id} episode={ep} />
                ))}
              </div>
            ) : (
              <p className="px-6 py-6 text-center text-sm text-streamly-text-muted">
                No episodes published for this season yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Episode Row ─────────────────────────────────────────────── */

function EpisodeRow({ episode }: { episode: Episode }) {
  const [showDownloads, setShowDownloads] = useState(false)

  return (
    <div className="group px-5 py-4 transition-colors duration-300 hover:bg-white/3 sm:px-6">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg border border-white/8 bg-streamly-surface">
          {episode.stillUrl ? (
            <img
              src={episode.stillUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-streamly-purple/20 to-streamly-blue/10">
              <Play className="h-5 w-5 text-white/30" />
            </div>
          )}
          <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Play className="h-5 w-5 fill-white text-white" />
          </span>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-white/10 bg-white/6 px-1.5 py-0.5 text-[10px] font-black tabular-nums text-streamly-text-muted">
              E{episode.episodeNumber}
            </span>
            <h4 className="truncate text-sm font-semibold text-streamly-text transition-colors duration-300 group-hover:text-streamly-purple">
              {episode.title}
            </h4>
          </div>

          {episode.description ? (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-streamly-text-secondary">
              {episode.description}
            </p>
          ) : null}

          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            {episode.runtimeMinutes ? (
              <span className="inline-flex items-center gap-1 text-xs text-streamly-text-muted">
                <Clock className="h-3 w-3" />
                {formatRuntime(episode.runtimeMinutes)}
              </span>
            ) : null}
            {episode.airDate ? (
              <span className="inline-flex items-center gap-1 text-xs text-streamly-text-muted">
                <Calendar className="h-3 w-3" />
                {episode.airDate}
              </span>
            ) : null}
            {episode.downloadLinks.length > 0 ? (
              <button
                type="button"
                onClick={() => setShowDownloads((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-full border border-streamly-purple/30 bg-streamly-purple/10 px-2.5 py-1 text-[11px] font-bold text-streamly-purple transition-all duration-300 hover:-translate-y-0.5 hover:bg-streamly-purple/20"
              >
                <Download className="h-3 w-3" />
                {showDownloads ? 'Hide' : 'Download'}
                <ChevronDown
                  className={cn('h-3 w-3 transition-transform duration-300', showDownloads && 'rotate-180')}
                />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Download options */}
      {showDownloads && episode.downloadLinks.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2 pl-0 sm:pl-32">
          {episode.downloadLinks.map((dl, index) => (
            <a
              key={dl.id}
              href={dl.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ animationDelay: `${index * 50}ms` }}
              className="inline-flex animate-fade-up items-center gap-2 rounded-button border border-streamly-border bg-white/4 px-3 py-2 text-xs font-semibold text-streamly-text-secondary transition-all duration-300 hover:-translate-y-0.5 hover:border-streamly-cyan/50 hover:bg-streamly-cyan/10 hover:text-streamly-text"
            >
              <Download className="h-3 w-3" />
              {dl.quality}
              <span className="text-streamly-text-muted">{formatFileSize(dl.fileSizeBytes)}</span>
              <ExternalLink className="h-3 w-3 text-streamly-text-muted" />
            </a>
          ))}
        </div>
      ) : null}
    </div>
  )
}
