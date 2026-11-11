// SYNTHETIC DEMO DATA — every record here is invented for the prototype.
// No real reports, people or official notices. Timestamps are derived from a
// demo clock so ages stay realistic whenever the prototype is opened.
//
// This is the single module to replace when real persistence arrives (see PLAN.md).

import type {
  CommunityReport,
  Corridor,
  OfficialRestriction,
  Place,
  Segment,
} from '@/lib/types'

/** Fixed demo clock so seeded ages are stable across runs and tests. */
export const DEMO_NOW = Date.parse('2026-10-15T04:30:00.000Z')
const hoursAgo = (h: number) => DEMO_NOW - Math.round(h * 3600_000)

export const COVERAGE_BOUNDS = {
  minLon: 77.5,
  maxLon: 81.1,
  minLat: 28.7,
  maxLat: 31.5,
}

export const PLACES: Place[] = [
  { id: 'dehradun', name: 'Dehradun', nameHi: 'देहरादून', district: 'Dehradun', lat: 30.3165, lon: 78.0322 },
  { id: 'mussoorie', name: 'Mussoorie', nameHi: 'मसूरी', district: 'Dehradun', lat: 30.4598, lon: 78.0644 },
  { id: 'doiwala', name: 'Doiwala', nameHi: 'डोईवाला', district: 'Dehradun', lat: 30.1766, lon: 78.1153 },
  { id: 'rishikesh', name: 'Rishikesh', nameHi: 'ऋषिकेश', district: 'Dehradun', lat: 30.0869, lon: 78.2676 },
  { id: 'haridwar', name: 'Haridwar', nameHi: 'हरिद्वार', district: 'Haridwar', lat: 29.9457, lon: 78.1642 },
  { id: 'devprayag', name: 'Devprayag', nameHi: 'देवप्रयाग', district: 'Tehri Garhwal', lat: 30.146, lon: 78.598 },
  { id: 'srinagar', name: 'Srinagar (Garhwal)', nameHi: 'श्रीनगर (गढ़वाल)', district: 'Pauri Garhwal', lat: 30.2235, lon: 78.7836 },
  { id: 'rudraprayag', name: 'Rudraprayag', nameHi: 'रुद्रप्रयाग', district: 'Rudraprayag', lat: 30.2844, lon: 78.9811 },
  { id: 'karnaprayag', name: 'Karnaprayag', nameHi: 'कर्णप्रयाग', district: 'Chamoli', lat: 30.2627, lon: 79.2213 },
  { id: 'chamoli', name: 'Chamoli', nameHi: 'चमोली', district: 'Chamoli', lat: 30.4022, lon: 79.326 },
  { id: 'joshimath', name: 'Joshimath', nameHi: 'जोशीमठ', district: 'Chamoli', lat: 30.555, lon: 79.5643 },
  { id: 'badrinath', name: 'Badrinath', nameHi: 'बद्रीनाथ', district: 'Chamoli', lat: 30.7433, lon: 79.4938 },
  { id: 'agastyamuni', name: 'Agastyamuni', nameHi: 'अगस्त्यमुनि', district: 'Rudraprayag', lat: 30.392, lon: 79.026 },
  { id: 'guptkashi', name: 'Guptkashi', nameHi: 'गुप्तकाशी', district: 'Rudraprayag', lat: 30.526, lon: 79.079 },
  { id: 'sonprayag', name: 'Sonprayag', nameHi: 'सोनप्रयाग', district: 'Rudraprayag', lat: 30.634, lon: 78.998 },
  { id: 'gaurikund', name: 'Gaurikund', nameHi: 'गौरीकुंड', district: 'Rudraprayag', lat: 30.652, lon: 79.025 },
  { id: 'chamba', name: 'Chamba', nameHi: 'चंबा', district: 'Tehri Garhwal', lat: 30.348, lon: 78.393 },
  { id: 'uttarkashi', name: 'Uttarkashi', nameHi: 'उत्तरकाशी', district: 'Uttarkashi', lat: 30.7268, lon: 78.4354 },
  { id: 'harsil', name: 'Harsil', nameHi: 'हर्षिल', district: 'Uttarkashi', lat: 31.038, lon: 78.742 },
  { id: 'gangotri', name: 'Gangotri', nameHi: 'गंगोत्री', district: 'Uttarkashi', lat: 30.9947, lon: 78.9398 },
  { id: 'rudrapur', name: 'Rudrapur', nameHi: 'रुद्रपुर', district: 'Udham Singh Nagar', lat: 28.9845, lon: 79.4006 },
  { id: 'haldwani', name: 'Haldwani', nameHi: 'हल्द्वानी', district: 'Nainital', lat: 29.2183, lon: 79.513 },
  { id: 'kathgodam', name: 'Kathgodam', nameHi: 'काठगोदाम', district: 'Nainital', lat: 29.269, lon: 79.539 },
  { id: 'bhowali', name: 'Bhowali', nameHi: 'भवाली', district: 'Nainital', lat: 29.387, lon: 79.513 },
  { id: 'nainital', name: 'Nainital', nameHi: 'नैनीताल', district: 'Nainital', lat: 29.3803, lon: 79.4636 },
  { id: 'khairna', name: 'Khairna', nameHi: 'खैरना', district: 'Nainital', lat: 29.472, lon: 79.556 },
  { id: 'almora', name: 'Almora', nameHi: 'अल्मोड़ा', district: 'Almora', lat: 29.5971, lon: 79.6591 },
  { id: 'takula', name: 'Takula', nameHi: 'ताकुला', district: 'Almora', lat: 29.675, lon: 79.74 },
  { id: 'bageshwar', name: 'Bageshwar', nameHi: 'बागेश्वर', district: 'Bageshwar', lat: 29.838, lon: 79.771 },
  { id: 'seraghat', name: 'Seraghat', nameHi: 'सेराघाट', district: 'Almora', lat: 29.605, lon: 79.92 },
  { id: 'gangolihat', name: 'Gangolihat', nameHi: 'गंगोलीहाट', district: 'Pithoragarh', lat: 29.656, lon: 80.043 },
  { id: 'pithoragarh', name: 'Pithoragarh', nameHi: 'पिथौरागढ़', district: 'Pithoragarh', lat: 29.5829, lon: 80.2182 },
  { id: 'tanakpur', name: 'Tanakpur', nameHi: 'टनकपुर', district: 'Champawat', lat: 29.074, lon: 80.111 },
  { id: 'champawat', name: 'Champawat', nameHi: 'चंपावत', district: 'Champawat', lat: 29.336, lon: 80.091 },
  { id: 'lohaghat', name: 'Lohaghat', nameHi: 'लोहाघाट', district: 'Champawat', lat: 29.404, lon: 80.087 },
  { id: 'kotdwar', name: 'Kotdwar', nameHi: 'कोटद्वार', district: 'Pauri Garhwal', lat: 29.747, lon: 78.523 },
  { id: 'satpuli', name: 'Satpuli', nameHi: 'सतपुली', district: 'Pauri Garhwal', lat: 29.92, lon: 78.71 },
  { id: 'pauri', name: 'Pauri', nameHi: 'पौड़ी', district: 'Pauri Garhwal', lat: 30.147, lon: 78.78 },
]

export const QUICK_PICKS = [
  'dehradun',
  'haridwar',
  'rishikesh',
  'mussoorie',
  'nainital',
  'haldwani',
  'joshimath',
  'badrinath',
  'uttarkashi',
  'pithoragarh',
  'almora',
  'gaurikund',
]

/** The 14 predefined corridors (seeded, simplified geometry). */
export const CORRIDORS: Corridor[] = [
  {
    id: 'nh7', code: 'NH-7', name: 'Rishikesh – Badrinath',
    stops: ['rishikesh', 'devprayag', 'srinagar', 'rudraprayag', 'karnaprayag', 'chamoli', 'joshimath', 'badrinath'],
    legs: [[74, 150], [35, 60], [33, 60], [31, 55], [39, 70], [47, 90], [44, 90]],
  },
  {
    id: 'nh107', code: 'NH-107', name: 'Rudraprayag – Gaurikund',
    stops: ['rudraprayag', 'agastyamuni', 'guptkashi', 'sonprayag', 'gaurikund'],
    legs: [[18, 35], [26, 50], [31, 60], [5, 15]],
  },
  {
    id: 'nh34', code: 'NH-34', name: 'Rishikesh – Gangotri',
    stops: ['rishikesh', 'chamba', 'uttarkashi', 'harsil', 'gangotri'],
    legs: [[60, 120], [88, 180], [73, 150], [25, 45]],
  },
  { id: 'msr', code: 'SH-MSR', name: 'Dehradun – Mussoorie', stops: ['dehradun', 'mussoorie'], legs: [[34, 75]] },
  {
    id: 'ddn', code: 'NH-7D', name: 'Dehradun – Rishikesh',
    stops: ['dehradun', 'doiwala', 'rishikesh'], legs: [[20, 35], [25, 40]],
  },
  { id: 'hrd', code: 'NH-7H', name: 'Haridwar – Rishikesh', stops: ['haridwar', 'rishikesh'], legs: [[24, 45]] },
  {
    id: 'ntl', code: 'NH-109', name: 'Haldwani – Nainital',
    stops: ['haldwani', 'kathgodam', 'bhowali', 'nainital'], legs: [[7, 15], [30, 60], [11, 25]],
  },
  {
    id: 'alm', code: 'NH-109A', name: 'Bhowali – Almora',
    stops: ['bhowali', 'khairna', 'almora'], legs: [[22, 40], [42, 80]],
  },
  {
    id: 'bgs', code: 'SH-BGS', name: 'Almora – Bageshwar',
    stops: ['almora', 'takula', 'bageshwar'], legs: [[30, 60], [42, 80]],
  },
  {
    id: 'pth', code: 'SH-PTH', name: 'Almora – Pithoragarh',
    stops: ['almora', 'seraghat', 'gangolihat', 'pithoragarh'], legs: [[45, 90], [30, 60], [50, 100]],
  },
  {
    id: 'nh9', code: 'NH-9', name: 'Tanakpur – Pithoragarh',
    stops: ['tanakpur', 'champawat', 'lohaghat', 'pithoragarh'], legs: [[75, 150], [14, 25], [62, 120]],
  },
  {
    id: 'pau', code: 'NH-534', name: 'Kotdwar – Pauri',
    stops: ['kotdwar', 'satpuli', 'pauri'], legs: [[55, 100], [50, 95]],
  },
  { id: 'psn', code: 'SH-PSN', name: 'Pauri – Srinagar', stops: ['pauri', 'srinagar'], legs: [[30, 60]] },
  { id: 'rud', code: 'NH-109R', name: 'Rudrapur – Haldwani', stops: ['rudrapur', 'haldwani'], legs: [[40, 60]] },
]

/** Shown wherever segment lines are drawn on a map. */
export const SEGMENT_GEOMETRY_NOTE = 'Road lines: approximate, synthetic data'

/**
 * APPROXIMATE, SYNTHETIC DATA. A gently curving line between two places,
 * offset sideways by a small deterministic amount so lines look like roads.
 * It is not a surveyed alignment and must never be used for navigation.
 */
function syntheticPath(fromId: string, toId: string, seed: number): [number, number][] {
  const a = PLACES.find((p) => p.id === fromId)
  const b = PLACES.find((p) => p.id === toId)
  if (!a || !b) throw new Error(`Missing place for segment ${fromId} → ${toId}`)
  const dLat = b.lat - a.lat
  const dLon = b.lon - a.lon
  const length = Math.hypot(dLat, dLon) || 1
  // Unit vector perpendicular to the straight line.
  const nLat = -dLon / length
  const nLon = dLat / length
  const steps = 6
  const round = (n: number) => Math.round(n * 10_000) / 10_000
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps
    const bend = Math.sin(Math.PI * t) * length * 0.08 * (seed % 2 ? 1 : -1)
    const wiggle = Math.sin(t * Math.PI * 3 + seed) * length * 0.02 * Math.sin(Math.PI * t)
    return [round(a.lat + dLat * t + nLat * (bend + wiggle)), round(a.lon + dLon * t + nLon * (bend + wiggle))]
  })
}

export const SEGMENTS: Segment[] = CORRIDORS.flatMap((c, corridorIndex) => {
  let km = 0
  return c.legs.map(([distanceKm, typicalMinutes], i) => {
    const seg: Segment = {
      id: `${c.id}-${String(i + 1).padStart(2, '0')}`,
      corridorId: c.id,
      code: `${c.code} · ${String(i + 1).padStart(2, '0')}`,
      from: c.stops[i],
      to: c.stops[i + 1],
      kmStart: km,
      kmEnd: km + distanceKm,
      distanceKm,
      typicalMinutes,
      path: syntheticPath(c.stops[i], c.stops[i + 1], corridorIndex * 7 + i),
    }
    km += distanceKm
    return seg
  })
})

type ReportSeed = Omit<CommunityReport, 'observedAt' | 'receivedAt' | 'synthetic' | 'photoCount' | 'source' | 'locationConfidence'> &
  Partial<Pick<CommunityReport, 'photoCount' | 'source' | 'locationConfidence'>> & { obsH: number; recvH?: number }

const seed = (r: ReportSeed): CommunityReport => {
  const { obsH, recvH, ...rest } = r
  return {
    photoCount: 1,
    source: 'traveller',
    locationConfidence: 'high',
    ...rest,
    observedAt: hoursAgo(obsH),
    receivedAt: hoursAgo(recvH ?? Math.max(obsH - 0.25, 0.05)),
    synthetic: true,
  }
}

export const REPORTS: CommunityReport[] = [
  // NH-7 Chamoli – Joshimath: officially closed; community reports corroborate
  seed({ ref: 'RP-418203', segmentId: 'nh7-06', kind: 'hazard', hazardType: 'landslide', severity: 'high', description: 'Debris across both lanes after overnight rain. Vehicles turning back near the slide.', landmark: 'Near Pipalkoti bend', obsH: 9, status: 'verified', photoCount: 3 }),
  seed({ ref: 'RP-418377', segmentId: 'nh7-06', kind: 'hazard', hazardType: 'landslide', severity: 'high', description: 'Slide still active, small stones falling. Machinery present but not clearing yet.', landmark: 'Pipalkoti, 2 km ahead', obsH: 5, status: 'verified', source: 'volunteer', photoCount: 2 }),
  seed({ ref: 'RP-418519', segmentId: 'nh7-06', kind: 'clear', hazardType: 'other', severity: 'low', description: 'Light vehicles being let through one at a time.', landmark: 'Pipalkoti', obsH: 2, status: 'conflicting', conflictsWith: 'RP-418377', locationConfidence: 'medium', photoCount: 0 }),
  // NH-7 Rishikesh – Devprayag
  seed({ ref: 'RP-419002', segmentId: 'nh7-01', kind: 'hazard', hazardType: 'rockfall', severity: 'moderate', description: 'Loose rocks on the valley-side lane, one lane usable.', landmark: 'Byasi', obsH: 3, status: 'under_review' }),
  // NH-7 Srinagar – Rudraprayag
  seed({ ref: 'RP-417734', segmentId: 'nh7-03', kind: 'hazard', hazardType: 'road_damage', severity: 'low', description: 'Potholes and broken edge on a short stretch. Slow down.', landmark: 'Near Dhari Devi', obsH: 5, status: 'verified' }),
  // NH-7 Rudraprayag – Karnaprayag: recent clear observation
  seed({ ref: 'RP-419110', segmentId: 'nh7-04', kind: 'clear', hazardType: 'other', severity: 'low', description: 'Road open, normal movement.', landmark: 'Gauchar', obsH: 2, status: 'verified', source: 'volunteer', photoCount: 0 }),
  // NH-7 Joshimath – Badrinath: snow, plus a duplicate
  seed({ ref: 'RP-418842', segmentId: 'nh7-07', kind: 'hazard', hazardType: 'snow_ice', severity: 'moderate', description: 'Ice patches on shaded bends in the early morning.', landmark: 'Hanuman Chatti', obsH: 6, status: 'verified', photoCount: 2 }),
  seed({ ref: 'RP-418851', segmentId: 'nh7-07', kind: 'hazard', hazardType: 'snow_ice', severity: 'moderate', description: 'Slippery near Hanuman Chatti.', landmark: 'Hanuman Chatti', obsH: 5.8, status: 'duplicate', duplicateOf: 'RP-418842', photoCount: 0 }),
  // NH-107 Agastyamuni – Guptkashi: corroborated landslide
  seed({ ref: 'RP-419215', segmentId: 'nh107-02', kind: 'hazard', hazardType: 'landslide', severity: 'high', description: 'Slide blocking most of the road, people walking across.', landmark: 'Kund', obsH: 4, status: 'verified', photoCount: 4 }),
  seed({ ref: 'RP-419260', segmentId: 'nh107-02', kind: 'hazard', hazardType: 'landslide', severity: 'high', description: 'Same slide near Kund, a queue of vehicles on both sides.', landmark: 'Kund', obsH: 3, status: 'under_review', source: 'volunteer', photoCount: 1 }),
  // NH-107 Guptkashi – Sonprayag: time-bound restriction also applies
  seed({ ref: 'RP-418990', segmentId: 'nh107-03', kind: 'hazard', hazardType: 'poor_visibility', severity: 'moderate', description: 'Dense fog after sunset, visibility under 20 m.', landmark: 'Phata', obsH: 14, status: 'verified', photoCount: 0 }),
  // NH-107 Sonprayag – Gaurikund: conflicting pair
  seed({ ref: 'RP-419301', segmentId: 'nh107-04', kind: 'hazard', hazardType: 'flooding', severity: 'high', description: 'Water flowing over the road at the culvert.', landmark: 'Sonprayag bridge approach', obsH: 2, status: 'conflicting', conflictsWith: 'RP-419322', locationConfidence: 'medium' }),
  seed({ ref: 'RP-419322', segmentId: 'nh107-04', kind: 'clear', hazardType: 'other', severity: 'low', description: 'Crossed the culvert without trouble, water receding.', landmark: 'Sonprayag', obsH: 1.5, status: 'conflicting', conflictsWith: 'RP-419301', photoCount: 0 }),
  // NH-34 Chamba – Uttarkashi: old report only (stale)
  seed({ ref: 'RP-416011', segmentId: 'nh34-02', kind: 'hazard', hazardType: 'fallen_tree', severity: 'low', description: 'Tree branch on one lane.', landmark: 'Kandisaur', obsH: 31, status: 'verified', photoCount: 1 }),
  // NH-34 Harsil – Gangotri
  seed({ ref: 'RP-419340', segmentId: 'nh34-04', kind: 'hazard', hazardType: 'poor_visibility', severity: 'moderate', description: 'Low cloud on the climb, headlights needed.', landmark: 'Lanka bridge', obsH: 1, status: 'under_review', photoCount: 0 }),
  // Dehradun – Mussoorie
  seed({ ref: 'RP-419355', segmentId: 'msr-01', kind: 'clear', hazardType: 'other', severity: 'low', description: 'Normal traffic, road dry.', landmark: 'Kolhukhet', obsH: 2, status: 'verified', photoCount: 0 }),
  seed({ ref: 'RP-419101', segmentId: 'msr-01', kind: 'hazard', hazardType: 'accident', severity: 'low', description: 'Minor collision, cleared.', landmark: 'Kimadi turn', obsH: 6, status: 'rejected', photoCount: 0, locationConfidence: 'low' }),
  // Dehradun – Rishikesh
  seed({ ref: 'RP-419372', segmentId: 'ddn-01', kind: 'clear', hazardType: 'other', severity: 'low', description: 'Smooth movement.', landmark: 'Harrawala', obsH: 1, status: 'verified', photoCount: 0 }),
  seed({ ref: 'RP-419380', segmentId: 'ddn-02', kind: 'clear', hazardType: 'other', severity: 'low', description: 'No issues through the forest stretch.', landmark: 'Bhaniyawala', obsH: 1.2, status: 'verified', source: 'volunteer', photoCount: 0 }),
  // Haridwar – Rishikesh
  seed({ ref: 'RP-419390', segmentId: 'hrd-01', kind: 'hazard', hazardType: 'road_block', severity: 'moderate', description: 'Diversion in place for road works, single-lane traffic.', landmark: 'Raiwala', obsH: 1, status: 'under_review' }),
  // Haldwani – Nainital
  seed({ ref: 'RP-419150', segmentId: 'ntl-02', kind: 'hazard', hazardType: 'rockfall', severity: 'high', description: 'Large rock on the hill-side lane.', landmark: 'Jeolikot', obsH: 4, status: 'under_review', photoCount: 1 }),
  seed({ ref: 'RP-419211', segmentId: 'ntl-03', kind: 'clear', hazardType: 'other', severity: 'low', description: 'Open, light traffic.', landmark: 'Bhowali chowk', obsH: 3, status: 'verified', photoCount: 0 }),
  // Bhowali – Almora: corroborated, plus a possible duplicate
  seed({ ref: 'RP-418770', segmentId: 'alm-02', kind: 'hazard', hazardType: 'landslide', severity: 'high', description: 'Partial slide, road narrowed to one lane, loose soil above.', landmark: 'Kainchi Dham, 4 km ahead', obsH: 7, status: 'verified', photoCount: 2 }),
  seed({ ref: 'RP-418802', segmentId: 'alm-02', kind: 'hazard', hazardType: 'landslide', severity: 'high', description: 'Mud and stones across the road, slow one-way movement.', landmark: 'Near Garampani', obsH: 6, status: 'verified', source: 'volunteer', photoCount: 1 }),
  seed({ ref: 'RP-418815', segmentId: 'alm-02', kind: 'hazard', hazardType: 'landslide', severity: 'moderate', description: 'Slide near Garampani.', landmark: 'Garampani', obsH: 5.5, status: 'duplicate', duplicateOf: 'RP-418802', locationConfidence: 'medium', photoCount: 0 }),
  // Almora – Bageshwar
  seed({ ref: 'RP-418655', segmentId: 'bgs-02', kind: 'hazard', hazardType: 'damaged_bridge', severity: 'moderate', description: 'Railing broken on the small bridge, surface looks cracked.', landmark: 'Near Takula market', obsH: 6, status: 'needs_info', locationConfidence: 'low' }),
  // NH-9 Tanakpur – Champawat
  seed({ ref: 'RP-418501', segmentId: 'nh9-01', kind: 'hazard', hazardType: 'flooding', severity: 'moderate', description: 'Stream crossing the road after rain, passable slowly.', landmark: 'Chalthi', obsH: 8, status: 'verified' }),
  seed({ ref: 'RP-419330', segmentId: 'nh9-03', kind: 'hazard', hazardType: 'road_damage', severity: 'moderate', description: 'Test submission.', landmark: 'Lohaghat', obsH: 2, status: 'rejected', photoCount: 0, locationConfidence: 'low' }),
  // Kotdwar – Pauri: only an old clear observation (stale)
  seed({ ref: 'RP-415440', segmentId: 'pau-01', kind: 'clear', hazardType: 'other', severity: 'low', description: 'Road open.', landmark: 'Dugadda', obsH: 40, status: 'verified', photoCount: 0 }),
  // Pauri – Srinagar
  seed({ ref: 'RP-419190', segmentId: 'psn-01', kind: 'hazard', hazardType: 'fallen_tree', severity: 'moderate', description: 'Pine tree across half the road, being cut.', landmark: 'Near Khirsu turn', obsH: 2, status: 'verified', photoCount: 1 }),
  // Rudrapur – Haldwani
  seed({ ref: 'RP-419395', segmentId: 'rud-01', kind: 'clear', hazardType: 'other', severity: 'low', description: 'Normal traffic.', landmark: 'Lalkuan', obsH: 1, status: 'verified', photoCount: 0 }),
]

export const RESTRICTIONS: OfficialRestriction[] = [
  {
    id: 'OR-2041',
    segmentId: 'nh7-06',
    type: 'road_closed',
    title: 'Road closed for debris clearance',
    issuingAuthority: 'District Disaster Management Authority, Chamoli (synthetic)',
    jurisdiction: 'Chamoli',
    supportingReference: 'DEMO/CHM/0412',
    publishedAt: hoursAgo(10),
    effectiveFrom: hoursAgo(10),
    // Review time has passed — the closure stays in force until an authorised update.
    reviewBy: hoursAgo(2),
    status: 'active',
    clearance: 'pending',
    synthetic: true,
  },
  {
    id: 'OR-2044',
    segmentId: 'nh107-03',
    type: 'time_bound',
    title: 'No vehicle movement 20:00 – 06:00',
    issuingAuthority: 'District Administration, Rudraprayag (synthetic)',
    jurisdiction: 'Rudraprayag',
    supportingReference: 'DEMO/RDP/0098',
    publishedAt: hoursAgo(48),
    effectiveFrom: hoursAgo(46),
    reviewBy: DEMO_NOW + 5 * 24 * 3600_000,
    status: 'active',
    clearance: 'not_requested',
    synthetic: true,
  },
  {
    id: 'OR-2047',
    segmentId: 'nh34-03',
    type: 'vehicle_restricted',
    title: 'Heavy vehicles above 12 t not permitted',
    issuingAuthority: 'Public Works Department, Uttarkashi (synthetic)',
    jurisdiction: 'Uttarkashi',
    supportingReference: 'DEMO/UKI/0233',
    publishedAt: hoursAgo(72),
    effectiveFrom: hoursAgo(70),
    reviewBy: DEMO_NOW + 2 * 24 * 3600_000,
    status: 'active',
    clearance: 'not_requested',
    synthetic: true,
  },
]

export const placeById = (id: string) => PLACES.find((p) => p.id === id)
export const segmentById = (id: string) => SEGMENTS.find((s) => s.id === id)
export const corridorById = (id: string) => CORRIDORS.find((c) => c.id === id)
