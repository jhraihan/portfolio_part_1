import { useCallback, useRef } from 'react'

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * A card that lights up under the cursor.
 *
 * The pointer position is written to CSS custom properties rather than React
 * state, so tracking the cursor never triggers a re-render.
 */
export function Spotlight({ children, className = '', as: Tag = 'div' }) {
  const reduced = usePrefersReducedMotion()
  const ref = useRef(null)

  const handleMove = useCallback(
    (event) => {
      const element = ref.current
      if (!element) return
      const rect = element.getBoundingClientRect()
      element.style.setProperty('--mx', `${event.clientX - rect.left}px`)
      element.style.setProperty('--my', `${event.clientY - rect.top}px`)
      element.style.setProperty('--spot', '1')
    },
    [],
  )

  const handleLeave = useCallback(() => {
    ref.current?.style.setProperty('--spot', '0')
  }, [])

  if (reduced) {
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <Tag
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`group/spot relative ${className}`}
      style={{ '--spot': 0 }}
    >
      {/* The glow itself: a radial gradient positioned at the cursor. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[var(--spot)] transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(360px circle at var(--mx) var(--my), rgb(var(--accent) / 0.13), transparent 70%)',
        }}
      />
      {/* A brighter rim on the border, masked to the edge only. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[var(--spot)] transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(280px circle at var(--mx) var(--my), rgb(var(--accent) / 0.65), transparent 65%)',
          WebkitMask:
            'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '1px',
        }}
      />
      {children}
    </Tag>
  )
}
