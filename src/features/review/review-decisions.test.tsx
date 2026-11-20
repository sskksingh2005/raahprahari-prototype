import { forwardRef } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { REPORTS } from "@/data/fixtures";
import { PreferencesProvider } from "@/i18n/preferences";
import type { CommunityReport } from "@/lib/types";
import type { ReviewDecisionAdapter } from "./review-decision";
import { ReviewDetailView } from "./review-detail-view";
import { ObservationEvidence } from "./review-observations";

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

const report = (ref: string): CommunityReport => {
  const found = REPORTS.find((r) => r.ref === ref);
  if (!found) throw new Error(`No report ${ref}`);
  return found;
};

const renderDetail = (onDecision: ReviewDecisionAdapter, ref = "RP-419301") =>
  render(
    <PreferencesProvider>
      <ReviewDetailView report={report(ref)} onDecision={onDecision} />
    </PreferencesProvider>,
  );

beforeEach(() => {
  window.localStorage.clear();
});

describe("review decision dialogs", () => {
  it("requires a rationale before submitting", async () => {
    const onDecision = vi.fn<ReviewDecisionAdapter>().mockResolvedValue();
    const user = userEvent.setup();
    renderDetail(onDecision);
    await user.click(screen.getByRole("button", { name: "Reject" }));
    const dialog = await screen.findByRole("dialog", {
      name: "Reject this report",
    });
    expect(dialog).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Submit" }));
    const field = screen.getByLabelText("Rationale (required)");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription(
      "Enter a rationale before submitting.",
    );
    expect(onDecision).not.toHaveBeenCalled();
  });

  it("requires a reason to escalate", async () => {
    const onDecision = vi.fn<ReviewDecisionAdapter>().mockResolvedValue();
    const user = userEvent.setup();
    renderDetail(onDecision);
    await user.click(screen.getByRole("button", { name: "Escalate" }));
    await user.type(screen.getByLabelText("Rationale (required)"), "Unclear");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(
      screen.getByLabelText("Reason for escalating (required)"),
    ).toHaveAccessibleDescription("Enter the reason for escalating.");
    expect(onDecision).not.toHaveBeenCalled();
  });

  it("shows the in-flight state and blocks a double submit", async () => {
    let resolve: () => void = () => {};
    const onDecision = vi.fn<ReviewDecisionAdapter>(
      () => new Promise<void>((r) => (resolve = r)),
    );
    const user = userEvent.setup();
    renderDetail(onDecision);
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    await user.type(
      screen.getByLabelText("Rationale (required)"),
      "Two sources agree",
    );
    await user.click(screen.getByRole("button", { name: "Submit" }));

    const submit = await screen.findByRole("button", { name: "Submitting…" });
    expect(submit).toBeDisabled();
    expect(screen.getByTestId("review-act-spinner")).toBeInTheDocument();
    await user.click(submit);
    expect(onDecision).toHaveBeenCalledTimes(1);
    expect(onDecision).toHaveBeenCalledWith({
      ref: "RP-419301",
      action: "confirm",
      rationale: "Two sources agree",
    });

    resolve();
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("keeps the dialog and typed text on a server error, and retries", async () => {
    const onDecision = vi
      .fn<ReviewDecisionAdapter>()
      .mockRejectedValueOnce(new Error("Not permitted"))
      .mockResolvedValueOnce();
    const user = userEvent.setup();
    renderDetail(onDecision);
    await user.click(screen.getByRole("button", { name: "Reject" }));
    await user.type(screen.getByLabelText("Rationale (required)"), "No proof");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Not permitted");
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.getByLabelText("Rationale (required)")).toHaveValue(
      "No proof",
    );
    expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onDecision).toHaveBeenCalledTimes(2);
  });

  it("closes on Escape and returns focus to the button that opened it", async () => {
    const onDecision = vi.fn<ReviewDecisionAdapter>().mockResolvedValue();
    const user = userEvent.setup();
    renderDetail(onDecision);
    const open = screen.getByRole("button", { name: "Merge" });
    await user.click(open);
    await screen.findByRole("dialog", { name: "Merge into another report" });

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(open).toHaveFocus());
    expect(onDecision).not.toHaveBeenCalled();
  });

  it("offers no decision buttons without an adapter", () => {
    render(
      <PreferencesProvider>
        <ReviewDetailView report={report("RP-419301")} />
      </PreferencesProvider>,
    );
    expect(screen.queryByRole("button", { name: "Confirm" })).toBeNull();
  });
});

describe("observation independence", () => {
  const base = report("RP-419301");
  const group: CommunityReport[] = [
    {
      ...base,
      ref: "RP-1",
      source: "traveller",
      independent: true,
      independenceRationale: "Seen from the opposite bank.",
    },
    { ...base, ref: "RP-2", source: "volunteer", independent: false },
    { ...base, ref: "RP-3", source: "traveller" },
  ];

  const renderGroup = (g: CommunityReport[]) =>
    render(
      <PreferencesProvider>
        <ObservationEvidence group={g} />
      </PreferencesProvider>,
    );

  it("shows source, independence and rationale for each observation", () => {
    renderGroup(group);
    const one = screen.getByTestId("observation-RP-1");
    expect(one).toHaveTextContent("Traveller");
    expect(one).toHaveTextContent("Independent of the other observations");
    expect(one).toHaveTextContent("Seen from the opposite bank.");
    const two = screen.getByTestId("observation-RP-2");
    expect(two).toHaveTextContent("Volunteer");
    expect(two).toHaveTextContent("Not independent of the other observations");
    expect(two).toHaveTextContent("No rationale recorded");
    expect(screen.getByTestId("observation-RP-3")).toHaveTextContent(
      "Independence not recorded",
    );
    expect(screen.getByText(/does not by itself mean/)).toBeVisible();
  });

  it("says corroborated only when independent evidence is recorded", () => {
    const { unmount } = renderGroup(group);
    expect(screen.getByTestId("review-corroboration")).toHaveTextContent(
      "Corroborated: independent evidence is recorded.",
    );
    unmount();

    // Several accounts, none recorded as independent.
    renderGroup(group.map((r) => ({ ...r, independent: undefined })));
    expect(screen.getByTestId("review-corroboration")).toHaveTextContent(
      "Not corroborated",
    );
    expect(screen.queryByText(/Verified|Safe/)).toBeNull();
  });
});
