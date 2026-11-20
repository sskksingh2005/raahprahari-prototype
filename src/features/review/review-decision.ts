export type ReviewAction = "confirm" | "reject" | "merge" | "escalate";

export interface ReviewDecisionInput {
  ref: string;
  action: ReviewAction;
  rationale: string;
  /** Merge only: the report this one is merged into. */
  targetRef?: string;
  /** Escalate only: why it is sent on. */
  reason?: string;
  /** The version of the review state this decision was based on. Sent whenever the state was loaded. */
  expectedVersion?: number;
}

/** Thrown by the adapter when the server holds a newer version than `expectedVersion`. */
export class ReviewVersionConflictError extends Error {
  constructor(message = "Version conflict") {
    super(message);
    this.name = "ReviewVersionConflictError";
  }
}

/** One authorised history entry. The server owns these; the console never edits them. */
export interface ReviewHistoryEntry {
  id: string;
  actor: string;
  /** A correction is a new entry, never a rewrite of an earlier one. */
  action: ReviewAction | "correction";
  /** Epoch milliseconds. */
  at: number;
  rationale?: string;
}

export interface ReviewSnapshot {
  version: number;
  history: ReviewHistoryEntry[];
}

/** Fetches the current version and authorised history for a report. */
export type ReviewSnapshotLoader = (ref: string) => Promise<ReviewSnapshot>;

/**
 * Sends a decision to the review backend. The backend checks the caller's role
 * and owns every status change; it rejects (throws) when it does not accept the
 * decision. A decision never creates or removes an official closure.
 */
export type ReviewDecisionAdapter = (
  input: ReviewDecisionInput,
) => Promise<void>;

export const REVIEW_ACTIONS: readonly ReviewAction[] = [
  "confirm",
  "reject",
  "merge",
  "escalate",
];
