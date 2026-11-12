import * as React from 'react'
import { cn } from '@/lib/utils'
import { useFieldProps } from '@/components/ui/field'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  const fieldProps = useFieldProps(props)
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'rp-field flex field-sizing-content min-h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40',
        className,
      )}
      {...fieldProps}
    />
  )
}

export { Textarea }
