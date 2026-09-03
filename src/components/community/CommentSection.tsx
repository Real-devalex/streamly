import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CornerDownRight,
  EyeOff,
  Flag,
  Loader2,
  MessageSquare,
  Send,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import type { Comment, ReactionType } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { fetchCommentsForMovie, insertComment } from '@/lib/api'
import { cn, getInitials, REACTION_EMOJI, REACTION_LABEL, timeAgo } from '@/utils/helpers'

const REACTIONS: ReactionType[] = ['love', 'funny', 'fire', 'wow', 'sad', 'mindblown']
const MAX_LENGTH = 1000

export interface CommentSectionProps {
  movieId: string
  movieTitle?: string
  className?: string
}

type SortKey = 'top' | 'new' | 'old'

export function CommentSection({ movieId, movieTitle, className }: CommentSectionProps) {
  const { isAuthenticated, profile } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [isSpoiler, setIsSpoiler] = useState(false)
  const [sort, setSort] = useState<SortKey>('top')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyDraft, setReplyDraft] = useState('')
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [myReactions, setMyReactions] = useState<Set<string>>(new Set())
  const [reported, setReported] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)

  const currentUser = profile

  useEffect(() => {
    let cancelled = false
    async function load() {
      const data = await fetchCommentsForMovie(movieId)
      if (!cancelled) { setComments(data); setLoading(false) }
    }
    void load()
    return () => { cancelled = true }
  }, [movieId])

  const totalCount = useMemo(
    () => comments.reduce((sum, comment) => sum + 1 + (comment.replies?.length ?? 0), 0),
    [comments],
  )

  const sorted = useMemo(() => {
    const score = (comment: Comment) =>
      (comment.reactions?.length ?? 0) + (comment.replies?.length ?? 0) * 2
    const list = [...comments]
    if (sort === 'new') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sort === 'old') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    } else {
      list.sort((a, b) => score(b) - score(a))
    }
    return list
  }, [comments, sort])

  const toggleReaction = (commentId: string, type: ReactionType) => {
    const key = `${commentId}:${type}`
    setMyReactions((previous) => {
      const next = new Set(previous)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const reveal = (commentId: string) =>
    setRevealed((previous) => new Set(previous).add(commentId))

  const report = (commentId: string) => {
    setReported((previous) => new Set(previous).add(commentId))
  }

  const submitComment = async () => {
    const content = draft.trim()
    if (!content || !currentUser) return
    setSubmitting(true)

    const newComment = await insertComment(movieId, currentUser.id, content, isSpoiler)
    if (newComment) {
      newComment.user = currentUser
      newComment.reactions = []
      newComment.replies = []
      setComments((previous) => [newComment, ...previous])
    } else {
      // Fallback: local insert for demo mode
      const comment: Comment = {
        id: `local-${Date.now()}`,
        userId: currentUser.id,
        movieId,
        content,
        isSpoiler,
        status: 'active',
        createdAt: new Date().toISOString(),
        user: currentUser,
        reactions: [],
        replies: [],
      }
      setComments((previous) => [comment, ...previous])
    }

    setDraft('')
    setIsSpoiler(false)
    setSort('new')
    setSubmitting(false)
  }

  const submitReply = async (parentId: string) => {
    const content = replyDraft.trim()
    if (!content || !currentUser) return
    setSubmitting(true)

    const newReply = await insertComment(movieId, currentUser.id, content, false, parentId)
    if (newReply) {
      newReply.user = currentUser
      newReply.reactions = []
      setComments((previous) =>
        previous.map((comment) =>
          comment.id === parentId
            ? { ...comment, replies: [...(comment.replies ?? []), newReply] }
            : comment,
        ),
      )
    } else {
      const reply: Comment = {
        id: `local-reply-${Date.now()}`,
        userId: currentUser.id,
        movieId,
        parentId,
        content,
        isSpoiler: false,
        status: 'active',
        createdAt: new Date().toISOString(),
        user: currentUser,
        reactions: [],
      }
      setComments((previous) =>
        previous.map((comment) =>
          comment.id === parentId
            ? { ...comment, replies: [...(comment.replies ?? []), reply] }
            : comment,
        ),
      )
    }

    setReplyDraft('')
    setReplyTo(null)
    setSubmitting(false)
  }

  const renderReactions = (comment: Comment) => {
    const counts = new Map<ReactionType, number>()
    for (const reaction of comment.reactions ?? []) {
      counts.set(reaction.reactionType, (counts.get(reaction.reactionType) ?? 0) + 1)
    }
    for (const type of REACTIONS) {
      if (myReactions.has(`${comment.id}:${type}`)) {
        counts.set(type, (counts.get(type) ?? 0) + 1)
      }
    }

    return (
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {REACTIONS.map((type) => {
          const count = counts.get(type) ?? 0
          const active = myReactions.has(`${comment.id}:${type}`)
          return (
            <button
              key={type}
              type="button"
              title={REACTION_LABEL[type]}
              onClick={() => toggleReaction(comment.id, type)}
              className={cn(
                'group/react inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all duration-300',
                'hover:-translate-y-0.5',
                active
                  ? 'border-streamly-purple/60 bg-streamly-purple/15 text-streamly-text'
                  : 'border-streamly-border bg-white/3 text-streamly-text-secondary hover:border-streamly-border-light hover:bg-white/6',
              )}
            >
              <span className={cn('text-[13px] transition-transform duration-300', active ? 'scale-125' : 'group-hover/react:scale-125')}>
                {REACTION_EMOJI[type]}
              </span>
              {count > 0 ? <span className="tabular-nums">{count}</span> : null}
            </button>
          )
        })}
      </div>
    )
  }

  const renderComment = (comment: Comment, isReply = false) => {
    const spoilerHidden = comment.isSpoiler && !revealed.has(comment.id)
    const isReported = reported.has(comment.id)

    return (
      <div
        key={comment.id}
        className={cn(
          'relative',
          isReply && 'ml-4 border-l border-streamly-border pl-4 sm:ml-6 sm:pl-5',
        )}
      >
        <div className="group/comment flex gap-3.5">
          {/* Avatar */}
          <div className="relative shrink-0">
            {comment.user?.avatarUrl ? (
              <img
                src={comment.user.avatarUrl}
                alt=""
                className="h-10 w-10 rounded-full object-cover ring-1 ring-white/12"
                loading="lazy"
              />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-streamly-purple to-streamly-blue text-xs font-bold text-white">
                {getInitials(comment.user?.displayName ?? comment.user?.username)}
              </div>
            )}
            {comment.user?.role === 'admin' ? (
              <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-streamly-card bg-streamly-cyan/20 text-streamly-cyan">
                <ShieldAlert className="h-2.5 w-2.5" />
              </span>
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            {/* Head */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm font-semibold text-streamly-text">
                {comment.user?.displayName ?? comment.user?.username ?? 'Member'}
              </span>
              {comment.user?.role === 'admin' ? (
                <span className="rounded-full border border-streamly-cyan/40 bg-streamly-cyan/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-streamly-cyan">
                  Moderator
                </span>
              ) : null}
              <span className="text-xs text-streamly-text-muted">
                {timeAgo(comment.createdAt)}
              </span>
            </div>

            {/* Body */}
            <div className="relative mt-2">
              {spoilerHidden ? (
                <button
                  type="button"
                  onClick={() => reveal(comment.id)}
                  className="group/spoiler flex w-full items-center gap-3 rounded-button border border-streamly-warning/30 bg-streamly-warning/8 px-4 py-3 text-left transition-all duration-300 hover:border-streamly-warning/60 hover:bg-streamly-warning/12"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-streamly-warning/15 text-streamly-warning">
                    <EyeOff className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-streamly-warning">
                      Spoiler — tap to reveal
                    </span>
                    <span className="block truncate text-xs text-streamly-text-muted">
                      {comment.content.slice(0, 60)}…
                    </span>
                  </span>
                </button>
              ) : (
                <p
                  className={cn(
                    'whitespace-pre-wrap text-[14px] leading-relaxed text-streamly-text-secondary',
                    comment.isSpoiler && 'rounded-lg border-l-2 border-streamly-warning/50 bg-streamly-warning/5 py-2 pl-3',
                  )}
                >
                  {comment.content}
                </p>
              )}
            </div>

            {renderReactions(comment)}

            {/* Actions */}
            <div className="mt-3 flex items-center gap-4 text-xs">
              {!isReply && isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  className="inline-flex items-center gap-1.5 font-medium text-streamly-text-muted transition-colors hover:text-streamly-purple"
                >
                  <CornerDownRight className="h-3.5 w-3.5" />
                  Reply
                </button>
              ) : null}
              {!isReported ? (
                <button
                  type="button"
                  onClick={() => report(comment.id)}
                  className="inline-flex items-center gap-1.5 font-medium text-streamly-text-muted transition-colors hover:text-streamly-error"
                >
                  <Flag className="h-3.5 w-3.5" />
                  Report
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-medium text-streamly-success">
                  <Flag className="h-3.5 w-3.5" />
                  Reported
                </span>
              )}
            </div>

            {/* Reply input */}
            {replyTo === comment.id ? (
              <div className="mt-3 flex items-center gap-2">
                <input
                  value={replyDraft}
                  onChange={(event) => setReplyDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      void submitReply(comment.id)
                    }
                  }}
                  type="text"
                  placeholder="Write a reply..."
                  autoFocus
                  className="flex-1 rounded-button border border-streamly-border bg-white/3 px-4 py-2.5 text-sm text-streamly-text placeholder:text-streamly-text-muted focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20"
                />
                <button
                  type="button"
                  onClick={() => void submitReply(comment.id)}
                  disabled={!replyDraft.trim() || submitting}
                  className="grid h-10 w-10 place-items-center rounded-button bg-gradient-to-r from-streamly-purple to-streamly-indigo text-white transition-all hover:shadow-[0_10px_30px_-10px_rgba(139,92,246,0.9)] disabled:opacity-40"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            ) : null}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 ? (
              <div className="mt-4 space-y-4">
                {comment.replies.map((reply) => renderComment(reply, true))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-streamly-purple" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-streamly-purple/25 to-streamly-blue/15 text-streamly-purple ring-1 ring-white/10">
            <MessageSquare className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-streamly-text">
              Discussion
              {movieTitle ? (
                <span className="ml-2 text-sm font-medium text-streamly-text-muted">
                  on {movieTitle}
                </span>
              ) : null}
            </h2>
            <p className="text-xs text-streamly-text-muted">{totalCount} comments</p>
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1 rounded-full border border-streamly-border bg-white/3 p-1">
          {(['top', 'new', 'old'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSort(key)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-all duration-300',
                sort === key
                  ? 'bg-white/10 text-streamly-text'
                  : 'text-streamly-text-muted hover:text-streamly-text',
              )}
            >
              {key === 'top' ? '🔥 Top' : key === 'new' ? '🕐 New' : '📜 Old'}
            </button>
          ))}
        </div>
      </div>

      {/* Compose */}
      {isAuthenticated ? (
        <div className="rounded-modal border border-streamly-border bg-streamly-card p-4">
          <div className="flex gap-3">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-white/12" />
            ) : (
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-streamly-purple to-streamly-blue text-xs font-bold text-white">
                {getInitials(currentUser?.displayName ?? currentUser?.username)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                maxLength={MAX_LENGTH}
                className="w-full rounded-button border border-streamly-border bg-white/3 px-4 py-3 text-sm text-streamly-text placeholder:text-streamly-text-muted focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/20 resize-none"
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-streamly-text-muted transition-colors hover:text-streamly-text">
                    <input
                      type="checkbox"
                      checked={isSpoiler}
                      onChange={(event) => setIsSpoiler(event.target.checked)}
                      className="h-3.5 w-3.5 rounded border-streamly-border bg-streamly-surface text-streamly-purple focus:ring-streamly-purple/40"
                    />
                    <EyeOff className="h-3.5 w-3.5" />
                    Spoiler
                  </label>
                  <span className="text-[11px] text-streamly-text-muted">
                    {draft.length}/{MAX_LENGTH}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void submitComment()}
                  disabled={!draft.trim() || submitting}
                  className="inline-flex h-9 items-center gap-2 rounded-button bg-gradient-to-r from-streamly-purple to-streamly-indigo px-4 text-sm font-semibold text-white transition-all hover:shadow-[0_10px_30px_-10px_rgba(139,92,246,0.9)] disabled:opacity-40"
                >
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-modal border border-streamly-border bg-streamly-card p-6 text-center">
          <Sparkles className="mx-auto h-6 w-6 text-streamly-purple" />
          <p className="mt-3 text-sm font-semibold text-streamly-text">Join the discussion</p>
          <p className="mt-1 text-[13px] text-streamly-text-muted">
            Sign in to leave a comment, react, and reply.
          </p>
          <Link to="/auth/signin" className="btn-primary mt-4 inline-flex h-10 px-5 text-[13px]">
            Sign in
          </Link>
        </div>
      )}

      {/* Comments */}
      <div className="space-y-6">
        {sorted.map((comment) => renderComment(comment))}
      </div>

      {sorted.length === 0 ? (
        <div className="py-12 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-streamly-text-muted" />
          <p className="mt-4 text-sm font-semibold text-streamly-text">No comments yet</p>
          <p className="mt-1 text-[13px] text-streamly-text-muted">Be the first to share your thoughts.</p>
        </div>
      ) : null}
    </div>
  )
}

export default CommentSection
