/**
 * TMDB helper layer — used by the admin TMDB auto-fill modal.
 * All requests use the `?api_key=` query parameter form.
 */

const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_POSTER = 'https://image.tmdb.org/t/p/w780'
const IMAGE_BACKDROP = 'https://image.tmdb.org/t/p/original'
const IMAGE_PROFILE = 'https://image.tmdb.org/t/p/w185'

export const TMDB_API_KEY: string = (import.meta.env.VITE_TMDB_API_KEY ?? '').trim()
export const isTmdbConfigured = TMDB_API_KEY.length > 0

export type TmdbKind = 'movie' | 'tv'

export interface TmdbSearchResult {
  id: number
  title: string
  year: number | null
  overview: string
  posterUrl: string
  backdropUrl: string
  rating: number
}

export interface TmdbDetails {
  id: number
  title: string
  description: string
  posterUrl: string
  backdropUrl: string
  releaseYear: number
  runtimeMinutes: number
  /** 0–10 scale, matching Streamly's rating field. */
  rating: number
  genreNames: string[]
  genreSlugs: string[]
  trailerUrl: string
  cast: Array<{ name: string; characterName: string; photoUrl: string }>
  totalSeasons: number
  totalEpisodes: number
}

function endpoint(path: string, params: Record<string, string> = {}): string {
  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set('api_key', TMDB_API_KEY)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  return url.toString()
}

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

export function tmdbSlugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** TMDB genre name → Streamly genre slug. */
const GENRE_SLUG_OVERRIDES: Record<string, string> = {
  'science fiction': 'sci-fi',
  'sci-fi & fantasy': 'sci-fi',
  'action & adventure': 'action',
  'war & politics': 'war',
  'tv movie': 'drama',
  kids: 'animation',
  soap: 'drama',
  talk: 'documentary',
  reality: 'documentary',
  news: 'documentary',
}

export function tmdbGenreToSlug(name: string): string {
  const key = name.trim().toLowerCase()
  return GENRE_SLUG_OVERRIDES[key] ?? tmdbSlugify(key)
}

interface RawSearchItem {
  id: number
  title?: string
  name?: string
  overview?: string
  poster_path?: string | null
  backdrop_path?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
}

function yearOf(value?: string): number | null {
  if (!value) return null
  const year = Number(value.slice(0, 4))
  return Number.isFinite(year) && year > 0 ? year : null
}

export async function searchTmdb(kind: TmdbKind, query: string): Promise<TmdbSearchResult[]> {
  const term = query.trim()
  if (!term || !isTmdbConfigured) return []

  const data = await getJson<{ results?: RawSearchItem[] }>(
    endpoint(`/search/${kind}`, { query: term, include_adult: 'false' }),
  )
  if (!data?.results) return []

  return data.results.slice(0, 18).map((item) => ({
    id: item.id,
    title: item.title ?? item.name ?? 'Untitled',
    year: yearOf(item.release_date ?? item.first_air_date),
    overview: item.overview ?? '',
    posterUrl: item.poster_path ? `${IMAGE_POSTER}${item.poster_path}` : '',
    backdropUrl: item.backdrop_path ? `${IMAGE_BACKDROP}${item.backdrop_path}` : '',
    rating: Number(item.vote_average ?? 0),
  }))
}

interface RawDetails extends RawSearchItem {
  runtime?: number
  episode_run_time?: number[]
  genres?: Array<{ id: number; name: string }>
  number_of_seasons?: number
  number_of_episodes?: number
}

interface RawCredits {
  cast?: Array<{ name: string; character?: string; profile_path?: string | null }>
}

interface RawVideos {
  results?: Array<{ site: string; type: string; key: string; official?: boolean; name?: string }>
}

export async function fetchTmdbDetails(kind: TmdbKind, id: number): Promise<TmdbDetails | null> {
  if (!isTmdbConfigured) return null

  const [details, credits, videos] = await Promise.all([
    getJson<RawDetails>(endpoint(`/${kind}/${id}`)),
    getJson<RawCredits>(endpoint(`/${kind}/${id}/credits`)),
    getJson<RawVideos>(endpoint(`/${kind}/${id}/videos`)),
  ])

  if (!details) return null

  const genreNames = (details.genres ?? []).map((g) => g.name)
  const trailer =
    (videos?.results ?? []).find(
      (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official,
    ) ??
    (videos?.results ?? []).find((v) => v.site === 'YouTube' && v.type === 'Trailer') ??
    (videos?.results ?? []).find((v) => v.site === 'YouTube' && v.type === 'Teaser')

  return {
    id: details.id,
    title: details.title ?? details.name ?? 'Untitled',
    description: details.overview ?? '',
    posterUrl: details.poster_path ? `${IMAGE_POSTER}${details.poster_path}` : '',
    backdropUrl: details.backdrop_path ? `${IMAGE_BACKDROP}${details.backdrop_path}` : '',
    releaseYear: yearOf(details.release_date ?? details.first_air_date) ?? new Date().getFullYear(),
    runtimeMinutes: details.runtime ?? details.episode_run_time?.[0] ?? 0,
    rating: Math.round((Number(details.vote_average ?? 0)) * 10) / 10,
    genreNames,
    genreSlugs: genreNames.map(tmdbGenreToSlug),
    trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '',
    cast: (credits?.cast ?? []).slice(0, 10).map((member) => ({
      name: member.name,
      characterName: member.character ?? '',
      photoUrl: member.profile_path ? `${IMAGE_PROFILE}${member.profile_path}` : '',
    })),
    totalSeasons: details.number_of_seasons ?? 0,
    totalEpisodes: details.number_of_episodes ?? 0,
  }
}

export async function fetchTmdbGenreList(kind: TmdbKind): Promise<Array<{ id: number; name: string }>> {
  if (!isTmdbConfigured) return []
  const data = await getJson<{ genres?: Array<{ id: number; name: string }> }>(
    endpoint(`/genre/${kind}/list`),
  )
  return data?.genres ?? []
}
