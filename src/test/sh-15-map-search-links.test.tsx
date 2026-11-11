import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { NotFoundPage } from "@/components/error-pages";
import { TILE_FAILURE_THRESHOLD } from "@/features/map/leaflet-segment-map";

const routePaths = [
  "/",
  "/about",
  "/check",
  "/contact",
  "/help",
  "/help/freshness",
  "/map",
  "/traveller",
  "/advisories",
  "/advisories/nh7-06",
  "/report",
  "/report/location",
  "/report/photo",
  "/report/review",
  "/report/received",
] as const;

const originalGeolocation = Object.getOwnPropertyDescriptor(
  navigator,
  "geolocation",
);
const routeTestTimeout = 20_000;

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalGeolocation) {
    Object.defineProperty(navigator, "geolocation", originalGeolocation);
  } else {
    Reflect.deleteProperty(navigator, "geolocation");
  }
});

async function mountAt(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    defaultNotFoundComponent: NotFoundPage,
    scrollRestoration: false,
  });
  await router.load();
  const rendered = render(<RouterProvider router={router} />);
  return { router, ...rendered };
}

/** Fails every OpenStreetMap tile the real Leaflet map requested. */
async function failMapTiles(container: HTMLElement) {
  await waitFor(() =>
    expect(
      container.querySelectorAll("img.leaflet-tile").length,
    ).toBeGreaterThanOrEqual(TILE_FAILURE_THRESHOLD),
  );
  container
    .querySelectorAll("img.leaflet-tile")
    .forEach((tile) => fireEvent.error(tile));
}

function openPageMenu(container: HTMLElement) {
  const menuButton =
    container.querySelector<HTMLButtonElement>(
      'button[aria-label="Open menu"]',
    ) ??
    container.querySelector<HTMLButtonElement>(
      'button[aria-label="Open navigation menu"]',
    );
  if (menuButton) fireEvent.click(menuButton);
  return menuButton;
}

describe("SH-15 map provider fallback", () => {
  // jsdom has no layout; give the map a size so Leaflet requests tiles we can fail.
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(600);
  });

  it(
    "switches /map to a selectable list and leaves navigation and report links available",
    async () => {
      const { container, unmount } = await mountAt("/map");
      try {
        await failMapTiles(container);

        expect(await screen.findByRole("status")).toHaveTextContent(
          "Showing the road list instead",
        );
        expect(
          screen.getByRole("heading", { name: "Road segments" }),
        ).toBeVisible();
        const selectors = screen.getAllByRole("button", {
          name: "Select segment",
        });
        fireEvent.click(selectors[0]);
        expect(selectors[0]).toHaveAttribute("aria-pressed", "true");

        // /map no longer has its own sidebar; the shared site navigation provides the report link.
        const [reportLink] = await screen.findAllByRole("link", {
          name: "Report Hazard",
        });
        expect(reportLink).toHaveAttribute("href", "/report");
        expect(routePaths).toContain(
          new URL(reportLink.getAttribute("href")!, "http://localhost")
            .pathname,
        );
      } finally {
        unmount();
      }
    },
    routeTestTimeout,
  );

  it(
    "switches /traveller to selectable road sections with working detail and report CTAs",
    async () => {
      const { container, unmount } = await mountAt("/traveller?q=SH-MSR");
      try {
        await failMapTiles(container);

        expect(await screen.findByRole("status")).toHaveTextContent(
          "Showing road sections instead",
        );
        const roadSelection = screen.getByRole("button", {
          name: /Select: Dehradun – Mussoorie/,
        });
        fireEvent.click(roadSelection);
        expect(roadSelection).toHaveAttribute("aria-pressed", "true");

        const list = container.querySelector<HTMLElement>(".traveller-map-list");
        if (!list) throw new Error("Missing traveller fallback list");
        const detailLink = within(list).getByRole("link", {
          name: "View details",
        });
        expect(detailLink).toHaveAttribute("href", "/advisories/msr-01");
        expect(
          /^\/advisories\/[^/]+$/.test(detailLink.getAttribute("href") ?? ""),
        ).toBe(true);
      } finally {
        unmount();
      }
    },
    routeTestTimeout,
  );

  it(
    "keeps the report CTA usable from the traveller fallback list",
    async () => {
      const { container, unmount } = await mountAt("/traveller?q=SH-MSR");
      try {
        await failMapTiles(container);
        const reportLink = await screen.findByRole("link", {
          name: "Report this road",
        });
        expect(
          new URL(reportLink.getAttribute("href")!, "http://localhost")
            .pathname,
        ).toBe("/report");
        expect(routePaths).toContain("/report");
      } finally {
        unmount();
      }
    },
    routeTestTimeout,
  );
});

describe("SH-15 traveller search states", () => {
  it(
    "does not present a locally saved report as verified",
    async () => {
      const { unmount } = await mountAt("/report/received");
      try {
        expect(
          await screen.findByText("Report saved on this device"),
        ).toBeVisible();
        expect(screen.getByText("Saved locally — not delivered")).toBeVisible();
        expect(screen.queryByText(/^Verified$/i)).not.toBeInTheDocument();
      } finally {
        unmount();
      }
    },
    routeTestTimeout,
  );

  it(
    "renders results for a matching manual query",
    async () => {
      const { unmount } = await mountAt("/traveller?q=SH-MSR");
      try {
        expect(
          await screen.findByRole("heading", { name: "Search results" }),
        ).toBeVisible();
        expect(screen.getByText(/Dehradun – Mussoorie/)).toBeInTheDocument();
      } finally {
        unmount();
      }
    },
    routeTestTimeout,
  );

  it(
    "renders an explicit no-results state",
    async () => {
      const { unmount } = await mountAt("/traveller?q=not-a-road");
      try {
        expect(
          await screen.findByText("No matching reports found."),
        ).toBeVisible();
        expect(
          screen.getByText("This does not confirm current road conditions."),
        ).toBeVisible();
      } finally {
        unmount();
      }
    },
    routeTestTimeout,
  );

  it(
    "shows loading while submitting a manual search",
    async () => {
      const { container, unmount } = await mountAt("/traveller");
      try {
        fireEvent.change(screen.getByLabelText("Search a place or road"), {
          target: { value: "SH-MSR" },
        });
        fireEvent.submit(container.querySelector("form")!);
        expect(
          await screen.findByRole("button", { name: /Searching/ }),
        ).toBeDisabled();
        await screen.findByRole("heading", { name: "Search results" });
      } finally {
        unmount();
      }
    },
    routeTestTimeout,
  );

  it(
    "shows the failure state when search navigation fails and allows retry",
    async () => {
      const { router, container, unmount } = await mountAt("/traveller");
      const navigate = vi
        .spyOn(router, "navigate")
        .mockRejectedValue(new Error("synthetic failure"));
      try {
        fireEvent.change(screen.getByLabelText("Search a place or road"), {
          target: { value: "SH-MSR" },
        });
        fireEvent.submit(container.querySelector("form")!);
        expect(
          await screen.findByText("Search could not be completed."),
        ).toBeVisible();
        expect(navigate).toHaveBeenCalled();
        expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled();
      } finally {
        unmount();
      }
    },
    routeTestTimeout,
  );

  it(
    "keeps manual search available after location permission is denied",
    async () => {
      const geolocation = {
        getCurrentPosition: vi.fn(
          (_success: PositionCallback, failure: PositionErrorCallback) =>
            failure({
              code: 1,
              PERMISSION_DENIED: 1,
            } as GeolocationPositionError),
        ),
      };
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: geolocation,
      });
      const { container, unmount } = await mountAt("/traveller");
      try {
        fireEvent.click(
          screen.getByRole("button", { name: "Use current location" }),
        );
        expect(await screen.findByRole("status")).toHaveTextContent(
          "Location permission denied. Search manually instead.",
        );
        fireEvent.change(screen.getByLabelText("Search a place or road"), {
          target: { value: "SH-MSR" },
        });
        fireEvent.submit(container.querySelector("form")!);
        expect(
          await screen.findByRole("heading", { name: "Search results" }),
        ).toBeVisible();
        expect(screen.getByText(/Dehradun – Mussoorie/)).toBeInTheDocument();
      } finally {
        unmount();
      }
    },
    routeTestTimeout,
  );
});

describe("SH-15 route and navigation links", () => {
  it("visits every route and checks every CTA, navigation, footer, menu, and bottom-nav link", async () => {
    const deadLinks: string[] = [];
    const invalidReportLinks: string[] = [];
    const placeholders: string[] = [];

    for (const path of routePaths) {
      const { container, unmount } = await mountAt(path);
      try {
        if (path === "/report/received") openPageMenu(container);
        const links = screen.queryAllByRole("link");
        for (const link of links) {
          const href = link.getAttribute("href") ?? "";
          const label =
            link.textContent?.trim() ||
            link.getAttribute("aria-label") ||
            "unnamed";
          if (href === "#") {
            placeholders.push(`${path}: ${label} (${href})`);
            continue;
          }
          if (href.startsWith("#")) {
            if (!container.querySelector(href)) {
              deadLinks.push(`${path}: ${label} (${href})`);
            }
            continue;
          }
          if (!href.startsWith("/")) {
            deadLinks.push(`${path}: ${label} (${href})`);
            continue;
          }

          const target = new URL(href, "http://localhost").pathname;
          const isExistingRoute =
            routePaths.includes(target as (typeof routePaths)[number]) ||
            /^\/advisories\/[^/]+$/.test(target) ||
            /^\/help\/[^/]+$/.test(target);
          if (!isExistingRoute) {
            deadLinks.push(`${path}: ${label} (${href})`);
          }
          if (/^report(?:\s|$)/i.test(label)) {
            if (target !== "/report") {
              invalidReportLinks.push(`${path}: ${label} (${href})`);
            }
          }
        }
      } finally {
        unmount();
      }
    }

    expect(
      placeholders,
      `Placeholder links: ${placeholders.join("; ")}`,
    ).toEqual([]);
    expect(deadLinks, `Dead route links: ${deadLinks.join("; ")}`).toEqual([]);
    expect(
      invalidReportLinks,
      `Report CTA links: ${invalidReportLinks.join("; ")}`,
    ).toEqual([]);
  }, 60_000);
});
