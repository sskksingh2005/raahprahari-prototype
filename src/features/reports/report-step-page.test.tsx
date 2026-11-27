import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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
  photoValidationCode,
  validatePhoto,
  writeReportDraft,
} from "@/lib/report-store";
import { STORAGE_KEYS } from "@/lib/storage";
import { PreferencesProvider, usePrefs } from "@/i18n/preferences";

const navigate = vi.fn();

afterEach(async () => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
  navigate.mockClear();
  await localDb.drafts.clear();
  await localDb.attachments.clear();
  await localDb.outbox.clear();
});

describe("report observation validation", () => {
  it("does not render a legacy local draft during the initial server render", () => {
    writeReportDraft({
      ...createEmptyReportDraft(),
      hazardType: "landslide",
      description: "Saved description must load after hydration.",
    });

    const markup = renderToString(
      <ReportStepPage step="observation" navigate={navigate} />,
    );

    expect(markup).not.toContain("Saved description must load after hydration.");
  });

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

  it("treats exactly 10 MiB as valid and rejects empty or WebP files", () => {
    expect(MAX_PHOTO_BYTES).toBe(10 * 1024 * 1024);
    const exact = new File([new Uint8Array(MAX_PHOTO_BYTES)], "edge.jpg", {
      type: "image/jpeg",
    });
    expect(photoValidationCode(exact)).toBeNull();
    const over = new File([new Uint8Array(MAX_PHOTO_BYTES + 1)], "edge.jpg", {
      type: "image/jpeg",
    });
    expect(photoValidationCode(over)).toBe("size");
    expect(
      photoValidationCode(new File([], "empty.png", { type: "image/png" })),
    ).toBe("empty");
    expect(
      photoValidationCode(new File(["x"], "road.webp", { type: "image/webp" })),
    ).toBe("type");
    expect(photoValidationCode(new File(["x"], "road.jpg"))).toBeNull();
  });
});

describe("report photo selection", () => {
  const choose = (file: File) =>
    fireEvent.change(
      screen.getByLabelText("Choose an existing JPG or PNG photo"),
      { target: { files: [file] } },
    );

  it("explains that a photo is required and blocks Continue without one", async () => {
    render(<ReportStepPage step="photo" navigate={navigate} />);

    fireEvent.click(await screen.findByRole("button", { name: "Continue" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Add at least one photo to continue.",
    );
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.queryByText("Photo evidence is optional")).toBeNull();
  });

  it("keeps the previous photo, form values and saved draft when a replacement is invalid", async () => {
    // jsdom has no object URLs; stub them so the preview loads without an alert.
    class PreviewURL extends URL {
      static createObjectURL = vi.fn(() => "blob:preview");
      static revokeObjectURL = vi.fn();
    }
    vi.stubGlobal("URL", PreviewURL);
    writeReportDraft({
      ...createEmptyReportDraft(),
      hazardType: "landslide",
      description: "Debris on the road.",
    });
    render(<ReportStepPage step="photo" navigate={navigate} />);
    // Let the restored draft autosave first so the photo attaches to it.
    await waitFor(async () => expect(await localDb.drafts.count()).toBe(1), {
      timeout: 3000,
    });

    choose(new File(["png"], "first.png", { type: "image/png" }));
    await waitFor(
      () => expect(screen.getAllByText("first.png").length).toBeGreaterThan(0),
      { timeout: 3000 },
    );
    expect(screen.getByText(/not uploaded/)).toBeInTheDocument();
    const photoId = readReportDraft()?.photo?.id;
    expect(photoId).toBeTruthy();
    await waitFor(async () => expect(await localDb.drafts.count()).toBe(1));

    const rejected: [File, string][] = [
      [
        new File(["gif"], "bad.gif", { type: "image/gif" }),
        "Choose a JPG or PNG image.",
      ],
      [
        new File([], "empty.png", { type: "image/png" }),
        "This photo file is empty. Choose another image.",
      ],
      [
        new File([new Uint8Array(MAX_PHOTO_BYTES + 1)], "big.jpg", {
          type: "image/jpeg",
        }),
        "Photo must be 10 MB or smaller.",
      ],
    ];
    for (const [file, message] of rejected) {
      choose(file);
      expect(await screen.findByRole("alert")).toHaveTextContent(message);
      expect(screen.getAllByText("first.png").length).toBeGreaterThan(0);
      expect(readReportDraft()?.photo?.id).toBe(photoId);
      expect(readReportDraft()?.description).toBe("Debris on the road.");
      expect(await localDb.attachments.count()).toBe(1);
    }

    choose(new File(["jpg"], "second.jpg", { type: "image/jpeg" }));
    await waitFor(() =>
      expect(screen.getAllByText("second.jpg").length).toBeGreaterThan(0),
    );
    expect(screen.queryByRole("alert")).toBeNull();
    expect(readReportDraft()?.photo?.id).not.toBe(photoId);
    await waitFor(async () =>
      expect(await localDb.attachments.count()).toBe(1),
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith("/report/location"),
    );
  });
});

describe("report step flow", () => {
  it("keeps entered data when moving between step routes and saves a local draft", async () => {
    writeReportDraft({
      ...createEmptyReportDraft(),
      photo: {
        id: "test-photo",
        name: "road.jpg",
        type: "image/jpeg",
        size: 1024,
        timestamp: Date.now(),
        locationTag: "30.1° N, 79.3° E",
      },
      location: {
        query: "Uttarakhand",
        roadSegment: "NH-7",
        lat: 30.1,
        lon: 79.3,
        accuracyM: null,
        source: "manual",
        confirmed: true,
      },
    });
    const first = render(
      <ReportStepPage step="observation" navigate={navigate} />,
    );
    const observedAt = await screen.findByLabelText("When did you observe it?");
    await waitFor(() =>
      expect((observedAt as HTMLInputElement).value).not.toBe(""),
    );
    fireEvent.click(screen.getByRole("button", { name: "Landslide" }));
    fireEvent.change(screen.getByLabelText("Describe the condition"), {
      target: { value: "Debris is blocking one lane." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith("/report/review"),
    );
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
    fireEvent.click(await screen.findByRole("button", { name: "Save draft" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Saved locally"),
    );
    expect(window.localStorage.getItem(STORAGE_KEYS.reportDraft)).toContain(
      "Debris is blocking one lane.",
    );
  });

  it("redirects direct location navigation when no persisted photo exists", async () => {
    render(<ReportStepPage step="location" navigate={navigate} />);

    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith("/report/photo"),
    );
  });

  it("allows keyboard placement of a pin when no location is selected", async () => {
    writeReportDraft({
      ...createEmptyReportDraft(),
      location: {
        query: "Uttarakhand",
        roadSegment: "NH-7",
        lat: 30.1,
        lon: 79.3,
        accuracyM: null,
        source: "manual",
        confirmed: false,
      },
      photo: {
        id: "test-photo",
        name: "road.jpg",
        type: "image/jpeg",
        size: 1024,
        timestamp: Date.now(),
        locationTag: "No location tag",
      },
    });

    render(<ReportStepPage step="location" navigate={navigate} />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Adjust location" }),
    );
    fireEvent.change(await screen.findByLabelText("Latitude"), {
      target: { value: "30.55" },
    });
    expect(screen.getByLabelText("Latitude")).toHaveValue(30.55);
  });

  it("submits locally and never renders prohibited status wording for a community report", async () => {
    const draft = {
      ...createEmptyReportDraft(),
      hazardType: "road_block" as const,
      description: "A lane is blocked by debris.",
      photo: {
        id: "test-photo",
        name: "road.jpg",
        type: "image/jpeg",
        size: 1024,
        timestamp: Date.now(),
        locationTag: "30.555° N, 79.5643° E",
      },
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
    fireEvent.click(
      await screen.findByRole("button", { name: "Submit report" }),
    );

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
      await screen.findByText("Saved locally, not delivered"),
    ).toBeInTheDocument();
    // No report service is configured, so there is no Sync now button to press.
    expect(screen.queryByRole("button", { name: "Sync now" })).toBeNull();
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

describe("optional observation details", () => {
  const group = (name: string) => screen.getByRole("group", { name });
  const prerequisiteDraft = () =>
    writeReportDraft({
      ...createEmptyReportDraft(),
      photo: {
        id: "test-photo",
        name: "road.jpg",
        type: "image/jpeg",
        size: 1024,
        timestamp: Date.now(),
        locationTag: "30.1° N, 79.3° E",
      },
      location: {
        query: "Uttarakhand",
        roadSegment: "NH-7",
        lat: 30.1,
        lon: 79.3,
        accuracyM: null,
        source: "manual",
        confirmed: true,
      },
    });

  it("defaults source, road impact and vehicles to an explicit Unknown", async () => {
    prerequisiteDraft();
    expect(createEmptyReportDraft()).toMatchObject({
      source: "unknown",
      laneDirection: "unknown",
      vehicleApplicability: "unknown",
    });
    render(<ReportStepPage step="observation" navigate={navigate} />);
    await screen.findByRole("group", {
      name: "How do you know about this?",
    });
    for (const legend of [
      "How do you know about this?",
      "Which part of the road is affected?",
      "What could you see about vehicles getting through?",
    ]) {
      expect(
        within(group(legend)).getByRole("radio", { name: "Unknown" }),
      ).toBeChecked();
    }
    // Optional: Continue works with everything left as Unknown.
    await waitFor(() =>
      expect(
        (screen.getByLabelText("When did you observe it?") as HTMLInputElement)
          .value,
      ).not.toBe(""),
    );
    fireEvent.click(screen.getByRole("button", { name: "Landslide" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith("/report/review"),
    );
    // Let the save started by Continue finish so it cannot leak into the next test.
    await waitFor(() =>
      expect(readReportDraft()).toMatchObject({
        hazardType: "landslide",
        source: "unknown",
      }),
    );
  });

  it("keeps chosen values in the draft and shows them on the review step", async () => {
    prerequisiteDraft();
    const first = render(
      <ReportStepPage step="observation" navigate={navigate} />,
    );
    await waitFor(() =>
      expect(
        (screen.getByLabelText("When did you observe it?") as HTMLInputElement)
          .value,
      ).not.toBe(""),
    );
    fireEvent.click(screen.getByRole("button", { name: "Landslide" }));
    fireEvent.click(
      within(group("How do you know about this?")).getByRole("radio", {
        name: "I saw it myself",
      }),
    );
    fireEvent.click(
      within(group("Which part of the road is affected?")).getByRole("radio", {
        name: "One lane or part of the road",
      }),
    );
    fireEvent.click(
      within(group("What could you see about vehicles getting through?")).getByRole("radio", {
        name: "Only two-wheelers appeared able to pass",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    // A debounced autosave from an earlier test may also land, so look for
    // this draft among the saved records rather than assuming it is first.
    await waitFor(async () => {
      const saved = await localDb.drafts.toArray();
      expect(saved.map((record) => record.payload)).toContainEqual(
        expect.objectContaining({
          source: "firsthand",
          laneDirection: "one_lane",
          vehicleApplicability: "two_wheelers",
        }),
      );
    });
    first.unmount();

    render(<ReportStepPage step="review" navigate={navigate} />);
    const review = await screen.findByRole("heading", {
      name: "Road impact and source",
    });
    const section = review.closest("section")!;
    await waitFor(() => expect(section).toHaveTextContent("I saw it myself"));
    expect(section).toHaveTextContent("One lane or part of the road");
    expect(section).toHaveTextContent("Only two-wheelers appeared able to pass");
  });

  it("treats older or invalid saved values as Unknown", () => {
    window.localStorage.setItem(
      STORAGE_KEYS.reportDraft,
      JSON.stringify({
        hazardType: "landslide",
        description: "",
        observedAt: "2026-10-25T09:00",
        photo: null,
        location: null,
        laneDirection: "sideways",
      }),
    );
    expect(readReportDraft()).toMatchObject({
      source: "unknown",
      laneDirection: "unknown",
      vehicleApplicability: "unknown",
    });
  });
});

describe("draft restore and language switch", () => {
  function LanguageToggle() {
    const { lang, setLang } = usePrefs();
    return (
      <button
        type="button"
        onClick={() => setLang(lang === "en" ? "hi" : "en")}
      >
        toggle language
      </button>
    );
  }

  it("keeps edits made just before switching language", async () => {
    writeReportDraft({
      ...createEmptyReportDraft(),
      hazardType: "landslide",
      description: "Saved earlier.",
    });
    render(
      <PreferencesProvider>
        <LanguageToggle />
        <ReportStepPage step="observation" navigate={navigate} />
      </PreferencesProvider>,
    );
    await screen.findByText("Draft restored from this device");
    const description = () =>
      document.getElementById("report-description") as HTMLTextAreaElement;
    await waitFor(() => expect(description().value).toBe("Saved earlier."));

    // Edit, then switch language before the debounced autosave runs.
    fireEvent.change(description(), { target: { value: "Typed just now." } });
    fireEvent.click(screen.getByRole("button", { name: "toggle language" }));
    // Give a re-run restore time to land if it were (wrongly) triggered.
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(description().value).toBe("Typed just now.");
    await waitFor(() =>
      expect(readReportDraft()?.description).toBe("Typed just now."),
    );
  });
});
