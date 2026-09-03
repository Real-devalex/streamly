import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/utils/helpers'

export interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  icon?: ReactNode
  action?: ReactNode
  actionLabel?: string
  actionTo?: string
  align?: 'left' | 'center'
  className?: string
  size?: 'md' | 'lg'
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  icon,
  action,
  actionLabel,
  actionTo,
  align = 'left',
  className,
  size = 'md',
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-8 flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
        className,
      )}
    >
      <div className={cn('min-w-0', align === 'center' && 'mx-auto max-w-2xl')}>
        {eyebrow ? (
          <div
            className={cn(
              'mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-streamly-purple',
              align === 'center' && 'justify-center',
            )}
          >
            {icon ? <span className="text-streamly-cyan">{icon}</span> : (
              <span className="h-1.5 w-1.5 rounded-full bg-streamly-purple shadow-[0_0_12px_2px_rgba(139,92,246,0.8)]" />
            )}
            {eyebrow}
          </div>
        ) : null}

        <h2
          className={cn(
            'font-bold leading-[1.08] tracking-tight text-streamly-text',
            size === 'lg' ? 'text-3xl sm:text-4xl lg:text-[2.75rem]' : 'text-2xl sm:text-3xl',
          )}
        >
          {title}
        </h2>

        {subtitle ? (
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-streamly-text-secondary">
            {subtitle}
          </p>
        ) : null}
      </div>

      {action ??
        (actionTo ? (
          <Link
            to={actionTo}
            className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-streamly-border bg-white/3 px-4 py-2 text-sm font-semibold text-streamly-text-secondary transition-all duration-300 hover:border-streamly-purple/50 hover:bg-streamly-purple/10 hover:text-streamly-text"
          >
            {actionLabel ?? 'View all'}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        ) : null)}
    </div>
  )
}

export default SectionHeader
