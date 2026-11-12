import type { ReportStatus } from "@/lib/types";

/**
 * Prototype scoring rules for the Points, Reputation and Leaderboard tabs.
 *
 * These numbers are a proposal for this prototype, not an approved programme.
 * The UI explanations read from the same constants, so the rules shown to
 * people and the rules applied cannot drift apart.
 *
 * Principles:
 * - Only a reviewer's decision earns anything. Sending, length, photos and
 *   volume do not.
 * - Nothing is ever deducted.
 * - Points and reputation never create, change or lift an official restriction
 *   and never make a report official.
 */
export type OutcomeCounts = Record<ReportStatus, number>;

export const POINTS_PER_OUTCOME: Readonly<Record<ReportStatus, number>> = {
  verified: 10,
  duplicate: 2,
  under_review: 0,
  needs_info: 0,
  conflicting: 0,
  rejected: 0,
};

/** Outcomes where the review has settled. The rest earn nothing until it does. */
export const SETTLED_OUTCOMES = ["verified", "duplicate", "rejected"] as const;
export const UNSETTLED_OUTCOMES = [
  "under_review",
  "needs_info",
  "conflicting",
] as const;

/** Reports needed (verified + rejected) before a level above "new" is shown. */
export const REPUTATION_MIN_DECIDED = 5;
export const REPUTATION_RELIABLE_SHARE = 0.5;
export const REPUTATION_TRUSTED_SHARE = 0.8;

export type ReputationLevel = "new" | "building" | "reliable" | "trusted";

export interface Reputation {
  level: ReputationLevel;
  /** verified + rejected. Duplicates and unsettled reports are left out. */
  decided: number;
  /** verified / decided, or null while nothing is decided. */
  verifiedShare: number | null;
}

export function emptyCounts(): OutcomeCounts {
  return {
    verified: 0,
    duplicate: 0,
    rejected: 0,
    under_review: 0,
    needs_info: 0,
    conflicting: 0,
  };
}

export function computePoints(counts: OutcomeCounts): number {
  return (Object.keys(POINTS_PER_OUTCOME) as ReportStatus[]).reduce(
    (total, outcome) => total + counts[outcome] * POINTS_PER_OUTCOME[outcome],
    0,
  );
}

export function computeReputation(counts: OutcomeCounts): Reputation {
  const decided = counts.verified + counts.rejected;
  const verifiedShare = decided === 0 ? null : counts.verified / decided;
  let level: ReputationLevel = "new";
  if (verifiedShare !== null && decided >= REPUTATION_MIN_DECIDED) {
    level =
      verifiedShare >= REPUTATION_TRUSTED_SHARE
        ? "trusted"
        : verifiedShare >= REPUTATION_RELIABLE_SHARE
          ? "reliable"
          : "building";
  }
  return { level, decided, verifiedShare };
}

export interface RankedEntry<T extends { counts: OutcomeCounts }> {
  entry: T;
  rank: number;
  points: number;
  reputation: Reputation;
}

/**
 * Ranks by points, then by verified share, then by handle order given. Equal
 * points and share share a rank (competition ranking: 1, 2, 2, 4).
 */
export function rankByPoints<T extends { counts: OutcomeCounts }>(
  entries: readonly T[],
): RankedEntry<T>[] {
  const scored = entries.map((entry) => ({
    entry,
    points: computePoints(entry.counts),
    reputation: computeReputation(entry.counts),
  }));
  scored.sort(
    (a, b) =>
      b.points - a.points ||
      (b.reputation.verifiedShare ?? -1) - (a.reputation.verifiedShare ?? -1),
  );
  const ranked: RankedEntry<T>[] = [];
  scored.forEach((item, index) => {
    const prev = ranked[index - 1];
    const tied =
      prev !== undefined &&
      prev.points === item.points &&
      prev.reputation.verifiedShare === item.reputation.verifiedShare;
    ranked.push({ ...item, rank: tied ? prev.rank : index + 1 });
  });
  return ranked;
}