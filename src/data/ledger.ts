import { DEMO_NOW } from "@/data/fixtures";
import type { LedgerEntry } from "@/lib/contribution-ledger";

const daysAgo = (d: number) => DEMO_NOW - d * 24 * 3600_000;

/**
 * SYNTHETIC example ledger that walks through an award, a reversal, an upheld
 * appeal and an appealable reversal. It belongs to no real person, and its
 * report references are made up.
 */
export const EXAMPLE_LEDGER: readonly LedgerEntry[] = [
  { id: "e1", at: daysAgo(12), points: 10, reason: "verified", reportRef: "RP-418203" },
  { id: "e2", at: daysAgo(11), points: 2, reason: "duplicate", reportRef: "RP-418815" },
  { id: "e3", at: daysAgo(9), points: 10, reason: "verified", reportRef: "RP-418770" },
  {
    id: "e4",
    at: daysAgo(6),
    points: -10,
    reason: "verification_withdrawn",
    reportRef: "RP-418770",
    reverses: "e3",
  },
  { id: "e5", at: daysAgo(5), points: 10, reason: "verified", reportRef: "RP-419215" },
  {
    id: "e6",
    at: daysAgo(4),
    points: -10,
    reason: "review_corrected",
    reportRef: "RP-419215",
    reverses: "e5",
    appealOutcome: "upheld",
  },
  {
    id: "e7",
    at: daysAgo(2),
    points: 10,
    reason: "appeal_upheld",
    reportRef: "RP-419215",
    reverses: "e6",
  },
];
