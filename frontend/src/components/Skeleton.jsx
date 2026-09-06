/**
 * Placeholder block shown while content loads.
 *
 * Matching the real content's shape keeps the layout from jumping when data
 * arrives, which is what a spinner alone cannot do.
 */
export function Skeleton({ className = '' }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-elevated ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-line-strong/40 to-transparent" />
    </div>
  )
}

/** A card-shaped skeleton matching ProjectCard's proportions. */
export function ProjectCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-[16/9] rounded-none" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <div className="flex gap-1.5 pt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>
      </div>
    </div>
  )
}
