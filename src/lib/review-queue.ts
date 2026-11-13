import type {
  CommunityReport,
  HazardType,
  ReportStatus,
  Severity,
} from "@/lib/types";

/**
 * Reviewer queues, derived from the review status each report already has.
 *
 * Needs review: pending reports nobody on this device has claimed.
 * Assigned:     pending reports claimed by the reviewer on this device.
 * History:      reports whose review is settled.
 *
 * Pure: the caller supplies the reports, the claims and the seeded
 * assignments. Claims live in this browser only; there is no review service.
 */
export type ReviewQueue = "needs_review" | "assigned" | "history";
export type Assignment = "unassigned" | "mine" | "other";
export type QueueSort = "oldest" | "newest" | "severity";
export type SettledOutcome = "verified" | "duplicate" | "rejected";

export const QUEUES: readonly ReviewQueue[] = [
  "needs_review",
  "assigned",
  "history",
];
export const PENDING_STATUSES: readonly ReportStatus[] = [
  "under_review",
  "needs_info",
  "conflicting",
];
export const SETTLED_OUTCOMES: readonly SettledOutcome[] = [
  "verified",
  "duplicate",
  "rejected",
];
export const SEVERITIES: readonly Severity[] = ["high", "moderate", "low"];

/** Report refs claimed on this device. */
export type Claims = Readonly<Record<string, true>>;
/** Report ref → synthetic reviewer handle, for reports someone else holds. */
export type SeededAssignments = Readonly<Record<string, string>>;

export interface QueueFilters {
  hazard?: HazardType;
  severity?: Severity;
  /** Needs review only: narrow to unassigned or to another reviewer. */
  assignee?: "unassigned" | "other";
  /** History only. */
  outcome?: SettledOutcome;
  sort?: QueueSort;
}

export interface QueueItem {
  report: CommunityReport;
  assignment: Assignment;
  /** Synthetic handle when assignment is "other". */
  assignee?: string;
}

export const isPending = (status: ReportStatus) =>
  PENDING_STATUSES.includes(status);

export function assignmentOf(
  report: CommunityReport,
  claims: Claims,
  seeded: SeededAssignments,
): { assignment: Assignment; assignee?: string } {
  // A settled report is no longer held by anyone.
  if (!isPending(report.status)) return { assignment: "unassigned" };
  if (seeded[report.ref])
    return { assignment: "other", assignee: seeded[report.ref] };
  if (claims[report.ref]) return { assignment: "mine" };
  return { assignment: "unassigned" };
}

export function queueOf(
  report: CommunityReport,
  claims: Claims,
  seeded: SeededAssignments,
) {
  if (!isPending(report.status)) return "history" as const;
  return assignmentOf(report, claims, seeded).assignment === "mine"
    ? ("assigned" as const)
    : ("needs_review" as const);
}

/** A claim is possible only on a pending report that nobody holds. */
export function canClaim(
  report: CommunityReport,
  claims: Claims,
  seeded: SeededAssignments,
) {
  return (
    assignmentOf(report, claims, seeded).assignment === "unassigned" &&
    isPending(report.status)
  );
}

const SEVERITY_RANK: Record<Severity, number> = {
  high: 0,
  moderate: 1,
  low: 2,
};

export function defaultSort(queue: ReviewQueue): QueueSort {
  // Pending work is first come, first served; history reads newest first.
  return queue === "history" ? "newest" : "oldest";
}

export function buildQueue(
  reports: readonly CommunityReport[],
  queue: ReviewQueue,
  claims: Claims,
  seeded: SeededAssignments,
  filters: QueueFilters = {},
): QueueItem[] {
  const items = reports
    .filter((report) => queueOf(report, claims, seeded) === queue)
    .map((report) => ({ report, ...assignmentOf(report, claims, seeded) }))
    .filter(({ report, assignment }) => {
      if (filters.hazard && report.hazardType !== filters.hazard) return false;
      if (filters.severity && report.severity !== filters.severity)
        return false;
      if (
        queue === "needs_review" &&
        filters.assignee &&
        assignment !== filters.assignee
      )
        return false;
      if (
        queue === "history" &&
        filters.outcome &&
        report.status !== filters.outcome
      )
        return false;
      return true;
    });
  const sort = filters.sort ?? defaultSort(queue);
  return items.sort((a, b) => {
    if (sort === "severity") {
      const bySeverity =
        SEVERITY_RANK[a.report.severity] - SEVERITY_RANK[b.report.severity];
      if (bySeverity) return bySeverity;
    }
    const byTime = a.report.receivedAt - b.report.receivedAt;
    // Ties fall back to the reference so the order is stable.
    const ordered = byTime || a.report.ref.localeCompare(b.report.ref);
    return sort === "newest" ? -ordered : ordered;
  });
}

export function queueCounts(
  reports: readonly CommunityReport[],
  claims: Claims,
  seeded: SeededAssignments,
): Record<ReviewQueue, number> {
  const counts: Record<ReviewQueue, number> = {
    needs_review: 0,
    assigned: 0,
    history: 0,
  };
  for (const report of reports) counts[queueOf(report, claims, seeded)] += 1;
  return counts;
}

/** Reports this one points to, and reports on the same road segment. */
export function relatedReports(
  report: CommunityReport,
  reports: readonly CommunityReport[],
) {
  const linked = new Set(
    [report.duplicateOf, report.conflictsWith].filter(Boolean),
  );
  // Reports that point back at this one are related too.
  for (const other of reports)
    if (other.duplicateOf === report.ref || other.conflictsWith === report.ref)
      linked.add(other.ref);
  const byRef = (ref: string) => reports.find((r) => r.ref === ref);
  return {
    linked: [...linked]
      .map((ref) => byRef(ref as string))
      .filter((r): r is CommunityReport => !!r),
    sameSegment: reports.filter(
      (other) =>
        other.ref !== report.ref &&
        other.segmentId === report.segmentId &&
        !linked.has(other.ref),
    ),
  };
}

/** The queue and its filters, as kept in the URL so a view can be shared. */
export interface ReviewSearch extends QueueFilters {
  queue?: ReviewQueue;
}

const SORTS: readonly QueueSort[] = ["oldest", "newest", "severity"];
const ASSIGNEE_FILTERS = ["unassigned", "other"] as const;

/** Narrows untrusted URL search values; anything unrecognised is dropped. */
export function parseQueueSearch(
  search: Record<string, unknown>,
  hazards: readonly HazardType[],
): ReviewSearch {
  const pick = <T extends string>(value: unknown, allowed: readonly T[]) =>
    typeof value === "string" && (allowed as readonly string[]).includes(value)
      ? (value as T)
      : undefined;
  const parsed: ReviewSearch = {
    queue: pick(search.queue, QUEUES),
    hazard: pick(search.hazard, hazards),
    severity: pick(search.severity, SEVERITIES),
    assignee: pick(search.assignee, ASSIGNEE_FILTERS),
    outcome: pick(search.outcome, SETTLED_OUTCOMES),
    sort: pick(search.sort, SORTS),
  };
  // Omit empty keys so the URL stays short.
  return Object.fromEntries(
    Object.entries(parsed).filter(([, value]) => value !== undefined),
  ) as ReviewSearch;
}
