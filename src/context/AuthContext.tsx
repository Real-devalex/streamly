import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { DEMO_USER } from '@/data/mock-community'
import type { Profile } from '@/types'
import { toErrorMessage } from '@/lib/supabase'

const DEMO_STORAGE_KEY = 'streamly:demo-session'

export interface AuthResult {
  error: string | null
}

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  /** Supabase keys missing — the app is running on mock data. */
  isDemoMode: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string, username: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<AuthResult>
  signInDemo: (role?: 'user' | 'admin') => Promise<AuthResult>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function profileFromUser(user: User | null): Profile | null {
  if (!user) return null
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  return {
    id: user.id,
    username: typeof meta.username === 'string' ? meta.username : (user.email?.split('@')[0] ?? 'member'),
    displayName:
      typeof meta.display_name === 'string'
        ? meta.display_name
        : (typeof meta.username === 'string' ? meta.username : user.email?.split('@')[0]),
    avatarUrl: typeof meta.avatar_url === 'string' ? meta.avatar_url : undefined,
    bio: typeof meta.bio === 'string' ? meta.bio : undefined,
    role: meta.role === 'admin' ? 'admin' : 'user',
    createdAt: user.created_at ?? new Date().toISOString(),
  }
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (error || !data) return null
    return {
      id: data.id,
      username: data.username,
      displayName: data.display_name ?? undefined,
      avatarUrl: data.avatar_url ?? undefined,
      bio: data.bio ?? undefined,
      role: data.role === 'admin' ? 'admin' : 'user',
      createdAt: data.created_at,
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const hydrateProfile = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      setProfile(null)
      return
    }
    const remote = await fetchProfile(nextUser.id)
    setProfile(remote ?? profileFromUser(nextUser))
  }, [])

  /* ── Restore session (real Supabase or local demo session) ── */
  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        if (!isSupabaseConfigured) {
          const stored = window.localStorage.getItem(DEMO_STORAGE_KEY)
          if (stored) {
            const parsed = JSON.parse(stored) as Profile
            setProfile(parsed)
            setUser({ id: parsed.id, email: `${parsed.username}@streamly.demo` } as User)
          }
          return
        }

        const { data } = await supabase.auth.getSession()
        if (cancelled) return
        setSession(data.session ?? null)
        setUser(data.session?.user ?? null)
        await hydrateProfile(data.session?.user ?? null)
      } catch {
        /* offline / misconfigured — fall through to signed-out state */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void init()

    if (isSupabaseConfigured) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
        setSession(nextSession)
        setUser(nextSession?.user ?? null)
        await hydrateProfile(nextSession?.user ?? null)
        setLoading(false)
      })
      return () => {
        cancelled = true
        subscription.unsubscribe()
      }
    }

    return () => {
      cancelled = true
    }
  }, [hydrateProfile])

  /* ── Actions ─────────────────────────────────────────────── */
  const rememberDemo = useCallback((nextProfile: Profile) => {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(nextProfile))
    setProfile(nextProfile)
    setUser({ id: nextProfile.id, email: `${nextProfile.username}@streamly.demo` } as User)
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      rememberDemo({ ...DEMO_USER, username: email.split('@')[0] || 'you' })
      return { error: null }
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error ? toErrorMessage(error) : null }
    } catch (error) {
      return { error: toErrorMessage(error) }
    }
  }, [rememberDemo])

  const signUp = useCallback(
    async (email: string, password: string, username: string): Promise<AuthResult> => {
      if (!isSupabaseConfigured) {
        rememberDemo({
          ...DEMO_USER,
          username: username || email.split('@')[0] || 'you',
          displayName: username || email.split('@')[0] || 'You',
        })
        return { error: null }
      }
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username, display_name: username } },
        })
        return { error: error ? toErrorMessage(error) : null }
      } catch (error) {
        return { error: toErrorMessage(error) }
      }
    },
    [rememberDemo],
  )

  const signOut = useCallback(async () => {
    window.localStorage.removeItem(DEMO_STORAGE_KEY)
    setProfile(null)
    setUser(null)
    setSession(null)
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut()
      } catch {
        /* no-op */
      }
    }
  }, [])

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return { error: null }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      })
      return { error: error ? toErrorMessage(error) : null }
    } catch (error) {
      return { error: toErrorMessage(error) }
    }
  }, [])

  const signInDemo = useCallback(
    async (role: 'user' | 'admin' = 'admin'): Promise<AuthResult> => {
      rememberDemo({ ...DEMO_USER, role })
      return { error: null }
    },
    [rememberDemo],
  )

  const refreshProfile = useCallback(async () => {
    if (!user) return
    await hydrateProfile(user)
  }, [hydrateProfile, user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: profile?.role === 'admin',
      isDemoMode: !isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
      resetPassword,
      signInDemo,
      refreshProfile,
    }),
    [
      user,
      session,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      signInDemo,
      refreshProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}
