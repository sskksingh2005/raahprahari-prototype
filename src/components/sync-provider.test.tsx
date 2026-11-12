import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { axe } from "jest-axe";
import { DeliveryStatusBadge } from "@/components/delivery-status-badge";
import { SyncProvider } from "@/components/sync-provider";
import { SyncNowButton } from "@/components/sync-now-button";
import { setAccountSession } from "@/lib/account-session";
import { localDb } from "@/lib/local-db";
import { setSyncState } from "@/lib/sync/sync-state";

const { syncNowMock } = vi.hoisted(() => ({ syncNowMock: vi.fn() }));

vi.mock("@/lib/sync/sync-engine", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/sync/sync-engine")>();
  return {
    ...actual,
    syncNow: syncNowMock,
    getLastSyncAt: () => null,
    // SyncNowButton hides itself when nothing could send (VA-16); these tests
    // exercise the visible button, so report a transport as present.
    getTransportSource: () => "dev_stub" as const,
  };
});

beforeEach(async () => {
  await localDb.drafts.clear();
  await localDb.attachments.clear();
  await localDb.outbox.clear();
  syncNowMock.mockReset().mockResolvedValue({
    status: "nothing_to_send",
    received: 0,
    failed: 0,
    message: "No reports",
  });
  setAccountSession({ status: "authenticated", userId: "provider-user" });
  Object.defineProperty(navigator, "onLine", {
    configurable: true,
    value: true,
  });
});

afterEach(async () => {
  setAccountSession({ status: "signed_out", userId: null });
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: undefined,
  });
  await localDb.drafts.clear();
  await localDb.attachments.clear();
  await localDb.outbox.clear();
});

describe("SyncProvider triggers", () => {
  it("runs on startup and deduplicates online and visibility triggers", async () => {
    const view = render(
      <SyncProvider>
        <div>app</div>
      </SyncProvider>,
    );
    await waitFor(() =>
      expect(syncNowMock).toHaveBeenCalledWith({ reason: "startup" }),
    );
    act(() => {
      window.dispatchEvent(new Event("online"));
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(syncNowMock).toHaveBeenCalledTimes(1);

    await new Promise((resolve) => setTimeout(resolve, 1050));
    act(() => window.dispatchEvent(new Event("online")));
    await waitFor(() => expect(syncNowMock).toHaveBeenCalledTimes(2));
    expect(syncNowMock).toHaveBeenLastCalledWith({ reason: "online" });

    view.unmount();
    await new Promise((resolve) => setTimeout(resolve, 1050));
    act(() => {
      window.dispatchEvent(new Event("online"));
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(syncNowMock).toHaveBeenCalledTimes(2);
  });

  it("does not request sync while signed out or loading", async () => {
    setAccountSession({ status: "signed_out", userId: null });
    const view = render(
      <SyncProvider>
        <div>app</div>
      </SyncProvider>,
    );
    await new Promise((resolve) => setTimeout(resolve, 25));
    expect(syncNowMock).not.toHaveBeenCalled();

    setAccountSession({ status: "loading", userId: null });
    await new Promise((resolve) => setTimeout(resolve, 25));
    expect(syncNowMock).not.toHaveBeenCalled();
    view.unmount();
  });

  it("responds to a service-worker sync message without a polling loop", async () => {
    let messageHandler: ((event: MessageEvent) => void) | undefined;
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        addEventListener: (
          _type: string,
          handler: (event: MessageEvent) => void,
        ) => {
          messageHandler = handler;
        },
        removeEventListener: vi.fn(),
      },
    });
    render(
      <SyncProvider>
        <div>app</div>
      </SyncProvider>,
    );
    await waitFor(() =>
      expect(syncNowMock).toHaveBeenCalledWith({ reason: "startup" }),
    );

    await new Promise((resolve) => setTimeout(resolve, 1050));
    act(() => messageHandler?.({ data: { type: "rp-sync" } } as MessageEvent));
    await waitFor(() =>
      expect(syncNowMock).toHaveBeenCalledWith({ reason: "background" }),
    );
  });

  it("announces manual sync state and renders status components accessibly", async () => {
    syncNowMock.mockResolvedValue({
      status: "not_configured",
      received: 0,
      failed: 0,
      message: "No service configured.",
    });
    const { container } = render(
      <>
        <SyncNowButton />
        <DeliveryStatusBadge outbox={null} />
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Sync now" }));
    expect(
      await screen.findByText(/report service isn't configured/i),
    ).toBeInTheDocument();

    act(() => setSyncState({ running: true }));
    const busyButton = screen.getByRole("button", { name: /sending reports/i });
    expect(busyButton).toBeDisabled();
    expect(busyButton).toHaveAttribute("aria-busy", "true");

    const results = await axe(container);
    expect(
      results.violations
        .filter(
          (violation) =>
            violation.impact === "serious" || violation.impact === "critical",
        )
        .map(({ id }) => id),
    ).toEqual([]);
    act(() => setSyncState({ running: false }));
  });
});
