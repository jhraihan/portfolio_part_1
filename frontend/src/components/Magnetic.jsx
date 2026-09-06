import { useCallback, useRef } from 'react'

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Nudges its child toward the cursor on hover.
 *
 * The transform is applied directly to the node so the effect costs no
 * re-renders. Disabled entirely under reduced motion and on touch devices,
 * where there is no hover to respond to.
 */
export function Magnetic({ children, strength = 0.28, className = '' }) {
  const reduced = usePrefersReducedMotion()
  const ref = useRef(null)

  const handleMove = useCallback(
    (event) => {
      const element = ref.current
      if (!element) return
      const rect = element.getBoundingClientRect()
      const x = event.clientX - (rect.left + rect.width / 2)
      const y = event.clientY - (rect.top + rect.height / 2)
      element.style.transform = `translate(${x * strength}px, ${y * strength}px)`
    },
    [strength],
  )

  const handleLeave = useCallback(() => {
    const element = ref.current
    if (element) element.style.transform = 'translate(0, 0)'
  }, [])

  if (reduced) {
    return <span className={className}>{children}</span>
  }

  return (
    <span
      ref={ref}
      onPointerMove={(e) => e.pointerType === 'mouse' && handleMove(e)}
      onPointerLeave={handleLeave}
      className={`inline-block transition-transform duration-300 ease-out ${className}`}
    >
      {children}
    </span>
  )
}
