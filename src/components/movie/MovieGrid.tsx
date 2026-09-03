import type { Movie } from '@/types'
import { cn } from '@/utils/helpers'
import { MovieCard } from './MovieCard'
import { EmptyState } from '@/components/ui/EmptyState'

export interface MovieGridProps {
  movies: Movie[]
  onDownload?: (movie: Movie) => void
  className?: string
  /** 2 → 5 responsive columns; `auto` picks the cinematic default. */
  columns?: 'auto' | 'compact' | 'wide'
  /** Start numbering from here (Top 10 rails). */
  rankOffset?: number
  loading?: boolean
  emptyTitle?: string
  emptyMessage?: string
}

const columnClasses: Record<NonNullable<MovieGridProps['columns']>, string> = {
  auto: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  compact: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
  wide: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
}

export function MovieGrid({
  movies,
  onDownload,
  className,
  columns = 'auto',
  rankOffset,
  loading = false,
  emptyTitle = 'Nothing here yet',
  emptyMessage = 'Try a different filter or search term.',
}: MovieGridProps) {
  if (loading) {
    return (
      <div className={cn('grid gap-5 sm:gap-6', columnClasses[columns], className)}>
        {Array.from({ length: columns === 'compact' ? 12 : 10 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="skeleton aspect-[2/3] w-full rounded-card" />
            <div className="skeleton h-4 w-3/4 rounded-full" />
            <div className="skeleton h-3 w-1/2 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  if (movies.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />
  }

  return (
    <div
      className={cn(
        'stagger-children grid gap-x-5 gap-y-8 sm:gap-x-6 sm:gap-y-10',
        columnClasses[columns],
        className,
      )}
    >
      {movies.map((movie, index) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          rank={rankOffset !== undefined ? rankOffset + index + 1 : undefined}
          onDownload={onDownload}
          eager={index < 5}
        />
      ))}
    </div>
  )
}

export default MovieGrid
