import type { OutcomeCounts } from "@/lib/contribution";

/**
 * Append-only points ledger, appeal notes, and pseudonymous aggregates.
 *
 * Privacy limits, enforced here and not only in the copy:
 * - Ledger entries hold a report reference, a reason code and points. They hold
 *   no location, no contact details and no free text.
 * - Appeal notes are checked and refused if they look like a phone number or a
 *   precise coordinate pair.
 * - There is no cash, voucher or redemption concept anywhere in this module.
 */

export type LedgerReason =
  | "verified"
  | "duplicate"
  | "verification_withdrawn"
  | "review_corrected"
  | "appeal_upheld";

export interface LedgerEntry {
  id: string;
  at: number;
  /** Signed points. A reversal is a new entry; the original is never edited. */
  points: number;
  reason: LedgerReason;
  reportRef: string;
  /** The entry this one undoes or restores. */
  reverses?: string;
  /** Recorded result of an appeal against this entry, if one was decided. */
  appealOutcome?: "upheld" | "not_upheld";
}

export function isReversal(entry: LedgerEntry): boolean {
  return entry.points < 0;
}

export function ledgerBalance(entries: readonly LedgerEntry[]): number {
  return entries.reduce((total, entry) => total + entry.points, 0);
}

/** An entry can be appealed when it removed points and no decision is recorded. */
export function canAppeal(entry: LedgerEntry): boolean {
  return isReversal(entry) && entry.appealOutcome === undefined;
}

export const APPEAL_NOTE_MAX = 300;

export type AppealNoteProblem = "empty" | "tooLong" | "phone" | "coordinates";

const PHONE_LIKE = /(?:\+?\d[\s().-]?){7,}/;
const COORDINATE_PAIR = /-?\d{1,3}\.\d{3,}\s*[,;/\s]\s*-?\d{1,3}\.\d{3,}/;

/** Returns the first problem found, or null when the note is acceptable. */
export function checkAppealNote(note: string): AppealNoteProblem | null {
  const text = note.trim();
  if (!text) return "empty";
  if (text.length > APPEAL_NOTE_MAX) return "tooLong";
  if (COORDINATE_PAIR.test(text)) return "coordinates";
  if (PHONE_LIKE.test(text)) return "phone";
  return null;
}

export interface StoredAppeal {
  note: string;
  at: number;
}

export interface ContributionSettings {
  /** Show my pseudonym on the leaderboard. Off until the person turns it on. */
  showOnLeaderboard: boolean;
  /** Count my reviewed reports in community totals. Off until turned on. */
  includeInAggregates: boolean;
  /** Random label made on this device. It is not derived from any identity. */
  pseudonym: string | null;
}

export const DEFAULT_CONTRIBUTION_SETTINGS: ContributionSettings = {
  showOnLeaderboard: false,
  includeInAggregates: false,
  pseudonym: null,
};

/** Totals are withheld below this many participants so no one can be singled out. */
export const AGGREGATE_MIN_PARTICIPANTS = 5;

export interface Aggregates {
  participants: number;
  /** null while there are too few participants to show totals safely. */
  totals: null | {
    verified: number;
    duplicate: number;
    rejected: number;
    verifiedShare: number | null;
  };
}

export function aggregateCounts(
  groups: readonly OutcomeCounts[],
  minParticipants = AGGREGATE_MIN_PARTICIPANTS,
): Aggregates {
  if (groups.length < minParticipants)
    return { participants: groups.length, totals: null };
  const sum = groups.reduce(
    (acc, c) => ({
      verified: acc.verified + c.verified,
      duplicate: acc.duplicate + c.duplicate,
      rejected: acc.rejected + c.rejected,
    }),
    { verified: 0, duplicate: 0, rejected: 0 },
  );
  const decided = sum.verified + sum.rejected;
  return {
    participants: groups.length,
    totals: {
      ...sum,
      verifiedShare: decided === 0 ? null : sum.verified / decided,
    },
  };
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const WORDS = ["Hiker", "Ridge", "Pine", "Cedar", "Glacier", "Valley"] as const;

/** Random label such as "Cedar-7K2Q". Uses the browser's random source only. */
export function makePseudonym(): string {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  const word = WORDS[bytes[0] % WORDS.length];
  const code = Array.from(bytes.slice(1), (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `${word}-${code}`;
}
