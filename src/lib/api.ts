import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { movies as mockMovies, genres as mockGenres, searchMovies as mockSearch } from '@/data/mock-movies'
import { getAllComments as mockGetAllComments, getCommentsForMovie as mockGetCommentsForMovie, mockReports } from '@/data/mock-community'
import type { Movie, Genre, Comment, Report, CastMember, DownloadLink, Series, Season, Episode, SeriesWithSeasons, SeasonWithEpisodes } from '@/types'

/* ═══════════════════════════════════════════════════════════════
   ROW MAPPERS — convert Supabase snake_case to app camelCase
   ═══════════════════════════════════════════════════════════════ */

function mapGenre(row: Record<string, unknown>): Genre {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    icon: row.icon as string | undefined,
    color: row.color as string | undefined,
  }
}

function mapCastMember(row: Record<string, unknown>): CastMember {
  return {
    id: row.id as string,
    name: row.name as string,
    photoUrl: row.photo_url as string | undefined,
    characterName: row.character_name as string | undefined,
  }
}

function mapDownloadLink(row: Record<string, unknown>): DownloadLink {
  return {
    id: row.id as string,
    quality: row.quality as DownloadLink['quality'],
    url: row.url as string,
    fileSizeBytes: row.file_size_bytes as number | undefined,
    destinationLabel: row.destination_label as string,
  }
}

function mapMovie(row: Record<string, unknown>, extra?: { genres?: Genre[]; cast?: CastMember[]; downloads?: DownloadLink[] }): Movie {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    description: (row.description as string) ?? '',
    posterUrl: (row.poster_url as string) ?? '',
    backdropUrl: (row.backdrop_url as string) ?? '',
    trailerUrl: (row.trailer_url as string) ?? undefined,
    releaseYear: (row.release_year as number) ?? 0,
    runtimeMinutes: (row.runtime_minutes as number) ?? undefined,
    rating: Number(row.rating ?? 0),
    genres: extra?.genres ?? [],
    cast: extra?.cast ?? [],
    downloadLinks: extra?.downloads ?? [],
    status: (row.status as Movie['status']) ?? 'draft',
    featured: Boolean(row.featured),
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
  }
}

function mapComment(row: Record<string, unknown>, user?: Record<string, unknown> | null): Comment {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    movieId: row.movie_id as string,
    parentId: (row.parent_id as string) ?? undefined,
    content: row.content as string,
    isSpoiler: Boolean(row.is_spoiler),
    status: (row.status as Comment['status']) ?? 'active',
    createdAt: row.created_at as string,
    user: user
      ? {
          id: user.id as string,
          username: user.username as string,
          displayName: (user.display_name as string) ?? undefined,
          avatarUrl: (user.avatar_url as string) ?? undefined,
          bio: (user.bio as string) ?? undefined,
          role: (user.role as 'user' | 'admin') ?? 'user',
          createdAt: user.created_at as string,
        }
      : undefined,
  }
}

/* ═══════════════════════════════════════════════════════════════
   MOVIES
   ═══════════════════════════════════════════════════════════════ */

export async function fetchMovies(options?: { status?: Movie['status']; limit?: number; sort?: string }): Promise<Movie[]> {
  if (!isSupabaseConfigured) {
    let list = [...mockMovies]
    if (options?.status) list = list.filter((m) => m.status === options.status)
    if (options?.sort === 'rating') list.sort((a, b) => b.rating - a.rating)
    else if (options?.sort === 'title') list.sort((a, b) => a.title.localeCompare(b.title))
    else if (options?.sort === 'year') list.sort((a, b) => b.releaseYear - a.releaseYear)
    else list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return options?.limit ? list.slice(0, options.limit) : list
  }

  let query = supabase.from('movies').select('*')
  if (options?.status) query = query.eq('status', options.status)
  if (options?.sort === 'rating') query = query.order('rating', { ascending: false })
  else if (options?.sort === 'title') query = query.order('title', { ascending: true })
  else if (options?.sort === 'year') query = query.order('release_year', { ascending: false })
  else query = query.order('created_at', { ascending: false })
  if (options?.limit) query = query.limit(options.limit)

  const { data, error } = await query
  if (error || !data) return []

  // Fetch related data for each movie
  const movies = await Promise.all(data.map((row) => enrichMovie(row)))
  return movies
}

async function enrichMovie(row: Record<string, unknown>): Promise<Movie> {
  const movieId = row.id as string

  const [genreRows, castRows, downloadRows] = await Promise.all([
    supabase
      .from('movie_genres')
      .select('genres(*)')
      .eq('movie_id', movieId),
    supabase
      .from('movie_cast')
      .select('cast_members(*), character_name, billing_order')
      .eq('movie_id', movieId)
      .order('billing_order'),
    supabase
      .from('download_links')
      .select('*')
      .eq('movie_id', movieId),
  ])

  const genres = (genreRows.data ?? []).map((r: Record<string, unknown>) => mapGenre(r.genres as Record<string, unknown>))
  const cast = (castRows.data ?? []).map((r: Record<string, unknown>) => ({
    ...mapCastMember(r.cast_members as Record<string, unknown>),
    characterName: (r.character_name as string) ?? undefined,
  }))
  const downloads = (downloadRows.data ?? []).map((r) => mapDownloadLink(r))

  return mapMovie(row, { genres, cast, downloads })
}

export async function fetchMovieBySlug(slug: string): Promise<Movie | null> {
  if (!isSupabaseConfigured) {
    return mockMovies.find((m) => m.slug === slug) ?? null
  }

  const { data, error } = await supabase.from('movies').select('*').eq('slug', slug).single()
  if (error || !data) return null
  return enrichMovie(data)
}

export async function fetchMovieById(id: string): Promise<Movie | null> {
  if (!isSupabaseConfigured) {
    return mockMovies.find((m) => m.id === id) ?? null
  }

  const { data, error } = await supabase.from('movies').select('*').eq('id', id).single()
  if (error || !data) return null
  return enrichMovie(data)
}

export async function fetchLatestMovies(limit = 6): Promise<Movie[]> {
  if (!isSupabaseConfigured) {
    return [...mockMovies]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }

  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error || !data) return []
  return Promise.all(data.map((row) => enrichMovie(row)))
}

export async function fetchFeaturedMovies(): Promise<Movie[]> {
  if (!isSupabaseConfigured) return mockMovies.filter((m) => m.featured)

  const { data, error } = await supabase.from('movies').select('*').eq('featured', true).eq('status', 'published')
  if (error || !data) return []
  return Promise.all(data.map((row) => enrichMovie(row)))
}

export async function fetchTrendingMovies(limit = 6): Promise<Movie[]> {
  if (!isSupabaseConfigured) {
    return [...mockMovies]
      .sort((a, b) => b.rating * 10 + b.releaseYear - (a.rating * 10 + a.releaseYear))
      .slice(0, limit)
  }

  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('status', 'published')
    .order('rating', { ascending: false })
    .limit(limit)
  if (error || !data) return []
  return Promise.all(data.map((row) => enrichMovie(row)))
}

export async function fetchTopRatedMovies(limit = 10): Promise<Movie[]> {
  if (!isSupabaseConfigured) {
    return [...mockMovies].sort((a, b) => b.rating - a.rating).slice(0, limit)
  }

  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('status', 'published')
    .order('rating', { ascending: false })
    .limit(limit)
  if (error || !data) return []
  return Promise.all(data.map((row) => enrichMovie(row)))
}

export async function searchMoviesOnline(query: string): Promise<Movie[]> {
  if (!isSupabaseConfigured) return mockSearch(query)

  const term = query.trim().toLowerCase()
  if (!term) return []

  // Use ilike for partial matching on title, then filter genres/cast client-side
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('status', 'published')
    .or(`title.ilike.%${term}%,description.ilike.%${term}%`)
    .order('rating', { ascending: false })

  if (error || !data) return []
  return Promise.all(data.map((row) => enrichMovie(row)))
}

export async function fetchRelatedMovies(movie: Movie, limit = 4): Promise<Movie[]> {
  if (!isSupabaseConfigured) {
    const slugs = new Set(movie.genres.map((g) => g.slug))
    return mockMovies
      .filter((c) => c.id !== movie.id)
      .map((c) => ({ movie: c, score: c.genres.filter((g) => slugs.has(g.slug)).length * 2 + (Math.abs(c.rating - movie.rating) < 0.8 ? 1 : 0) }))
      .sort((a, b) => b.score - a.score || b.movie.rating - a.movie.rating)
      .slice(0, limit)
      .map((e) => e.movie)
  }

  // Get movies with matching genres
  const genreIds = movie.genres.map((g) => g.id)
  if (genreIds.length === 0) return []

  const { data } = await supabase
    .from('movie_genres')
    .select('movie_id')
    .in('genre_id', genreIds)
    .neq('movie_id', movie.id)

  const movieIds = [...new Set((data ?? []).map((r) => r.movie_id as string))].slice(0, limit * 2)
  if (movieIds.length === 0) return []

  const { data: related } = await supabase.from('movies').select('*').in('id', movieIds).eq('status', 'published')
  if (!related) return []

  return Promise.all(related.slice(0, limit).map((row) => enrichMovie(row)))
}

/* ═══════════════════════════════════════════════════════════════
   MOVIE CRUD (Admin)
   ═══════════════════════════════════════════════════════════════ */

export interface MovieInput {
  title: string
  slug: string
  description: string
  posterUrl: string
  backdropUrl: string
  trailerUrl: string
  releaseYear: number
  runtimeMinutes: number
  rating: number
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  genreIds: string[]
  cast: Array<{ castMemberId: string; characterName: string }>
  downloadLinks: Array<{ quality: '1080p' | '720p' | '480p'; url: string; fileSizeBytes: number; destinationLabel: string }>
}

export async function createMovie(input: MovieInput): Promise<Movie | null> {
  if (!isSupabaseConfigured) return null

  const { data: movie, error: movieError } = await supabase
    .from('movies')
    .insert({
      title: input.title,
      slug: input.slug,
      description: input.description,
      poster_url: input.posterUrl,
      backdrop_url: input.backdropUrl,
      trailer_url: input.trailerUrl || null,
      release_year: input.releaseYear,
      runtime_minutes: input.runtimeMinutes,
      rating: input.rating,
      status: input.status,
      featured: input.featured,
    })
    .select()
    .single()

  if (movieError || !movie) return null

  // Insert genres
  if (input.genreIds.length > 0) {
    await supabase.from('movie_genres').insert(
      input.genreIds.map((genreId) => ({ movie_id: movie.id, genre_id: genreId })),
    )
  }

  // Insert cast
  if (input.cast.length > 0) {
    await supabase.from('movie_cast').insert(
      input.cast.map((c, i) => ({
        movie_id: movie.id,
        cast_member_id: c.castMemberId,
        character_name: c.characterName,
        billing_order: i + 1,
      })),
    )
  }

  // Insert download links
  if (input.downloadLinks.length > 0) {
    await supabase.from('download_links').insert(
      input.downloadLinks.map((dl) => ({
        movie_id: movie.id,
        quality: dl.quality,
        url: dl.url,
        file_size_bytes: dl.fileSizeBytes,
        destination_label: dl.destinationLabel,
      })),
    )
  }

  return fetchMovieById(movie.id)
}

export async function updateMovie(id: string, input: MovieInput): Promise<Movie | null> {
  if (!isSupabaseConfigured) return null

  const { error: movieError } = await supabase
    .from('movies')
    .update({
      title: input.title,
      slug: input.slug,
      description: input.description,
      poster_url: input.posterUrl,
      backdrop_url: input.backdropUrl,
      trailer_url: input.trailerUrl || null,
      release_year: input.releaseYear,
      runtime_minutes: input.runtimeMinutes,
      rating: input.rating,
      status: input.status,
      featured: input.featured,
    })
    .eq('id', id)

  if (movieError) return null

  // Replace genres
  await supabase.from('movie_genres').delete().eq('movie_id', id)
  if (input.genreIds.length > 0) {
    await supabase.from('movie_genres').insert(
      input.genreIds.map((genreId) => ({ movie_id: id, genre_id: genreId })),
    )
  }

  // Replace cast
  await supabase.from('movie_cast').delete().eq('movie_id', id)
  if (input.cast.length > 0) {
    await supabase.from('movie_cast').insert(
      input.cast.map((c, i) => ({
        movie_id: id,
        cast_member_id: c.castMemberId,
        character_name: c.characterName,
        billing_order: i + 1,
      })),
    )
  }

  // Replace download links
  await supabase.from('download_links').delete().eq('movie_id', id)
  if (input.downloadLinks.length > 0) {
    await supabase.from('download_links').insert(
      input.downloadLinks.map((dl) => ({
        movie_id: id,
        quality: dl.quality,
        url: dl.url,
        file_size_bytes: dl.fileSizeBytes,
        destination_label: dl.destinationLabel,
      })),
    )
  }

  return fetchMovieById(id)
}

export async function deleteMovie(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { error } = await supabase.from('movies').delete().eq('id', id)
  return !error
}

/* ═══════════════════════════════════════════════════════════════
   GENRES
   ═══════════════════════════════════════════════════════════════ */

export async function fetchGenres(): Promise<Genre[]> {
  if (!isSupabaseConfigured) return [...mockGenres]

  const { data, error } = await supabase.from('genres').select('*').order('name')
  if (error || !data) return []
  return data.map(mapGenre)
}

export async function fetchGenreBySlug(slug: string): Promise<Genre | null> {
  if (!isSupabaseConfigured) return mockGenres.find((g) => g.slug === slug) ?? null

  const { data, error } = await supabase.from('genres').select('*').eq('slug', slug).single()
  if (error || !data) return null
  return mapGenre(data)
}

export async function createGenre(genre: { name: string; slug: string; icon?: string; color?: string }): Promise<Genre | null> {
  if (!isSupabaseConfigured) return null

  const { data, error } = await supabase.from('genres').insert(genre).select().single()
  if (error || !data) return null
  return mapGenre(data)
}

export async function updateGenre(id: string, genre: { name?: string; slug?: string; icon?: string; color?: string }): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { error } = await supabase.from('genres').update(genre).eq('id', id)
  return !error
}

export async function deleteGenre(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { error } = await supabase.from('genres').delete().eq('id', id)
  return !error
}

export async function getGenreMovieCount(slug: string): Promise<number> {
  if (!isSupabaseConfigured) return mockMovies.filter((m) => m.genres.some((g) => g.slug === slug)).length

  const { data: genre } = await supabase.from('genres').select('id').eq('slug', slug).single()
  if (!genre) return 0

  const { count } = await supabase
    .from('movie_genres')
    .select('*', { count: 'exact', head: true })
    .eq('genre_id', genre.id)
  return count ?? 0
}

export async function fetchMoviesByGenreSlug(slug: string): Promise<Movie[]> {
  if (!isSupabaseConfigured) return mockMovies.filter((m) => m.genres.some((g) => g.slug === slug))

  const { data: genre } = await supabase.from('genres').select('id').eq('slug', slug).single()
  if (!genre) return []

  const { data: movieGenreRows } = await supabase.from('movie_genres').select('movie_id').eq('genre_id', genre.id)
  const movieIds = (movieGenreRows ?? []).map((r) => r.movie_id as string)
  if (movieIds.length === 0) return []

  const { data } = await supabase.from('movies').select('*').in('id', movieIds).eq('status', 'published')
  if (!data) return []
  return Promise.all(data.map((row) => enrichMovie(row)))
}

/* ═══════════════════════════════════════════════════════════════
   CAST MEMBERS
   ═══════════════════════════════════════════════════════════════ */

export async function fetchCastMembers(): Promise<CastMember[]> {
  if (!isSupabaseConfigured) return []

  const { data, error } = await supabase.from('cast_members').select('*').order('name')
  if (error || !data) return []
  return data.map(mapCastMember)
}

export async function searchCastMembers(query: string): Promise<CastMember[]> {
  if (!isSupabaseConfigured) return []

  const { data, error } = await supabase
    .from('cast_members')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(20)
  if (error || !data) return []
  return data.map(mapCastMember)
}

export async function createCastMember(name: string, photoUrl?: string): Promise<CastMember | null> {
  if (!isSupabaseConfigured) return null

  const { data, error } = await supabase.from('cast_members').insert({ name, photo_url: photoUrl ?? null }).select().single()
  if (error || !data) return null
  return mapCastMember(data)
}

/* ═══════════════════════════════════════════════════════════════
   COMMENTS
   ═══════════════════════════════════════════════════════════════ */

export async function fetchCommentsForMovie(movieId: string): Promise<Comment[]> {
  if (!isSupabaseConfigured) return mockGetCommentsForMovie(movieId)

  const { data, error } = await supabase
    .from('comments')
    .select('*, profiles:user_id(*)')
    .eq('movie_id', movieId)
    .is('parent_id', null)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  if (error || !data) return []

  return Promise.all(
    data.map(async (row) => {
      const comment = mapComment(row, row.profiles as Record<string, unknown>)

      // Fetch replies
      const { data: replies } = await supabase
        .from('comments')
        .select('*, profiles:user_id(*)')
        .eq('parent_id', row.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true })

      // Fetch reactions
      const { data: reactions } = await supabase
        .from('reactions')
        .select('*')
        .eq('comment_id', row.id)

      return {
        ...comment,
        replies: (replies ?? []).map((r) => mapComment(r, r.profiles as Record<string, unknown>)),
        reactions: (reactions ?? []).map((r) => ({
          id: r.id as string,
          userId: r.user_id as string,
          commentId: (r.comment_id as string) ?? undefined,
          movieId: (r.movie_id as string) ?? undefined,
          reactionType: r.reaction_type as Comment['reactions'] extends (infer T)[] | undefined ? T extends { reactionType: infer RT } ? RT : never : never,
          createdAt: r.created_at as string,
        })),
      }
    }),
  )
}

export async function insertComment(movieId: string, userId: string, content: string, isSpoiler: boolean, parentId?: string): Promise<Comment | null> {
  if (!isSupabaseConfigured) return null

  const { data, error } = await supabase
    .from('comments')
    .insert({
      movie_id: movieId,
      user_id: userId,
      content,
      is_spoiler: isSpoiler,
      parent_id: parentId ?? null,
    })
    .select('*, profiles:user_id(*)')
    .single()

  if (error || !data) return null
  return mapComment(data, data.profiles as Record<string, unknown>)
}

export async function fetchAllComments(): Promise<Comment[]> {
  if (!isSupabaseConfigured) return mockGetAllComments()

  const { data, error } = await supabase
    .from('comments')
    .select('*, profiles:user_id(*)')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error || !data) return []

  return data.map((row) => mapComment(row, row.profiles as Record<string, unknown>))
}

export async function updateCommentStatus(id: string, status: 'active' | 'hidden' | 'deleted'): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { error } = await supabase.from('comments').update({ status }).eq('id', id)
  return !error
}

export async function deleteComment(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { error } = await supabase.from('comments').delete().eq('id', id)
  return !error
}

/* ═══════════════════════════════════════════════════════════════
   REACTIONS
   ═══════════════════════════════════════════════════════════════ */

export async function toggleReaction(userId: string, commentId: string, reactionType: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false

  // Check if reaction exists
  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('user_id', userId)
    .eq('comment_id', commentId)
    .eq('reaction_type', reactionType)
    .maybeSingle()

  if (existing) {
    await supabase.from('reactions').delete().eq('id', existing.id)
  } else {
    await supabase.from('reactions').insert({
      user_id: userId,
      comment_id: commentId,
      reaction_type: reactionType,
    })
  }
  return true
}

/* ═══════════════════════════════════════════════════════════════
   REPORTS
   ═══════════════════════════════════════════════════════════════ */

export async function fetchReports(): Promise<Report[]> {
  if (!isSupabaseConfigured) return mockReports

  const { data, error } = await supabase
    .from('reports')
    .select('*, profiles:reporter_id(*)')
    .order('created_at', { ascending: false })
  if (error || !data) return []

  return data.map((row) => ({
    id: row.id as string,
    reporterId: row.reporter_id as string,
    targetType: row.target_type as Report['targetType'],
    targetId: row.target_id as string,
    reason: row.reason as Report['reason'],
    details: (row.details as string) ?? undefined,
    status: row.status as Report['status'],
    createdAt: row.created_at as string,
    reporter: row.profiles
      ? {
          id: (row.profiles as Record<string, unknown>).id as string,
          username: (row.profiles as Record<string, unknown>).username as string,
          displayName: ((row.profiles as Record<string, unknown>).display_name as string) ?? undefined,
          avatarUrl: ((row.profiles as Record<string, unknown>).avatar_url as string) ?? undefined,
          role: ((row.profiles as Record<string, unknown>).role as 'user' | 'admin') ?? 'user',
          createdAt: (row.profiles as Record<string, unknown>).created_at as string,
        }
      : undefined,
  }))
}

export async function updateReportStatus(id: string, status: Report['status']): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { error } = await supabase.from('reports').update({ status }).eq('id', id)
  return !error
}

/* ═══════════════════════════════════════════════════════════════
   STATS (Admin Dashboard)
   ═══════════════════════════════════════════════════════════════ */

export interface DashboardStats {
  movieCount: number
  publishedCount: number
  featuredCount: number
  userCount: number
  commentCount: number
  reportCount: number
  pendingReportCount: number
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseConfigured) {
    return {
      movieCount: mockMovies.length,
      publishedCount: mockMovies.filter((m) => m.status === 'published').length,
      featuredCount: mockMovies.filter((m) => m.featured).length,
      userCount: 0,
      commentCount: mockGetAllComments().length,
      reportCount: mockReports.length,
      pendingReportCount: mockReports.filter((r) => r.status === 'pending').length,
    }
  }

  const [movies, users, comments, reports] = await Promise.all([
    supabase.from('movies').select('id, status, featured', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('comments').select('id', { count: 'exact' }),
    supabase.from('reports').select('id, status', { count: 'exact' }),
  ])

  return {
    movieCount: movies.count ?? 0,
    publishedCount: (movies.data ?? []).filter((m) => m.status === 'published').length,
    featuredCount: (movies.data ?? []).filter((m) => m.featured).length,
    userCount: users.count ?? 0,
    commentCount: comments.count ?? 0,
    reportCount: reports.count ?? 0,
    pendingReportCount: (reports.data ?? []).filter((r) => r.status === 'pending').length,
  }
}

/* ═══════════════════════════════════════════════════════════════
   TV SERIES
   ═══════════════════════════════════════════════════════════════ */

function mapSeries(row: Record<string, unknown>, extra?: { genres?: Genre[]; cast?: CastMember[] }): Series {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    description: (row.description as string) ?? '',
    posterUrl: (row.poster_url as string) ?? '',
    backdropUrl: (row.backdrop_url as string) ?? '',
    trailerUrl: (row.trailer_url as string) ?? undefined,
    releaseYear: (row.release_year as number) ?? 0,
    status: (row.status as Series['status']) ?? 'draft',
    featured: Boolean(row.featured),
    rating: Number(row.rating ?? 0),
    totalSeasons: (row.total_seasons as number) ?? 0,
    totalEpisodes: (row.total_episodes as number) ?? 0,
    genres: extra?.genres ?? [],
    cast: extra?.cast ?? [],
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
  }
}

function mapSeason(row: Record<string, unknown>): Season {
  return {
    id: row.id as string,
    seriesId: row.series_id as string,
    seasonNumber: row.season_number as number,
    title: (row.title as string) ?? undefined,
    description: (row.description as string) ?? undefined,
    posterUrl: (row.poster_url as string) ?? undefined,
    episodeCount: (row.episode_count as number) ?? 0,
    releaseYear: (row.release_year as number) ?? undefined,
  }
}

function mapEpisode(row: Record<string, unknown>, downloads?: DownloadLink[]): Episode {
  return {
    id: row.id as string,
    seasonId: row.season_id as string,
    episodeNumber: row.episode_number as number,
    title: row.title as string,
    description: (row.description as string) ?? undefined,
    stillUrl: (row.still_url as string) ?? undefined,
    runtimeMinutes: (row.runtime_minutes as number) ?? undefined,
    airDate: (row.air_date as string) ?? undefined,
    status: (row.status as Episode['status']) ?? 'draft',
    downloadLinks: downloads ?? [],
  }
}

async function enrichSeries(row: Record<string, unknown>): Promise<Series> {
  const seriesId = row.id as string

  const [genreRows, castRows] = await Promise.all([
    supabase.from('series_genres').select('genres(*)').eq('series_id', seriesId),
    supabase.from('series_cast').select('cast_members(*), character_name, billing_order').eq('series_id', seriesId).order('billing_order'),
  ])

  const genres = (genreRows.data ?? []).map((r: Record<string, unknown>) => mapGenre(r.genres as Record<string, unknown>))
  const cast = (castRows.data ?? []).map((r: Record<string, unknown>) => ({
    ...mapCastMember(r.cast_members as Record<string, unknown>),
    characterName: (r.character_name as string) ?? undefined,
  }))

  return mapSeries(row, { genres, cast })
}

export async function fetchSeries(options?: { status?: Series['status']; limit?: number; sort?: string }): Promise<Series[]> {
  if (!isSupabaseConfigured) return []

  let query = supabase.from('series').select('*')
  if (options?.status) query = query.eq('status', options.status)
  if (options?.sort === 'rating') query = query.order('rating', { ascending: false })
  else query = query.order('created_at', { ascending: false })
  if (options?.limit) query = query.limit(options.limit)

  const { data, error } = await query
  if (error || !data) return []
  return Promise.all(data.map((row) => enrichSeries(row)))
}

export async function fetchFeaturedSeries(limit = 6): Promise<Series[]> {
  if (!isSupabaseConfigured) return []

  const { data, error } = await supabase.from('series').select('*').eq('featured', true).eq('status', 'published').order('rating', { ascending: false }).limit(limit)
  if (error || !data) return []
  return Promise.all(data.map((row) => enrichSeries(row)))
}

export async function fetchTrendingSeries(limit = 6): Promise<Series[]> {
  if (!isSupabaseConfigured) return []

  const { data, error } = await supabase.from('series').select('*').eq('status', 'published').order('rating', { ascending: false }).limit(limit)
  if (error || !data) return []
  return Promise.all(data.map((row) => enrichSeries(row)))
}

export async function fetchSeriesBySlug(slug: string): Promise<SeriesWithSeasons | null> {
  if (!isSupabaseConfigured) return null

  const { data, error } = await supabase.from('series').select('*').eq('slug', slug).single()
  if (error || !data) return null

  const series = await enrichSeries(data)
  const seasons = await fetchSeasonsForSeries(series.id)
  return { ...series, seasons }
}

export async function fetchSeriesById(id: string): Promise<SeriesWithSeasons | null> {
  if (!isSupabaseConfigured) return null

  const { data, error } = await supabase.from('series').select('*').eq('id', id).single()
  if (error || !data) return null

  const series = await enrichSeries(data)
  const seasons = await fetchSeasonsForSeries(series.id)
  return { ...series, seasons }
}

export async function fetchSeasonsForSeries(seriesId: string): Promise<Season[]> {
  if (!isSupabaseConfigured) return []

  const { data, error } = await supabase.from('seasons').select('*').eq('series_id', seriesId).order('season_number')
  if (error || !data) return []
  return data.map(mapSeason)
}

export async function fetchSeasonWithEpisodes(seasonId: string): Promise<SeasonWithEpisodes | null> {
  if (!isSupabaseConfigured) return null

  const { data: season, error } = await supabase.from('seasons').select('*').eq('id', seasonId).single()
  if (error || !season) return null

  const { data: epRows } = await supabase.from('episodes').select('*').eq('season_id', seasonId).order('episode_number')

  const episodes = await Promise.all(
    (epRows ?? []).map(async (ep) => {
      const { data: dlRows } = await supabase.from('episode_download_links').select('*').eq('episode_id', ep.id)
      return mapEpisode(ep, (dlRows ?? []).map(mapDownloadLink))
    }),
  )

  return { ...mapSeason(season), episodes }
}

/* ═══════════════════════════════════════════════════════════════
   SERIES CRUD (Admin)
   ═══════════════════════════════════════════════════════════════ */

export interface SeriesInput {
  title: string
  slug: string
  description: string
  posterUrl: string
  backdropUrl: string
  trailerUrl: string
  releaseYear: number
  rating: number
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  genreIds: string[]
  cast: Array<{ castMemberId: string; characterName: string }>
}

export async function createSeries(input: SeriesInput): Promise<Series | null> {
  if (!isSupabaseConfigured) return null

  const { data, error } = await supabase
    .from('series')
    .insert({
      title: input.title, slug: input.slug, description: input.description,
      poster_url: input.posterUrl, backdrop_url: input.backdropUrl,
      trailer_url: input.trailerUrl || null, release_year: input.releaseYear,
      rating: input.rating, status: input.status, featured: input.featured,
    })
    .select().single()

  if (error || !data) return null

  if (input.genreIds.length > 0) {
    await supabase.from('series_genres').insert(input.genreIds.map((gid) => ({ series_id: data.id, genre_id: gid })))
  }
  if (input.cast.length > 0) {
    await supabase.from('series_cast').insert(input.cast.map((c, i) => ({
      series_id: data.id, cast_member_id: c.castMemberId, character_name: c.characterName, billing_order: i + 1,
    })))
  }

  return fetchSeriesById(data.id)
}

export async function updateSeries(id: string, input: SeriesInput): Promise<Series | null> {
  if (!isSupabaseConfigured) return null

  const { error } = await supabase
    .from('series')
    .update({
      title: input.title, slug: input.slug, description: input.description,
      poster_url: input.posterUrl, backdrop_url: input.backdropUrl,
      trailer_url: input.trailerUrl || null, release_year: input.releaseYear,
      rating: input.rating, status: input.status, featured: input.featured,
    })
    .eq('id', id)
  if (error) return null

  await supabase.from('series_genres').delete().eq('series_id', id)
  if (input.genreIds.length > 0) {
    await supabase.from('series_genres').insert(input.genreIds.map((gid) => ({ series_id: id, genre_id: gid })))
  }

  await supabase.from('series_cast').delete().eq('series_id', id)
  if (input.cast.length > 0) {
    await supabase.from('series_cast').insert(input.cast.map((c, i) => ({
      series_id: id, cast_member_id: c.castMemberId, character_name: c.characterName, billing_order: i + 1,
    })))
  }

  return fetchSeriesById(id)
}

export async function deleteSeries(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { error } = await supabase.from('series').delete().eq('id', id)
  return !error
}

/* ═══════════════════════════════════════════════════════════════
   SEASONS & EPISODES CRUD (Admin)
   ═══════════════════════════════════════════════════════════════ */

export async function createSeason(seriesId: string, seasonNumber: number, title?: string, description?: string): Promise<Season | null> {
  if (!isSupabaseConfigured) return null

  const { data, error } = await supabase
    .from('seasons')
    .insert({ series_id: seriesId, season_number: seasonNumber, title, description })
    .select().single()
  if (error || !data) return null
  return mapSeason(data)
}

export async function updateSeason(id: string, updates: { title?: string; description?: string; posterUrl?: string }): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const payload: Record<string, unknown> = {}
  if (updates.title !== undefined) payload.title = updates.title
  if (updates.description !== undefined) payload.description = updates.description
  if (updates.posterUrl !== undefined) payload.poster_url = updates.posterUrl
  const { error } = await supabase.from('seasons').update(payload).eq('id', id)
  return !error
}

export async function deleteSeason(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { error } = await supabase.from('seasons').delete().eq('id', id)
  return !error
}

export async function createEpisode(seasonId: string, input: { episodeNumber: number; title: string; description?: string; stillUrl?: string; runtimeMinutes?: number; airDate?: string }): Promise<Episode | null> {
  if (!isSupabaseConfigured) return null

  const { data, error } = await supabase
    .from('episodes')
    .insert({
      season_id: seasonId, episode_number: input.episodeNumber, title: input.title,
      description: input.description, still_url: input.stillUrl,
      runtime_minutes: input.runtimeMinutes, air_date: input.airDate,
    })
    .select().single()
  if (error || !data) return null
  return mapEpisode(data)
}

export async function updateEpisode(id: string, updates: { title?: string; description?: string; stillUrl?: string; runtimeMinutes?: number; airDate?: string; status?: 'draft' | 'published' }): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const payload: Record<string, unknown> = {}
  if (updates.title !== undefined) payload.title = updates.title
  if (updates.description !== undefined) payload.description = updates.description
  if (updates.stillUrl !== undefined) payload.still_url = updates.stillUrl
  if (updates.runtimeMinutes !== undefined) payload.runtime_minutes = updates.runtimeMinutes
  if (updates.airDate !== undefined) payload.air_date = updates.airDate
  if (updates.status !== undefined) payload.status = updates.status
  const { error } = await supabase.from('episodes').update(payload).eq('id', id)
  return !error
}

export async function deleteEpisode(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { error } = await supabase.from('episodes').delete().eq('id', id)
  return !error
}

export async function addEpisodeDownloadLink(episodeId: string, quality: '1080p' | '720p' | '480p', url: string, fileSizeBytes?: number, destinationLabel = 'Streamly CDN'): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { error } = await supabase.from('episode_download_links').insert({
    episode_id: episodeId, quality, url, file_size_bytes: fileSizeBytes, destination_label: destinationLabel,
  })
  return !error
}
