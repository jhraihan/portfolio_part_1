import { useState } from 'react'
import { ImageIcon } from 'lucide-react'

/**
 * Renders an image, or a designed placeholder when none exists yet.
 *
 * The placeholder is deliberate rather than apologetic: it holds the correct
 * aspect ratio and reads as part of the design — a dotted field with a faint
 * label — so a project without screenshots never looks broken or unfinished.
 * Dropping a real image in later requires no other change.
 */
export function ImageFrame({
  src,
  alt,
  label,
  aspect = 'aspect-[16/10]',
  className = '',
  loading = 'lazy',
}) {
  const [failed, setFailed] = useState(false)
  const showPlaceholder = !src || failed

  return (
    <div
      className={`relative overflow-hidden rounded-card border border-line bg-elevated ${aspect} ${className}`}
    >
      {showPlaceholder ? (
        <div
          className="relative flex h-full w-full flex-col items-center justify-center gap-3 bg-dots"
          role="img"
          aria-label={alt || 'Screenshot not yet available'}
        >
          {/* Corner ticks, which read as a crop frame rather than an error. */}
          <span className="absolute left-3 top-3 h-3 w-3 border-l border-t border-line-strong" aria-hidden="true" />
          <span className="absolute right-3 top-3 h-3 w-3 border-r border-t border-line-strong" aria-hidden="true" />
          <span className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-line-strong" aria-hidden="true" />
          <span className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-line-strong" aria-hidden="true" />

          <ImageIcon
            className="h-7 w-7 text-ink-faint/50"
            aria-hidden="true"
            strokeWidth={1.25}
          />
          {label && (
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint/60">
              {label}
            </span>
          )}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  )
}
