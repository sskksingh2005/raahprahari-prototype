import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { List, Map as MapIcon, Search, X } from 'lucide-react'
import { AdvisoryCard } from '@/components/advisory-card'
import { useSlidingHighlight } from '@/components/motion'
import { LeafletMapLegend, LeafletSegmentMap } from '@/features/map/leaflet-segment-map'
import { ScreenEmpty, ScreenError, ScreenLoading } from '@/components/screen-states'
import { SegmentDetail } from '@/features/routes/segment-detail'
import { usePrefs } from '@/i18n/preferences'
import { useAppStore } from '@/lib/app-store'
import { useScreenState } from '@/lib/use-screen-state'
import { cn } from '@/lib/utils'
import './map.css'

type MapSearch = { seg?: string; view?: 'map' | 'list' }
type ViewMode = 'map' | 'list'

export const Route = createFileRoute('/map')({
  validateSearch: (search: Record<string, unknown>): MapSearch => ({
    seg: typeof search.seg === 'string' ? search.seg : undefined,
    view: search.view === 'list' ? 'list' : search.view === 'map' ? 'map' : undefined,
  }),
  head: () => ({ meta: [{ title: 'Live map · RaahPrahari' }] }),
  component: MapPage,
})

function MapPage() {
  const { t, place } = usePrefs()
  const { segments: SEGMENTS, corridors, advisories } = useAppStore()
  const { status, retry } = useScreenState(() =>
    SEGMENTS.every((segment) => advisories.has(segment.id)),
  )
  const corridorById = (id: string) => corridors.find((corridor) => corridor.id === id)
  const segmentById = (id: string) => SEGMENTS.find((segment) => segment.id === id)
  const search = Route.useSearch()
  const initialSegment = search.seg && segmentById(search.seg) ? search.seg : 'nh7-06'
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | undefined>(initialSegment)
  const [view, setView] = useState<ViewMode>(search.view ?? 'map')
  const [query, setQuery] = useState('')
  const [mapFailed, setMapFailed] = useState(false)
  const navigate = Route.useNavigate()
  const toggleRef = useSlidingHighlight<HTMLDivElement>(view)

  const selectSegment = (id: string | undefined) => {
    setSelectedSegmentId(id)
    void navigate({ search: (previous) => ({ ...previous, seg: id }), replace: true, resetScroll: false })
  }
  const onMapUnavailable = () => {
    setMapFailed(true)
    setView('list')
  }

  const filteredSegments = useMemo(() => {
    const term = query.trim().toLocaleLowerCase()
    if (!term) return SEGMENTS
    return SEGMENTS.filter((segment) => {
      const corridor = corridors.find((item) => item.id === segment.corridorId)
      return [
        segment.code,
        corridor?.name,
        place(segment.from),
        place(segment.to),
      ].some((value) => value?.toLocaleLowerCase().includes(term))
    })
  }, [place, query, SEGMENTS, corridors])
  const selectedSegment = selectedSegmentId ? segmentById(selectedSegmentId) : undefined
  const highlightedSegments = selectedSegment
    ? SEGMENTS.filter((segment) => segment.corridorId === selectedSegment.corridorId).map((segment) => segment.id)
    : undefined

  const changeView = (nextView: ViewMode) => {
    if (nextView === 'map' && mapFailed) return
    setView(nextView)
  }

  return (
    <div className="rp-map-page">
      <div className="rp-map-toolbar" role="search" aria-label="Search road segments">
        <label className="rp-map-search">
          <Search aria-hidden className="size-4 shrink-0" />
          <span className="sr-only">Search by road, place, or location</span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              const nextQuery = event.target.value
              setQuery(nextQuery)
              const normalized = nextQuery.trim().toLocaleLowerCase()
              if (!normalized) return
              const matching = SEGMENTS.find((segment) => {
                const corridor = corridorById(segment.corridorId)
                return [
                  segment.code,
                  corridor?.name,
                  place(segment.from),
                  place(segment.to),
                ].some((value) => value?.toLocaleLowerCase().includes(normalized))
              })
              if (matching) selectSegment(matching.id)
            }}
            placeholder="Search by road, place, or location..."
          />
          {query && (
            <button type="button" className="rp-map-clear" onClick={() => setQuery('')} aria-label="Clear search">
              <X aria-hidden className="size-4" />
            </button>
          )}
        </label>
        <div ref={toggleRef} className="rp-map-toggle rp-segmented" role="group" aria-label="Map or list view">
          {(['map', 'list'] as const).map((nextView) => (
            <button
              key={nextView}
              type="button"
              aria-pressed={view === nextView}
              disabled={nextView === 'map' && mapFailed}
              onClick={() => changeView(nextView)}
            >
              {nextView === 'map' ? <MapIcon aria-hidden /> : <List aria-hidden />}
              {nextView === 'map' ? 'Map' : 'List'}
            </button>
          ))}
        </div>
      </div>

      <div className="rp-map-layout">
        <div className="rp-map-main">
          {view === 'map' && <h1 className="sr-only">Live road map</h1>}
          {mapFailed && (
            <p className="rp-map-fallback-notice" role="status">
              The map tiles could not be loaded. Showing the road list instead.
            </p>
          )}

          {status === 'loading' ? (
            <div className="rp-map-state"><ScreenLoading /></div>
          ) : status === 'error' ? (
            <div className="rp-map-state"><ScreenError onRetry={retry} /></div>
          ) : !SEGMENTS.length ? (
            <div className="rp-map-state"><ScreenEmpty title={t('map.emptyTitle')} message={t('map.emptyBody')} /></div>
          ) : view === 'map' ? (
            <section className="rp-map-canvas" aria-label="Live road map">
              <LeafletSegmentMap
                segments={SEGMENTS}
                highlight={highlightedSegments}
                fitTo={SEGMENTS.map((segment) => segment.id)}
                selectedSegmentId={selectedSegmentId}
                onSelectSegment={selectSegment}
                onUnavailable={onMapUnavailable}
                label="Interactive map of road segments"
                className="rp-map-leaflet"
              />
              <LeafletMapLegend className="rp-map-legend" />
              <SegmentDetail
                segmentId={selectedSegmentId}
                variant="map"
                className="rp-map-detail"
                onClose={() => selectSegment(undefined)}
              />
            </section>
          ) : (
            <section className="rp-map-list-view" aria-label="Road segment list">
              <div className="rp-map-list">
                <div className="rp-map-list-heading">
                  <div>
                    <p className="rp-map-kicker">ROAD CONDITIONS</p>
                    <h1>Road segments</h1>
                  </div>
                  <span>{filteredSegments.length} segments</span>
                </div>
                {filteredSegments.length ? (
                  <div className="rp-map-list-cards">
                    {filteredSegments.map((segment) => (
                      <article
                        key={segment.id}
                        className={cn(
                          'rp-map-list-card',
                          segment.id === selectedSegmentId && 'is-selected',
                        )}
                      >
                        <button
                          type="button"
                          className="rp-map-list-select"
                          aria-pressed={segment.id === selectedSegmentId}
                          onClick={() => selectSegment(segment.id)}
                        >
                          <span>{segment.id === selectedSegmentId ? 'Selected segment' : 'Select segment'}</span>
                          {segment.id === selectedSegmentId && <span aria-hidden>✓</span>}
                        </button>
                        <AdvisoryCard segment={segment} />
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="rp-map-no-results">No road segments match “{query}”.</p>
                )}
              </div>
              <SegmentDetail
                segmentId={selectedSegmentId}
                variant="map"
                className="rp-map-list-detail"
                onClose={() => selectSegment(undefined)}
              />
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
