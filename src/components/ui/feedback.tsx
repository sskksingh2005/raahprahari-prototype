import * as React from 'react'
import { AlertCircle, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SkeletonList } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function LoadingState({
  label = 'Loading',
  variant = 'inline',
  className,
}: {
  label?: string
  /** cards shows shimmering card placeholders under the label instead of a bare spinner. */
  variant?: 'inline' | 'cards'
  className?: string
}) {
  if (variant === 'cards') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={cn('grid gap-3', className)}
      >
        <span className="sr-only">{label}</span>
        <SkeletonList count={3} />
      </div>
    )
  }
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        'flex min-h-24 items-center justify-center gap-2 text-sm text-muted-foreground',
        className,
      )}
    >
      <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({
  title = 'Unable to load this information',
  message,
  retryLabel = 'Try again',
  onRetry,
  className,
}: {
  title?: string
  message: string
  retryLabel?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <section
      role="alert"
      className={cn(
        'rp-fade-rise grid min-h-24 justify-items-center gap-3 rounded-xl border border-status-closed/50 p-6 text-center',
        className,
      )}
    >
      <AlertCircle aria-hidden="true" className="rp-pop size-5 text-action-restricted" />
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="max-w-prose text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button type="button" variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </section>
  )
}

export function EmptyState({
  title,
  message,
  action,
  className,
}: {
  title: string
  message: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'rp-fade-rise grid min-h-24 justify-items-center gap-3 rounded-xl border border-dashed border-border p-6 text-center',
        className,
      )}
    >
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="max-w-prose text-sm text-muted-foreground">{message}</p>
      {action}
    </section>
  )
}

export function VisuallyHidden({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return <span className={cn('sr-only', className)} {...props} />
}

export function SkipLink({
  className,
  href = '#main',
  ...props
}: React.ComponentProps<'a'>) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only z-[var(--z-dialog)] rounded-md bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3',
        className,
      )}
      {...props}
    />
  )
}
