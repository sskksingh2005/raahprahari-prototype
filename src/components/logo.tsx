import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

export const LOGO_ALT = 'RaahPrahari'

/** Theme logo files in public/img and their real pixel sizes (update both together when a file is replaced). */
const LIGHT = { src: '/img/logo-on-light.png', width: 577, height: 433 }
const DARK = { src: '/img/logo-on-dark.png', width: 505, height: 494 }

/**
 * Both theme files are always in the DOM; CSS (`.dark` on <html>) shows exactly one,
 * so there is no flash on reload. The light file is the default and carries the alt text;
 * the dark one is hidden from assistive tech so the name is read once.
 */
function ThemedImages({ imgClassName }: { imgClassName: string }) {
  return (
    <>
      <img
        src={LIGHT.src}
        width={LIGHT.width}
        height={LIGHT.height}
        alt={LOGO_ALT}
        decoding="async"
        data-logo-theme="light"
        className={cn('block dark:hidden', imgClassName)}
      />
      <img
        src={DARK.src}
        width={DARK.width}
        height={DARK.height}
        alt=""
        aria-hidden="true"
        decoding="async"
        data-logo-theme="dark"
        className={cn('hidden dark:block', imgClassName)}
      />
    </>
  )
}

type LogoProps = {
  variant?: 'header' | 'mark' | 'full'
  className?: string
  /** Height utility for the header variant. 36px in the header and the menu. */
  heightClassName?: string
  /** Hide from assistive tech when next to a visible label. */
  decorative?: boolean
}

/** The one shared RaahPrahari logo. Uses the two theme files as-is: no filter, tile or box. */
export function Logo({ variant = 'header', className, heightClassName = 'h-9', decorative }: LogoProps) {
  if (variant === 'header') {
    return (
      <Link
        to="/"
        aria-label="RaahPrahari home"
        className={cn('inline-flex min-h-11 shrink-0 items-center rounded-md', className)}
      >
        <ThemedImages imgClassName={cn(heightClassName, 'w-auto max-w-none')} />
      </Link>
    )
  }

  const imgClassName = variant === 'mark' ? 'h-10 w-auto' : 'h-auto w-full'
  return (
    <span
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : LOGO_ALT}
      aria-hidden={decorative ? true : undefined}
      className={cn(variant === 'full' ? 'block w-full max-w-[16rem]' : 'inline-block shrink-0', className)}
    >
      <ThemedImages imgClassName={imgClassName} />
    </span>
  )
}
