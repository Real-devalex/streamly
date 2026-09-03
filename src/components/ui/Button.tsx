import { Link } from 'react-router-dom'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/helpers'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] rounded-[10px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-[15px] rounded-[14px]',
  icon: 'h-10 w-10 rounded-full',
}

const variants: Record<Variant, string> = {
  primary: 'btn-primary text-white',
  secondary: 'btn-secondary',
  ghost:
    'text-streamly-text-secondary hover:text-streamly-text hover:bg-white/6 border border-transparent',
  danger:
    'bg-streamly-error/12 text-streamly-error border border-streamly-error/30 hover:bg-streamly-error/20 hover:border-streamly-error/50',
  success:
    'bg-streamly-success/12 text-streamly-success border border-streamly-success/30 hover:bg-streamly-success/20',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  to?: string
  loading?: boolean
  fullWidth?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  to,
  loading = false,
  fullWidth = false,
  icon,
  iconRight,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold tracking-tight',
    'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-streamly-purple',
    'disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className,
  )

  const content = (
    <>
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80" />
      ) : (
        icon
      )}
      {children}
      {iconRight && !loading ? iconRight : null}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  )
}

export default Button
