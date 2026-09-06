/** Inline loading indicator. Announced to assistive technology. */
export function Spinner({ label = 'Loading', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} role="status">
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-accent"
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
