export interface NetworkTelemetry {
  online: boolean | null;
  effectiveType: string | null;
  downlinkMbps: number | null;
  roundTripTimeMs: number | null;
  capturedAt: number;
}

interface NetworkInformation {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

type NavigatorWithNetworkInformation = Navigator & {
  connection?: NetworkInformation;
};

/** Reads coarse browser connection hints only; it never reads location or sends data. */
export function readNetworkTelemetry(): NetworkTelemetry {
  if (typeof navigator === "undefined") {
    return {
      online: null,
      effectiveType: null,
      downlinkMbps: null,
      roundTripTimeMs: null,
      capturedAt: Date.now(),
    };
  }

  const connection = (navigator as NavigatorWithNetworkInformation).connection;
  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType ?? null,
    downlinkMbps: connection?.downlink ?? null,
    roundTripTimeMs: connection?.rtt ?? null,
    capturedAt: Date.now(),
  };
}
