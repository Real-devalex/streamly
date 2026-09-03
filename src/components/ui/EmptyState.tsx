import type { ReactNode } from 'react'
import { cn } from '@/utils/helpers'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  message?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, message, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center overflow-hidden rounded-card',
        'border border-dashed border-streamly-border-light/70 bg-streamly-card/40 px-6 py-16 text-center',
        className,
      )}
    >
      <div className="aurora -top-16 h-40 w-40 bg-streamly-purple/25" aria-hidden="true" />
      <div className="aurora -bottom-16 h-40 w-40 bg-streamly-cyan/20" aria-hidden="true" />

      {icon ? (
        <div className="relative mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-streamly-purple/25 to-streamly-blue/15 text-streamly-purple shadow-[0_20px_50px_-25px_rgba(139,92,246,0.9)]">
          {icon}
        </div>
      ) : null}

      <h3 className="relative text-lg font-semibold text-streamly-text">{title}</h3>
      {message ? (
        <p className="relative mt-2 max-w-md text-sm leading-relaxed text-streamly-text-secondary">
          {message}
        </p>
      ) : null}
      {action ? <div className="relative mt-6">{action}</div> : null}
    </div>
  )
}

export default EmptyState
