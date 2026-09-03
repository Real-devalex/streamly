import type { CastMember, DownloadLink, Genre, Movie } from '@/types'
import { placeholderImage } from '@/utils/helpers'

/* ─────────────────────────────────────────────────────────────
   Genres
   ───────────────────────────────────────────────────────────── */
export const genres: Genre[] = [
  { id: 'g1', name: 'Action', slug: 'action', icon: '💥', color: '#f97316' },
  { id: 'g2', name: 'Adventure', slug: 'adventure', icon: '🧭', color: '#22c55e' },
  { id: 'g3', name: 'Sci-Fi', slug: 'sci-fi', icon: '🚀', color: '#22d3ee' },
  { id: 'g4', name: 'Thriller', slug: 'thriller', icon: '🔪', color: '#ef4444' },
  { id: 'g5', name: 'Drama', slug: 'drama', icon: '🎭', color: '#a855f7' },
  { id: 'g6', name: 'Comedy', slug: 'comedy', icon: '😂', color: '#fbbf24' },
  { id: 'g7', name: 'Horror', slug: 'horror', icon: '👻', color: '#7c3aed' },
  { id: 'g8', name: 'Romance', slug: 'romance', icon: '💖', color: '#f472b6' },
  { id: 'g9', name: 'Animation', slug: 'animation', icon: '🎨', color: '#38bdf8' },
  { id: 'g10', name: 'Crime', slug: 'crime', icon: '🕵️', color: '#64748b' },
  { id: 'g11', name: 'Mystery', slug: 'mystery', icon: '🔍', color: '#14b8a6' },
  { id: 'g12', name: 'Fantasy', slug: 'fantasy', icon: '🪄', color: '#8b5cf6' },
]

const genre = (...slugs: string[]): Genre[] =>
  slugs
    .map((slug) => genres.find((g) => g.slug === slug))
    .filter((g): g is Genre => Boolean(g))

const cast = (entries: Array<[string, string]>): CastMember[] =>
  entries.map(([name, characterName], index) => ({
    id: `${name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
    name,
    characterName,
    photoUrl: placeholderImage(`cast-${name.toLowerCase().replace(/\s+/g, '-')}`, 200, 200),
  }))

const links = (slug: string): DownloadLink[] => [
  {
    id: `${slug}-1080`,
    quality: '1080p',
    url: `https://cdn.streamly.app/${slug}/${slug}-1080p.mkv`,
    fileSizeBytes: 4_320_000_000 + slug.length * 12_000_000,
    destinationLabel: 'Streamly CDN · Global Edge',
  },
  {
    id: `${slug}-720`,
    quality: '720p',
    url: `https://cdn.streamly.app/${slug}/${slug}-720p.mkv`,
    fileSizeBytes: 2_140_000_000 + slug.length * 7_000_000,
    destinationLabel: 'Streamly CDN · Global Edge',
  },
  {
    id: `${slug}-480`,
    quality: '480p',
    url: `https://cdn.streamly.app/${slug}/${slug}-480p.mkv`,
    fileSizeBytes: 890_000_000 + slug.length * 3_000_000,
    destinationLabel: 'Streamly CDN · Data Saver',
  },
]

/* ─────────────────────────────────────────────────────────────
   Movies
   ───────────────────────────────────────────────────────────── */
export const movies: Movie[] = [
  {
    id: 'm1',
    title: 'Neon Horizon',
    slug: 'neon-horizon',
    description:
      'In a rain-soaked megacity where memories are traded as currency, a rogue courier discovers a recording that could collapse the regime — and she is the only one who remembers what it means.',
    posterUrl: placeholderImage('neon-horizon-poster', 600, 900),
    backdropUrl: placeholderImage('neon-horizon-backdrop', 1920, 1080),
    trailerUrl: 'https://www.youtube.com/results?search_query=neon+horizon+trailer',
    releaseYear: 2025,
    runtimeMinutes: 137,
    rating: 8.7,
    genres: genre('sci-fi', 'thriller', 'action'),
    cast: cast([
      ['Mara Vance', 'Kai Sorensen'],
      ['Desmond Cole', 'Inspector Reyes'],
      ['Yuki Tanabe', 'The Archivist'],
      ['Elena Marsh', 'Nova'],
      ['Idris Bello', 'Cipher'],
    ]),
    downloadLinks: links('neon-horizon'),
    status: 'published',
    featured: true,
    createdAt: '2025-02-14T09:24:00.000Z',
  },
  {
    id: 'm2',
    title: 'The Last Cartographer',
    slug: 'the-last-cartographer',
    description:
      'Tasked with mapping the final unmapped corner of a dying world, an aging explorer finds a coastline that should not exist — and a message addressed to him by name.',
    posterUrl: placeholderImage('last-cartographer-poster', 600, 900),
    backdropUrl: placeholderImage('last-cartographer-backdrop', 1920, 1080),
    releaseYear: 2024,
    runtimeMinutes: 124,
    rating: 8.9,
    genres: genre('adventure', 'drama', 'mystery'),
    cast: cast([
      ['Arthur Pendleton', 'Silas Vance'],
      ['Nadia Rahman', 'Commander Halle'],
      ['Tomas Vega', 'The Signalman'],
      ['Ingrid Soll', 'Mira'],
    ]),
    downloadLinks: links('the-last-cartographer'),
    status: 'published',
    featured: true,
    createdAt: '2024-11-02T14:10:00.000Z',
  },
  {
    id: 'm3',
    title: 'Midnight Static',
    slug: 'midnight-static',
    description:
      'A late-night radio host starts receiving calls from listeners describing tomorrow\'s headlines. Each answer she gives changes the world — and something is listening back.',
    posterUrl: placeholderImage('midnight-static-poster', 600, 900),
    backdropUrl: placeholderImage('midnight-static-backdrop', 1920, 1080),
    releaseYear: 2025,
    runtimeMinutes: 108,
    rating: 7.8,
    genres: genre('horror', 'mystery', 'thriller'),
    cast: cast([
      ['Ruth Kelso', 'June Halloway'],
      ['Peter Adeyemi', 'Detective Marsh'],
      ['Clara Nunes', 'The Voice'],
    ]),
    downloadLinks: links('midnight-static'),
    status: 'published',
    featured: true,
    createdAt: '2025-06-21T18:45:00.000Z',
  },
  {
    id: 'm4',
    title: 'Paper Tigers',
    slug: 'paper-tigers',
    description:
      'Four estranged siblings inherit a failing paper mill and a debt they cannot pay. Rebuilding it means rebuilding each other — one disastrous family dinner at a time.',
    posterUrl: placeholderImage('paper-tigers-poster', 600, 900),
    backdropUrl: placeholderImage('paper-tigers-backdrop', 1920, 1080),
    releaseYear: 2024,
    runtimeMinutes: 116,
    rating: 7.4,
    genres: genre('comedy', 'drama'),
    cast: cast([
      ['Sofia Guerrero', 'Camila'],
      ['Owen Brandt', 'Dex'],
      ['Hana Kim', 'Yuri'],
      ['Marcus Webb', 'Uncle Lou'],
    ]),
    downloadLinks: links('paper-tigers'),
    status: 'published',
    featured: false,
    createdAt: '2024-08-09T11:00:00.000Z',
  },
  {
    id: 'm5',
    title: 'Iron Monsoon',
    slug: 'iron-monsoon',
    description:
      'When a weapons satellite falls out of orbit into the Bay of Bengal, a disgraced salvage diver and a by-the-book naval officer have fourteen hours to keep the world from burning.',
    posterUrl: placeholderImage('iron-monsoon-poster', 600, 900),
    backdropUrl: placeholderImage('iron-monsoon-backdrop', 1920, 1080),
    releaseYear: 2025,
    runtimeMinutes: 141,
    rating: 8.2,
    genres: genre('action', 'thriller'),
    cast: cast([
      ['Jonas Brand', 'Cole Rainer'],
      ['Priya Anand', 'Lt. Devika Rao'],
      ['Samir Haddad', 'Admiral Fayed'],
      ['Lena Ortiz', 'Pilot'],
    ]),
    downloadLinks: links('iron-monsoon'),
    status: 'published',
    featured: false,
    createdAt: '2025-04-30T07:35:00.000Z',
  },
  {
    id: 'm6',
    title: 'Glass Garden',
    slug: 'glass-garden',
    description:
      'A botanist who can hear plants think is hired to revive a billionaire\'s sealed terrarium — and uncovers what the glass has been keeping out for thirty years.',
    posterUrl: placeholderImage('glass-garden-poster', 600, 900),
    backdropUrl: placeholderImage('glass-garden-backdrop', 1920, 1080),
    releaseYear: 2023,
    runtimeMinutes: 99,
    rating: 7.1,
    genres: genre('fantasy', 'mystery', 'drama'),
    cast: cast([
      ['Emilie Fontaine', 'Dr. Wren Alby'],
      ['Kofi Mensah', 'Julian Voss'],
      ['Astrid Nyland', 'The Gardener'],
    ]),
    downloadLinks: links('glass-garden'),
    status: 'published',
    featured: false,
    createdAt: '2023-12-01T16:20:00.000Z',
  },
  {
    id: 'm7',
    title: 'Sixteen Bridges',
    slug: 'sixteen-bridges',
    description:
      'A heist crew plans one last job across the sixteen bridges of a city that never sleeps. The plan is perfect. The crew is not.',
    posterUrl: placeholderImage('sixteen-bridges-poster', 600, 900),
    backdropUrl: placeholderImage('sixteen-bridges-backdrop', 1920, 1080),
    releaseYear: 2024,
    runtimeMinutes: 128,
    rating: 8.0,
    genres: genre('crime', 'action', 'thriller'),
    cast: cast([
      ['Vincent Ruiz', 'Marcus Slade'],
      ['Talia Berger', 'Nadia'],
      ['Roy Nakamura', 'The Fence'],
      ['Delphine Roy', 'Inspector Claire'],
    ]),
    downloadLinks: links('sixteen-bridges'),
    status: 'published',
    featured: true,
    createdAt: '2024-05-17T21:05:00.000Z',
  },
  {
    id: 'm8',
    title: 'Aurora Protocol',
    slug: 'aurora-protocol',
    description:
      'On a research station above the Arctic circle, the crew watches the sky turn a colour no one has a name for. Then the transmissions start — from Earth, dated forty years from now.',
    posterUrl: placeholderImage('aurora-protocol-poster', 600, 900),
    backdropUrl: placeholderImage('aurora-protocol-backdrop', 1920, 1080),
    releaseYear: 2025,
    runtimeMinutes: 132,
    rating: 8.5,
    genres: genre('sci-fi', 'mystery', 'drama'),
    cast: cast([
      ['Ingrid Halvorsen', 'Dr. Sena Frost'],
      ['Mateo Rivas', 'Engineer Ordoñez'],
      ['Yusuf Demir', 'Commander Sarkis'],
      ['Bea Lindqvist', 'Aurora'],
    ]),
    downloadLinks: links('aurora-protocol'),
    status: 'published',
    featured: false,
    createdAt: '2025-01-08T05:50:00.000Z',
  },
  {
    id: 'm9',
    title: 'Dust & Echoes',
    slug: 'dust-and-echoes',
    description:
      'Two rival bounty hunters are stranded in a canyon where sound never dies. Every word they have ever said is waiting for them at the bottom.',
    posterUrl: placeholderImage('dust-echoes-poster', 600, 900),
    backdropUrl: placeholderImage('dust-echoes-backdrop', 1920, 1080),
    releaseYear: 2023,
    runtimeMinutes: 113,
    rating: 7.6,
    genres: genre('adventure', 'fantasy', 'action'),
    cast: cast([
      ['Wyatt Kane', 'Silas Dune'],
      ['Rosa Delgado', 'Marta Vela'],
      ['Chen Wei', 'The Echo'],
    ]),
    downloadLinks: links('dust-and-echoes'),
    status: 'published',
    featured: false,
    createdAt: '2023-09-22T13:15:00.000Z',
  },
  {
    id: 'm10',
    title: 'The Quiet Part',
    slug: 'the-quiet-part',
    description:
      'A sign-language interpreter at a trial realizes the defendant is confessing to a second crime — one she may have helped cover up.',
    posterUrl: placeholderImage('quiet-part-poster', 600, 900),
    backdropUrl: placeholderImage('quiet-part-backdrop', 1920, 1080),
    releaseYear: 2024,
    runtimeMinutes: 121,
    rating: 8.3,
    genres: genre('thriller', 'crime', 'drama'),
    cast: cast([
      ['Amara Osei', 'Nadia Fray'],
      ['Julian Voss', 'Defendant Brooks'],
      ['Greta Lind', 'Judge Halden'],
      ['Noor Haddad', 'Prosecutor Sana'],
    ]),
    downloadLinks: links('the-quiet-part'),
    status: 'published',
    featured: false,
    createdAt: '2024-02-27T19:30:00.000Z',
  },
  {
    id: 'm11',
    title: 'Supernova Sweethearts',
    slug: 'supernova-sweethearts',
    description:
      'Two teen astronomers have exactly one summer before one of them moves across the galaxy. A comet, a mixtape, and the worst-timed confession in the solar system.',
    posterUrl: placeholderImage('supernova-sweethearts-poster', 600, 900),
    backdropUrl: placeholderImage('supernova-sweethearts-backdrop', 1920, 1080),
    releaseYear: 2025,
    runtimeMinutes: 104,
    rating: 6.9,
    genres: genre('romance', 'comedy'),
    cast: cast([
      ['Piper Lark', 'June'],
      ['Theo Nakamura', 'Milo'],
      ['Camille Boucher', 'Astrid'],
    ]),
    downloadLinks: links('supernova-sweethearts'),
    status: 'published',
    featured: false,
    createdAt: '2025-07-04T10:00:00.000Z',
  },
  {
    id: 'm12',
    title: 'Kite & Iron',
    slug: 'kite-and-iron',
    description:
      'In a windswept city of kites and factories, a young inventor builds a machine that can fly — and a warlord who will do anything to own the sky.',
    posterUrl: placeholderImage('kite-iron-poster', 600, 900),
    backdropUrl: placeholderImage('kite-iron-backdrop', 1920, 1080),
    releaseYear: 2022,
    runtimeMinutes: 118,
    rating: 7.9,
    genres: genre('animation', 'adventure', 'fantasy'),
    cast: cast([
      ['Mira Solvang', 'Kite (voice)'],
      ['Ravi Chandra', 'Iron (voice)'],
      ['Anneke Vos', 'The Windkeeper'],
    ]),
    downloadLinks: links('kite-and-iron'),
    status: 'published',
    featured: true,
    createdAt: '2022-10-14T08:00:00.000Z',
  },
]

/* ─────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────── */

export const getFeaturedMovies = (): Movie[] => movies.filter((movie) => movie.featured)

export const getTrendingMovies = (limit = 6): Movie[] =>
  [...movies]
    .sort((a, b) => b.rating * 10 + b.releaseYear - (a.rating * 10 + a.releaseYear))
    .slice(0, limit)

export const getLatestMovies = (limit = 6): Movie[] =>
  [...movies]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)

export const getTopRatedMovies = (limit = 10): Movie[] =>
  [...movies].sort((a, b) => b.rating - a.rating).slice(0, limit)

export const getMovieBySlug = (slug: string): Movie | undefined =>
  movies.find((movie) => movie.slug === slug)

export const getMovieById = (id: string): Movie | undefined => movies.find((movie) => movie.id === id)

export const getAllGenres = (): Genre[] => genres

export const getGenreBySlug = (slug: string): Genre | undefined =>
  genres.find((genreItem) => genreItem.slug === slug)

export const getMoviesByGenre = (slug: string): Movie[] =>
  movies.filter((movie) => movie.genres.some((g) => g.slug === slug))

export const getGenreCount = (slug: string): number => getMoviesByGenre(slug).length

export const searchMovies = (query: string): Movie[] => {
  const term = query.trim().toLowerCase()
  if (!term) return []
  return movies.filter((movie) => {
    const haystack = [
      movie.title,
      movie.description,
      movie.releaseYear.toString(),
      ...movie.genres.map((g) => g.name),
      ...movie.cast.map((c) => `${c.name} ${c.characterName ?? ''}`),
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(term)
  })
}

export const getRelatedMovies = (movie: Movie, limit = 4): Movie[] => {
  const slugs = new Set(movie.genres.map((g) => g.slug))
  return movies
    .filter((candidate) => candidate.id !== movie.id)
    .map((candidate) => ({
      movie: candidate,
      score:
        candidate.genres.filter((g) => slugs.has(g.slug)).length * 2 +
        (Math.abs(candidate.rating - movie.rating) < 0.8 ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || b.movie.rating - a.movie.rating)
    .slice(0, limit)
    .map((entry) => entry.movie)
}

export const POPULAR_SEARCHES = [
  'Neon',
  'Sci-Fi',
  'Thriller',
  'Aurora',
  'Heist',
  'Animation',
  '2025',
]
