import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/api'
import type { Notification } from '@/types'
import { cn } from '@/utils/helpers'
import { NotificationDropdown } from './NotificationDropdown'
import { NotificationToast } from './NotificationToast'

const POLL_MS = 60_000

export function NotificationBell() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [toast, setToast] = useState<Notification | null>(null)
  const knownIds = useRef<Set<string>>(new Set())
  const firstLoad = useRef(true)

  const load = useCallback(async () => {
    if (!user?.id) {
      setNotifications([])
      setLoading(false)
      return
    }
    const list = await fetchNotifications(user.id)
    setNotifications(list)
    setLoading(false)

    const fresh = list.find((n) => !knownIds.current.has(n.id) && !n.read)
    if (!firstLoad.current && fresh) setToast(fresh)
    firstLoad.current = false
    knownIds.current = new Set(list.map((n) => n.id))
  }, [user?.id])

  useEffect(() => {
    firstLoad.current = true
    void load()
    if (!user?.id) return
    const timer = window.setInterval(() => void load(), POLL_MS)
    return () => window.clearInterval(timer)
  }, [load, user?.id])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const goTo = useCallback(
    (notification: Notification) => {
      const { referenceType, referenceId } = notification
      if (!referenceId) return
      if (referenceType === 'movie') navigate(`/movie/${referenceId}`)
      else if (referenceType === 'series') navigate(`/series/${referenceId}`)
    },
    [navigate],
  )

  const handleSelect = useCallback(
    async (notification: Notification) => {
      setOpen(false)
      setToast(null)
      if (!notification.read) {
        setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
        await markNotificationRead(notification.id)
      }
      goTo(notification)
    },
    [goTo],
  )

  const handleDismiss = useCallback(async (notification: Notification) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
    await deleteNotification(notification.id)
  }, [])

  const handleMarkAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    if (user?.id) await markAllNotificationsRead(user.id)
  }, [user?.id])

  if (!isAuthenticated) return null

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className={cn(
          'relative grid h-10 w-10 place-items-center rounded-full border transition-all duration-300',
          open
            ? 'border-streamly-purple/60 bg-streamly-purple/15 text-streamly-text'
            : 'border-white/10 bg-white/5 text-streamly-text-secondary hover:border-streamly-purple/50 hover:bg-streamly-purple/15 hover:text-streamly-text',
        )}
      >
        <Bell className={cn('h-[18px] w-[18px] transition-transform duration-500', open && 'rotate-12')} />

        {unreadCount > 0 ? (
          <>
            <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-gradient-to-br from-streamly-purple to-streamly-error px-1 text-[10px] font-black leading-[18px] text-white ring-2 ring-streamly-black">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            <span className="pointer-events-none absolute inset-0 animate-glow-pulse rounded-full bg-streamly-purple/25 blur-[6px]" />
          </>
        ) : null}
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-20" aria-hidden="true" onClick={() => setOpen(false)} />
          <NotificationDropdown
            notifications={notifications}
            loading={loading}
            unreadCount={unreadCount}
            onSelect={handleSelect}
            onDismiss={handleDismiss}
            onMarkAllRead={handleMarkAllRead}
            onClose={() => setOpen(false)}
          />
        </>
      ) : null}

      <NotificationToast
        notification={toast}
        onClose={() => setToast(null)}
        onSelect={(notification) => void handleSelect(notification)}
      />
    </div>
  )
}

export default NotificationBell
