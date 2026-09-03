import { useEffect, useState } from 'react'
import { Bookmark } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { isInWatchlist, toggleWatchlist } from '@/lib/api'
import { cn } from '@/utils/helpers'

interface WatchlistButtonProps {
  movieId: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function WatchlistButton({ movieId, size = 'md', className }: WatchlistButtonProps) {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!user) { setChecking(false); return }
    let cancelled = false
    void isInWatchlist(user.id, movieId).then((result) => {
      if (!cancelled) { setSaved(result); setChecking(false) }
    })
    return () => { cancelled = true }
  }, [user, movieId])

  const toggle = async () => {
    if (!user) {
      window.location.href = '/auth/signin'
      return
    }
    const isNow = await toggleWatchlist(user.id, movieId)
    setSaved(isNow)
  }

  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-11 w-11',
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        void toggle()
      }}
      disabled={checking}
      className={cn(
        'grid place-items-center rounded-full border transition-all duration-300',
        sizes[size],
        saved
          ? 'border-streamly-purple/60 bg-streamly-purple/15 text-streamly-purple'
          : 'border-white/12 bg-white/5 text-streamly-text-secondary hover:border-white/25 hover:text-streamly-text',
        className,
      )}
      aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}
      title={saved ? 'Remove from watchlist' : 'Save to watchlist'}
    >
      <Bookmark className={cn(size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4', saved && 'fill-current')} />
    </button>
  )
}

export default WatchlistButton
