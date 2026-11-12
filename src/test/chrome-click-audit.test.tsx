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

const header = () =>
  Array.from(document.querySelectorAll("header")).find(
    (el) => !el.closest("main"),
  )!;
/** Role queries over the whole page are very slow in jsdom while a Radix dialog is open. */
const openDialog = () =>
  waitFor(() => {
    const el = document.querySelector<HTMLElement>('[role="dialog"]');
    if (!el) throw new Error("no dialog");
    return el;
  });
const pathOf = (el: HTMLElement) =>
  new URL(el.getAttribute("href")!, "http://x").pathname;

const HEADER_LINKS = [
  ["Home", "/"],
  ["Search roads", "/traveller"],
  ["Live Map", "/map"],
  ["Advisories", "/advisories"],
  ["Help", "/help"],
  ["About", "/about"],
] as const;

describe("header and bottom navigation", () => {
  it.each(HEADER_LINKS.filter(([, to]) => to !== "/"))(
    'header link "%s" opens %s',
    async (name, to) => {
      const router = await mountAt("/");
      const primary = within(header()).getByRole("navigation", {
        name: "Primary",
      });
      if (to === "/about") {
        const user = userEvent.setup();
        await user.click(within(header()).getByRole("button", { name: "More" }));
        await user.click(await screen.findByRole("menuitem", { name }));
      } else {
        fireEvent.click(within(primary).getByRole("link", { name }));
      }
      await waitFor(() => expect(router.state.location.pathname).toBe(to));
    },
    30_000,
  );

  it.each([
    ["Search roads", "/traveller"],
    ["Report Hazard", "/report"],
    ["Live Map", "/map"],
    ["Advisories", "/advisories"],
  ])(
    'bottom link "%s" opens %s',
    async (name, to) => {
      const router = await mountAt("/about");
      const bottom = screen.getByRole("navigation", {
        name: "Quick navigation",
      });
      fireEvent.click(within(bottom).getByRole("link", { name }));
      await waitFor(() => expect(router.state.location.pathname).toBe(to));
    },
    30_000,
  );

  it("logo returns home and the header Report Hazard button opens /report", async () => {
    const router = await mountAt("/about");
    const reportLinks = within(header()).getAllByRole("link", {
      name: "Report Hazard",
    });
    expect(reportLinks).toHaveLength(2);
    expect(reportLinks.map(pathOf)).toEqual(["/report", "/report"]);
    fireEvent.click(reportLinks[0]);
    await waitFor(() => expect(router.state.location.pathname).toBe("/report"));
    const logo = within(header())
      .getAllByRole("link")
      .find((l) => pathOf(l) === "/" && l.getAttribute("aria-label"));
    fireEvent.click(logo!);
    await waitFor(() => expect(router.state.location.pathname).toBe("/"));
  }, 30_000);

  it("language buttons switch the interface language", async () => {
    await mountAt("/");
    const group = within(header()).getByRole("group", { name: "Language" });
    const [en, hi] = within(group).getAllByRole("button");
    expect(en).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(hi);
    await waitFor(() => expect(hi).toHaveAttribute("aria-pressed", "true"));
    expect(en).toHaveAttribute("aria-pressed", "false");
    expect(
      within(header()).getAllByRole("link", { name: "ख़तरा बताएँ" })[0],
    ).toBeVisible();
    fireEvent.click(en);
    await waitFor(() => expect(en).toHaveAttribute("aria-pressed", "true"));
  }, 30_000);

  it("theme button cycles the theme and changes its own label", async () => {
    await mountAt("/");
    const seen = new Set<string>();
    for (let i = 0; i < 3; i++) {
      const button = within(header()).getByRole("button", {
        name: /theme|dark|light|system/i,
      });
      seen.add(button.getAttribute("aria-label")!);
      fireEvent.click(button);
      await waitFor(() =>
        expect(
          within(header()).getByRole("button", {
            name: /theme|dark|light|system/i,
          }),
        ).not.toBe(button),
      ).catch(() => undefined);
    }
    expect(seen.size).toBeGreaterThan(1);
  }, 30_000);

  it("Community Login opens the sign-in dialog and Close dismisses it", async () => {
    await mountAt("/");
    const trigger = within(header()).getByRole("button", {
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
    // The official portal is deferred (VA-16), so no control pretends to offer it.
    expect(
      within(header()).queryByRole("link", { name: "Official" }),
    ).toBeNull();
  }, 30_000);

  it("mobile menu opens, its links navigate and it closes", async () => {
    const router = await mountAt("/");
    fireEvent.click(
      within(header()).getByRole("button", { name: "Open menu" }),
    );
    const dialog = await openDialog();
    fireEvent.click(within(dialog).getByRole("link", { name: "Help" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/help"));
    await waitFor(() =>
      expect(document.querySelector('[role="dialog"]')).toBeNull(),
    );
  }, 30_000);

  it("mobile menu Login and Report buttons work", async () => {
    const router = await mountAt("/");
    fireEvent.click(
      within(header()).getByRole("button", { name: "Open menu" }),
    );
    let menu = await openDialog();
    fireEvent.click(
      within(menu).getByRole("button", { name: "Community Login" }),
    );
    // The menu closes and the login dialog takes its place.
    const login = await waitFor(() => {
      const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"]');
      if (dialogs.length !== 1 || dialogs[0] === menu)
        throw new Error("login not open yet");
      return dialogs[0];
    });
    expect(within(login).queryByRole("navigation")).toBeNull();
    expect(within(login).getByLabelText("Email")).toBeInTheDocument();
    fireEvent.click(
      within(login).getAllByRole("button", { name: /close/i })[0],
    );
    await waitFor(() =>
      expect(document.querySelector('[role="dialog"]')).toBeNull(),
    );

    fireEvent.click(
      within(header()).getByRole("button", { name: "Open menu" }),
    );
    menu = await openDialog();
    fireEvent.click(within(menu).getByRole("link", { name: "Report Hazard" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/report"));
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

  it("report flow: hazard type, description and Continue reach the photo step", async () => {
    const router = await mountAt("/report");
    const main = document.getElementById("main")!;
    const next = within(main).getByRole("button", { name: "Continue" });
    fireEvent.click(within(main).getByRole("button", { name: "Landslide" }));
    fireEvent.change(within(main).getByLabelText("Describe the condition"), {
      target: { value: "Rocks on the road near the bend" },
    });
    await waitFor(() => expect(next).toBeEnabled());
    fireEvent.click(next);
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/report/photo"),
    );
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
