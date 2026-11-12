import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReportStepPage } from "@/features/reports/report-step-page";
import { getLastSubmittedReportId } from "@/lib/draft-repository";
import { localDb } from "@/lib/local-db";
import {
  createEmptyReportDraft,
  MAX_PHOTO_BYTES,
  loadReportPhoto,
  readLastLocalReport,
  readLocalReports,
  readReportDraft,
  toLocalDateTime,
  validateObservation,
  validatePhoto,
  writeReportDraft,
} from "@/lib/report-store";
import { STORAGE_KEYS } from "@/lib/storage";

const navigate = vi.fn();

afterEach(async () => {
  window.localStorage.clear();
  navigate.mockClear();
  await localDb.drafts.clear();
  await localDb.attachments.clear();
  await localDb.outbox.clear();
});

describe("report observation validation", () => {
  it("keeps local report storage safe when browser globals are unavailable", async () => {
    vi.stubGlobal("window", undefined);
    try {
      expect(readReportDraft()).toBeNull();
      expect(readLocalReports()).toEqual([]);
      expect(readLastLocalReport()).toBeNull();
      expect(() => writeReportDraft(createEmptyReportDraft())).not.toThrow();
      await expect(loadReportPhoto("ssr-photo")).rejects.toThrow(
        "Browser-local photo storage is unavailable.",
      );
      expect(
        renderToString(<ReportStepPage step="received" navigate={navigate} />),
      ).toContain("Report saved on this device");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("requires a hazard and observation time and rejects a future time", () => {
    const now = new Date("2026-10-25T09:00:00");
    const draft = createEmptyReportDraft(now);
    expect(validateObservation(draft, now)).toMatchObject({
      hazardType: expect.any(String),
    });

    draft.hazardType = "landslide";
    draft.observedAt = toLocalDateTime(new Date("2026-10-25T10:00:00"));
    expect(validateObservation(draft, now).observedAt).toBe(
      "Observation time cannot be in the future.",
    );
  });

  it("accepts JPG and PNG within 10 MB and rejects unsupported or oversized files", () => {
    expect(
      validatePhoto(new File(["image"], "road.jpg", { type: "image/jpeg" })),
    ).toBeNull();
    expect(
      validatePhoto(new File(["image"], "road.png", { type: "image/png" })),
    ).toBeNull();
    expect(
      validatePhoto(new File(["image"], "road.gif", { type: "image/gif" })),
    ).toBe("Choose a JPG or PNG image.");
    expect(
      validatePhoto(
        new File([new Uint8Array(MAX_PHOTO_BYTES + 1)], "large.png", {
          type: "image/png",
        }),
      ),
    ).toBe("Photo must be 10 MB or smaller.");
  });
});

describe("report step flow", () => {
  it("keeps entered data when moving between step routes and saves a local draft", async () => {
    const first = render(
      <ReportStepPage step="observation" navigate={navigate} />,
    );
    const observedAt = screen.getByLabelText("When did you observe it?");
    await waitFor(() =>
      expect((observedAt as HTMLInputElement).value).not.toBe(""),
    );
    fireEvent.click(screen.getByRole("button", { name: "Landslide" }));
    fireEvent.change(screen.getByLabelText("Describe the condition"), {
      target: { value: "Debris is blocking one lane." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(navigate).toHaveBeenCalledWith("/report/photo");
    await waitFor(() =>
      expect(readReportDraft()?.description).toBe(
        "Debris is blocking one lane.",
      ),
    );
    first.unmount();

    render(<ReportStepPage step="photo" navigate={navigate} />);
    await waitFor(() =>
      expect(readReportDraft()?.hazardType).toBe("landslide"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Saved locally"),
    );
    expect(window.localStorage.getItem(STORAGE_KEYS.reportDraft)).toContain(
      "Debris is blocking one lane.",
    );
  });

  it("allows keyboard placement of a pin when no location is selected", async () => {
    render(<ReportStepPage step="location" navigate={navigate} />);

    fireEvent.click(screen.getByRole("button", { name: "Adjust location" }));
    fireEvent.keyDown(screen.getByRole("button", { name: /Map preview/ }), {
      key: "ArrowRight",
    });

    expect(
      await screen.findByText("Approximate pin location"),
    ).toBeInTheDocument();
  });

  it("submits locally and never renders prohibited status wording for a community report", async () => {
    const draft = {
      ...createEmptyReportDraft(),
      hazardType: "road_block" as const,
      description: "A lane is blocked by debris.",
      location: {
        query: "Joshimath",
        roadSegment: "NH-7",
        lat: 30.555,
        lon: 79.5643,
        accuracyM: null,
        source: "manual" as const,
        confirmed: true,
      },
    };
    writeReportDraft(draft);
    const review = render(<ReportStepPage step="review" navigate={navigate} />);
    fireEvent.click(screen.getByRole("button", { name: "Submit report" }));

    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith("/report/received"),
    );
    const reportId = getLastSubmittedReportId();
    expect(reportId).toBeTruthy();
    expect(await localDb.outbox.get(reportId!)).toMatchObject({
      state: "pending",
      reportId,
    });
    review.unmount();
    render(<ReportStepPage step="received" navigate={navigate} />);

    expect(
      await screen.findByText("Saved locally — not delivered"),
    ).toBeInTheDocument();
    // No report service is configured, so there is no Sync now button to press.
    expect(
      screen.queryByRole("button", { name: "Sync now" }),
    ).toBeNull();
    expect(await screen.findByText("Not delivered yet")).toBeInTheDocument();
    expect(screen.getByText(new RegExp(reportId!))).toBeInTheDocument();
    expect(screen.getByText(/Observed:/)).toBeInTheDocument();
    expect(screen.queryByText(/Server received/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Verified$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Confirmed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Official/i)).not.toBeInTheDocument();

    const queued = await localDb.outbox.get(reportId!);
    expect(queued).toBeTruthy();
    await localDb.outbox.put({
      ...queued!,
      state: "received",
      metadataReceipt: {
        receiptId: "receipt-live-update",
        receivedAt: "2026-11-10T12:00:00.000Z",
        duplicate: false,
      },
    });
    expect(await screen.findByText(/Server received:/)).toBeInTheDocument();
    expect(screen.getByText(/receipt-live-update/)).toBeInTheDocument();
  });
});
