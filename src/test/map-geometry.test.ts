import { describe, expect, it } from 'vitest'
import { COVERAGE_BOUNDS, DEMO_NOW, PLACES, SEGMENTS } from '@/data/fixtures'
import { getAdvisories } from '@/lib/data'
import type { SegmentAdvisory } from '@/lib/advisory'
import { segmentMapStyle } from '@/features/map/map-style'

const advisories = getAdvisories()
const place = (id: string) => PLACES.find((p) => p.id === id)!

describe('approximate synthetic segment geometry', () => {
  it('every segment has a polyline from its start place to its end place, inside the coverage area', () => {
    for (const segment of SEGMENTS) {
      expect(segment.path.length, segment.id).toBeGreaterThanOrEqual(2)
      const [first, last] = [segment.path[0], segment.path.at(-1)!]
      expect(first[0]).toBeCloseTo(place(segment.from).lat, 3)
      expect(first[1]).toBeCloseTo(place(segment.from).lon, 3)
      expect(last[0]).toBeCloseTo(place(segment.to).lat, 3)
      expect(last[1]).toBeCloseTo(place(segment.to).lon, 3)
      for (const [lat, lon] of segment.path) {
        expect(lat).toBeGreaterThanOrEqual(COVERAGE_BOUNDS.minLat)
        expect(lat).toBeLessThanOrEqual(COVERAGE_BOUNDS.maxLat)
        expect(lon).toBeGreaterThanOrEqual(COVERAGE_BOUNDS.minLon)
        expect(lon).toBeLessThanOrEqual(COVERAGE_BOUNDS.maxLon)
      }
    }
  })

  it('bends away from the straight line so it reads as a road, not a ruler line', () => {
    const segment = SEGMENTS.find((s) => s.id === 'nh7-01')!
    const [a, b] = [segment.path[0], segment.path.at(-1)!]
    const mid = segment.path[Math.floor(segment.path.length / 2)]
    const straightMid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
    expect(Math.hypot(mid[0] - straightMid[0], mid[1] - straightMid[1])).toBeGreaterThan(0.005)
  })
})

describe('segmentMapStyle safety rules', () => {
  const style = (id: string) => segmentMapStyle(advisories.get(id), DEMO_NOW)

  it('never draws any seeded segment as clear (green)', () => {
    for (const segment of SEGMENTS) {
      expect(style(segment.id).level, segment.id).not.toBe('clear')
    }
  })

  it('draws unknown and stale evidence as unknown, dashed, with a question-mark marker', () => {
    // nh34-02 has only a 31 h old report (stale); nh7-02 has no reports.
    for (const id of ['nh34-02', 'nh7-02']) {
      expect(style(id)).toMatchObject({ level: 'unknown', dashed: true })
      expect(style(id).markers).toContain('unknown')
      expect(style(id).markers).not.toContain('hazard')
    }
  })

  it('a community clear report is unknown on the map, not green', () => {
    // msr-01 has a fresh verified clear report.
    expect(advisories.get('msr-01')?.basis).toBe('community_clear')
    expect(style('msr-01').level).toBe('unknown')
  })

  it('an official closure is always visible with a shield, even past its review time', () => {
    const closure = style('nh7-06')
    expect(closure.alwaysVisible).toBe(true)
    expect(closure.level).toBe('do_not_travel')
    expect(closure.markers[0]).toBe('restriction')
    // Other restrictions get a shield but are not closures.
    expect(style('nh34-03')).toMatchObject({ alwaysVisible: false })
    expect(style('nh34-03').markers).toContain('restriction')
  })

  it('fresh hazards get a triangle; an advisory forced to "clear" or missing is still unknown', () => {
    expect(style('nh107-02').markers).toContain('hazard')
    const forced = { ...advisories.get('msr-01')!, level: 'clear' } as SegmentAdvisory
    expect(segmentMapStyle(forced, DEMO_NOW).level).toBe('unknown')
    expect(segmentMapStyle(undefined, DEMO_NOW)).toMatchObject({ level: 'unknown', dashed: true })
  })
})
