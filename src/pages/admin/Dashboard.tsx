import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Clock,
  Compass,
  Eye,
  Film,
  Flag,
  Loader2,
  MessageSquare,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { fetchDashboardStats, fetchTopRatedMovies, fetchReports, type DashboardStats } from '@/lib/api'
import { cn, formatCompact, timeAgo } from '@/utils/helpers'
import type { Movie, Report } from '@/types'

const statCards = [
  { key: 'movieCount' as const, label: 'Titles in library', icon: Film, tone: 'from-streamly-purple/25 to-streamly-indigo/10 text-streamly-purple' },
  { key: 'userCount' as const, label: 'Active members', icon: Users, tone: 'from-streamly-blue/25 to-streamly-cyan/10 text-streamly-cyan' },
  { key: 'commentCount' as const, label: 'Comments posted', icon: MessageSquare, tone: 'from-streamly-indigo/25 to-streamly-purple/10 text-streamly-indigo' },
  { key: 'upcomingCount' as const, label: 'Upcoming releases', icon: Clock, tone: 'from-streamly-warning/25 to-streamly-gold/10 text-streamly-warning' },
  { key: 'pendingReportCount' as const, label: 'Pending reports', icon: Flag, tone: 'from-streamly-error/25 to-streamly-warning/10 text-streamly-error' },
]

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [topMovies, setTopMovies] = useState<Movie[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [s, tm, r] = await Promise.all([
        fetchDashboardStats(),
        fetchTopRatedMovies(5),
        fetchReports(),
      ])
      setStats(s)
      setTopMovies(tm)
      setReports(r)
      setLoading(false)
    }
    void load()
  }, [])

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-streamly-purple" />
      </div>
    )
  }

  const pendingReports = reports.filter((r) => r.status === 'pending')

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-streamly-purple">
            <Sparkles className="h-3.5 w-3.5 text-streamly-cyan" />
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </div>
          <h2 className="text-2xl font-black tracking-tight text-streamly-text sm:text-3xl">
            Good evening, admin
          </h2>
          <p className="mt-1.5 text-sm text-streamly-text-secondary">
            {pendingReports.length} report{pendingReports.length === 1 ? '' : 's'} waiting on you.
            Everything else is running smooth.
          </p>
        </div>

        <div className="flex gap-2.5">
          <Link to="/admin/movies" className="btn-secondary h-10 px-4 text-[13px]">
            <Eye className="h-4 w-4" />
            Library
          </Link>
          <Link to="/admin/movies/new" className="btn-primary h-10 px-4 text-[13px]">
            <Plus className="h-4 w-4" />
            Add movie
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stagger-children grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => {
          const value = stats[card.key] ?? 0
          return (
            <div key={card.key} className="premium-card premium-card-hover overflow-hidden p-5">
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    'grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ring-1 ring-white/10',
                    card.tone,
                  )}
                >
                  <card.icon className="h-[18px] w-[18px]" />
                </span>
              </div>

              <p className="mt-5 text-3xl font-black tabular-nums tracking-tight text-streamly-text">
                {formatCompact(value)}
              </p>
              <p className="mt-1 text-[13px] text-streamly-text-muted">{card.label}</p>
            </div>
          )
        })}
      </div>

      {/* Two column */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Top titles */}
        <section className="premium-card p-5 lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-streamly-text">Top performing titles</h3>
              <p className="text-xs text-streamly-text-muted">By rating</p>
            </div>
            <Link
              to="/admin/movies"
              className="text-xs font-semibold text-streamly-purple transition-colors hover:text-streamly-cyan"
            >
              View all
            </Link>
          </div>

          <ul className="space-y-3">
            {topMovies.map((movie, index) => {
              const share = 100 - index * 16
              return (
                <li
                  key={movie.id}
                  className="group flex items-center gap-4 rounded-xl border border-transparent p-2 transition-colors hover:border-streamly-border hover:bg-white/3"
                >
                  <span className="w-5 shrink-0 text-center text-xs font-bold text-streamly-text-muted">
                    {index + 1}
                  </span>
                  <div className="h-14 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-streamly-surface">
                    <img src={movie.posterUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-streamly-text">
                      {movie.title}
                    </p>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-streamly-purple to-streamly-cyan transition-[width] duration-1000"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold tabular-nums text-streamly-text">
                      {movie.rating.toFixed(1)}
                    </p>
                    <p className="text-[11px] text-streamly-text-muted">rating</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Recent reports */}
        <section className="premium-card p-5 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-streamly-text">Recent reports</h3>
              <p className="text-xs text-streamly-text-muted">Latest flagged content</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-streamly-success/25 bg-streamly-success/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-streamly-success">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-streamly-success" />
              Live
            </span>
          </div>

          <ol className="relative space-y-5">
            <span className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-streamly-purple/60 via-streamly-border to-transparent" />
            {reports.slice(0, 5).map((report) => (
              <li key={report.id} className="relative flex gap-3">
                <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-streamly-border bg-streamly-card text-streamly-purple">
                  <Flag className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[13px] leading-snug text-streamly-text-secondary">
                    <span className="font-semibold text-streamly-text">@{report.reporter?.username ?? 'unknown'}</span>{' '}
                    reported {report.targetType} for <span className="font-semibold">{report.reason}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-streamly-text-muted">
                    {timeAgo(report.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: `${pendingReports.length} open reports`,
            copy: 'Spoiler flags and community disputes needing a decision.',
            to: '/admin/reports',
            icon: Flag,
          },
          {
            title: `${stats.movieCount} titles published`,
            copy: 'Metadata, artwork and download links all in one table.',
            to: '/admin/movies',
            icon: Film,
          },
          {
            title: 'Manage genres',
            copy: 'Add, edit or remove genre categories from the library.',
            to: '/admin/genres',
            icon: Compass,
          },
        ].map((action) => (
          <Link
            key={action.title}
            to={action.to}
            className="group premium-card premium-card-hover flex items-start gap-4 p-5"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-streamly-purple/22 to-streamly-blue/12 text-streamly-purple ring-1 ring-white/10">
              <action.icon className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-streamly-text">{action.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-streamly-text-secondary">
                {action.copy}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-streamly-purple">
                Open
                <TrendingUp className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
