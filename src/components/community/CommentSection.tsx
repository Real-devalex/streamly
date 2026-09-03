import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CornerDownRight,
  EyeOff,
  Eye,
  Flag,
  MessageSquare,
  Send,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import type { Comment, ReactionType } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { getCommentsForMovie } from '@/data/mock-community'
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
  const [comments, setComments] = useState<Comment[]>(() => getCommentsForMovie(movieId))
  const [draft, setDraft] = useState('')
  const [isSpoiler, setIsSpoiler] = useState(false)
  const [sort, setSort] = useState<SortKey>('top')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyDraft, setReplyDraft] = useState('')
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [myReactions, setMyReactions] = useState<Set<string>>(new Set())
  const [reported, setReported] = useState<Set<string>>(new Set())

  const currentUser = profile

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

  const submitComment = () => {
    const content = draft.trim()
    if (!content || !currentUser) return
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
    setDraft('')
    setIsSpoiler(false)
    setSort('new')
  }

  const submitReply = (parentId: string) => {
    const content = replyDraft.trim()
    if (!content || !currentUser) return
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
    setReplyDraft('')
    setReplyTo(null)
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
              <button
                type="button"
                onClick={() => report(comment.id)}
                disabled={isReported}
                className={cn(
                  'inline-flex items-center gap-1.5 font-medium transition-colors',
                  isReported
                    ? 'text-streamly-warning'
                    : 'text-streamly-text-muted hover:text-streamly-error',
                )}
              >
                <Flag className="h-3.5 w-3.5" />
                {isReported ? 'Reported' : 'Report'}
              </button>
              {comment.isSpoiler && !spoilerHidden ? (
                <button
                  type="button"
                  onClick={() =>
                    setRevealed((previous) => {
                      const next = new Set(previous)
                      next.delete(comment.id)
                      return next
                    })
                  }
                  className="inline-flex items-center gap-1.5 font-medium text-streamly-text-muted transition-colors hover:text-streamly-text"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Hide spoiler
                </button>
              ) : null}
            </div>

            {isReported ? (
              <p className="mt-2 animate-fade-in rounded-lg border border-streamly-warning/25 bg-streamly-warning/8 px-3 py-2 text-[11px] text-streamly-warning">
                Thanks — a moderator will review this within 24 hours.
              </p>
            ) : null}

            {/* Reply composer */}
            {replyTo === comment.id ? (
              <div className="mt-4 animate-scale-in">
                <div className="flex items-start gap-3">
                  {currentUser?.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
                    />
                  ) : null}
                  <div className="flex-1">
                    <textarea
                      value={replyDraft}
                      onChange={(event) => setReplyDraft(event.target.value)}
                      rows={2}
                      placeholder={`Reply to ${comment.user?.displayName ?? comment.user?.username}…`}
                      className="w-full resize-none rounded-button border border-streamly-border bg-black/30 px-3.5 py-2.5 text-sm text-streamly-text placeholder:text-streamly-text-muted focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/25"
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => submitReply(comment.id)}
                        disabled={!replyDraft.trim()}
                        className="btn-primary h-8 px-4 text-xs"
                      >
                        Post reply
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyTo(null)
                          setReplyDraft('')
                        }}
                        className="h-8 px-3 text-xs font-medium text-streamly-text-muted transition-colors hover:text-streamly-text"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 ? (
              <div className="mt-5 space-y-5">
                {comment.replies.map((reply) => renderComment(reply, true))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className={cn('scroll-mt-28', className)} id="comments">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-streamly-purple">
            <MessageSquare className="h-3.5 w-3.5 text-streamly-cyan" />
            Community
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-streamly-text sm:text-3xl">
            Discussions
            <span className="ml-2 text-base font-medium text-streamly-text-muted">
              ({totalCount})
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-streamly-border bg-white/3 p-1">
          {(
            [
              ['top', 'Top'],
              ['new', 'Newest'],
              ['old', 'Oldest'],
            ] as Array<[SortKey, string]>
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSort(key)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300',
                sort === key
                  ? 'bg-gradient-to-r from-streamly-purple to-streamly-indigo text-white shadow-[0_8px_20px_-10px_rgba(139,92,246,0.9)]'
                  : 'text-streamly-text-muted hover:text-streamly-text',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Composer */}
      {isAuthenticated ? (
        <div className="premium-card mb-9 p-4 sm:p-5">
          <div className="flex gap-3.5">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-white/12"
              />
            ) : (
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-streamly-purple to-streamly-blue text-xs font-bold text-white">
                {getInitials(currentUser?.displayName ?? currentUser?.username)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value.slice(0, MAX_LENGTH))}
                rows={3}
                placeholder={
                  movieTitle
                    ? `Share your thoughts on ${movieTitle}…`
                    : 'Share your thoughts…'
                }
                className="w-full resize-none rounded-button border border-streamly-border bg-black/30 px-4 py-3 text-sm leading-relaxed text-streamly-text placeholder:text-streamly-text-muted transition-colors focus:border-streamly-purple/60 focus:outline-none focus:ring-2 focus:ring-streamly-purple/25"
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsSpoiler((previous) => !previous)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-300',
                    isSpoiler
                      ? 'border-streamly-warning/60 bg-streamly-warning/12 text-streamly-warning'
                      : 'border-streamly-border bg-white/3 text-streamly-text-muted hover:border-streamly-border-light hover:text-streamly-text',
                  )}
                >
                  <EyeOff className="h-3.5 w-3.5" />
                  {isSpoiler ? 'Marked as spoiler' : 'Mark as spoiler'}
                </button>

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'text-[11px] tabular-nums',
                      draft.length > MAX_LENGTH - 100
                        ? 'text-streamly-warning'
                        : 'text-streamly-text-muted',
                    )}
                  >
                    {draft.length}/{MAX_LENGTH}
                  </span>
                  <button
                    type="button"
                    onClick={submitComment}
                    disabled={!draft.trim()}
                    className="btn-primary h-9 px-5 text-[13px]"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Post comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-9 flex flex-col items-start gap-4 rounded-card border border-streamly-border bg-gradient-to-br from-streamly-purple/12 via-white/3 to-transparent p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-streamly-purple/20 text-streamly-purple ring-1 ring-streamly-purple/30">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-streamly-text">
                Join the conversation
              </p>
              <p className="mt-0.5 text-[13px] text-streamly-text-secondary">
                Sign in to react, reply and post your own take.
              </p>
            </div>
          </div>
          <div className="flex w-full gap-2.5 sm:w-auto">
            <Link to="/auth/signin" className="btn-secondary h-10 flex-1 px-5 text-[13px] sm:flex-none">
              Sign in
            </Link>
            <Link to="/auth/signup" className="btn-primary h-10 flex-1 px-5 text-[13px] sm:flex-none">
              Join free
            </Link>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-8">
        {sorted.map((comment) => renderComment(comment))}
      </div>

      {sorted.length === 0 ? (
        <p className="py-10 text-center text-sm text-streamly-text-muted">
          No comments yet — be the first to start the conversation.
        </p>
      ) : null}
    </section>
  )
}

export default CommentSection
