import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  Download,
  Lock,
  ShieldCheck,
  Sparkles,
  Zap,
  X,
} from 'lucide-react'
import type { Movie } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { cn, formatFileSize, formatRuntime } from '@/utils/helpers'
import { QualitySelector } from './QualitySelector'
import { Button } from '@/components/ui/Button'

export interface DownloadModalProps {
  movie: Movie | null
  isOpen: boolean
  onClose: () => void
}

type Phase = 'idle' | 'preparing' | 'ready'

const benefits = [
  { icon: Zap, title: 'Instant start', copy: 'Every quality, no waiting room, no queue.' },
  { icon: ShieldCheck, title: 'Clean files', copy: 'Verified checksums on every release.' },
  { icon: Sparkles, title: 'Member extras', copy: 'Subtitles, audio tracks and bonus cuts.' },
]

export function DownloadModal({ movie, isOpen, onClose }: DownloadModalProps) {
  const { isAuthenticated } = useAuth()
  const [quality, setQuality] = useState('1080p')
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number | null>(null)

  const selected = useMemo(
    () => movie?.downloadLinks.find((link) => link.quality === quality) ?? movie?.downloadLinks[0],
    [movie, quality],
  )

  /* Reset when the modal reopens on a different title */
  useEffect(() => {
    if (isOpen) {
      setPhase('idle')
      setProgress(0)
      setQuality('1080p')
    }
  }, [isOpen, movie?.id])

  /* Escape + scroll lock */
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [isOpen, onClose])

  useEffect(
    () => () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    },
    [],
  )

  if (!isOpen || !movie) return null

  const startDownload = () => {
    setPhase('preparing')
    setProgress(0)
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = window.setInterval(() => {
      setProgress((current) => {
        const next = current + Math.max(4, Math.round((100 - current) * 0.18))
        if (next >= 100) {
          if (timerRef.current) window.clearInterval(timerRef.current)
          setPhase('ready')
          return 100
        }
        return next
      })
    }, 130)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close download dialog"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in cursor-default bg-black/80 backdrop-blur-md"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Download ${movie.title}`}
        className={cn(
          'relative w-full max-w-lg animate-scale-in overflow-hidden',
          'rounded-t-modal border border-white/10 sm:rounded-modal',
          'bg-streamly-card/95 shadow-[0_50px_120px_-40px_rgba(0,0,0,1)] backdrop-blur-2xl',
          'outline-none',
        )}
      >
        {/* glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[130%] -translate-x-1/2 bg-gradient-to-b from-streamly-purple/35 via-streamly-blue/10 to-transparent blur-2xl" />
        <div className="gradient-rule" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-streamly-text-secondary transition-all duration-300 hover:rotate-90 hover:border-white/25 hover:text-streamly-text"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative max-h-[85vh] overflow-y-auto p-6 sm:p-7">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="relative w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-[0_18px_40px_-20px_rgba(0,0,0,1)]">
              <img
                src={movie.posterUrl}
                alt=""
                className="aspect-[2/3] w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="min-w-0 pt-1 pr-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-streamly-purple">
                {isAuthenticated ? 'Ready to download' : 'Members only'}
              </p>
              <h2 className="mt-1.5 truncate text-xl font-bold tracking-tight text-streamly-text">
                {movie.title}
              </h2>
              <p className="mt-1 text-xs text-streamly-text-muted">
                {movie.releaseYear} · {formatRuntime(movie.runtimeMinutes)} ·{' '}
                {movie.genres.map((genre) => genre.name).join(' · ')}
              </p>
            </div>
          </div>

          {/* ── Guest: auth gate ── */}
          {!isAuthenticated ? (
            <div className="mt-6">
              <div className="flex items-start gap-4 rounded-button border border-streamly-border bg-gradient-to-br from-white/6 to-transparent p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-streamly-purple/30 to-streamly-blue/20 text-streamly-purple ring-1 ring-streamly-purple/30">
                  <Lock className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-streamly-text">
                    Sign in to unlock downloads
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-streamly-text-secondary">
                    It takes ten seconds and it is free forever. No card, no trial countdown.
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-3">
                {benefits.map(({ icon: Icon, title, copy }) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/5 text-streamly-cyan">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span>
                      <span className="block text-[13px] font-semibold text-streamly-text">
                        {title}
                      </span>
                      <span className="block text-xs text-streamly-text-muted">{copy}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <Button to="/auth/signin" fullWidth size="md" icon={<Download className="h-4 w-4" />}>
                  Sign in to download
                </Button>
                <Button to="/auth/signup" variant="secondary" fullWidth size="md">
                  Create account
                </Button>
              </div>
            </div>
          ) : null}

          {/* ── Member: quality picker ── */}
          {isAuthenticated ? (
            <div className="mt-6">
              {phase === 'ready' ? (
                <div className="animate-scale-in py-2 text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-streamly-success/25 to-streamly-cyan/20 text-streamly-success ring-1 ring-streamly-success/40">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-streamly-text">
                    {movie.title} is on its way
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-streamly-text-secondary">
                    {quality} · {formatFileSize(selected?.fileSizeBytes)} — your download started
                    from {selected?.destinationLabel}.
                  </p>
                  <Button variant="secondary" fullWidth className="mt-6" onClick={onClose}>
                    Done
                  </Button>
                </div>
              ) : (
                <>
                  <QualitySelector
                    links={movie.downloadLinks}
                    value={quality}
                    onChange={setQuality}
                  />

                  <div className="mt-5 flex items-center justify-between rounded-button border border-streamly-border bg-black/25 px-4 py-3">
                    <span className="text-xs text-streamly-text-muted">Total size</span>
                    <span className="text-sm font-semibold tabular-nums text-streamly-text">
                      {formatFileSize(selected?.fileSizeBytes)}
                    </span>
                  </div>

                  {phase === 'preparing' ? (
                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-streamly-text-secondary">
                          Preparing your file…
                        </span>
                        <span className="font-semibold tabular-nums text-streamly-cyan">
                          {progress}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/8">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-streamly-purple via-streamly-indigo to-streamly-cyan transition-[width] duration-200 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ) : null}

                  <Button
                    fullWidth
                    size="lg"
                    className="mt-5"
                    onClick={startDownload}
                    loading={phase === 'preparing'}
                    icon={<Download className="h-4 w-4" />}
                  >
                    {phase === 'preparing' ? 'Preparing…' : `Download ${quality}`}
                  </Button>

                  <p className="mt-3 text-center text-[11px] text-streamly-text-muted">
                    For personal use only. Please support the filmmakers you love.
                  </p>
                </>
              )}
            </div>
          ) : null}

          {!isAuthenticated ? (
            <p className="mt-5 text-center text-[11px] text-streamly-text-muted">
              Trouble signing in?{' '}
              <Link to="/auth/reset" className="text-streamly-purple hover:underline">
                Reset your password
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default DownloadModal
