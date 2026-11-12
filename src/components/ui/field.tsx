import * as React from 'react'
import { AlertCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FieldContextValue {
  id: string
  descriptionId?: string
  errorId?: string
  error?: string
  required: boolean
}

const FieldContext = React.createContext<FieldContextValue | null>(null)

export function Field({
  id,
  label,
  description,
  error,
  required = false,
  className,
  children,
}: {
  id?: string
  label: React.ReactNode
  description?: React.ReactNode
  error?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  const generatedId = React.useId()
  const controlId = id ?? generatedId
  const context = {
    id: controlId,
    descriptionId: description ? `${controlId}-description` : undefined,
    errorId: error ? `${controlId}-error` : undefined,
    error,
    required,
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Label htmlFor={controlId}>
        {label}
        {required && (
          <span aria-hidden="true" className="text-destructive">
            {' '}
            *
          </span>
        )}
      </Label>
      <FieldContext.Provider value={context}>{children}</FieldContext.Provider>
      {description && (
        <p
          id={context.descriptionId}
          className="text-sm text-muted-foreground"
        >
          {description}
        </p>
      )}
      {error && (
        <p id={context.errorId} role="alert" className="rp-slide-down flex items-start gap-1.5 text-sm text-destructive">
          <AlertCircle aria-hidden className="rp-pop mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

export function useFieldProps<
  T extends {
    id?: string
    required?: boolean
    'aria-describedby'?: string
    'aria-invalid'?: React.AriaAttributes['aria-invalid']
  },
>(props: T): T {
  const context = React.useContext(FieldContext)
  if (!context) return props

  const describedBy = [
    props['aria-describedby'],
    context.descriptionId,
    context.errorId,
  ]
    .filter(Boolean)
    .join(' ')

  return {
    ...props,
    id: context.id,
    required: props.required ?? context.required,
    'aria-describedby': describedBy || undefined,
    'aria-invalid': context.error ? true : props['aria-invalid'],
  }
}

/**
 * Character counter that changes colour near the limit (90%) and at it.
 * Colour is paired with the numbers, never the only signal.
 */
export function CharCounter({
  length,
  max,
  id,
  className,
}: {
  length: number
  max: number
  id?: string
  className?: string
}) {
  const state = length >= max ? 'limit' : length >= max * 0.9 ? 'near' : 'ok'
  return (
    <span
      id={id}
      data-state={state}
      aria-live="polite"
      className={cn(
        'text-xs transition-colors duration-(--motion-base)',
        state === 'ok' && 'text-muted-foreground',
        state === 'near' && 'font-medium text-counter-warn',
        state === 'limit' && 'font-semibold text-destructive',
        className,
      )}
    >
      {length}/{max}
    </span>
  )
}
