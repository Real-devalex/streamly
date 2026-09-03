import { Check, Gauge, HardDrive, Monitor, Server } from 'lucide-react'
import type { DownloadLink } from '@/types'
import { cn, formatFileSize } from '@/utils/helpers'

export interface QualitySelectorProps {
  links: DownloadLink[]
  value: string
  onChange: (quality: string) => void
}

const meta: Record<
  string,
  { label: string; icon: typeof Monitor; hint: string; badge?: string }
> = {
  '1080p': { label: 'Full HD', icon: Monitor, hint: 'Cinematic detail · Best on a big screen', badge: 'Best quality' },
  '720p': { label: 'HD Ready', icon: Gauge, hint: 'Balanced size and sharpness', badge: 'Balanced' },
  '480p': { label: 'Mobile', icon: HardDrive, hint: 'Lightest file · Saves data', badge: 'Data saver' },
}

export function QualitySelector({ links, value, onChange }: QualitySelectorProps) {
  return (
    <div role="radiogroup" aria-label="Download quality" className="space-y-2.5">
      {links.map((link) => {
        const item = meta[link.quality] ?? {
          label: link.quality,
          icon: Monitor,
          hint: 'Available now',
        }
        const Icon = item.icon
        const active = value === link.quality

        return (
          <button
            key={link.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(link.quality)}
            className={cn(
              'group relative flex w-full items-center gap-4 overflow-hidden rounded-button border p-4 text-left',
              'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
              active
                ? 'border-streamly-purple/70 bg-gradient-to-r from-streamly-purple/18 via-streamly-indigo/10 to-transparent shadow-[0_18px_40px_-24px_rgba(139,92,246,0.9)]'
                : 'border-streamly-border bg-white/3 hover:-translate-y-0.5 hover:border-streamly-border-light hover:bg-white/6',
            )}
          >
            {/* active accent bar */}
            <span
              className={cn(
                'absolute inset-y-0 left-0 w-[3px] transition-all duration-300',
                active
                  ? 'bg-gradient-to-b from-streamly-purple to-streamly-cyan'
                  : 'bg-transparent',
              )}
            />

            <span
              className={cn(
                'grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition-all duration-300',
                active
                  ? 'border-streamly-purple/50 bg-streamly-purple/20 text-streamly-purple'
                  : 'border-white/10 bg-white/5 text-streamly-text-secondary group-hover:text-streamly-text',
              )}
            >
              <Icon className="h-5 w-5" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-[15px] font-bold tracking-tight text-streamly-text">
                  {link.quality}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-streamly-text-muted">
                  {item.label}
                </span>
                {item.badge ? (
                  <span
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                      active
                        ? 'border-streamly-cyan/40 bg-streamly-cyan/12 text-streamly-cyan'
                        : 'border-white/10 bg-white/5 text-streamly-text-muted',
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </span>
              <span className="mt-1 block truncate text-xs text-streamly-text-secondary">
                {item.hint}
              </span>
              <span className="mt-1.5 flex items-center gap-1.5 text-[11px] text-streamly-text-muted">
                <Server className="h-3 w-3" />
                {link.destinationLabel}
              </span>
            </span>

            <span className="flex shrink-0 flex-col items-end gap-1.5">
              <span
                className={cn(
                  'text-sm font-semibold tabular-nums',
                  active ? 'text-streamly-text' : 'text-streamly-text-secondary',
                )}
              >
                {formatFileSize(link.fileSizeBytes)}
              </span>
              <span
                className={cn(
                  'grid h-5 w-5 place-items-center rounded-full border transition-all duration-300',
                  active
                    ? 'border-streamly-purple bg-streamly-purple text-white'
                    : 'border-white/15 text-transparent',
                )}
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default QualitySelector
