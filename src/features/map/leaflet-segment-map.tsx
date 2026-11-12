// Interactive OpenStreetMap map of road segments, built on Leaflet.
//
// Leaflet touches `window` when it loads, so it is imported only in the
// browser, after mount. Server rendering outputs the empty frame, legend and
// labels; the map fills in on the client.

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type * as Leaflet from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Crosshair, LocateFixed, Minus, Plus } from 'lucide-react'
import { PrototypeRibbon } from "@/components/prototype-ribbon"
import { SEGMENT_GEOMETRY_NOTE } from '@/data/fixtures'
import { usePrefs } from '@/i18n/preferences'
import { useAppStore } from '@/lib/app-store'
import { getCurrentPosition, inCoverage } from '@/lib/geo'
import type { Segment } from '@/lib/types'
import { cn } from '@/lib/utils'
import { MARKER_GLYPH, MARKER_LABEL, segmentMapStyle, type MarkerKind } from './map-style'
import './leaflet-segment-map.css'

export type MapUnavailableReason = 'tiles' | 'offline' | 'library'

export const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export const OSM_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
/** Tile errors before any tile has loaded that count as "the map provider is down". */
export const TILE_FAILURE_THRESHOLD = 4

const UTTARAKHAND_CENTER: [number, number] = [30.07, 79.2]

type Lib = typeof Leaflet

/** Separated so tests and callers share one loader. */
export const loadLeaflet = (): Promise<Lib> =>
  import('leaflet').then((mod) => ((mod as unknown as { default?: Lib }).default ?? mod) as Lib)

const markerHtml = (kind: MarkerKind, extra: string) =>
  `<span class="rp-lmap-marker kind-${kind} ${extra}"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${MARKER_GLYPH[kind]}</svg></span>`

export function LeafletSegmentMap({
  segments,
  highlight,
  selectedSegmentId,
  onSelectSegment,
  fitTo,
  onUnavailable,
  label,
  className,
  showRibbon = true,
}: {
  /** Segments to draw. Official closures from the store are always drawn too. */
  segments: Segment[]
  /** Emphasised segments; the rest are dimmed (closures never are). */
  highlight?: string[]
  selectedSegmentId?: string
  onSelectSegment?: (id: string) => void
  /** Segment ids to frame initially and on Reset view. Defaults to highlight, then all drawn segments. */
  fitTo?: string[]
  onUnavailable?: (reason: MapUnavailableReason) => void
  /** Accessible name for the map. */
  label: string
  className?: string
  /** Set false when the page already shows the shared PrototypeRibbon itself. */
  showRibbon?: boolean
}) {
  const { t, place } = usePrefs()
  const { segments: allSegments, advisories, now } = useAppStore()
  const helpId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<{ L: Lib; map: Leaflet.Map; layers: Leaflet.LayerGroup; you?: Leaflet.CircleMarker } | null>(null)
  const [ready, setReady] = useState(false)
  const [zoomStatus, setZoomStatus] = useState('')
  const [locateStatus, setLocateStatus] = useState('')
  const [locating, setLocating] = useState(false)

  // Latest callbacks without re-creating the map.
  const onSelectRef = useRef(onSelectSegment)
  const onUnavailableRef = useRef(onUnavailable)
  useEffect(() => {
    onSelectRef.current = onSelectSegment
    onUnavailableRef.current = onUnavailable
  })

  // Closures are always visible, even outside the current set.
  const closures = allSegments.filter((s) => advisories.get(s.id)?.restriction?.type === 'road_closed')
  const drawn = [...new Map([...segments, ...closures].map((s) => [s.id, s])).values()]
  const drawnKey = drawn.map((s) => s.id).join(',')
  const highlightKey = highlight?.join(',') ?? ''
  const fitIds = fitTo ?? (highlight?.length ? highlight : drawn.map((s) => s.id))
  const fitKey = fitIds.join(',')

  const segmentName = useCallback(
    (s: Segment) => `${s.code}, ${place(s.from)} – ${place(s.to)}`,
    [place],
  )

  const frame = useCallback((ids: string[]) => {
    const current = mapRef.current
    if (!current) return
    const points = allSegments.filter((s) => ids.includes(s.id)).flatMap((s) => s.path)
    const size = current.map.getSize()
    if (!points.length || !size.x || !size.y) {
      // No layout yet (hidden or zero-size container): a sensible default view.
      current.map.setView(points.length ? current.L.latLngBounds(points).getCenter() : UTTARAKHAND_CENTER, 8)
      return
    }
    current.map.fitBounds(current.L.latLngBounds(points), { padding: [28, 28], maxZoom: 11 })
  }, [allSegments])

  // Create the map once, in the browser only.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      onUnavailableRef.current?.('offline')
      return
    }
    let cancelled = false
    let cleanup = () => {}

    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current) return
        const map = L.map(container, {
          zoomControl: false,
          attributionControl: false,
          keyboard: true,
          minZoom: 6,
          maxZoom: 16,
          maxBounds: L.latLngBounds([27.8, 76.8], [32.2, 81.8]),
        })
        // Bottom-left keeps the attribution clear of the site's fixed bottom-right prototype ribbon.
        L.control.attribution({ prefix: '<a href="https://leafletjs.com">Leaflet</a>', position: 'bottomleft' })
          .addAttribution(OSM_ATTRIBUTION)
          .addTo(map)
        L.control.scale({ imperial: false, position: 'bottomright' }).addTo(map)

        let loaded = 0
        let errors = 0
        let reported = false
        L.tileLayer(OSM_TILE_URL, { maxZoom: 19, crossOrigin: true })
          .on('tileload', () => {
            loaded++
          })
          .on('tileerror', () => {
            errors++
            if (!reported && loaded === 0 && errors >= TILE_FAILURE_THRESHOLD) {
              reported = true
              onUnavailableRef.current?.('tiles')
            }
          })
          .addTo(map)

        const layers = L.layerGroup().addTo(map)
        mapRef.current = { L, map, layers }

        const announceZoom = () => setZoomStatus(`Zoom level ${map.getZoom()}`)
        map.on('zoomend', announceZoom)

        const onOffline = () => onUnavailableRef.current?.('offline')
        window.addEventListener('offline', onOffline)

        let observer: ResizeObserver | undefined
        if (typeof ResizeObserver !== 'undefined') {
          observer = new ResizeObserver(() => map.invalidateSize())
          observer.observe(container)
        }

        cleanup = () => {
          window.removeEventListener('offline', onOffline)
          observer?.disconnect()
          map.remove()
          mapRef.current = null
        }
        setReady(true)
      })
      .catch((error: unknown) => {
        console.error('Could not load the map library', error)
        if (!cancelled) onUnavailableRef.current?.('library')
      })

    return () => {
      cancelled = true
      cleanup()
    }
  }, [])

  // Frame the map when it is ready or the framed set changes.
  useEffect(() => {
    if (ready) frame(fitIds)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, fitKey, frame])

  // Draw segments and markers.
  useEffect(() => {
    const current = mapRef.current
    if (!ready || !current) return
    const { L, layers } = current
    layers.clearLayers()
    const highlightSet = new Set(highlight ?? [])

    const ordered = [...drawn].sort((a, b) => {
      // Closures and the selection on top.
      const rank = (s: Segment) =>
        (s.id === selectedSegmentId ? 2 : 0) + (segmentMapStyle(advisories.get(s.id), now).alwaysVisible ? 1 : 0)
      return rank(a) - rank(b)
    })

    for (const segment of ordered) {
      const style = segmentMapStyle(advisories.get(segment.id), now)
      const selected = segment.id === selectedSegmentId
      const dim = highlightSet.size > 0 && !highlightSet.has(segment.id) && !style.alwaysVisible && !selected
      const name = segmentName(segment)
      const levelText = t(`level.${style.level}`)
      const select = () => onSelectRef.current?.(segment.id)

      L.polyline(segment.path, {
        className: cn(
          'rp-lmap-line',
          `level-${style.level}`,
          style.dashed && 'is-dashed',
          style.alwaysVisible && 'is-closure',
          dim && 'is-dim',
          selected && 'is-selected rp-fade-pulse-once',
        ),
        weight: selected ? 9 : highlightSet.has(segment.id) ? 7 : 5,
        dashArray: style.dashed ? '6 10' : undefined,
        lineCap: 'round',
        interactive: !!onSelectRef.current,
        bubblingMouseEvents: false,
      })
        .bindTooltip(`${name}: ${levelText}`, { sticky: true })
        .on('click', select)
        .addTo(layers)

      const mid = segment.path[Math.floor(segment.path.length / 2)]
      style.markers.forEach((kind, index) => {
        const offset = index * 30 - ((style.markers.length - 1) * 30) / 2
        const markerName = `${MARKER_LABEL[kind]}: ${name}. ${levelText}${style.alwaysVisible && kind === 'restriction' ? '. Official closure' : ''}`
        const marker = L.marker(mid, {
          icon: L.divIcon({
            className: 'rp-lmap-marker-wrap',
            html: markerHtml(kind, cn(selected && 'is-selected rp-pulse-once', dim && 'is-dim', style.alwaysVisible && 'is-closure')),
            iconSize: [28, 28],
            iconAnchor: [14 - offset, 14],
          }),
          title: markerName,
          alt: markerName,
          keyboard: true,
          riseOnHover: true,
          zIndexOffset: (style.alwaysVisible ? 1000 : 0) + (selected ? 2000 : 0),
        })
        marker.on('click', select)
        marker.on('add', () => {
          const el = marker.getElement()
          if (!el) return
          el.setAttribute('role', 'button')
          el.setAttribute('aria-label', markerName)
          el.setAttribute('aria-pressed', String(selected))
          el.dataset.segmentId = segment.id
          el.dataset.markerKind = kind
          el.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              select()
            }
          })
        })
        marker.addTo(layers)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, drawnKey, highlightKey, selectedSegmentId, advisories, now, segmentName, t])

  // Bring an outside selection (list, search, URL) into view.
  const lastSelected = useRef<string | undefined>(undefined)
  useEffect(() => {
    const current = mapRef.current
    if (!ready || !current || !selectedSegmentId || selectedSegmentId === lastSelected.current) return
    lastSelected.current = selectedSegmentId
    const segment = allSegments.find((s) => s.id === selectedSegmentId)
    if (!segment) return
    const bounds = current.L.latLngBounds(segment.path)
    if (!current.map.getBounds().contains(bounds)) {
      const size = current.map.getSize()
      if (size.x && size.y) current.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 })
      else current.map.setView(bounds.getCenter(), current.map.getZoom())
    }
  }, [ready, selectedSegmentId, allSegments])

  const zoomBy = (delta: number) => {
    const map = mapRef.current?.map
    if (!map) return
    if (delta > 0) map.zoomIn()
    else map.zoomOut()
    setZoomStatus(`Zoom level ${map.getZoom()}`)
  }

  const locate = async () => {
    const current = mapRef.current
    if (!current) return
    setLocating(true)
    setLocateStatus('Asking your browser for your location…')
    const result = await getCurrentPosition()
    setLocating(false)
    if (!result.ok) {
      setLocateStatus(
        result.reason === 'denied'
          ? 'Location permission denied. The map is unchanged.'
          : 'Location is unavailable. The map is unchanged.',
      )
      return
    }
    if (!inCoverage(result.lat, result.lon)) {
      setLocateStatus('Your location is outside the coverage area. The map is unchanged.')
      return
    }
    current.you?.remove()
    current.you = current.L.circleMarker([result.lat, result.lon], {
      radius: 8,
      className: 'rp-lmap-you',
      interactive: false,
    }).addTo(current.map)
    current.map.setView([result.lat, result.lon], Math.max(current.map.getZoom(), 11))
    setLocateStatus(`Showing your approximate location (accurate to about ${Math.round(result.accuracyM)} m).`)
  }

  return (
    <div className={cn('rp-lmap', className)}>
      <div
        ref={containerRef}
        className="rp-lmap-canvas"
        role="region"
        aria-label={label}
        aria-describedby={helpId}
        data-testid="leaflet-map"
      />
      <p id={helpId} className="sr-only">
        Focus the map and use the arrow keys to pan and the plus and minus keys to zoom. Press Tab to move between
        markers and Enter to select a road section.
      </p>
      <div className="rp-lmap-tools" role="group" aria-label="Map controls">
        <button type="button" onClick={() => zoomBy(1)} aria-label="Zoom in" disabled={!ready}>
          <Plus aria-hidden />
        </button>
        <button type="button" onClick={() => zoomBy(-1)} aria-label="Zoom out" disabled={!ready}>
          <Minus aria-hidden />
        </button>
        <button type="button" onClick={() => frame(fitIds)} aria-label="Reset map view" disabled={!ready}>
          <Crosshair aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => void locate()}
          aria-label={locating ? 'Locating…' : 'Show my location'}
          disabled={!ready || locating}
        >
          <LocateFixed aria-hidden />
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {zoomStatus}
      </p>
      {locateStatus && (
        <p className="rp-lmap-status" role="status">
          {locateStatus}
        </p>
      )}
      <div className="rp-lmap-labels">
        {showRibbon && <PrototypeRibbon />}
        <span className="rp-lmap-note">{SEGMENT_GEOMETRY_NOTE}</span>
      </div>
    </div>
  )
}

/** Icon and text legend for the interactive map. */
export function LeafletMapLegend({ className }: { className?: string }) {
  const { t } = usePrefs()
  const lines = ['caution', 'avoid', 'do_not_travel', 'unknown'] as const
  return (
    <section className={cn('rp-lmap-legend', className)} aria-label="Map legend">
      <h2>Map legend</h2>
      <ul>
        {(['hazard', 'restriction', 'unknown'] as const).map((kind) => (
          <li key={kind}>
            <span className={`rp-lmap-marker kind-${kind} is-legend`}>
              <svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: MARKER_GLYPH[kind] }} />
            </span>
            {MARKER_LABEL[kind]}
          </li>
        ))}
        {lines.map((level) => (
          <li key={level}>
            <svg viewBox="0 0 28 8" aria-hidden="true" className={`rp-lmap-legend-line level-${level}`}>
              <line x1="3" y1="4" x2="25" y2="4" strokeDasharray={level === 'unknown' ? '3 4' : undefined} />
            </svg>
            {t(`level.${level}`)}
            {level === 'unknown' ? ' (dashed)' : ''}
          </li>
        ))}
      </ul>
    </section>
  )
}
