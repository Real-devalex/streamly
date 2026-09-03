import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Star, Calendar, Clock, Tv, ChevronDown, ChevronUp,
  Play, Download, ExternalLink
} from 'lucide-react'
import { fetchSeriesBySlug } from '@/lib/api'
import type { SeriesWithSeasons, Season, Episode } from '@/types'
import { formatRuntime } from '@/utils/helpers'

export default function SeriesDetails() {
  const { slug } = useParams<{ slug: string }>()
  const [series, setSeries] = useState<SeriesWithSeasons | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null)
  const [seasonData, setSeasonData] = useState<Record<string, Episode[]>>({})
  const [loadingEpisodes, setLoadingEpisodes] = useState(false)

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
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    )
  }

  if (!series) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black text-white">
        <Tv className="mb-4 h-16 w-16 text-neutral-600" />
        <h1 className="text-2xl font-bold">Series not found</h1>
        <Link to="/series" className="mt-4 text-purple-400 hover:underline">Browse all series</Link>
      </div>
    )
  }

  const backdrop = series.backdropUrl || `https://placehold.co/1920x1080/1a1a2e/6366f1?text=${encodeURIComponent(series.title)}`
  const poster = series.posterUrl || `https://placehold.co/400x600/1a1a2e/6366f1?text=${encodeURIComponent(series.title)}`

  const toggleSeason = (seasonId: string) => {
    setExpandedSeason((prev) => (prev === seasonId ? null : seasonId))
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Hero backdrop */}
      <div className="relative h-[60vh] min-h-[400px]">
        <img
          src={backdrop}
          alt={series.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />

        {/* Back button */}
        <Link
          to="/series"
          className="absolute top-24 left-4 z-10 flex items-center gap-2 rounded-xl bg-black/50 px-4 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:bg-black/70 sm:left-8"
        >
          <ArrowLeft className="h-4 w-4" />
          All Series
        </Link>
      </div>

      {/* Content */}
      <div className="relative -mt-48 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Poster */}
          <div className="flex-shrink-0">
            <img
              src={poster}
              alt={series.title}
              className="w-48 rounded-2xl shadow-2xl ring-1 ring-white/10 md:w-64"
            />
          </div>

          {/* Info */}
          <div className="flex-1 pt-4">
            <h1 className="text-3xl font-bold text-white md:text-5xl">{series.title}</h1>

            {/* Metadata */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg bg-purple-600/20 px-3 py-1.5">
                <Tv className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">TV Series</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-semibold text-white">{series.rating.toFixed(1)}</span>
              </div>
              {series.releaseYear > 0 && (
                <div className="flex items-center gap-1 text-neutral-400">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{series.releaseYear}</span>
                </div>
              )}
              {series.totalSeasons > 0 && (
                <span className="text-sm text-neutral-400">
                  {series.totalSeasons} Season{series.totalSeasons !== 1 ? 's' : ''}
                </span>
              )}
              {series.totalEpisodes > 0 && (
                <span className="text-sm text-neutral-400">
                  {series.totalEpisodes} Episodes
                </span>
              )}
            </div>

            {/* Genres */}
            {series.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {series.genres.map((genre) => (
                  <Link
                    key={genre.id}
                    to={`/genre/${genre.slug}`}
                    className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-white"
                  >
                    {genre.icon} {genre.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Description */}
            {series.description && (
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-neutral-300">
                {series.description}
              </p>
            )}

            {/* Cast */}
            {series.cast.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-semibold text-neutral-500 uppercase tracking-wider">Cast</h3>
                <div className="flex flex-wrap gap-3">
                  {series.cast.slice(0, 8).map((member) => (
                    <div key={member.id} className="flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-2">
                      {member.photoUrl ? (
                        <img src={member.photoUrl} alt={member.name} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600/20 text-xs font-bold text-purple-400">
                          {member.name[0]}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">{member.name}</p>
                        {member.characterName && (
                          <p className="text-xs text-neutral-500">as {member.characterName}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seasons & Episodes */}
        {series.seasons.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-bold text-white">Seasons & Episodes</h2>
            <div className="space-y-3">
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
        )}

        {/* Trailer */}
        {series.trailerUrl && (
          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-bold text-white">Trailer</h2>
            <div className="aspect-video overflow-hidden rounded-2xl">
              <iframe
                src={series.trailerUrl.replace('watch?v=', 'embed/')}
                className="h-full w-full"
                allowFullScreen
                title={`${series.title} trailer`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom spacing */}
      <div className="h-16" />
    </main>
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
    <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-neutral-800/50"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white">
            Season {season.seasonNumber}
          </span>
          {season.title && (
            <span className="text-sm text-neutral-400">— {season.title}</span>
          )}
          <span className="text-sm text-neutral-500">
            ({season.episodeCount} episode{season.episodeCount !== 1 ? 's' : ''})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-neutral-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-neutral-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-neutral-800">
          {isLoading ? (
            <div className="flex h-20 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            </div>
          ) : episodes && episodes.length > 0 ? (
            <div className="divide-y divide-neutral-800">
              {episodes.map((ep) => (
                <EpisodeRow key={ep.id} episode={ep} />
              ))}
            </div>
          ) : (
            <p className="px-6 py-4 text-sm text-neutral-500">No episodes yet.</p>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Episode Row ─────────────────────────────────────────────── */

function EpisodeRow({ episode }: { episode: Episode }) {
  const [showDownloads, setShowDownloads] = useState(false)

  return (
    <div className="px-6 py-4 transition-colors hover:bg-neutral-800/30">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        {episode.stillUrl ? (
          <img src={episode.stillUrl} alt={episode.title} className="h-16 w-28 flex-shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="flex h-16 w-28 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-800">
            <Play className="h-5 w-5 text-neutral-600" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-500">E{episode.episodeNumber}</span>
            <h4 className="truncate text-sm font-semibold text-white">{episode.title}</h4>
          </div>

          {episode.description && (
            <p className="mt-1 text-xs text-neutral-400 line-clamp-2">{episode.description}</p>
          )}

          <div className="mt-2 flex items-center gap-3">
            {episode.runtimeMinutes && (
              <span className="flex items-center gap-1 text-xs text-neutral-500">
                <Clock className="h-3 w-3" />
                {formatRuntime(episode.runtimeMinutes)}
              </span>
            )}
            {episode.airDate && (
              <span className="text-xs text-neutral-500">{episode.airDate}</span>
            )}
            {episode.downloadLinks.length > 0 && (
              <button
                onClick={() => setShowDownloads((prev) => !prev)}
                className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
              >
                <Download className="h-3 w-3" />
                Download
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Download options */}
      {showDownloads && episode.downloadLinks.length > 0 && (
        <div className="mt-3 ml-32 flex flex-wrap gap-2">
          {episode.downloadLinks.map((dl) => (
            <a
              key={dl.id}
              href={dl.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-neutral-800 px-3 py-2 text-xs text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-white"
            >
              <Download className="h-3 w-3" />
              {dl.quality}
              <span className="text-neutral-500">
                ({dl.fileSizeBytes ? `${(dl.fileSizeBytes / (1024 * 1024)).toFixed(0)}MB` : 'N/A'})
              </span>
              <ExternalLink className="h-3 w-3 text-neutral-500" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
