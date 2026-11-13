import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PLACES } from "@/data/fixtures";
import {
  ReportStepPage,
  formatAccuracy,
} from "@/features/reports/report-step-page";
import { getCurrentPosition, segmentCandidates } from "@/lib/geo";
import { localDb } from "@/lib/local-db";
import {
  createEmptyReportDraft,
  readReportDraft,
  writeReportDraft,
} from "@/lib/report-store";

const navigate = vi.fn();
const original = Object.getOwnPropertyDescriptor(navigator, "geolocation");

// Pick fixture places by how many road segments are nearby, so the tests
// follow the synthetic data instead of hard-coding coordinates.
const ambiguousPlace = PLACES.find(
  (p) => segmentCandidates(p.lat, p.lon).length > 1,
)!;
const singlePlace = PLACES.find(
  (p) => segmentCandidates(p.lat, p.lon).length === 1,
)!;

function setGeolocation(value: unknown) {
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value,
  });
}

function search(text: string) {
  fireEvent.change(screen.getByLabelText("Search road or place"), {
    target: { value: text },
  });
}

function pick(name: string) {
  const list = screen.getByRole("listbox", {
    name: "Matching places and roads",
  });
  const option = within(list)
    .getAllByRole("button")
    .find((button) => button.querySelector("span")?.textContent === name)!;
  fireEvent.click(option);
}

afterEach(async () => {
  navigate.mockClear();
  window.localStorage.clear();
  if (original) Object.defineProperty(navigator, "geolocation", original);
  else delete (navigator as { geolocation?: unknown }).geolocation;
  await localDb.drafts.clear();
});

describe("device location permission", () => {
  it("reports an unsupported browser separately from an unavailable position", async () => {
    delete (navigator as { geolocation?: unknown }).geolocation;
    await expect(getCurrentPosition()).resolves.toEqual({
      ok: false,
      reason: "unsupported",
    });
    render(<ReportStepPage step="location" navigate={navigate} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Use current location" }),
    );
    expect(
      await screen.findByText(/does not support device location/),
    ).toBeInTheDocument();
    // Manual search stays available.
    expect(screen.getByLabelText("Search road or place")).toBeEnabled();
  });

  it("explains a denied permission and keeps manual search", async () => {
    setGeolocation({
      getCurrentPosition: (
        _ok: PositionCallback,
        fail: PositionErrorCallback,
      ) => fail({ code: 1, PERMISSION_DENIED: 1 } as GeolocationPositionError),
    });
    render(<ReportStepPage step="location" navigate={navigate} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Use current location" }),
    );
    expect(
      await screen.findByText(/Location permission was denied/),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Search road or place")).toBeEnabled();
  });

  it("shows coordinates with the device accuracy and still needs confirming", async () => {
    setGeolocation({
      getCurrentPosition: (ok: PositionCallback) =>
        ok({
          coords: {
            latitude: singlePlace.lat,
            longitude: singlePlace.lon,
            accuracy: 24.6,
          },
        } as GeolocationPosition),
    });
    render(<ReportStepPage step="location" navigate={navigate} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Use current location" }),
    );
    expect(formatAccuracy(24.6)).toBe("±25 m");
    expect(await screen.findAllByText(/±25 m/)).not.toHaveLength(0);
    expect(screen.getByText("Not confirmed yet")).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe("segment ambiguity", () => {
  it("says when several places or roads match", () => {
    render(<ReportStepPage step="location" navigate={navigate} />);
    search("NH");
    expect(
      screen.getByText("Multiple matches found — please choose one."),
    ).toBeInTheDocument();
  });

  it("never auto-selects among several nearby segments and requires an explicit choice", async () => {
    const candidates = segmentCandidates(
      ambiguousPlace.lat,
      ambiguousPlace.lon,
    );
    render(<ReportStepPage step="location" navigate={navigate} />);
    search(ambiguousPlace.name);
    pick(ambiguousPlace.name);

    const group = screen.getByRole("group", {
      name: /Several road segments are nearby/,
    });
    const radios = within(group).getAllByRole("radio");
    expect(radios).toHaveLength(candidates.length);
    for (const radio of radios) expect(radio).not.toBeChecked();
    expect(screen.getByText("Not chosen yet")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Confirm this location" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Choose the road segment",
    );
    expect(navigate).not.toHaveBeenCalledWith("/report/review");

    fireEvent.click(
      within(group).getByRole("radio", {
        name: new RegExp(candidates[1].label),
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Confirm this location" }),
    );
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith("/report/review"),
    );
    expect(readReportDraft()?.location).toMatchObject({
      roadSegment: candidates[1].label,
      confirmed: true,
    });
  });

  it("pre-fills a single nearby segment but still waits for confirmation", async () => {
    render(<ReportStepPage step="location" navigate={navigate} />);
    search(singlePlace.name);
    pick(singlePlace.name);
    expect(
      screen.queryByRole("group", { name: /Several road segments/ }),
    ).toBeNull();
    expect(
      screen.getByText(
        segmentCandidates(singlePlace.lat, singlePlace.lon)[0].label,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Not confirmed yet")).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: "Confirm this location" }),
    );
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith("/report/review"),
    );
  });
});

describe("confirmation reset", () => {
  it("clears a confirmed location when it is edited", async () => {
    const candidates = segmentCandidates(
      ambiguousPlace.lat,
      ambiguousPlace.lon,
    );
    writeReportDraft({
      ...createEmptyReportDraft(),
      hazardType: "landslide",
      location: {
        query: ambiguousPlace.name,
        roadSegment: candidates[0].label,
        lat: ambiguousPlace.lat,
        lon: ambiguousPlace.lon,
        accuracyM: null,
        source: "manual",
        confirmed: true,
      },
    });
    render(<ReportStepPage step="location" navigate={navigate} />);
    expect(await screen.findByText("Location confirmed")).toBeInTheDocument();
    // Wait for the saved draft to finish restoring before editing.
    await screen.findByText("Draft restored from this device");
    const group = screen.getByRole("group", {
      name: /Several road segments are nearby/,
    });
    fireEvent.click(
      within(group).getByRole("radio", {
        name: new RegExp(candidates[1].label),
      }),
    );
    expect(await screen.findByText("Not confirmed yet")).toBeInTheDocument();
    // The debounced autosave persists the cleared flag.
    await waitFor(
      async () => {
        const saved = await localDb.drafts.orderBy("updatedAt").last();
        expect(saved?.payload.location).toMatchObject({
          roadSegment: candidates[1].label,
          confirmed: false,
        });
      },
      { timeout: 3000 },
    );
  });
});
