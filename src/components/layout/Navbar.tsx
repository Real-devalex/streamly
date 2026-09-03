import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Shield,
  Sparkles,
  User as UserIcon,
  X,
} from 'lucide-react'
import logoImg from '@/assets/logo/streamly-logo.png'
import { useAuth } from '@/context/AuthContext'
import { cn, getInitials } from '@/utils/helpers'

const links = [
  { to: '/', label: 'Home' },
  { to: '/movies', label: 'Movies' },
  { to: '/series', label: 'Series' },
  { to: '/genres', label: 'Genres' },
  { to: '/movies?sort=rating', label: 'Top Rated' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { isAuthenticated, profile, isAdmin, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      setScrolled(window.scrollY > 24)
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Close overlays whenever the route changes */
  useEffect(() => {
    setMenuOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/'
    const [path, query] = to.split('?')
    if (location.pathname !== path) return false
    if (!query) return true
    const params = new URLSearchParams(query)
    return [...params.entries()].every(
      ([key, value]) => new URLSearchParams(location.search).get(key) === value,
    )
  }

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          scrolled
            ? 'border-b border-white/8 bg-streamly-black/72 py-2.5 backdrop-blur-xl backdrop-saturate-150'
            : 'border-b border-transparent bg-gradient-to-b from-black/70 to-transparent py-4',
        )}
      >
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          {/* Brand */}
          <Link to="/" className="group relative z-10 flex shrink-0 items-center" aria-label="Streamly home">
            <img
              src={logoImg}
              alt="Streamly"
              className="h-8 w-auto object-contain transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] sm:h-9"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={cn(
                  'group relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300',
                  isActive(link.to)
                    ? 'text-streamly-text'
                    : 'text-streamly-text-secondary hover:text-streamly-text',
                )}
              >
                {link.label}
                <span
                  className={cn(
                    'absolute inset-x-4 -bottom-0.5 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-streamly-purple to-transparent transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100',
                    isActive(link.to) && 'scale-x-100',
                  )}
                />
                {isActive(link.to) ? (
                  <span className="absolute inset-0 -z-10 rounded-full bg-white/5" />
                ) : null}
              </NavLink>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            <Link
              to="/search"
              aria-label="Search movies"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-streamly-text-secondary transition-all duration-300 hover:border-streamly-purple/50 hover:bg-streamly-purple/15 hover:text-streamly-text"
            >
              <Search className="h-[18px] w-[18px]" />
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((previous) => !previous)}
                  className={cn(
                    'flex items-center gap-2 rounded-full border p-1 pr-2 transition-all duration-300',
                    userMenuOpen
                      ? 'border-streamly-purple/60 bg-streamly-purple/12'
                      : 'border-white/10 bg-white/5 hover:border-white/20',
                  )}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-white/15"
                    />
                  ) : (
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-streamly-purple to-streamly-blue text-[11px] font-bold text-white">
                      {getInitials(profile?.displayName ?? profile?.username)}
                    </span>
                  )}
                  <span className="hidden max-w-[110px] truncate text-sm font-medium text-streamly-text sm:block">
                    {profile?.displayName ?? profile?.username}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-streamly-text-muted transition-transform duration-300',
                      userMenuOpen && 'rotate-180',
                    )}
                  />
                </button>

                {userMenuOpen ? (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div
                      role="menu"
                      className="glass-strong absolute right-0 top-14 z-20 w-60 animate-scale-in overflow-hidden rounded-card p-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,1)]"
                    >
                      <div className="border-b border-white/8 px-3 pb-3 pt-2">
                        <p className="truncate text-sm font-semibold text-streamly-text">
                          {profile?.displayName ?? profile?.username}
                        </p>
                        <p className="truncate text-xs text-streamly-text-muted">
                          @{profile?.username}
                        </p>
                        {isAdmin ? (
                          <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-streamly-cyan/40 bg-streamly-cyan/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-streamly-cyan">
                            <Shield className="h-3 w-3" /> Admin
                          </span>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setUserMenuOpen(false)
                          navigate('/admin')
                        }}
                        className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-streamly-text-secondary transition-colors hover:bg-white/6 hover:text-streamly-text"
                      >
                        <UserIcon className="h-4 w-4" />
                        Your profile
                      </button>
                      {isAdmin ? (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setUserMenuOpen(false)
                            navigate('/admin')
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-streamly-text-secondary transition-colors hover:bg-white/6 hover:text-streamly-text"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Admin dashboard
                        </button>
                      ) : null}
                      <div className="my-1.5 h-px bg-white/8" />
                      <button
                        type="button"
                        role="menuitem"
                        onClick={async () => {
                          setUserMenuOpen(false)
                          await signOut()
                          navigate('/')
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-streamly-error transition-colors hover:bg-streamly-error/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  to="/auth/signin"
                  className="rounded-full px-4 py-2 text-sm font-medium text-streamly-text-secondary transition-colors hover:text-streamly-text"
                >
                  Sign in
                </Link>
                <Link to="/auth/signup" className="btn-primary h-10 px-5 text-sm">
                  <Sparkles className="h-4 w-4" />
                  Get started
                </Link>
              </div>
            )}

            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-streamly-text transition-colors hover:border-white/25 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scroll progress */}
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-streamly-purple via-streamly-indigo to-streamly-cyan transition-opacity duration-300',
            scrolled ? 'opacity-100' : 'opacity-0',
          )}
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </header>

      {/* ── Mobile drawer ── */}
      <div
        className={cn(
          'fixed inset-0 z-[60] lg:hidden',
          menuOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!menuOpen}
      >
        <div
          className={cn(
            'absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-400',
            menuOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setMenuOpen(false)}
        />

        <aside
          className={cn(
            'glass-strong absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col',
            'transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
            menuOpen ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
            <img src={logoImg} alt="Streamly" className="h-7 w-auto object-contain" />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-streamly-text-secondary transition-colors hover:text-streamly-text"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {links.map((link, index) => (
              <Link
                key={link.to}
                to={link.to}
                style={{ transitionDelay: `${index * 55 + 90}ms` }}
                className={cn(
                  'flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                  isActive(link.to)
                    ? 'bg-gradient-to-r from-streamly-purple/20 to-transparent text-streamly-text'
                    : 'text-streamly-text-secondary hover:bg-white/5 hover:text-streamly-text',
                  menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0',
                )}
              >
                {link.label}
                <span className="h-1.5 w-1.5 rounded-full bg-streamly-purple opacity-70" />
              </Link>
            ))}
            <Link
              to="/search"
              style={{ transitionDelay: `${links.length * 55 + 90}ms` }}
              className={cn(
                'mt-2 flex items-center gap-3 rounded-xl border border-streamly-border bg-white/3 px-4 py-3.5 text-base font-medium text-streamly-text-secondary transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-streamly-purple/40 hover:text-streamly-text',
                menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0',
              )}
            >
              <Search className="h-4 w-4" />
              Search movies
            </Link>
          </nav>

          <div className="space-y-2.5 border-t border-white/8 p-5">
            {isAuthenticated ? (
              <>
                <div className="mb-3 flex items-center gap-3">
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover ring-1 ring-white/15"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-streamly-text">
                      {profile?.displayName ?? profile?.username}
                    </p>
                    <p className="truncate text-xs text-streamly-text-muted">
                      Signed in{isAdmin ? ' · Admin' : ''}
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin"
                  className="btn-secondary h-11 w-full text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    setMenuOpen(false)
                    await signOut()
                  }}
                  className="h-11 w-full rounded-button border border-streamly-error/30 bg-streamly-error/10 text-sm font-semibold text-streamly-error transition-colors hover:bg-streamly-error/18"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/auth/signup" className="btn-primary h-11 w-full text-sm">
                  <Sparkles className="h-4 w-4" />
                  Create free account
                </Link>
                <Link to="/auth/signin" className="btn-secondary h-11 w-full text-sm">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </aside>
      </div>
    </>
  )
}

export default Navbar
