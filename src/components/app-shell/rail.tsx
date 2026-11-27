import type { MouseEvent, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Settings,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePrefs } from "@/i18n/preferences";
import { useAccountSession } from "@/lib/account-session";
import { cn } from "@/lib/utils";
import { AccountMenu } from "./account-menu";
import {
  RAIL_NAV,
  roleNavItems,
  type ShellNavItem,
  type ShellPath,
} from "./nav";
import { ShellLogo } from "./shell-logo";
import type { ShellStatus } from "./shell-status";

function displayName(email: string | null | undefined) {
  return email ? email.split("@")[0] : "";
}

function RailItem({
  item,
  active,
  collapsed,
  onGuard,
}: {
  item: ShellNavItem;
  active: boolean;
  collapsed: boolean;
  onGuard: (to: ShellPath) => boolean;
}) {
  const { t } = usePrefs();
  const Icon = item.icon;
  const label = t(item.label);
  const link = (
    <Link
      to={item.to}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        // Signed-out taps on sign-in-only items open sign-in, then return here.
        if (item.requiresSignIn && onGuard(item.to)) event.preventDefault();
      }}
      className={cn(
        "rp-shell-transition relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium",
        collapsed && "justify-center px-0",
        active
          ? "rp-rail-active text-shell-text"
          : "text-shell-muted hover:bg-(--glass-hover) hover:text-shell-text",
      )}
    >
      {/* Glowing orange edge marks the active item (with the tinted fill). */}
      {active ? (
        <span
          aria-hidden
          data-testid="rail-active-bar"
          className="rp-rail-active-bar absolute inset-y-2 left-0 w-0.5 rounded-full"
        />
      ) : null}
      <Icon aria-hidden className="size-5 shrink-0" />
      {collapsed ? null : <span>{label}</span>}
    </Link>
  );
  if (!collapsed) return link;
  // Collapsed rail: the name is the aria-label; the tooltip shows on hover and focus.
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

/** Left rail (desktop). Sticky, full height. */
export function Rail({
  active,
  collapsed,
  onToggle,
  status,
  onGuard,
  onOpenLogin,
  onOpenSearch,
}: {
  active: ShellPath | null;
  collapsed: boolean;
  onToggle: () => void;
  status: ShellStatus;
  onGuard: (to: ShellPath) => boolean;
  onOpenLogin: () => void;
  onOpenSearch: () => void;
}) {
  const { t, lang, setLang } = usePrefs();
  const session = useAccountSession();
  const signedIn = session.status === "authenticated";
  const items: ShellNavItem[] = [
    ...RAIL_NAV,
    ...(session.status === "authenticated" ? roleNavItems(session.role) : []),
  ];
  const name = signedIn ? displayName(session.email) : "";
  const initial = (name || "?").charAt(0).toUpperCase();

  const avatarButton: ReactNode = (
    <button
      type="button"
      aria-label={t("shell.accountMenu")}
      // Profile row: a glass button with the avatar, name and a chevron.
      className={cn(
        "glass flex min-h-11 w-full items-center gap-3 rounded-md px-1.5 text-left text-sm text-shell-text",
        collapsed && "justify-center px-0",
      )}
    >
      <span
        aria-hidden
        className="grid size-8 shrink-0 place-items-center rounded-full bg-(--glass-hover) font-semibold"
      >
        {initial}
      </span>
      {collapsed ? null : (
        <>
          <span className="min-w-0 flex-1 truncate">
            {name || t("nav.account")}
          </span>
          <ChevronDown aria-hidden className="mr-1.5 size-4 shrink-0 text-shell-muted" />
        </>
      )}
    </button>
  );

  return (
    <nav
      aria-label={t("nav.primary")}
      data-testid="shell-rail"
      data-collapsed={collapsed}
      // A floating glass panel: inset 16px from the viewport edges inside a
      // sticky full-height column (the column is 2rem wider than the panel).
      className={cn(
        "rp-shell rp-shell-transition sticky top-0 hidden h-svh shrink-0 p-4 text-shell-text lg:flex",
        collapsed
          ? "w-[calc(var(--shell-rail-collapsed)+2rem)]"
          : "w-[calc(var(--shell-rail-expanded)+2rem)]",
      )}
    >
      <div
        data-testid="shell-rail-panel"
        className="glass-strong flex min-h-0 w-full flex-col overflow-hidden rounded-3xl"
      >
      <div
        className={cn(
          "flex h-14 items-center border-b border-(--glass-divider) px-3",
          collapsed && "justify-center px-0",
        )}
      >
        <ShellLogo showWordmark={!collapsed} />
      </div>

      <ul className="m-0 flex flex-1 list-none flex-col gap-1 overflow-y-auto p-2">
        {items.map((item) => (
          <li key={item.to}>
            <RailItem
              item={item}
              active={active === item.to}
              collapsed={collapsed}
              onGuard={onGuard}
            />
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 border-t border-(--glass-divider) p-2">
        <Button
          type="button"
          variant="ghost"
          aria-label={collapsed ? t("shell.expand") : t("shell.collapse")}
          aria-expanded={!collapsed}
          onClick={onToggle}
          className={cn(
            "min-h-11 justify-start gap-3 px-3 text-shell-muted",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? (
            <ChevronsRight aria-hidden className="size-5" />
          ) : (
            <>
              <ChevronsLeft aria-hidden className="size-5" />
              <span className="text-sm">{t("shell.collapse")}</span>
            </>
          )}
        </Button>

        {signedIn ? (
          <AccountMenu
            status={status}
            trigger={avatarButton}
            onOpenSearch={onOpenSearch}
          />
        ) : (
          <div
            className={cn("flex flex-col gap-2", collapsed && "items-center")}
          >
            <Button
              type="button"
              variant="outline"
              aria-label={collapsed ? t("nav.login") : undefined}
              onClick={onOpenLogin}
              className={cn(
                "min-h-11 w-full gap-2 rounded-xl border-(--glass-line) bg-transparent text-shell-text hover:bg-(--glass-hover) dark:bg-transparent dark:hover:bg-(--glass-hover)",
                collapsed && "w-11 px-0",
              )}
            >
              <UserRound aria-hidden className="size-5" />
              {collapsed ? null : t("nav.login")}
            </Button>
            <div className="flex flex-wrap items-center gap-1">
              <div
                role="group"
                aria-label={t("lang.label")}
                className="flex gap-1"
              >
                {(["en", "hi"] as const).map((language) => (
                  <button
                    key={language}
                    type="button"
                    lang={language}
                    aria-pressed={lang === language}
                    onClick={() => setLang(language)}
                    className={cn(
                      "rp-shell-transition min-h-11 min-w-11 rounded-md px-2 text-sm font-medium",
                      lang === language
                        ? "bg-(--glass-hover) text-shell-text"
                        : "text-shell-muted hover:text-shell-text",
                    )}
                  >
                    {language === "en" ? "EN" : "हिन्दी"}
                  </button>
                ))}
              </div>
              {/* Theme and the other settings stay reachable when signed out. */}
              <AccountMenu
                status={status}
                onOpenSearch={onOpenSearch}
                trigger={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t("shell.settings")}
                    className="text-shell-muted"
                  >
                    <Settings aria-hidden />
                  </Button>
                }
              />
            </div>
          </div>
        )}
      </div>
      </div>
    </nav>
  );
}
