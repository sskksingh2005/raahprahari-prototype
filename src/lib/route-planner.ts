import { CORRIDORS, PLACES, SEGMENTS } from "@/data/fixtures";
import { NETWORK_COVERAGE } from "@/data/network-coverage";
import { findSeededRoutes, type RouteOption } from "@/features/routes/routing";
import type {
  Corridor,
  NetworkCoverage,
  NetworkQuality,
  Place,
  Segment,
} from "@/lib/types";
import type { AdvisoryLevel, SegmentAdvisory } from "@/lib/advisory";

const MAX_SCORED_CANDIDATES = 50;

export type RouteDesignation =
  "safest" | "fastest" | "best_network" | "alternative";

export interface PlannedRouteStep {
  segment: Segment;
  fromId: string;
  toId: string;
  reversed: boolean;
  advisory: SegmentAdvisory | undefined;
  networkCoverage: NetworkCoverage | undefined;
}

export interface PlannedRoute {
  id: string;
  designations: RouteDesignation[];
  steps: PlannedRouteStep[];
  via: string[];
  corridorIds: string[];
  corridorNames: string[];
  distanceKm: number;
  etaMinutes: number;
  safetyScore: number;
  networkScore: number;
  hazardCount: number;
  restrictionCount: number;
  deadZoneKm: number;
  hasRoadClosure: boolean;
}

export interface PlanRoutesOptions {
  originId: string;
  destinationId: string;
  advisories: ReadonlyMap<string, SegmentAdvisory>;
  places?: readonly Place[];
  corridors?: readonly Corridor[];
  segments?: readonly Segment[];
  networkCoverage?: readonly NetworkCoverage[];
}

const safetyLevelPenalty: Record<AdvisoryLevel, number> = {
  clear: 0,
  unknown: 12,
  caution: 24,
  avoid: 55,
  do_not_travel: 90,
};

const restrictionPenalty: Record<
  NonNullable<SegmentAdvisory["restriction"]>["type"],
  number
> = {
  road_closed: 100,
  partially_restricted: 35,
  vehicle_restricted: 18,
  time_bound: 15,
};

const networkPenalty: Record<NetworkQuality, number> = {
  strong: 0,
  moderate: 18,
  weak: 55,
  dead_zone: 90,
};

function routeNodes(
  route: RouteOption,
  originId: string,
  destinationId: string,
) {
  return [originId, ...route.via, destinationId];
}

function scoreRoute(
  route: RouteOption,
  originId: string,
  destinationId: string,
  advisories: ReadonlyMap<string, SegmentAdvisory>,
  coverageBySegment: ReadonlyMap<string, NetworkCoverage>,
  corridorNames: ReadonlyMap<string, string>,
): PlannedRoute {
  const nodes = routeNodes(route, originId, destinationId);
  const steps = route.segments.map((segment, index): PlannedRouteStep => {
    const fromId = nodes[index];
    const toId = nodes[index + 1];
    return {
      segment,
      fromId,
      toId,
      reversed: segment.from !== fromId,
      advisory: advisories.get(segment.id),
      networkCoverage: coverageBySegment.get(segment.id),
    };
  });

  let weightedSafetyPenalty = 0;
  let weightedNetworkPenalty = 0;
  let hazardCount = 0;
  let restrictionCount = 0;
  let deadZoneKm = 0;
  let hasRoadClosure = false;

  for (const step of steps) {
    const distance = step.segment.distanceKm;
    const advisory = step.advisory;
    const hazards =
      advisory?.evidence.filter((report) => report.kind === "hazard").length ??
      0;
    hazardCount += hazards;
    if (advisory?.restriction) restrictionCount++;
    if (advisory?.restriction?.type === "road_closed") hasRoadClosure = true;

    const segmentSafetyPenalty = Math.min(
      100,
      safetyLevelPenalty[advisory?.level ?? "unknown"] +
        hazards * 3 +
        (advisory?.restriction
          ? restrictionPenalty[advisory.restriction.type]
          : 0),
    );
    weightedSafetyPenalty += segmentSafetyPenalty * distance;

    const network = step.networkCoverage;
    weightedNetworkPenalty +=
      (network ? networkPenalty[network.quality] : networkPenalty.weak) *
      distance;
    if (network) {
      deadZoneKm += Math.min(distance, Math.max(0, network.deadZoneLengthKm));
    }
  }

  const routeDistance = route.distanceKm;
  const averageSafetyPenalty = routeDistance
    ? weightedSafetyPenalty / routeDistance
    : 100;
  const averageNetworkPenalty = routeDistance
    ? weightedNetworkPenalty / routeDistance
    : 100;

  return {
    id: route.id,
    designations: [],
    steps,
    via: route.via,
    corridorIds: route.corridorIds,
    corridorNames: route.corridorIds.flatMap((id) => {
      const name = corridorNames.get(id);
      return name ? [name] : [];
    }),
    distanceKm: routeDistance,
    etaMinutes: route.typicalMinutes,
    safetyScore: Math.max(0, Math.round(100 - averageSafetyPenalty)),
    networkScore: Math.max(0, Math.round(100 - averageNetworkPenalty)),
    hazardCount,
    restrictionCount,
    deadZoneKm: Math.round(deadZoneKm * 10) / 10,
    hasRoadClosure,
  };
}

export function planRoutes({
  originId,
  destinationId,
  advisories,
  places = PLACES,
  corridors = CORRIDORS,
  segments = SEGMENTS,
  networkCoverage = NETWORK_COVERAGE,
}: PlanRoutesOptions): PlannedRoute[] {
  if (
    originId === destinationId ||
    !places.some((place) => place.id === originId) ||
    !places.some((place) => place.id === destinationId)
  ) {
    return [];
  }

  const coverageBySegment = new Map(
    networkCoverage.map((coverage) => [coverage.segmentId, coverage]),
  );
  const corridorNames = new Map(
    corridors.map((corridor) => [corridor.id, corridor.name]),
  );
  const candidates = findSeededRoutes(
    originId,
    destinationId,
    segments,
    MAX_SCORED_CANDIDATES,
  ).map((route) =>
    scoreRoute(
      route,
      originId,
      destinationId,
      advisories,
      coverageBySegment,
      corridorNames,
    ),
  );
  if (candidates.length === 0) return [];

  const fastest = [...candidates].sort(
    (a, b) => a.etaMinutes - b.etaMinutes || a.distanceKm - b.distanceKm,
  )[0];
  const safest = [...candidates].sort(
    (a, b) =>
      b.safetyScore - a.safetyScore ||
      a.restrictionCount - b.restrictionCount ||
      a.hazardCount - b.hazardCount ||
      a.etaMinutes - b.etaMinutes,
  )[0];
  const bestNetwork = [...candidates].sort(
    (a, b) =>
      b.networkScore - a.networkScore ||
      a.deadZoneKm - b.deadZoneKm ||
      a.etaMinutes - b.etaMinutes,
  )[0];

  const designationWinners: [RouteDesignation, PlannedRoute][] = [
    ["safest", safest],
    ["fastest", fastest],
    ["best_network", bestNetwork],
  ];
  const selected: PlannedRoute[] = [];

  for (const [designation, route] of designationWinners) {
    const selectedRoute = selected.find((item) => item.id === route.id);
    if (selectedRoute) {
      selectedRoute.designations.push(designation);
    } else {
      selected.push({ ...route, designations: [designation] });
    }
  }

  for (const candidate of candidates) {
    if (selected.length >= 3) break;
    if (selected.some((route) => route.id === candidate.id)) continue;
    selected.push({ ...candidate, designations: ["alternative"] });
  }

  return selected;
}
