import { COVERAGE_BOUNDS, PLACES, SEGMENTS, placeById } from "@/data/fixtures";
import type { Place, Segment } from "@/lib/types";

export const inCoverage = (lat: number, lon: number) =>
  lat >= COVERAGE_BOUNDS.minLat &&
  lat <= COVERAGE_BOUNDS.maxLat &&
  lon >= COVERAGE_BOUNDS.minLon &&
  lon <= COVERAGE_BOUNDS.maxLon;

export function haversineKm(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function nearestPlace(lat: number, lon: number): Place {
  return PLACES.reduce((best, p) =>
    haversineKm(lat, lon, p.lat, p.lon) <
    haversineKm(lat, lon, best.lat, best.lon)
      ? p
      : best,
  );
}

/** Approximate distance (km) from a point to a straight segment between two places. */
function pointToSegmentKm(lat: number, lon: number, s: Segment) {
  const a = placeById(s.from)!;
  const b = placeById(s.to)!;
  const k = Math.cos((lat * Math.PI) / 180);
  const ax = a.lon * k,
    ay = a.lat,
    bx = b.lon * k,
    by = b.lat,
    px = lon * k,
    py = lat;
  const dx = bx - ax,
    dy = by - ay;
  const tt = Math.max(
    0,
    Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)),
  );
  const cx = ax + tt * dx,
    cy = ay + tt * dy;
  return Math.hypot(px - cx, py - cy) * 111;
}

/** Labelled road sections within `withinKm` of a point, nearest first. */
export function segmentCandidates(lat: number, lon: number, withinKm = 15) {
  return nearbySegments(lat, lon, withinKm).map(({ segment, km }) => ({
    id: segment.id,
    km,
    label: `${segment.code} · ${placeById(segment.from)?.name ?? ""} – ${placeById(segment.to)?.name ?? ""}`,
  }));
}

/** Road sections near a point, nearest first. */
export function nearbySegments(
  lat: number,
  lon: number,
  withinKm = 12,
): { segment: Segment; km: number }[] {
  return SEGMENTS.map((segment) => ({
    segment,
    km: pointToSegmentKm(lat, lon, segment),
  }))
    .filter((x) => x.km <= withinKm)
    .sort((a, b) => a.km - b.km);
}

export type GeoResult =
  | { ok: true; lat: number; lon: number; accuracyM: number }
  /** unsupported: the browser has no geolocation API at all. */
  | { ok: false; reason: "denied" | "unavailable" | "unsupported" };

export function getCurrentPosition(): Promise<GeoResult> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({ ok: false, reason: "unsupported" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          ok: true,
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracyM: pos.coords.accuracy,
        }),
      (err) =>
        resolve({
          ok: false,
          reason: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable",
        }),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  });
}
