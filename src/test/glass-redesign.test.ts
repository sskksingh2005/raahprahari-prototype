import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Glassmorphism redesign (phase 1). jsdom does no compositing, so contrast is
 * computed from the tokens: text over glass over the backdrop overlay over the
 * worst-case photo pixel (white under the dark theme, black under the light
 * one). Every opacity in the design is meant to be the lowest that passes, so
 * these tests fail if anything is made lighter without re-checking AA.
 */
const read = (p: string) => readFileSync(join(process.cwd(), "src", p), "utf8");
const mainAttributes = (source: string) =>
  source.match(/<main\b([\s\S]*?)>/)?.[1] ?? "";
const sourceFiles = (directory = ""): string[] =>
  readdirSync(join(process.cwd(), "src", directory), {
    withFileTypes: true,
  }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx|css)$/.test(entry.name) &&
      !/\.(test|spec)\./.test(entry.name)
      ? [path]
      : [];
  });
const styles = read("styles.css");
const plain = styles.replace(/\/\*[\s\S]*?\*\//g, "");

function tokens(selector: RegExp) {
  const out: Record<string, string> = {};
  for (const m of plain.matchAll(selector))
    for (const d of m[2].matchAll(/(--[\w-]+):\s*([^;]+);/g))
      out[d[1]] = d[2].trim();
  return out;
}
const light = tokens(/(^|\n):root\s*\{([^{}]*)\}/g);
const dark = { ...light, ...tokens(/(^|\n)\.dark\s*\{([^{}]*)\}/g) };
type Theme = Record<string, string>;

type RGB = [number, number, number];
const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];

function resolve(theme: Theme, name: string): string {
  let value = theme[name];
  for (let i = 0; i < 6 && value?.startsWith("var("); i++)
    value = theme[value.slice(4, -1).trim()];
  if (value === undefined) throw new Error(`${name} is not defined`);
  return value;
}
function hex(theme: Theme, name: string): RGB {
  const m = /^#([0-9a-f]{6})$/i.exec(resolve(theme, name));
  if (!m)
    throw new Error(`${name} is not a hex colour: ${resolve(theme, name)}`);
  return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)) as RGB;
}
/** `rgb(R G B / A)` => [[R, G, B], A]. */
function rgba(theme: Theme, name: string): [RGB, number] {
  const m = /^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)$/.exec(resolve(theme, name));
  if (!m)
    throw new Error(`${name} is not rgb(R G B / A): ${resolve(theme, name)}`);
  return [[Number(m[1]), Number(m[2]), Number(m[3])], Number(m[4])];
}
const over = (top: RGB, alpha: number, under: RGB): RGB =>
  top.map((c, i) => c * alpha + under[i] * (1 - alpha)) as RGB;
const layer = (theme: Theme, name: string, under: RGB) => {
  const [c, a] = rgba(theme, name);
  return over(c, a, under);
};
function luminance([r, g, b]: RGB) {
  const [R, G, B] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
const contrast = (a: RGB, b: RGB) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const THEMES = { light, dark } as const;
const WORST = { light: BLACK, dark: WHITE } as const;
const STOPS = ["--backdrop-a", "--backdrop-b", "--backdrop-c"];
/** The overlay at each stop, over the worst-case photo pixel. */
const backdrops = (name: keyof typeof THEMES) =>
  STOPS.map((stop) => layer(THEMES[name], stop, WORST[name]));

describe("contrast: text straight on the backdrop (hero copy, mobile bar)", () => {
  for (const name of ["light", "dark"] as const) {
    it(`${name}: body text passes AA on every overlay stop`, () => {
      const theme = THEMES[name];
      for (const bg of backdrops(name))
        for (const text of ["--photo-text", "--foreground", "--shell-text"])
          expect(contrast(hex(theme, text), bg), text).toBeGreaterThanOrEqual(
            4.5,
          );
    });
  }

  it("dark: the orange 'you' gradient passes 3:1 as large text", () => {
    for (const bg of backdrops("dark"))
      for (const stop of ["--hero-you-from", "--hero-you-to"])
        expect(contrast(hex(dark, stop), bg), stop).toBeGreaterThanOrEqual(3);
  });

  it("light: 'you' keeps the text colour (no orange passes there)", () => {
    expect(light["--hero-you-from"]).toBe("var(--photo-text)");
    expect(light["--hero-you-to"]).toBe("var(--photo-text)");
  });

  it("uses the lowest overlay that passes (not darker than needed)", () => {
    // One percent less on the binding stop must fail, in each theme.
    for (const name of ["light", "dark"] as const) {
      const theme = THEMES[name];
      const results = STOPS.map((stop) => {
        const [c, a] = rgba(theme, stop);
        const lighter = over(c, a - 0.01, WORST[name]);
        return (
          contrast(hex(theme, "--foreground"), lighter) < 4.5 ||
          contrast(hex(theme, "--photo-text"), lighter) < 4.5
        );
      });
      expect(results.some(Boolean), name).toBe(true);
    }
  });
});

describe("contrast: text inside glass panels", () => {
  const TEXTS = [
    "--foreground",
    "--muted-foreground",
    "--shell-text",
    "--shell-muted",
    "--shell-link",
    "--link",
  ];
  for (const name of ["light", "dark"] as const) {
    const theme = THEMES[name];

    it(`${name}: .glass and .glass-strong pass for body, muted and link text`, () => {
      for (const panel of ["--glass-panel", "--glass-panel-strong"])
        for (const bg of backdrops(name)) {
          const surface = layer(theme, panel, bg);
          for (const text of TEXTS)
            expect(
              contrast(hex(theme, text), surface),
              `${panel} ${text}`,
            ).toBeGreaterThanOrEqual(4.5);
        }
    });

    it(`${name}: .glass is the lightest panel tint that passes`, () => {
      const [c, a] = rgba(theme, "--glass-panel");
      const failsLighter = backdrops(name).some((bg) => {
        const surface = over(c, a - 0.01, bg);
        return TEXTS.some((text) => contrast(hex(theme, text), surface) < 4.5);
      });
      expect(failsLighter).toBe(true);
    });

    it(`${name}: .glass-accent passes for body, muted and orange accent text`, () => {
      for (const bg of backdrops(name)) {
        const surface = layer(
          theme,
          "--glass-accent-tint",
          layer(theme, "--glass-accent-base", bg),
        );
        for (const text of [
          "--foreground",
          "--muted-foreground",
          "--glass-accent-text",
        ])
          expect(
            contrast(hex(theme, text), surface),
            text,
          ).toBeGreaterThanOrEqual(4.5);
        // The status pill on the advisory card: 12% status colour over the panel.
        const pill = over(hex(theme, "--status-avoid"), 0.12, surface);
        expect(
          contrast(hex(theme, "--foreground"), pill),
        ).toBeGreaterThanOrEqual(4.5);
      }
    });

    it(`${name}: the no-blur fallback surface passes`, () => {
      for (const bg of backdrops(name)) {
        const surface = layer(theme, "--glass-fallback", bg);
        for (const text of [
          "--foreground",
          "--muted-foreground",
          "--shell-text",
          "--shell-muted",
        ])
          expect(
            contrast(hex(theme, text), surface),
            text,
          ).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});

describe("map glass contrast", () => {
  const mapRoute = read("routes/map.tsx");
  const mapCss = read("routes/map.css");
  const travellerCss = read("routes/traveller.css");
  const advisoryDetail = read("routes/advisories.$segmentId.tsx");

  it("uses scoped translucent glass over bright map tiles and keeps text AA", () => {
    expect(mapRoute).toMatch(/className="rp-map-page"/);
    expect(mapRoute).not.toMatch(/className="rp-map-page dark"/);
    expect(mapCss).not.toMatch(
      /--glass-panel(?:-strong)?:\s*var\(--glass-fallback\);/,
    );
    expect(travellerCss).not.toMatch(/\.traveller-page\s*\{[^}]*--glass-panel/);
    expect(advisoryDetail).toMatch(/advisory-terrain-map/);
    expect(styles).toMatch(
      /\.dark\s*:is\(\.traveller-map-surface,\s*\.rp-map-canvas,\s*\.advisory-terrain-map\)\s*\{[^}]*--glass-panel-strong:\s*color-mix\(\s*in srgb,\s*var\(--glass-fallback\)\s*95%,\s*transparent\s*\)/,
    );

    const [panel, alpha] = rgba(dark, "--glass-fallback");
    const adjustedSurface = over(panel, alpha * 0.95, WHITE);
    expect(alpha * 0.95).toBeLessThan(0.9);
    for (const text of [
      "--link",
      "--shell-link",
      "--foreground",
      "--muted-foreground",
    ])
      expect(
        contrast(hex(dark, text), adjustedSurface),
        `${text} over scoped map glass`,
      ).toBeGreaterThanOrEqual(4.5);
  });
});

describe("phase 3B advisories and reports glass surfaces", () => {
  const shell = read("components/app-shell/app-shell.tsx");
  const advisoryList = read("routes/advisories.index.tsx");
  const advisoryDetail = read("routes/advisories.$segmentId.tsx");
  const advisoryCss = read("routes/advisories.index.css");
  const reports = read("routes/reports.index.tsx");
  const reportDetail = read("routes/reports.$id.tsx");
  const reportSteps = read("features/reports/report-step-page.tsx");

  it("shows the fixed backdrop on every advisory and report route", () => {
    expect(mainAttributes(shell)).not.toMatch(
      /\bbg-(?:background|card|popover|muted|shell-[\w-]+)\b/,
    );
    expect(advisoryCss).toMatch(/background:\s*transparent;/);
    expect(advisoryCss).not.toMatch(/background:\s*var\(--background\)/);
  });

  it("uses the requested glass surfaces on advisories, report details, and each wizard step", () => {
    expect(advisoryList).toMatch(/advisories-filter-pill glass-pill/);
    expect(advisoryList).toMatch(/className="glass"/);
    expect(advisoryDetail).toMatch(/className="glass-strong sm:col-span-3"/);
    expect(advisoryDetail).toMatch(/className="glass-accent rounded-xl/);
    expect(advisoryDetail).toMatch(/className="glass"/);
    expect(reports).toMatch(/className="glass rounded-2xl/);
    expect(reportDetail).toMatch(/className="glass rounded-2xl/);
    expect(
      reportSteps.match(/className="glass-strong rounded-2xl/g),
    ).toHaveLength(4);
    expect(reportSteps).toMatch(/glass-pill relative flex size-8/);
    expect(reportSteps).toMatch(/glass-strong w-full max-w-xl/);
    expect(reportSteps).toMatch(/TriangleAlert[\s\S]{0,100}text-status-dnt/);
  });

  it("keeps report error copy AA and adds a non-colour error indicator", () => {
    for (const backdrop of backdrops("dark")) {
      const surface = layer(dark, "--glass-panel-strong", backdrop);
      expect(
        contrast(hex(dark, "--foreground"), surface),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrast(hex(dark, "--status-dnt"), surface),
      ).toBeGreaterThanOrEqual(3);
      const alertSurface = over(hex(dark, "--status-dnt"), 0.1, surface);
      expect(
        contrast(hex(dark, "--status-dnt"), alertSurface),
      ).toBeGreaterThanOrEqual(3);
    }
    expect(reportSteps).toMatch(/role="alert"[\s\S]*?<TriangleAlert/);
  });
});

describe("phase 3C remaining page glass surfaces", () => {
  const shell = read("components/app-shell/app-shell.tsx");
  const check = read("routes/check.tsx");
  const routeCard = read("features/routes/route-card.tsx");
  const help = read("routes/help.tsx");
  const helpDetail = read("routes/help.$topic.tsx");
  const helpCss = read("routes/help.css");
  const about = read("routes/about.tsx");
  const contact = read("features/contact/contact-page.tsx");
  const profile = read("features/profile/profile-page.tsx");
  const contributions = read("features/contributions/contribution-ui.tsx");
  const review = read("features/review/review-queue-view.tsx");
  const reviewDetail = read("features/review/review-detail-view.tsx");
  const official = read("routes/official.tsx");
  const officialForm = read("official/OfficialNoticeForm.tsx");
  const authPage = read("features/auth/auth-pages.tsx");
  const authForms = read("components/auth-forms.tsx");
  const login = read("components/login-dialog.tsx");
  const infoCss = read("components/page-banner.css");

  it("uses transparent route-scoped mains for every Phase 3C page", () => {
    expect(mainAttributes(shell)).not.toMatch(
      /\bbg-(?:background|card|popover|muted|shell-[\w-]+)\b/,
    );
    expect(helpCss).toMatch(/background:\s*transparent;/);
    expect(helpCss).not.toMatch(/background:\s*var\(--background\)/);
    expect(infoCss).not.toMatch(/\.rp-info-card:not\(\.glass\)/);
  });

  it("uses existing glass utilities for page panels, cards, selections, and controls", () => {
    expect(check).toMatch(/glass-strong rounded-2xl p-5/);
    expect(check).toMatch(/glass-pill min-h-10/);
    expect(check).toMatch(/glass-accent text-foreground/);
    expect(routeCard).toMatch(/selected && "glass-accent"/);
    expect(help).toMatch(/rp-card glass/);
    expect(help).toMatch(/help-reminder glass-strong/);
    expect(help).toMatch(/glass help-search-input/);
    expect(helpDetail).toMatch(/help-detail-card glass/);
    expect(about).toMatch(/glass-strong mb-3/);
    expect(about.match(/rp-info-card glass/g)).not.toBeNull();
    expect(contact).toMatch(/rp-info-card glass-strong/);
    expect(contact).toMatch(/rp-contact-control glass/);
    expect(profile.match(/className="glass space-y-/g)).toHaveLength(2);
    expect(contributions).toMatch(/rp-info-card glass/);
    expect(review).toMatch(/rp-info-card glass rp-review-card/);
    expect(review).toMatch(/glass-accent border-brand-orange/);
    expect(reviewDetail.match(/rp-info-card glass/g)).toHaveLength(5);
    expect(official).toMatch(/glass-strong w-full max-w-md/);
    expect(officialForm.match(/rp-info-card glass/g)).toHaveLength(3);
    expect(authPage).toMatch(/glass-strong mx-auto max-w-md/);
  });

  it("keeps auth failures identifiable by icon and readable text", () => {
    for (const source of [authPage, authForms, login])
      expect(source).toMatch(/role="alert"[\s\S]{0,220}CircleAlert/);
    for (const name of ["light", "dark"] as const) {
      const theme = THEMES[name];
      for (const bg of backdrops(name)) {
        const surface = layer(theme, "--glass-panel-strong", bg);
        expect(
          contrast(hex(theme, "--foreground"), surface),
          `${name} auth error text`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});

describe("phase 3D source audit", () => {
  it("keeps every page container transparent and the shared main unfilled", () => {
    const shell = read("components/app-shell/app-shell.tsx");
    const travellerCss = read("routes/traveller.css");
    expect(mainAttributes(shell)).not.toMatch(
      /\bbg-(?:background|card|popover|muted|shell-[\w-]+)\b/,
    );

    for (const [file, selector] of [
      ["components/page-banner.css", ".rp-info-page"],
      ["components/page-banner.css", ".rp-error-page"],
      ["routes/home.css", ".home-page"],
      ["routes/map.css", ".rp-map-page"],
      ["routes/traveller.css", ".traveller-page"],
      ["routes/advisories.index.css", ".advisories-list-page"],
      ["routes/help.css", ".help-page"],
    ]) {
      const backgrounds = rule(read(file), selector).matchAll(
        /\bbackground(?:-color)?\s*:\s*([^;]+);/g,
      );
      for (const background of backgrounds)
        expect(background[1].trim(), `${file}: ${selector}`).toBe(
          "transparent",
        );
    }

    for (const resultRow of travellerCss.matchAll(
      /\.traveller-result-row\s*\{([^}]*)\}/g,
    ))
      expect(resultRow[1]).not.toMatch(/\bbackground(?:-color)?\s*:/);

    expect(read("components/page-banner.css")).not.toMatch(
      /\.rp-error-page::(?:before|after)|\.rp-error-page[^{}]*url\(/,
    );
  });

  it("uses only the six approved glass utilities throughout source", () => {
    const approved = new Set([
      "glass",
      "glass-strong",
      "glass-accent",
      "glass-pill",
      "glass-btn-accent",
      "glass-btn-frost",
    ]);

    for (const file of sourceFiles()) {
      const source = read(file)
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:])\/\/.*$/gm, "$1");
      for (const match of source.matchAll(/(?<![\w-])(glass-[\w-]+)(?![\w-])/g))
        expect(approved.has(match[1]), `${file}: ${match[1]}`).toBe(true);
    }
  });
});

describe("contrast: buttons", () => {
  it("orange gradient button: dark text passes on both ends", () => {
    for (const end of ["--accent-from", "--accent-to"])
      expect(
        contrast(hex(light, "--accent-ink"), hex(light, end)),
        end,
      ).toBeGreaterThanOrEqual(4.5);
  });

  it("frosted 'Check a road' button: dark text passes over any backdrop", () => {
    for (const under of [BLACK, WHITE]) {
      const surface = layer(light, "--frost-button", under);
      expect(
        contrast(hex(light, "--frost-button-ink"), surface),
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("backdrop and glass structure", () => {
  const root = read("routes/__root.tsx");
  const shell = read("components/app-shell/app-shell.tsx");

  it("puts one fixed photo behind every page, with glows under the overlay", () => {
    expect(root).toContain(
      '<div aria-hidden="true" className="rp-backdrop" />',
    );
    const backdrop = plain.match(/\n\.rp-backdrop \{([^}]*)\}/)?.[1] ?? "";
    expect(backdrop).toMatch(/position: fixed;/);
    expect(backdrop).toMatch(/inset: 0;/);
    expect(backdrop).toMatch(/z-index: -10;/);
    expect(backdrop).toMatch(
      /url\(["']\/img\/hero-road\.png["']\),\s*linear-gradient\(\s*135deg,\s*var\(--backdrop-fallback-a\)/,
    );
    expect(backdrop).toMatch(/background-size: cover;/);
    // ::before (glows) paints under ::after (overlay).
    expect(plain).toMatch(
      /\.rp-backdrop::before \{\s*background:\s*radial-gradient/,
    );
    expect(plain).toMatch(
      /\.rp-backdrop::after\s*\{\s*background: linear-gradient\(\s*135deg,\s*var\(--backdrop-a\),\s*var\(--backdrop-b\) 50%,\s*var\(--backdrop-c\)\s*\);/,
    );
  });

  it("removes the solid layers that hid it", () => {
    expect(shell).not.toMatch(/bg-shell-bg/);
    expect(mainAttributes(shell)).not.toMatch(
      /\bbg-(?:background|card|popover|muted|shell-[\w-]+)\b/,
    );
    expect(read("routes/traveller.css")).toMatch(/background:\s*transparent;/);
    expect(read("routes/map.css")).toMatch(/background:\s*transparent;/);
    // The light theme no longer strips every backdrop-blur.
    expect(plain).not.toMatch(
      /\[class\*='backdrop-blur'\][^{]*\{[^}]*backdrop-filter:\s*none/,
    );
  });

  it("defines the glass utilities with a solid fallback, Safari prefix and phone blur", () => {
    const layerCss = plain.slice(
      plain.search(/@layer components \{\s*\.glass,/),
    );
    const base = layerCss.slice(0, layerCss.indexOf("@supports"));
    const supports = layerCss.slice(layerCss.indexOf("@supports"));
    expect(base).toMatch(/background-color: var\(--glass-fallback\);/);
    expect(base).not.toMatch(/backdrop-filter/);
    expect(supports).toMatch(
      /\.glass,\s*\.glass-pill \{\s*background-color: var\(--glass-panel\);\s*-webkit-backdrop-filter: blur\(24px\) saturate\(150%\);\s*backdrop-filter: blur\(24px\) saturate\(150%\);/,
    );
    expect(supports).toMatch(
      /\.glass-strong \{\s*background-color: var\(--glass-panel-strong\);\s*-webkit-backdrop-filter: blur\(40px\)/,
    );
    expect(supports).toMatch(/@media \(width < 64rem\) \{[^@]*blur\(16px\)/);
    expect(plain).toMatch(/\.glass-pill \{\s*border-radius: 9999px;/);
  });

  it("turns motion off under reduced motion", () => {
    const at = [
      ...plain.matchAll(
        /@media \(prefers-reduced-motion: reduce\) \{\s*\.glass,/g,
      ),
    ].at(-1)?.index;
    expect(at).toBeDefined();
    const reduced = plain.slice(at);
    expect(reduced).toMatch(/transition: none;/);
    expect(reduced).toMatch(/translate: none;/);
  });

  it("uses Inter for headings, never Oxanium", () => {
    expect(light["--font-heading"]).toBe('"Inter", system-ui, sans-serif');
    expect(root).not.toMatch(/Oxanium/);
    expect(root).toMatch(/family=Inter:wght@400;500;600;700/);
  });
});

describe("shell and home use the glass", () => {
  const rail = read("components/app-shell/rail.tsx");
  const bars = read("components/app-shell/top-bars.tsx");
  const home = read("routes/index.tsx");

  it("floats the rail as a glass panel with an orange active item", () => {
    expect(rail).toMatch(/sticky top-0 hidden h-svh shrink-0 p-4/);
    expect(rail).toMatch(
      /glass-strong flex min-h-0 w-full flex-col overflow-hidden rounded-3xl/,
    );
    expect(rail).toMatch(/"rp-rail-active text-shell-text"/);
    expect(plain).toMatch(
      /\.rp-rail-active-bar \{[^}]*box-shadow: 0 0 10px 1px var\(--accent-from\);/,
    );
  });

  it("keeps the desktop top bar clear until content scrolls under it", () => {
    expect(bars).toMatch(/data-scrolled=\{scrolled\}/);
    expect(bars).toMatch(/rp-topbar sticky top-0 z-\(--z-header\) flex h-14/);
    expect(bars).toMatch(
      /rp-shell sticky top-0 z-\(--z-header\) flex h-14[^"]*glass-strong[^"]*lg:hidden/,
    );
    expect(plain).toMatch(
      /\.rp-topbar\[data-scrolled="true"\]\s*\{\s*background-color: var\(--glass-panel-strong\);/,
    );
    expect(bars).toMatch(/glass h-11 w-full rounded-2xl/);
    expect(bars).toMatch(/glass-strong fixed inset-x-0 bottom-0/);
  });

  it("keeps the home hero focused on search and report without route decoration", () => {
    expect(home).not.toMatch(/home-eyebrow|home-underline|home-search-quick/);
    expect(home).toMatch(/home-search glass-strong/);
    expect(home).toMatch(/home-search-field glass/);
    expect(home).toMatch(/className="glass-btn-accent"/);
    expect(home).not.toMatch(/home-action-check|MapIcon|QUICK_ROADS/);
    expect(home).toMatch(/home-action home-action-report glass/);
    expect(home).not.toMatch(/IllustrativeRoute|home-route-line|home-route-pin/);
    expect(read("routes/home.css")).not.toMatch(/\.home-route/);
    expect(home).toMatch(/highlight=\{lang === 'en' \? 'you' : null\}/);
    expect(home).not.toMatch(/hero-mountain\.png|home-hero-overlay/);
    const contributions = read("features/contributions/contribution-ui.tsx");
    const levelBadge = contributions.slice(
      contributions.indexOf("export function LevelBadge"),
      contributions.indexOf("export function Card"),
    );
    expect(levelBadge).toContain("text-foreground");
    expect(levelBadge).not.toContain("text-brand-orange");
    const schematicMap = read("features/routes/schematic-map.tsx");
    expect(schematicMap).toContain('terrain ? "var(--route-glow)"');
    expect(schematicMap).toContain('color="var(--report-foreground)"');
    expect(schematicMap).toContain('stroke="var(--report-foreground)"');
    expect(read("components/ui/button.tsx")).toMatch(
      /report: 'glass-btn-accent'/,
    );
  });

  it("removes redundant decorative bars while retaining their text", () => {
    const advisories = read("routes/advisories.index.tsx");
    expect(advisories).toContain('{t("hero.eyebrow")}');
    expect(advisories).not.toMatch(/h-0\.5 w-7 bg-brand-orange/);
    const help = read("routes/help.tsx");
    expect(help).toContain('{t("help.reminderTitle")}');
    expect(help).not.toContain("help-reminder-rule");
    expect(read("routes/help.css")).not.toContain(".help-reminder-rule");
  });
});

/* ── Phase 2A: src/components/ui/* use the Phase 1 glass utilities ──────────── */
const ui = (name: string) => read(`components/ui/${name}.tsx`);
const UI_FILES = [
  "card",
  "input",
  "textarea",
  "select",
  "dialog",
  "sheet",
  "dropdown-menu",
  "popover",
  "tabs",
  "table",
  "alert",
  "switch",
  "skeleton",
  "tooltip",
  "sonner",
] as const;

describe("phase 2A: only the existing Phase 1 glass tokens", () => {
  it("adds no glass values: the --glass-* tokens are exactly the Phase 1 set", () => {
    const names = new Set(
      [...plain.matchAll(/(--glass-[\w-]+):/g)].map((m) => m[1]),
    );
    expect([...names].sort()).toEqual(
      [
        "--glass-accent-base",
        "--glass-accent-glow",
        "--glass-accent-line",
        "--glass-accent-text",
        "--glass-accent-tint",
        "--glass-divider",
        "--glass-fallback",
        "--glass-highlight",
        "--glass-hover",
        "--glass-line",
        "--glass-panel",
        "--glass-panel-strong",
        "--glass-shadow",
      ].sort(),
    );
  });

  it("the components only name the six Phase 1 utilities", () => {
    const allowed = new Set([
      "glass",
      "glass-strong",
      "glass-accent",
      "glass-pill",
      "glass-btn-accent",
      "glass-btn-frost",
    ]);
    for (const name of UI_FILES) {
      const used = [
        ...ui(name).matchAll(/(?<![\w-])(glass[\w-]*)(?![\w-])/g),
      ].map((m) => m[1]);
      for (const cls of used)
        expect(allowed.has(cls), `${name}: ${cls}`).toBe(true);
    }
  });

  it("replaces every solid card, popover, background and muted fill", () => {
    for (const name of UI_FILES.filter((n) => n !== "switch"))
      expect(
        // after:bg-foreground is the line-tab underline, not a surface.
        ui(name).replace(/after:bg-foreground/g, ""),
        name,
      ).not.toMatch(
        /(?<![\w-])bg-(card|popover|background|muted|foreground)(?![\w-])/,
      );
    // The switch keeps its on/off colours and a solid knob: the control must
    // stay readable as a state (3:1), whatever is behind it.
    expect(ui("switch")).toMatch(
      /data-\[state=checked\]:bg-primary data-\[state=unchecked\]:bg-input/,
    );
  });

  it("glass surfaces carry no shadow utility (it would replace the glass shadow)", () => {
    for (const name of [
      "card",
      "input",
      "textarea",
      "select",
      "dialog",
      "sheet",
      "dropdown-menu",
      "popover",
      "table",
      "alert",
      "skeleton",
      "tooltip",
      "switch",
    ])
      expect(ui(name), name).not.toMatch(
        /(?<![\w-])shadow-(xs|sm|md|lg|xl|2xl)(?![\w-])/,
      );
  });
});

describe("phase 2A: each component", () => {
  it("cards, alerts, tables and skeleton cards are .glass panels at the card radius", () => {
    expect(ui("card")).toMatch(
      /'glass text-card-foreground flex flex-col gap-6 rounded-2xl py-6'/,
    );
    expect(ui("alert")).toMatch(/'glass relative grid [^']*rounded-2xl/);
    expect(ui("table")).toMatch(
      /className="glass relative w-full overflow-x-auto rounded-2xl"/,
    );
    expect(ui("skeleton")).toMatch(/'glass grid gap-3 rounded-2xl p-4'/);
    // Table rows: strong panel on hover/selected (never the lightening
    // --glass-hover, which pushes muted text under AA in dark), glass dividers.
    expect(ui("table")).toMatch(/hover:bg-\(--glass-panel-strong\)/);
    expect(ui("table")).toMatch(
      /data-\[state=selected\]:bg-\(--glass-panel-strong\)/,
    );
    expect(ui("table")).toMatch(
      /data-\[state=selected\]:shadow-\[inset_3px_0_0_var\(--glass-accent-line\)\]/,
    );
    expect(ui("table")).not.toMatch(/--glass-hover/);
    expect(ui("table")).toMatch(/border-\(--glass-divider\)/);
  });

  it("dialogs, sheets, menus, popovers, select lists and tooltips are .glass-strong", () => {
    expect(ui("dialog")).toMatch(/rounded-3xl glass-strong p-6/);
    expect(ui("sheet")).toMatch(/'glass-strong fixed z-\(--z-sheet\)/);
    for (const side of [
      "rounded-l-3xl",
      "rounded-r-3xl",
      "rounded-b-3xl",
      "rounded-t-3xl",
    ])
      expect(ui("sheet")).toContain(side);
    expect(ui("dropdown-menu").match(/rounded-2xl glass-strong/g)).toHaveLength(
      2,
    );
    expect(ui("popover")).toMatch(/rounded-2xl glass-strong p-4/);
    expect(ui("select")).toMatch(
      /overflow-y-auto rounded-2xl glass-strong text-popover-foreground/,
    );
    expect(ui("tooltip")).toMatch(
      /rounded-xl glass-strong px-3 py-1\.5 text-xs text-balance text-foreground/,
    );
    expect(ui("tooltip")).toMatch(
      /bg-\(--glass-panel-strong\) fill-\(--glass-panel-strong\)/,
    );
  });

  it("inputs, textareas and select triggers are glass fields with a clear focus ring", () => {
    const fields = [
      ui("input").match(/'rp-field glass min-h-11[^']*'/)?.[0] ?? "",
      ui("textarea").match(/'rp-field glass flex[^']*'/)?.[0] ?? "",
      ui("select").match(/"rp-field glass flex[^"]*"/)?.[0] ?? "",
    ];
    const sources = [ui("input"), ui("textarea"), ui("select")];
    fields.forEach((field, i) => {
      expect(field, `field ${i}`).toContain("rounded-xl");
      // A visible edge on the glass (3:1 is checked below) and a full-strength
      // ring; the ring is on a second class string in input.tsx, so use the file.
      expect(field).toContain("border-muted-foreground/70");
      expect(sources[i]).toContain("focus-visible:ring-[3px]");
      expect(sources[i]).toMatch(/focus-visible:ring-ring(?![/\w])/);
      expect(sources[i]).not.toMatch(/ring-ring\/50/);
    });
    // Placeholder: the --muted-foreground token (about 72% white in dark).
    expect(fields[0]).toContain("placeholder:text-muted-foreground");
    expect(fields[1]).toContain("placeholder:text-muted-foreground");
    expect(fields[2]).toContain("data-[placeholder]:text-muted-foreground");
    // The test in motion.test.tsx relies on these two classes staying.
    expect(fields[0]).toContain("rp-field");
  });

  it("tabs: a glass list, a strong active tab, and muted (not 60%) inactive labels", () => {
    const tabs = ui("tabs");
    expect(tabs).toMatch(/default: 'glass rounded-xl'/);
    expect(tabs).toContain("data-[state=active]:bg-(--glass-panel-strong)");
    expect(tabs).toContain("data-[state=active]:border-(--glass-line)");
    expect(tabs).toContain("text-muted-foreground rp-press");
    expect(tabs).not.toMatch(/text-foreground\/60/);
  });

  it("toasts are glass-strong: the fill comes from tokens, with a solid fallback", () => {
    expect(ui("sonner")).toContain(
      "toastOptions={{ classNames: { toast: 'glass-strong' } }}",
    );
    // The fill is not set inline (an inline style would beat the stylesheet).
    expect(ui("sonner")).not.toMatch(/'--normal-bg':/);
    expect(plain).toMatch(
      /\.toaster\[data-sonner-toaster\]\[data-sonner-theme\] \{\s*--normal-bg: var\(--glass-fallback\);/,
    );
    expect(plain).toMatch(
      /@supports\s*\(\s*\(backdrop-filter: blur\(1px\)\)\s*or\s*\(-webkit-backdrop-filter: blur\(1px\)\)\s*\)\s*\{\s*\.toaster\[data-sonner-toaster\]\[data-sonner-theme\]\s*\{\s*--normal-bg: var\(--glass-panel-strong\);/,
    );
  });
});

describe("phase 2A: contrast of the new surfaces", () => {
  /** Scrim colour and alpha: `rgb(R G B / N%)`. */
  const scrim = (theme: Theme): [RGB, number] => {
    const m = /^rgb\((\d+) (\d+) (\d+) \/ (\d+)%\)$/.exec(
      resolve(theme, "--scrim"),
    );
    if (!m)
      throw new Error(
        `--scrim is not rgb(R G B / N%): ${resolve(theme, "--scrim")}`,
      );
    return [[Number(m[1]), Number(m[2]), Number(m[3])], Number(m[4]) / 100];
  };
  const TEXT = [
    "--foreground",
    "--popover-foreground",
    "--muted-foreground",
    "--link",
  ];
  /** Body and muted text only: see the link-over-black note in the dialog test. */
  const BODY = TEXT.slice(0, 3);

  for (const name of ["light", "dark"] as const) {
    const theme = THEMES[name];

    it(`${name}: dialogs and sheets keep body and muted text AA over any page content (the scrim darkens it first)`, () => {
      const [sc, sa] = scrim(theme);
      for (const content of [BLACK, WHITE]) {
        const behind = over(sc, sa, content);
        const surface = layer(theme, "--glass-panel-strong", behind);
        for (const text of BODY)
          expect(
            contrast(hex(theme, text), surface),
            `${text} over ${content}`,
          ).toBeGreaterThanOrEqual(4.5);
        // Link text is only guaranteed over the backdrop and the page surfaces
        // (next test): in the light theme, over pure black content (the map page
        // is dark in both themes) it reaches 3.7:1, below AA.
        if (name === "dark")
          expect(
            contrast(hex(theme, "--link"), surface),
            `--link over ${content}`,
          ).toBeGreaterThanOrEqual(4.5);
      }
    });

    it(`${name}: menus, popovers, select lists and tooltips pass over the backdrop and the page surfaces`, () => {
      const unders = [
        ...backdrops(name),
        hex(theme, "--background"),
        hex(theme, "--card"),
      ];
      for (const under of unders) {
        const surface = layer(theme, "--glass-panel-strong", under);
        for (const text of TEXT)
          expect(
            contrast(hex(theme, text), surface),
            text,
          ).toBeGreaterThanOrEqual(4.5);
      }
    });

    it(`${name}: field edge and focus ring are at least 3:1 against the glass field`, () => {
      for (const bg of backdrops(name)) {
        const surround = layer(theme, "--glass-panel-strong", bg);
        const fill = layer(theme, "--glass-panel", surround);
        const [c] = [hex(theme, "--muted-foreground")];
        const edge = over(c, 0.7, fill);
        expect(contrast(edge, fill), "edge on fill").toBeGreaterThanOrEqual(3);
        expect(
          contrast(edge, surround),
          "edge on surround",
        ).toBeGreaterThanOrEqual(3);
        expect(
          contrast(hex(theme, "--ring"), fill),
          "ring",
        ).toBeGreaterThanOrEqual(3);
      }
    });

    it(`${name}: placeholder, tab labels and table text pass on their glass`, () => {
      for (const bg of backdrops(name)) {
        const panel = layer(theme, "--glass-panel", bg);
        const strongOnPanel = layer(theme, "--glass-panel-strong", panel);
        const hover = layer(theme, "--glass-panel-strong", panel);
        const selected = hover;
        // Placeholder and inactive tab labels: muted text on the panel.
        expect(
          contrast(hex(theme, "--muted-foreground"), panel),
        ).toBeGreaterThanOrEqual(4.5);
        // Active tab: foreground on the strong panel over the tab list.
        expect(
          contrast(hex(theme, "--foreground"), strongOnPanel),
        ).toBeGreaterThanOrEqual(4.5);
        // Table rows: hover and selected states.
        for (const row of [hover, selected])
          for (const text of ["--foreground", "--muted-foreground"])
            expect(
              contrast(hex(theme, text), row),
              text,
            ).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  it("the old 60% inactive tab colour and a 70% placeholder would not pass in dark (why tokens are used)", () => {
    // foreground at 60% and 70% over the dark panel at its worst backdrop.
    const worst = backdrops("dark").map((bg) =>
      layer(dark, "--glass-panel", bg),
    );
    const fg = hex(dark, "--foreground");
    const at = (alpha: number) =>
      Math.min(...worst.map((s) => contrast(over(fg, alpha, s), s)));
    expect(at(0.6)).toBeLessThan(4.5);
    expect(at(0.7)).toBeLessThan(4.5);
    expect(
      Math.min(
        ...worst.map((s) => contrast(hex(dark, "--muted-foreground"), s)),
      ),
    ).toBeGreaterThanOrEqual(4.5);
  });
});

/* ── Phase 2B: shared components (advisory, banner, status, banners, palette, errors, footer) ── */
const comp = (name: string) => read(`components/${name}`);
const B_FILES = [
  "advisory.tsx",
  "page-banner.tsx",
  "system-status.tsx",
  "offline-banner.tsx",
  "feature-search-modal.tsx",
  "error-pages.tsx",
  "app-shell/site-footer.tsx",
] as const;
const bannerCss = read("components/page-banner.css").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);
/** The body of the first CSS rule whose selector is exactly `selector`. */
const rule = (css: string, selector: string) =>
  [...css.matchAll(/(^|\n)([^{}@]+)\{([^{}]*)\}/g)].find(
    (m) => m[2].trim() === selector,
  )?.[3] ?? "";

describe("phase 2B: structure", () => {
  it("only names the six Phase 1 glass utilities, with no hard-coded hex", () => {
    const allowed = new Set([
      "glass",
      "glass-strong",
      "glass-accent",
      "glass-pill",
      "glass-btn-accent",
      "glass-btn-frost",
    ]);
    for (const file of B_FILES) {
      const source = comp(file);
      for (const m of source.matchAll(/(?<![\w-])(glass[\w-]*)(?![\w-])/g))
        expect(allowed.has(m[1]), `${file}: ${m[1]}`).toBe(true);
      expect(source, file).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(source, file).not.toMatch(
        /(?<![\w-])bg-(card|popover|background|muted|raised|shell-\w+)(?![\w-])/,
      );
    }
  });

  it("severity badges are tinted glass pills; the label and a different icon carry the severity", () => {
    const source = comp("advisory.tsx");
    expect(source).toContain(
      "rp-fade-in glass-pill inline-flex items-center gap-1.5 rounded-full border font-semibold text-foreground shadow-none",
    );
    expect(source).toMatch(
      /const TINT_15 =\s*"bg-\[linear-gradient\(color-mix\(in_srgb,var\(--tint\)_15%,transparent\),color-mix\(in_srgb,var\(--tint\)_15%,transparent\)\)\]"/,
    );
    for (const level of ["clear", "caution", "avoid", "dnt", "unknown"])
      expect(source).toContain(
        `border-status-${level} [--tint:var(--status-${level})]`,
      );
    expect(source).toContain("[--tint:var(--status-official)]");
    // The label text and the icon are always rendered with the badge.
    expect(source).toMatch(/<Icon[\s\S]*?\/>\s*\{t\(`level\.\$\{level\}`\)\}/);
    // No solid status fill on a badge (the unknown state must never look green).
    expect(source).not.toMatch(
      /bg-status-(clear|caution|avoid|dnt|unknown|official)\/15/,
    );
  });

  it("the banner is a glass-strong panel over its photo, with the heading in Inter", () => {
    expect(comp("page-banner.tsx")).toContain(
      'className="rp-info-container rp-info-banner-content glass-strong rounded-3xl"',
    );
    // The photo and its scrim stay on the banner itself (photo-overlay.test.ts).
    expect(rule(bannerCss, ".rp-info-banner")).toMatch(
      /var\(--photo-scrim-a\)/,
    );
    expect(rule(bannerCss, ".rp-info-banner h1")).toContain(
      "font-family: var(--font-heading);",
    );
    expect(light["--font-heading"]).toBe('"Inter", system-ui, sans-serif');
    for (const selector of [
      ".rp-info-banner h1",
      ".rp-info-eyebrow",
      ".rp-info-banner-description",
    ])
      expect(rule(bannerCss, selector), selector).not.toMatch(/--tone-/);
    expect(rule(bannerCss, ".rp-info-banner h1")).toContain(
      "color: var(--foreground);",
    );
    expect(rule(bannerCss, ".rp-info-banner-description")).toContain(
      "color: var(--foreground);",
    );
  });

  it("the info page and its cards do not declare solid fallbacks", () => {
    expect(rule(bannerCss, ".rp-info-page")).not.toMatch(/background/);
    expect(bannerCss).not.toMatch(/\.dark \.rp-info-page/);
    expect(rule(bannerCss, ".rp-info-card")).not.toMatch(/background|border:/);
    expect(bannerCss).not.toMatch(/\.rp-info-card:not\(\.glass\)/);
  });

  it("error pages are a centred glass-strong card on the backdrop", () => {
    const source = comp("error-pages.tsx");
    expect(
      source.match(/glass-strong w-full max-w-(lg|md)[^"]*rounded-3xl/g),
    ).toHaveLength(2);
    expect(source).toContain('className="rp-info-page rp-error-page"');
    expect(source).toContain('className="rp-error-page"');
    expect(source).not.toContain("PageBanner");
    const css = rule(bannerCss, ".rp-error-page");
    expect(css).toMatch(/place-items: center;/);
    expect(css).not.toMatch(/background/);
    expect(css).not.toMatch(/url\(/);
    expect(bannerCss).not.toMatch(/\.rp-error-page::(?:before|after)/);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    // Headings, links and the alert role the tests and screen readers rely on.
    expect(source).toContain("This page could not be found");
    expect(source).toContain("This page couldn’t load");
    expect(source).toContain('role="alert"');
  });

  it("status badges and cards are glass; state text is --foreground with a coloured edge or icon", () => {
    const source = comp("system-status.tsx");
    expect(source).toContain(
      "glass-pill inline-flex shrink-0 items-center gap-1.5 border px-2 py-0.5 text-xs font-semibold text-foreground shadow-none",
    );
    expect(source).toContain('className="rp-info-card glass list-none"');
    expect(source).toMatch(
      /glass flex min-w-0 flex-col items-start gap-1\.5 rounded-2xl p-3/,
    );
    // No status colour as a text colour; the icons (the [&>svg]: variants) may use it.
    expect(source).not.toMatch(
      /(?<![\w:-])text-status-(clear|caution|dnt|unknown)(?![\w-])/,
    );
    expect(source.match(/\[&>svg\]:text-status-/g)).toHaveLength(4);
    expect(source.match(/border-l-4 border-status-/g)).toHaveLength(3);
    // The state is still named by its label and its own icon.
    expect(source).toMatch(/<Icon[\s\S]*?\/>\s*\{t\(label\)\}/);
  });

  it("the offline panel keeps AA text and glass hover; the palette rows and chips use glass tokens", () => {
    const offline = comp("offline-banner.tsx");
    expect(offline).not.toMatch(/(?<![\w-])text-status-dnt(?![\w-])/);
    expect(offline).toContain("hover:bg-(--glass-panel-strong)");
    const palette = comp("feature-search-modal.tsx");
    expect(palette).toContain(
      "border-(--glass-line) bg-(--glass-panel-strong) shadow-[inset_3px_0_0_var(--glass-accent-line)]",
    );
    expect(palette).toContain(
      "bg-(--glass-divider) text-(--glass-accent-text)",
    );
    expect(palette).not.toMatch(/border-border|bg-raised/);
    expect(palette).toContain(
      "z-(--z-content) size-4 -translate-y-1/2 text-muted-foreground",
    );
  });

  it("the footer is a glass strip with its edge on top only", () => {
    expect(comp("app-shell/site-footer.tsx")).toContain(
      'className="glass rounded-t-3xl border-x-0 border-b-0"',
    );
  });

  it("light theme: the glass containers keep their glass shadow instead of the global orange glow", () => {
    const focus =
      plain.match(
        /:root:not\(\.dark\) \[data-slot="dropdown-menu-content"\]:focus-visible,[^{]*\{([^}]*)\}/,
      )?.[1] ?? "";
    expect(focus).toMatch(/box-shadow:\s*var\(--glass-shadow\)/);
    expect(focus).not.toMatch(/orange|outline/);
  });
});

/* ── Focus ring on the glass overlay containers ────────────────────────────── */
describe("focus ring: rules", () => {
  /** [selector list, body] of the rule that draws the 2px ring on the containers. */
  const containerRule = plain.match(
    /(\[data-slot="dropdown-menu-content"\]\[data-open-source="keyboard"\]:focus-visible,[^{]*)\{([^}]*)\}/,
  );
  const itemRule = plain.match(
    /(\[data-slot="dropdown-menu-content"\]\[data-open-source="keyboard"\]\s*:is\([^{]*:focus-visible)\s*\{([^}]*)\}/,
  );

  it("draws a 2px solid --ring, inside the edge, with !important to beat Radix's inline outline:none", () => {
    for (const body of [containerRule?.[2], itemRule?.[2]]) {
      expect(body).toMatch(/outline: 2px solid var\(--ring\) !important;/);
      // Inside the edge, so the ring is drawn on the glass panel it is measured against.
      expect(body).toMatch(/outline-offset: -2px !important;/);
    }
  });

  it("applies to :focus-visible only, so a mouse click shows none", () => {
    const selectors = (containerRule?.[1] ?? "")
      .split(",")
      .map((s) => s.trim());
    expect(selectors).toEqual([
      '[data-slot="dropdown-menu-content"][data-open-source="keyboard"]:focus-visible',
      '[data-slot="dropdown-menu-sub-content"]:focus-visible',
      '[data-slot="popover-content"]:focus-visible',
      '[data-slot="select-content"]:focus-visible',
      '[data-slot="dialog-content"]:focus-visible',
      '[data-slot="sheet-content"]:focus-visible',
    ]);
    expect(itemRule?.[1]).toMatch(
      /\[data-slot="dropdown-menu-item"\][\s\S]*\[data-slot="dropdown-menu-checkbox-item"\][\s\S]*\[data-slot="dropdown-menu-radio-item"\][\s\S]*\[data-slot="dropdown-menu-sub-trigger"\]\s*\):focus-visible/,
    );
  });

  it("every selector names a slot that a ui component really renders", () => {
    const rendered = [
      ["dropdown-menu-content", "dropdown-menu"],
      ["dropdown-menu-sub-content", "dropdown-menu"],
      ["dropdown-menu-item", "dropdown-menu"],
      ["dropdown-menu-checkbox-item", "dropdown-menu"],
      ["dropdown-menu-radio-item", "dropdown-menu"],
      ["dropdown-menu-sub-trigger", "dropdown-menu"],
      ["popover-content", "popover"],
      ["select-content", "select"],
      ["dialog-content", "dialog"],
      ["sheet-content", "sheet"],
    ] as const;
    for (const [slot, file] of rendered)
      expect(ui(file), slot).toContain(`data-slot="${slot}"`);
  });

  it("the dropdown records whether it was opened by pointer or keyboard, per open", () => {
    const source = ui("dropdown-menu");
    expect(source).toContain(
      "let lastOpenSource: 'pointer' | 'keyboard' = 'keyboard'",
    );
    expect(source).toMatch(
      /onPointerDown=\{\(event\) => \{\s*lastOpenSource = 'pointer'\s*onPointerDown\?\.\(event\)/,
    );
    expect(source).toMatch(
      /onKeyDown=\{\(event\) => \{\s*lastOpenSource = 'keyboard'\s*onKeyDown\?\.\(event\)/,
    );
    // Set in a ref callback (it runs on every mount of Radix's menu element,
    // before focus moves in), passing the caller's own ref on.
    expect(source).toMatch(/node\.dataset\.openSource = lastOpenSource/);
    expect(source).toMatch(/if \(typeof ref === 'function'\) ref\(node\)/);
    expect(source).toContain("ref={setRef}");
  });
});

describe("focus ring: contrast", () => {
  for (const name of ["light", "dark"] as const) {
    const theme = THEMES[name];
    const ring = () => hex(theme, "--ring");

    it(`${name}: the ring is at least 3:1 on the strong panel, over the backdrop and the page surfaces`, () => {
      const unders = [
        ...backdrops(name),
        hex(theme, "--background"),
        hex(theme, "--card"),
      ];
      for (const under of unders)
        expect(
          contrast(ring(), layer(theme, "--glass-panel-strong", under)),
        ).toBeGreaterThanOrEqual(3);
    });

    it(`${name}: dialogs and sheets stay at 3:1 over any page content (the scrim darkens it first)`, () => {
      const m = /^rgb\((\d+) (\d+) (\d+) \/ (\d+)%\)$/.exec(
        resolve(theme, "--scrim"),
      );
      if (!m) throw new Error("--scrim is not rgb(R G B / N%)");
      const scrim: RGB = [Number(m[1]), Number(m[2]), Number(m[3])];
      for (const content of [BLACK, WHITE]) {
        const behind = over(scrim, Number(m[4]) / 100, content);
        expect(
          contrast(ring(), layer(theme, "--glass-panel-strong", behind)),
          `over ${content}`,
        ).toBeGreaterThanOrEqual(3);
      }
    });

    it(`${name}: the ring on a focused menu item is at least 3:1 on the item's own highlight`, () => {
      for (const bg of backdrops(name)) {
        const panel = layer(theme, "--glass-panel-strong", bg);
        const highlighted = over(hex(theme, "--accent"), 1, panel);
        expect(
          contrast(ring(), highlighted),
          "on the item",
        ).toBeGreaterThanOrEqual(3);
        expect(contrast(ring(), panel), "on the panel").toBeGreaterThanOrEqual(
          3,
        );
      }
    });
  }
});

describe("phase 2B: contrast", () => {
  const percentRgb = (value: string): [RGB, number] => {
    const m = /^rgb\((\d+) (\d+) (\d+) \/ (\d+)%\)$/.exec(value);
    if (!m) throw new Error(`not rgb(R G B / N%): ${value}`);
    return [[Number(m[1]), Number(m[2]), Number(m[3])], Number(m[4]) / 100];
  };
  /** The photo scrim stops: the first declaration is the light theme, the second the dark one. */
  const scrim = (name: "light" | "dark") =>
    ["--photo-scrim-a", "--photo-scrim-b", "--photo-scrim-c"].map((token) => {
      const all = [
        ...plain.matchAll(new RegExp(`${token}:\\s*([^;]+);`, "g")),
      ].map((m) => m[1].trim());
      expect(all.length, token).toBe(2);
      return percentRgb(all[name === "light" ? 0 : 1]);
    });
  const LEVEL_TOKENS = [
    "--status-clear",
    "--status-caution",
    "--status-avoid",
    "--status-dnt",
    "--status-unknown",
    "--status-official",
  ];

  for (const name of ["light", "dark"] as const) {
    const theme = THEMES[name];

    it(`${name}: banner text passes on the glass panel at every scrim stop, over the worst photo pixel`, () => {
      for (const [color, alpha] of scrim(name)) {
        const behind = over(color, alpha, WORST[name]);
        const surface = layer(theme, "--glass-panel-strong", behind);
        expect(
          contrast(hex(theme, "--foreground"), surface),
        ).toBeGreaterThanOrEqual(4.5);
      }
    });

    it(`${name}: severity badge text passes on the tinted glass over the backdrop and the page surfaces`, () => {
      const unders = [
        ...backdrops(name),
        hex(theme, "--background"),
        hex(theme, "--card"),
      ];
      for (const under of unders)
        for (const token of LEVEL_TOKENS) {
          const panel = layer(theme, "--glass-panel", under);
          const tinted = over(hex(theme, token), 0.15, panel);
          expect(
            contrast(hex(theme, "--foreground"), tinted),
            token,
          ).toBeGreaterThanOrEqual(4.5);
        }
    });

    it(`${name}: status colours stay at 3:1 as icons and edges on glass`, () => {
      for (const bg of backdrops(name)) {
        const panel = layer(theme, "--glass-panel", bg);
        for (const token of [
          "--status-clear",
          "--status-caution",
          "--status-dnt",
          "--status-unknown",
        ])
          expect(
            contrast(hex(theme, token), panel),
            token,
          ).toBeGreaterThanOrEqual(3);
      }
    });

    it(`${name}: the selected palette row, its icon tile and the footer text pass`, () => {
      for (const bg of backdrops(name)) {
        const dialog = layer(theme, "--glass-panel-strong", bg);
        const selected = layer(theme, "--glass-panel-strong", dialog);
        for (const text of ["--foreground", "--muted-foreground", "--link"])
          expect(
            contrast(hex(theme, text), selected),
            text,
          ).toBeGreaterThanOrEqual(4.5);
        const tile = layer(theme, "--glass-divider", dialog);
        expect(
          contrast(hex(theme, "--glass-accent-text"), tile),
          "icon tile",
        ).toBeGreaterThanOrEqual(3);
        const footer = layer(theme, "--glass-panel", bg);
        for (const text of ["--foreground", "--muted-foreground", "--link"])
          expect(
            contrast(hex(theme, text), footer),
            `footer ${text}`,
          ).toBeGreaterThanOrEqual(4.5);
      }
    });

    it(`${name}: the 2px focus ring is at least 3:1 against the strong panel`, () => {
      for (const bg of backdrops(name)) {
        const panel = layer(theme, "--glass-panel-strong", bg);
        expect(contrast(hex(theme, "--ring"), panel)).toBeGreaterThanOrEqual(3);
      }
    });
  }
});
