import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, AtSign, Check, Eye, EyeOff, Info, Lock, Sparkles } from 'lucide-react'
import { AuthShell } from '@/components/layout/AuthShell'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/helpers'
import { Field } from './SignIn'

const rules = [
  { label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { label: 'One number', test: (value: string) => /\d/.test(value) },
  { label: 'One uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
]

export function SignUp() {
  const navigate = useNavigate()
  const { signUp, isDemoMode } = useAuth()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const strength = useMemo(() => rules.filter((rule) => rule.test(password)).length, [password])
  const mismatched = confirm.length > 0 && confirm !== password

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Please use a password with at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Those passwords do not match.')
      return
    }

    setLoading(true)
    const result = await signUp(email, password, username)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free forever. No card, no trial countdown, no cancellation dance."
      notice={
        isDemoMode ? (
          <div className="flex items-start gap-3 rounded-button border border-streamly-warning/30 bg-streamly-warning/8 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-streamly-warning" />
            <p className="text-[12px] leading-relaxed text-streamly-warning">
              Supabase keys are not configured — Streamly is in demo mode. Your account lives in
              this browser only.
            </p>
          </div>
        ) : null
      }
      footer={
        <p className="text-center text-sm text-streamly-text-secondary">
          Already have an account?{' '}
          <Link
            to="/auth/signin"
            className="font-semibold text-streamly-purple transition-colors hover:text-streamly-cyan"
          >
            Sign in
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
          label="Username"
          icon={<AtSign className="h-4 w-4" />}
          value={username}
          onChange={(value) => setUsername(value.replace(/\s/g, ''))}
          placeholder="film_buff"
          autoComplete="username"
          required
        />

        <Field
          label="Email"
          icon={<Sparkles className="h-4 w-4" />}
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
            placeholder="Create a strong password"
            autoComplete="new-password"
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

          {/* Strength meter */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex flex-1 gap-1.5">
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors duration-500',
                    strength > index
                      ? index === 0
                        ? 'bg-streamly-error'
                        : index === 1
                          ? 'bg-streamly-gold'
                          : 'bg-streamly-success'
                      : 'bg-white/10',
                  )}
                />
              ))}
            </div>
            <span className="text-[11px] font-semibold text-streamly-text-muted">
              {strength === 0 ? 'Too short' : strength === 1 ? 'Weak' : strength === 2 ? 'Good' : 'Strong'}
            </span>
          </div>

          <ul className="mt-2.5 grid gap-1.5">
            {rules.map((rule) => {
              const passed = rule.test(password)
              return (
                <li
                  key={rule.label}
                  className={cn(
                    'flex items-center gap-2 text-[11px] transition-colors',
                    passed ? 'text-streamly-success' : 'text-streamly-text-muted',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-3.5 w-3.5 place-items-center rounded-full border transition-colors',
                      passed
                        ? 'border-streamly-success bg-streamly-success/20'
                        : 'border-streamly-border-light',
                    )}
                  >
                    {passed ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : null}
                  </span>
                  {rule.label}
                </li>
              )
            })}
          </ul>
        </div>

        <Field
          label="Confirm password"
          icon={<Lock className="h-4 w-4" />}
          type={showPassword ? 'text' : 'password'}
          value={confirm}
          onChange={setConfirm}
          placeholder="Repeat your password"
          autoComplete="new-password"
          required
        />

        {mismatched ? (
          <p className="text-[12px] font-medium text-streamly-error">Passwords do not match.</p>
        ) : null}

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={loading}
          disabled={mismatched}
          iconRight={<ArrowRight className="h-4 w-4" />}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  )
}

export default SignUp
