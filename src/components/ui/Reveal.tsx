import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'
import { cn } from '@/utils/helpers'

export interface RevealProps {
  children: ReactNode
  className?: string
  /** Entrance delay in ms. */
  delay?: number
  as?: ElementType
}

/**
 * Scroll-triggered entrance wrapper (Intersection Observer).
 * Respects `prefers-reduced-motion` — content simply appears.
 */
export function Reveal({ children, className, delay = 0, as: Tag = 'section' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

export default Reveal
