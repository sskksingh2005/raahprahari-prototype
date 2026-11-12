import { forwardRef } from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PreferencesProvider } from "@/i18n/preferences";
import { SiteHeader } from "./site-chrome";

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  const MockLink = forwardRef<
    HTMLAnchorElement,
    React.ComponentProps<"a"> & { to?: string; search?: unknown; params?: unknown }
  >((props, ref) => {
    const { to = "#", search, params, ...anchorProps } = props;
    void search;
    void params;
    return <a ref={ref} href={to} {...anchorProps} />;
  });
  MockLink.displayName = "MockLink";
  return {
    ...actual,
    Link: MockLink,
    useRouterState: ({ select }: { select: (s: unknown) => unknown }) =>
      select({ location: { pathname: "/", search: {} } }),
  };
});

/**
 * jsdom does not evaluate Tailwind, so the breakpoint contract is checked on the
 * classes: the element is `hidden` by default and shown with `xl:` (1280px), or
 * visible by default and hidden with `xl:hidden`.
 */
const classes = (el: Element) => el.className.split(/\s+/);

function mount() {
  return render(
    <PreferencesProvider>
      <SiteHeader />
    </PreferencesProvider>,
  );
}

describe("header breakpoints", () => {
  it("shows the inline links, language, theme and report at xl and up only", () => {
    mount();
    const header = screen.getByRole("banner");
    const nav = within(header).getByRole("navigation", { name: "Primary" });
    expect(classes(nav)).toEqual(expect.arrayContaining(["hidden", "xl:flex"]));
    expect(
      within(nav).getAllByRole("link").map((a) => a.textContent),
    ).toEqual(["Home", "Search roads", "Live Map", "Advisories", "Help"]);
    expect(within(nav).getByRole("button", { name: /more/i })).toBeInTheDocument();
    for (const link of within(nav).getAllByRole("link")) {
      expect(classes(link)).toContain("whitespace-nowrap");
    }

    const right = within(header).getByRole("group", { name: "Language" }).parentElement!;
    expect(classes(right)).toEqual(expect.arrayContaining(["hidden", "xl:flex"]));
    expect(within(right).queryByRole("button", { name: /login/i })).toBeNull();
    expect(within(right).getByRole("link", { name: "Report Hazard" })).toBeInTheDocument();
  });

  it("shows the hamburger and the bottom nav below xl, hidden from xl", () => {
    mount();
    const hamburger = screen.getByRole("button", { name: "Open menu" });
    expect(classes(hamburger)).toContain("xl:hidden");
    expect(classes(hamburger)).not.toContain("hidden");

    const bottom = screen.getByRole("navigation", { name: "Quick navigation" });
    expect(classes(bottom)).toContain("xl:hidden");
    expect(classes(bottom)).not.toContain("hidden");
  });

  it("keeps DOM order: logo, links, then language, theme, report", () => {
    mount();
    const header = screen.getByRole("banner");
    const row = header.firstElementChild!;
    const logo = within(header).getAllByRole("link", { name: "RaahPrahari home" })[0];
    const nav = within(header).getByRole("navigation", { name: "Primary" });
    const lang = within(header).getByRole("group", { name: "Language" });
    const right = lang.parentElement!;
    expect(classes(row)).toEqual(expect.arrayContaining(["flex", "items-center", "gap-3", "min-w-0"]));
    expect(classes(right)).toContain("ml-auto");
    expect(Array.from(right.children).map((el) => el.textContent || el.getAttribute("aria-label"))).toEqual([
      "ENहिन्दी",
      expect.stringMatching(/theme|system|light|dark/i),
      "Report Hazard",
    ]);
    const follows = (a: Node, b: Node) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(follows(logo, nav)).toBe(true);
    expect(follows(nav, right)).toBe(true);
  });

  it("does not use any other breakpoint for the switch", () => {
    mount();
    const header = screen.getByRole("banner");
    expect(header.innerHTML).not.toMatch(/\b(sm|md|lg|1440):(flex|hidden)\b/);
  });
});
