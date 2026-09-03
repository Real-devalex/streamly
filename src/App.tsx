import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Home } from '@/pages/Home'
import { Movies } from '@/pages/Movies'
import { MovieDetails } from '@/pages/MovieDetails'
import { SearchPage } from '@/pages/Search'
import { Genres } from '@/pages/Genres'
import { GenrePage } from '@/pages/GenrePage'
import SeriesList from '@/pages/SeriesList'
import SeriesDetails from '@/pages/SeriesDetails'
import { NotFound } from '@/pages/NotFound'
import { SignIn } from '@/pages/auth/SignIn'
import { SignUp } from '@/pages/auth/SignUp'
import { ResetPassword } from '@/pages/auth/ResetPassword'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import { Dashboard } from '@/pages/admin/Dashboard'
import { AdminMovies } from '@/pages/admin/AdminMovies'
import { AdminMovieForm } from '@/pages/admin/AdminMovieForm'
import { AdminSeries } from '@/pages/admin/AdminSeries'
import { AdminSeriesForm } from '@/pages/admin/AdminSeriesForm'
import { AdminSeasonEpisodes } from '@/pages/admin/AdminSeasonEpisodes'
import { AdminGenres } from '@/pages/admin/AdminGenres'
import { AdminComments } from '@/pages/admin/AdminComments'
import { AdminReports } from '@/pages/admin/AdminReports'

export default function App() {
  return (
    <Routes>
      {/* ── Main site (navbar + footer) ── */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="movies" element={<Movies />} />
        <Route path="movie/:slug" element={<MovieDetails />} />
        <Route path="series" element={<SeriesList />} />
        <Route path="series/:slug" element={<SeriesDetails />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="genres" element={<Genres />} />
        <Route path="genre/:slug" element={<GenrePage />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* ── Auth — standalone, no navbar/footer ── */}
      <Route path="/auth/signin" element={<SignIn />} />
      <Route path="/auth/signup" element={<SignUp />} />
      <Route path="/auth/reset" element={<ResetPassword />} />

      {/* ── Admin — own sidebar layout ── */}
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
    </Routes>
  )
}
