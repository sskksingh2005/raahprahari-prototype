import { cn } from '@/lib/utils'

/** Placeholder block with a shimmer sweep (static under reduced motion). */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn('rp-shimmer rounded-md bg-accent', className)}
      {...props}
    />
  )
}

/** Card-shaped placeholder that matches AdvisoryCard / route card proportions. */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      data-slot="skeleton-card"
      aria-hidden
      className={cn('grid gap-3 rounded-xl border border-border bg-card p-4', className)}
    >
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  )
}

function SkeletonList({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div aria-hidden className={cn('grid gap-3', className)}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonList }
