// Domain types shared by the UI, the advisory rules and the data layer.
// Shapes mirror the planned database tables so the synthetic fixtures can be
// swapped for real persistence without touching components.

export type District =
  | 'Almora'
  | 'Bageshwar'
  | 'Chamoli'
  | 'Champawat'
  | 'Dehradun'
  | 'Haridwar'
  | 'Nainital'
  | 'Pauri Garhwal'
  | 'Pithoragarh'
  | 'Rudraprayag'
  | 'Tehri Garhwal'
  | 'Udham Singh Nagar'
  | 'Uttarkashi'

export interface Place {
  id: string
  name: string
  nameHi: string
  district: District
  lat: number
  lon: number
}

export interface Corridor {
  id: string
  /** Short road code shown in mono, e.g. NH-7 */
  code: string
  name: string
  stops: string[]
  /** [distanceKm, typicalMinutes] for each consecutive pair of stops */
  legs: [number, number][]
}

export interface Segment {
  id: string
  corridorId: string
  code: string
  from: string
  to: string
  kmStart: number
  kmEnd: number
  distanceKm: number
  typicalMinutes: number
  /**
   * Polyline as [lat, lon] points from `from` to `to`.
   * APPROXIMATE, SYNTHETIC DATA: generated between the two places, not a surveyed road alignment.
   */
  path: [number, number][]
}

export type HazardType =
  | 'landslide'
  | 'rockfall'
  | 'flooding'
  | 'road_block'
  | 'fallen_tree'
  | 'damaged_bridge'
  | 'road_damage'
  | 'snow_ice'
  | 'poor_visibility'
  | 'accident'
  | 'other'

export type Severity = 'low' | 'moderate' | 'high'

export type ReportStatus =
  | 'under_review'
  | 'verified'
  | 'needs_info'
  | 'duplicate'
  | 'rejected'
  | 'conflicting'

export interface CommunityReport {
  ref: string
  segmentId: string
  /** 'hazard' reports a problem, 'clear' reports passable conditions */
  kind: 'hazard' | 'clear'
  hazardType: HazardType
  severity: Severity
  description: string
  landmark: string
  observedAt: number
  receivedAt: number
  status: ReportStatus
  source: 'traveller' | 'volunteer'
  locationConfidence: 'high' | 'medium' | 'low'
  photoCount: number
  duplicateOf?: string
  conflictsWith?: string
  synthetic: true
}

export type RestrictionType =
  | 'road_closed'
  | 'partially_restricted'
  | 'vehicle_restricted'
  | 'time_bound'

export interface OfficialRestriction {
  id: string
  segmentId: string
  type: RestrictionType
  title: string
  issuingAuthority: string
  jurisdiction: District
  supportingReference: string
  publishedAt: number
  effectiveFrom: number
  /** Review/expiry date. Passing it never lifts the restriction by itself. */
  reviewBy: number
  /** Only an authorised update can set 'lifted'. */
  status: 'active' | 'lifted'
  clearance: 'not_requested' | 'pending' | 'verified'
  synthetic: true
}
