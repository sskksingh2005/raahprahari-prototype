import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ArrowRight, List, Map as MapIcon, Route as RouteIcon, ShieldCheck, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ActionBadge, FreshnessChip, RoadCode } from '@/components/advisory'
import { placeById } from '@/data/fixtures'
import { RouteSearchCard } from '@/features/routes/route-search'
import { RouteCard } from '@/features/routes/route-card'
import { findSeededRoutes } from '@/features/routes/routing'
import { MapLegend, SchematicMap } from '@/features/routes/schematic-map'
import { SegmentDetail } from '@/features/routes/segment-detail'
import { usePrefs } from '@/i18n/preferences'
import { summariseRoute } from '@/lib/advisory'
import { useAppStore } from '@/lib/app-store'
import type { Segment } from '@/lib/types'
import { cn } from '@/lib/utils'

type CheckSearch = {
  from?: string
  to?: string
  view?: 'map' | 'list'
  seg?: string
}

export const Route = createFileRoute('/check')({
  validateSearch: (s: Record<string, unknown>): CheckSearch => ({
    from: typeof s.from === 'string' ? s.from : undefined,
    to: typeof s.to === 'string' ? s.to : undefined,
    view: s.view === 'list' ? 'list' : s.view === 'map' ? 'map' : undefined,
    seg: typeof s.seg === 'string' ? s.seg : undefined,
  }),
  head: () => ({ meta: [{ title: 'Check a road · RaahPrahari' }] }),
  component: CheckPage,
})

type SortKey = 'fastest' | 'shortest' | 'current'
type Filter = 'all' | 'issues' | 'official' | 'unknown'

function CheckPage() {
  const { t, place } = usePrefs()
  const { segments, advisories, savedRoads, setSavedRoads } = useAppStore()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const view = search.view ?? 'map'
  const from = search.from && placeById(search.from) ? search.from : null
  const to = search.to && placeById(search.to) ? search.to : null
  const journey = !!from && !!to && from !== to

  const [sort, setSort] = useState<SortKey>('fastest')
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const explorerRef = useRef<HTMLElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  const routes = useMemo(() => {
    if (!journey) return []
    const list = findSeededRoutes(from, to).map((r) => ({
      route: r,
      summary: summariseRoute(r.segments, r.segments.map((s) => advisories.get(s.id)!)),
    }))
    return list.sort((a, b) => {
      if (sort === 'shortest') return a.route.distanceKm - b.route.distanceKm
      if (sort === 'current') {
        return (b.summary.latestObservationAt ?? 0) - (a.summary.latestObservationAt ?? 0) || b.summary.coverage - a.summary.coverage
      }
      return a.route.typicalMinutes - b.route.typicalMinutes
    })
  }, [journey, from, to, sort, advisories])

  const selected = routes.find((r) => r.route.id === selectedRouteId) ?? routes[0]

  const filteredSegments: Segment[] = useMemo(() => {
    if (journey) return selected?.route.segments ?? []
    return segments.filter((s) => {
      const a = advisories.get(s.id)
      if (!a) return false
      if (filter === 'issues') return a.level !== 'clear' && a.level !== 'unknown'
      if (filter === 'official') return !!a.restriction
      if (filter === 'unknown') return a.level === 'unknown'
      return true
    })
  }, [journey, selected, filter, segments, advisories])

  const setView = (v: 'map' | 'list') =>
    void navigate({ search: (prev) => ({ ...prev, view: v }), replace: true, resetScroll: false })
  const selectSeg = (id?: string) => {
    void navigate({ search: (prev) => ({ ...prev, seg: id }), replace: true, resetScroll: false })
    if (id && window.matchMedia('(max-width: 1279px)').matches) {
      requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  }
  const goExplorer = (routeId: string, v: 'map' | 'list') => {
    setSelectedRouteId(routeId)
    setView(v)
    requestAnimationFrame(() => explorerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  const toggleSave = (routeId: string) => {
    if (!from || !to) return
    const exists = savedRoads.some((s) => s.id === routeId)
    setSavedRoads((prev) =>
      exists ? prev.filter((s) => s.id !== routeId) : [...prev, { id: routeId, from, to, savedAt: Date.now() }],
    )
    toast(exists ? t('results.save') : t('results.saved'))
  }

  const highlight = journey ? selected?.route.segments.map((s) => s.id) : undefined

  return (
    <div className="rp-container space-y-8 py-8 md:py-10">
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          {journey ? (
            <span className="inline-flex flex-wrap items-center gap-x-3">
              {place(from)} <ArrowRight aria-hidden className="size-7 text-brand-orange" /> {place(to)}
            </span>
          ) : (
            t('adv.title')
          )}
        </h1>
        {!journey && <p className="max-w-2xl text-muted-foreground">{t('adv.body')}</p>}
      </header>

      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <RouteSearchCard initialFrom={from} initialTo={to} layout="inline" />
      </div>

      {journey && (
        <section aria-labelledby="results-title" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="results-title" className="font-display text-2xl font-semibold">
                {t('results.title')}
              </h2>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <RouteIcon aria-hidden className="size-4" />
                {t('results.seeded')}
              </p>
            </div>
            {routes.length > 1 && (
              <div role="group" aria-label={t('results.sort')} className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-sm text-muted-foreground">{t('results.sort')}</span>
                {(['fastest', 'shortest', 'current'] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={sort === k}
                    onClick={() => setSort(k)}
                    className={cn(
                      'min-h-10 rounded-full border px-3.5 text-sm',
                      sort === k ? 'border-foreground/60 bg-raised font-medium' : 'border-border text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {t(`sort.${k}`)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {routes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <RouteIcon aria-hidden className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="font-display text-lg font-semibold">{t('results.none')}</p>
              <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{t('results.noneBody')}</p>
              <Button asChild variant="outline" className="mt-5 h-11 rounded-xl">
                <Link to="/check" search={{ view: 'list' }}>
                  {t('nav.advisories')}
                </Link>
              </Button>
            </div>
          ) : (
            <div className={cn('grid gap-4', routes.length > 1 && 'lg:grid-cols-2', routes.length > 2 && 'xl:grid-cols-3')}>
              {routes.map(({ route, summary }, i) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  summary={summary}
                  index={i}
                  selected={route.id === selected?.route.id}
                  saved={savedRoads.some((s) => s.id === route.id)}
                  onSelect={() => setSelectedRouteId(route.id)}
                  onCompare={() => goExplorer(route.id, 'map')}
                  onDetails={() => goExplorer(route.id, 'list')}
                  onToggleSave={() => toggleSave(route.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {(!journey || routes.length > 0) && (
        <section ref={explorerRef} aria-labelledby="explorer-title" className="scroll-mt-24 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="explorer-title" className="font-display text-2xl font-semibold">
              {journey ? t('results.sections') : view === 'map' ? t('nav.map') : t('nav.advisories')}
            </h2>
            <div role="group" aria-label={`${t('view.map')} / ${t('view.list')}`} className="inline-flex rounded-full border border-border p-1">
              {(['map', 'list'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                  className={cn(
                    'inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium',
                    view === v ? 'bg-raised text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {v === 'map' ? <MapIcon aria-hidden className="size-4" /> : <List aria-hidden className="size-4" />}
                  {t(`view.${v}`)}
                </button>
              ))}
            </div>
          </div>

          {!journey && view === 'list' && (
            <div role="group" aria-label={t('adv.filter')} className="flex flex-wrap gap-1.5">
              {(['all', 'issues', 'official', 'unknown'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'min-h-10 rounded-full border px-3.5 text-sm',
                    filter === f ? 'border-foreground/60 bg-raised font-medium' : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {t(`adv.filter${f[0].toUpperCase()}${f.slice(1)}` as 'adv.filterAll')}
                </button>
              ))}
            </div>
          )}

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
            <div className="min-w-0 space-y-4">
              {view === 'map' ? (
                <>
                  <SchematicMap
                    highlight={highlight}
                    endpoints={journey ? [from, to] : undefined}
                    selectedSegmentId={search.seg}
                    onSelectSegment={selectSeg}
                  />
                  <MapLegend />
                </>
              ) : (
                <SegmentList segments={filteredSegments} grouped={!journey} selectedId={search.seg} onSelect={selectSeg} />
              )}
            </div>
            <div ref={detailRef} className="scroll-mt-24 xl:sticky xl:top-24 xl:self-start">
              <SegmentDetail segmentId={search.seg} onClose={search.seg ? () => selectSeg(undefined) : undefined} />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function SegmentRow({ segment, selected, onSelect }: { segment: Segment; selected: boolean; onSelect: () => void }) {
  const { t, place } = usePrefs()
  const { advisories } = useAppStore()
  const a = advisories.get(segment.id)
  if (!a) throw new Error(`Missing advisory for segment "${segment.id}"`)
  const hazards = a.evidence.filter((r) => r.kind === 'hazard').length
  const sources = [
    ...(a.evidence.length > 0 ? [t('source.community')] : []),
    ...(a.restriction ? [t('source.official')] : []),
  ]
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          'grid w-full gap-2 rounded-xl border p-4 text-left transition-colors sm:grid-cols-[1fr_auto] sm:items-center',
          selected ? 'border-foreground/60 bg-raised' : 'border-border bg-card hover:bg-accent',
        )}
      >
        <div className="min-w-0">
          <RoadCode>
            {segment.code} · km {segment.kmStart}–{segment.kmEnd} · {segment.distanceKm} {t('common.km')}
          </RoadCode>
          <p className="mt-0.5 font-semibold">
            {place(segment.from)} – {place(segment.to)}
          </p>
          {(hazards > 0 || a.restriction) && <p className="mt-1 text-xs text-muted-foreground">
            {hazards > 0 && (
              <span className="ml-2 inline-flex items-center gap-1">
                <TriangleAlert aria-hidden className="size-3" /> {hazards} {t('map.hazard')}
              </span>
            )}
            {a.restriction && (
              <span className="ml-2 inline-flex items-center gap-1">
                <ShieldCheck aria-hidden className="size-3 text-status-official" /> {t(`restriction.${a.restriction.type}`)}
              </span>
            )}
          </p>}
          <p className="mt-1 text-xs text-muted-foreground">
            {sources.length ? sources.join(' · ') : t('source.unknown')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
          <ActionBadge level={a.level} />
          <FreshnessChip observationTimestamp={a.latestObservationAt} />
        </div>
      </button>
    </li>
  )
}

function SegmentList({
  segments,
  grouped,
  selectedId,
  onSelect,
}: {
  segments: Segment[]
  grouped: boolean
  selectedId?: string
  onSelect: (id: string) => void
}) {
  const { t } = usePrefs()
  const { corridors } = useAppStore()
  if (segments.length === 0) {
    return <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">{t('adv.empty')}</p>
  }
  if (!grouped) {
    return (
      <ol className="space-y-2">
        {segments.map((s) => (
          <SegmentRow key={s.id} segment={s} selected={s.id === selectedId} onSelect={() => onSelect(s.id)} />
        ))}
      </ol>
    )
  }
  return (
    <div className="space-y-6">
      {corridors.map((c) => {
        const segs = segments.filter((s) => s.corridorId === c.id)
        if (!segs.length) return null
        return (
          <div key={c.id}>
            <h3 className="mb-2 flex items-baseline gap-2">
              <RoadCode className="text-sm">{c.code}</RoadCode>
              <span className="font-semibold">{c.name}</span>
            </h3>
            <ul className="space-y-2">
              {segs.map((s) => (
                <SegmentRow key={s.id} segment={s} selected={s.id === selectedId} onSelect={() => onSelect(s.id)} />
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
