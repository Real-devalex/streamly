import type { Genre, Movie, ReactionType } from '@/types'

/** Tiny className joiner (no runtime dependency). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

/** 1_048_576 → "1.0 MB" */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return 'Unknown size'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, exponent)
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`
}

/** 148 → "2h 28m" */
export function formatRuntime(minutes?: number): string {
  if (!minutes || minutes <= 0) return '—'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  return `${hours}h ${mins.toString().padStart(2, '0')}m`
}

/** "Dune: Part Two" → "dune-part-two" */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** 2024-03-01 → "Mar 1, 2024" */
export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** ISO timestamp → "3h ago" */
export function timeAgo(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 45) return 'just now'
  const intervals: Array<[number, string]> = [
    [31536000, 'y'],
    [2592000, 'mo'],
    [604800, 'w'],
    [86400, 'd'],
    [3600, 'h'],
    [60, 'm'],
  ]
  for (const [span, label] of intervals) {
    const value = Math.floor(seconds / span)
    if (value >= 1) return `${value}${label} ago`
  }
  return 'just now'
}

/** 1_240_000 → "1.2M" */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  )
}

/** "Ada Lovelace" → "AL" */
export function getInitials(name?: string): string {
  if (!name) return '?'
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/** Deterministic placeholder art (stable per seed). */
export function placeholderImage(seed: string, width: number, height: number): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`
}

/** Rating → tailwind-ish colour token for badges. */
export function ratingTone(rating: number): { text: string; ring: string; bg: string } {
  if (rating >= 8.5) return { text: 'text-streamly-success', ring: 'stroke-streamly-success', bg: 'bg-streamly-success' }
  if (rating >= 7.5) return { text: 'text-streamly-cyan', ring: 'stroke-streamly-cyan', bg: 'bg-streamly-cyan' }
  if (rating >= 6.5) return { text: 'text-streamly-gold', ring: 'stroke-streamly-gold', bg: 'bg-streamly-gold' }
  return { text: 'text-streamly-error', ring: 'stroke-streamly-error', bg: 'bg-streamly-error' }
}

export const REACTION_EMOJI: Record<ReactionType, string> = {
  love: '❤️',
  funny: '😂',
  fire: '🔥',
  wow: '😮',
  sad: '😢',
  mindblown: '🤯',
}

export const REACTION_LABEL: Record<ReactionType, string> = {
  love: 'Love',
  funny: 'Funny',
  fire: 'Fire',
  wow: 'Wow',
  sad: 'Sad',
  mindblown: 'Mind blown',
}

/** "1080p" → badge classes */
export function qualityTone(quality: string): string {
  switch (quality) {
    case '1080p':
      return 'from-streamly-purple/25 to-streamly-blue/20 text-streamly-text border-streamly-purple/40'
    case '720p':
      return 'from-streamly-cyan/20 to-streamly-blue/15 text-streamly-text-secondary border-streamly-cyan/30'
    default:
      return 'from-white/10 to-white/5 text-streamly-text-muted border-white/15'
  }
}

/** Genre chip colouring helper — falls back to the brand gradient. */
export function genreAccent(genre?: Pick<Genre, 'color'>): string {
  return genre?.color ?? '#8b5cf6'
}

/** Stable pseudo-random number from a string (used for seeded mock stats). */
export function hashSeed(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/** Total download size across every quality of a movie. */
export function totalDownloadSize(movie: Movie): number {
  return movie.downloadLinks.reduce((sum, link) => sum + (link.fileSizeBytes ?? 0), 0)
}
