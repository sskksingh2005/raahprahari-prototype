// Data-access layer.
//
// In React component trees, components should use useAppStore() / useAdvisoryFor()
// from @/lib/app-store directly — the store computes advisories once and
// shares them across all consumers.
//
// These module-level functions are kept for:
//   • TanStack Router loaders (run outside React)
//   • Legacy call-sites that haven't been migrated yet
//   • Tests that import this module directly
//
// They always read from the fixture data (the prototype has no server state).

import { DEMO_NOW, REPORTS, RESTRICTIONS, SEGMENTS } from '@/data/fixtures'
import { computeSegmentAdvisory, type SegmentAdvisory } from '@/lib/advisory'

let cache: Map<string, SegmentAdvisory> | null = null
let cachedAt: number | undefined

export function getAdvisories(now: number = DEMO_NOW): Map<string, SegmentAdvisory> {
  if (!cache || cachedAt !== now) {
    cache = new Map(
      SEGMENTS.map((s) => [s.id, computeSegmentAdvisory(s.id, REPORTS, RESTRICTIONS, now)]),
    )
    cachedAt = now
  }
  return cache
}

export function getAdvisoryCacheTimestamp(now: number = DEMO_NOW): number {
  getAdvisories(now)
  if (cachedAt === undefined) {
    throw new Error('Advisory cache timestamp is unavailable')
  }
  return cachedAt
}

export const advisoryFor = (segmentId: string, now: number = DEMO_NOW) =>
  getAdvisories(now).get(segmentId)

export const reportByRef = (ref: string) => REPORTS.find((r) => r.ref === ref)
