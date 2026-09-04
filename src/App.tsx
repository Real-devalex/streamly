import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Home } from '@/pages/Home'
import { AdminGuard } from '@/components/auth/AdminGuard'

/* ── Code-split routes ──────────────────────────────────────────
   Home + Layout stay eager (first paint). Every other route is
   lazy so the browse, detail and (heaviest) admin pages ship as
   separate chunks and are only fetched when the user visits them. */
const Movies = lazy(() => import('@/pages/Movies').then((m) => ({ default: m.Movies })))
const MovieDetails = lazy(() =>
  import('@/pages/MovieDetails').then((m) => ({ default: m.MovieDetails })),
)
const SearchPage = lazy(() => import('@/pages/Search').then((m) => ({ default: m.SearchPage })))
const Genres = lazy(() => import('@/pages/Genres').then((m) => ({ default: m.Genres })))
const GenrePage = lazy(() => import('@/pages/GenrePage').then((m) => ({ default: m.GenrePage })))
const SeriesList = lazy(() => import('@/pages/SeriesList'))
const SeriesDetails = lazy(() => import('@/pages/SeriesDetails'))
const Watchlist = lazy(() => import('@/pages/Watchlist').then((m) => ({ default: m.Watchlist })))
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })))

const SignIn = lazy(() => import('@/pages/auth/SignIn').then((m) => ({ default: m.SignIn })))
const SignUp = lazy(() => import('@/pages/auth/SignUp').then((m) => ({ default: m.SignUp })))
const ResetPassword = lazy(() =>
  import('@/pages/auth/ResetPassword').then((m) => ({ default: m.ResetPassword })),
)

const AdminLayout = lazy(() =>
  import('@/pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const Dashboard = lazy(() =>
  import('@/pages/admin/Dashboard').then((m) => ({ default: m.Dashboard })),
)
const AdminMovies = lazy(() =>
  import('@/pages/admin/AdminMovies').then((m) => ({ default: m.AdminMovies })),
)
const AdminMovieForm = lazy(() =>
  import('@/pages/admin/AdminMovieForm').then((m) => ({ default: m.AdminMovieForm })),
)
const AdminSeries = lazy(() =>
  import('@/pages/admin/AdminSeries').then((m) => ({ default: m.AdminSeries })),
)
const AdminSeriesForm = lazy(() =>
  import('@/pages/admin/AdminSeriesForm').then((m) => ({ default: m.AdminSeriesForm })),
)
const AdminSeasonEpisodes = lazy(() =>
  import('@/pages/admin/AdminSeasonEpisodes').then((m) => ({ default: m.AdminSeasonEpisodes })),
)
const AdminGenres = lazy(() =>
  import('@/pages/admin/AdminGenres').then((m) => ({ default: m.AdminGenres })),
)
const AdminComments = lazy(() =>
  import('@/pages/admin/AdminComments').then((m) => ({ default: m.AdminComments })),
)
const AdminReports = lazy(() =>
  import('@/pages/admin/AdminReports').then((m) => ({ default: m.AdminReports })),
)

function PageLoader() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      role="status"
      aria-label="Loading page"
    >
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-streamly-border" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-streamly-purple border-r-streamly-cyan" />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Main site (navbar + footer) ── */}
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="movies" element={<Movies />} />
          <Route path="movie/:slug" element={<MovieDetails />} />
          <Route path="series" element={<SeriesList />} />
          <Route path="series/:slug" element={<SeriesDetails />} />
          <Route path="watchlist" element={<Watchlist />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="genres" element={<Genres />} />
          <Route path="genre/:slug" element={<GenrePage />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ── Auth — standalone, no navbar/footer ── */}
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />
        <Route path="/auth/reset" element={<ResetPassword />} />

        {/* ── Admin — own sidebar layout, protected ── */}
        <Route element={<AdminGuard />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="movies" element={<AdminMovies />} />
            <Route path="movies/new" element={<AdminMovieForm />} />
            <Route path="movies/edit/:id" element={<AdminMovieForm />} />
            <Route path="series" element={<AdminSeries />} />
            <Route path="series/new" element={<AdminSeriesForm />} />
            <Route path="series/edit/:id" element={<AdminSeriesForm />} />
            <Route path="series/:id/seasons" element={<AdminSeasonEpisodes />} />
            <Route path="genres" element={<AdminGenres />} />
            <Route path="comments" element={<AdminComments />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
