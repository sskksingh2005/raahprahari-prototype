import { type MouseEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Search, TriangleAlert, UserRound } from "lucide-react";
import { useScrolled } from "@/components/motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TranslationKey } from "@/i18n/dictionary";
import { usePrefs } from "@/i18n/preferences";
import type { Lang } from "@/lib/app-store";
import { useAccountSession } from "@/lib/account-session";
import { cn } from "@/lib/utils";
import { AccountMenu, ITEM } from "./account-menu";
import { TAB_NAV, type ShellPath } from "./nav";
import { ShellLogo } from "./shell-logo";
import { StatusChip, type ShellStatus } from "./shell-status";

/** The one orange element in the shell. Colours come from the report tokens. */
function ReportButton({ className }: { className?: string }) {
  const { t } = usePrefs();
  return (
    <Button
      asChild
      variant="report"
      className={cn("min-h-11 gap-2 rounded-xl px-4 font-semibold", className)}
    >
      <Link to="/report" search={{ segment: undefined }}>
        <TriangleAlert aria-hidden />
        {t("shell.reportHazard")}
      </Link>
    </Button>
  );
}

/** Desktop top bar (56px): flexible space, status chip, report. */
export function DesktopTopBar({ status }: { status: ShellStatus }) {
  // Clear over the page at the top; frosted glass once content scrolls under it.
  const scrolled = useScrolled(4);

  return (
    <header
      data-testid="shell-topbar"
      // Sticky from 1024px so page content scrolls under the glass. Its
      // height is --shell-bar-height; sticky page panels sit below it.
      data-scrolled={scrolled}
      className="rp-shell rp-topbar sticky top-0 z-(--z-header) flex h-14 shrink-0 items-center gap-3 border-b px-4 text-shell-text max-lg:hidden"
    >
      <div className="flex-1" />
      <StatusChip status={status} />
      <ReportButton />
    </header>
  );
}

/** Mobile top bar (56px): logo, search icon, language, status dot, avatar. */
export function MobileTopBar({
  status,
  section,
  onOpenLogin,
  onOpenSearch,
}: {
  status: ShellStatus;
  /** Label of the current section, from sectionLabel(). */
  section: TranslationKey | null;
  onOpenLogin: () => void;
  onOpenSearch: () => void;
}) {
  const { t, lang, setLang } = usePrefs();
  const session = useAccountSession();
  const signedIn = session.status === "authenticated";
  const initial = (
    session.status === "authenticated" && session.email ? session.email : "?"
  )
    .charAt(0)
    .toUpperCase();

  return (
    <header
      data-testid="shell-mobilebar"
      // Clear over the backdrop photo: the logo, wordmark and controls sit on
      // it directly (they use --shell-text, which passes on the overlay).
      className="rp-shell flex h-14 shrink-0 items-center gap-1 px-3 text-shell-text lg:hidden"
    >
      {/* At 360px the controls on the right need about 200px, so the logo is
          the part that gives way: the wordmark is smaller below 640px, hidden
          below 390px (the mark and the link's accessible name stay), and
          truncates rather than push the account button off screen. */}
      <ShellLogo
        className="min-w-0 shrink"
        wordmarkClassName="min-w-0 truncate max-sm:text-base max-390:hidden"
      />
      {/* The section you are in. Visible from 640px; below that the bar has no
          room beside the wordmark, so it is announced but not shown. */}
      {section ? (
        <p
          data-testid="shell-section"
          className="m-0 min-w-0 truncate font-display text-base font-semibold max-sm:sr-only"
        >
          <span className="sr-only">{t("nav.section")}: </span>
          {t(section)}
        </p>
      ) : null}
      <div className="flex-1" />
      <Button
        asChild
        variant="ghost"
        size="icon"
        aria-label={t("shell.checkRoad")}
        className="shrink-0 text-shell-text"
      >
        <Link to="/traveller">
          <Search aria-hidden />
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={t("shell.language")}
            className="rp-shell-transition inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1 rounded-md px-2 text-sm font-medium text-shell-text hover:bg-shell-surface"
          >
            {lang === "en" ? "EN" : "हिन्दी"}
            {/* Decorative; dropped below 640px to save 20px. The button keeps
                its "Language" name and still opens the menu. */}
            <ChevronDown aria-hidden className="size-4 max-sm:hidden" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="rp-shell text-shell-text"
        >
          <DropdownMenuRadioGroup
            value={lang}
            onValueChange={(value) => setLang(value as Lang)}
          >
            <DropdownMenuRadioItem value="en" className={ITEM}>
              English
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="hi" lang="hi" className={ITEM}>
              हिन्दी
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <StatusChip status={status} compact />
      {signedIn ? (
        <AccountMenu
          status={status}
          onOpenSearch={onOpenSearch}
          pageLinks
          trigger={
            <button
              type="button"
              aria-label={t("shell.accountMenu")}
              className="rp-shell-transition grid min-h-11 min-w-11 shrink-0 place-items-center rounded-full text-shell-text hover:bg-shell-surface"
            >
              <span
                aria-hidden
                className="grid size-8 place-items-center rounded-full bg-shell-raised text-sm font-semibold"
              >
                {initial}
              </span>
            </button>
          }
        />
      ) : (
        // Signed out: the same menu (theme, language, about) plus Community Login.
        // Page links too, so Contributions, Advisories and Help stay reachable.
        <AccountMenu
          status={status}
          onOpenLogin={onOpenLogin}
          onOpenSearch={onOpenSearch}
          pageLinks
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("shell.accountMenu")}
              className="shrink-0 text-shell-text"
            >
              <UserRound aria-hidden />
            </Button>
          }
        />
      )}
    </header>
  );
}

/** Mobile bottom tabs. Fixed, with the safe-area inset below. */
export function BottomTabs({
  active,
  onGuard,
}: {
  active: ShellPath | null;
  onGuard: (to: ShellPath) => boolean;
}) {
  const { t } = usePrefs();
  return (
    <nav
      aria-label={t("nav.primary")}
      data-testid="shell-tabs"
      className="rp-shell glass-strong fixed inset-x-0 bottom-0 z-(--z-bottom-nav) rounded-t-3xl border-x-0 border-b-0 pb-[env(safe-area-inset-bottom)] text-shell-text lg:hidden"
    >
      <ul className="m-0 flex h-16 list-none items-end justify-around p-0 px-1">
        {TAB_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.to;
          const label = t(item.label);
          if (item.primaryAction) {
            return (
              <li key={item.to} className="flex flex-1 justify-center">
                <Link
                  to="/report"
                  search={{ segment: undefined }}
                  aria-label={t("shell.reportAHazard")}
                  aria-current={isActive ? "page" : undefined}
                  className="-mt-5 grid size-14 place-items-center self-start rounded-full bg-report text-report-foreground shadow-sm"
                >
                  <Icon aria-hidden className="size-7" />
                </Link>
              </li>
            );
          }
          return (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                aria-current={isActive ? "page" : undefined}
                onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                  if (item.requiresSignIn && onGuard(item.to))
                    event.preventDefault();
                }}
                // Every label uses --shell-text: on glass over any page content
                // the muted grey would drop below AA. The current tab is shown
                // by a 2px bar and semibold text, not by colour alone.
                className={cn(
                  "rp-shell-transition relative flex min-h-14 min-w-11 flex-col items-center justify-center gap-0.5 text-xs text-shell-text",
                  isActive ? "font-semibold" : "font-medium",
                )}
              >
                {isActive ? (
                  <span
                    aria-hidden
                    data-testid="tab-active-bar"
                    className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-shell-active-bar"
                  />
                ) : null}
                <Icon aria-hidden className="size-5" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
