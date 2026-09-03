import { Link } from 'react-router-dom'
import { Play, Star, Tv } from 'lucide-react'
import type { Series } from '@/types'

interface Props {
  series: Series
  priority?: boolean
}

export default function SeriesCard({ series, priority }: Props) {
  const poster = series.posterUrl || `https://placehold.co/400x600/1a1a2e/6366f1?text=${encodeURIComponent(series.title)}`

  return (
    <Link
      to={`/series/${series.slug}`}
      className="group relative block overflow-hidden rounded-xl bg-neutral-900 shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1"
    >
      <div className="aspect-[2/3] overflow-hidden">
        <img
          src={poster}
          alt={series.title}
          loading={priority ? 'eager' : 'lazy'}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 transition-transform duration-300 group-hover:scale-110">
            <Play className="h-6 w-6 text-white fill-white" />
          </div>
        </div>

        {/* Rating badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-black/70 backdrop-blur-sm px-2 py-1">
          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-semibold text-white">{series.rating.toFixed(1)}</span>
        </div>

        {/* Series badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-lg bg-purple-600/80 backdrop-blur-sm px-2 py-1">
          <Tv className="h-3 w-3 text-white" />
          <span className="text-xs font-semibold text-white">Series</span>
        </div>

        {/* Seasons count */}
        {series.totalSeasons > 0 && (
          <div className="absolute bottom-3 right-3 rounded-lg bg-black/70 backdrop-blur-sm px-2 py-1">
            <span className="text-xs text-neutral-300">
              {series.totalSeasons} Season{series.totalSeasons !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
          {series.title}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          {series.releaseYear > 0 && (
            <span className="text-xs text-neutral-400">{series.releaseYear}</span>
          )}
          {series.genres.length > 0 && (
            <span className="truncate text-xs text-neutral-500">
              {series.genres.slice(0, 2).map((g) => g.name).join(', ')}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
