import { forwardRef } from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_NOW, REPORTS, segmentById } from "@/data/fixtures";
import { PreferencesProvider } from "@/i18n/preferences";
import {
  ClearanceObservationForm,
  type ClearanceObservationAdapter,
} from "./clearance-observation-form";
import {
  ReviewVersionConflictError,
  type ReviewDecisionAdapter,
  type ReviewHistoryEntry,
  type ReviewSnapshotLoader,
} from "./review-decision";
import { ReviewDetailView } from "./review-detail-view";
import { ReviewTimeline } from "./review-timeline";

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/react-router")>();
  const MockLink = forwardRef<
    HTMLAnchorElement,
    React.ComponentProps<"a"> & { to?: string; params?: Record<string, string> }
  >(({ to = "#", params, ...rest }, ref) => {
    let href = to;
    for (const [key, value] of Object.entries(params ?? {}))
      href = href.replace(`$${key}`, value);
    return <a ref={ref} href={href} {...rest} />;
  });
  MockLink.displayName = "MockLink";
  return { ...actual, Link: MockLink };
});

beforeEach(() => {
  // jsdom has no ResizeObserver, which the Radix checkbox uses.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  window.localStorage.clear();
});

const HOUR = 3_600_000;
const entry = (
  id: string,
  at: number,
  extra: Partial<ReviewHistoryEntry> = {},
): ReviewHistoryEntry => ({
  id,
  actor: "Reviewer A",
  action: "escalate",
  at,
  rationale: `Rationale ${id}`,
  ...extra,
});

describe("VA-06 version conflict", () => {
  it("refetches, keeps the typed text and requires a new confirmation", async () => {
    const found = REPORTS.find((r) => r.ref === "RP-419301");
    if (!found) throw new Error("fixture missing");
    const loadSnapshot = vi
      .fn<ReviewSnapshotLoader>()
      .mockResolvedValueOnce({ version: 1, history: [] })
      .mockResolvedValue({
        version: 2,
        history: [entry("e1", DEMO_NOW - HOUR, { actor: "Reviewer B" })],
      });
    const onDecision = vi
      .fn<ReviewDecisionAdapter>()
      .mockRejectedValueOnce(new ReviewVersionConflictError())
      .mockResolvedValueOnce();
    const user = userEvent.setup();
    render(
      <PreferencesProvider>
        <ReviewDetailView
          report={found}
          onDecision={onDecision}
          loadSnapshot={loadSnapshot}
        />
      </PreferencesProvider>,
    );
    await screen.findByText("Version 1");
    await user.click(screen.getByRole("button", { name: "Reject" }));
    await user.type(screen.getByLabelText("Rationale (required)"), "No proof");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    const notice = await screen.findByTestId("review-conflict");
    expect(notice).toHaveTextContent(
      "Another reviewer changed this report. The latest version has been loaded.",
    );
    expect(onDecision).toHaveBeenCalledTimes(1);
    expect(onDecision.mock.calls[0]?.[0].expectedVersion).toBe(1);
    expect(loadSnapshot).toHaveBeenCalledTimes(2);
    await screen.findByText("Version 2");
    expect(screen.getByLabelText("Rationale (required)")).toHaveValue(
      "No proof",
    );

    // Not confirmed yet: submitting again must not reach the server.
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(onDecision).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText("Confirm before submitting again."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(2));
    expect(onDecision.mock.calls[1]?.[0].expectedVersion).toBe(2);
    expect(onDecision.mock.calls[1]?.[0].rationale).toBe("No proof");
  });
});

describe("VA-07 review timeline", () => {
  it("is read-only and ordered oldest first without changing its input", () => {
    const entries = [
      entry("late", DEMO_NOW - HOUR, { rationale: "Third" }),
      entry("early", DEMO_NOW - 3 * HOUR, { rationale: "First" }),
      entry("fix", DEMO_NOW - 2 * HOUR, {
        action: "correction",
        rationale: "Second",
      }),
    ];
    const before = entries.map((e) => e.id);
    render(
      <PreferencesProvider>
        <ReviewTimeline entries={entries} />
      </PreferencesProvider>,
    );
    const items = screen.getAllByTestId("review-timeline-entry");
    expect(items.map((li) => li.textContent)).toEqual([
      expect.stringContaining("First"),
      expect.stringContaining("Second"),
      expect.stringContaining("Third"),
    ]);
    expect(items[1]).toHaveTextContent("Correction");
    const timeline = screen.getByTestId("review-timeline");
    expect(within(timeline).queryAllByRole("button")).toHaveLength(0);
    expect(within(timeline).queryAllByRole("textbox")).toHaveLength(0);
    expect(within(timeline).queryAllByRole("link")).toHaveLength(0);
    expect(entries.map((e) => e.id)).toEqual(before);
  });
});

describe("VA-08 clearance observation form", () => {
  const segment = segmentById("nh7-06");
  if (!segment) throw new Error("fixture missing");
  const now = () => new Date("2026-10-15T12:00").getTime();
  const renderForm = (onSubmit: ClearanceObservationAdapter) =>
    render(
      <PreferencesProvider>
        <ClearanceObservationForm
          segment={segment}
          onSubmit={onSubmit}
          now={now}
        />
      </PreferencesProvider>,
    );

  it("validates the observation time", async () => {
    const onSubmit = vi.fn<ClearanceObservationAdapter>().mockResolvedValue();
    const user = userEvent.setup();
    renderForm(onSubmit);
    const time = screen.getByLabelText("Observation time (required)");
    await user.click(screen.getByRole("button", { name: "Save observation" }));
    expect(time).toHaveAttribute("aria-invalid", "true");
    expect(time).toHaveAccessibleDescription(
      "Enter when you made the observation.",
    );
    fireEvent.change(time, { target: { value: "2026-10-15T13:00" } });
    await user.click(screen.getByRole("button", { name: "Save observation" }));
    expect(time).toHaveAccessibleDescription(
      "The observation time cannot be in the future.",
    );
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Vehicle type")).toHaveValue("unknown");
  });

  it("keeps the status and the official closure after a save", async () => {
    const onSubmit = vi.fn<ClearanceObservationAdapter>().mockResolvedValue();
    const user = userEvent.setup();
    renderForm(onSubmit);
    const status = () => screen.getByTestId("clearance-status");
    expect(status()).toHaveTextContent("Awaiting clearance verification");
    expect(
      screen.getByText("Road closed for debris clearance", { exact: false }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Observation time (required)"), {
      target: { value: "2026-10-15T09:30" },
    });
    await user.selectOptions(screen.getByLabelText("Vehicle type"), "bus");
    await user.type(screen.getByLabelText("Notes (optional)"), " Cleared? ");
    await user.click(screen.getByRole("button", { name: "Save observation" }));

    const saved = await screen.findByTestId("clearance-saved");
    expect(saved).toHaveTextContent("Saved, awaiting verification");
    expect(onSubmit).toHaveBeenCalledWith({
      segmentId: "nh7-06",
      observedAt: new Date("2026-10-15T09:30").getTime(),
      lane: "unknown",
      direction: "unknown",
      vehicleType: "bus",
      notes: "Cleared?",
    });
    expect(status()).toHaveTextContent("Awaiting clearance verification");
    expect(
      screen.getByText("Road closed for debris clearance", { exact: false }),
    ).toBeInTheDocument();
    expect(saved.textContent).not.toMatch(/\b(cleared|verified)\b/i);
  });

  it("keeps entries and shows the error when the save fails", async () => {
    const onSubmit = vi
      .fn<ClearanceObservationAdapter>()
      .mockRejectedValue(new Error("Offline"));
    const user = userEvent.setup();
    renderForm(onSubmit);
    fireEvent.change(screen.getByLabelText("Observation time (required)"), {
      target: { value: "2026-10-15T09:30" },
    });
    await user.click(screen.getByRole("button", { name: "Save observation" }));
    expect(await screen.findByTestId("clearance-error")).toHaveTextContent(
      "Offline",
    );
    expect(screen.queryByTestId("clearance-saved")).toBeNull();
    expect(screen.getByLabelText("Observation time (required)")).toHaveValue(
      "2026-10-15T09:30",
    );
  });
});
