import { forwardRef, useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { REPORTS } from "@/data/fixtures";
import { PreferencesProvider } from "@/i18n/preferences";
import type { ReviewSearch } from "@/lib/review-queue";
import { ReviewDetailView } from "./review-detail-view";
import { ReviewQueueView } from "./review-queue-view";

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/react-router")>();
  const MockLink = forwardRef<
    HTMLAnchorElement,
    React.ComponentProps<"a"> & {
      to?: string;
      params?: Record<string, string>;
      search?: Record<string, string>;
    }
  >(({ to = "#", params, search, ...rest }, ref) => {
    let href = to;
    for (const [key, value] of Object.entries(params ?? {}))
      href = href.replace(`$${key}`, value);
    const query = new URLSearchParams(search ?? {}).toString();
    return <a ref={ref} href={query ? `${href}?${query}` : href} {...rest} />;
  });
  MockLink.displayName = "MockLink";
  return { ...actual, Link: MockLink };
});

async function axeViolations(root: Element) {
  const results = await axe(root, {
    rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
  });
  return results.violations.map((v) => `${v.id}: ${v.nodes.length}`);
}

/** The last search the view asked for, as the route would put in the URL. */
let lastSearch: ReviewSearch = {};

/** Keeps the search in state, the way the route keeps it in the URL. */
function QueueHarness({ initial }: { initial: ReviewSearch }) {
  const [search, setSearch] = useState(initial);
  return (
    <ReviewQueueView
      search={search}
      onSearch={(next) => {
        lastSearch = next;
        setSearch(next);
      }}
    />
  );
}

const renderQueue = (initial: ReviewSearch = {}) =>
  render(
    <PreferencesProvider>
      <QueueHarness initial={initial} />
    </PreferencesProvider>,
  );

const reportByRef = (ref: string) => {
  const report = REPORTS.find((r) => r.ref === ref);
  if (!report) throw new Error(`No report ${ref}`);
  return report;
};

const renderDetail = (ref: string) =>
  render(
    <PreferencesProvider>
      <ReviewDetailView report={reportByRef(ref)} />
    </PreferencesProvider>,
  );

beforeEach(() => {
  window.localStorage.clear();
  lastSearch = {};
});

describe("review queues", () => {
  it("shows the three queues with counts and marks the current one", async () => {
    renderQueue();
    const nav = screen.getByRole("navigation", { name: "Review queues" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/review?queue=needs_review",
      "/review?queue=assigned",
      "/review?queue=history",
    ]);
    expect(links[0]).toHaveAttribute("aria-current", "page");
    // The count is part of the name, separated so it is not read as one word.
    await waitFor(() =>
      expect(links[0]).toHaveAccessibleName("Needs review, 9"),
    );
    expect(links[1]).not.toHaveAttribute("aria-current");
    await waitFor(() =>
      expect(screen.getByTestId("queue-count-needs_review")).toHaveTextContent(
        "9",
      ),
    );
    expect(screen.getByTestId("queue-count-assigned")).toHaveTextContent("0");
    expect(screen.getByTestId("queue-count-history")).toHaveTextContent(
      String(REPORTS.length - 9),
    );
  });

  it("names each card link by its visible hazard plus the report reference", () => {
    renderQueue();
    expect(
      screen.getByRole("link", { name: "Rockfall, RP-419002" }),
    ).toHaveAttribute("href", "/review/RP-419002");
  });

  it("shows every assignment state and offers Claim only when it is possible", () => {
    renderQueue();
    const held = screen.getByTestId("queue-item-RP-419260");
    expect(within(held).getByTestId("review-assignment")).toHaveTextContent(
      "Assigned to Reviewer B",
    );
    expect(within(held).queryByRole("button", { name: /Claim/ })).toBeNull();
    const open = screen.getByTestId("queue-item-RP-419002");
    expect(within(open).getByTestId("review-assignment")).toHaveTextContent(
      "Unassigned",
    );
    expect(
      within(open).getByRole("button", { name: "Claim RP-419002" }),
    ).toBeVisible();
  });

  it("claims a report into Assigned, announces it and moves focus there", async () => {
    const user = userEvent.setup();
    renderQueue();
    await user.click(screen.getByRole("button", { name: "Claim RP-419002" }));

    const message = await screen.findByText(
      "Claimed. It is now in Assigned to me.",
    );
    expect(message).toHaveAttribute("role", "status");
    await waitFor(() => expect(message).toHaveFocus());
    expect(screen.queryByTestId("queue-item-RP-419002")).toBeNull();
    expect(screen.getByTestId("queue-count-assigned")).toHaveTextContent("1");
    expect(
      JSON.parse(window.localStorage.getItem("rp.reviewClaims") ?? "{}"),
    ).toEqual({
      "RP-419002": true,
    });
  });

  it("releases a claimed report back to Needs review", async () => {
    window.localStorage.setItem(
      "rp.reviewClaims",
      JSON.stringify({ "RP-419002": true }),
    );
    const user = userEvent.setup();
    renderQueue({ queue: "assigned" });
    const item = await screen.findByTestId("queue-item-RP-419002");
    expect(within(item).getByTestId("review-assignment")).toHaveTextContent(
      "Assigned to you",
    );

    await user.click(
      within(item).getByRole("button", { name: "Release RP-419002" }),
    );
    await waitFor(() =>
      expect(screen.queryByTestId("queue-item-RP-419002")).toBeNull(),
    );
    expect(
      screen.getByText(
        "You have not claimed any reports. Claim one from Needs review.",
      ),
    ).toBeVisible();
    expect(screen.getByTestId("queue-count-needs_review")).toHaveTextContent(
      "9",
    );
  });

  it("filters with labelled controls and can clear them", async () => {
    const user = userEvent.setup();
    renderQueue();
    await user.selectOptions(screen.getByLabelText("Assignment"), "other");
    expect(lastSearch).toEqual({ assignee: "other" });
    expect(screen.getByTestId("queue-result-count")).toHaveTextContent(
      "2 report(s)",
    );

    await user.selectOptions(screen.getByLabelText("Hazard"), "flooding");
    expect(screen.getByText("No reports match these filters.")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(lastSearch).toEqual({});
    expect(screen.getByTestId("queue-result-count")).toHaveTextContent(
      "9 report(s)",
    );
  });

  it("filters History by outcome and offers no claim controls there", async () => {
    const user = userEvent.setup();
    renderQueue({ queue: "history" });
    expect(screen.queryByLabelText("Assignment")).toBeNull();
    await user.selectOptions(screen.getByLabelText("Outcome"), "rejected");
    expect(screen.getByTestId("queue-result-count")).toHaveTextContent(
      "2 report(s)",
    );
    expect(screen.queryByRole("button", { name: /Claim|Release/ })).toBeNull();
  });

  it("has no detectable accessibility problems in any queue", async () => {
    for (const queue of ["needs_review", "assigned", "history"] as const) {
      const { container, unmount } = renderQueue({ queue });
      expect(await axeViolations(container)).toEqual([]);
      unmount();
    }
  });
});

describe("review incident detail", () => {
  it("shows the report facts, the road and its links", () => {
    renderDetail("RP-419002");
    expect(
      screen.getByRole("heading", { level: 2, name: "Rockfall" }),
    ).toBeVisible();
    expect(
      screen.getByText("Loose rocks on the valley-side lane, one lane usable."),
    ).toBeVisible();
    expect(screen.getByText("Byasi")).toBeVisible();
    expect(
      screen.getByRole("link", { name: /View the public advisory/ }),
    ).toHaveAttribute("href", "/advisories/nh7-01");
    expect(
      screen.getByRole("link", { name: "Back to the queue" }),
    ).toHaveAttribute("href", "/review");
  });

  it("claims and releases, keeping focus on the action", async () => {
    const user = userEvent.setup();
    renderDetail("RP-419002");
    await user.click(screen.getByRole("button", { name: "Claim" }));
    const release = await screen.findByRole("button", { name: "Release" });
    await waitFor(() => expect(release).toHaveFocus());
    expect(screen.getByTestId("review-assignment")).toHaveTextContent(
      "Assigned to you",
    );

    await user.click(release);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Claim" })).toHaveFocus(),
    );
  });

  it("explains a report held by another reviewer instead of offering Claim", () => {
    renderDetail("RP-419260");
    expect(
      screen.getByText(
        "Reviewer B holds this report, so it cannot be claimed.",
      ),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: "Claim" })).toBeNull();
  });

  it("offers no decision control, and says why", () => {
    renderDetail("RP-419002");
    expect(
      screen.getByText(/Recording a decision is not available in this build/),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /verify|reject|approve|decide/i }),
    ).toBeNull();
  });

  it("links both sides of a conflict", () => {
    renderDetail("RP-419301");
    expect(
      screen.getByText(
        "Conflicts with RP-419322. Both reports are unresolved.",
      ),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "RP-419322" })).toHaveAttribute(
      "href",
      "/review/RP-419322",
    );
  });

  it("shows a settled report's outcome with no assignment controls", () => {
    renderDetail("RP-419330");
    expect(
      screen.getByText("The review of this report is settled: Rejected."),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: /Claim|Release/ })).toBeNull();
  });

  it("has no detectable accessibility problems", async () => {
    const { container } = renderDetail("RP-419301");
    expect(await axeViolations(container)).toEqual([]);
  });
});
