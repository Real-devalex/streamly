import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Bell,
  ChevronLeft,
  Compass,
  Flag,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Shield,
  Film,
  Tv,
  X,
} from 'lucide-react'
import logoImg from '@/assets/logo/streamly-logo.png'
import iconImg from '@/assets/logo/icon.png'
import { useAuth } from '@/context/AuthContext'
import { cn, getInitials } from '@/utils/helpers'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/movies', label: 'Movies', icon: Film },
  { to: '/admin/series', label: 'Series', icon: Tv },
  { to: '/admin/genres', label: 'Genres', icon: Compass },
  { to: '/admin/comments', label: 'Comments', icon: MessageSquare },
  { to: '/admin/reports', label: 'Reports', icon: Flag },
]

const titles: Record<string, { title: string; subtitle: string }> = {
  '/admin': { title: 'Dashboard', subtitle: 'Everything happening across Streamly today.' },
  '/admin/movies': { title: 'Movies', subtitle: 'Manage the library, metadata and availability.' },
  '/admin/movies/new': { title: 'Add Movie', subtitle: 'Create a new movie entry in the library.' },
  '/admin/series': { title: 'Series', subtitle: 'Manage TV series, seasons and episodes.' },
  '/admin/series/new': { title: 'Add Series', subtitle: 'Create a new TV series entry.' },
  '/admin/genres': { title: 'Genres', subtitle: 'Organise the library by mood and category.' },
  '/admin/comments': { title: 'Comments', subtitle: 'Moderate community discussions.' },
  '/admin/reports': { title: 'Reports', subtitle: 'Review flagged content and members.' },
}

export function AdminLayout() {
  const { profile, isAdmin, signOut } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Match dynamic routes like /admin/movies/edit/:id
  const metaKey = Object.keys(titles).find((key) => location.pathname === key || (key !== '/admin' && location.pathname.startsWith(key + '/')))
  const meta = (metaKey ? titles[metaKey] : null) ?? {
    title: 'Admin',
    subtitle: 'Streamly control centre.',
  }

  return (
    <div className="min-h-screen bg-streamly-black">
      {/* ── Sidebar ── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-streamly-border bg-streamly-dark/95 backdrop-blur-xl',
          'transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2" aria-label="Streamly home">
            <img src={iconImg} alt="" className="h-8 w-8 object-contain" />
            <img src={logoImg} alt="Streamly" className="h-6 w-auto object-contain" />
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-lg text-streamly-text-muted hover:bg-white/5 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-streamly-border-light to-transparent" />

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-streamly-text-muted">
            Control centre
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300',
                  isActive
                    ? 'bg-gradient-to-r from-streamly-purple/22 to-transparent text-streamly-text'
                    : 'text-streamly-text-secondary hover:bg-white/5 hover:text-streamly-text',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'absolute inset-y-2 left-0 w-0.5 rounded-full transition-all duration-300',
                      isActive
                        ? 'bg-gradient-to-b from-streamly-purple to-streamly-cyan'
                        : 'bg-transparent',
                    )}
                  />
                  <item.icon
                    className={cn(
                      'h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110',
                      isActive && 'text-streamly-purple',
                    )}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}

          <p className="px-3 pb-2 pt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-streamly-text-muted">
            Shortcuts
          </p>
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-streamly-text-secondary transition-colors hover:bg-white/5 hover:text-streamly-text"
          >
            <ChevronLeft className="h-[18px] w-[18px]" />
            Back to site
          </Link>
        </nav>

        {/* User card */}
        <div className="border-t border-streamly-border p-4">
          <div className="flex items-center gap-3 rounded-xl border border-streamly-border bg-white/3 p-3">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt=""
                className="h-9 w-9 rounded-full object-cover ring-1 ring-white/15"
              />
            ) : (
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-streamly-purple to-streamly-blue text-[11px] font-bold text-white">
                {getInitials(profile?.displayName ?? profile?.username)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-streamly-text">
                {profile?.displayName ?? profile?.username ?? 'Admin'}
              </p>
              <p className="flex items-center gap-1 text-[11px] text-streamly-cyan">
                <Shield className="h-3 w-3" />
                {isAdmin ? 'Administrator' : 'Member'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              aria-label="Sign out"
              title="Sign out"
              className="grid h-8 w-8 place-items-center rounded-lg text-streamly-text-muted transition-colors hover:bg-streamly-error/12 hover:text-streamly-error"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      {/* ── Main ── */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-streamly-border bg-streamly-black/80 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="grid h-9 w-9 place-items-center rounded-lg border border-streamly-border bg-white/3 text-streamly-text-secondary lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[15px] font-bold text-streamly-text">{meta.title}</h1>
              <p className="hidden truncate text-xs text-streamly-text-muted sm:block">
                {meta.subtitle}
              </p>
            </div>

            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-streamly-text-muted" />
              <input
                type="search"
                placeholder="Search…"
                aria-label="Search admin"
                className="h-10 w-56 rounded-full border border-streamly-border bg-white/3 pl-10 pr-4 text-[13px] text-streamly-text placeholder:text-streamly-text-muted transition-colors focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
              />
            </div>

            <button
              type="button"
              aria-label="Notifications"
              className="relative grid h-9 w-9 place-items-center rounded-lg border border-streamly-border bg-white/3 text-streamly-text-secondary transition-colors hover:text-streamly-text"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-streamly-purple shadow-[0_0_10px_2px_rgba(139,92,246,0.7)]" />
            </button>

            <Link
              to="/"
              className="btn-primary hidden h-9 px-4 text-[13px] sm:inline-flex"
              aria-label="View site"
            >
              View site
            </Link>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
