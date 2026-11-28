import { DEMO_NOW, placeById, SEGMENTS } from "@/data/fixtures";
import type {
  NetworkCarrier,
  NetworkCarrierFilter,
  NetworkCoverage,
  NetworkQuality,
} from "@/lib/types";

// Scenario data only; these corridor estimates are not measured carrier coverage.
const carrierProfiles: Record<
  string,
  readonly [NetworkQuality, NetworkQuality, NetworkQuality]
> = {
  "nh7-01": ["moderate", "moderate", "moderate"],
  "nh7-02": ["moderate", "moderate", "strong"],
  "nh7-03": ["strong", "strong", "strong"],
  "nh7-04": ["moderate", "moderate", "strong"],
  "nh7-05": ["weak", "moderate", "moderate"],
  "nh7-06": ["weak", "weak", "moderate"],
  "nh7-07": ["dead_zone", "dead_zone", "dead_zone"],
  "nh107-01": ["moderate", "moderate", "moderate"],
  "nh107-02": ["moderate", "moderate", "strong"],
  "nh107-03": ["weak", "weak", "moderate"],
  "nh107-04": ["dead_zone", "dead_zone", "dead_zone"],
  "nh34-01": ["moderate", "moderate", "strong"],
  "nh34-02": ["moderate", "weak", "moderate"],
  "nh34-03": ["weak", "weak", "moderate"],
  "nh34-04": ["dead_zone", "dead_zone", "dead_zone"],
  "msr-01": ["strong", "strong", "moderate"],
  "ddn-01": ["strong", "strong", "strong"],
  "ddn-02": ["strong", "strong", "moderate"],
  "hrd-01": ["strong", "strong", "strong"],
  "ntl-01": ["strong", "strong", "strong"],
  "ntl-02": ["moderate", "moderate", "strong"],
  "ntl-03": ["moderate", "moderate", "moderate"],
  "alm-01": ["weak", "moderate", "moderate"],
  "alm-02": ["weak", "weak", "moderate"],
  "bgs-01": ["moderate", "weak", "moderate"],
  "bgs-02": ["weak", "weak", "moderate"],
  "pth-01": ["moderate", "moderate", "moderate"],
  "pth-02": ["weak", "weak", "moderate"],
  "pth-03": ["moderate", "moderate", "strong"],
  "nh9-01": ["weak", "weak", "moderate"],
  "nh9-02": ["moderate", "moderate", "strong"],
  "nh9-03": ["weak", "moderate", "moderate"],
  "pau-01": ["weak", "weak", "moderate"],
  "pau-02": ["moderate", "moderate", "moderate"],
  "psn-01": ["strong", "strong", "strong"],
  "rud-01": ["strong", "strong", "strong"],
};

const deadZoneLengths: Record<string, number> = {
  "nh7-07": 14,
  "nh107-04": 3,
  "nh34-04": 9,
};

const qualityRank: Record<NetworkQuality, number> = {
  strong: 0,
  moderate: 1,
  weak: 2,
  dead_zone: 3,
};

const bestQuality = (qualities: readonly NetworkQuality[]): NetworkQuality =>
  [...qualities].sort((a, b) => qualityRank[a] - qualityRank[b])[0];

const qualityEstimate = (
  quality: NetworkQuality,
): Pick<NetworkCoverage, "estimatedBandwidthTier" | "estimatedLatencyTier"> => {
  switch (quality) {
    case "strong":
      return {
        estimatedBandwidthTier: "4G/5G",
        estimatedLatencyTier: "<100 ms",
      };
    case "moderate":
      return {
        estimatedBandwidthTier: "3G-4G intermittent",
        estimatedLatencyTier: "100-300 ms",
      };
    case "weak":
      return {
        estimatedBandwidthTier: "2G-3G fallback",
        estimatedLatencyTier: ">300 ms",
      };
    case "dead_zone":
      return {
        estimatedBandwidthTier: "No service",
        estimatedLatencyTier: "unavailable",
      };
  }
};

export const NETWORK_COVERAGE: NetworkCoverage[] = SEGMENTS.map(
  (segment, index) => {
    const [jio, airtel, bsnl] = carrierProfiles[segment.id] ?? [
      "moderate",
      "moderate",
      "moderate",
    ];
    const quality = bestQuality([jio, airtel, bsnl]);
    return {
      segmentId: segment.id,
      quality,
      carrierCoverage: { jio, airtel, bsnl },
      ...qualityEstimate(quality),
      deadZoneLengthKm: deadZoneLengths[segment.id] ?? 0,
      lastVerifiedAt: DEMO_NOW - (index % 12) * 3_600_000,
      sampleCount: 6 + (index % 9),
      offlineSyncAdvice: {
        en: "Reports are queued on this device and sync when coverage returns.",
        hi: "रिपोर्टें इस डिवाइस पर कतार में रहेंगी और नेटवर्क लौटने पर सिंक होंगी।",
      },
      emergencyPointBeforeDeadZone:
        placeById(segment.from)?.name ?? segment.from,
    };
  },
);

const coverageBySegment = new Map(
  NETWORK_COVERAGE.map((coverage) => [coverage.segmentId, coverage]),
);

export function getNetworkCoverage(
  segmentId: string,
): NetworkCoverage | undefined {
  return coverageBySegment.get(segmentId);
}

export function getNetworkQuality(
  coverage: NetworkCoverage,
  carrier: NetworkCarrierFilter = "all",
): NetworkQuality {
  return carrier === "all"
    ? coverage.quality
    : coverage.carrierCoverage[carrier];
}

export function getDeadZoneWarning(
  coverage: NetworkCoverage,
  carrier: NetworkCarrierFilter = "all",
): string | undefined {
  if (
    coverage.deadZoneLengthKm === 0 ||
    getNetworkQuality(coverage, carrier) !== "dead_zone"
  ) {
    return undefined;
  }
  return `${coverage.deadZoneLengthKm} km low/no signal stretch ahead`;
}

export const NETWORK_QUALITY_COLORS: Record<NetworkQuality, string> = {
  strong: "#16a34a",
  moderate: "#eab308",
  weak: "#f97316",
  dead_zone: "#dc2626",
};

export const NETWORK_CARRIERS: readonly NetworkCarrier[] = [
  "jio",
  "airtel",
  "bsnl",
];
