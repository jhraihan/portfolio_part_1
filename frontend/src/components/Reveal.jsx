import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

/**
 * Fades content up as it enters the viewport.
 *
 * Content must never depend on the animation to become visible. Two
 * safeguards enforce that:
 *
 *   1. Reduced motion renders a plain element with no animation at all.
 *   2. A short timer reveals the element regardless, so a missed
 *      intersection — a collapsed grid child, an offscreen container, a
 *      browser without IntersectionObserver — can never leave real content
 *      stuck at zero opacity.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
  as = 'div',
  ...rest
}) {
  const prefersReducedMotion = useReducedMotion()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' })
  const [forceVisible, setForceVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setForceVisible(true), 900)
    return () => clearTimeout(timer)
  }, [])

  if (prefersReducedMotion) {
    const Tag = as
    return (
      <Tag ref={ref} className={className} {...rest}>
        {children}
      </Tag>
    )
  }

  const MotionTag = motion[as] ?? motion.div
  const visible = isInView || forceVisible

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}
