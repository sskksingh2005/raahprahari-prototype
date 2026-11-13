import { describe, expect, it } from "vitest";
import { REPORTS } from "@/data/fixtures";
import { REVIEW_HAZARDS, SEEDED_ASSIGNMENTS } from "@/data/review";
import {
  assignmentOf,
  buildQueue,
  canClaim,
  parseQueueSearch,
  queueCounts,
  queueOf,
  relatedReports,
} from "./review-queue";

const byRef = (ref: string) => {
  const report = REPORTS.find((r) => r.ref === ref);
  if (!report) throw new Error(ref);
  return report;
};
const NONE = {};

describe("queue membership", () => {
  it("puts every seeded report in exactly one queue", () => {
    const counts = queueCounts(REPORTS, NONE, SEEDED_ASSIGNMENTS);
    expect(counts.needs_review + counts.assigned + counts.history).toBe(
      REPORTS.length,
    );
    // 5 under review + 1 needs info + 3 conflicting are pending; nothing is claimed yet.
    expect(counts).toEqual({
      needs_review: 9,
      assigned: 0,
      history: REPORTS.length - 9,
    });
  });

  it("moves a claimed report from Needs review to Assigned, and back on release", () => {
    const ref = "RP-419002";
    expect(queueOf(byRef(ref), NONE, SEEDED_ASSIGNMENTS)).toBe("needs_review");
    const claimed = { [ref]: true as const };
    expect(queueOf(byRef(ref), claimed, SEEDED_ASSIGNMENTS)).toBe("assigned");
    expect(
      assignmentOf(byRef(ref), claimed, SEEDED_ASSIGNMENTS).assignment,
    ).toBe("mine");
    expect(queueCounts(REPORTS, claimed, SEEDED_ASSIGNMENTS).assigned).toBe(1);
  });

  it("keeps reports held by another reviewer in Needs review and unclaimable", () => {
    const held = byRef("RP-419260");
    expect(assignmentOf(held, NONE, SEEDED_ASSIGNMENTS)).toEqual({
      assignment: "other",
      assignee: "Reviewer B",
    });
    expect(canClaim(held, NONE, SEEDED_ASSIGNMENTS)).toBe(false);
    // A stale claim on this device cannot take it over.
    expect(queueOf(held, { "RP-419260": true }, SEEDED_ASSIGNMENTS)).toBe(
      "needs_review",
    );
  });

  it("treats settled reports as history, ignoring any claim", () => {
    const settled = byRef("RP-418203");
    expect(queueOf(settled, { "RP-418203": true }, SEEDED_ASSIGNMENTS)).toBe(
      "history",
    );
    expect(canClaim(settled, NONE, SEEDED_ASSIGNMENTS)).toBe(false);
  });
});

describe("filters and sorting", () => {
  it("filters Needs review by hazard, severity and assignment", () => {
    const refs = (filters: Parameters<typeof buildQueue>[4]) =>
      buildQueue(
        REPORTS,
        "needs_review",
        NONE,
        SEEDED_ASSIGNMENTS,
        filters,
      ).map((i) => i.report.ref);
    expect(refs({ hazard: "landslide" })).toEqual(["RP-419260"]);
    expect(refs({ assignee: "other" }).sort()).toEqual([
      "RP-419150",
      "RP-419260",
    ]);
    expect(refs({ assignee: "unassigned" })).not.toContain("RP-419260");
    expect(
      refs({ severity: "high" }).every((ref) => byRef(ref).severity === "high"),
    ).toBe(true);
  });

  it("filters History by outcome", () => {
    const items = buildQueue(REPORTS, "history", NONE, SEEDED_ASSIGNMENTS, {
      outcome: "rejected",
    });
    expect(items.map((i) => i.report.ref).sort()).toEqual([
      "RP-419101",
      "RP-419330",
    ]);
  });

  it("sorts pending work oldest first and history newest first by default", () => {
    const pending = buildQueue(
      REPORTS,
      "needs_review",
      NONE,
      SEEDED_ASSIGNMENTS,
    );
    const times = pending.map((i) => i.report.receivedAt);
    expect(times).toEqual([...times].sort((a, b) => a - b));
    const history = buildQueue(
      REPORTS,
      "history",
      NONE,
      SEEDED_ASSIGNMENTS,
    ).map((i) => i.report.receivedAt);
    expect(history).toEqual([...history].sort((a, b) => b - a));
  });

  it("sorts by severity, highest first", () => {
    const items = buildQueue(
      REPORTS,
      "needs_review",
      NONE,
      SEEDED_ASSIGNMENTS,
      { sort: "severity" },
    );
    const rank = { high: 0, moderate: 1, low: 2 };
    const ranks = items.map((i) => rank[i.report.severity]);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });
});

describe("URL search parsing", () => {
  it("keeps valid values and drops unknown or unsafe ones", () => {
    expect(
      parseQueueSearch(
        {
          queue: "history",
          hazard: "landslide",
          severity: "extreme",
          sort: "<script>",
          extra: 1,
        },
        REVIEW_HAZARDS,
      ),
    ).toEqual({ queue: "history", hazard: "landslide" });
    expect(parseQueueSearch({}, REVIEW_HAZARDS)).toEqual({});
  });
});

describe("related reports", () => {
  it("links conflicts in both directions and lists the rest of the segment", () => {
    const related = relatedReports(byRef("RP-419301"), REPORTS);
    expect(related.linked.map((r) => r.ref)).toEqual(["RP-419322"]);
    expect(related.sameSegment).toEqual([]);
    const backLinked = relatedReports(byRef("RP-418842"), REPORTS);
    expect(backLinked.linked.map((r) => r.ref)).toEqual(["RP-418851"]);
  });
});
