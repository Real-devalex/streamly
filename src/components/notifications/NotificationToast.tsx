import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bell, X } from 'lucide-react'
import type { Notification } from '@/types'

export interface NotificationToastProps {
  notification: Notification | null
  onClose: () => void
  onSelect: (notification: Notification) => void
  /** Auto-dismiss delay in ms. */
  duration?: number
}

export function NotificationToast({ notification, onClose, onSelect, duration = 5000 }: NotificationToastProps) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (!notification) return
    setLeaving(false)
    const hide = window.setTimeout(() => setLeaving(true), duration - 400)
    const close = window.setTimeout(onClose, duration)
    return () => {
      window.clearTimeout(hide)
      window.clearTimeout(close)
    }
  }, [notification, duration, onClose])

  if (!notification) return null

  return createPortal(
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-[120] w-[min(360px,calc(100vw-2.5rem))]"
      role="status"
      aria-live="polite"
    >
      <div
        className="glass-strong pointer-events-auto relative overflow-hidden rounded-card p-4 shadow-[0_40px_90px_-30px_rgba(0,0,0,1)] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: leaving ? 'translateY(14px) scale(0.97)' : 'translateY(0) scale(1)',
          opacity: leaving ? 0 : 1,
          animation: leaving ? undefined : 'scale-in 0.45s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        <span className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-streamly-purple via-streamly-indigo to-streamly-cyan" />

        <button
          type="button"
          onClick={() => onSelect(notification)}
          className="flex w-full items-start gap-3 text-left"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-streamly-purple/30 to-streamly-blue/15 text-streamly-purple ring-1 ring-white/10">
            <Bell className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="line-clamp-1 block text-[13px] font-bold text-streamly-text">
              {notification.title}
            </span>
            <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-snug text-streamly-text-secondary">
              {notification.message}
            </span>
          </span>
        </button>

        <button
          type="button"
          aria-label="Dismiss"
          onClick={onClose}
          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-streamly-text-muted transition-colors hover:bg-white/10 hover:text-streamly-text"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>,
    document.body,
  )
}

export default NotificationToast
