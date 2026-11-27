import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { NotFoundPage } from "@/components/error-pages";
import { createEmptyReportDraft, writeReportDraft } from "@/lib/report-store";

/**
 * Click audit for the shared chrome (header, menu, bottom nav, footer, login
 * dialog) and for the page forms that the generic audit cannot drive on its
 * own (they need typed input first).
 */

afterEach(cleanup);
beforeEach(() => {
  window.localStorage.clear();
});

async function mountAt(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    defaultNotFoundComponent: NotFoundPage,
    scrollRestoration: false,
  });
  await router.load();
  // The root route renders <html>/<body>. Mount into the document, as the
  // real app hydrates, rather than a <div>: inside a <div> React's focus
  // event handling loops forever in jsdom when a dialog returns focus.
  render(<RouterProvider router={router} />, {
    container: document as unknown as HTMLElement,
  });
  await waitFor(() => {
    if (!document.getElementById("main")?.children.length)
      throw new Error("page not rendered");
  });
  return router;
}

/** Role queries over the whole page are very slow in jsdom while a Radix dialog is open. */
const openDialog = () =>
  waitFor(() => {
    const el = document.querySelector<HTMLElement>('[role="dialog"]');
    if (!el) throw new Error("no dialog");
    return el;
  });
const pathOf = (el: HTMLElement) =>
  new URL(el.getAttribute("href")!, "http://x").pathname;

const RAIL_LINKS = [
  ["Check a road", "/traveller"],
  ["Live map", "/map"],
  ["Advisories", "/advisories"],
  ["Contributions", "/contributions"],
  ["Help", "/help"],
] as const;

const rail = () => screen.getByTestId("shell-rail");
const tabs = () => screen.getByTestId("shell-tabs");
const topBar = () => screen.getByTestId("shell-topbar");

describe("app shell: rail, top bar and bottom tabs", () => {
  it.each(RAIL_LINKS)(
    'rail link "%s" opens %s',
    async (name, to) => {
      const router = await mountAt("/about");
      fireEvent.click(within(rail()).getByRole("link", { name }));
      await waitFor(() => expect(router.state.location.pathname).toBe(to));
    },
    30_000,
  );

  it.each([
    ["Map", "/map"],
    ["Report a hazard", "/report"],
  ])(
    'bottom tab "%s" opens %s',
    async (name, to) => {
      const router = await mountAt("/about");
      fireEvent.click(within(tabs()).getByRole("link", { name }));
      await waitFor(() => expect(router.state.location.pathname).toBe(to));
    },
    30_000,
  );

  it("logo returns home and the top-bar Report hazard button opens /report", async () => {
    const router = await mountAt("/about");
    const report = within(topBar()).getByRole("link", {
      name: "Report hazard",
    });
    expect(pathOf(report)).toBe("/report");
    fireEvent.click(report);
    await waitFor(() => expect(router.state.location.pathname).toBe("/report"));
    const logo = within(rail()).getByRole("link", { name: "RaahPrahari home" });
    expect(pathOf(logo)).toBe("/");
    fireEvent.click(logo);
    await waitFor(() => expect(router.state.location.pathname).toBe("/"));
  }, 30_000);

  it("rail language buttons switch the interface language", async () => {
    await mountAt("/");
    const group = within(rail()).getByRole("group", { name: "Language" });
    const [en, hi] = within(group).getAllByRole("button");
    expect(en).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(hi);
    await waitFor(() => expect(hi).toHaveAttribute("aria-pressed", "true"));
    expect(en).toHaveAttribute("aria-pressed", "false");
    // The desktop top bar's Report hazard button follows the language.
    expect(
      within(topBar()).getByRole("link", { name: "ख़तरा बताएँ" }),
    ).toBeVisible();
    fireEvent.click(en);
    await waitFor(() => expect(en).toHaveAttribute("aria-pressed", "true"));
  }, 30_000);

  it("the settings menu offers Light, Dark and System, and each one applies", async () => {
    await mountAt("/");
    const user = userEvent.setup();
    const seen: string[] = [];
    for (const name of ["Light", "Dark", "System", "Light"]) {
      await user.click(
        within(rail()).getByRole("button", { name: "Settings" }),
      );
      await user.click(await screen.findByRole("menuitemradio", { name }));
      await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
      seen.push(name);
    }
    expect(seen).toEqual(["Light", "Dark", "System", "Light"]);
    expect(document.documentElement).not.toHaveClass("dark");
    expect(document.documentElement.style.colorScheme).toBe("light");
  }, 30_000);

  it("Community Login opens the sign-in dialog and Close dismisses it", async () => {
    await mountAt("/");
    const trigger = within(rail()).getByRole("button", {
      name: "Community Login",
    });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = await openDialog();
    expect(dialog).toHaveAccessibleName("Community login");
    expect(dialog).toHaveAccessibleDescription(
      /Sign in with your RaahPrahari account email and password/,
    );
    const email = within(dialog).getByLabelText("Email");
    const password = within(dialog).getByLabelText("Password");
    expect(email).toHaveAttribute("type", "email");
    expect(email).toHaveAttribute("autocomplete", "email");
    expect(password).toHaveAttribute("type", "password");
    expect(password).toHaveAttribute("autocomplete", "current-password");
    expect(
      within(dialog).getByRole("button", { name: "Sign in" }),
    ).toHaveAttribute("type", "submit");
    // No signed-in state is shown before Supabase returns a session.
    expect(dialog).not.toHaveTextContent("You are signed in.");
    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() =>
      expect(document.querySelector('[role="dialog"]')).toBeNull(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  }, 30_000);

  it("hides controls for features that are not available yet", async () => {
    await mountAt("/");
    // The official and review screens need a server-assigned role, so no
    // control pretends to offer them to everyone.
    expect(
      within(rail()).queryByRole("link", { name: "Official updates" }),
    ).toBeNull();
    expect(
      within(rail()).queryByRole("link", { name: "Review queue" }),
    ).toBeNull();
  }, 30_000);

  it("signed-out Reports tab asks for sign-in instead of navigating", async () => {
    const router = await mountAt("/");
    fireEvent.click(within(tabs()).getByRole("link", { name: "Reports" }));
    const login = await openDialog();
    expect(within(login).getByLabelText("Email")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/");
    fireEvent.click(within(login).getByRole("button", { name: "Close" }));
    await waitFor(() =>
      expect(document.querySelector('[role="dialog"]')).toBeNull(),
    );
  }, 30_000);

  it("mobile account menu offers Community Login and the page palette", async () => {
    await mountAt("/");
    const user = userEvent.setup();
    const bar = screen.getByTestId("shell-mobilebar");
    await user.click(within(bar).getByRole("button", { name: "Account menu" }));
    const menu = await screen.findByRole("menu");
    expect(
      within(menu).getByRole("menuitem", { name: "Community Login" }),
    ).toBeInTheDocument();
    expect(
      within(menu).getByRole("menuitem", { name: "Search features" }),
    ).toBeInTheDocument();
    await user.click(
      within(menu).getByRole("menuitem", { name: "Community Login" }),
    );
    const login = await openDialog();
    expect(login).toHaveAccessibleName("Community login");
  }, 30_000);

  it("the shell road search sends a query to /traveller", async () => {
    const router = await mountAt("/advisories");
    const input = within(topBar()).getByLabelText("Search road or place");
    fireEvent.change(input, { target: { value: "Rishikesh" } });
    fireEvent.submit(input.closest("form")!);
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/traveller"),
    );
    expect(router.state.location.search).toMatchObject({ q: "Rishikesh" });
  }, 30_000);
});
describe("footer", () => {
  it.each([
    ["About", "/about", ""],
    ["Privacy", "/about", "#privacy"],
    ["Terms", "/about", "#terms"],
    ["Accessibility", "/about", "#accessibility"],
    ["Contact", "/contact", ""],
  ])(
    'footer "%s" opens %s%s',
    async (name, pathname, hash) => {
      const router = await mountAt("/report");
      const footer = screen.getByRole("navigation", { name: "Footer" });
      fireEvent.click(within(footer).getByRole("link", { name }));
      await waitFor(() =>
        expect(router.state.location.pathname).toBe(pathname),
      );
      expect(router.state.location.hash).toBe(hash.replace("#", ""));
      if (hash)
        expect(
          document.getElementById(hash.slice(1)),
          `${hash} target exists`,
        ).not.toBeNull();
    },
    30_000,
  );
});

describe("page forms and inputs", () => {
  it("help search filters topics and shows an empty state", async () => {
    await mountAt("/help");
    const input = screen.getByPlaceholderText("Search help topics...");
    const before = within(document.getElementById("main")!).getAllByRole(
      "link",
    ).length;
    fireEvent.change(input, { target: { value: "zzzz-no-such-topic" } });
    await waitFor(() => expect(screen.getByRole("status")).toBeVisible());
    expect(
      within(document.getElementById("main")!).getAllByRole("link").length,
    ).toBeLessThan(before);
  }, 30_000);

  it("advisory filter buttons and sort change what is listed", async () => {
    await mountAt("/advisories");
    const main = document.getElementById("main")!;
    const filters = within(main)
      .getAllByRole("button")
      .filter((b) => b.hasAttribute("aria-pressed"));
    expect(filters.length).toBeGreaterThanOrEqual(4);
    fireEvent.click(filters[1]);
    await waitFor(() =>
      expect(filters[1]).toHaveAttribute("aria-pressed", "true"),
    );
    expect(filters[0]).toHaveAttribute("aria-pressed", "false");
    const select = main.querySelector<HTMLSelectElement>("#adv-sort")!;
    fireEvent.change(select, {
      target: { value: select.options[select.options.length - 1].value },
    });
    expect(select.value).toBe(select.options[select.options.length - 1].value);
  }, 30_000);

  it("report flow: hazard type, description and Continue reach Review", async () => {
    writeReportDraft({
      ...createEmptyReportDraft(),
      photo: {
        id: "test-photo",
        name: "road.jpg",
        type: "image/jpeg",
        size: 1024,
        timestamp: Date.now(),
        locationTag: "30.1° N, 79.3° E",
      },
      location: {
        query: "Uttarakhand",
        roadSegment: "NH-7",
        lat: 30.1,
        lon: 79.3,
        accuracyM: null,
        source: "manual",
        confirmed: true,
      },
    });
    const router = await mountAt("/report");
    await screen.findByRole("heading", {
      name: "Describe the hazard",
      level: 1,
    });
    const main = document.getElementById("main")!;
    const next = within(main).getByRole("button", { name: "Continue" });
    fireEvent.click(within(main).getByRole("button", { name: "Landslide" }));
    fireEvent.change(within(main).getByLabelText("Describe the condition"), {
      target: { value: "Rocks on the road near the bend" },
    });
    await waitFor(() => expect(next).toBeEnabled());
    fireEvent.click(next);
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/report/review"),
    );
    expect(
      await screen.findByRole("heading", {
        name: "Review your report",
        level: 1,
      }),
    ).toBeVisible();
  }, 30_000);

  it("route search swap is disabled until a place is chosen, then swaps", async () => {
    await mountAt("/check");
    const main = document.getElementById("main")!;
    const swap = within(main).getByRole("button", {
      name: "Swap starting place and destination",
    });
    // With both fields empty, swapping would do nothing, so it is disabled.
    expect(swap).toBeDisabled();
    const form = swap.closest("form")!;
    const [from, to] = within(form).getAllByRole("combobox");
    // Quick-pick place chips are toggle buttons; the first one fills "From".
    const quickPick = form.querySelector<HTMLButtonElement>(
      'button[aria-pressed="false"]',
    )!;
    fireEvent.click(quickPick);
    await waitFor(() => expect(swap).toBeEnabled());
    expect((from as HTMLInputElement).value).not.toBe("");
    const before = [
      (from as HTMLInputElement).value,
      (to as HTMLInputElement).value,
    ];
    fireEvent.click(swap);
    await waitFor(() =>
      expect([
        (from as HTMLInputElement).value,
        (to as HTMLInputElement).value,
      ]).toEqual([before[1], before[0]]),
    );
  }, 30_000);

  it("traveller search form submits and shows results", async () => {
    await mountAt("/traveller");
    const main = document.getElementById("main")!;
    const input = within(main).getAllByRole("textbox")[0];
    fireEvent.change(input, { target: { value: "Rishikesh" } });
    const form = input.closest("form")!;
    fireEvent.submit(form);
    await waitFor(
      () =>
        expect(
          main.querySelectorAll('a[href^="/advisories/"]').length,
        ).toBeGreaterThan(0),
      { timeout: 10_000 },
    );
  }, 30_000);
});
