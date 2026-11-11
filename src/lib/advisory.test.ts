import { describe, expect, it } from 'vitest'
import {
  computeSegmentAdvisory,
  getAdvisorySourceTimestamp,
  getFreshnessState,
  HAZARD_FRESH_MS,
  summariseRoute,
} from '@/lib/advisory'
import type { CommunityReport, OfficialRestriction, Segment } from '@/lib/types'

const NOW = Date.UTC(2026, 9, 25, 12)
const H = 3600_000

describe('getFreshnessState', () => {
  it('classifies timestamps relative to the injected clock', () => {
    expect(getFreshnessState(NOW, NOW)).toBe('fresh')
    expect(getFreshnessState(NOW - HAZARD_FRESH_MS, NOW)).toBe('fresh')
    expect(getFreshnessState(NOW - HAZARD_FRESH_MS - 1, NOW)).toBe('stale')
  })

  describe('getAdvisorySourceTimestamp', () => {
    it('uses the newest report or official publication timestamp', () => {
      expect(
        getAdvisorySourceTimestamp({
          latestObservationAt: NOW - 2 * H,
          restriction: closure({ publishedAt: NOW - H }),
        }),
      ).toBe(NOW - H)
    })
  })

  it('returns unknown for missing, invalid, or future timestamps', () => {
    expect(getFreshnessState(undefined, NOW)).toBe('unknown')
    expect(getFreshnessState(Number.NaN, NOW)).toBe('unknown')
    expect(getFreshnessState(NOW + 1, NOW)).toBe('unknown')
  })
})

const report = (over: Partial<CommunityReport> = {}): CommunityReport => ({
  ref: 'RP-000001',
  segmentId: 's1',
  kind: 'hazard',
  hazardType: 'landslide',
  severity: 'high',
  description: '',
  landmark: '',
  observedAt: NOW - 2 * H,
  receivedAt: NOW - 2 * H,
  status: 'under_review',
  source: 'traveller',
  locationConfidence: 'high',
  photoCount: 0,
  synthetic: true,
  ...over,
})

const closure = (over: Partial<OfficialRestriction> = {}): OfficialRestriction => ({
  id: 'OR-1',
  segmentId: 's1',
  type: 'road_closed',
  title: '',
  issuingAuthority: '',
  jurisdiction: 'Chamoli',
  supportingReference: '',
  publishedAt: NOW - 10 * H,
  effectiveFrom: NOW - 10 * H,
  reviewBy: NOW + 10 * H,
  status: 'active',
  clearance: 'not_requested',
  synthetic: true,
  ...over,
})

describe('computeSegmentAdvisory', () => {
  it('returns unknown, never clear, with no evidence', () => {
    const a = computeSegmentAdvisory('s1', [], [], NOW)
    expect(a.level).toBe('unknown')
    expect(a.basis).toBe('no_evidence')
  })

  it('a single high community report gives caution, not closure', () => {
    const a = computeSegmentAdvisory('s1', [report()], [], NOW)
    expect(a.level).toBe('caution')
    expect(a.basis).toBe('single_report')
  })

  it('corroborated high reports with one verified give avoid, never do-not-travel', () => {
    const a = computeSegmentAdvisory(
      's1',
      [report({ status: 'verified' }), report({ ref: 'RP-2' }), report({ ref: 'RP-3' })],
      [],
      NOW,
    )
    expect(a.level).toBe('avoid')
  })

  it('official closure overrides community clear reports', () => {
    const a = computeSegmentAdvisory(
      's1',
      [report({ kind: 'clear', status: 'verified', severity: 'low' })],
      [closure()],
      NOW,
    )
    expect(a.level).toBe('do_not_travel')
    expect(a.basis).toBe('official')
  })

  it('a restriction past its review time stays in force', () => {
    const a = computeSegmentAdvisory('s1', [], [closure({ reviewBy: NOW - H, clearance: 'pending' })], NOW)
    expect(a.level).toBe('do_not_travel')
    expect(a.restrictionPastReview).toBe(true)
    expect(a.awaitingClearance).toBe(true)
  })

  it('only an authorised lift removes the restriction', () => {
    const a = computeSegmentAdvisory('s1', [], [closure({ status: 'lifted' })], NOW)
    expect(a.level).toBe('unknown')
  })

  it('stale clear observation is unknown and flagged stale', () => {
    const a = computeSegmentAdvisory(
      's1',
      [report({ kind: 'clear', status: 'verified', observedAt: NOW - 30 * H })],
      [],
      NOW,
    )
    expect(a.level).toBe('unknown')
    expect(a.stale).toBe(true)
  })

  it('recent verified community clear observations remain unknown', () => {
    const a = computeSegmentAdvisory('s1', [report({ kind: 'clear', status: 'verified' })], [], NOW)
    expect(a.level).toBe('unknown')
    expect(a.basis).toBe('community_clear')
  })

  it('unverified clear observation alone does not give clear', () => {
    const a = computeSegmentAdvisory('s1', [report({ kind: 'clear' })], [], NOW)
    expect(a.level).toBe('unknown')
  })

  it('conflicting hazard and clear reports give caution', () => {
    const a = computeSegmentAdvisory(
      's1',
      [report(), report({ ref: 'RP-2', kind: 'clear', status: 'verified' })],
      [],
      NOW,
    )
    expect(a.level).toBe('caution')
    expect(a.basis).toBe('conflicting')
  })

  it('ignores rejected and duplicate reports', () => {
    const a = computeSegmentAdvisory(
      's1',
      [report({ status: 'rejected' }), report({ status: 'duplicate' })],
      [],
      NOW,
    )
    expect(a.level).toBe('unknown')
  })
})

describe('summariseRoute', () => {
  const seg = (id: string, km: number): Segment => ({
    id, corridorId: 'c', code: id, from: 'a', to: 'b', kmStart: 0, kmEnd: km, distanceKm: km, typicalMinutes: km, path: [],
  })

  it('a community clear observation plus an unknown segment is unknown overall', () => {
    const segs = [seg('s1', 10), seg('s2', 30)]
    const advs = [
      computeSegmentAdvisory('s1', [report({ kind: 'clear', status: 'verified' })], [], NOW),
      computeSegmentAdvisory('s2', [], [], NOW),
    ]
    const sum = summariseRoute(segs, advs)
    expect(sum.level).toBe('unknown')
    expect(sum.unknownKm).toBe(40)
    expect(sum.poorCoverage).toBe(true)
  })
})
