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
} from 'lucide-react'
import { crossFadeTheme, useScrolled } from '@/components/motion'
import { OfflineBanner } from '@/components/offline-banner'
import { Button } from '@/components/ui/button'
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
import { Logo } from '@/components/logo'
import { usePrefs } from '@/i18n/preferences'
import { useAccountSession } from '@/lib/account-session'
import { cn } from '@/lib/utils'

function LanguageSwitch() {
  const { lang, setLang, t } = usePrefs()
  return (
    <div
      role="group"
      aria-label={t('lang.label')}
      className="rp-lang inline-flex h-10 shrink-0 items-center gap-0.5 rounded-full border border-border p-0.5 text-sm whitespace-nowrap"
    >
      {(['en', 'hi'] as const).map((language) => (
        <button
          key={language}
          type="button"
          aria-pressed={lang === language}
          onClick={() => setLang(language)}
          lang={language}
          className={cn(
            'rp-press rp-lang-btn inline-flex h-8 min-h-8 min-w-10 items-center justify-center rounded-full px-2.5 text-sm font-medium whitespace-nowrap',
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

// Deferred navigation (VA-16). These are hidden, not faked, until they work:
// - Community Login: no sign-in provider exists in this build. The old button
//   only opened a "not available yet" dialog. Restore it with real auth.
// - Official (/official): the publishing service it posts to does not exist
//   (see /status). The route stays reachable directly for development.
// - My Reports (/reports): it needs a signed-in account, so it is listed only
//   while a session exists.

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
  { to: '/', label: 'nav.home', icon: House, raised: false },
  { to: '/traveller', label: 'nav.traveller', icon: Search, raised: false },
  { to: '/report', label: 'nav.report', icon: TriangleAlert, raised: true },
  { to: '/map', label: 'nav.map', icon: Map, raised: false },
  { to: '/advisories', label: 'nav.advisories', icon: ListChecks, raised: false },
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

/** Secondary links available now. My Reports appears only with a session. */
function useSecondaryNav() {
  const signedIn = useAccountSession().status === 'authenticated'
  return SECONDARY_NAV.filter(({ to }) => to !== '/reports' || signedIn)
}

export function SiteHeader() {
  const { t } = usePrefs()
  const secondaryNav = useSecondaryNav()
  const scrolled = useScrolled()
  const { pathname, view } = useRouterState({
    select: (state) => ({
      pathname: state.location.pathname,
      view: (state.location.search as { view?: string }).view,
    }),
  })
  const active = activeNavTarget(pathname, view)
  const current = (to: NavTarget) => (active === to ? ('page' as const) : undefined)

  return (
    <>
      <header
        data-scrolled={scrolled}
        className="rp-header sticky top-0 z-(--z-header) border-b border-border/70 bg-background/90 backdrop-blur-md"
      >
        <div className="rp-container flex h-16 min-w-0 items-center gap-3">
          <Logo />

          <nav aria-label={t('nav.primary')} className="hidden min-w-0 items-center gap-0.5 xl:flex">
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
                    secondaryNav.some(({ to }) => active === to)
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                  )}
                  aria-current={
                    secondaryNav.some(({ to }) => active === to) ? 'page' : undefined
                  }
                >
                  {t('nav.more')}
                  <ChevronDown aria-hidden className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {secondaryNav.map(({ to, label }) => (
                  <DropdownMenuItem key={to} asChild>
                    <Link to={to} aria-current={current(to)}>
                      {t(label)}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="ml-auto hidden min-w-0 shrink-0 items-center gap-3 xl:flex">
            <LanguageSwitch />
            <ThemeSwitch />
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
                  variant="ghost"
                  size="icon-lg"
                  className="rounded-full xl:hidden"
                  aria-label={t('nav.menu')}
                >
                  <Menu aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="max-h-dvh w-[min(22rem,90vw)] overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]"
              >
                <SheetHeader className="gap-0 py-3 pr-16 pl-4">
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
                  {secondaryNav.map(({ to, label }) => (
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
        className="fixed inset-x-0 bottom-0 z-(--z-bottom-nav) border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md xl:hidden"
      >
        <ul className="mx-auto flex max-w-xl items-end justify-around px-2">
          {BOTTOM_NAV.map(({ to, label, icon: Icon, raised }) => (
            <li key={to} className="flex-1">
              {to === '/report' ? (
                <Link
                  to="/report"
                  search={{ segment: undefined }}
                  aria-current={current(to)}
                  className="rp-press flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium text-foreground"
                >
                  <Icon className={cn('size-5', raised && 'text-brand-orange')} />
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
    </>
  )
}

const FOOTER_LINKS = [
  ['footer.about', '/about', undefined],
  ['footer.privacy', '/about', 'privacy'],
  ['footer.terms', '/about', 'terms'],
  ['footer.accessibility', '/about', 'accessibility'],
  ['footer.contact', '/contact', undefined],
  ['nav.myReports', '/reports', undefined],
  ['footer.contributions', '/contributions', undefined],
  ['footer.status', '/status', undefined],
] as const

export function SiteFooter() {
  const { t } = usePrefs()
  const signedIn = useAccountSession().status === 'authenticated'
  const items = FOOTER_LINKS.filter(([, to]) => to !== '/reports' || signedIn)
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