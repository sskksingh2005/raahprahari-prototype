import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(process.cwd(), "src");
const read = (p: string) => readFileSync(join(SRC, p), "utf8");

function walk(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx?|css|json|md)$/.test(name)) out.push(full);
  }
  return out;
}

describe("no mojibake in sources", () => {
  it("has no UTF-8-as-Latin-1 sequences", () => {
    const bad = walk(SRC)
      .filter((f) => !f.endsWith("light-theme-quality.test.ts"))
      .filter((f) => {
        const s = readFileSync(f, "utf8");
        return s.includes("\u00e0\u00a4") || s.includes("\u00c3\u00a2");
      });
    expect(bad).toEqual([]);
  });
});

/** Light tokens: the first plain `:root {` block that declares --background. */
const styles = read("styles.css");
const light: Record<string, string> = {};
for (const m of styles
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .matchAll(/(^|\n):root\s*\{([^{}]*)\}/g)) {
  for (const d of m[2].matchAll(/(--[\w-]+):\s*([^;]+);/g))
    light[d[1]] = d[2].trim();
}

function hex(name: string): [number, number, number] {
  let v = light[name];
  for (let i = 0; i < 5 && v?.startsWith("var("); i++)
    v = light[v.slice(4, -1)];
  const m = /^#([0-9a-f]{6})$/i.exec(v ?? "");
  if (!m) throw new Error(`token ${name} is not a hex colour: ${v}`);
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lum([r, g, b]: [number, number, number]) {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(a: string, b: string) {
  const [x, y] = [lum(hex(a)), lum(hex(b))].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

describe("light theme contrast tokens", () => {
  it("body text is near #1B2326 with at least 7:1 on every light surface", () => {
    expect(light["--foreground"].toLowerCase()).toBe("#1b2326");
    for (const bg of [
      "--background",
      "--card",
      "--muted",
      "--accent",
      "--popover",
    ]) {
      expect(ratio("--foreground", bg), bg).toBeGreaterThanOrEqual(7);
    }
  });

  it("muted text, orange wordmark and links are at least 4.5:1", () => {
    for (const bg of ["--background", "--card", "--muted", "--accent"]) {
      expect(ratio("--muted-foreground", bg), bg).toBeGreaterThanOrEqual(4.5);
    }
    expect(ratio("--orange-on-light", "--background")).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(ratio("--link", "--background")).toBeGreaterThanOrEqual(4.5);
  });

  it("borders, inputs and the focus ring reach 3:1", () => {
    expect(ratio("--border", "--background")).toBeGreaterThanOrEqual(3);
    expect(ratio("--input", "--background")).toBeGreaterThanOrEqual(3);
    expect(ratio("--ring", "--background")).toBeGreaterThanOrEqual(3);
  });
});

describe("light theme visual rules", () => {
  const logo = read("components/logo.tsx");

  it("photo scrim fades to about 10% and text has no blurred shadow", () => {
    expect(light["--photo-scrim-c"]).toContain("10%");
    expect(light["--photo-text-shadow-soft"]).toBe("none");
    expect(light["--photo-text-shadow-tone"]).toBe("none");
  });

  it("header logo swaps by theme without a dark box in light", () => {
    expect(logo).toContain("dark:block");
    expect(logo).toContain("dark:hidden");
    expect(logo).toContain("logo-on-light");
    expect(logo).toContain("logo-on-dark");
  });

  it("light mode keeps backdrop blur (the glass design frosts in both themes)", () => {
    // The old rule that stripped every backdrop-blur in light mode is gone, so
    // the glass panels show the photo through them in the light theme too.
    expect(styles).not.toMatch(/:root:not\(\.dark\) \[class\*='backdrop-blur'\]/);
    expect(styles).toMatch(/\.glass-strong \{\s*background-color: var\(--glass-panel-strong\);/);
  });
});

describe("traveller and map surfaces follow the shared theme", () => {
  const traveller = read("routes/traveller.tsx");
  const travellerCss = read("routes/traveller.css");
  const report = read("features/reports/report-step-page.tsx");
  const mapCss = read("routes/map.css");

  it("does not force dark mode on traveller or report screens", () => {
    expect(traveller).not.toMatch(/traveller-(?:page|landing|results-page)\s+dark/);
    expect(report).not.toMatch(/className="dark(?:\s|")/);
  });

  it("lets the traveller search column grow with its content", () => {
    expect(travellerCss).not.toMatch(
      /\.traveller-search-panel\s*\{[^}]*overflow-y:\s*auto/s,
    );
    expect(travellerCss).not.toMatch(
      /\.traveller-landing\s*\{[^}]*?(?:^|[\s;])height:\s*calc\(/ms,
    );
  });

  it("uses shared glass opacity and keeps every map legend entry visible", () => {
    expect(mapCss).not.toMatch(/--glass-panel(?:-strong)?:/);
    expect(mapCss).not.toMatch(
      /\.rp-map-legend\.rp-lmap-legend li:has\([^}]*display:\s*none/s,
    );
  });
});

describe("app shell layout does not overlap or hide content", () => {
  const shell = [
    "app-shell",
    "rail",
    "top-bars",
    "shell-status",
    "account-menu",
    "shell-logo",
  ]
    .map((name) => read(`components/app-shell/${name}.tsx`))
    .join("\n");
  const rail = read("components/app-shell/rail.tsx");
  const bars = read("components/app-shell/top-bars.tsx");
  const appShell = read("components/app-shell/app-shell.tsx");
  // The dark tokens: plain `.dark { ... }` blocks in the token file.
  const dark: Record<string, string> = {};
  for (const m of styles
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .matchAll(/(^|\n)\.dark\s*\{([^{}]*)\}/g)) {
    for (const d of m[2].matchAll(/(--[\w-]+):\s*([^;]+);/g))
      dark[d[1]] = d[2].trim();
  }
  const luminance = (value: string) => {
    const m = /^#([0-9a-f]{6})$/i.exec(value);
    if (!m) throw new Error(`not a hex colour: ${value}`);
    const [r, g, b] = [0, 2, 4].map((i) => {
      const channel = parseInt(m[1].slice(i, i + 2), 16) / 255;
      return channel <= 0.03928
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  it("uses flex rows with min-w-0 and gap, with no absolute-positioned bars", () => {
    expect(bars).toMatch(/flex h-14 shrink-0 items-center gap-3/);
    expect(bars).toMatch(/flex h-14 shrink-0 items-center gap-1/);
    expect(appShell).toMatch(/flex min-w-0 flex-1 flex-col/);
  });
  it("switches once, at lg (1024px), and uses no other layout breakpoint", () => {
    expect(rail).toMatch(/hidden [^"]*lg:flex/);
    expect(bars).toMatch(/max-lg:hidden/);
    expect(bars.match(/lg:hidden/g)?.length).toBeGreaterThanOrEqual(2);
    expect(shell).not.toMatch(/\b(xl|2xl|1440):(flex|hidden)\b/);
    expect(styles).not.toMatch(/--breakpoint-1440/);
    // Viewport-height pages subtract the shell's own top bar, not a second number.
    expect(styles).toMatch(/--rp-top-h:\s*var\(--shell-bar-height\)/);
    expect(styles).not.toMatch(/--rp-rail-w|--rp-bottom-h/);
  });
  it("rail items never wrap and keep 44px targets", () => {
    expect(rail).toMatch(
      /min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium/,
    );
    expect(bars).toMatch(/min-h-14 min-w-11 flex-col/);
    // Language buttons (signed out) are 44px targets too.
    expect(rail).toMatch(/min-h-11 min-w-11 rounded-md px-2 text-sm font-medium/);
  });
  it("every shell colour comes from theme tokens, never a fixed value", () => {
    expect(shell).not.toMatch(
      /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bbg-(white|black|slate|zinc|gray|neutral)\b|\btext-(white|black)\b/,
    );
    // The tokens exist for both themes, so the shell follows the document theme.
    for (const key of [
      "--shell-bg",
      "--shell-surface",
      "--shell-text",
      "--shell-muted",
      "--shell-divider",
      "--shell-focus",
    ]) {
      expect(light[key], `${key} in light`).toBeTruthy();
      expect(dark[key], `${key} in dark`).toBeTruthy();
      expect(light[key]).not.toBe(dark[key]);
    }
    expect(luminance(light["--shell-bg"])).toBeGreaterThan(0.5);
    expect(luminance(dark["--shell-bg"])).toBeLessThan(0.05);
    expect(luminance(light["--shell-text"])).toBeLessThan(0.1);
    expect(luminance(dark["--shell-text"])).toBeGreaterThan(0.5);
  });
  it("keeps shell text readable against its surfaces in both themes", () => {
    const ratio = (a: string, b: string) => {
      const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    for (const theme of [light, dark]) {
      expect(
        ratio(theme["--shell-text"], theme["--shell-bg"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        ratio(theme["--shell-muted"], theme["--shell-bg"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        ratio(theme["--shell-muted"], theme["--shell-surface"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        ratio(theme["--shell-focus"], theme["--shell-bg"]),
      ).toBeGreaterThanOrEqual(3);
    }
  });
  it("draws a 3px focus ring with a 3px offset on shell controls", () => {
    expect(styles).toMatch(
      /\.rp-shell :focus-visible[\s\S]*?outline:\s*3px solid var\(--shell-focus\)[\s\S]*?outline-offset:\s*3px/,
    );
  });
  it("turns transitions off for reduced motion", () => {
    expect(styles).toMatch(
      /prefers-reduced-motion: reduce\)\s*\{\s*\.rp-shell-transition\s*\{\s*transition:\s*none/,
    );
  });
});
describe("z-index scale", () => {
  const num = (name: string) => {
    const v = light[name];
    if (!/^\d+$/.test(v ?? ""))
      throw new Error(`${name} is not a number: ${v}`);
    return Number(v);
  };

  it("orders content < header < map < bottom nav < overlay < sheet < toast", () => {
    const order = [
      "--z-content",
      "--z-header",
      "--z-map",
      "--z-bottom-nav",
      "--z-overlay",
      "--z-sheet",
      "--z-toast",
    ];
    const values = order.map(num);
    expect(values).toEqual([...values].sort((a, b) => a - b));
    expect(new Set(values).size).toBe(values.length);
  });

  it("sheet and dialog overlay and content sit above the map layers and bottom nav", () => {
    const maps = [
      "--z-map",
      "--z-map-controls",
      "--z-map-legend",
      "--z-map-panel",
    ].map(num);
    expect(Math.min(num("--z-overlay"), num("--z-sheet"))).toBeGreaterThan(
      Math.max(...maps, num("--z-bottom-nav")),
    );
  });

  it("sheet and dialog use the tokens, and map containers are isolated", () => {
    expect(read("components/ui/sheet.tsx")).toContain("z-(--z-overlay)");
    expect(read("components/ui/sheet.tsx")).toContain("z-(--z-sheet)");
    expect(read("components/ui/dialog.tsx")).toContain("z-(--z-overlay)");
    expect(read("components/ui/dialog.tsx")).toContain("z-(--z-sheet)");
    expect(styles).toMatch(/\.rp-lmap,[\s\S]*?\{\s*isolation:\s*isolate/);
  });

  it("no map stylesheet or chrome file uses a raw z-index number", () => {
    for (const file of [
      "routes/map.css",
      "features/map/leaflet-segment-map.css",
      "routes/traveller.css",
      "components/app-shell/app-shell.tsx",
      "components/app-shell/rail.tsx",
      "components/app-shell/top-bars.tsx",
    ]) {
      expect(read(file), file).not.toMatch(
        /z-index:\s*\d{2,}|\bz-\d+\b|z-\[\d+\]/,
      );
    }
  });
});
