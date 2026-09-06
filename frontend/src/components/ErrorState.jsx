import { AlertCircle, RefreshCw } from 'lucide-react'

/** Shown when a request fails, with a retry when the caller can refetch. */
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-card border border-line bg-surface px-6 py-12 text-center">
      <AlertCircle className="h-6 w-6 text-accent" aria-hidden="true" />
      <div>
        <p className="font-medium text-ink">Something went wrong</p>
        <p className="prose-body mt-1 text-sm">
          {message || 'Please try again in a moment.'}
        </p>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  )
}
