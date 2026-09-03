import type { Series } from '@/types'
import SeriesCard from './SeriesCard'

interface Props {
  series: Series[]
  columns?: 2 | 3 | 4 | 5
}

export default function SeriesGrid({ series, columns = 4 }: Props) {
  const colClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  }

  return (
    <div className={`grid ${colClasses[columns]} gap-4 md:gap-6`}>
      {series.map((s, i) => (
        <SeriesCard key={s.id} series={s} priority={i < 4} />
      ))}
    </div>
  )
}
