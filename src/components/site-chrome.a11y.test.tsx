import { forwardRef } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PreferencesProvider } from "@/i18n/preferences";
import { SiteHeader } from "./site-chrome";

// The mocked router reads this, so a test can simulate a route change.
const location = vi.hoisted(() => ({ pathname: "/", search: {} as Record<string, unknown> }));

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/react-router")>();
  const MockLink = forwardRef<
    HTMLAnchorElement,
    React.ComponentProps<"a"> & {
      to?: string;
      search?: Record<string, unknown>;
      params?: Record<string, string>;
    }
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
    useRouterState: ({
      select,
    }: {
      select: (state: {
        location: { pathname: string; search: Record<string, unknown> };
      }) => unknown;
    }) => select({ location: { ...location } }),
  };
});

const header = () => (
  <PreferencesProvider>
    <SiteHeader />
  </PreferencesProvider>
);

describe("mobile navigation keyboard accessibility", () => {
  it("opens from the keyboard, traps focus, closes with Escape, and restores focus", async () => {
    location.pathname = "/";
    const user = userEvent.setup();
    render(header());

    const trigger = screen.getByRole("button", { name: /menu/i });
    trigger.focus();
    await user.keyboard("{Enter}");

    const dialog = await screen.findByRole("dialog");
    const firstLink = within(dialog).getByRole("link", { name: "Home" });
    const closeButton = within(dialog).getByRole("button", { name: "Close" });
    await waitFor(() =>
      expect(dialog).toContainElement(document.activeElement as HTMLElement),
    );

    firstLink.focus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(closeButton).toHaveFocus();
    await user.tab();
    expect(firstLink).toHaveFocus();

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });

  it("lists the shared links in order, marks the active route and closes on route change", async () => {
    location.pathname = "/help/freshness";
    const user = userEvent.setup();
    const { rerender } = render(header());

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const dialog = await screen.findByRole("dialog");
    const menuNav = within(dialog).getByRole("navigation", { name: "Primary" });
    expect(
      within(menuNav).getAllByRole("link").map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([
      ["Home", "/"],
      ["Search roads", "/traveller"],
      ["Live Map", "/map"],
      ["Advisories", "/advisories"],
      ["Help", "/help"],
      ["About", "/about"],
    ]);
    expect(within(menuNav).getByRole("link", { name: "Help" })).toHaveAttribute("aria-current", "page");
    // The rest of the header controls are reachable from the menu too.
    expect(within(dialog).getByRole("button", { name: "Community Login" })).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "Report Hazard" })).toHaveAttribute("href", "/report");

    // A route change that does not come from the menu (e.g. browser back) closes it.
    location.pathname = "/about";
    rerender(header());
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });
});

describe("community login dialog", () => {
  it("opens, explains login is not available, closes and returns focus", async () => {
    location.pathname = "/";
    const user = userEvent.setup();
    render(header());

    const trigger = screen.getAllByRole("button", { name: "Community Login" })[0];
    await user.click(trigger);
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("Community login");
    await user.click(within(dialog).getByRole("button", { name: "Got it" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
});
