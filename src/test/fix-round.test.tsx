import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { forwardRef } from "react";
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
import { CircleQuestionMark } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FreshnessChip, LEVEL_META, ActionBadge } from "@/components/advisory";
import { NotFoundPage } from "@/components/error-pages";
import { PrototypeRibbon } from "@/components/prototype-ribbon";
import { DEMO_NOW, SEGMENTS } from "@/data/fixtures";
import { MARKER_GLYPH, MARKER_LABEL } from "@/features/map/map-style";
import { LeafletMapLegend } from "@/features/map/leaflet-segment-map";
import { RouteCard } from "@/features/routes/route-card";
import { findSeededRoutes } from "@/features/routes/routing";
import { MapLegend } from "@/features/routes/schematic-map";
import { en, hi, type TranslationKey } from "@/i18n/dictionary";
import { PreferencesProvider, usePrefs } from "@/i18n/preferences";
import { summariseRoute } from "@/lib/advisory";
import { AppStoreProvider } from "@/lib/app-store";
import { getAdvisories } from "@/lib/data";
import { routeTree } from "@/routeTree.gen";
import { ResultRow } from "@/routes/traveller";

const TIMEOUT = 30_000;
const HOUR = 3600_000;

// A switch the tests flip to simulate broken or empty store data on the real routes.
const store = vi.hoisted(() => ({ mode: "ok" as "ok" | "broken" | "empty" }));

vi.mock("@/lib/app-store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/app-store")>();
  return {
    ...actual,
    useAppStore: () => {
      const value = actual.useAppStore();
      if (store.mode === "broken") return { ...value, advisories: new Map() };
      if (store.mode === "empty") return { ...value, segments: [] };
      return value;
    },
  };
});

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/react-router")>();
  const MockLink = forwardRef<
    HTMLAnchorElement,
    React.ComponentProps<"a"> & {
      to?: string;
      params?: Record<string, string>;
      search?: unknown;
    }
  >((props, ref) => {
    const { to = "#", params, search, ...anchorProps } = props;
    void params;
    void search;
    return <a ref={ref} href={to} {...anchorProps} />;
  });
  MockLink.displayName = "MockLink";
  return { ...actual, Link: MockLink };
});

// Raw text of source files, public files and docs, for the "no inline string / no hex" checks.
const tsFiles = import.meta.glob(["/src/**/*.{ts,tsx}"], {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
// CSS, the manifest and docs are read from disk: the test CSS pipeline does not return raw CSS text.
const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path.replace(/^\//, "")), "utf8");
const files: Record<string, string> = {
  ...tsFiles,
  "/src/styles.css": read("/src/styles.css"),
  "/src/routes/home.css": read("/src/routes/home.css"),
  "/src/routes/traveller.css": read("/src/routes/traveller.css"),
  "/public/manifest.webmanifest": read("/public/manifest.webmanifest"),
  "/docs/change-order.md": read("/docs/change-order.md"),
};
const sourceFiles = Object.entries(files).filter(
  ([path]) =>
    path.startsWith("/src/") &&
    !/\.test\.|\/test\/|dictionary\.ts$|routeTree\.gen/.test(path),
);
const tsxFiles = sourceFiles.filter(([path]) => path.endsWith(".tsx"));

afterEach(() => {
  cleanup();
  store.mode = "ok";
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
  render(<RouterProvider router={router} />);
  return router;
}

/** Reads `ago` from the preferences layer so the injected clock can be observed. */
function Age({ at }: { at: number }) {
  const { ago } = usePrefs();
  return <span data-testid="age">{ago(at)}</span>;
}

describe("change order 1: clearance wording and colour", () => {
  it('labels clear as "Cleared (verified by approved process)" and unresolved clearance as awaiting verification', () => {
    expect(en["level.clear"]).toBe("Cleared (verified by approved process)");
    expect(en["copy.awaitingClearance"]).toBe(
      "Awaiting clearance verification.",
    );
    expect(hi["level.clear"]).toContain("स्वीकृत प्रक्रिया से सत्यापित");
  });

  it('never uses "Safe" in level, filter or legend labels', () => {
    const keys = (Object.keys(en) as TranslationKey[]).filter((key) =>
      /^(level|adv\.filter|map)\./.test(key),
    );
    for (const key of keys) expect(en[key], key).not.toMatch(/\bsafe\b/i);
    expect(en["adv.filterUnknown"]).not.toMatch(/safe|clear/i);
  });

  it("the clear colour token is not green in either theme", () => {
    const css = files["/src/styles.css"];
    const values = [...css.matchAll(/--status-clear:\s*(#[0-9a-f]{6})/gi)].map(
      (m) => m[1],
    );
    expect(values.length).toBeGreaterThanOrEqual(2);
    for (const hex of values) {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
      expect(g > r && g > b, `${hex} reads as green`).toBe(false);
    }
    expect(LEVEL_META.clear.color).toBe("var(--status-clear)");
  });

  it('renders the clear badge with its full label, never "Safe"', () => {
    render(
      <PreferencesProvider>
        <ActionBadge level="clear" />
      </PreferencesProvider>,
    );
    expect(
      screen.getByText("Cleared (verified by approved process)"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/\bsafe\b/i)).not.toBeInTheDocument();
  });
});

describe("change order 2 and 5: freshness comes from the source timestamp and an injected clock", () => {
  const renderChip = (ts: number | undefined, now = DEMO_NOW) =>
    render(
      <AppStoreProvider seed={{ now }}>
        <PreferencesProvider>
          <FreshnessChip sourceTimestamp={ts} />
        </PreferencesProvider>
      </AppStoreProvider>,
    ).getByTestId("freshness-chip");

  it('unknown and stale are never styled as fresh or green, and there is no "Recent" chip', () => {
    const unknown = renderChip(undefined);
    expect(unknown).toHaveTextContent("Freshness unknown");
    cleanup();
    const future = renderChip(DEMO_NOW + HOUR);
    expect(future).toHaveTextContent("Freshness unknown");
    cleanup();
    const stale = renderChip(DEMO_NOW - 72 * HOUR);
    expect(stale).toHaveTextContent("Stale information · 3 d ago");
    for (const chip of [unknown, future, stale]) {
      expect(chip.className).not.toMatch(/green|emerald|status-clear|blue/);
    }
    expect(document.body.textContent).not.toMatch(/\bRecent\b/);
  });

  it("fresh is derived from the timestamp and the injected clock", () => {
    expect(renderChip(DEMO_NOW - 2 * HOUR)).toHaveTextContent(
      "Fresh information · 2 h ago",
    );
    cleanup();
    // The same timestamp is stale once the injected clock moves on.
    expect(
      renderChip(DEMO_NOW - 2 * HOUR, DEMO_NOW + 72 * HOUR),
    ).toHaveTextContent("Stale information");
  });

  it("ages follow the injected clock, and the fixture clock is a fixed 2026 instant", () => {
    expect(new Date(DEMO_NOW).getUTCFullYear()).toBe(2026);
    const at = DEMO_NOW - 3 * HOUR;
    render(
      <AppStoreProvider seed={{ now: DEMO_NOW + 24 * HOUR }}>
        <PreferencesProvider>
          <Age at={at} />
        </PreferencesProvider>
      </AppStoreProvider>,
    );
    expect(screen.getByTestId("age")).toHaveTextContent("27 h ago");
  });

  it("has no hard-coded relative ages in components", () => {
    for (const [path, text] of tsxFiles) {
      expect(text, path).not.toMatch(
        /\b\d+\s*(?:days?|hours?|mins?|minutes?|h|d)\s+ago\b/i,
      );
      expect(text, path).not.toMatch(/Freshness:\s*\d/);
    }
  });
});

describe("change order 3, 4 and 7: wording that must not overclaim", () => {
  it('community sources are "Submitted by", not "Verified by"', () => {
    expect(en["source.community"]).toBe("Submitted by community contributors");
    for (const value of Object.values(en))
      expect(value).not.toMatch(/verified by community/i);
  });

  it("AI-assisted indication is never an official closure", () => {
    expect(en["segment.aiIndication"]).toBe(
      "AI-assisted indication, not an official closure",
    );
    expect(hi["segment.aiIndication"]).toBeTruthy();
    for (const value of Object.values(en))
      expect(value).not.toMatch(/currently marked as avoid/i);
  });

  it('a route card keeps the "not enough information" line and never ranks a safer route', () => {
    expect(en["copy.poorCoverage"]).toMatch(
      /^Not enough current information to recommend a safer route/,
    );
    const first = SEGMENTS[0];
    const routes = findSeededRoutes(first.from, first.to);
    expect(routes.length).toBeGreaterThan(0);
    const advisories = getAdvisories();
    render(
      <PreferencesProvider>
        {routes.map((route, index) => (
          <RouteCard
            key={route.id}
            route={route}
            index={index}
            summary={summariseRoute(
              route.segments,
              route.segments.map((s) => advisories.get(s.id)!),
            )}
            selected={false}
            saved={false}
            onSelect={() => {}}
            onCompare={() => {}}
            onDetails={() => {}}
            onToggleSave={() => {}}
          />
        ))}
      </PreferencesProvider>,
    );
    expect(
      screen.getAllByText(
        /Not enough current information to recommend a safer route/,
      ),
    ).toHaveLength(routes.length);
    expect(document.body.textContent).not.toMatch(
      /\b(safest|best route|recommended route|safer than)\b/i,
    );
    for (const [path, text] of sourceFiles) {
      if (/route-card|check\.tsx|routing\.ts/.test(path))
        expect(text, path).not.toMatch(/safest|best route|recommended route/i);
    }
  });
});

describe("change order 6: every result row shows action, freshness and source", () => {
  it("shows all three for a section with no evidence at all", () => {
    const advisories = getAdvisories();
    const bare = SEGMENTS.find((s) => {
      const advisory = advisories.get(s.id);
      return advisory && !advisory.evidence.length && !advisory.restriction;
    });
    if (!bare) throw new Error("Fixture has no section without evidence");
    render(
      <PreferencesProvider>
        <ResultRow
          segment={bare}
          reason="No recent observation is available for this road section."
        />
      </PreferencesProvider>,
    );
    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.getByTestId("freshness-chip")).toHaveTextContent(
      "Freshness unknown",
    );
    expect(screen.getByText("No reported source")).toBeInTheDocument();
  });
});

describe("change order 8: marker shapes on every legend", () => {
  it("uses triangle, shield and question mark glyphs for hazard, restriction and unknown", () => {
    expect(MARKER_GLYPH.hazard).toContain("M12 3 2 20.5h20L12 3z");
    expect(MARKER_GLYPH.restriction).toContain("M12 2.5 4.5 5.4");
    expect(MARKER_GLYPH.unknown).toContain('<circle cx="12" cy="17.4"');
    expect(MARKER_LABEL).toMatchObject({
      hazard: "Reported hazard",
      restriction: "Official restriction",
    });
  });

  it("the map legend pairs each label with its glyph", () => {
    render(
      <PreferencesProvider>
        <LeafletMapLegend />
      </PreferencesProvider>,
    );
    const legend = within(screen.getByRole("region", { name: "Map legend" }));
    // Parse the glyph the same way the legend does so serialisation differences cannot matter.
    const normalise = (markup: string) => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.innerHTML = markup;
      return svg.innerHTML;
    };
    const glyphOf = (label: string) =>
      legend.getByText(label).querySelector("svg")?.innerHTML ?? "";
    expect(glyphOf(MARKER_LABEL.hazard)).toBe(normalise(MARKER_GLYPH.hazard));
    expect(glyphOf(MARKER_LABEL.restriction)).toBe(
      normalise(MARKER_GLYPH.restriction),
    );
    expect(glyphOf(MARKER_LABEL.unknown)).toBe(normalise(MARKER_GLYPH.unknown));
  });

  it("the route-check legend uses a triangle, a shield and a question-mark unknown level", () => {
    const { container } = render(
      <PreferencesProvider>
        <MapLegend />
      </PreferencesProvider>,
    );
    expect(
      container.querySelector('[class*="lucide-triangle-alert"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[class*="lucide-shield-check"]'),
    ).not.toBeNull();
    expect(LEVEL_META.unknown.icon).toBe(CircleQuestionMark);
    expect(container).toHaveTextContent("Unknown");
  });
});

describe("change order 9: synthetic and planned claims", () => {
  it(
    "has no profile screen or activity numbers, and the offline feature is labelled planned",
    async () => {
      expect(
        Object.keys(files).filter((path) => /\/routes\/.*profile/i.test(path)),
      ).toEqual([]);
      await mountAt("/");
      const strip = await screen.findByRole("list", {
        name: "RaahPrahari features",
      });
      const offline = within(strip).getAllByRole("listitem")[2];
      expect(offline).toHaveTextContent("Offline-Aware Access");
      expect(offline).toHaveTextContent("Planned");
      expect(strip.textContent).not.toMatch(/\d/);
    },
    TIMEOUT,
  );
});

describe("item 2: one shared PrototypeRibbon", () => {
  it("renders exact text and has no props", () => {
    render(
      <PreferencesProvider>
        <PrototypeRibbon />
      </PreferencesProvider>,
    );
    expect(screen.getByTestId("prototype-ribbon")).toHaveTextContent(
      /^Prototype mockup, synthetic data$/,
    );
    expect(PrototypeRibbon.length).toBe(0);
  });

  it.each(["/", "/traveller"])(
    "%s shows it exactly once",
    async (path) => {
      await mountAt(path);
      await waitFor(
        () => expect(screen.getAllByTestId("prototype-ribbon")).toHaveLength(1),
        { timeout: 10_000 },
      );
      expect(screen.getByTestId("prototype-ribbon")).toHaveTextContent(
        /^Prototype mockup, synthetic data$/,
      );
    },
    TIMEOUT,
  );

  it("no page keeps its own copy of the label text or a custom badge", () => {
    for (const [path, text] of tsxFiles) {
      if (path.endsWith("prototype-ribbon.tsx")) continue;
      expect(text, path).not.toMatch(
        /Prototype mockup, synthetic data|PROTOTYPE · SYNTHETIC|DemoBadge/,
      );
    }
  });
});

describe("item 3: /advisories and /map loading, empty and error states", () => {
  it.each(["/advisories", "/map"])(
    "%s shows an alert with retry, a loading status, then recovers",
    async (path) => {
      store.mode = "broken";
      await mountAt(path);
      const alert = await screen.findByRole("alert", undefined, {
        timeout: 10_000,
      });
      expect(alert).toHaveTextContent("Road information could not be loaded.");

      fireEvent.click(within(alert).getByRole("button", { name: "Try again" }));
      const loading = await screen.findByText("Loading road information");
      expect(loading.closest('[role="status"]')).not.toBeNull();
      expect(loading.closest('[aria-busy="true"]')).not.toBeNull();

      // The data is still broken after the retry, so the alert comes back.
      expect(
        await screen.findByRole("alert", undefined, { timeout: 5_000 }),
      ).toBeInTheDocument();

      store.mode = "ok";
      fireEvent.click(screen.getByRole("button", { name: "Try again" }));
      await waitFor(
        () => expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
        { timeout: 5_000 },
      );
      expect(
        screen.queryByText("Road information could not be loaded."),
      ).not.toBeInTheDocument();
    },
    TIMEOUT,
  );

  it.each(["/advisories", "/map"])(
    "%s shows a status empty state that does not imply clear roads",
    async (path) => {
      store.mode = "empty";
      await mountAt(path);
      const empty = await screen.findByText(
        "No road segments to show.",
        undefined,
        { timeout: 10_000 },
      );
      expect(empty.closest('[role="status"]')).not.toBeNull();
      expect(document.body.textContent).toMatch(
        /does not mean the roads are clear/,
      );
    },
    TIMEOUT,
  );

  it(
    "the hook is not in a loading state on first render",
    async () => {
      await mountAt("/advisories");
      await screen.findByRole(
        "heading",
        { level: 1, name: en["adv.title"] },
        { timeout: 10_000 },
      );
      expect(
        screen.queryByText("Loading road information"),
      ).not.toBeInTheDocument();
    },
    TIMEOUT,
  );
});

describe("item 4: web app manifest, no service worker", () => {
  const manifest = () =>
    JSON.parse(files["/public/manifest.webmanifest"]) as Record<
      string,
      unknown
    >;

  it("has the required fields and uses the PNG app icons", () => {
    const m = manifest();
    expect(m.name).toBe("RaahPrahari");
    expect(m.display).toBe("standalone");
    expect(m.icons).toEqual([
      expect.objectContaining({ src: "/icon-192.png", sizes: "192x192" }),
      expect.objectContaining({ src: "/icon-512.png", sizes: "512x512" }),
    ]);
  });

  it("takes its theme and background colours from the dark background token", () => {
    const css = files["/src/styles.css"];
    const dark = css.match(
      /\.dark\s*\{[^}]*?--background:\s*(#[0-9a-f]{6})/i,
    )?.[1];
    expect(dark).toBeTruthy();
    const m = manifest();
    expect(m.theme_color).toBe(dark);
    expect(m.background_color).toBe(dark);
  });

  it("is linked from the root route", () => {
    expect(files["/src/routes/__root.tsx"]).toMatch(
      /rel:\s*"manifest",\s*href:\s*"\/manifest\.webmanifest"/,
    );
    expect(files["/src/routes/__root.tsx"]).toContain('content: "#07151f"');
  });

  it("registers no service worker and ships no worker file", () => {
    for (const [path, text] of sourceFiles)
      expect(text, path).not.toMatch(/serviceWorker\s*\.\s*register|workbox/i);
    expect(
      Object.keys(files).filter((path) =>
        /(^|\/)(sw|service-worker)\.(js|ts)$/.test(path),
      ),
    ).toEqual([]);
  });

  it("documents that offline caching is not implemented", () => {
    expect(files["/docs/change-order.md"]).toMatch(
      /offline caching is NOT implemented/i,
    );
  });
});

describe("item 5: UI strings live in the dictionary (EN and HI)", () => {
  const keys: TranslationKey[] = [
    "segment.timelineReported",
    "segment.observationTime",
    "segment.sourceTime",
    "segment.aiIndication",
    "common.viewDetails",
    "common.reportRoad",
    "common.searching",
    "time.cached",
  ];

  it("has distinct English and Hindi text for each moved string", () => {
    expect(en["segment.timelineReported"]).toBe("Reported");
    expect(en["segment.observationTime"]).toBe("Observation time");
    expect(en["segment.sourceTime"]).toBe("Source time");
    expect(en["common.viewDetails"]).toBe("View details");
    expect(en["common.reportRoad"]).toBe("Report this road");
    expect(en["common.searching"]).toBe("Searching…");
    for (const key of keys) {
      expect(hi[key], key).toBeTruthy();
      expect(hi[key], key).not.toBe(en[key]);
    }
  });

  it("components no longer inline those strings", () => {
    for (const [path, text] of tsxFiles) {
      expect(text, path).not.toMatch(
        />\s*(?:Reported|Observation time|Source time|View details|Report this road)\s*</,
      );
      expect(text, path).not.toMatch(
        /(?:title|label)="(?:Observation time|Source time)"/,
      );
      expect(text, path).not.toContain("'Searching…'");
    }
  });

  it("renders the Hindi labels when the language is Hindi", async () => {
    window.localStorage.setItem("rp.lang", JSON.stringify("hi"));
    const advisories = getAdvisories();
    const segment = SEGMENTS.find((s) => advisories.get(s.id)?.evidence.length);
    if (!segment) throw new Error("No segment with evidence");
    render(
      <PreferencesProvider>
        <ResultRow segment={segment} reason="x" onSelect={() => {}} />
      </PreferencesProvider>,
    );
    expect(
      await screen.findByText(hi["common.viewDetails"]),
    ).toBeInTheDocument();
  });
});

describe("item 6: home and traveller styles use tokens, not hex", () => {
  it.each(["/src/routes/traveller.css", "/src/routes/home.css"])(
    "%s has no hex colours",
    (path) => {
      expect(files[path]).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    },
  );

  it("every token they use is defined in styles.css", () => {
    const css = files["/src/styles.css"];
    const used = new Set(
      ["/src/routes/traveller.css", "/src/routes/home.css"].flatMap((path) =>
        [...files[path].matchAll(/var\((--tone-[a-z0-9-]+)\)/g)].map(
          (m) => m[1],
        ),
      ),
    );
    expect(used.size).toBeGreaterThan(0);
    for (const token of used)
      expect(css, token).toMatch(
        new RegExp(`${token}:\\s*#[0-9a-f]{3,6};`, "i"),
      );
  });
});
