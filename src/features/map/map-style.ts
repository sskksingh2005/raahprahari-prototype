// How a segment is drawn on the interactive map. Pure rules, no Leaflet.
//
// Safety rules enforced here:
//  - Unknown, stale or out-of-date evidence is drawn as UNKNOWN (grey, dashed),
//    never green. The map never draws a "clear" road: a community clear report
//    is not proof the road is safe.
//  - An official closure is always visible: it is drawn on every map, on top,
//    and never dimmed, even when it is outside the current search or focus.

import {
  getAdvisorySourceTimestamp,
  getFreshnessState,
  type AdvisoryLevel,
  type SegmentAdvisory,
} from '@/lib/advisory'

export type MarkerKind = 'hazard' | 'restriction' | 'unknown'

export const MARKER_LABEL: Record<MarkerKind, string> = {
  hazard: 'Reported hazard',
  restriction: 'Official restriction',
  unknown: 'Unknown information',
}

/** SVG content (24×24 viewBox) shared by map markers and the legend. */
export const MARKER_GLYPH: Record<MarkerKind, string> = {
  // Triangle
  hazard:
    '<path d="M12 3 2 20.5h20L12 3z" fill="currentColor"/><path d="M12 9.5v5" stroke="#111719" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="17.6" r="1.2" fill="#111719"/>',
  // Shield
  restriction:
    '<path d="M12 2.5 4.5 5.4v5.8c0 4.8 3.2 8.6 7.5 10.3 4.3-1.7 7.5-5.5 7.5-10.3V5.4L12 2.5z" fill="currentColor"/><path d="m8.6 12 2.4 2.4 4.6-4.8" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  // Question mark
  unknown:
    '<circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M9.3 9.4a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.3-2.7 4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="17.4" r="1.25" fill="currentColor"/>',
}

export interface SegmentMapStyle {
  /** Level used for colour. Never 'clear'. */
  level: Exclude<AdvisoryLevel, 'clear'>
  dashed: boolean
  markers: MarkerKind[]
  /** Official closure: drawn on every map, on top, never dimmed. */
  alwaysVisible: boolean
}

export function segmentMapStyle(advisory: SegmentAdvisory | undefined, now: number): SegmentMapStyle {
  if (!advisory) {
    return { level: 'unknown', dashed: true, markers: ['unknown'], alwaysVisible: false }
  }

  const restriction = advisory.restriction
  const fresh = getFreshnessState(getAdvisorySourceTimestamp(advisory), now) === 'fresh'
  let level: SegmentMapStyle['level']
  if (restriction) {
    // Official restrictions keep their level whatever the age: expiry alone never lifts them.
    level = advisory.level === 'clear' ? 'unknown' : advisory.level
  } else if (advisory.stale || !fresh || advisory.level === 'clear') {
    level = 'unknown'
  } else {
    level = advisory.level
  }

  const markers: MarkerKind[] = []
  if (restriction) markers.push('restriction')
  // Only current hazard evidence earns a triangle; old reports show as unknown.
  if (fresh && !advisory.stale && advisory.evidence.some((report) => report.kind === 'hazard')) {
    markers.push('hazard')
  }
  if (level === 'unknown' && !restriction) markers.push('unknown')
  if (!markers.length) markers.push('unknown')

  return {
    level,
    dashed: level === 'unknown',
    markers,
    alwaysVisible: restriction?.type === 'road_closed',
  }
}
