import {
  Award,
  BookOpen,
  CircleHelp,
  ClipboardCheck,
  House,
  ListChecks,
  Map,
  Megaphone,
  Plus,
  Search,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { TranslationKey } from "@/i18n/dictionary";

/** Every path the shell links to. All of these routes already exist. */
export type ShellPath =
  | "/"
  | "/traveller"
  | "/map"
  | "/advisories"
  | "/reports"
  | "/contributions"
  | "/help"
  | "/review"
  | "/official"
  | "/report"
  | "/profile";

export interface ShellNavItem {
  to: ShellPath;
  label: TranslationKey;
  icon: LucideIcon;
  /** Needs a signed-in account; signed-out taps open sign-in first. */
  requiresSignIn?: boolean;
}

/** Desktop rail, in order. */
export const RAIL_NAV: readonly ShellNavItem[] = [
  { to: "/", label: "nav.home", icon: House },
  { to: "/traveller", label: "shell.checkRoad", icon: Search },
  { to: "/map", label: "shell.liveMap", icon: Map },
  { to: "/advisories", label: "nav.advisories", icon: ListChecks },
  {
    to: "/reports",
    label: "shell.myReports",
    icon: BookOpen,
    requiresSignIn: true,
  },
  { to: "/contributions", label: "nav.contributions", icon: Award },
  { to: "/help", label: "nav.help", icon: CircleHelp },
];

const REVIEW_ITEM: ShellNavItem = {
  to: "/review",
  label: "shell.reviewQueue",
  icon: ClipboardCheck,
};
const OFFICIAL_ITEM: ShellNavItem = {
  to: "/official",
  label: "shell.officialUpdates",
  icon: Megaphone,
};

/**
 * Role-based extra rail items. The role is only read from the session (set
 * server-side); an unknown or missing role shows neither item. The UI never
 * grants or chooses a role, and the backend still enforces access.
 */
export function roleNavItems(role: string | null | undefined): ShellNavItem[] {
  if (role === "reviewer") return [REVIEW_ITEM];
  if (role === "official") return [OFFICIAL_ITEM];
  return [];
}

/** Mobile bottom tabs, in order. The centre item is the raised report action. */
export const TAB_NAV: readonly (ShellNavItem & { primaryAction?: true })[] = [
  { to: "/", label: "nav.home", icon: House },
  { to: "/map", label: "shell.tabMap", icon: Map },
  { to: "/report", label: "shell.tabReport", icon: Plus, primaryAction: true },
  {
    to: "/reports",
    label: "shell.tabReports",
    icon: BookOpen,
    requiresSignIn: true,
  },
  {
    to: "/profile",
    label: "shell.tabProfile",
    icon: UserRound,
    requiresSignIn: true,
  },
];

/** Which shell item is current for a URL. `view` is the /check view search param. */
export function activeNavTarget(
  pathname: string,
  view?: string,
): ShellPath | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const under = (base: string) => path === base || path.startsWith(`${base}/`);
  if (path === "/") return "/";
  if (path === "/traveller") return "/traveller";
  if (path === "/map" || (path === "/check" && view !== "list")) return "/map";
  if (under("/advisories") || path === "/check") return "/advisories";
  if (under("/help")) return "/help";
  if (under("/reports")) return "/reports";
  if (under("/report")) return "/report";
  if (under("/review")) return "/review";
  if (under("/official")) return "/official";
  if (path === "/profile") return "/profile";
  if (path === "/contributions") return "/contributions";
  return null;
}

/**
 * The mobile top bar names the section you are in; pages keep their own h1.
 * Ported from the previous site chrome's sectionLabel(): the current shell
 * item's label, plus a few routes that have no item of their own.
 */
export function sectionLabel(
  pathname: string,
  active: ShellPath | null,
): TranslationKey | null {
  const item = [...RAIL_NAV, REVIEW_ITEM, OFFICIAL_ITEM, ...TAB_NAV].find(
    ({ to }) => to === active,
  );
  if (item) return item.label;
  if (pathname.startsWith("/status")) return "footer.status";
  if (pathname.startsWith("/review")) return "review.title";
  if (pathname.startsWith("/official")) return "official.title";
  if (pathname.startsWith("/profile")) return "nav.account";
  return null;
}

export const RAIL_COLLAPSED_KEY = "rp.rail.collapsed";
export const BANNER_DISMISSED_KEY = "rp.shell.bannerDismissed";
