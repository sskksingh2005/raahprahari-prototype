import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AiSuggestionAssist } from "@/features/reports/ai-suggestions";
import { setAccountSession } from "@/lib/account-session";
import { ReportStepPage } from "@/features/reports/report-step-page";
import { localDb } from "@/lib/local-db";
import { readReportDraft } from "@/lib/report-store";

const invoke = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/supabase")>();
  return {
    ...actual,
    isSupabaseConfigured: () => true,
    getSupabaseClient: () => ({ functions: { invoke } }),
  };
});

const HAZARDS = [
  { value: "landslide" as const, label: "Landslide" },
  { value: "flooding" as const, label: "Flooding" },
];

const success = {
  data: {
    suggestions: {
      hazardType: "landslide",
      laneDirection: "one_lane",
      vehicleApplicability: "unknown",
      source: "firsthand",
    },
  },
  error: null,
};

function mount(description = "Rocks fell, one lane open") {
  const onApply = vi.fn();
  const view = render(
    <AiSuggestionAssist
      description={description}
      hazardOptions={HAZARDS}
      onApply={onApply}
    />,
  );
  return { onApply, ...view };
}

// AI requires a signed-in user; most tests run signed in.
beforeEach(() => {
  setAccountSession({ status: "authenticated", userId: "u1" });
});

afterEach(async () => {
  invoke.mockReset();
  setAccountSession({ status: "signed_out", userId: null });
  window.localStorage.clear();
  await localDb.drafts.clear();
});

describe("AI suggestions while signed out", () => {
  it("explains sign-in is required, sends nothing and keeps manual reporting", async () => {
    setAccountSession({ status: "signed_out", userId: null });
    const navigate = vi.fn();
    const user = userEvent.setup();
    render(<ReportStepPage step="observation" navigate={navigate} />);
    await user.click(screen.getByRole("button", { name: "Landslide" }));
    const description = screen.getByLabelText("Describe the condition");
    await user.type(description, "Rocks on the road");
    await user.click(
      screen.getByRole("button", { name: "Suggest details with AI" }),
    );

    expect(
      await screen.findByText(/Sign in to use AI suggestions\./),
    ).toHaveTextContent("Your description is kept.");
    expect(invoke).not.toHaveBeenCalled();
    expect(description).toHaveValue("Rocks on the road");

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(navigate).toHaveBeenCalledWith("/report/photo");
    await waitFor(() =>
      expect(readReportDraft()).toMatchObject({
        hazardType: "landslide",
        description: "Rocks on the road",
      }),
    );
  });
});

describe("AI suggestion assist", () => {
  it("offers the button only when there is a description", () => {
    mount("   ");
    expect(
      screen.queryByRole("button", { name: "Suggest details with AI" }),
    ).toBeNull();
  });

  it("shows a loading state, then editable suggestions that are not applied automatically", async () => {
    let resolve!: (value: typeof success) => void;
    invoke.mockReturnValue(new Promise((r) => (resolve = r)));
    const user = userEvent.setup();
    const { onApply } = mount();
    await user.click(
      screen.getByRole("button", { name: "Suggest details with AI" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("Getting suggestions");
    expect(
      screen.getByRole("button", { name: "Suggest details with AI" }),
    ).toBeDisabled();
    resolve(success);

    const panel = (
      await screen.findByRole("heading", {
        name: "AI suggestion — review and edit",
      })
    ).closest("section")!;
    // Only fields the AI suggested (vehicle stayed unknown).
    expect(within(panel).getByLabelText("Hazard")).toHaveValue("landslide");
    expect(within(panel).getByLabelText("Road affected")).toHaveValue(
      "one_lane",
    );
    expect(within(panel).getByLabelText("Source")).toHaveValue("firsthand");
    expect(within(panel).queryByLabelText("Vehicles that can pass")).toBeNull();
    expect(onApply).not.toHaveBeenCalled();
  });

  it("applies an edited value on accept and nothing on reject", async () => {
    invoke.mockResolvedValue(success);
    const user = userEvent.setup();
    const { onApply } = mount();
    await user.click(
      screen.getByRole("button", { name: "Suggest details with AI" }),
    );
    const hazard = await screen.findByLabelText("Hazard");
    await user.selectOptions(hazard, "flooding");
    await user.click(screen.getByRole("button", { name: "Accept: Hazard" }));
    expect(onApply).toHaveBeenCalledWith({ hazardType: "flooding" });
    expect(screen.queryByLabelText("Hazard")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Reject: Source" }));
    await user.click(
      screen.getByRole("button", { name: "Reject: Road affected" }),
    );
    expect(onApply).toHaveBeenCalledTimes(1);
    // Panel closes once every field is resolved.
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: /AI suggestion/ }),
      ).toBeNull(),
    );
  });

  it("shows a rate-limit message with the wait time and keeps manual entry", async () => {
    invoke.mockResolvedValue({
      data: null,
      error: {
        name: "FunctionsHttpError",
        context: {
          status: 429,
          json: async () => ({ error: "rate_limited", retryAfterSeconds: 42 }),
        },
      },
    });
    const user = userEvent.setup();
    const { onApply } = mount();
    await user.click(
      screen.getByRole("button", { name: "Suggest details with AI" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Try again in 42 seconds. Your description is kept.",
    );
    expect(onApply).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Suggest details with AI" }),
    ).toBeEnabled();
  });

  it("shows error and unavailable states with manual entry still possible", async () => {
    invoke.mockResolvedValue({
      data: null,
      error: { name: "FunctionsFetchError" },
    });
    const user = userEvent.setup();
    mount();
    await user.click(
      screen.getByRole("button", { name: "Suggest details with AI" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not reach the suggestion service. Your description is kept.",
    );
    invoke.mockResolvedValue({
      data: null,
      error: {
        name: "FunctionsHttpError",
        context: {
          status: 503,
          json: async () => ({ error: "not_configured" }),
        },
      },
    });
    await user.click(
      screen.getByRole("button", { name: "Suggest details with AI" }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "not available in this build",
    );
    expect(
      screen.getByRole("button", { name: "Suggest details with AI" }),
    ).toBeEnabled();
  });
});

describe("AI suggestions in the observation step", () => {
  it("falls back to manual entry when AI fails, keeping everything entered", async () => {
    invoke.mockResolvedValue({
      data: null,
      error: {
        name: "FunctionsHttpError",
        context: {
          status: 502,
          json: async () => ({ error: "upstream_error" }),
        },
      },
    });
    const navigate = vi.fn();
    const user = userEvent.setup();
    render(<ReportStepPage step="observation" navigate={navigate} />);
    await user.click(screen.getByRole("button", { name: "Flooding" }));
    const description = screen.getByLabelText("Describe the condition");
    await user.type(description, "Water across the road");
    await user.click(
      screen.getByRole("button", { name: "Suggest details with AI" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Suggestions failed this time.",
    );
    expect(description).toHaveValue("Water across the road");
    expect(screen.getByRole("button", { name: "Flooding" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // Manual entry still works and the step can be completed.
    await user.click(screen.getByRole("radio", { name: "I saw it myself" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(navigate).toHaveBeenCalledWith("/report/photo");
    await waitFor(() =>
      expect(readReportDraft()).toMatchObject({
        hazardType: "flooding",
        description: "Water across the road",
        source: "firsthand",
      }),
    );
  });

  it("keeps the description and changes the draft only on accept", async () => {
    invoke.mockResolvedValue(success);
    const user = userEvent.setup();
    render(<ReportStepPage step="observation" navigate={vi.fn()} />);
    const description = screen.getByLabelText("Describe the condition");
    await user.type(description, "Rocks fell, one lane open");
    await user.click(
      screen.getByRole("button", { name: "Suggest details with AI" }),
    );
    await screen.findByRole("heading", {
      name: "AI suggestion — review and edit",
    });
    expect(screen.getByRole("button", { name: "Landslide" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    await user.click(screen.getByRole("button", { name: "Accept: Hazard" }));
    expect(screen.getByRole("button", { name: "Landslide" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(description).toHaveValue("Rocks fell, one lane open");
    await waitFor(() =>
      expect(readReportDraft()?.hazardType).toBe("landslide"),
    );
    // Rejected or still-open suggestions never reach the draft.
    expect(readReportDraft()?.source).toBe("unknown");
  });
});
