import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronDown,
  Menu,
  Monitor,
  Moon,
  Sun,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { OfflineBanner } from "@/components/offline-banner";
import { usePrefs } from "@/i18n/preferences";
import { cn } from "@/lib/utils";

export const PUBLIC_NAV_ITEMS = [
  { to: "/", label: "nav.home" },
  { to: "/traveller", label: "nav.traveller" },
  { to: "/map", label: "nav.map" },
  { to: "/advisories", label: "nav.advisories" },
  { to: "/help", label: "nav.help" },
] as const;

export const SECONDARY_NAV_ITEMS = [
  { to: "/about", label: "nav.about" },
  { to: "/contact", label: "nav.contact" },
  { to: "/reports", label: "nav.myReports" },
] as const;

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
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
  );
}

export function LanguageSwitch() {
  const { lang, setLang, t } = usePrefs();
  return (
    <div
      role="group"
      aria-label={t("lang.label")}
      className="inline-flex h-11 rounded-full border border-border p-0.5 text-sm"
    >
      {(["en", "hi"] as const).map((language) => (
        <button
          key={language}
          type="button"
          aria-pressed={lang === language}
          onClick={() => setLang(language)}
          lang={language}
          className={cn(
            "min-h-11 min-w-11 rounded-full px-2.5 font-medium transition-colors",
            lang === language
              ? "bg-raised text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {language === "en" ? "EN" : "हिन्दी"}
        </button>
      ))}
    </div>
  );
}

export function ThemeSwitch() {
  const { theme, setTheme, t } = usePrefs();
  const next =
    theme === "system" ? "light" : theme === "light" ? "dark" : "system";
  const label =
    next === "system"
      ? t("theme.useSystem")
      : next === "light"
        ? t("theme.light")
        : t("theme.dark");
  return (
    <Button
      variant="ghost"
      size="icon-lg"
      className="rounded-full"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={t("theme.toggle")}
    >
      {theme === "system" ? <Monitor /> : theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}

function isActive(
  to: (typeof PUBLIC_NAV_ITEMS)[number]["to"],
  pathname: string,
  view?: string,
) {
  if (to === "/") return pathname === "/";
  if (to === "/traveller")
    return pathname === "/traveller" || pathname === "/check";
  if (to === "/map")
    return pathname === "/map" || (pathname === "/check" && view !== "list");
  if (to === "/advisories") {
    return (
      pathname.startsWith("/advisories") ||
      (pathname === "/check" && view === "list")
    );
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

function PrimaryLinks({
  pathname,
  view,
  onNavigate,
  mobile = false,
}: {
  pathname: string;
  view?: string;
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  const { t } = usePrefs();
  return (
    <>
      {PUBLIC_NAV_ITEMS.map(({ to, label }) => {
        const active = isActive(to, pathname, view);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              mobile
                ? "flex min-h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                : "relative inline-flex min-h-11 items-center rounded-none px-2.5 text-sm font-medium transition-colors after:absolute after:right-2.5 after:bottom-0 after:left-2.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-brand-orange after:transition-transform",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
              !mobile && active && "after:scale-x-100",
            )}
          >
            {t(label)}
          </Link>
        );
      })}
    </>
  );
}

function SecondaryLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = usePrefs();
  return (
    <>
      {SECONDARY_NAV_ITEMS.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          className="flex min-h-11 items-center rounded-md px-3 hover:bg-accent hover:text-accent-foreground"
        >
          {t(label)}
        </Link>
      ))}
    </>
  );
}

export function SiteHeader() {
  const { t } = usePrefs();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname, view } = useRouterState({
    select: (state) => ({
      pathname: state.location.pathname,
      view: (state.location.search as { view?: string }).view,
    }),
  });

  return (
    <>
      <header className="site-header sticky top-0 z-40 border-b border-border/70 bg-background/95 text-foreground backdrop-blur-md">
        <div className="rp-container flex h-16 items-center gap-3">
          <Link
            to="/"
            className="mr-1 rounded-md"
            aria-label={`RaahPrahari — ${t("nav.home")}`}
          >
            <Logo />
          </Link>
          <nav
            aria-label={t("nav.primary")}
            className="hidden items-center gap-0.5 xl:flex"
          >
            <PrimaryLinks pathname={pathname} view={view} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="min-h-11 gap-1 px-2.5 text-sm font-medium"
                >
                  {t("nav.more")}
                  <ChevronDown aria-hidden className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {SECONDARY_NAV_ITEMS.map(({ to, label }) => (
                  <DropdownMenuItem key={to} asChild>
                    <Link to={to}>{t(label)}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <div className="hidden items-center gap-1 md:flex">
              <LanguageSwitch />
              <ThemeSwitch />
            </div>
            <Button
              asChild
              className="h-11 rounded-full px-3 font-semibold sm:px-4"
            >
              <Link
                to="/report"
                search={{ segment: undefined }}
                aria-label={t("nav.report")}
              >
                <TriangleAlert aria-hidden />
                <span className="hidden sm:inline">{t("nav.report")}</span>
              </Link>
            </Button>
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-lg"
                  className="rounded-full xl:hidden"
                  aria-label={t("nav.menu")}
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(22rem,90vw)]">
                <SheetHeader>
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    {t("nav.primary")}
                  </SheetDescription>
                </SheetHeader>
                <nav
                  aria-label={t("nav.primary")}
                  className="flex flex-col gap-1 px-4"
                >
                  <PrimaryLinks
                    pathname={pathname}
                    view={view}
                    onNavigate={() => setMenuOpen(false)}
                    mobile
                  />
                </nav>
                <Button
                  asChild
                  className="mx-4 mt-2 h-11 rounded-full font-semibold"
                >
                  <Link
                    to="/report"
                    search={{ segment: undefined }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <TriangleAlert aria-hidden />
                    {t("nav.report")}
                  </Link>
                </Button>
                <nav
                  aria-label={t("nav.more")}
                  className="flex flex-col gap-1 border-t border-border px-4 pt-3 text-sm text-muted-foreground"
                >
                  <SecondaryLinks onNavigate={() => setMenuOpen(false)} />
                </nav>
                <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border px-4 pt-3">
                  <LanguageSwitch />
                  <ThemeSwitch />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <OfflineBanner />
    </>
  );
}

export function SiteFooter() {
  const { t } = usePrefs();
  const items = [
    ["footer.about", "/about"],
    ["footer.privacy", "/about"],
    ["footer.terms", "/about"],
    ["footer.accessibility", "/about"],
    ["footer.contact", "/contact"],
    ["nav.myReports", "/reports"],
  ] as const;
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="rp-container flex flex-col gap-6 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Know before you go. ·{" "}
            <span lang="hi">सफ़र से पहले सुरक्षा की ख़बर</span>
          </p>
          <p className="text-xs text-muted-foreground">{t("footer.note")}</p>
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
  );
}
