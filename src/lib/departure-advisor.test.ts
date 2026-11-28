import { describe, expect, it } from "vitest";
import { SEGMENTS } from "@/data/fixtures";
import type { SegmentAdvisory } from "@/lib/advisory";
import { planRoutes } from "@/lib/route-planner";
import type { CommunityReport } from "@/lib/types";
import {
  getConvoyPulse,
  getDepartureAdvice,
  recordSafeTransitCheckIn,
} from "./departure-advisor";

function getTestSegment() {
  const found = SEGMENTS.find((item) => item.id === "msr-01");
  if (!found) throw new Error("Missing test segment");
  return found;
}

const segment = getTestSegment();

function advisory(
  level: SegmentAdvisory["level"],
  evidence: CommunityReport[] = [],
  restriction?: SegmentAdvisory["restriction"],
): SegmentAdvisory {
  return {
    segmentId: segment.id,
    level,
    basis: restriction ? "official" : "no_evidence",
    restriction,
    restrictionPastReview: false,
    awaitingClearance: false,
    stale: false,
    evidence,
    reviewedCount: 0,
  };
}

function routeFor(
  advisoryValue: SegmentAdvisory,
): NonNullable<ReturnType<typeof planRoutes>[number]> {
  const route = planRoutes({
    originId: "dehradun",
    destinationId: "mussoorie",
    advisories: new Map([[segment.id, advisoryValue]]),
  })[0];
  if (!route) throw new Error("Missing test route");
  return route;
}

function hazardReport(): CommunityReport {
  return {
    ref: "TEST-HAZARD",
    segmentId: segment.id,
    kind: "hazard",
    hazardType: "landslide",
    severity: "high",
    description: "Test-only landslide report",
    landmark: "Test bend",
    observedAt: 1_800_000_000_000,
    receivedAt: 1_800_000_000_000,
    status: "verified",
    source: "traveller",
    locationConfidence: "high",
    photoCount: 0,
    synthetic: true,
  };
}

function roadClearReport(): CommunityReport {
  return {
    ...hazardReport(),
    ref: "TEST-CLEAR",
    kind: "clear",
    hazardType: "other",
    severity: "low",
    status: "verified",
    observedAt: 1_800_000_000_100,
  };
}

const clearRoute = () => routeFor(advisory("clear"));

describe("departure advisor", () => {
  it("scores daylight windows above night windows and recommends the safer slot", () => {
    const reference = new Date(2026, 5, 1, 5, 0).getTime();
    const advice = getDepartureAdvice(clearRoute(), {
      referenceTime: reference,
      horizonHours: 24,
      intervalHours: 2,
    });

    expect(advice.windows).toHaveLength(13);
    expect(advice.bestWindow.departureAt).toBe(reference + 2 * 60 * 60_000);
    expect(advice.bestWindow.rating).toBe("optimal");
    expect(advice.windows[0].score).toBeLessThan(advice.bestWindow.score);
    expect(advice.windows[0].reasons).toContain("night_visibility");
    expect(advice.scoreDelta).toBeGreaterThan(0);
  });

  it("marks afternoon hill windows cautionary even without reported hazards", () => {
    const reference = new Date(2026, 5, 1, 11, 0).getTime();
    const advice = getDepartureAdvice(clearRoute(), {
      referenceTime: reference,
      horizonHours: 6,
      intervalHours: 2,
    });
    const afternoon = advice.windows[2];

    expect(afternoon.reasons).toContain("afternoon_weather");
    expect(afternoon.rating).toBe("caution");
  });

  it("reflects active hazards and official closures in departure ratings", () => {
    const safeRoute = clearRoute();
    const hazardRoute = routeFor(advisory("caution", [hazardReport()]));
    const departureAt = new Date(2026, 5, 1, 10, 0).getTime();
    const safeWindow = getDepartureAdvice(safeRoute, {
      referenceTime: departureAt,
      horizonHours: 0,
    }).bestWindow;
    const hazardWindow = getDepartureAdvice(hazardRoute, {
      referenceTime: departureAt,
      horizonHours: 0,
    }).bestWindow;

    expect(hazardWindow.score).toBeLessThan(safeWindow.score);
    expect(hazardWindow.reasons).toContain("active_hazard");
    expect(hazardWindow.rating).toBe("caution");

    const closedRoute = routeFor(
      advisory("do_not_travel", [], {
        id: "TEST-CLOSURE",
        segmentId: segment.id,
        type: "road_closed",
        title: "Test closure",
        issuingAuthority: "Test authority",
        jurisdiction: "Dehradun",
        supportingReference: "TEST",
        publishedAt: departureAt,
        effectiveFrom: departureAt,
        reviewBy: departureAt + 60_000,
        status: "active",
        clearance: "not_requested",
        synthetic: true,
      }),
    );
    const closedWindow = getDepartureAdvice(closedRoute, {
      referenceTime: departureAt,
      horizonHours: 0,
    }).bestWindow;

    expect(closedWindow.score).toBe(0);
    expect(closedWindow.rating).toBe("high_risk");
    expect(closedWindow.reasons).toContain("closed_route");
    expect(getConvoyPulse(closedRoute).canCheckIn).toBe(false);
  });

  it("applies a published time-bound restriction only when the route reaches it", () => {
    const timeRestrictedRoute = routeFor(
      advisory("caution", [], {
        id: "TEST-TIME-RESTRICTION",
        segmentId: segment.id,
        type: "time_bound",
        title: "No vehicle movement 20:00 – 06:00",
        issuingAuthority: "Test authority",
        jurisdiction: "Dehradun",
        supportingReference: "TEST",
        publishedAt: 1_800_000_000_000,
        effectiveFrom: 1_800_000_000_000,
        reviewBy: 1_800_100_000_000,
        status: "active",
        clearance: "not_requested",
        synthetic: true,
      }),
    );
    const openAt = new Date(2026, 5, 1, 10, 0).getTime();
    const restrictedAt = new Date(2026, 5, 1, 19, 30).getTime();
    const openWindow = getDepartureAdvice(timeRestrictedRoute, {
      referenceTime: openAt,
      horizonHours: 0,
    }).bestWindow;
    const restrictedWindow = getDepartureAdvice(timeRestrictedRoute, {
      referenceTime: restrictedAt,
      horizonHours: 0,
    }).bestWindow;

    expect(openWindow.reasons).not.toContain("official_restriction");
    expect(restrictedWindow.reasons).toContain("official_restriction");
    expect(restrictedWindow.score).toBeLessThan(openWindow.score);
    expect(restrictedWindow.rating).toBe("high_risk");
  });

  it("uses verified clear reports for the pulse label and increments local check-ins", () => {
    const route = routeFor(advisory("clear", [roadClearReport()]));
    const initial = getConvoyPulse(route);
    const updatedState = recordSafeTransitCheckIn(
      { count: 0 },
      1_800_000_001_000,
    );
    const updated = getConvoyPulse(route, updatedState);

    expect(initial.estimatedSafeCrossingsLastHour).toBeGreaterThan(0);
    expect(initial.lastVerifiedRoadCheckInAt).toBe(1_800_000_000_100);
    expect(updated.localCheckInCount).toBe(1);
    expect(updated.pulseCount).toBe(initial.pulseCount + 1);
    expect(updated.lastLocalCheckInAt).toBe(1_800_000_001_000);
  });
});
