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
const MAX_CANDIDATE_PATHS = 50

type Edge = { to: string; segment: Segment }
function buildGraph(segments: readonly Segment[]) {
  const graph = new Map<string, Edge[]>()
  for (const segment of segments) {
    graph.set(segment.from, [
      ...(graph.get(segment.from) ?? []),
      { to: segment.to, segment },
    ])
    graph.set(segment.to, [
      ...(graph.get(segment.to) ?? []),
      { to: segment.from, segment },
    ])
  }
  return graph
}

const seededGraph = buildGraph(SEGMENTS)

export function findSeededRoutes(
  fromId: string,
  toId: string,
  segments: readonly Segment[] = SEGMENTS,
  maxRoutes = MAX_ROUTES,
): RouteOption[] {
  const graph = segments === SEGMENTS ? seededGraph : buildGraph(segments)
  if (fromId === toId || !graph.has(fromId) || !graph.has(toId)) return []
  const found: { nodes: string[]; segs: Segment[] }[] = []
  const visit = (node: string, nodes: string[], segs: Segment[]) => {
    if (found.length >= MAX_CANDIDATE_PATHS || segs.length > 16) return
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
    .slice(0, Math.max(0, Math.min(maxRoutes, MAX_CANDIDATE_PATHS)))
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
