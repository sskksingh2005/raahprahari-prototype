import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, ...props }: React.ComponentProps<"a"> & { to?: string }) => (
    <a href={to} {...props} />
  ),
}));

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { Logo } from "./logo";

describe("Logo", () => {
  it("header variant links to / with an accessible name", () => {
    render(<Logo />);
    const link = screen.getByRole("link", { name: "RaahPrahari home" });
    expect(link.getAttribute("href")).toBe("/");
  });

  it("renders both theme images with correct alt, aria-hidden and sizes", () => {
    const { container } = render(<Logo />);
    const light = container.querySelector('img[data-logo-theme="light"]')!;
    const dark = container.querySelector('img[data-logo-theme="dark"]')!;
    expect(light.getAttribute("src")).toBe("/img/logo-on-light.png");
    expect(light.getAttribute("alt")).toBe("RaahPrahari");
    expect(light.getAttribute("aria-hidden")).toBeNull();
    expect(light.className).toContain("dark:hidden");
    expect(dark.getAttribute("src")).toBe("/img/logo-on-dark.png");
    expect(dark.getAttribute("alt")).toBe("");
    expect(dark.getAttribute("aria-hidden")).toBe("true");
    expect(dark.className).toContain("dark:block");
    for (const img of [light, dark]) {
      expect(img.getAttribute("width")).toBeTruthy();
      expect(img.getAttribute("height")).toBeTruthy();
    }
  });

  it("full variant uses the same two files", () => {
    const { container } = render(<Logo variant="full" />);
    expect(container.querySelectorAll("img")).toHaveLength(2);
    expect(container.querySelector('span[role="img"]')?.getAttribute("aria-label")).toBe("RaahPrahari");
  });

  it("no source references the old logo files", () => {
    const root = join(process.cwd(), "src");
    const old = ["logo-full", "logo-mark", "LOGO_FULL_ALT", "logo-on-light.jpeg", "logo-on-dark.jpeg", "logo.svg"];
    const walk = (dir: string): string[] =>
      readdirSync(dir).flatMap((n) => {
        const p = join(dir, n);
        return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|css)$/.test(n) ? [p] : [];
      });
    const self = join(root, "components", "logo.test.tsx");
    const hits = walk(root)
      .filter((f) => f !== self)
      .filter((f) => old.some((o) => readFileSync(f, "utf8").includes(o)));
    expect(hits).toEqual([]);
  });
});
