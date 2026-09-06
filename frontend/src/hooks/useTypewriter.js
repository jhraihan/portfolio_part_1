import { useEffect, useState } from 'react'

import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/**
 * Types through a list of phrases, deleting between them.
 *
 * With reduced motion the first phrase is returned immediately and the caret
 * stops blinking, so the content is never withheld behind an animation.
 */
export function useTypewriter(phrases, { typeMs = 55, deleteMs = 28, holdMs = 1900 } = {}) {
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (reduced || !phrases.length) return

    const current = phrases[index % phrases.length]

    // Finished typing: hold, then start deleting.
    if (!deleting && text === current) {
      const timer = setTimeout(() => setDeleting(true), holdMs)
      return () => clearTimeout(timer)
    }

    // Finished deleting: advance to the next phrase.
    if (deleting && text === '') {
      setDeleting(false)
      setIndex((i) => (i + 1) % phrases.length)
      return
    }

    const timer = setTimeout(
      () =>
        setText((t) =>
          deleting ? current.slice(0, t.length - 1) : current.slice(0, t.length + 1),
        ),
      deleting ? deleteMs : typeMs,
    )
    return () => clearTimeout(timer)
  }, [text, deleting, index, phrases, typeMs, deleteMs, holdMs, reduced])

  if (reduced) {
    return { text: phrases[0] ?? '', isAnimating: false }
  }

  return { text, isAnimating: true }
}
