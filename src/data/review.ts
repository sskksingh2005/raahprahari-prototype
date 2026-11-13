import type { SeededAssignments } from "@/lib/review-queue";
import type { HazardType } from "@/lib/types";

/**
 * SYNTHETIC reviewer assignments: pending reports already held by a made-up
 * second reviewer, so the queues show all three assignment states. No real
 * person is named.
 */
export const SEEDED_ASSIGNMENTS: SeededAssignments = {
  "RP-419260": "Reviewer B",
  "RP-419150": "Reviewer B",
};

/** Hazard types a filter may name; the order is the order shown in the menu. */
export const REVIEW_HAZARDS: readonly HazardType[] = [
  "landslide",
  "rockfall",
  "flooding",
  "road_block",
  "fallen_tree",
  "damaged_bridge",
  "road_damage",
  "snow_ice",
  "poor_visibility",
  "accident",
  "other",
];
