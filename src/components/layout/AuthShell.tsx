import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Quote, Sparkles, Star } from 'lucide-react'
import logoImg from '@/assets/logo/streamly-logo.png'
import iconImg from '@/assets/logo/icon.png'
import { getTopRatedMovies } from '@/data/mock-movies'

const highlights = [
  { value: '12,400+', label: 'Titles in the library' },
  { value: '4K HDR', label: 'Maximum stream quality' },
  { value: '2.1M', label: 'Members worldwide' },
]

export interface AuthShellProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
  /** Small note rendered under the heading (demo mode banner, etc.). */
  notice?: ReactNode
}

export function AuthShell({ title, subtitle, children, footer, notice }: AuthShellProps) {
  const showcase = getTopRatedMovies(3)
  const quote = showcase[0]

  return (
    <div className="relative flex min-h-screen bg-streamly-black">
      {/* ── Left: cinematic panel ── */}
      <aside className="relative hidden w-[52%] overflow-hidden border-r border-streamly-border lg:block">
        <div className="absolute inset-0">
          <img
            src={quote?.backdropUrl}
            alt=""
            className="h-full w-full scale-110 object-cover opacity-45 animate-hero-zoom"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-streamly-purple/30 via-streamly-black/85 to-streamly-black" />
        <div className="hero-gradient-bottom absolute inset-0" />
        <div className="film-grain absolute inset-0" />
        <div className="aurora -left-24 top-1/4 h-80 w-80 bg-streamly-purple/25" />
        <div className="aurora -right-10 bottom-0 h-72 w-72 bg-streamly-cyan/12" />

        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Link to="/" className="inline-flex w-fit items-center" aria-label="Streamly home">
            <img src={logoImg} alt="Streamly" className="h-9 w-auto object-contain" />
          </Link>

          <div className="max-w-lg">
            <h2 className="text-4xl font-black leading-[1.05] tracking-tight text-white xl:text-[2.75rem]">
              Every film you love,
              <br />
              <span className="gradient-text animate-gradient-x">in one cinematic place.</span>
            </h2>

            {quote ? (
              <figure className="mt-8 rounded-card border border-white/10 bg-black/35 p-5 backdrop-blur-md">
                <Quote className="h-5 w-5 text-streamly-purple" />
                <blockquote className="mt-3 text-[15px] leading-relaxed text-streamly-text-secondary">
                  “{quote.description}”
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <img
                    src={quote.posterUrl}
                    alt=""
                    className="h-10 w-7 rounded-md object-cover ring-1 ring-white/15"
                  />
                  <div>
                    <p className="text-sm font-semibold text-streamly-text">{quote.title}</p>
                    <p className="flex items-center gap-1 text-xs text-streamly-gold">
                      <Star className="h-3 w-3 fill-streamly-gold" />
                      {quote.rating.toFixed(1)} · {quote.releaseYear}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ) : null}

            {/* Poster stack */}
            <div className="mt-8 flex items-center gap-3">
              {showcase.map((movie, index) => (
                <div
                  key={movie.id}
                  className="h-24 w-16 overflow-hidden rounded-lg border border-white/12 shadow-[0_20px_40px_-20px_rgba(0,0,0,1)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2"
                  style={{ rotate: `${(index - 1) * 5}deg` }}
                >
                  <img src={movie.posterUrl} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
            {highlights.map((item) => (
              <div key={item.label}>
                <p className="text-xl font-black text-streamly-text">{item.value}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wider text-streamly-text-muted">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Right: form ── */}
      <main className="relative flex w-full flex-col items-center justify-center px-5 py-12 sm:px-8 lg:w-[48%]">
        <div className="aurora left-1/2 top-0 h-64 w-64 -translate-x-1/2 bg-streamly-purple/15 lg:hidden" />
        <div className="gradient-rule absolute inset-x-0 top-0 lg:hidden" />

        <div className="relative w-full max-w-md">
          {/* Mobile logo */}
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2.5 lg:hidden"
            aria-label="Streamly home"
          >
            <img src={iconImg} alt="" className="h-10 w-10 object-contain" />
            <img src={logoImg} alt="Streamly" className="h-7 w-auto object-contain" />
          </Link>

          <div className="mb-7 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-streamly-purple">
            <Sparkles className="h-3.5 w-3.5 text-streamly-cyan" />
            Welcome back
          </div>

          <h1 className="text-3xl font-black tracking-tight text-streamly-text sm:text-[2.15rem]">
            {title}
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-streamly-text-secondary">{subtitle}</p>

          {notice ? <div className="mt-5">{notice}</div> : null}

          <div className="mt-7">{children}</div>

          {footer ? <div className="mt-7">{footer}</div> : null}
        </div>

        <p className="relative mt-12 w-full max-w-md text-center text-[11px] text-streamly-text-muted">
          By continuing you agree to our{' '}
          <Link to="/" className="text-streamly-text-secondary hover:text-streamly-text">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/" className="text-streamly-text-secondary hover:text-streamly-text">
            Privacy Policy
          </Link>
          .
        </p>
      </main>
    </div>
  )
}

export default AuthShell
