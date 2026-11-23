import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Layout contract between the app shell and page CSS. jsdom does no layout,
 * so these check the source rules that keep pages clear of the shell's bars.
 */
const SRC = join(process.cwd(), "src");
const read = (p: string) => readFileSync(join(SRC, p), "utf8");
const noComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "");

function walk(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx?|css)$/.test(name) && !/\.test\.tsx?$/.test(name))
      out.push(full);
  }
  return out;
}

const styles = noComments(read("styles.css"));
const mapCss = noComments(read("routes/map.css"));
const homeCss = noComments(read("routes/home.css"));
const bars = read("components/app-shell/top-bars.tsx");
const root = read("routes/__root.tsx");
const motion = read("components/motion.tsx");

describe("viewport-height pages and the shell bars", () => {
  it("subtracts the top bar, plus the bottom tabs below 1024px, from shell tokens", () => {
    expect(styles).toMatch(/--rp-top-h:\s*var\(--shell-bar-height\);/);
    expect(styles).toMatch(
      /@media \(width < 64rem\)\s*\{\s*:root\s*\{\s*--rp-top-h:\s*calc\(\s*var\(--shell-bar-height\) \+ var\(--shell-tabs-height\) \+\s*env\(safe-area-inset-bottom\)\s*\);/,
    );
  });

  it("every 100svh height in page CSS subtracts --rp-top-h", () => {
    const offenders = walk(SRC)
      .filter((f) => f.endsWith(".css"))
      .flatMap((f) =>
        noComments(readFileSync(f, "utf8"))
          .split("\n")
          .filter((line) => line.includes("100svh"))
          .filter((line) => !/calc\(100svh - var\(--rp-top-h\)\)/.test(line))
          .map((line) => `${f}: ${line.trim()}`),
      );
    expect(offenders).toEqual([]);
  });
});

describe("mobile top bar fits at 360px", () => {
  it("lets the logo give way while the controls keep 44px", () => {
    expect(bars).toMatch(
      /rp-shell sticky top-0 z-\(--z-header\)[^"]*glass-strong[^"]*lg:hidden/,
    );
    expect(bars).toMatch(/<ShellLogo\s+className="min-w-0 shrink"/);
    expect(bars).toMatch(
      /wordmarkClassName="min-w-0 truncate max-sm:text-base max-390:hidden"/,
    );
    expect(bars).toMatch(/ChevronDown aria-hidden className="size-4 max-sm:hidden"/);
    // Search, language and both account triggers do not shrink.
    expect(bars.match(/shrink-0/g)?.length).toBeGreaterThanOrEqual(4);
    expect(read("components/app-shell/shell-status.tsx")).toMatch(
      /min-h-11 min-w-11 shrink-0/,
    );
  });

  it("keeps the section label screen-reader-only below 640px", () => {
    expect(bars).toMatch(/data-testid="shell-section"[\s\S]*?max-sm:sr-only/);
  });
});

describe("floating elements clear the bottom tabs", () => {
  const offset =
    "bottom-[calc(var(--shell-tabs-height)+1.5rem+env(safe-area-inset-bottom))]";

  it("puts the prototype ribbon above the raised Report button and right of back-to-top", () => {
    const ribbon = root.match(/className="rp-demo-badge-ribbon ([^"]+)"/)?.[1];
    expect(ribbon).toBeDefined();
    const cls = ribbon!.split(/\s+/);
    // The Report button rises 1.25rem (-mt-5) above the tab bar.
    expect(cls).toEqual(
      expect.arrayContaining([
        "pointer-events-none",
        "fixed",
        offset,
        "left-16",
        "lg:bottom-2",
      ]),
    );
    expect(ribbon).not.toMatch(/calc\(5rem/);
    expect(bars).toMatch(/-mt-5 grid size-14/);
  });

  it("moves back-to-top off the desktop rail", () => {
    const fab = motion.match(/className="rp-fab ([^"]+)"/)?.[1] ?? "";
    expect(fab.split(/\s+/)).toEqual(
      expect.arrayContaining([offset, "left-3", "lg:right-4", "lg:left-auto"]),
    );
    expect(fab).not.toMatch(/\bxl:/);
  });

  it("keeps dialogs, sheets and menus above the bottom tabs", () => {
    const z = (name: string) =>
      Number(styles.match(new RegExp(`--z-${name}:\\s*(\\d+);`))?.[1]);
    expect(z("bottom-nav")).toBeLessThan(z("overlay"));
    expect(z("bottom-nav")).toBeLessThan(z("sheet"));
    expect(z("bottom-nav")).toBeLessThan(z("popover"));
  });
});

describe("/map fills the shell area", () => {
  it("is a flex child with no viewport calc", () => {
    expect(mapCss).toMatch(
      /\.rp-map-page \{[^}]*flex: 1 1 0;[^}]*min-height: 0;[^}]*min-width: 0;/,
    );
    expect(mapCss).not.toMatch(/100svh|100dvh|100vh|--rp-top-h/);
  });

  it("puts the mobile list panel directly on the tab bar", () => {
    expect(mapCss).toMatch(
      /bottom: calc\(var\(--shell-tabs-height\) \+ env\(safe-area-inset-bottom\)\);/,
    );
    expect(mapCss).not.toMatch(/calc\(5rem/);
  });

  it("moves the panel beside the map on short landscape phones", () => {
    const block = mapCss.match(
      /@media \(max-width: 767px\) and \(max-height: 500px\) and \(orientation: landscape\) \{([\s\S]*?)\n\}/,
    )?.[1];
    expect(block).toBeDefined();
    expect(block).toMatch(/\.rp-map-detail \{[^}]*width: min\(320px, 45%\);/);
    expect(block).toMatch(/\.rp-map-leaflet \{[^}]*bottom: 0;/);
    expect(block).toMatch(/\.rp-map-list-detail \{[^}]*position: sticky;/);
    expect(block).not.toMatch(/min-height/);
  });
});

describe("pages fit beside the rail", () => {
  it("home layout steps follow the page width, not the viewport", () => {
    expect(homeCss).toMatch(/\.home-page \{[^}]*container: home \/ inline-size;/);
    expect(homeCss).not.toMatch(/@media \((max|min)-width/);
    expect(homeCss).toMatch(/minmax\(16rem, 1fr\) minmax\(0, 0\.85fr\)/);
  });

  it("sticky side panels do not leave room for a sticky header that no longer exists", () => {
    const offenders = walk(SRC)
      .filter((f) => f.endsWith(".tsx"))
      .filter((f) =>
        /(lg|xl):sticky (lg|xl):top-(20|24)\b/.test(readFileSync(f, "utf8")),
      );
    expect(offenders).toEqual([]);
  });
});

describe("old site-chrome CSS is gone", () => {
  it("has no .rp-header or .rp-chrome-nav rules and no element uses them", () => {
    expect(styles).not.toMatch(/\.rp-header\b|\.rp-chrome-nav\b/);
    const users = walk(SRC).filter((f) =>
      /\brp-(header|chrome-nav)\b/.test(readFileSync(f, "utf8")),
    );
    expect(users).toEqual([]);
  });

  it("keeps the shared .rp-container used by the footer and pages", () => {
    expect(styles).toMatch(/\.rp-container \{/);
    expect(read("components/app-shell/site-footer.tsx")).toMatch(/rp-container/);
  });
});
