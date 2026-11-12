// Advisory rules — pure functions, no I/O, no AI input.
//
// Precedence (highest first):
//   1. Active official restriction (expiry alone never lifts it)
//   2. Adequately corroborated community reports  → at most AVOID
//   3. Reports needing caution / review           → CAUTION
//   4. Community clear observations               → UNKNOWN
//   5. Otherwise UNKNOWN ("No recent observation"), flagged STALE if only old evidence exists
//
// A community report can never produce DO NOT TRAVEL or an official closure.

import type { CommunityReport, OfficialRestriction, Segment } from '@/lib/types'

export type AdvisoryLevel = 'clear' | 'caution' | 'avoid' | 'do_not_travel' | 'unknown'

export type AdvisoryBasis =
  | 'official'
  | 'corroborated'
  | 'single_report'
  | 'conflicting'
  | 'community_clear'
  | 'stale_only'
  | 'no_evidence'

export interface SegmentAdvisory {
  segmentId: string
  level: AdvisoryLevel
  basis: AdvisoryBasis
  restriction?: OfficialRestriction
  /** Restriction review time has passed but no authorised update yet */
  restrictionPastReview: boolean
  awaitingClearance: boolean
  stale: boolean
  latestObservationAt?: number
  /** Reports that inform this advisory, newest first */
  evidence: CommunityReport[]
  reviewedCount: number
}

export function getObservationTimestamp(
  advisory: Pick<SegmentAdvisory, 'latestObservationAt'>,
): number | undefined {
  return advisory.latestObservationAt
}

export function getAdvisorySourceTimestamp(
  advisory: Pick<SegmentAdvisory, 'latestObservationAt' | 'restriction'>,
): number | undefined {
  const timestamps = [
    advisory.latestObservationAt,
    advisory.restriction?.publishedAt,
  ].filter((timestamp): timestamp is number => timestamp !== undefined)
  return timestamps.length ? Math.max(...timestamps) : undefined
}

export const HAZARD_FRESH_MS = 24 * 3600_000
export const CLEAR_FRESH_MS = 12 * 3600_000

export type FreshnessState = 'fresh' | 'stale' | 'unknown'

export function getFreshnessState(
  sourceTimestamp: number | undefined,
  now: number,
): FreshnessState {
  if (
    sourceTimestamp === undefined ||
    !Number.isFinite(sourceTimestamp) ||
    !Number.isFinite(now) ||
    sourceTimestamp <= 0 ||
    sourceTimestamp > now
  ) {
    return 'unknown'
  }
  return now - sourceTimestamp <= HAZARD_FRESH_MS ? 'fresh' : 'stale'
}

export const LEVEL_RANK: Record<AdvisoryLevel, number> = {
  clear: 0,
  unknown: 1,
  caution: 2,
  avoid: 3,
  do_not_travel: 4,
}

const RESTRICTION_LEVEL: Record<OfficialRestriction['type'], AdvisoryLevel> = {
  road_closed: 'do_not_travel',
  partially_restricted: 'avoid',
  vehicle_restricted: 'caution',
  time_bound: 'caution',
}

const IGNORED: CommunityReport['status'][] = ['rejected', 'duplicate']

export function isRestrictionInForce(r: OfficialRestriction): boolean {
  // Only an authorised update can lift a restriction; time passing cannot.
  return r.status !== 'lifted'
}

export function computeSegmentAdvisory(
  segmentId: string,
  reports: CommunityReport[],
  restrictions: OfficialRestriction[],
  now: number,
): SegmentAdvisory {
  const segReports = reports
    .filter((r) => r.segmentId === segmentId && !IGNORED.includes(r.status))
    .sort((a, b) => b.observedAt - a.observedAt)
  const latestObservationAt = segReports[0]?.observedAt
  const reviewedCount = segReports.filter((r) => r.status === 'verified').length

  const freshHazards = segReports.filter(
    (r) => r.kind === 'hazard' && now - r.observedAt <= HAZARD_FRESH_MS,
  )
  const freshClears = segReports.filter(
    (r) => r.kind === 'clear' && now - r.observedAt <= CLEAR_FRESH_MS,
  )
  const evidence = [...freshHazards, ...freshClears].sort(
    (a, b) => b.observedAt - a.observedAt,
  )

  const base = {
    segmentId,
    latestObservationAt,
    reviewedCount,
    restrictionPastReview: false,
    awaitingClearance: false,
    stale: false,
  }

  // 1. Official restriction
  const restriction = restrictions
    .filter((r) => r.segmentId === segmentId && isRestrictionInForce(r))
    .sort((a, b) => LEVEL_RANK[RESTRICTION_LEVEL[b.type]] - LEVEL_RANK[RESTRICTION_LEVEL[a.type]])[0]
  if (restriction) {
    return {
      ...base,
      level: RESTRICTION_LEVEL[restriction.type],
      basis: 'official',
      restriction,
      restrictionPastReview: now > restriction.reviewBy,
      awaitingClearance: restriction.clearance === 'pending',
      evidence: evidence.length ? evidence : segReports.slice(0, 3),
    }
  }

  // 2–3. Community hazards
  if (freshHazards.length) {
    const conflicting =
      freshClears.length > 0 || freshHazards.some((r) => r.status === 'conflicting')
    if (conflicting) {
      return { ...base, level: 'caution', basis: 'conflicting', evidence }
    }
    const high = freshHazards.filter((r) => r.severity === 'high')
    const corroborated = high.length >= 2 && high.some((r) => r.status === 'verified')
    return {
      ...base,
      level: corroborated ? 'avoid' : 'caution',
      basis: corroborated ? 'corroborated' : 'single_report',
      evidence,
    }
  }

  // A community clear report is still only a community observation. It must
  // not be presented as an independently verified or cleared road condition.
  if (freshClears.length) {
    return { ...base, level: 'unknown', basis: 'community_clear', evidence }
  }

  // 5. Unknown — never positive
  if (segReports.length) {
    return { ...base, level: 'unknown', basis: 'stale_only', stale: true, evidence: segReports.slice(0, 3) }
  }
  return { ...base, level: 'unknown', basis: 'no_evidence', evidence: [] }
}

export interface RouteAdvisorySummary {
  level: AdvisoryLevel
  /** Share of distance with current evidence (0–1) */
  coverage: number
  unknownKm: number
  hazardCount: number
  restrictionCount: number
  latestObservationAt?: number
  poorCoverage: boolean
  awaitingClearance: boolean
}

export function summariseRoute(
  segments: Segment[],
  advisories: SegmentAdvisory[],
): RouteAdvisorySummary {
  const byId = new Map(advisories.map((a) => [a.segmentId, a]))
  let total = 0
  let unknownKm = 0
  let level: AdvisoryLevel = 'clear'
  let hazardCount = 0
  let restrictionCount = 0
  let latest: number | undefined
  let awaitingClearance = false
  for (const s of segments) {
    const a = byId.get(s.id)
    total += s.distanceKm
    if (!a || a.level === 'unknown') unknownKm += s.distanceKm
    const l = a?.level ?? 'unknown'
    if (LEVEL_RANK[l] > LEVEL_RANK[level]) level = l
    if (!a) continue
    hazardCount += a.evidence.filter((r) => r.kind === 'hazard').length
    if (a.restriction) restrictionCount++
    if (a.awaitingClearance) awaitingClearance = true
    if (a.latestObservationAt && (!latest || a.latestObservationAt > latest)) {
      latest = a.latestObservationAt
    }
  }
  const coverage = total ? (total - unknownKm) / total : 0
  return {
    level,
    coverage,
    unknownKm,
    hazardCount,
    restrictionCount,
    latestObservationAt: latest,
    poorCoverage: coverage < 0.5,
    awaitingClearance,
  }
}
