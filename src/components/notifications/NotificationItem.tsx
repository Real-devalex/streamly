import { Clapperboard, Heart, MessageCircle, Sparkles, Tv, X } from 'lucide-react'
import type { Notification } from '@/types'
import { cn, timeAgo } from '@/utils/helpers'

const ICONS = {
  new_movie: Clapperboard,
  new_series: Tv,
  reply: MessageCircle,
  reaction: Heart,
  mention: Sparkles,
} as const

const TONES = {
  new_movie: 'from-streamly-purple/30 to-streamly-indigo/10 text-streamly-purple',
  new_series: 'from-streamly-blue/30 to-streamly-cyan/10 text-streamly-cyan',
  reply: 'from-streamly-indigo/30 to-streamly-purple/10 text-streamly-indigo',
  reaction: 'from-streamly-error/25 to-streamly-purple/10 text-streamly-error',
  mention: 'from-streamly-gold/25 to-streamly-warning/10 text-streamly-gold',
} as const

export interface NotificationItemProps {
  notification: Notification
  onSelect: (notification: Notification) => void
  onDismiss?: (notification: Notification) => void
  index?: number
}

export function NotificationItem({ notification, onSelect, onDismiss, index = 0 }: NotificationItemProps) {
  const Icon = ICONS[notification.type] ?? Sparkles
  const tone = TONES[notification.type] ?? TONES.mention

  return (
    <div
      className={cn(
        'group relative animate-fade-up',
        !notification.read && 'bg-white/[0.045]',
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
    >
      {!notification.read ? (
        <span className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-streamly-purple to-streamly-cyan" />
      ) : null}

      <button
        type="button"
        onClick={() => onSelect(notification)}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors duration-300 hover:bg-white/[0.07]"
      >
        <span
          className={cn(
            'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ring-1 ring-white/10 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110',
            tone,
          )}
        >
          <Icon className="h-4 w-4" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span
              className={cn(
                'line-clamp-1 text-[13px] font-bold',
                notification.read ? 'text-streamly-text-secondary' : 'text-streamly-text',
              )}
            >
              {notification.title}
            </span>
            <span className="shrink-0 whitespace-nowrap text-[11px] text-streamly-text-muted">
              {timeAgo(notification.createdAt)}
            </span>
          </span>
          <span className="mt-1 line-clamp-2 block text-[12.5px] leading-snug text-streamly-text-muted">
            {notification.message}
          </span>
        </span>
      </button>

      {onDismiss ? (
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => onDismiss(notification)}
          className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full text-streamly-text-muted opacity-0 transition-all duration-300 hover:bg-streamly-error/15 hover:text-streamly-error focus-visible:opacity-100 group-hover:opacity-100"
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
    </div>
  )
}

export default NotificationItem
