import { describe, expect, it } from "vitest";
import { computeSegmentAdvisory, type SegmentAdvisory } from "@/lib/advisory";
import {
  CORRIDORS,
  DEMO_NOW,
  PLACES as SEEDED_PLACES,
  REPORTS,
  RESTRICTIONS,
  SEGMENTS as SEEDED_SEGMENTS,
} from "@/data/fixtures";
import type { Corridor, NetworkCoverage, Place, Segment } from "@/lib/types";
import { planRoutes } from "./route-planner";

const places: Place[] = ["a", "b", "c", "d"].map((id, index) => ({
  id,
  name: id.toUpperCase(),
  nameHi: id.toUpperCase(),
  district: "Dehradun",
  lat: 30 + index * 0.1,
  lon: 78 + index * 0.1,
}));

const corridor: Corridor = {
  id: "corridor",
  code: "TEST",
  name: "Test corridor",
  stops: places.map((place) => place.id),
  legs: [],
};

function segment(
  id: string,
  from: string,
  to: string,
  distanceKm: number,
  typicalMinutes: number,
): Segment {
  return {
    id,
    corridorId: corridor.id,
    code: id.toUpperCase(),
    from,
    to,
    kmStart: 0,
    kmEnd: distanceKm,
    distanceKm,
    typicalMinutes,
    path: [
      [places.find((place) => place.id === from)!.lat, 78],
      [places.find((place) => place.id === to)!.lat, 78],
    ],
  };
}

function advisory(
  segmentId: string,
  level: SegmentAdvisory["level"],
): SegmentAdvisory {
  return {
    segmentId,
    level,
    basis: "no_evidence",
    restrictionPastReview: false,
    awaitingClearance: false,
    stale: false,
    evidence: [],
    reviewedCount: 0,
  };
}

function coverage(
  segmentId: string,
  quality: NetworkCoverage["quality"],
  deadZoneLengthKm = 0,
): NetworkCoverage {
  return {
    segmentId,
    quality,
    carrierCoverage: { jio: quality, airtel: quality, bsnl: quality },
    estimatedBandwidthTier: quality === "dead_zone" ? "No service" : "4G/5G",
    estimatedLatencyTier: quality === "dead_zone" ? "unavailable" : "<100 ms",
    deadZoneLengthKm,
    lastVerifiedAt: 1,
    sampleCount: 1,
    offlineSyncAdvice: {
      en: "Sync when connected",
      hi: "कनेक्ट होने पर सिंक करें",
    },
    emergencyPointBeforeDeadZone: "Test stop",
  };
}

const segments = [
  segment("ab", "a", "b", 8, 15),
  segment("bd", "b", "d", 9, 15),
  segment("ac", "a", "c", 12, 22),
  segment("cd", "c", "d", 11, 22),
  segment("ad", "a", "d", 30, 50),
];

describe("planRoutes", () => {
  it("chooses distinct safest, fastest, and best-network alternatives", () => {
    const advisories = new Map([
      ["ab", advisory("ab", "avoid")],
      ["bd", advisory("bd", "caution")],
      ["ac", advisory("ac", "clear")],
      ["cd", advisory("cd", "clear")],
      ["ad", advisory("ad", "caution")],
    ]);
    const routes = planRoutes({
      originId: "a",
      destinationId: "d",
      places,
      corridors: [corridor],
      segments,
      advisories,
      networkCoverage: [
        coverage("ab", "dead_zone", 4),
        coverage("bd", "dead_zone", 6),
        coverage("ac", "moderate"),
        coverage("cd", "moderate"),
        coverage("ad", "strong"),
      ],
    });

    expect(routes).toHaveLength(3);
    expect(new Set(routes.map((route) => route.id)).size).toBe(3);
    expect(
      routes.find((route) => route.designations.includes("safest"))?.id,
    ).toBe("a>c>d");
    expect(
      routes.find((route) => route.designations.includes("fastest"))?.id,
    ).toBe("a>b>d");
    expect(
      routes.find((route) => route.designations.includes("best_network"))?.id,
    ).toBe("a>d");
    expect(routes.find((route) => route.id === "a>b>d")).toMatchObject({
      distanceKm: 17,
      etaMinutes: 30,
      deadZoneKm: 10,
    });
  });

  it("returns no routes for identical or unknown places", () => {
    const options = {
      places,
      corridors: [corridor],
      segments,
      advisories: new Map(),
    };
    expect(
      planRoutes({ ...options, originId: "a", destinationId: "a" }),
    ).toEqual([]);
    expect(
      planRoutes({ ...options, originId: "missing", destinationId: "d" }),
    ).toEqual([]);
  });

  it("preserves travel direction when returning ordered segment steps", () => {
    const reverse = planRoutes({
      originId: "d",
      destinationId: "a",
      places,
      corridors: [corridor],
      segments: [segments[4]],
      advisories: new Map(),
    });

    expect(reverse[0].steps).toMatchObject([
      { segment: { id: "ad" }, fromId: "d", toId: "a", reversed: true },
    ]);
  });

  it("uses seeded advisories and coverage for Uttarakhand corridor routes", () => {
    const advisories = new Map(
      SEEDED_SEGMENTS.map((item) => [
        item.id,
        computeSegmentAdvisory(item.id, REPORTS, RESTRICTIONS, DEMO_NOW),
      ]),
    );
    const routes = planRoutes({
      originId: "rishikesh",
      destinationId: "badrinath",
      places: SEEDED_PLACES,
      corridors: CORRIDORS,
      segments: SEEDED_SEGMENTS,
      advisories,
    });

    expect(routes.length).toBeGreaterThan(0);
    expect(routes[0].steps.map((step) => step.segment.id)).toContain("nh7-06");
    expect(routes[0]).toMatchObject({
      hasRoadClosure: true,
      restrictionCount: expect.any(Number),
    });
    expect(routes[0].restrictionCount).toBeGreaterThan(0);
    expect(routes[0].hazardCount).toBeGreaterThan(0);
    expect(routes[0].deadZoneKm).toBeGreaterThanOrEqual(14);
  });
});
