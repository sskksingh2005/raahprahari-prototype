import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OfflineBannerView } from "./offline-banner";
import { PreferencesProvider } from "@/i18n/preferences";

describe("OfflineBannerView", () => {
  it("keeps connectivity separate from delivery and shows pending counts once", async () => {
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: () => (
        <OfflineBannerView
          online="offline"
          lastSuccessfulSyncAt={null}
          pendingCount={1}
          failedCount={1}
        />
      ),
    });
    const reportsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/reports",
      component: () => null,
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([indexRoute, reportsRoute]),
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    const { container } = render(
      <PreferencesProvider>
        <RouterProvider router={router} />
      </PreferencesProvider>,
    );
    const banner = container.querySelector('[aria-live="polite"]');

    expect(banner).toHaveTextContent("Device offline");
    expect(banner).toHaveTextContent("No successful sync recorded");
    expect(banner).toHaveTextContent("Reports awaiting delivery: 1");
    expect(
      banner?.textContent?.match(/Reports awaiting delivery/g),
    ).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: "View my reports" }),
    ).toHaveAttribute("href", "/reports");
  });
});
