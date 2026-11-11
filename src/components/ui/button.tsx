import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'

/**
 * Motion comes from the `rp-interactive` class in `src/styles.css`: hover lift,
 * press scale, shadow and the not-allowed cursor. Hover colours are tokens
 * (`primary-hover`, `secondary-hover`, `report-hover`). The focus ring classes
 * below must stay on every variant.
 */
const buttonVariants = cva(
  "rp-interactive relative inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        report: 'bg-report text-report-foreground hover:bg-report-hover',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-4 py-2 has-[>svg]:px-3',
        xs: "h-11 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-11 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5',
        lg: 'h-11 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-11',
        'icon-xs': "size-11 rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-11',
        'icon-lg': 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type IconButtonSize = 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'
type TextButtonSize = 'default' | 'xs' | 'sm' | 'lg'
type ButtonBaseProps = Omit<
  React.ComponentProps<'button'>,
  'aria-label' | 'size'
> &
  Omit<VariantProps<typeof buttonVariants>, 'size'> & {
    asChild?: boolean
    /** Shows a spinner inside the button, disables it and keeps its width. */
    loading?: boolean
  }

export type ButtonProps = ButtonBaseProps &
  (
    | { size?: TextButtonSize; 'aria-label'?: string }
    | { size: IconButtonSize; 'aria-label': string }
  )

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  const loadingProps = loading ? { 'aria-busy': true, 'data-loading': 'true' } : {}

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={asChild ? disabled : disabled || loading}
      {...loadingProps}
      {...props}
    >
      {loading && !asChild ? (
        <>
          {/* The label stays in the layout (invisible) so the width never changes. */}
          <span aria-hidden className="absolute inset-0 grid place-items-center">
            <LoaderCircle className="size-4 motion-safe:animate-spin" />
          </span>
          <span className="inline-flex items-center justify-center gap-[inherit] opacity-0">{children}</span>
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export type IconButtonProps = Omit<
  ButtonBaseProps,
  'children'
> & {
  label: string
  icon: React.ReactNode
  size?: IconButtonSize
}

function IconButton({
  label,
  icon,
  size = 'icon',
  ...props
}: IconButtonProps) {
  return (
    <Button {...props} size={size} aria-label={label}>
      {icon}
    </Button>
  )
}

export { Button, IconButton, buttonVariants }
