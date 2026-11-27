import { forwardRef } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PreferencesProvider } from "@/i18n/preferences";
import { setAccountSession, type AccountSession } from "@/lib/account-session";
import { localDb } from "@/lib/local-db";
import { setSyncState } from "@/lib/sync/sync-state";
import { AppShell } from "./app-shell";
import { RAIL_COLLAPSED_KEY, activeNavTarget, roleNavItems } from "./nav";
import {
  ShellStatusBanner,
  StatusChip,
  bannerSignature,
  chipState,
  type ShellStatus,
} from "./shell-status";

// The mocked router reads this, so a test can pick the current route.
const route = vi.hoisted(() => ({
  pathname: "/",
  search: {} as Record<string, unknown>,
}));
const navigate = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/react-router")>();
  const MockLink = forwardRef<
    HTMLAnchorElement,
    React.ComponentProps<"a"> & { to?: string; search?: unknown; hash?: string }
  >((props, ref) => {
    const { to = "#", search, hash, ...anchor } = props;
    void search;
    void hash;
    return <a ref={ref} href={to} {...anchor} />;
  });
  MockLink.displayName = "MockLink";
  return {
    ...actual,
    Link: MockLink,
    useNavigate: () => navigate,
    useRouterState: ({ select }: { select: (s: unknown) => unknown }) =>
      select({ location: { ...route } }),
  };
});

const SIGNED_OUT: AccountSession = { status: "signed_out", userId: null };
const signedIn = (role?: string | null): AccountSession => ({
  status: "authenticated",
  userId: "u1",
  email: "asha@example.com",
  role: role ?? null,
});

function mount() {
  return render(
    <PreferencesProvider>
      <TooltipProvider>
        <AppShell>
          <p>page body</p>
        </AppShell>
      </TooltipProvider>
    </PreferencesProvider>,
  );
}

const rail = () => screen.getAllByRole("navigation", { name: "Primary" })[0];
const tabs = () => screen.getByTestId("shell-tabs");

function setOnline(value: boolean) {
  Object.defineProperty(navigator, "onLine", { configurable: true, value });
}

beforeEach(() => {
  route.pathname = "/";
  route.search = {};
  navigate.mockReset();
  setOnline(true);
  setAccountSession(SIGNED_OUT);
  setSyncState({
    lastResult: null,
    lastSuccessfulSyncAt: null,
    running: false,
  });
  window.localStorage.clear();
  window.sessionStorage.clear();
});

afterEach(async () => {
  vi.unstubAllGlobals();
  cleanup();
  setAccountSession(SIGNED_OUT);
  await localDb.outbox.clear();
});

describe("active item", () => {
  it("marks exactly the current rail item with aria-current=page", () => {
    route.pathname = "/advisories/nh7-06";
    mount();
    const current = within(rail())
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(current.map((link) => link.textContent)).toEqual(["Advisories"]);
    // The rail marks it with the 2px edge bar as well as the attribute.
    expect(
      within(current[0]).getByTestId("rail-active-bar"),
    ).toBeInTheDocument();
  });

  it("marks the current bottom tab with a bar and weight as well as aria-current", () => {
    route.pathname = "/map";
    mount();
    const bars = within(tabs()).getAllByTestId("tab-active-bar");
    expect(bars).toHaveLength(1);
    const link = bars[0].closest("a")!;
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveTextContent("Map");
    expect(link).toHaveClass("font-semibold", "text-shell-text");
  });

  it("marks the current bottom tab, including the centre report action", () => {
    route.pathname = "/report/review";
    mount();
    const current = within(tabs())
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(current.map((link) => link.getAttribute("aria-label"))).toEqual([
      "Report a hazard",
    ]);

    cleanup();
    route.pathname = "/map";
    mount();
    expect(within(tabs()).getByRole("link", { name: "Map" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("maps routes, including pages that live in menus, to a shell item", () => {
    expect(activeNavTarget("/")).toBe("/");
    expect(activeNavTarget("/advisories/RP-418203")).toBe("/advisories");
    expect(activeNavTarget("/help/freshness")).toBe("/help");
    expect(activeNavTarget("/report/review")).toBe("/report");
    expect(activeNavTarget("/reports/abc")).toBe("/reports");
    expect(activeNavTarget("/check", "list")).toBe("/advisories");
    expect(activeNavTarget("/check")).toBe("/map");
    expect(activeNavTarget("/review/RP-1")).toBe("/review");
    expect(activeNavTarget("/official")).toBe("/official");
    expect(activeNavTarget("/profile")).toBe("/profile");
    // Account-menu pages have no rail item.
    expect(activeNavTarget("/contact")).toBeNull();
    expect(activeNavTarget("/no-such-page")).toBeNull();
  });
});

describe("sign-in only destinations", () => {
  it("opens sign-in for a signed-out tap on Reports, then returns to /reports", async () => {
    const user = userEvent.setup();
    mount();
    await user.click(within(rail()).getByRole("link", { name: "My reports" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName("Community login");
    expect(navigate).not.toHaveBeenCalled();

    // Sign-in succeeds (the real flow sets this after Supabase returns a session).
    act(() => setAccountSession(signedIn()));
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({ to: "/reports" }),
    );
  });

  it("does the same for the Profile tab", async () => {
    const user = userEvent.setup();
    mount();
    await user.click(within(tabs()).getByRole("link", { name: "Profile" }));
    expect(await screen.findByRole("dialog")).toHaveAccessibleName(
      "Community login",
    );
    act(() => setAccountSession(signedIn()));
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({ to: "/profile" }),
    );
  });

  it("does not navigate if sign-in is closed without a session", async () => {
    const user = userEvent.setup();
    mount();
    await user.click(within(tabs()).getByRole("link", { name: "Reports" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    act(() => setAccountSession(signedIn()));
    expect(navigate).not.toHaveBeenCalled();
  });

  it("does not interrupt a signed-in visitor", async () => {
    setAccountSession(signedIn());
    const user = userEvent.setup();
    mount();
    const link = within(rail()).getByRole("link", { name: "My reports" });
    // The click is not cancelled and no sign-in dialog opens.
    const notCancelled = fireEvent.click(link);
    expect(notCancelled).toBe(true);
    expect(screen.queryByRole("dialog")).toBeNull();
    void user;
  });
});

describe("rail collapse", () => {
  it("collapses, keeps names and survives a reload", async () => {
    const user = userEvent.setup();
    const first = mount();
    const toggle = screen.getByRole("button", { name: "Collapse navigation" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("shell-rail")).toHaveAttribute(
      "data-collapsed",
      "false",
    );

    await user.click(toggle);
    expect(screen.getByTestId("shell-rail")).toHaveAttribute(
      "data-collapsed",
      "true",
    );
    expect(within(rail()).queryByRole("search")).toBeNull();
    expect(
      within(rail()).getByRole("link", { name: "Search road or place" }),
    ).toHaveAttribute("href", "/traveller");
    expect(window.localStorage.getItem(RAIL_COLLAPSED_KEY)).toBe("true");
    // Icon-only, but every item keeps an accessible name.
    expect(
      within(rail()).getByRole("link", { name: "Live map" }),
    ).toBeInTheDocument();

    // "Reload": a fresh mount reads the saved choice.
    first.unmount();
    mount();
    await waitFor(() =>
      expect(screen.getByTestId("shell-rail")).toHaveAttribute(
        "data-collapsed",
        "true",
      ),
    );
    const expand = screen.getByRole("button", { name: "Expand navigation" });
    expect(expand).toHaveAttribute("aria-expanded", "false");

    await user.click(expand);
    expect(window.localStorage.getItem(RAIL_COLLAPSED_KEY)).toBe("false");
  });

  it("shows a tooltip for a collapsed item on keyboard focus", async () => {
    // jsdom has no ResizeObserver, which Radix popper content needs.
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    window.localStorage.setItem(RAIL_COLLAPSED_KEY, "true");
    mount();
    await waitFor(() =>
      expect(screen.getByTestId("shell-rail")).toHaveAttribute(
        "data-collapsed",
        "true",
      ),
    );
    act(() => within(rail()).getByRole("link", { name: "Advisories" }).focus());
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Advisories");
  });
});

describe("role based items", () => {
  const railNames = () =>
    within(rail())
      .getAllByRole("link")
      .map((link) => link.getAttribute("aria-label") ?? link.textContent);

  it.each<[string, AccountSession]>([
    ["signed out", SIGNED_OUT],
    ["signed in with no role", signedIn(null)],
    ["signed in with an unknown role", signedIn("superuser")],
  ])("hides Review queue and Official updates when %s", (_label, session) => {
    setAccountSession(session);
    mount();
    expect(railNames()).not.toContain("Review queue");
    expect(railNames()).not.toContain("Official updates");
  });

  it("shows Review queue only for a reviewer", () => {
    setAccountSession(signedIn("reviewer"));
    mount();
    expect(railNames()).toContain("Review queue");
    expect(railNames()).not.toContain("Official updates");
    expect(
      within(rail()).getByRole("link", { name: "Review queue" }),
    ).toHaveAttribute("href", "/review");
  });

  it("shows Official updates only for an official", () => {
    setAccountSession(signedIn("official"));
    mount();
    expect(railNames()).toContain("Official updates");
    expect(railNames()).not.toContain("Review queue");
  });

  it("derives items from the role string alone, never granting one", () => {
    expect(roleNavItems(undefined)).toEqual([]);
    expect(roleNavItems("Reviewer")).toEqual([]);
    expect(roleNavItems("reviewer").map((i) => i.to)).toEqual(["/review"]);
  });
});

const status = (overrides: Partial<ShellStatus> = {}): ShellStatus => ({
  online: "online",
  lastSuccessfulSyncAt: 1_700_000_000_000,
  pending: 0,
  failed: 0,
  lastFailed: false,
  ...overrides,
});

describe("status chip", () => {
  const render_ = (s: ShellStatus) =>
    render(
      <PreferencesProvider>
        <StatusChip status={s} />
      </PreferencesProvider>,
    );

  it("shows Offline with an icon, not a dot", () => {
    const { container } = render_(status({ online: "offline" }));
    expect(screen.getByTestId("status-chip")).toHaveTextContent("Offline");
    expect(screen.queryByTestId("status-mark")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
    expect(chipState(status({ online: "offline", pending: 4 }))).toBe(
      "offline",
    );
  });

  it("shows the pending count as text", () => {
    render_(status({ pending: 3 }));
    expect(screen.getByTestId("status-chip")).toHaveTextContent("3 pending");
    expect(screen.getByTestId("status-chip")).toHaveAttribute(
      "data-state-kind",
      "pending",
    );
  });

  it("shows a hollow ring when never synced", () => {
    render_(status({ lastSuccessfulSyncAt: null }));
    expect(screen.getByTestId("status-chip")).toHaveTextContent("Not synced");
    expect(screen.getByTestId("status-mark")).toHaveAttribute(
      "data-mark",
      "hollow",
    );
  });

  it("shows a filled blue dot only when the existing sync state says synced", () => {
    render_(status());
    expect(screen.getByTestId("status-chip")).toHaveTextContent("Synced");
    const mark = screen.getByTestId("status-mark");
    expect(mark).toHaveAttribute("data-mark", "filled");
    expect(mark.className).toContain("bg-brand-blue");
  });

  it.each([
    ["offline", status({ online: "offline" })],
    ["pending", status({ pending: 2 })],
    ["never", status({ lastSuccessfulSyncAt: null })],
    ["synced", status()],
  ])("never uses green, amber or red (%s)", (_name, s) => {
    const { container } = render_(s);
    expect(container.innerHTML).not.toMatch(
      /status-clear|status-caution|status-dnt|green|amber|red-|destructive/,
    );
  });

  it("opens Status details with the existing lines and the disclaimer", async () => {
    const user = userEvent.setup();
    render_(status({ pending: 2, lastSuccessfulSyncAt: null }));
    await user.click(screen.getByTestId("status-chip"));
    expect(
      await screen.findByRole("heading", { name: "Status details" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Device online")).toBeInTheDocument();
    expect(
      screen.getByText(/Not synced on this device yet/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Reports awaiting delivery: 2/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Information shown here may be old or incomplete. Always check official sources before travelling.",
      ),
    ).toBeInTheDocument();
  });

  it("uses only real state: online with no sync yet is not shown as synced", () => {
    expect(
      chipState(status({ online: "unknown", lastSuccessfulSyncAt: null })),
    ).toBe("never");
    expect(chipState(status({ online: "unknown" }))).toBe("synced");
  });
});

describe("status banner", () => {
  const banner = (s: ShellStatus) => (
    <PreferencesProvider>
      <ShellStatusBanner status={s} onOpenDetails={() => undefined} />
    </PreferencesProvider>
  );

  it.each([
    ["online and synced", status()],
    [
      "online, never synced, nothing pending",
      status({ lastSuccessfulSyncAt: null }),
    ],
    ["connection still being checked", status({ online: "unknown" })],
  ])("is absent when %s", async (_name, s) => {
    render(banner(s));
    await waitFor(() =>
      expect(screen.queryByTestId("shell-status-banner")).toBeNull(),
    );
    expect(bannerSignature(s)).toBeNull();
  });

  it("appears when offline", async () => {
    render(banner(status({ online: "offline" })));
    expect(await screen.findByTestId("shell-status-banner")).toHaveTextContent(
      "You are offline",
    );
  });

  it("appears when reports are pending", async () => {
    render(banner(status({ pending: 2 })));
    expect(await screen.findByTestId("shell-status-banner")).toHaveTextContent(
      "Reports waiting to be sent: 2.",
    );
  });

  it("appears when the last sync failed", async () => {
    render(banner(status({ lastFailed: true })));
    expect(await screen.findByTestId("shell-status-banner")).toHaveTextContent(
      "The last sync did not complete.",
    );
  });

  it("can be dismissed for the session and returns only when the state changes", async () => {
    const user = userEvent.setup();
    const view = render(banner(status({ pending: 2 })));
    await user.click(
      await screen.findByRole("button", { name: "Dismiss status message" }),
    );
    expect(screen.queryByTestId("shell-status-banner")).toBeNull();

    // Same state, even after a re-render or remount in this session: stays hidden.
    view.rerender(banner(status({ pending: 2 })));
    expect(screen.queryByTestId("shell-status-banner")).toBeNull();
    view.unmount();
    render(banner(status({ pending: 2 })));
    await waitFor(() =>
      expect(screen.queryByTestId("shell-status-banner")).toBeNull(),
    );
  });

  it("reappears when the state changes after a dismissal", async () => {
    const user = userEvent.setup();
    const view = render(banner(status({ pending: 2 })));
    await user.click(
      await screen.findByRole("button", { name: "Dismiss status message" }),
    );
    view.rerender(banner(status({ pending: 3 })));
    expect(await screen.findByTestId("shell-status-banner")).toHaveTextContent(
      "3.",
    );

    await user.click(
      screen.getByRole("button", { name: "Dismiss status message" }),
    );
    view.rerender(banner(status({ online: "offline", pending: 3 })));
    expect(await screen.findByTestId("shell-status-banner")).toHaveTextContent(
      "You are offline",
    );
  });

  it("is driven by the existing sync, online and outbox sources inside the shell", async () => {
    mount();
    expect(screen.queryByTestId("shell-status-banner")).toBeNull();
    setOnline(false);
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(await screen.findByTestId("shell-status-banner")).toHaveTextContent(
      "You are offline",
    );
    // The top-bar chip reads the same source.
    expect(screen.getAllByTestId("status-chip")[0]).toHaveTextContent(
      "Offline",
    );
  });
});
