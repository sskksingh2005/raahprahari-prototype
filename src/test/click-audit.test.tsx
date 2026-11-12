import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { NotFoundPage } from "@/components/error-pages";

/**
 * Click audit. For every route, every button, link and tab inside the page
 * content is clicked on a fresh mount. A click must change something a user
 * can observe: the URL, the DOM, or stored data. Anything else is a dead
 * control. Shared chrome (header, menu, bottom nav, footer) is audited in
 * `chrome-click-audit.test.tsx`.
 *
 * Disabled controls are skipped here; forms that need typed input are
 * driven in `chrome-click-audit.test.tsx`.
 */

const CONTROL_SELECTOR =
  'a[href], button, [role="button"], [role="tab"], summary';

/** Routes in the app. Dynamic routes use a seeded segment id. */
export const AUDITED_ROUTES = [
  "/",
  "/traveller",
  "/map",
  "/advisories",
  "/advisories/nh7-06",
  "/help",
  "/help/report",
  "/about",
  "/contact",
  "/report",
  "/report/photo",
  "/report/location",
  "/report/review",
  "/report/received",
  "/check",
  "/no-such-page",
] as const;

/** Controls that legitimately change nothing, with the reason. Keyed `route | label`. */
const ALLOWED_NO_OP: Record<string, string> = {};

afterEach(cleanup);
beforeEach(() => {
  window.localStorage.clear();
  // jsdom has no matchMedia; a desktop-sized viewport is enough for click handling.
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
});

async function mountAt(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    defaultNotFoundComponent: NotFoundPage,
    scrollRestoration: false,
  });
  await router.load();
  render(<RouterProvider router={router} />);
  await waitFor(() => {
    const main = document.getElementById("main");
    if (!main || main.children.length === 0)
      throw new Error("page not rendered");
  });
  return router;
}

function pageControls(): HTMLElement[] {
  const main = document.getElementById("main");
  return main
    ? Array.from(main.querySelectorAll<HTMLElement>(CONTROL_SELECTOR))
    : [];
}

const labelOf = (el: HTMLElement) =>
  (
    el.getAttribute("aria-label") ||
    el.textContent ||
    el.getAttribute("title") ||
    el.tagName
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);

const isDisabled = (el: HTMLElement) =>
  (el as HTMLButtonElement).disabled === true ||
  el.getAttribute("aria-disabled") === "true";

const isExternal = (el: HTMLElement) =>
  /^https?:\/\//.test(el.getAttribute("href") ?? "");

function snapshot(router: { state: { location: { href: string } } }) {
  return JSON.stringify([
    router.state.location.href,
    document.body.innerHTML,
    Object.entries(window.localStorage),
  ]);
}

const settle = () =>
  act(async () => new Promise<void>((resolve) => setTimeout(resolve, 20)));

describe("click audit: every control in page content does something", () => {
  describe.each(AUDITED_ROUTES)("%s", (path) => {
    it("has no dead buttons, links or tabs", async () => {
      const probe = await mountAt(path);
      const total = pageControls().length;
      const labels = pageControls().map(labelOf);
      cleanup();
      void probe;

      const dead: string[] = [];
      for (let i = 0; i < total; i++) {
        const router = await mountAt(path);
        const control = pageControls()[i];
        if (!control || isDisabled(control)) {
          cleanup();
          continue;
        }
        if (isExternal(control)) {
          // External links cannot be followed in jsdom. Leaflet's own attribution
          // links are library-owned; ours must open safely.
          if (!control.closest(".leaflet-control-attribution")) {
            expect(
              control.getAttribute("rel") ?? "",
              `${labels[i]} needs rel`,
            ).toMatch(/noopener/);
          }
          cleanup();
          continue;
        }
        // Re-selecting what is already selected is correctly a no-op.
        if (
          control.getAttribute("aria-pressed") === "true" ||
          control.getAttribute("aria-selected") === "true" ||
          // An already-checked radio (e.g. an explicit "Unknown" default).
          (control.getAttribute("role") === "radio" &&
            control.getAttribute("aria-checked") === "true") ||
          control.getAttribute("aria-current") === "page"
        ) {
          cleanup();
          continue;
        }
        // These open a native file picker through a hidden input: assert that instead.
        if (/take photo|choose (existing )?photo/i.test(labels[i])) {
          const pickers = Array.from(
            document.querySelectorAll<HTMLInputElement>('input[type="file"]'),
          );
          expect(
            pickers.length,
            `${labels[i]} needs a file input`,
          ).toBeGreaterThan(0);
          let opened = 0;
          for (const picker of pickers)
            picker.addEventListener("click", () => (opened += 1));
          fireEvent.click(control);
          expect(opened, `${labels[i]} opens the picker`).toBe(1);
          cleanup();
          continue;
        }
        const before = snapshot(router);
        fireEvent.click(control);
        await settle();
        let changed = snapshot(router) !== before;
        if (!changed) {
          try {
            await waitFor(() => expect(snapshot(router)).not.toBe(before), {
              timeout: 300,
            });
            changed = true;
          } catch {
            changed = false;
          }
        }
        if (!changed && !ALLOWED_NO_OP[`${path} | ${labels[i]}`])
          dead.push(`#${i} ${labels[i]}`);
        cleanup();
      }
      expect(dead.join(" | "), `Dead controls on ${path}`).toBe("");
    }, 240_000);
  });
});
