import { useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, ArrowRight, Eye, EyeOff, Info, Lock, Mail, Sparkles } from 'lucide-react'
import { AuthShell } from '@/components/layout/AuthShell'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

export function SignIn() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { signIn, signInDemo, isDemoMode } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  const redirect = params.get('redirect') ?? '/'

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    const result = await signIn(email, password)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    navigate(redirect, { replace: true })
  }

  return (
    <AuthShell
      title="Sign in to Streamly"
      subtitle="Pick up exactly where you left off — watchlist, downloads and discussions."
      notice={
        isDemoMode ? (
          <div className="flex items-start gap-3 rounded-button border border-streamly-warning/30 bg-streamly-warning/8 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-streamly-warning" />
            <p className="text-[12px] leading-relaxed text-streamly-warning">
              Supabase keys are not configured, so Streamly is running in demo mode. Any email and
              password will sign you straight in with mock data.
            </p>
          </div>
        ) : null
      }
      footer={
        <p className="text-center text-sm text-streamly-text-secondary">
          New to Streamly?{' '}
          <Link
            to="/auth/signup"
            className="font-semibold text-streamly-purple transition-colors hover:text-streamly-cyan"
          >
            Create a free account
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error ? (
          <div className="flex items-start gap-3 rounded-button border border-streamly-error/30 bg-streamly-error/10 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-streamly-error" />
            <p className="text-[13px] text-streamly-error">{error}</p>
          </div>
        ) : null}

        <Field
          label="Email"
          icon={<Mail className="h-4 w-4" />}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <div>
          <Field
            label="Password"
            icon={<Lock className="h-4 w-4" />}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="text-streamly-text-muted transition-colors hover:text-streamly-text"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          <div className="mt-2.5 flex justify-end">
            <Link
              to="/auth/reset"
              className="text-xs font-semibold text-streamly-text-muted transition-colors hover:text-streamly-purple"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={loading}
          iconRight={<ArrowRight className="h-4 w-4" />}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>

        {isDemoMode ? (
          <>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-streamly-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-streamly-black px-3 text-[11px] uppercase tracking-wider text-streamly-text-muted">
                  or
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              loading={demoLoading}
              onClick={async () => {
                setDemoLoading(true)
                await signInDemo('admin')
                setDemoLoading(false)
                navigate(redirect, { replace: true })
              }}
              icon={<Sparkles className="h-4 w-4" />}
            >
              Explore with a demo account
            </Button>
          </>
        ) : null}
      </form>
    </AuthShell>
  )
}

/* ── Shared input ── */
export function Field({
  label,
  icon,
  trailing,
  value,
  onChange,
  ...rest
}: {
  label: string
  icon?: ReactNode
  trailing?: ReactNode
  value: string
  onChange?: (value: string) => void
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-streamly-text-secondary">
        {label}
      </span>
      <span className="group relative flex items-center rounded-button border border-streamly-border bg-black/35 px-3.5 transition-all duration-300 focus-within:border-streamly-purple/70 focus-within:ring-2 focus-within:ring-streamly-purple/20 hover:border-streamly-border-light">
        {icon ? (
          <span className="mr-2.5 text-streamly-text-muted transition-colors group-focus-within:text-streamly-purple">
            {icon}
          </span>
        ) : null}
        <input
          {...rest}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className="h-12 w-full bg-transparent text-sm text-streamly-text placeholder:text-streamly-text-muted focus:outline-none"
        />
        {trailing}
      </span>
    </label>
  )
}

export default SignIn
