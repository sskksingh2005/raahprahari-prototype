import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, ...props }: React.ComponentProps<"a"> & { to?: string }) => <a href={to} {...props} />,
  useRouterState: () => false,
}));

import { BootGate, BootScreen, bootGuardScript } from "./boot-screen";

describe("BootScreen", () => {
  it("has a status role with a hidden loading label", () => {
    render(<BootScreen />);
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("Loading RaahPrahari");
    expect(status.querySelector(".sr-only")).not.toBeNull();
  });

  it("is removed once the app is ready and clears aria-busy on main", () => {
    document.body.innerHTML = '<main id="main" aria-busy="true"></main><div id="root"></div>';
    render(<BootGate />, { container: document.getElementById("root")! });
    expect(screen.queryByRole("status")).toBeNull();
    expect(document.getElementById("main")?.hasAttribute("aria-busy")).toBe(false);
  });

  it("disables the pulse under reduced motion", () => {
    const css = readFileSync(join(process.cwd(), "src", "styles.css"), "utf8");
    const block = css.match(/@media \(prefers-reduced-motion: reduce\) \{\s*\.rp-boot-logo \{\s*animation: none;/);
    expect(block).not.toBeNull();
  });

  it("shows a Reload button in the error state", () => {
    render(<BootScreen state="error" />);
    const reload = screen.getByRole("button", { name: /reload/i });
    expect(reload.closest("[data-boot-error]")?.hasAttribute("hidden")).toBe(false);
    expect(document.body.textContent).not.toMatch(/checking live road data/i);
  });

  it("falls back after a bounded wait and keeps error content visible behind the notice", () => {
    const css = readFileSync(join(process.cwd(), "src", "styles.css"), "utf8");
    expect(bootGuardScript).toContain("},15000)");
    expect(bootGuardScript).toContain("m.removeAttribute('aria-busy')");
    expect(css).toMatch(/\.rp-boot\[data-state='error'\]\s*\{[^}]*inset:\s*5rem 1rem auto auto;[^}]*width:\s*min\(24rem, calc\(100% - 2rem\)\)/s);
  });
});
