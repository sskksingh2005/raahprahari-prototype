import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  List,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  RotateCcw,
  Search,
  ShieldCheck,
  TriangleAlert,
  UsersRound,
  X,
} from 'lucide-react'
import { ActionBadge, FreshnessChip } from '@/components/advisory'
import { useExitGhosts } from '@/components/motion'
import { PrototypeRibbon } from '@/components/prototype-ribbon'
import { Button } from '@/components/ui/button'
import { SkeletonList } from '@/components/ui/skeleton'
import { placeById } from '@/data/fixtures'
import { getCurrentPosition, inCoverage, nearestPlace } from '@/lib/geo'
import type { AdvisoryLevel, SegmentAdvisory } from '@/lib/advisory'
import { useAppStore } from '@/lib/app-store'
import { LeafletMapLegend, LeafletSegmentMap } from '@/features/map/leaflet-segment-map'
import { usePrefs } from '@/i18n/preferences'
import { findSeededRoutes } from '@/features/routes/routing'
import type { Corridor, Place, Segment } from '@/lib/types'
import { cn } from '@/lib/utils'
import './traveller.css'

type TravellerSearch = {
  q?: string
  from?: string
  to?: string
  view?: 'map' | 'list'
  seg?: string
}

type RecentTravellerSearch = {
  query: string
  at: number
}

type ResultFilter = 'all' | 'roads' | 'hazards'
type SearchStatus = 'idle' | 'loading' | 'failure'

/** Typing waits this long after the last keystroke before results update. */
export const SEARCH_DEBOUNCE_MS = 300

const FILTERS = [
  ['all', 'All'],
  ['roads', 'Roads'],
  ['hazards', 'Hazards'],
] as const

export const Route = createFileRoute('/traveller')({
  validateSearch: (search: Record<string, unknown>): TravellerSearch => ({
    q: typeof search.q === 'string' ? search.q : undefined,
    from: typeof search.from === 'string' ? search.from : undefined,
    to: typeof search.to === 'string' ? search.to : undefined,
    view: search.view === 'list' ? 'list' : search.view === 'map' ? 'map' : undefined,
    seg: typeof search.seg === 'string' ? search.seg : undefined,
  }),
  head: () => ({ meta: [{ title: 'Search roads · RaahPrahari' }] }),
  component: TravellerPage,
})

function TravellerPage() {
  const { t, place, ago } = usePrefs()
  const {
    segments,
    corridors,
    places,
    advisories,
    recentSearches: recent,
    setRecentSearches: setRecent,
  } = useAppStore()
  const navigate = useNavigate()
  const search = Route.useSearch()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<number | undefined>(undefined)
  const lastTypedAtRef = useRef(0)
  const from = search.from && placeById(search.from) ? search.from : undefined
  const to = search.to && placeById(search.to) ? search.to : undefined
  const journey = !!from && !!to && from !== to
  const [query, setQuery] = useState(
    search.q ?? (journey && from && to ? `${place(from)} to ${place(to)}` : ''),
  )
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle')
  /** True while a typed query is waiting for the debounce to fire. */
  const [pending, setPending] = useState(false)
  const [filter, setFilter] = useState<ResultFilter>('all')
  /** Shared by the map, the result list and the selected-section panel. */
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | undefined>(search.seg)
  const [locationMessage, setLocationMessage] = useState<string | null>(null)
  const [locating, setLocating] = useState(false)
  const [manualEntry, setManualEntry] = useState(false)
  const activeQuery = search.q?.trim() ?? ''
  const hasSearch = !!activeQuery || journey

  useEffect(() => () => window.clearTimeout(debounceRef.current), [])

  // The landing and results layouts each render the form, so the input remounts
  // when the first debounced search lands. Keep focus and caret if the user is typing.
  useEffect(() => {
    const input = inputRef.current
    if (!input || document.activeElement === input) return
    if (Date.now() - lastTypedAtRef.current > 2_000) return
    input.focus()
    input.setSelectionRange(input.value.length, input.value.length)
  }, [hasSearch])

  const routeOptions = useMemo(
    () => {
      if (journey && from && to) return findSeededRoutes(from, to)
      const endpoints = routePlaceIds(activeQuery, places)
      return endpoints ? findSeededRoutes(...endpoints) : []
    },
    [activeQuery, from, to, journey, places],
  )

  const results = useMemo((): { matches: SegmentMatch[]; error: boolean } => {
    try {
      if (journey) {
        const routeSegments = [
          ...new Map(routeOptions.flatMap((route) => route.segments).map((s) => [s.id, s])).values(),
        ]
        return { matches: routeSegments.map((s) => toMatch(s, true, advisories)), error: false }
      }
      return {
        matches: searchSegments(activeQuery, { segments, corridors, places, advisories }),
        error: false,
      }
    } catch (error) {
      console.error('Road search failed', error)
      return { matches: [], error: true }
    }
  }, [activeQuery, journey, routeOptions, segments, corridors, places, advisories])

  const counts = {
    all: results.matches.length,
    roads: results.matches.filter((m) => m.road).length,
    hazards: results.matches.filter((m) => m.hazard).length,
  }
  const filteredResults = results.matches.filter((m) =>
    filter === 'roads' ? m.road : filter === 'hazards' ? m.hazard : true,
  )
  const routeSummary = routeOptions[0]

  const rememberSearch = (value: string) =>
    setRecent((previous) =>
      [
        { query: value, at: Date.now() },
        ...previous.filter((item) => item.query.toLowerCase() !== value.toLowerCase()),
      ].slice(0, 5),
    )

  /** Puts the query in the URL. Typed (debounced) searches replace history and are not remembered. */
  const commitSearch = (value: string | undefined, remember: boolean) =>
    navigate({
      to: '/traveller',
      search: { q: value, from: undefined, to: undefined, view: undefined, seg: undefined },
      replace: !remember,
    })
      .then(() => {
        setSearchStatus('idle')
        setPending(false)
        if (remember && value) rememberSearch(value)
      })
      .catch((error: unknown) => {
        console.error('Road search navigation failed', error)
        setPending(false)
        setSearchStatus('failure')
      })

  const runSearch = (rawQuery = query, options: { keepMessage?: boolean } = {}) => {
    const value = rawQuery.trim()
    window.clearTimeout(debounceRef.current)
    setPending(false)
    if (!value) {
      inputRef.current?.focus()
      return
    }

    setQuery(value)
    if (!options.keepMessage) setLocationMessage(null)
    setSearchStatus('loading')
    window.setTimeout(() => void commitSearch(value, true), 100)
  }

  const onQueryChange = (value: string) => {
    setQuery(value)
    lastTypedAtRef.current = Date.now()
    window.clearTimeout(debounceRef.current)
    if (searchStatus === 'failure') setSearchStatus('idle')
    const trimmed = value.trim()
    if (trimmed === activeQuery && !journey) {
      setPending(false)
      return
    }
    setPending(true)
    debounceRef.current = window.setTimeout(
      () => void commitSearch(trimmed || undefined, false),
      SEARCH_DEBOUNCE_MS,
    )
  }

  const clearSearch = () => {
    window.clearTimeout(debounceRef.current)
    setPending(false)
    setQuery('')
    setSearchStatus('idle')
    setLocationMessage(null)
    setFilter('all')
    void navigate({
      to: '/traveller',
      search: { q: undefined, from: undefined, to: undefined, view: undefined, seg: undefined },
    })
  }

  /** Asks the browser for permission; the browser shows its own prompt. */
  const requestCurrentLocation = async () => {
    setLocating(true)
    setLocationMessage(null)
    const result = await getCurrentPosition()
    setLocating(false)
    if (!result.ok) {
      setLocationMessage(
        result.reason === 'denied'
          ? 'Location permission denied. Search manually instead.'
          : 'Location is unavailable. You can still search manually.',
      )
      setManualEntry(true)
      inputRef.current?.focus()
      return
    }
    if (!inCoverage(result.lat, result.lon)) {
      setLocationMessage('Your location is outside the current coverage area. Enter a place or road manually.')
      setManualEntry(true)
      inputRef.current?.focus()
      return
    }

    // Allowed: search the nearest covered place. The user can edit it afterwards.
    const nearest = nearestPlace(result.lat, result.lon)
    const name = place(nearest.id)
    setLocationMessage(
      `Showing road sections at ${name}, the nearest covered place (location accurate to about ${Math.round(result.accuracyM)} m). Edit the search to change it.`,
    )
    runSearch(name, { keepMessage: true })
  }

  /** Selecting on the map also brings the matching result row into view. */
  const selectFromMap = (id: string) => {
    setSelectedSegmentId(id)
    requestAnimationFrame(() =>
      document.getElementById(`traveller-result-${id}`)?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }),
    )
  }

  const chooseRecent = (value: string) => {
    setQuery(value)
    runSearch(value)
  }

  const searchForm = (
    <form
      className="traveller-search-form"
      onSubmit={(event) => {
        event.preventDefault()
        runSearch()
      }}
    >
      <label className="traveller-search-label" htmlFor="traveller-query">
        Search a place or road
      </label>
      <div className="traveller-query-wrap">
        <Search aria-hidden className="traveller-query-icon" />
        <input
          ref={inputRef}
          id="traveller-query"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="e.g. Dehradun to Mussoorie"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className="traveller-clear-query"
            aria-label="Clear search"
            onClick={clearSearch}
          >
            <X aria-hidden />
          </button>
        )}
      </div>
      {/* Stays enabled while a typed search is pending so Enter can run it immediately. */}
      <Button type="submit" className="traveller-search-submit" disabled={!query.trim() || searchStatus === 'loading'}>
        <Search aria-hidden />
        {searchStatus === 'loading' || pending ? t('common.searching') : 'Search road'}
      </Button>
      <div className="traveller-location-actions">
        <Button type="button" variant="outline" onClick={() => void requestCurrentLocation()} disabled={locating}>
          <LocateFixed aria-hidden />
          {locating ? 'Getting location…' : 'Use current location'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setManualEntry(true)
            inputRef.current?.focus()
          }}
        >
          <MapPin aria-hidden />
          Enter location manually
        </Button>
      </div>
      <p className="traveller-location-note" role={locationMessage ? 'status' : undefined}>
        {locationMessage ??
          (manualEntry
            ? 'Manual search is active. Location access is optional.'
            : 'Location access is optional. Search manually at any time.')}
      </p>
    </form>
  )

  if (!hasSearch && searchStatus !== 'failure') {
    return (
      <div className="traveller-page traveller-landing">
        <section className="traveller-search-panel" aria-labelledby="traveller-title">
          <div className="traveller-panel-content">
            <p className="traveller-eyebrow">ROAD ADVISORIES · UTTARAKHAND</p>
            <h1 id="traveller-title">Where are you travelling?</h1>
            <p className="traveller-panel-description">
              Search reported road conditions, evidence freshness, and official restrictions.
            </p>
            {searchForm}
            <RecentSearches
              recent={recent}
              onChoose={chooseRecent}
              onClear={() => setRecent([])}
            />
          </div>
        </section>
        <TravellerMap
          results={[]}
          selectedSegmentId={selectedSegmentId}
          onSelectSegment={selectFromMap}
          summary="All covered road sections · approx."
        />
        <TravellerFooter />
      </div>
    )
  }

  const resultTitle = 'Search results'
  const routeFrom = journey && from ? place(from) : routeSummary ? place(routeSummary.segments[0]?.from ?? '') : undefined
  const routeTo = journey && to ? place(to) : routeSummary ? place(routeSummary.segments.at(-1)?.to ?? '') : undefined

  return (
    <div className="traveller-page traveller-results-page">
      <section className="traveller-results-banner photo-surface">
        <div className="traveller-results-heading">
          <div>
            <button type="button" className="traveller-back-link" onClick={clearSearch}>
              <ArrowLeft aria-hidden />
              Back to search
            </button>
            <h1>{resultTitle}</h1>
            <p>Here are the latest reports and advisories for your search.</p>
          </div>
          <div className="traveller-results-search">{searchForm}</div>
        </div>
        {/* All: every match. Roads: the road itself (ID, code, corridor or place) matched.
            Hazards: sections with a community hazard report or an official restriction. */}
        <div className="traveller-filter-row" role="group" aria-label="Filter results">
          {FILTERS.map(([key, label]) => (
            <button
              type="button"
              key={key}
              aria-pressed={filter === key}
              className={cn('traveller-filter-chip', filter === key && 'is-active')}
              onClick={() => setFilter(key)}
            >
              {key === 'roads' && <MapIcon aria-hidden />}
              {key === 'hazards' && <TriangleAlert aria-hidden />}
              {label}
              <span className="traveller-filter-count">{counts[key]}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="traveller-results-layout">
        <section className="traveller-result-list" aria-label="Search results">
          {searchStatus === 'loading' || pending ? (
            <>
            <div className="traveller-state-card rp-fade-rise" role="status">
              <span className="traveller-loading-mark" aria-hidden />
              <div>
                <h2>Searching road information…</h2>
                <p>Checking available synthetic reports and advisories.</p>
              </div>
            </div>
            <SkeletonList count={2} />
            </>
          ) : searchStatus === 'failure' || results.error ? (
            <div className="traveller-state-card rp-fade-rise" role="alert">
              <TriangleAlert aria-hidden />
              <div>
                <h2>Search could not be completed.</h2>
                <p>Try again or enter a place or road manually.</p>
                <Button type="button" variant="outline" onClick={() => runSearch()}>
                  Try again
                </Button>
              </div>
            </div>
          ) : filteredResults.length ? (
            filteredResults.map(({ segment, advisory }) => (
              <ResultRow
                key={segment.id}
                segment={segment}
                selected={segment.id === selectedSegmentId}
                onSelect={() => setSelectedSegmentId(segment.id)}
                observedAt={advisory.latestObservationAt}
                reason={
                  advisory.evidence[0]?.description ??
                  advisory.restriction?.title ??
                  'No recent observation is available for this road section.'
                }
                observedLabel={advisory.latestObservationAt ? ago(advisory.latestObservationAt) : undefined}
              />
            ))
          ) : results.matches.length ? (
            <div className="traveller-empty-state rp-fade-rise">
              <MapPin aria-hidden />
              <div>
                <h2>No {filter === 'roads' ? 'road' : 'hazard'} matches for this search.</h2>
                <p>
                  {filter === 'hazards'
                    ? 'No hazard or restriction is on record here. That does not mean the road is clear.'
                    : 'Your search only matched report text, not a road name, ID or place.'}
                </p>
              </div>
              <Button type="button" variant="ghost" onClick={() => setFilter('all')}>
                <RotateCcw aria-hidden />
                Show all {results.matches.length} results
              </Button>
            </div>
          ) : (
            <div className="traveller-empty-state rp-fade-rise">
              <MapPin aria-hidden />
              <div>
                <h2>No matching reports found.</h2>
                <p>This does not confirm current road conditions.</p>
              </div>
              <Button type="button" variant="ghost" onClick={clearSearch}>
                <RotateCcw aria-hidden />
                Try a different search
              </Button>
            </div>
          )}
        </section>
        <TravellerMap
          results={filteredResults}
          selectedSegmentId={selectedSegmentId}
          onSelectSegment={selectFromMap}
          routeFrom={routeFrom}
          routeTo={routeTo}
          summary={routeSummary ? 'Route summary · approx.' : 'Matching road sections · approx.'}
        />
      </div>
      <TravellerFooter />
    </div>
  )
}

export function getTravellerResultAction(advisory: SegmentAdvisory): AdvisoryLevel {
  if (advisory.restriction) {
    return advisory.level === 'clear' ? 'unknown' : advisory.level
  }
  if (!advisory.evidence.length) return 'unknown'
  return advisory.level === 'caution' || advisory.level === 'avoid' ? advisory.level : 'unknown'
}

export function ResultRow({
  segment,
  observedAt,
  observedLabel,
  reason,
  selected = false,
  onSelect,
}: {
  segment: Segment
  observedAt?: number
  observedLabel?: string
  reason: string
  /** Selected on the map or in this list. */
  selected?: boolean
  onSelect?: () => void
}) {
  const { t, place } = usePrefs()
  const { advisories } = useAppStore()
  const advisory = advisories.get(segment.id)
  if (!advisory) throw new Error(`Missing advisory for segment "${segment.id}"`)
  const action = getTravellerResultAction(advisory)
  const sourceLabel = advisory.evidence.length
    ? 'Community report, not independently verified'
    : advisory.restriction
      ? 'Official source'
      : 'No reported source'

  return (
    <article
      id={`traveller-result-${segment.id}`}
      className={cn('rp-card rp-enter traveller-result-row', `status-${action}`, advisory.stale && 'is-stale', selected && 'is-selected')}
    >
      <div className="traveller-result-badge">
        <ActionBadge level={action} />
      </div>
      <div className="traveller-result-main">
        <h2 className="rp-wrap-anywhere">
          {place(segment.from)} – {place(segment.to)} <span>({segment.code})</span>
        </h2>
        <p className="traveller-road-code">km {segment.kmStart}–{segment.kmEnd}</p>
        <p className="traveller-result-reason">{reason}</p>
        <p className="traveller-restriction-detail">
          <strong>Official restriction:</strong>{' '}
          {advisory.restriction?.title ?? 'No current official information'}
        </p>
        <p className="traveller-source-detail">
          <strong>Evidence / Source:</strong> {sourceLabel}
        </p>
        <div className="traveller-result-metadata">
          <span>
            <Clock3 aria-hidden />
            <strong>Observed:</strong> {observedLabel ?? 'time unavailable'}
          </span>
          {advisory.restriction && <span><ShieldCheck aria-hidden /> Official restriction</span>}
          {advisory.evidence.length > 0 && <span><UsersRound aria-hidden /> Community evidence</span>}
        </div>
      </div>
      <div className="traveller-row-trailing">
        <span className="traveller-freshness-chip">
          <strong>Freshness:</strong>
          <FreshnessChip
            observationTimestamp={observedAt}
            className="traveller-inline-freshness"
          />
        </span>
        {onSelect && (
          <Button
            type="button"
            variant={selected ? 'secondary' : 'ghost'}
            className="traveller-view-details"
            aria-pressed={selected}
            onClick={onSelect}
          >
            <MapIcon aria-hidden />
            {selected ? 'Shown on map' : 'Show on map'}
          </Button>
        )}
        <Button asChild type="button" variant="outline" className="traveller-view-details">
          <Link to="/advisories/$segmentId" params={{ segmentId: segment.id }}>
            {t('common.viewDetails')}
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    </article>
  )
}

function RecentSearches({
  recent,
  onChoose,
  onClear,
}: {
  recent: RecentTravellerSearch[]
  onChoose: (query: string) => void
  onClear: () => void
}) {
  const [showExample, setShowExample] = useState(true)
  const [ghosts, captureGhosts] = useExitGhosts<RecentTravellerSearch>()
  const example = 'Dehradun to Mussoorie'
  return (
    <section className="traveller-recent" aria-labelledby="traveller-recent-title">
      <div className="traveller-recent-heading">
        <h2 id="traveller-recent-title">Recent searches</h2>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            captureGhosts(recent)
            onClear()
            setShowExample(false)
          }}
        >
          <X aria-hidden />
          Clear
        </Button>
      </div>
      <ul>
        {recent.map(({ query }) => (
          <li key={query}>
            <button type="button" onClick={() => onChoose(query)}>
              <RotateCcw aria-hidden />
              {query}
            </button>
          </li>
        ))}
        {ghosts.map(({ query }) => (
          <li key={`ghost-${query}`} data-leaving="true" aria-hidden>
            <button type="button" tabIndex={-1} disabled aria-hidden>
              <RotateCcw aria-hidden />
              {query}
            </button>
          </li>
        ))}
        {!recent.length && showExample && (
          <li className="traveller-example-search">
            <span>Illustrative example</span>
            <button type="button" onClick={() => onChoose(example)}>
              <RotateCcw aria-hidden />
              {example}
            </button>
          </li>
        )}
      </ul>
    </section>
  )
}

function TravellerMap({
  results,
  selectedSegmentId,
  onSelectSegment,
  routeFrom,
  routeTo,
  summary,
}: {
  results: { segment: Segment }[]
  selectedSegmentId?: string
  onSelectSegment: (id: string) => void
  routeFrom?: string
  routeTo?: string
  summary: string
}) {
  const { t, place } = usePrefs()
  const { segments, advisories } = useAppStore()
  const [mode, setMode] = useState<'map' | 'list'>('map')
  const [mapUnavailable, setMapUnavailable] = useState(false)
  const resultSegments = results.map(({ segment }) => segment)
  // With no search yet, show every covered road so the map is still useful.
  const shown = resultSegments.length ? resultSegments : segments
  const selected = selectedSegmentId ? segments.find((s) => s.id === selectedSegmentId) : undefined
  const selectedAdvisory = selected ? advisories.get(selected.id) : undefined

  return (
    <section className="traveller-map-panel" aria-label="Road map">
      <div className="traveller-map-surface">
        {mode === 'map' ? (
          <LeafletSegmentMap
            segments={shown}
            highlight={resultSegments.length ? resultSegments.map((s) => s.id) : undefined}
            selectedSegmentId={selectedSegmentId}
            onSelectSegment={onSelectSegment}
            onUnavailable={() => {
              setMapUnavailable(true)
              setMode('list')
            }}
            label="Interactive map of matching road sections"
            className="traveller-leaflet"
            showRibbon={false}
          />
        ) : (
          <>
            {mapUnavailable && (
              <p className="traveller-map-fallback-notice" role="status">
                The map tiles could not be loaded. Showing road sections instead.
              </p>
            )}
            <div className="traveller-map-list">
              <h2>Road sections</h2>
              {results.length ? results.slice(0, 6).map(({ segment }) => (
                <div className="traveller-map-list-row" key={segment.id}>
                  <button
                    type="button"
                    aria-pressed={selectedSegmentId === segment.id}
                    onClick={() => onSelectSegment(segment.id)}
                  >
                    {selectedSegmentId === segment.id ? 'Selected: ' : 'Select: '}
                    {place(segment.from)} – {place(segment.to)}
                  </button>
                  <Link to="/advisories/$segmentId" params={{ segmentId: segment.id }}>
                    {t('common.viewDetails')}
                  </Link>
                  <Link to="/report" search={{ segment: segment.id }}>
                    {t('common.reportRoad')}
                  </Link>
                </div>
              )) : <p>Search manually to view matching road sections.</p>}
            </div>
          </>
        )}
        <div className="traveller-map-toggle" role="group" aria-label="Map view">
          <button
            type="button"
            aria-pressed={mode === 'map'}
            disabled={mapUnavailable}
            onClick={() => setMode('map')}
          >
            <MapIcon aria-hidden /> Map
          </button>
          <button type="button" aria-pressed={mode === 'list'} onClick={() => setMode('list')}>
            <List aria-hidden /> List
          </button>
        </div>
      </div>

      {selected && selectedAdvisory ? (
        <div className="traveller-selected" aria-live="polite">
          <span className="sr-only">Selected road section:</span>
          <strong>
            {place(selected.from)} – {place(selected.to)} ({selected.code})
          </strong>
          <ActionBadge level={getTravellerResultAction(selectedAdvisory)} />
          <Link to="/advisories/$segmentId" params={{ segmentId: selected.id }}>
            {t('common.viewDetails')}
          </Link>
        </div>
      ) : (
        <p className="traveller-selected-hint">Select a road section on the map or in the list.</p>
      )}

      {mode === 'map' && <LeafletMapLegend className="traveller-map-legend" />}

      <div className="traveller-route-summary">
        <div className="traveller-summary-icon"><ArrowRight aria-hidden /></div>
        <div>
          <strong>{routeFrom && routeTo ? `${routeFrom} → ${routeTo}` : 'Route summary'}</strong>
          <span>{summary}</span>
        </div>
        <span className="traveller-summary-approx">approx.</span>
      </div>
    </section>
  )
}

function TravellerFooter() {
  return (
    <footer className="traveller-page-footer">
      <span><TriangleAlert aria-hidden /> Synthetic demo data, not current road conditions.</span>
      <span>
        <PrototypeRibbon />
      </span>
    </footer>
  )
}

export interface SegmentMatch {
  segment: Segment
  advisory: SegmentAdvisory
  /** The road itself (ID, code, corridor or place) matched, not only report text. */
  road: boolean
  /** Has a community hazard report or an official restriction. */
  hazard: boolean
}

function toMatch(
  segment: Segment,
  road: boolean,
  advisories: Map<string, SegmentAdvisory>,
): SegmentMatch {
  const advisory = advisories.get(segment.id)
  if (!advisory) throw new Error(`Missing advisory for segment "${segment.id}"`)
  return {
    segment,
    advisory,
    road,
    hazard: advisory.evidence.some((report) => report.kind === 'hazard') || !!advisory.restriction,
  }
}

/**
 * Filters the store's segments by free text. Matches segment ID (nh7-06),
 * road code (NH-7, SH-MSR), corridor name, and place names in English or
 * Hindi, plus district. "A to B" finds seeded routes between two places.
 * Report descriptions, landmarks and restriction titles also match, but
 * those results are not counted as road matches.
 */
export function searchSegments(
  query: string,
  data: {
    segments: Segment[]
    corridors: Corridor[]
    places: Place[]
    advisories: Map<string, SegmentAdvisory>
  },
): SegmentMatch[] {
  const normalized = normalizeQuery(query)
  if (!normalized) return []

  const endpoints = routePlaceIds(query, data.places)
  if (endpoints) {
    const routeSegments = [
      ...new Map(findSeededRoutes(...endpoints).flatMap((route) => route.segments).map((s) => [s.id, s])).values(),
    ]
    return routeSegments.map((segment) => toMatch(segment, true, data.advisories))
  }

  const words = normalized.split(' ').filter((word) => word && word !== 'to')
  const matches = (haystack: string) =>
    haystack.includes(normalized) || (words.length > 0 && words.every((word) => haystack.includes(word)))
  const placeText = (id: string) => {
    const p = data.places.find((candidate) => candidate.id === id)
    return p ? [p.id, p.name, p.nameHi, p.district] : [id]
  }

  return data.segments.flatMap((segment) => {
    const corridor = data.corridors.find((c) => c.id === segment.corridorId)
    const roadText = normalizeQuery(
      [segment.id, segment.code, corridor?.code, corridor?.name, ...placeText(segment.from), ...placeText(segment.to)]
        .filter(Boolean)
        .join(' '),
    )
    if (matches(roadText)) return [toMatch(segment, true, data.advisories)]

    const advisory = data.advisories.get(segment.id)
    const evidenceText = normalizeQuery(
      [
        ...(advisory?.evidence.map((report) => `${report.description} ${report.landmark}`) ?? []),
        advisory?.restriction?.title,
      ]
        .filter(Boolean)
        .join(' '),
    )
    return evidenceText && matches(`${roadText} ${evidenceText}`)
      ? [toMatch(segment, false, data.advisories)]
      : []
  })
}

function routePlaceIds(query: string, places: Place[]): [string, string] | undefined {
  const parts = query.split(/\s+(?:to|→|–)\s+/i).map((part) => part.trim()).filter(Boolean)
  if (parts.length !== 2) return undefined
  const start = findPlaceId(parts[0], places)
  const end = findPlaceId(parts[1], places)
  return start && end ? [start, end] : undefined
}

function findPlaceId(value: string, places: Place[]) {
  const needle = normalizeQuery(value)
  return places.find((place) =>
    [place.id, place.name, place.nameHi].some((candidate) => normalizeQuery(candidate) === needle),
  )?.id
}

function normalizeQuery(value: string) {
  return value.toLocaleLowerCase().replace(/[.,]/g, ' ').replace(/\s+/g, ' ').trim()
}
