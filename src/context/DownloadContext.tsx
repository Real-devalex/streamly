import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Movie } from '@/types'
import { DownloadModal } from '@/components/download/DownloadModal'

interface DownloadContextValue {
  openDownload: (movie: Movie) => void
  closeDownload: () => void
}

const DownloadContext = createContext<DownloadContextValue | null>(null)

export function DownloadProvider({ children }: { children: ReactNode }) {
  const [movie, setMovie] = useState<Movie | null>(null)

  const openDownload = useCallback((next: Movie) => setMovie(next), [])
  const closeDownload = useCallback(() => setMovie(null), [])

  const value = useMemo(() => ({ openDownload, closeDownload }), [openDownload, closeDownload])

  return (
    <DownloadContext.Provider value={value}>
      {children}
      <DownloadModal movie={movie} isOpen={Boolean(movie)} onClose={closeDownload} />
    </DownloadContext.Provider>
  )
}

export function useDownload(): DownloadContextValue {
  const context = useContext(DownloadContext)
  if (!context) throw new Error('useDownload must be used inside <DownloadProvider>')
  return context
}
