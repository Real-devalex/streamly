import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Download, Play, Star } from 'lucide-react'
import type { Movie } from '@/types'
import { cn, formatRuntime } from '@/utils/helpers'

export interface MovieCardProps {
  movie: Movie
  /** Renders the oversized "Top 10"-style rank numeral beside the poster. */
  rank?: number
  onDownload?: (movie: Movie) => void
  className?: string
  showMeta?: boolean
  /** Skip lazy-loading for above-the-fold cards. */
  eager?: boolean
}

export function MovieCard({
  movie,
  rank,
  onDownload,
  className,
  showMeta = true,
  eager = false,
}: MovieCardProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  const card = (
    <article
      className={cn(
        'group relative isolate overflow-hidden rounded-card bg-streamly-card',
        'border border-white/6 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.9)]',
        'transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'hover:-translate-y-2 hover:border-streamly-purple/45',
        'hover:shadow-[0_30px_60px_-28px_rgba(139,92,246,0.75)]',
        className,
      )}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-streamly-surface">
        {!loaded && !failed ? (
          <div className="skeleton absolute inset-0" aria-hidden="true" />
        ) : null}

        {failed ? (
          <div
            className="absolute inset-0 grid place-items-center bg-gradient-to-br from-streamly-purple/35 via-streamly-indigo/25 to-streamly-blue/20"
            aria-hidden="true"
          >
            <span className="text-6xl font-black tracking-tighter text-white/25">
              {movie.title.charAt(0).toUpperCase()}
            </span>
          </div>
        ) : (
          <img
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={cn(
              'h-full w-full object-cover transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
              'group-hover:scale-[1.09] group-hover:brightness-[0.62]',
              loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-xl',
            )}
          />
        )}

        {/* Base scrim — always visible so the rating chip stays legible */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/75 via-black/25 to-transparent" />

        {/* Hover scrim */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-streamly-black via-streamly-black/55 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Diagonal light sweep */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
          <div className="absolute -inset-y-8 -left-1/3 w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/12 to-transparent blur-md transition-transform duration-[1200ms] ease-out group-hover:translate-x-[320%]" />
        </div>

        {/* Rating chip */}
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-white/12 bg-black/55 px-2.5 py-1 text-[11px] font-bold text-streamly-gold backdrop-blur-md">
          <Star className="h-3 w-3 fill-streamly-gold text-streamly-gold" />
          {movie.rating.toFixed(1)}
        </div>

        {/* Quick action */}
        {onDownload ? (
          <button
            type="button"
            aria-label={`Download ${movie.title}`}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onDownload(movie)
            }}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/55 text-streamly-text backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-streamly-cyan/60 hover:bg-streamly-cyan/20 hover:text-streamly-cyan focus-visible:scale-110"
          >
            <Download className="h-4 w-4" />
          </button>
        ) : null}

        {/* Centre play button */}
        <div className="absolute inset-0 grid place-items-center">
          <span
            className={cn(
              'grid h-14 w-14 place-items-center rounded-full text-white',
              'bg-gradient-to-br from-streamly-purple via-streamly-indigo to-streamly-blue',
              'shadow-[0_10px_40px_-6px_rgba(139,92,246,0.9)] ring-1 ring-white/25',
              'scale-50 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
              'group-hover:scale-100 group-hover:opacity-100',
            )}
          >
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          </span>
        </div>

        {/* Hover detail */}
        <div className="absolute inset-x-0 bottom-0 translate-y-3 p-4 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100">
          <p className="line-clamp-2 text-[13px] font-medium leading-snug text-streamly-text-secondary">
            {movie.description}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {movie.genres.slice(0, 2).map((genre) => (
              <span
                key={genre.id}
                className="rounded-full border border-white/12 bg-white/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-streamly-text-secondary"
              >
                {genre.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Meta below the poster */}
      {showMeta ? (
        <div className="px-1 pt-3">
          <h3 className="truncate text-[15px] font-semibold text-streamly-text transition-colors duration-300 group-hover:text-streamly-purple">
            {movie.title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-streamly-text-muted">
            <span>{movie.releaseYear}</span>
            <span className="h-1 w-1 rounded-full bg-streamly-text-muted/60" />
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRuntime(movie.runtimeMinutes)}
            </span>
          </div>
        </div>
      ) : null}
    </article>
  )

  const wrapped = (
    <Link
      to={`/movie/${movie.slug}`}
      className="block focus-visible:outline-none"
      aria-label={`View ${movie.title} (${movie.releaseYear})`}
    >
      {card}
    </Link>
  )

  if (rank !== undefined) {
    return (
      <div className="flex items-end gap-2 sm:gap-3">
        <span
          className="select-none pb-6 text-[64px] font-black leading-[0.75] tracking-tighter text-transparent sm:text-[86px]"
          style={{
            WebkitTextStroke: '2px rgba(148,163,184,0.45)',
          }}
          aria-hidden="true"
        >
          {rank}
        </span>
        <div className="min-w-0 flex-1">{wrapped}</div>
      </div>
    )
  }

  return wrapped
}

export default MovieCard
