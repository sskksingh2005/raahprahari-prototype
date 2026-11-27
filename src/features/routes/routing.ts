// Route finding over the 14 seeded corridors.
//
// Integration boundary: `RoutingProvider` is the contract a future server-side
// routing function (e.g. an Edge Function calling OpenRouteService) must satisfy.
// The browser never calls a routing API directly or holds its keys.

import { SEGMENTS, placeById } from '@/data/fixtures'
import { en, hi } from '@/i18n/dictionary'
import type { Segment } from '@/lib/types'

export interface RouteOption {
  id: string
  segments: Segment[]
  distanceKm: number
  typicalMinutes: number
  /** Intermediate place ids, in travel order */
  via: string[]
  corridorIds: string[]
}

export interface RoutingProvider {
  mode: 'seeded' | 'live'
  findRoutes(fromId: string, toId: string): Promise<RouteOption[]>
}

const MAX_ROUTES = 3

type Edge = { to: string; segment: Segment }
const graph = new Map<string, Edge[]>()
for (const s of SEGMENTS) {
  graph.set(s.from, [...(graph.get(s.from) ?? []), { to: s.to, segment: s }])
  graph.set(s.to, [...(graph.get(s.to) ?? []), { to: s.from, segment: s }])
}

export function findSeededRoutes(fromId: string, toId: string): RouteOption[] {
  if (fromId === toId || !graph.has(fromId) || !graph.has(toId)) return []
  const found: { nodes: string[]; segs: Segment[] }[] = []
  const visit = (node: string, nodes: string[], segs: Segment[]) => {
    if (found.length > 50 || segs.length > 16) return
    if (node === toId) {
      found.push({ nodes, segs })
      return
    }
    for (const e of graph.get(node) ?? []) {
      if (nodes.includes(e.to)) continue
      visit(e.to, [...nodes, e.to], [...segs, e.segment])
    }
  }
  visit(fromId, [fromId], [])

  return found
    .map(({ nodes, segs }) => ({
      id: nodes.join('>'),
      segments: segs,
      distanceKm: segs.reduce((n, s) => n + s.distanceKm, 0),
      typicalMinutes: segs.reduce((n, s) => n + s.typicalMinutes, 0),
      via: nodes.slice(1, -1),
      corridorIds: [...new Set(segs.map((s) => s.corridorId))],
    }))
    .sort((a, b) => a.typicalMinutes - b.typicalMinutes)
    .slice(0, MAX_ROUTES)
}

export const seededRoutingProvider: RoutingProvider = {
  mode: 'seeded',
  findRoutes: async (fromId, toId) => findSeededRoutes(fromId, toId),
}

export function routeLabel(r: RouteOption, lang: 'en' | 'hi'): string {
  if (r.via.length === 0)
    return lang === 'hi' ? hi['results.direct'] : en['results.direct']

  const names = r.via
    .filter((_, i, arr) => arr.length <= 3 || i % Math.ceil(arr.length / 3) === 0)
    .map((id) => (lang === 'hi' ? placeById(id)?.nameHi : placeById(id)?.name))
  return names.length
    ? names.join(' · ')
    : lang === 'hi'
      ? hi['common.notAvailable']
      : en['common.notAvailable']
}
