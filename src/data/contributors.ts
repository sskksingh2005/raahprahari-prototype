import type { OutcomeCounts } from "@/lib/contribution";

/**
 * SYNTHETIC contributors for the leaderboard prototype. Handles are made up and
 * identify no real person. Counts are reviewed outcomes, and points and
 * reputation are always computed from them (see `src/lib/contribution.ts`).
 */
export interface SyntheticContributor {
  id: string;
  handle: string;
  counts: OutcomeCounts;
  /** Only opted-in contributors appear on the board or in aggregates. */
  optedIn: boolean;
  synthetic: true;
}

const counts = (
  verified: number,
  duplicate: number,
  rejected: number,
  pending: number,
  needsInfo = 0,
  conflicting = 0,
): OutcomeCounts => ({
  verified,
  duplicate,
  rejected,
  under_review: pending,
  needs_info: needsInfo,
  conflicting,
});

export const SYNTHETIC_CONTRIBUTORS: readonly SyntheticContributor[] = [
  { id: "c1", handle: "PahadiScout", counts: counts(18, 3, 1, 2), synthetic: true, optedIn: true },
  { id: "c2", handle: "KedarWatch", counts: counts(12, 2, 2, 1, 1), synthetic: true, optedIn: true },
  // High volume, low verified share: many points, modest reputation.
  { id: "c3", handle: "RoadRunner42", counts: counts(10, 6, 11, 3, 0, 2), synthetic: true, optedIn: true },
  { id: "c4", handle: "GangaGhat", counts: counts(9, 1, 1, 0), synthetic: true, optedIn: true },
  { id: "c5", handle: "DoonDriver", counts: counts(6, 2, 4, 1), synthetic: true, optedIn: true },
  // Few decided reports: reputation stays "new" despite a perfect record.
  { id: "c6", handle: "NewToTheHills", counts: counts(3, 0, 0, 4), synthetic: true, optedIn: false },
  { id: "c7", handle: "BhagirathiBlue", counts: counts(2, 1, 0, 0), synthetic: true, optedIn: true },
  { id: "c8", handle: "FogLamp", counts: counts(0, 0, 2, 1), synthetic: true, optedIn: false },
];
