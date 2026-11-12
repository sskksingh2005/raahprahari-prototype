import { forwardRef } from "react";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PreferencesProvider } from "@/i18n/preferences";
import { deriveWorkspaceActions } from "@/lib/workspace-actions";
import { AuthSessionBridge } from "./auth-session-bridge";
import { WorkspaceActionsView } from "./workspace-actions";

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/react-router")>();
  const MockLink = forwardRef<
    HTMLAnchorElement,
    React.ComponentProps<"a"> & { to?: string; search?: unknown }
  >(({ to = "#", search, ...rest }, ref) => {
    void search;
    return <a ref={ref} href={to} {...rest} />;
  });
  MockLink.displayName = "MockLink";
  return { ...actual, Link: MockLink };
});

const DEFAULT_SCREENS = deriveWorkspaceActions({
  transport: "none",
  supabaseConfigured: false,
  session: "signed_out",
  devBuild: false,
  online: "online",
});

function renderView() {
  return render(
    <PreferencesProvider>
      <WorkspaceActionsView screens={DEFAULT_SCREENS} />
    </PreferencesProvider>,
  );
}

describe("workspace actions view", () => {
  it("gives every screen a heading under one section heading", () => {
    renderView();
    expect(
      screen.getByRole("heading", { level: 2, name: "Actions by screen" }),
    ).toBeVisible();
    expect(
      screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent),
    ).toEqual([
      "Road search and maps",
      "Report a hazard",
      "My Reports",
      "Account sign-in",
      "Official notice",
      "Points and reputation",
      "Contact",
    ]);
  });

  it("labels each state in text, not by colour alone", () => {
    renderView();
    const send = screen.getByTestId("audit-action-sendReport");
    expect(within(send).getByTestId("action-availability")).toHaveTextContent(
      "Blocked",
    );
    expect(send).toHaveTextContent(/VITE_REPORTS_API_BASE is not set/);
    expect(
      within(screen.getByTestId("audit-action-submitReport")).getByTestId(
        "action-availability",
      ),
    ).toHaveTextContent("This device only");
  });

  it("shows totals that match the listed actions", () => {
    renderView();
    expect(screen.getByTestId("audit-count-blocked")).toHaveTextContent("8");
    expect(screen.getByTestId("audit-count-available")).toHaveTextContent("3");
    const listed = screen.getAllByTestId(/^audit-action-/).length;
    expect(listed).toBe(19);
  });

  it("links each page screen to its route and explains the dialog one", () => {
    renderView();
    const hrefs = screen
      .getAllByRole("link", { name: /^Open / })
      .map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual([
      "/traveller",
      "/report",
      "/reports",
      "/official",
      "/contributions",
      "/contact",
    ]);
    expect(screen.getByTestId("audit-screen-account")).toHaveTextContent(
      "Opens from Community Login in the header.",
    );
  });

  it("has no detectable accessibility problems", async () => {
    const { container } = renderView();
    const results = await axe(container, {
      rules: {
        "color-contrast": { enabled: false },
        region: { enabled: false },
      },
    });
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});

describe("auth session bridge without Supabase settings", () => {
  afterEach(() => vi.restoreAllMocks());

  it("stays quiet: a build without Supabase is supported, not an error", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<AuthSessionBridge />);
    expect(error).not.toHaveBeenCalled();
  });
});
