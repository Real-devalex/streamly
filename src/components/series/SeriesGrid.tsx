import type { Series } from '@/types'
import SeriesCard from './SeriesCard'
import { cn } from '@/utils/helpers'

interface Props {
  series: Series[]
  columns?: 2 | 3 | 4 | 5
  className?: string
}

const COLUMN_CLASSES = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
} as const

export default function SeriesGrid({ series, columns = 5, className }: Props) {
  return (
    <div className={cn('stagger-children grid gap-4 sm:gap-5', COLUMN_CLASSES[columns], className)}>
      {series.map((s, index) => (
        <SeriesCard key={s.id} series={s} priority={index < 5} />
      ))}
    </div>
  )
}
