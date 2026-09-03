import type { Comment, Profile, Report } from '@/types'
import { placeholderImage } from '@/utils/helpers'

/* ─────────────────────────────────────────────────────────────
   People
   ───────────────────────────────────────────────────────────── */
export const demoProfiles: Profile[] = [
  {
    id: 'u1',
    username: 'reel_talk',
    displayName: 'Maya Okonkwo',
    avatarUrl: placeholderImage('avatar-maya', 200, 200),
    bio: 'Critic. Cinematography apologist. I will watch anything with a rain-soaked street in it.',
    role: 'user',
    createdAt: '2023-04-12T10:00:00.000Z',
  },
  {
    id: 'u2',
    username: 'spoilerfreak',
    displayName: 'Devin Park',
    avatarUrl: placeholderImage('avatar-devin', 200, 200),
    bio: 'Third-row-left guy. Popcorn purist.',
    role: 'user',
    createdAt: '2023-08-02T10:00:00.000Z',
  },
  {
    id: 'u3',
    username: 'analog_ana',
    displayName: 'Ana Ruiz',
    avatarUrl: placeholderImage('avatar-ana', 200, 200),
    bio: 'Shoots on film. Hates jump scares. Loves a good needle drop.',
    role: 'user',
    createdAt: '2022-11-19T10:00:00.000Z',
  },
  {
    id: 'u4',
    username: 'framebyframe',
    displayName: 'Tobias Lange',
    avatarUrl: placeholderImage('avatar-tobias', 200, 200),
    bio: 'Editor. Obsessed with aspect ratios.',
    role: 'user',
    createdAt: '2024-01-05T10:00:00.000Z',
  },
  {
    id: 'u5',
    username: 'curator',
    displayName: 'Alex Rivera',
    avatarUrl: placeholderImage('avatar-alex', 200, 200),
    bio: 'Keeping the library tidy.',
    role: 'admin',
    createdAt: '2022-06-01T10:00:00.000Z',
  },
]

export const profileById = (id: string): Profile | undefined =>
  demoProfiles.find((profile) => profile.id === id)

/** The signed-out demo identity used when Supabase is not configured. */
export const DEMO_USER: Profile = {
  id: 'demo-user',
  username: 'you',
  displayName: 'Alex Rivera',
  avatarUrl: placeholderImage('avatar-you', 200, 200),
  bio: 'Demo account · admin access unlocked',
  role: 'admin',
  createdAt: '2025-01-01T10:00:00.000Z',
}

/* ─────────────────────────────────────────────────────────────
   Comments
   ───────────────────────────────────────────────────────────── */
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3600_000).toISOString()

export const mockComments: Comment[] = [
  {
    id: 'c1',
    userId: 'u1',
    movieId: 'm1',
    content:
      'The chase through the market is going to be studied in film schools for a decade. The way the neon reflects off the wet asphalt — chef\'s kiss. No notes.',
    isSpoiler: false,
    status: 'active',
    createdAt: hoursAgo(5),
    user: profileById('u1'),
    reactions: [
      { id: 'r1', userId: 'u2', commentId: 'c1', reactionType: 'fire', createdAt: hoursAgo(4) },
      { id: 'r2', userId: 'u3', commentId: 'c1', reactionType: 'love', createdAt: hoursAgo(4) },
      { id: 'r3', userId: 'u4', commentId: 'c1', reactionType: 'mindblown', createdAt: hoursAgo(3) },
    ],
    replies: [
      {
        id: 'c1r1',
        userId: 'u4',
        movieId: 'm1',
        parentId: 'c1',
        content:
          'Fun fact: they shot it practically with 40,000 litres of recycled water. No CG rain at all.',
        isSpoiler: false,
        status: 'active',
        createdAt: hoursAgo(4),
        user: profileById('u4'),
        reactions: [
          { id: 'r4', userId: 'u1', commentId: 'c1r1', reactionType: 'mindblown', createdAt: hoursAgo(3) },
        ],
      },
    ],
  },
  {
    id: 'c2',
    userId: 'u2',
    movieId: 'm1',
    content: 'Okay but the third act reveal completely recontextualises the opening scene. I gasped audibly.',
    isSpoiler: true,
    status: 'active',
    createdAt: hoursAgo(11),
    user: profileById('u2'),
    reactions: [
      { id: 'r5', userId: 'u3', commentId: 'c2', reactionType: 'wow', createdAt: hoursAgo(10) },
      { id: 'r6', userId: 'u1', commentId: 'c2', reactionType: 'love', createdAt: hoursAgo(9) },
    ],
  },
  {
    id: 'c3',
    userId: 'u3',
    movieId: 'm1',
    content:
      'Watched it twice in one weekend. The sound design alone deserves an award — that low hum in the archive scenes puts your teeth on edge.',
    isSpoiler: false,
    status: 'active',
    createdAt: hoursAgo(26),
    user: profileById('u3'),
    reactions: [
      { id: 'r7', userId: 'u2', commentId: 'c3', reactionType: 'fire', createdAt: hoursAgo(25) },
      { id: 'r8', userId: 'u4', commentId: 'c3', reactionType: 'fire', createdAt: hoursAgo(24) },
      { id: 'r9', userId: 'u1', commentId: 'c3', reactionType: 'love', createdAt: hoursAgo(20) },
    ],
  },
  {
    id: 'c4',
    userId: 'u4',
    movieId: 'm2',
    content:
      'A film about maps that is secretly a film about grief. I was not prepared. Bring tissues, do not bring a date who hates subtitles.',
    isSpoiler: false,
    status: 'active',
    createdAt: hoursAgo(40),
    user: profileById('u4'),
    reactions: [
      { id: 'r10', userId: 'u1', commentId: 'c4', reactionType: 'love', createdAt: hoursAgo(39) },
      { id: 'r11', userId: 'u3', commentId: 'c4', reactionType: 'sad', createdAt: hoursAgo(38) },
    ],
  },
  {
    id: 'c5',
    userId: 'u1',
    movieId: 'm7',
    content: 'The bridge sequence. That is the tweet. Perfectly paced, perfectly shot, absolutely unhinged.',
    isSpoiler: true,
    status: 'active',
    createdAt: hoursAgo(52),
    user: profileById('u1'),
    reactions: [
      { id: 'r12', userId: 'u2', commentId: 'c5', reactionType: 'fire', createdAt: hoursAgo(50) },
    ],
  },
  {
    id: 'c6',
    userId: 'u2',
    movieId: 'm8',
    content:
      'Finally a sci-fi film that trusts silence. The last twenty minutes had the whole theatre holding its breath.',
    isSpoiler: false,
    status: 'active',
    createdAt: hoursAgo(72),
    user: profileById('u2'),
    reactions: [
      { id: 'r13', userId: 'u4', commentId: 'c6', reactionType: 'mindblown', createdAt: hoursAgo(70) },
      { id: 'r14', userId: 'u3', commentId: 'c6', reactionType: 'wow', createdAt: hoursAgo(68) },
    ],
  },
  {
    id: 'c7',
    userId: 'u3',
    movieId: 'm12',
    content:
      'The hand-painted wind frames are worth the price of admission alone. My six year old cried at the ending and then asked to watch it again.',
    isSpoiler: false,
    status: 'active',
    createdAt: hoursAgo(96),
    user: profileById('u3'),
    reactions: [{ id: 'r15', userId: 'u1', commentId: 'c7', reactionType: 'love', createdAt: hoursAgo(94) }],
  },
]

export const getCommentsForMovie = (movieId: string): Comment[] =>
  mockComments.filter((comment) => comment.movieId === movieId && !comment.parentId)

export const getAllComments = (): Comment[] => mockComments

/* ─────────────────────────────────────────────────────────────
   Reports
   ───────────────────────────────────────────────────────────── */
export const mockReports: Report[] = [
  {
    id: 'rep1',
    reporterId: 'u1',
    targetType: 'comment',
    targetId: 'c5',
    reason: 'spoiler',
    details: 'Major plot twist posted with no warning at all.',
    status: 'pending',
    createdAt: hoursAgo(6),
    reporter: profileById('u1'),
  },
  {
    id: 'rep2',
    reporterId: 'u3',
    targetType: 'comment',
    targetId: 'c2',
    reason: 'spam',
    details: 'Same message reposted across three different titles.',
    status: 'pending',
    createdAt: hoursAgo(19),
    reporter: profileById('u3'),
  },
  {
    id: 'rep3',
    reporterId: 'u4',
    targetType: 'user',
    targetId: 'u2',
    reason: 'harassment',
    details: 'Repeated personal attacks in reply threads.',
    status: 'reviewed',
    createdAt: hoursAgo(45),
    reporter: profileById('u4'),
  },
  {
    id: 'rep4',
    reporterId: 'u2',
    targetType: 'comment',
    targetId: 'c3',
    reason: 'abuse',
    details: 'Slur used toward another member of the thread.',
    status: 'resolved',
    createdAt: hoursAgo(88),
    reporter: profileById('u2'),
  },
  {
    id: 'rep5',
    reporterId: 'u1',
    targetType: 'comment',
    targetId: 'c6',
    reason: 'other',
    details: 'Off-topic link to an external store.',
    status: 'pending',
    createdAt: hoursAgo(120),
    reporter: profileById('u1'),
  },
]

/* ─────────────────────────────────────────────────────────────
   Admin dashboard mock data
   ───────────────────────────────────────────────────────────── */
export const dashboardStats = {
  movies: 12,
  users: 24_318,
  comments: 8_942,
  downloads: 1_204_556,
  trends: {
    movies: [42, 48, 51, 49, 58, 63, 71, 74, 82, 88, 94, 108],
    users: [820, 910, 1020, 1180, 1290, 1420, 1510, 1680, 1790, 1920, 2110, 2380],
    comments: [210, 260, 240, 310, 355, 340, 420, 470, 505, 560, 610, 690],
    downloads: [12, 18, 16, 24, 31, 29, 38, 44, 52, 61, 72, 88],
  },
  deltas: { movies: 14.2, users: 8.7, comments: -3.4, downloads: 22.9 },
}

export const recentActivity = [
  {
    id: 'a1',
    type: 'download' as const,
    actor: 'jonas.b',
    message: 'downloaded Iron Monsoon (1080p)',
    movie: 'Iron Monsoon',
    createdAt: hoursAgo(0.3),
  },
  {
    id: 'a2',
    type: 'comment' as const,
    actor: 'reel_talk',
    message: 'commented on Neon Horizon',
    movie: 'Neon Horizon',
    createdAt: hoursAgo(1.1),
  },
  {
    id: 'a3',
    type: 'report' as const,
    actor: 'analog_ana',
    message: 'reported a spoiler comment',
    movie: 'Sixteen Bridges',
    createdAt: hoursAgo(2.4),
  },
  {
    id: 'a4',
    type: 'user' as const,
    actor: 'piper.lark',
    message: 'created an account',
    movie: '',
    createdAt: hoursAgo(3.8),
  },
  {
    id: 'a5',
    type: 'movie' as const,
    actor: 'curator',
    message: 'published Aurora Protocol',
    movie: 'Aurora Protocol',
    createdAt: hoursAgo(6.5),
  },
]
