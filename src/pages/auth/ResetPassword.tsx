import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2, Mail, RefreshCw } from 'lucide-react'
import { AuthShell } from '@/components/layout/AuthShell'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { Field } from './SignIn'

export function ResetPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    const result = await resetPassword(email)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthShell
        title="Check your inbox"
        subtitle={`We sent a reset link to ${email || 'your email address'}. It expires in 60 minutes.`}
        footer={
          <Link
            to="/auth/signin"
            className="inline-flex items-center gap-2 text-sm font-semibold text-streamly-text-muted transition-colors hover:text-streamly-text"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        }
      >
        <div className="animate-scale-in space-y-5">
          <div className="flex items-start gap-4 rounded-card border border-streamly-success/25 bg-streamly-success/8 p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-streamly-success/15 text-streamly-success ring-1 ring-streamly-success/30">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-streamly-text">Reset link sent</p>
              <p className="mt-1 text-[13px] leading-relaxed text-streamly-text-secondary">
                If an account exists for that address, you will hear from us shortly. Check spam if
                it does not arrive in five minutes.
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              setSent(false)
              setEmail('')
            }}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Use a different email
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Tell us the email on your account and we will send a secure reset link."
      footer={
        <p className="text-center text-sm text-streamly-text-secondary">
          Remembered it?{' '}
          <Link
            to="/auth/signin"
            className="font-semibold text-streamly-purple transition-colors hover:text-streamly-cyan"
          >
            Back to sign in
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

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={loading}
          iconRight={<ArrowLeft className="h-4 w-4 rotate-180" />}
        >
          {loading ? 'Sending link…' : 'Send reset link'}
        </Button>
      </form>
    </AuthShell>
  )
}

export default ResetPassword
