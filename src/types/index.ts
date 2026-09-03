/**
 * Streamly — shared domain types.
 * These mirror the Supabase schema in `supabase/migrations/001_initial_schema.sql`.
 */

export interface Movie {
  id: string
  title: string
  slug: string
  description: string
  posterUrl: string
  backdropUrl: string
  trailerUrl?: string
  releaseYear: number
  runtimeMinutes?: number
  rating: number
  genres: Genre[]
  cast: CastMember[]
  downloadLinks: DownloadLink[]
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  createdAt: string
}

export interface Genre {
  id: string
  name: string
  slug: string
  icon?: string
  color?: string
}

export interface CastMember {
  id: string
  name: string
  photoUrl?: string
  characterName?: string
}

export interface DownloadLink {
  id: string
  quality: '1080p' | '720p' | '480p'
  url: string
  fileSizeBytes?: number
  destinationLabel: string
}

export interface Profile {
  id: string
  username: string
  displayName?: string
  avatarUrl?: string
  bio?: string
  role: 'user' | 'admin'
  createdAt: string
}

export interface Comment {
  id: string
  userId: string
  movieId: string
  parentId?: string
  content: string
  isSpoiler: boolean
  status: 'active' | 'hidden' | 'deleted'
  createdAt: string
  user?: Profile
  replies?: Comment[]
  reactions?: Reaction[]
}

export type ReactionType = 'love' | 'funny' | 'fire' | 'wow' | 'sad' | 'mindblown'

export interface Reaction {
  id: string
  userId: string
  commentId?: string
  movieId?: string
  reactionType: ReactionType
  createdAt: string
}

export type ReportReason = 'spam' | 'harassment' | 'abuse' | 'spoiler' | 'other'

export interface Report {
  id: string
  reporterId: string
  targetType: 'comment' | 'user'
  targetId: string
  reason: ReportReason
  details?: string
  status: 'pending' | 'reviewed' | 'resolved'
  createdAt: string
  reporter?: Profile
}

export interface Notification {
  id: string
  userId: string
  type: 'reaction' | 'reply' | 'mention'
  title: string
  message: string
  read: boolean
  referenceType?: string
  referenceId?: string
  createdAt: string
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
