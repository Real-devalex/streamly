import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Clock,
  Download,
  Flame,
  Info,
  Play,
  Search,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react'
import { useDownload } from '@/context/DownloadContext'
import { MovieGrid } from '@/components/movie/MovieGrid'
import { MovieCard } from '@/components/movie/MovieCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import {
  getFeaturedMovies,
  getGenreCount,
  getLatestMovies,
  getTopRatedMovies,
  getTrendingMovies,
  genres,
} from '@/data/mock-movies'
import { cn, formatRuntime } from '@/utils/helpers'

const ROTATE_MS = 8000

export function Home() {
  const navigate = useNavigate()
  const { openDownload } = useDownload()
  const featured = useMemo(() => getFeaturedMovies(), [])
  const trending = useMemo(() => getTrendingMovies(6), [])
  const latest = useMemo(() => getLatestMovies(6), [])
  const topRated = useMemo(() => getTopRatedMovies(8), [])

  const [heroIndex, setHeroIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [query, setQuery] = useState('')
  const [imagesReady, setImagesReady] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (paused || featured.length <= 1) return
    const timer = window.setInterval(() => {
      setHeroIndex((previous) => (previous + 1) % featured.length)
    }, ROTATE_MS)
    return () => window.clearInterval(timer)
  }, [paused, featured.length])

  const active = featured[heroIndex] ?? featured[0]

  const onSearch = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()
      navigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search')
    },
    [navigate, query],
  )

  if (!active) return null

  return (
    <div className="pb-4">
      {/* ══════════════ HERO ══════════════ */}
      <section
        className="relative h-[86vh] min-h-[600px] w-full overflow-hidden sm:h-[88vh] lg:h-[92vh] lg:max-h-[1000px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Backdrops */}
        {featured.map((movie, index) => (
          <div
            key={movie.id}
            aria-hidden="true"
            className={cn(
              'absolute inset-0 transition-opacity duration-[1400ms] ease-in-out',
              index === heroIndex ? 'opacity-100' : 'opacity-0',
            )}
          >
            {!imagesReady[movie.id] ? (
              <div className="absolute inset-0 bg-gradient-to-br from-streamly-purple/25 via-streamly-dark to-streamly-black" />
            ) : null}
            <img
              src={movie.backdropUrl}
              alt=""
              onLoad={() => setImagesReady((state) => ({ ...state, [movie.id]: true }))}
              onError={() => setImagesReady((state) => ({ ...state, [movie.id]: true }))}
              className={cn(
                'h-full w-full object-cover transition-opacity duration-700',
                imagesReady[movie.id] ? 'opacity-100' : 'opacity-0',
                index === heroIndex ? 'animate-hero-zoom' : '',
              )}
            />
          </div>
        ))}

        {/* Scrims */}
        <div className="hero-gradient-left pointer-events-none absolute inset-0" />
        <div className="hero-gradient-bottom pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
        <div className="film-grain pointer-events-none absolute inset-0" />

        {/* Content */}
        <div className="relative mx-auto flex h-full max-w-[1600px] items-end px-4 pb-28 sm:px-6 sm:pb-32 lg:items-center lg:px-10 lg:pb-0">
          <div className="max-w-2xl pt-24 lg:pt-0">
            {/* Badge */}
            <div className="mb-5 flex animate-fade-up flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-streamly-purple/40 bg-streamly-purple/12 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-streamly-purple backdrop-blur-md">
                <Flame className="h-3.5 w-3.5" />
                {heroIndex === 0 ? 'Featured tonight' : 'Trending now'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/40 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-streamly-text-secondary backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-streamly-cyan" />
                Streamly Pick
              </span>
            </div>

            <h1
              key={`title-${active.id}`}
              className="animate-fade-up text-4xl font-black leading-[0.95] tracking-tight text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.8)] sm:text-6xl lg:text-7xl"
            >
              {active.title}
            </h1>

            {/* Meta */}
            <div
              key={`meta-${active.id}`}
              className="mt-5 flex animate-fade-up flex-wrap items-center gap-x-4 gap-y-2 text-sm text-streamly-text-secondary"
            >
              <span className="inline-flex items-center gap-1.5 font-semibold text-streamly-gold">
                <Star className="h-4 w-4 fill-streamly-gold" />
                {active.rating.toFixed(1)}
                <span className="font-normal text-streamly-text-muted">/ 10</span>
              </span>
              <span className="h-1 w-1 rounded-full bg-streamly-text-muted/60" />
              <span>{active.releaseYear}</span>
              <span className="h-1 w-1 rounded-full bg-streamly-text-muted/60" />
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {formatRuntime(active.runtimeMinutes)}
              </span>
              <span className="h-1 w-1 rounded-full bg-streamly-text-muted/60" />
              <span className="rounded-md border border-white/15 bg-white/8 px-2 py-0.5 text-[11px] font-bold tracking-wider text-streamly-text">
                4K HDR
              </span>
            </div>

            <p
              key={`desc-${active.id}`}
              className="mt-5 max-w-xl animate-fade-up text-[15px] leading-relaxed text-streamly-text-secondary sm:text-base"
            >
              {active.description}
            </p>

            {/* Genres */}
            <div key={`genres-${active.id}`} className="mt-5 flex animate-fade-up flex-wrap gap-2">
              {active.genres.map((genre) => (
                <Link
                  key={genre.id}
                  to={`/genre/${genre.slug}`}
                  className="rounded-full border border-white/12 bg-black/35 px-3 py-1.5 text-xs font-medium text-streamly-text-secondary backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-streamly-purple/50 hover:text-streamly-text"
                >
                  {genre.icon} {genre.name}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div key={`actions-${active.id}`} className="mt-8 flex animate-fade-up flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn-primary h-13 px-7 text-[15px]"
                onClick={() => navigate(`/movie/${active.slug}`)}
              >
                <Play className="h-5 w-5 fill-current" />
                Watch trailer
              </button>
              <button
                type="button"
                className="btn-secondary h-13 px-6 text-[15px]"
                onClick={() => openDownload(active)}
              >
                <Download className="h-4 w-4" />
                Download
              </button>
              <Link
                to={`/movie/${active.slug}`}
                className="group inline-flex h-13 items-center gap-2 px-2 text-sm font-semibold text-streamly-text-secondary transition-colors hover:text-streamly-text"
              >
                <Info className="h-4 w-4" />
                More info
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel switcher */}
        <div className="absolute bottom-8 left-0 right-0 z-10 mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            {featured.map((movie, index) => (
              <button
                key={movie.id}
                type="button"
                onClick={() => setHeroIndex(index)}
                aria-label={`Show ${movie.title}`}
                aria-current={index === heroIndex}
                className={cn(
                  'group relative h-14 w-24 overflow-hidden rounded-lg border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:h-16 sm:w-28',
                  index === heroIndex
                    ? 'border-streamly-purple/80 opacity-100 shadow-[0_10px_30px_-10px_rgba(139,92,246,0.9)]'
                    : 'border-white/10 opacity-45 hover:opacity-80',
                )}
              >
                <img
                  src={movie.backdropUrl}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                {index === heroIndex && !paused ? (
                  <span
                    key={`progress-${heroIndex}`}
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-streamly-purple to-streamly-cyan"
                    style={{ animation: `hero-progress ${ROTATE_MS}ms linear forwards` }}
                  />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ SEARCH ══════════════ */}
      <div className="relative z-20 mx-auto -mt-14 max-w-3xl px-4 sm:px-6">
        <form onSubmit={onSearch} className="glass-strong rounded-modal p-2 shadow-[0_40px_100px_-40px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-streamly-text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Search movies, genres, cast…"
                aria-label="Search movies"
                className="h-13 w-full bg-transparent pl-12 pr-3 text-[15px] text-streamly-text placeholder:text-streamly-text-muted focus:outline-none"
              />
            </div>
            <button type="submit" className="btn-primary h-13 shrink-0 px-6 text-sm">
              Search
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-streamly-text-muted">Popular:</span>
          {['Sci-Fi', 'Thriller', 'Heist', 'Animation', '2025'].map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
              className="rounded-full border border-streamly-border bg-white/3 px-3 py-1.5 font-medium text-streamly-text-secondary transition-all duration-300 hover:-translate-y-0.5 hover:border-streamly-purple/50 hover:text-streamly-text"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════ TRENDING ══════════════ */}
      <section className="relative mx-auto mt-20 max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <SectionHeader
          eyebrow="This week"
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          title="Trending now"
          subtitle="What the Streamly community is watching, rewatching and arguing about."
          actionLabel="Browse all"
          actionTo="/movies"
        />
        <MovieGrid movies={trending} onDownload={openDownload} />
      </section>

      {/* ══════════════ LATEST ══════════════ */}
      <section className="relative mx-auto mt-24 max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <SectionHeader
          eyebrow="Fresh cuts"
          title="Latest releases"
          subtitle="Straight off the festival circuit into your library."
          actionLabel="See everything"
          actionTo="/movies?sort=latest"
        />
        <MovieGrid movies={latest} onDownload={openDownload} />
      </section>

      {/* ══════════════ GENRES ══════════════ */}
      <section className="relative mx-auto mt-24 max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <SectionHeader
          eyebrow="Moods"
          title="Browse by genre"
          subtitle="Twelve doors. Pick one and get lost."
          actionLabel="All genres"
          actionTo="/genres"
        />

        <div className="stagger-children grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {genres.map((genre) => (
            <Link
              key={genre.id}
              to={`/genre/${genre.slug}`}
              className="group relative overflow-hidden rounded-card border border-streamly-border bg-streamly-card p-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:border-transparent"
              style={{
                backgroundImage: `radial-gradient(120% 120% at 0% 0%, ${genre.color}1f 0%, transparent 60%)`,
              }}
            >
              <span
                className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  backgroundImage: `radial-gradient(120% 120% at 100% 100%, ${genre.color}33 0%, transparent 65%)`,
                }}
              />
              <span
                className="absolute inset-x-0 bottom-0 h-px scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                style={{ background: `linear-gradient(90deg, transparent, ${genre.color}, transparent)` }}
              />

              <div className="relative flex items-start justify-between">
                <span className="text-3xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-125">
                  {genre.icon}
                </span>
                <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] font-semibold text-streamly-text-secondary">
                  {getGenreCount(genre.slug)} titles
                </span>
              </div>

              <h3 className="relative mt-6 text-lg font-bold tracking-tight text-streamly-text">
                {genre.name}
              </h3>
              <p className="relative mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-streamly-text-muted transition-colors group-hover:text-streamly-text">
                Explore
                <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════ TOP RATED ══════════════ */}
      <section className="relative mx-auto mt-24 max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <SectionHeader
          eyebrow="Hall of fame"
          title="Top rated of all time"
          subtitle="Ranked by the people who actually finish the credits."
          actionLabel="Full ranking"
          actionTo="/movies?sort=rating"
        />
        <div className="stagger-children grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {topRated.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              rank={index + 1}
              onDownload={openDownload}
            />
          ))}
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section className="relative mx-auto mt-24 max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-modal border border-streamly-border bg-gradient-to-br from-streamly-purple/18 via-streamly-card/70 to-streamly-blue/12 px-6 py-14 text-center sm:px-12">
          <div className="aurora -left-20 top-0 h-64 w-64 bg-streamly-purple/30" />
          <div className="aurora -right-16 bottom-0 h-64 w-64 bg-streamly-cyan/20" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/30 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-streamly-text-secondary">
              <Sparkles className="h-3.5 w-3.5 text-streamly-cyan" />
              Free forever
            </span>
            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-black tracking-tight text-streamly-text sm:text-4xl">
              Your next favourite film is{' '}
              <span className="gradient-text animate-gradient-x">one click away</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-streamly-text-secondary">
              Create an account to download in 1080p, join the discussions and keep a watchlist
              that syncs everywhere.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/auth/signup" className="btn-primary h-12 px-7 text-[15px]">
                Create free account
              </Link>
              <Link to="/movies" className="btn-secondary h-12 px-6 text-[15px]">
                Browse the library
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
