import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EyeOff, Eye, Flag, Loader2, Search, ShieldCheck, Trash2, Undo2 } from 'lucide-react'
import { fetchAllComments, updateCommentStatus, deleteComment as apiDeleteComment } from '@/lib/api'
import { cn, timeAgo } from '@/utils/helpers'
import type { Comment } from '@/types'

const filters = ['all', 'spoiler', 'reported', 'hidden'] as const
type Filter = (typeof filters)[number]

export function AdminComments() {
  const [allComments, setAllComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [removed, setRemoved] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      const data = await fetchAllComments()
      setAllComments(data)
      setLoading(false)
    }
    void load()
  }, [])

  const flat = useMemo(() => {
    const list: Comment[] = []
    for (const comment of allComments) {
      list.push(comment)
      for (const reply of comment.replies ?? []) list.push(reply)
    }
    return list
  }, [allComments])

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase()
    return flat.filter((comment) => {
      const matchesQuery =
        !term ||
        comment.content.toLowerCase().includes(term) ||
        (comment.user?.username ?? '').toLowerCase().includes(term)
      if (!matchesQuery) return false
      if (filter === 'spoiler') return comment.isSpoiler
      if (filter === 'hidden') return hidden.has(comment.id) || comment.status === 'hidden'
      if (filter === 'reported') return comment.reactions?.length ? true : true
      return true
    })
  }, [flat, query, filter, hidden])

  const toggleHidden = async (id: string) => {
    const isCurrentlyHidden = hidden.has(id)
    await updateCommentStatus(id, isCurrentlyHidden ? 'active' : 'hidden')
    setHidden((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const remove = async (id: string) => {
    await apiDeleteComment(id)
    setRemoved((previous) => new Set(previous).add(id))
  }

  const active = rows.filter((comment) => !removed.has(comment.id))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-streamly-purple" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-streamly-text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            placeholder="Search comments or members…"
            aria-label="Search comments"
            className="h-11 w-full rounded-button border border-streamly-border bg-white/3 pl-10 pr-4 text-sm text-streamly-text placeholder:text-streamly-text-muted transition-colors focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
          />
        </div>

        <div className="flex items-center gap-1 rounded-full border border-streamly-border bg-white/3 p-1">
          {filters.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-all duration-300',
                filter === option
                  ? 'bg-gradient-to-r from-streamly-purple to-streamly-indigo text-white'
                  : 'text-streamly-text-muted hover:text-streamly-text',
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {active.map((comment) => {
          const isHidden = hidden.has(comment.id) || comment.status === 'hidden'
          return (
            <article
              key={comment.id}
              className={cn(
                'premium-card flex flex-col gap-4 p-4 transition-all duration-300 sm:flex-row sm:items-start',
                isHidden && 'opacity-55',
              )}
            >
              {comment.user?.avatarUrl ? (
                <img
                  src={comment.user.avatarUrl}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-white/12"
                />
              ) : null}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-streamly-text">
                    {comment.user?.displayName ?? comment.user?.username}
                  </span>
                  <span className="text-xs text-streamly-text-muted">
                    @{comment.user?.username}
                  </span>
                  <span className="text-xs text-streamly-text-muted">· {timeAgo(comment.createdAt)}</span>
                  {comment.isSpoiler ? (
                    <span className="rounded-full border border-streamly-warning/30 bg-streamly-warning/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-streamly-warning">
                      Spoiler
                    </span>
                  ) : null}
                  {isHidden ? (
                    <span className="rounded-full border border-streamly-border-light bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-streamly-text-muted">
                      Hidden
                    </span>
                  ) : null}
                </div>

                <p className="mt-2 text-[13px] leading-relaxed text-streamly-text-secondary">
                  {comment.content}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-streamly-text-muted">
                  <span className="inline-flex items-center gap-1">
                    {comment.reactions?.length ?? 0} reactions
                  </span>
                  <span className="inline-flex items-center gap-1">
                    {comment.replies?.length ?? 0} replies
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => void toggleHidden(comment.id)}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-streamly-border bg-white/3 text-streamly-text-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-streamly-warning/40 hover:bg-streamly-warning/10 hover:text-streamly-warning"
                  aria-label={isHidden ? 'Unhide comment' : 'Hide comment'}
                  title={isHidden ? 'Unhide' : 'Hide'}
                >
                  {isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => void remove(comment.id)}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-streamly-border bg-white/3 text-streamly-text-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-streamly-error/40 hover:bg-streamly-error/10 hover:text-streamly-error"
                  aria-label="Delete comment"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {removed.size > 0 ? (
        <button
          type="button"
          onClick={() => setRemoved(new Set())}
          className="inline-flex items-center gap-2 rounded-full border border-streamly-border bg-white/3 px-4 py-2 text-xs font-semibold text-streamly-text-secondary transition-colors hover:border-streamly-purple/50 hover:text-streamly-text"
        >
          <Undo2 className="h-3.5 w-3.5" />
          Restore {removed.size} deleted comment{removed.size === 1 ? '' : 's'}
        </button>
      ) : null}

      {active.length === 0 ? (
        <div className="premium-card px-5 py-14 text-center">
          <p className="text-sm font-semibold text-streamly-text">Nothing to moderate</p>
          <p className="mt-1 text-[13px] text-streamly-text-muted">
            Clear the filters to see the full moderation queue.
          </p>
        </div>
      ) : null}
    </div>
  )
}

export default AdminComments
