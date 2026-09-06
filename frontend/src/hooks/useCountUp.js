import { useEffect, useRef, useState } from 'react'

import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/**
 * Counts from zero to `target` once the element scrolls into view.
 *
 * Returns the final value immediately under reduced motion.
 */
export function useCountUp(target, { duration = 1200 } = {}) {
  const reduced = usePrefersReducedMotion()
  const ref = useRef(null)
  const [value, setValue] = useState(reduced ? target : 0)
  const started = useRef(false)

  useEffect(() => {
    if (reduced) {
      setValue(target)
      return
    }

    const element = ref.current
    if (!element || !('IntersectionObserver' in window)) {
      setValue(target)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true

        const start = performance.now()
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1)
          // Ease-out cubic, so the count decelerates into place.
          const eased = 1 - Math.pow(1 - progress, 3)
          setValue(Math.round(target * eased))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        observer.disconnect()
      },
      { threshold: 0.4 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [target, duration, reduced])

  return { ref, value }
}
