import { Link } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Eye,
  Film,
  Flag,
  MessageSquare,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { dashboardStats, mockReports, recentActivity } from '@/data/mock-community'
import { getTopRatedMovies, movies } from '@/data/mock-movies'
import { cn, formatCompact, timeAgo } from '@/utils/helpers'

const statCards = [
  {
    key: 'movies' as const,
    label: 'Titles in library',
    value: dashboardStats.movies,
    icon: Film,
    tone: 'from-streamly-purple/25 to-streamly-indigo/10 text-streamly-purple',
    series: dashboardStats.trends.movies,
  },
  {
    key: 'users' as const,
    label: 'Active members',
    value: dashboardStats.users,
    icon: Users,
    tone: 'from-streamly-blue/25 to-streamly-cyan/10 text-streamly-cyan',
    series: dashboardStats.trends.users,
  },
  {
    key: 'comments' as const,
    label: 'Comments posted',
    value: dashboardStats.comments,
    icon: MessageSquare,
    tone: 'from-streamly-indigo/25 to-streamly-purple/10 text-streamly-indigo',
    series: dashboardStats.trends.comments,
  },
  {
    key: 'downloads' as const,
    label: 'Downloads served',
    value: dashboardStats.downloads,
    icon: Download,
    tone: 'from-streamly-success/25 to-streamly-cyan/10 text-streamly-success',
    series: dashboardStats.trends.downloads,
  },
]

const activityIcon = {
  download: Download,
  comment: MessageSquare,
  report: Flag,
  user: Users,
  movie: Film,
}

export function Dashboard() {
  const topMovies = getTopRatedMovies(5)
  const pendingReports = mockReports.filter((report) => report.status === 'pending')

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
          <Link to="/admin/movies" className="btn-primary h-10 px-4 text-[13px]">
            <Plus className="h-4 w-4" />
            Add movie
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stagger-children grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const delta = dashboardStats.deltas[card.key]
          const positive = delta >= 0
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
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold',
                    positive
                      ? 'border-streamly-success/30 bg-streamly-success/10 text-streamly-success'
                      : 'border-streamly-error/30 bg-streamly-error/10 text-streamly-error',
                  )}
                >
                  {positive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {Math.abs(delta)}%
                </span>
              </div>

              <p className="mt-5 text-3xl font-black tabular-nums tracking-tight text-streamly-text">
                {formatCompact(card.value)}
              </p>
              <p className="mt-1 text-[13px] text-streamly-text-muted">{card.label}</p>

              <div className="mt-4 h-12">
                <Sparkline series={card.series} />
              </div>
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
              <p className="text-xs text-streamly-text-muted">By downloads this month</p>
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
                      {formatCompact(120_000 - index * 18_400)}
                    </p>
                    <p className="text-[11px] text-streamly-text-muted">downloads</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Activity */}
        <section className="premium-card p-5 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-streamly-text">Recent activity</h3>
              <p className="text-xs text-streamly-text-muted">Live from the community</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-streamly-success/25 bg-streamly-success/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-streamly-success">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-streamly-success" />
              Live
            </span>
          </div>

          <ol className="relative space-y-5">
            <span className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-streamly-purple/60 via-streamly-border to-transparent" />
            {recentActivity.map((item) => {
              const Icon = activityIcon[item.type]
              return (
                <li key={item.id} className="relative flex gap-3">
                  <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-streamly-border bg-streamly-card text-streamly-purple">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-[13px] leading-snug text-streamly-text-secondary">
                      <span className="font-semibold text-streamly-text">@{item.actor}</span>{' '}
                      {item.message}
                    </p>
                    <p className="mt-0.5 text-[11px] text-streamly-text-muted">
                      {timeAgo(item.createdAt)}
                    </p>
                  </div>
                </li>
              )
            })}
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
            title: `${movies.length} titles published`,
            copy: 'Metadata, artwork and download links all in one table.',
            to: '/admin/movies',
            icon: Film,
          },
          {
            title: 'Community discussions',
            copy: 'Hide, restore or delete comments across the library.',
            to: '/admin/comments',
            icon: MessageSquare,
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

/** Lightweight SVG sparkline. */
function Sparkline({ series }: { series: number[] }) {
  const max = Math.max(...series)
  const min = Math.min(...series)
  const span = max - min || 1
  const width = 100
  const height = 32

  const points = series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * width
      const y = height - ((value - min) / span) * (height - 6) - 3
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-12 w-full">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="spark-line" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,${height} ${points} ${width},${height}`}
        fill="url(#spark-fill)"
        stroke="none"
      />
      <polyline
        points={points}
        fill="none"
        stroke="url(#spark-line)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export default Dashboard
