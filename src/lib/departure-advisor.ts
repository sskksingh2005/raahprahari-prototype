import type { PlannedRoute } from "@/lib/route-planner";
import type { OfficialRestriction } from "@/lib/types";

export type DepartureRating = "optimal" | "caution" | "high_risk";

export type DepartureReason =
  | "daylight"
  | "night_visibility"
  | "afternoon_weather"
  | "active_hazard"
  | "official_restriction"
  | "network_gaps"
  | "limited_updates"
  | "closed_route";

export interface DepartureWindow {
  departureAt: number;
  arrivalAt: number;
  score: number;
  rating: DepartureRating;
  reasons: DepartureReason[];
}

export interface DepartureAdvice {
  windows: DepartureWindow[];
  bestWindow: DepartureWindow;
  lowestScoringWindow: DepartureWindow;
  scoreDelta: number;
}

export interface DepartureAdviceOptions {
  referenceTime?: number;
  horizonHours?: number;
  intervalHours?: number;
}

export interface SafeTransitCheckInState {
  count: number;
  lastCheckInAt?: number;
}

export interface ConvoyPulse {
  estimatedSafeCrossingsLastHour: number;
  localCheckInCount: number;
  pulseCount: number;
  lastVerifiedRoadCheckInAt?: number;
  lastLocalCheckInAt?: number;
  canCheckIn: boolean;
}

const DAYLIGHT_START_HOUR = 6;
const DAYLIGHT_END_HOUR = 18;
const AFTERNOON_RAIN_START_HOUR = 14;
const AFTERNOON_RAIN_END_HOUR = 18;
const HILL_CORRIDORS = new Set([
  "nh7",
  "nh107",
  "nh34",
  "msr",
  "ntl",
  "alm",
  "bgs",
  "pth",
  "nh9",
  "pau",
  "psn",
]);

function isDaylight(timestamp: number): boolean {
  const hour = new Date(timestamp).getHours();
  return hour >= DAYLIGHT_START_HOUR && hour < DAYLIGHT_END_HOUR;
}

function isAfternoonRainWindow(timestamp: number): boolean {
  const hour = new Date(timestamp).getHours();
  return hour >= AFTERNOON_RAIN_START_HOUR && hour < AFTERNOON_RAIN_END_HOUR;
}

function hasActiveHazard(route: PlannedRoute): boolean {
  return route.steps.some((step) =>
    step.advisory?.evidence.some((report) => report.kind === "hazard"),
  );
}

function hasUnscheduledRestriction(route: PlannedRoute): boolean {
  return route.steps.some(
    (step) =>
      step.advisory?.restriction &&
      step.advisory.restriction.type !== "time_bound",
  );
}

function isTimeRestrictionActive(
  restriction: OfficialRestriction,
  timestamp: number,
): boolean {
  const range = restriction.title.match(
    /(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/,
  );
  if (!range) return true;

  const [, startHour, startMinute, endHour, endMinute] = range;
  const start = Number(startHour) * 60 + Number(startMinute);
  const end = Number(endHour) * 60 + Number(endMinute);
  if (
    Number(startHour) > 23 ||
    Number(startMinute) > 59 ||
    Number(endHour) > 23 ||
    Number(endMinute) > 59 ||
    start === end
  ) {
    return true;
  }

  const date = new Date(timestamp);
  const minuteOfDay = date.getHours() * 60 + date.getMinutes();
  return start < end
    ? minuteOfDay >= start && minuteOfDay < end
    : minuteOfDay >= start || minuteOfDay < end;
}

function isRouteClosed(route: PlannedRoute): boolean {
  return (
    route.hasRoadClosure ||
    route.steps.some(
      (step) => step.advisory?.restriction?.type === "road_closed",
    )
  );
}

function hasLimitedUpdates(route: PlannedRoute): boolean {
  return route.steps.some(
    (step) => !step.advisory || step.advisory.level === "unknown",
  );
}

function hasDeadZone(route: PlannedRoute): boolean {
  return (
    route.deadZoneKm > 0 ||
    route.steps.some((step) => step.networkCoverage?.quality === "dead_zone")
  );
}

function isHighRisk(
  route: PlannedRoute,
  score: number,
  timeBoundViolation: boolean,
): boolean {
  return (
    isRouteClosed(route) ||
    timeBoundViolation ||
    score < 50 ||
    route.steps.some((step) => step.advisory?.level === "do_not_travel")
  );
}

function scoreDeparture(
  route: PlannedRoute,
  departureAt: number,
): DepartureWindow {
  const routeClosed = isRouteClosed(route);
  const hazard = hasActiveHazard(route) || route.hazardCount > 0;
  let restriction = hasUnscheduledRestriction(route);
  const limitedUpdates = hasLimitedUpdates(route);
  const deadZone = hasDeadZone(route);
  const reasons = new Set<DepartureReason>();
  const totalDistance = route.steps.reduce(
    (distance, step) => distance + step.segment.distanceKm,
    0,
  );

  let elapsedMinutes = 0;
  let temporalPenalty = 0;
  let afternoonHazardExposure = false;
  let timeBoundViolation = false;

  for (const step of route.steps) {
    const distanceShare = totalDistance
      ? step.segment.distanceKm / totalDistance
      : 0;
    const segmentPassageAt =
      departureAt +
      elapsedMinutes * 60_000 +
      step.segment.typicalMinutes * 30_000;
    const hillSegment = HILL_CORRIDORS.has(step.segment.corridorId);
    const hazardSensitive = step.advisory?.evidence.some(
      (report) =>
        report.kind === "hazard" &&
        ["landslide", "rockfall", "flooding"].includes(report.hazardType),
    );

    if (hillSegment && !isDaylight(segmentPassageAt)) {
      temporalPenalty += 30 * distanceShare;
      reasons.add("night_visibility");
    } else if (hillSegment) {
      reasons.add("daylight");
    }

    if (hillSegment && isAfternoonRainWindow(segmentPassageAt)) {
      temporalPenalty += 10 * distanceShare;
      reasons.add("afternoon_weather");
      if (hazardSensitive) {
        temporalPenalty += 12 * distanceShare;
        afternoonHazardExposure = true;
      }
    }

    const timeBoundRestriction =
      step.advisory?.restriction?.type === "time_bound"
        ? step.advisory.restriction
        : undefined;
    if (
      timeBoundRestriction &&
      isTimeRestrictionActive(timeBoundRestriction, segmentPassageAt)
    ) {
      restriction = true;
      temporalPenalty += 45 * distanceShare;
      timeBoundViolation = true;
      reasons.add("official_restriction");
    }

    elapsedMinutes += step.segment.typicalMinutes;
  }

  if (hazard) reasons.add("active_hazard");
  if (restriction) reasons.add("official_restriction");
  if (deadZone) reasons.add("network_gaps");
  if (limitedUpdates) reasons.add("limited_updates");
  if (routeClosed) reasons.add("closed_route");

  const networkPenalty = Math.min(
    18,
    route.deadZoneKm * 0.7 + Math.max(0, 100 - route.networkScore) * 0.08,
  );
  const score = routeClosed
    ? 0
    : Math.max(
        0,
        Math.min(
          100,
          Math.round(route.safetyScore - temporalPenalty - networkPenalty),
        ),
      );
  const rating: DepartureRating = isHighRisk(route, score, timeBoundViolation)
    ? "high_risk"
    : score >= 75 &&
        !hazard &&
        !restriction &&
        !limitedUpdates &&
        !deadZone &&
        !reasons.has("afternoon_weather")
      ? "optimal"
      : "caution";

  if (afternoonHazardExposure) reasons.add("active_hazard");

  return {
    departureAt,
    arrivalAt: departureAt + route.etaMinutes * 60_000,
    score,
    rating,
    reasons: [...reasons],
  };
}

export function getDepartureAdvice(
  route: PlannedRoute,
  {
    referenceTime = Date.now(),
    horizonHours = 24,
    intervalHours = 2,
  }: DepartureAdviceOptions = {},
): DepartureAdvice {
  if (
    !Number.isFinite(referenceTime) ||
    !Number.isFinite(horizonHours) ||
    horizonHours < 0 ||
    !Number.isFinite(intervalHours) ||
    intervalHours <= 0
  ) {
    throw new RangeError("Departure window times must be finite and positive.");
  }

  const slotCount = Math.floor(horizonHours / intervalHours);
  const windows = Array.from({ length: slotCount + 1 }, (_, index) =>
    scoreDeparture(route, referenceTime + index * intervalHours * 60 * 60_000),
  );
  const bestWindow = windows.reduce((best, window) =>
    window.score > best.score ? window : best,
  );
  const lowestScoringWindow = windows.reduce((lowest, window) =>
    window.score < lowest.score ? window : lowest,
  );

  return {
    windows,
    bestWindow,
    lowestScoringWindow,
    scoreDelta: bestWindow.score - lowestScoringWindow.score,
  };
}

export function getConvoyPulse(
  route: PlannedRoute,
  checkIn: SafeTransitCheckInState = { count: 0 },
): ConvoyPulse {
  const blocked =
    isRouteClosed(route) ||
    route.steps.some((step) => step.advisory?.level === "do_not_travel");
  const estimatedSafeCrossingsLastHour = blocked
    ? 0
    : route.safetyScore < 40
      ? 0
      : Math.min(
          8,
          Math.max(
            1,
            Math.round((route.safetyScore + route.networkScore) / 25),
          ),
        );
  const lastVerifiedRoadCheckInAt = route.steps
    .flatMap((step) => step.advisory?.evidence ?? [])
    .filter((report) => report.kind === "clear" && report.status === "verified")
    .reduce<number | undefined>(
      (latest, report) =>
        latest === undefined || report.observedAt > latest
          ? report.observedAt
          : latest,
      undefined,
    );

  return {
    estimatedSafeCrossingsLastHour,
    localCheckInCount: checkIn.count,
    pulseCount: estimatedSafeCrossingsLastHour + checkIn.count,
    lastVerifiedRoadCheckInAt,
    lastLocalCheckInAt: checkIn.lastCheckInAt,
    canCheckIn:
      !blocked &&
      route.safetyScore >= 50 &&
      !route.steps.some((step) => step.advisory?.level === "avoid"),
  };
}

export function recordSafeTransitCheckIn(
  current: SafeTransitCheckInState,
  checkedInAt = Date.now(),
): SafeTransitCheckInState {
  if (!Number.isFinite(checkedInAt)) {
    throw new RangeError("Check-in time must be finite.");
  }
  return {
    count: current.count + 1,
    lastCheckInAt: checkedInAt,
  };
}
