import { Link, useRouterState } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { House, ListChecks, Map, Menu, Monitor, Moon, Search, Sun, TriangleAlert, UserRound } from 'lucide-react'
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { usePrefs } from '@/i18n/preferences'
import { OfflineBanner } from '@/components/offline-banner'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 32 32" aria-hidden className="size-8 shrink-0">
        <rect width="32" height="32" rx="8" fill="#111719" />
        <path d="M4 23 L12 11 L16 16 L20 9 L28 23 Z" fill="#30363A" />
        <path d="M20 9 L23 13.5 L21 13 L19.5 14.5 L18 12 Z" fill="#E6E4DC" />
        <path d="M10 28 C13 23 19 22 16 17 C14.5 14.5 18 12.5 20 12" fill="none" stroke="#EB5B38" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span className="font-display text-lg font-bold tracking-tight">
        Raah<span className="text-brand-orange">Prahari</span>
      </span>
    </span>
  )
}

function LangSwitch() {
  const { lang, setLang, t } = usePrefs()
  return (
    <div role="group" aria-label={t('lang.label')} className="inline-flex h-11 rounded-full border border-border p-0.5 text-sm">
      {(['en', 'hi'] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          lang={l}
          className={cn(
            'min-h-11 min-w-11 rounded-full px-2.5 font-medium transition-colors',
            lang === l ? 'bg-raised text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {l === 'en' ? 'EN' : 'हिन्दी'}
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
      onClick={() => setTheme(next)}
      aria-label={label}
      title={t('theme.toggle')}
    >
      {theme === 'system' ? <Monitor /> : theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}

function LoginDialog({
  open,
  onOpenChange,
  returnFocusRef,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
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

export function SiteHeader() {
  const { t } = usePrefs()
  const [loginOpen, setLoginOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const loginReturnFocusRef = useRef<HTMLButtonElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)
  const { pathname, view } = useRouterState({
    select: (s) => ({
      pathname: s.location.pathname,
      view: (s.location.search as { view?: string }).view,
    }),
  })

  const linkClass = (active: boolean) =>
    cn(
      'relative inline-flex min-h-11 items-center rounded-none px-3.5 text-sm font-medium transition-colors after:absolute after:right-3 after:bottom-0 after:left-3 after:h-0.5 after:origin-left after:scale-x-0 after:bg-brand-orange after:transition-transform',
      active ? 'text-foreground after:scale-x-100' : 'text-muted-foreground hover:text-foreground',
    )
  const current = (active: boolean) => (active ? ('page' as const) : undefined)
  const isMap = pathname === '/map' || (pathname === '/check' && view !== 'list')
  const isList = pathname === '/advisories' || pathname === '/advisories/' || pathname.startsWith('/advisories/') || (pathname === '/check' && view === 'list')
  const isHome = pathname === '/'
  const isTraveller = pathname === '/traveller'

  const navLinks = (onClick?: () => void) => (
    <>
      <Link to="/" onClick={onClick} aria-current={current(pathname === '/')} className={linkClass(pathname === '/')}>
        {t('nav.home')}
      </Link>
      <Link to="/map" onClick={onClick} aria-current={current(isMap)} className={linkClass(isMap)}>
        {t('nav.map')}
      </Link>
      <Link to="/advisories" onClick={onClick} aria-current={current(isList)} className={linkClass(isList)}>
        {t('nav.advisories')}
      </Link>
      {isHome || isTraveller ? (
        <Link to="/about" onClick={onClick} className={linkClass(false)}>
          {t('nav.about')}
        </Link>
      ) : (
        <>
          <Link to="/traveller" onClick={onClick} aria-current={current(pathname === '/traveller')} className={linkClass(pathname === '/traveller')}>
            {t('nav.traveller')}
          </Link>
          <Link to="/help" onClick={onClick} aria-current={current(pathname === '/help')} className={linkClass(pathname === '/help')}>
            {t('nav.help')}
          </Link>
        </>
      )}
      <Link to="/official" onClick={onClick} aria-current={current(pathname === '/official')} className={linkClass(pathname === '/official')}>
        Official
      </Link>
    </>
  )

  return (
    <>
      <header className={cn(
        'sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md',
        isHome && 'home-header',
        isTraveller && 'traveller-header',
      )}>
        <div className="rp-container flex h-16 items-center gap-3">
          <Link to="/" className="mr-2 rounded-md" aria-label="RaahPrahari — home">
            <span className={cn('home-brand', isTraveller && 'traveller-brand', !isHome && !isTraveller && 'hidden')}>
              <Logo />
              <span lang="hi">सफ़र से पहले सुरक्षा की ख़बर</span>
            </span>
            <span className={cn((isHome || isTraveller) && 'hidden')}>
              <Logo />
            </span>
          </Link>
          <nav aria-label={t('nav.primary')} className="hidden items-center gap-0.5 lg:flex">
            {navLinks()}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="hidden items-center gap-1.5 md:flex">
              {isHome || isTraveller ? <HomeLanguageSelect /> : <LangSwitch />}
              {!isHome && !isTraveller && <ThemeSwitch />}
              <Button
                ref={loginReturnFocusRef}
                variant={isHome ? 'outline' : 'ghost'}
                className={cn('h-10 rounded-full', isHome && 'home-login-button')}
                onClick={(event) => {
                  loginReturnFocusRef.current = event.currentTarget
                  setLoginOpen(true)
                }}
              >
                <UserRound />
                {t('nav.login')}
              </Button>
            </div>
            {!isHome && !isTraveller && (
              <Button asChild className="h-10 rounded-full px-4 font-semibold">
                <Link to="/report" search={{ segment: undefined }}>
                  <TriangleAlert />
                  <span className="hidden sm:inline">{t('nav.report')}</span>
                  <span className="sr-only sm:hidden">{t('hero.report')}</span>
                </Link>
              </Button>
            )}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  ref={menuTriggerRef}
                  variant="ghost"
                  size="icon-lg"
                  className="rounded-full lg:hidden"
                  aria-label={t('nav.menu')}
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(20rem,90vw)]">
                <SheetHeader>
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                  <SheetDescription className="sr-only">{t('nav.primary')}</SheetDescription>
                </SheetHeader>
                <nav aria-label={t('nav.primary')} className="flex flex-col gap-1 px-4">
                  {navLinks(() => setMenuOpen(false))}
                </nav>
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border px-4 pt-4">
                  {isHome || isTraveller ? <HomeLanguageSelect /> : <LangSwitch />}
                  {!isHome && !isTraveller && <ThemeSwitch />}
                  <Button
                    variant="outline"
                    className="h-11 w-full rounded-full"
                    onClick={() => {
                      loginReturnFocusRef.current = menuTriggerRef.current
                      setMenuOpen(false)
                      setLoginOpen(true)
                    }}
                  >
                    <UserRound />
                    {t('nav.login')}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <OfflineBanner />
      <nav
        aria-label={t('nav.primary')}
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 px-1 pt-1 pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur-md lg:hidden',
          (isHome || isTraveller) && 'hidden',
        )}
      >
        {([
          { to: '/', label: 'nav.home', icon: House, active: pathname === '/', raised: false },
          { to: '/traveller', label: 'nav.traveller', icon: Search, active: pathname === '/traveller', raised: false },
          { to: '/report', label: 'nav.report', icon: TriangleAlert, active: pathname.startsWith('/report'), raised: true },
          { to: '/map', label: 'nav.map', icon: Map, active: isMap, raised: false },
          { to: '/advisories', label: 'nav.advisories', icon: ListChecks, active: isList, raised: false },
        ] as const).map(({ to, label, icon: Icon, active, raised }) => (
          <Link
            key={to}
            to={to}
            aria-current={current(active)}
            className={cn(
              'flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-lg text-[11px] font-medium',
              raised && '-mt-4',
              active ? 'text-link' : 'text-muted-foreground',
            )}
          >
            <Icon
              aria-hidden
              className={cn(
                'size-5',
                raised &&
                  '-mt-1 size-12 rounded-full border-4 border-background bg-brand-orange p-2.5 text-[#111719] shadow-lg',
              )}
            />
            <span>{t(label)}</span>
          </Link>
        ))}
      </nav>
      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        returnFocusRef={loginReturnFocusRef}
      />
    </>
  )
}

function HomeLanguageSelect() {
  const { lang, setLang, t } = usePrefs()
  return (
    <label className="home-language-control">
      <span className="sr-only">{t('lang.label')}</span>
      <select value={lang} onChange={(event) => setLang(event.target.value as 'en' | 'hi')} aria-label={t('lang.label')}>
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
      </select>
    </label>
  )
}

export function SiteFooter() {
  const { t } = usePrefs()
  const items = [
    ['footer.about', '/about'],
    ['footer.privacy', '/about'],
    ['footer.terms', '/about'],
    ['footer.accessibility', '/about'],
    ['footer.contact', '/contact'],
  ] as const
  return (
    <footer className="border-t border-border bg-card/40 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <div className="rp-container flex flex-col gap-6 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Know before you go. · <span lang="hi">सफ़र से पहले सुरक्षा की ख़बर</span>
          </p>
          <p className="text-xs text-muted-foreground">{t('footer.note')}</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-1">
          {items.map(([key, to]) => (
            <Link
              key={key}
              to={to}
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
