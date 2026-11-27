import { forwardRef } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PreferencesProvider } from "@/i18n/preferences";
import { setAccountSession } from "@/lib/account-session";
import { AppShell } from "./app-shell";

const route = vi.hoisted(() => ({
  pathname: "/",
  search: {} as Record<string, unknown>,
}));

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
    useNavigate: () => vi.fn(),
    useRouterState: ({ select }: { select: (s: unknown) => unknown }) =>
      select({ location: { ...route } }),
  };
});

/**
 * jsdom does not evaluate Tailwind, so the breakpoint contract is checked on
 * the classes: desktop pieces are hidden by default and shown from `lg:`
 * (1024px); mobile pieces are shown by default and hidden from `lg:`.
 */
const classes = (el: Element) => el.className.split(/\s+/);

function mount(pathname = "/") {
  route.pathname = pathname;
  setAccountSession({ status: "signed_out", userId: null });
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

afterEach(cleanup);

describe("shell breakpoints (1024px)", () => {
  it("shows the rail and desktop top bar from lg, and hides the mobile pieces from lg", () => {
    mount();
    expect(classes(screen.getByTestId("shell-rail"))).toEqual(
      expect.arrayContaining(["hidden", "lg:flex"]),
    );
    expect(classes(screen.getByTestId("shell-topbar"))).toContain(
      "max-lg:hidden",
    );
    expect(classes(screen.getByTestId("shell-mobilebar"))).toContain(
      "lg:hidden",
    );
    expect(classes(screen.getByTestId("shell-tabs"))).toContain("lg:hidden");
    expect(classes(screen.getByTestId("shell-tabs"))).not.toContain("hidden");
  });

  it("does not use any other breakpoint for the switch", () => {
    mount();
    for (const id of [
      "shell-rail",
      "shell-topbar",
      "shell-mobilebar",
      "shell-tabs",
    ]) {
      expect(screen.getByTestId(id).className, id).not.toMatch(
        /\b(sm|md|xl|2xl|1440):(flex|hidden)\b/,
      );
    }
  });

  it("fixes the tab bar to the bottom with the safe-area inset and reserves its height", () => {
    mount();
    const tabs = screen.getByTestId("shell-tabs");
    expect(classes(tabs)).toEqual(
      expect.arrayContaining(["fixed", "bottom-0", "inset-x-0"]),
    );
    expect(tabs.className).toContain("pb-[env(safe-area-inset-bottom)]");
    // Main content never sits under the tab bar.
    const column = screen.getByRole("main").parentElement!;
    expect(column.className).toContain(
      "pb-[calc(var(--shell-tabs-height)+env(safe-area-inset-bottom))]",
    );
    expect(column.className).toContain("lg:pb-0");
  });

  it("keeps the rail sticky and the bars at 56px", () => {
    mount();
    expect(classes(screen.getByTestId("shell-rail"))).toEqual(
      expect.arrayContaining(["sticky", "top-0", "h-svh"]),
    );
    expect(classes(screen.getByTestId("shell-topbar"))).toContain("h-14");
    expect(classes(screen.getByTestId("shell-mobilebar"))).toContain("h-14");
  });

  it("keeps only the status and report controls in the desktop top bar", () => {
    mount();
    const bar = screen.getByTestId("shell-topbar");
    expect(bar.children).toHaveLength(3);
    expect(within(bar).queryByRole("search")).toBeNull();
    expect(within(bar).getByTestId("status-chip")).toBeInTheDocument();
    expect(
      within(bar).getByRole("link", { name: "Report hazard" }),
    ).toBeInTheDocument();
    const rail = screen.getByTestId("shell-rail");
    const help = within(rail).getByRole("link", { name: "Help" }).closest("li");
    const search = within(rail).getByRole("search").closest("li");
    expect(help?.nextElementSibling).toBe(search);
  });

  it("makes /map full bleed with no shell search bar", () => {
    mount("/map");
    const main = screen.getByRole("main");
    expect(classes(main)).toEqual(
      expect.arrayContaining(["rp-shell-map", "flex", "min-h-0", "flex-col"]),
    );
    expect(main).not.toHaveClass("dark");
    expect(
      within(screen.getByTestId("shell-topbar")).queryByRole("search"),
    ).toBeNull();
    expect(
      within(screen.getByTestId("shell-rail")).getByRole("search"),
    ).toBeInTheDocument();
    // The column is exactly one viewport tall so the map page fills the remainder.
    expect(classes(main.parentElement!)).toEqual(
      expect.arrayContaining(["h-svh", "overflow-hidden"]),
    );
  });

  it("keeps road search in the rail, never in the top bar", () => {
    mount("/traveller");
    expect(
      within(screen.getByTestId("shell-rail")).getByRole("search"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("shell-topbar")).queryByRole("search"),
    ).toBeNull();
    cleanup();
    mount("/advisories");
    expect(
      within(screen.getByTestId("shell-rail")).getByRole("search"),
    ).toBeInTheDocument();
  });
});
