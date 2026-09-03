import { BellOff, CheckCheck, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Notification } from '@/types'
import { NotificationItem } from './NotificationItem'

export interface NotificationDropdownProps {
  notifications: Notification[]
  loading: boolean
  unreadCount: number
  onSelect: (notification: Notification) => void
  onDismiss: (notification: Notification) => void
  onMarkAllRead: () => void
  onClose: () => void
}

export function NotificationDropdown({
  notifications,
  loading,
  unreadCount,
  onSelect,
  onDismiss,
  onMarkAllRead,
  onClose,
}: NotificationDropdownProps) {
  return (
    <div
      role="menu"
      aria-label="Notifications"
      className="glass-strong absolute right-0 top-14 z-30 w-[min(380px,calc(100vw-2rem))] animate-scale-in overflow-hidden rounded-card shadow-[0_50px_110px_-35px_rgba(0,0,0,1)] max-sm:fixed max-sm:inset-x-3 max-sm:top-[72px] max-sm:w-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
        <div>
          <p className="text-sm font-bold text-streamly-text">Notifications</p>
          <p className="text-[11px] text-streamly-text-muted">
            {unreadCount > 0 ? `${unreadCount} unread` : 'You’re all caught up'}
          </p>
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-streamly-text-secondary transition-all duration-300 hover:-translate-y-0.5 hover:border-streamly-purple/50 hover:text-streamly-text"
          >
            <CheckCheck className="h-3 w-3" />
            Mark all read
          </button>
        ) : null}
      </div>

      {/* List */}
      <div className="max-h-[min(60vh,440px)] overflow-y-auto">
        {loading ? (
          <div className="grid place-items-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-streamly-purple" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <span className="mx-auto grid h-14 w-14 animate-float place-items-center rounded-full border border-white/10 bg-white/5 text-streamly-text-muted">
              <BellOff className="h-6 w-6" />
            </span>
            <p className="mt-4 text-sm font-semibold text-streamly-text">No notifications yet</p>
            <p className="mt-1 text-[12.5px] text-streamly-text-muted">
              New releases, replies and reactions will land right here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.slice(0, 50).map((notification, index) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                index={index}
                onSelect={onSelect}
                onDismiss={onDismiss}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/8 px-4 py-2.5 text-center">
        <Link
          to="/movies"
          onClick={onClose}
          className="text-[12px] font-semibold text-streamly-text-secondary transition-colors hover:text-streamly-purple"
        >
          View all notifications
        </Link>
      </div>
    </div>
  )
}

export default NotificationDropdown
