import { useState, useEffect } from 'react'
import { Tv } from 'lucide-react'
import SeriesGrid from '@/components/series/SeriesGrid'
import { fetchSeries } from '@/lib/api'
import type { Series } from '@/types'

export default function SeriesList() {
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSeries({ status: 'published', sort: 'rating' }).then((s) => {
      setSeries(s)
      setLoading(false)
    })
  }, [])

  return (
    <main className="min-h-screen bg-black pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20">
            <Tv className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">TV Series</h1>
            <p className="text-sm text-neutral-400">Binge-worthy shows and original series</p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          </div>
        ) : series.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <Tv className="mb-4 h-16 w-16 text-neutral-700" />
            <h2 className="text-xl font-semibold text-white">No series yet</h2>
            <p className="mt-2 text-neutral-400">TV series will appear here once they're added.</p>
          </div>
        ) : (
          <SeriesGrid series={series} columns={5} />
        )}
      </div>
    </main>
  )
}
