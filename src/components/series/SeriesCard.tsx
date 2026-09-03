import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Play, Star, Tv } from 'lucide-react'
import type { Series } from '@/types'
import { cn } from '@/utils/helpers'

interface Props {
  series: Series
  priority?: boolean
}

export default function SeriesCard({ series, priority }: Props) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const isUpcoming = series.status === 'upcoming'

  return (
    <Link
      to={`/series/${series.slug}`}
      aria-label={`View ${series.title}`}
      className="block focus-visible:outline-none"
    >
      <article
        className={cn(
          'group relative isolate overflow-hidden rounded-card bg-streamly-card',
          'border border-white/6 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.9)]',
          'transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'hover:-translate-y-2 hover:border-streamly-purple/45',
          'hover:shadow-[0_30px_60px_-28px_rgba(139,92,246,0.75)]',
        )}
      >
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-streamly-surface">
          {!loaded && !failed ? <div className="skeleton absolute inset-0" aria-hidden="true" /> : null}

          {failed || !series.posterUrl ? (
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-streamly-blue/30 via-streamly-indigo/25 to-streamly-purple/20">
              <span className="text-6xl font-black tracking-tighter text-white/25">
                {series.title.charAt(0).toUpperCase()}
              </span>
            </div>
          ) : (
            <img
              src={series.posterUrl}
              alt={`${series.title} poster`}
              loading={priority ? 'eager' : 'lazy'}
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

          {/* Scrims */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/75 via-black/25 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-streamly-black via-streamly-black/55 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Light sweep */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
            <div className="absolute -inset-y-8 -left-1/3 w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/12 to-transparent blur-md transition-transform duration-[1200ms] ease-out group-hover:translate-x-[320%]" />
          </div>

          {/* Series chip */}
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-streamly-purple/40 bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-streamly-purple backdrop-blur-md">
            <Tv className="h-3 w-3" />
            Series
          </span>

          {/* Rating / upcoming */}
          {isUpcoming ? (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-streamly-warning/40 bg-black/60 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-streamly-warning backdrop-blur-md">
              <Clock className="h-3 w-3" />
              Soon
            </span>
          ) : (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/12 bg-black/55 px-2.5 py-1 text-[11px] font-bold text-streamly-gold backdrop-blur-md">
              <Star className="h-3 w-3 fill-streamly-gold text-streamly-gold" />
              {series.rating.toFixed(1)}
            </span>
          )}

          {/* Play */}
          {!isUpcoming ? (
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
          ) : null}

          {/* Hover detail */}
          <div className="absolute inset-x-0 bottom-0 translate-y-3 p-4 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100">
            <p className="line-clamp-2 text-[13px] font-medium leading-snug text-streamly-text-secondary">
              {series.description}
            </p>
          </div>

          {series.totalSeasons > 0 ? (
            <span className="absolute bottom-3 right-3 rounded-full border border-white/12 bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-streamly-text-secondary backdrop-blur-md transition-opacity duration-300 group-hover:opacity-0">
              {series.totalSeasons} season{series.totalSeasons !== 1 ? 's' : ''}
            </span>
          ) : null}
        </div>

        {/* Meta */}
        <div className="px-3.5 pb-3.5 pt-3">
          <h3 className="truncate text-[15px] font-semibold text-streamly-text transition-colors duration-300 group-hover:text-streamly-purple">
            {series.title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-streamly-text-muted">
            {series.releaseYear > 0 ? <span>{series.releaseYear}</span> : null}
            {series.genres.length > 0 ? (
              <>
                <span className="h-1 w-1 rounded-full bg-streamly-text-muted/60" />
                <span className="truncate">
                  {series.genres.slice(0, 2).map((g) => g.name).join(' · ')}
                </span>
              </>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  )
}
