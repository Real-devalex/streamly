import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock, Flag, Loader2, Search, ShieldCheck, X } from 'lucide-react'
import { fetchReports, updateReportStatus } from '@/lib/api'
import { cn, timeAgo } from '@/utils/helpers'
import type { Report, ReportReason } from '@/types'

const filters = ['pending', 'reviewed', 'resolved', 'all'] as const
type Filter = (typeof filters)[number]

const reasonTone: Record<ReportReason, string> = {
  spam: 'border-streamly-warning/30 bg-streamly-warning/10 text-streamly-warning',
  harassment: 'border-streamly-error/30 bg-streamly-error/10 text-streamly-error',
  abuse: 'border-streamly-error/40 bg-streamly-error/12 text-streamly-error',
  spoiler: 'border-streamly-purple/35 bg-streamly-purple/12 text-streamly-purple',
  other: 'border-streamly-border-light bg-white/5 text-streamly-text-secondary',
}

export function AdminReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('pending')
  const [statuses, setStatuses] = useState<Record<string, Report['status']>>({})

  useEffect(() => {
    async function load() {
      const data = await fetchReports()
      setReports(data)
      setLoading(false)
    }
    void load()
  }, [])

  const statusOf = (report: Report) => statuses[report.id] ?? report.status

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase()
    return reports.filter((report) => {
      const status = statusOf(report)
      const matchesFilter = filter === 'all' || status === filter
      const matchesQuery =
        !term ||
        report.reason.includes(term) ||
        (report.details ?? '').toLowerCase().includes(term) ||
        (report.reporter?.username ?? '').toLowerCase().includes(term)
      return matchesFilter && matchesQuery
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filter, statuses, reports])

  const counts = {
    pending: reports.filter((r) => statusOf(r) === 'pending').length,
    reviewed: reports.filter((r) => statusOf(r) === 'reviewed').length,
    resolved: reports.filter((r) => statusOf(r) === 'resolved').length,
  }

  const setStatus = async (id: string, status: Report['status']) => {
    await updateReportStatus(id, status)
    setStatuses((previous) => ({ ...previous, [id]: status }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-streamly-purple" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="stagger-children grid gap-4 sm:grid-cols-3">
        {[
          {
            key: 'pending' as const,
            label: 'Awaiting review',
            icon: Clock,
            tone: 'text-streamly-warning',
            ring: 'ring-streamly-warning/25',
            bg: 'from-streamly-warning/20',
          },
          {
            key: 'reviewed' as const,
            label: 'In review',
            icon: AlertTriangle,
            tone: 'text-streamly-cyan',
            ring: 'ring-streamly-cyan/25',
            bg: 'from-streamly-cyan/18',
          },
          {
            key: 'resolved' as const,
            label: 'Resolved',
            icon: CheckCircle2,
            tone: 'text-streamly-success',
            ring: 'ring-streamly-success/25',
            bg: 'from-streamly-success/18',
          },
        ].map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => setFilter(card.key)}
            className={cn(
              'premium-card premium-card-hover flex items-center gap-4 p-5 text-left',
              filter === card.key && 'border-streamly-purple/45',
            )}
          >
            <span
              className={cn(
                'grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br to-transparent ring-1',
                card.bg,
                card.tone,
                card.ring,
              )}
            >
              <card.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-black tabular-nums text-streamly-text">
                {counts[card.key]}
              </p>
              <p className="text-[13px] text-streamly-text-muted">{card.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-streamly-text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            placeholder="Search reports…"
            aria-label="Search reports"
            className="h-11 w-full rounded-button border border-streamly-border bg-white/3 pl-10 pr-4 text-sm text-streamly-text placeholder:text-streamly-text-muted transition-colors focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
          />
        </div>

        <div className="flex items-center gap-1 rounded-full border border-streamly-border bg-white/3 p-1">
          {filters.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-all duration-300',
                filter === option
                  ? 'bg-gradient-to-r from-streamly-purple to-streamly-indigo text-white'
                  : 'text-streamly-text-muted hover:text-streamly-text',
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Reports */}
      <div className="space-y-3">
        {rows.map((report) => {
          const status = statusOf(report)

          return (
            <article key={report.id} className="premium-card p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-streamly-surface text-streamly-text-muted">
                  <Flag className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider',
                        reasonTone[report.reason],
                      )}
                    >
                      <Flag className="h-3 w-3" />
                      {report.reason}
                    </span>
                    <span className="rounded-full border border-streamly-border-light bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-streamly-text-muted">
                      {report.targetType} report
                    </span>
                    <span
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize',
                        status === 'pending'
                          ? 'border-streamly-warning/30 bg-streamly-warning/10 text-streamly-warning'
                          : status === 'reviewed'
                            ? 'border-streamly-cyan/30 bg-streamly-cyan/10 text-streamly-cyan'
                            : 'border-streamly-success/30 bg-streamly-success/10 text-streamly-success',
                      )}
                    >
                      {status}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-streamly-text">
                    {report.details ?? 'No additional details provided.'}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-streamly-text-muted">
                    <span>
                      Reported by{' '}
                      <span className="font-semibold text-streamly-text-secondary">
                        @{report.reporter?.username ?? 'unknown'}
                      </span>
                    </span>
                    <span>·</span>
                    <span>{timeAgo(report.createdAt)}</span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {status !== 'resolved' ? (
                    <button
                      type="button"
                      onClick={() => void setStatus(report.id, 'resolved')}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-streamly-success/30 bg-streamly-success/10 px-3 text-xs font-semibold text-streamly-success transition-all duration-300 hover:-translate-y-0.5 hover:bg-streamly-success/18"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Resolve
                    </button>
                  ) : null}
                  {status === 'pending' ? (
                    <button
                      type="button"
                      onClick={() => void setStatus(report.id, 'reviewed')}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-streamly-cyan/30 bg-streamly-cyan/10 px-3 text-xs font-semibold text-streamly-cyan transition-all duration-300 hover:-translate-y-0.5 hover:bg-streamly-cyan/18"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Review
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void setStatus(report.id, 'resolved')}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-streamly-border bg-white/3 px-3 text-xs font-semibold text-streamly-text-muted transition-all duration-300 hover:-translate-y-0.5 hover:text-streamly-text"
                  >
                    <X className="h-3.5 w-3.5" />
                    Dismiss
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {rows.length === 0 ? (
        <div className="premium-card px-5 py-14 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-streamly-success" />
          <p className="mt-4 text-sm font-semibold text-streamly-text">
            Queue is clear
          </p>
          <p className="mt-1 text-[13px] text-streamly-text-muted">
            Nothing needs your attention in this view. Nice work.
          </p>
        </div>
      ) : null}
    </div>
  )
}

export default AdminReports
