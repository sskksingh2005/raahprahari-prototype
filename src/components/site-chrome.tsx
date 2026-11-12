import { useRef, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import {
  ChevronDown,
  House,
  ListChecks,
  Map,
  Menu,
  Monitor,
  Moon,
  Search,
  Sun,
  TriangleAlert,
  UserRound,
} from 'lucide-react'
import { crossFadeTheme, useScrolled } from '@/components/motion'
import { OfflineBanner } from '@/components/offline-banner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { usePrefs } from '@/i18n/preferences'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 32 32" aria-hidden className="size-8 shrink-0">
        <rect width="32" height="32" rx="8" fill="#111719" />
        <path d="M4 23 L12 11 L16 16 L20 9 L28 23 Z" fill="#30363A" />
        <path d="M20 9 L23 13.5 L21 13 L19.5 14.5 L18 12 Z" fill="#E6E4DC" />
        <path
          d="M10 28 C13 23 19 22 16 17 C14.5 14.5 18 12.5 20 12"
          fill="none"
          stroke="#EB5B38"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-display text-lg font-bold tracking-tight">
        Raah<span className="text-brand-orange">Prahari</span>
      </span>
    </span>
  )
}

function LanguageSwitch() {
  const { lang, setLang, t } = usePrefs()
  return (
    <div
      role="group"
      aria-label={t('lang.label')}
      className="inline-flex h-11 rounded-full border border-border p-0.5 text-sm"
    >
      {(['en', 'hi'] as const).map((language) => (
        <button
          key={language}
          type="button"
          aria-pressed={lang === language}
          onClick={() => setLang(language)}
          lang={language}
          className={cn(
            'rp-press min-h-11 min-w-11 rounded-full px-2.5 font-medium transition-colors',
            lang === language
              ? 'bg-raised text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {language === 'en' ? 'EN' : 'हिन्दी'}
        </button>
      ))}
    </div>
  )
}

function ThemeSwitch() {
  const { theme, setTheme, t } = usePrefs()
  const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'
  const label =
    next === 'system'
      ? t('theme.useSystem')
      : next === 'light'
        ? t('theme.light')
        : t('theme.dark')
  return (
    <Button
      variant="ghost"
      size="icon-lg"
      className="rounded-full"
      onClick={() => {
        crossFadeTheme()
        setTheme(next)
      }}
      aria-label={label}
      title={t('theme.toggle')}
    >
      <span key={theme} className="rp-icon-swap grid place-items-center">
        {theme === 'system' ? <Monitor /> : theme === 'dark' ? <Sun /> : <Moon />}
      </span>
    </Button>
  )
}

function LoginDialog({
  open,
  onOpenChange,
  returnFocusRef,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  returnFocusRef: React.RefObject<HTMLButtonElement | null>
}) {
  const { t } = usePrefs()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onCloseAutoFocus={(event) => {
          if (returnFocusRef.current?.isConnected) {
            event.preventDefault()
            returnFocusRef.current.focus()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-display">{t('login.title')}</DialogTitle>
          <DialogDescription>{t('login.body')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button>{t('login.close')}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const PRIMARY_NAV = [
  { to: '/', label: 'nav.home' },
  { to: '/traveller', label: 'nav.traveller' },
  { to: '/map', label: 'nav.map' },
  { to: '/advisories', label: 'nav.advisories' },
  { to: '/help', label: 'nav.help' },
] as const

export const SECONDARY_NAV = [
  { to: '/about', label: 'nav.about' },
  { to: '/contact', label: 'nav.contact' },
  { to: '/reports', label: 'nav.myReports' },
] as const

export const BOTTOM_NAV = [
  { to: '/', label: 'nav.home', icon: House },
  { to: '/traveller', label: 'nav.traveller', icon: Search },
  { to: '/report', label: 'nav.report', icon: TriangleAlert },
  { to: '/map', label: 'nav.map', icon: Map },
  { to: '/advisories', label: 'nav.advisories', icon: ListChecks },
] as const

type NavTarget =
  | (typeof PRIMARY_NAV)[number]['to']
  | (typeof SECONDARY_NAV)[number]['to']
  | (typeof BOTTOM_NAV)[number]['to']

export function activeNavTarget(pathname: string, view?: string): NavTarget | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (path === '/') return '/'
  if (path === '/traveller') return '/traveller'
  if (path === '/map' || (path === '/check' && view !== 'list')) return '/map'
  if (path === '/advisories' || path.startsWith('/advisories/') || path === '/check') {
    return '/advisories'
  }
  if (path === '/help' || path.startsWith('/help/')) return '/help'
  if (path === '/about') return '/about'
  if (path === '/contact') return '/contact'
  if (path === '/reports' || path.startsWith('/reports/')) return '/reports'
  if (path === '/report' || path.startsWith('/report/')) return '/report'
  return null
}

export function SiteHeader() {
  const { t } = usePrefs()
  const [loginOpen, setLoginOpen] = useState(false)
  const loginReturnFocusRef = useRef<HTMLButtonElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)
  const scrolled = useScrolled()
  const { pathname, view } = useRouterState({
    select: (state) => ({
      pathname: state.location.pathname,
      view: (state.location.search as { view?: string }).view,
    }),
  })
  const active = activeNavTarget(pathname, view)
  const current = (to: NavTarget) => (active === to ? ('page' as const) : undefined)

  const openLogin = (returnTo: HTMLButtonElement | null) => {
    loginReturnFocusRef.current = returnTo
    setLoginOpen(true)
  }

  return (
    <>
      <header
        data-scrolled={scrolled}
        className="rp-header sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md"
      >
        <div className="rp-container flex h-16 min-w-0 items-center gap-3">
          <Link to="/" className="shrink-0 rounded-md" aria-label={t('nav.homeLabel')}>
            <Logo />
          </Link>

          <nav aria-label={t('nav.primary')} className="hidden min-w-0 items-center xl:flex">
            {PRIMARY_NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                aria-current={current(to)}
                className={cn(
                  'rp-underline inline-flex min-h-11 items-center px-2.5 text-sm font-medium whitespace-nowrap transition-colors 2xl:px-3.5',
                  active === to ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t(label)}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'min-h-11 gap-1 px-2.5 text-sm font-medium',
                    SECONDARY_NAV.some(({ to }) => active === to)
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                  )}
                  aria-current={
                    SECONDARY_NAV.some(({ to }) => active === to) ? 'page' : undefined
                  }
                >
                  {t('nav.more')}
                  <ChevronDown aria-hidden className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {SECONDARY_NAV.map(({ to, label }) => (
                  <DropdownMenuItem key={to} asChild>
                    <Link to={to} aria-current={current(to)}>
                      {t(label)}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="ml-auto hidden shrink-0 items-center gap-1.5 xl:flex">
            <LanguageSwitch />
            <ThemeSwitch />
            <Button
              variant="ghost"
              className="h-10 rounded-full whitespace-nowrap"
              onClick={(event) => openLogin(event.currentTarget)}
            >
              <UserRound aria-hidden />
              {t('nav.login')}
            </Button>
            <Button asChild variant="report" className="h-10 rounded-full px-4 font-semibold whitespace-nowrap">
              <Link
                to="/report"
                search={{ segment: undefined }}
                aria-current={current('/report')}
              >
                <TriangleAlert aria-hidden />
                {t('nav.report')}
              </Link>
            </Button>
          </div>

          <div className="ml-auto flex items-center gap-1 xl:hidden">
            <Button
              asChild
              variant="report"
              size="icon-lg"
              className="rounded-full sm:w-auto sm:px-4"
              aria-label={t('nav.report')}
            >
              <Link
                to="/report"
                search={{ segment: undefined }}
                aria-label={t('nav.report')}
                aria-current={current('/report')}
              >
                <TriangleAlert aria-hidden />
                <span className="hidden sm:inline">{t('nav.report')}</span>
              </Link>
            </Button>
            <Sheet key={pathname}>
              <SheetTrigger asChild>
                <Button
                  ref={menuTriggerRef}
                  variant="ghost"
                  size="icon-lg"
                  className="rounded-full"
                  aria-label={t('nav.menu')}
                >
                  <Menu aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(22rem,90vw)] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                  <SheetDescription className="sr-only">{t('nav.primary')}</SheetDescription>
                </SheetHeader>
                <nav aria-label={t('nav.primary')} className="flex flex-col gap-1 px-4">
                  {PRIMARY_NAV.map(({ to, label }) => (
                    <SheetClose key={to} asChild>
                      <Link
                        to={to}
                        aria-current={current(to)}
                        className={cn(
                          'rp-press inline-flex min-h-11 items-center rounded-lg px-3 text-base font-medium',
                          active === to
                            ? 'bg-raised text-foreground'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {t(label)}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <nav
                  aria-label={t('nav.more')}
                  className="mt-2 flex flex-col gap-1 border-t border-border px-4 pt-3"
                >
                  {SECONDARY_NAV.map(({ to, label }) => (
                    <SheetClose key={to} asChild>
                      <Link
                        to={to}
                        aria-current={current(to)}
                        className={cn(
                          'rp-press inline-flex min-h-11 items-center rounded-lg px-3 text-base font-medium',
                          active === to
                            ? 'bg-raised text-foreground'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {t(label)}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 pt-4 pb-6">
                  <LanguageSwitch />
                  <ThemeSwitch />
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      className="h-11 w-full rounded-full"
                      onClick={() => openLogin(menuTriggerRef.current)}
                    >
                      <UserRound aria-hidden />
                      {t('nav.login')}
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button asChild variant="report" className="h-11 w-full rounded-full font-semibold">
                      <Link
                        to="/report"
                        search={{ segment: undefined }}
                        aria-current={current('/report')}
                      >
                        <TriangleAlert aria-hidden />
                        {t('nav.report')}
                      </Link>
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <OfflineBanner />

      <nav
        aria-label={t('nav.bottom')}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md xl:hidden"
      >
        <ul className="mx-auto flex max-w-xl items-end justify-around px-2">
          {BOTTOM_NAV.map(({ to, label, icon: Icon }) => (
            <li key={to} className="flex-1">
              {to === '/report' ? (
                <Link
                  to="/report"
                  search={{ segment: undefined }}
                  aria-current={current(to)}
                  className="rp-press flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium text-foreground"
                >
                  <Icon className="size-5 text-brand-orange" />
                  {t(label)}
                </Link>
              ) : (
                <Link
                  to={to}
                  aria-current={current(to)}
                  className={cn(
                    'rp-press flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium',
                    active === to ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  <Icon className="size-5" />
                  {t(label)}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        returnFocusRef={loginReturnFocusRef}
      />
    </>
  )
}

export function SiteFooter() {
  const { t } = usePrefs()
  const items = [
    ['footer.about', '/about', undefined],
    ['footer.privacy', '/about', 'privacy'],
    ['footer.terms', '/about', 'terms'],
    ['footer.accessibility', '/about', 'accessibility'],
    ['footer.contact', '/contact', undefined],
    ['nav.myReports', '/reports', undefined],
  ] as const
  return (
    <footer data-reveal className="border-t border-border bg-card/40">
      <div className="rp-container flex flex-col gap-6 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">{t('footer.tagline')}</p>
          <p className="text-xs text-muted-foreground">{t('footer.note')}</p>
        </div>
        <nav aria-label={t('nav.footer')} className="flex flex-wrap gap-x-5 gap-y-1">
          {items.map(([key, to, hash]) => (
            <Link
              key={key}
              to={to}
              hash={hash}
              className="inline-flex min-h-11 items-center text-sm text-muted-foreground hover:text-foreground"
            >
              {t(key)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
