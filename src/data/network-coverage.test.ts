import { describe, expect, it } from "vitest";
import {
  getDeadZoneWarning,
  getNetworkCoverage,
  getNetworkQuality,
} from "./network-coverage";

describe("network coverage lookup", () => {
  it("looks up coverage by the existing segment id and returns no record for an unknown id", () => {
    expect(getNetworkCoverage("nh7-07")).toMatchObject({
      segmentId: "nh7-07",
      quality: "dead_zone",
      deadZoneLengthKm: 14,
    });
    expect(getNetworkCoverage("not-a-segment")).toBeUndefined();
  });

  it("returns the aggregate or selected carrier quality", () => {
    const coverage = getNetworkCoverage("nh7-02")!;
    expect(getNetworkQuality(coverage)).toBe("strong");
    expect(getNetworkQuality(coverage, "bsnl")).toBe("strong");
    expect(getNetworkQuality(coverage, "jio")).toBe("moderate");
  });

  it("warns only when an estimated no-signal stretch applies to the selected network", () => {
    const deadZone = getNetworkCoverage("nh7-07")!;
    expect(getDeadZoneWarning(deadZone)).toBe(
      "14 km low/no signal stretch ahead",
    );
    expect(getDeadZoneWarning(deadZone, "airtel")).toBe(
      "14 km low/no signal stretch ahead",
    );
    expect(getDeadZoneWarning(getNetworkCoverage("nh7-03")!)).toBeUndefined();
  });
});
