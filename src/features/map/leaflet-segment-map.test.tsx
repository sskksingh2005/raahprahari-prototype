import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PreferencesProvider } from '@/i18n/preferences'
import { PLACES, SEGMENTS } from '@/data/fixtures'
import { LeafletMapLegend, LeafletSegmentMap, TILE_FAILURE_THRESHOLD } from './leaflet-segment-map'
import type { PlannedRoute } from '@/lib/route-planner'

// jsdom has no layout. Give elements a size so Leaflet computes a viewport and requests tiles.
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600)
})

const originalGeolocation = Object.getOwnPropertyDescriptor(navigator, 'geolocation')
afterEach(() => {
  vi.restoreAllMocks()
  if (originalGeolocation) Object.defineProperty(navigator, 'geolocation', originalGeolocation)
  else Reflect.deleteProperty(navigator, 'geolocation')
})

const nh7 = SEGMENTS.filter((s) => s.corridorId === 'nh7')

function renderMap(props: Partial<React.ComponentProps<typeof LeafletSegmentMap>> = {}) {
  const onSelectSegment = vi.fn()
  const onUnavailable = vi.fn()
  const utils = render(
    <PreferencesProvider>
      <LeafletSegmentMap
        segments={nh7}
        label="Test road map"
        onSelectSegment={onSelectSegment}
        onUnavailable={onUnavailable}
        {...props}
      />
    </PreferencesProvider>,
  )
  return { ...utils, onSelectSegment, onUnavailable }
}

const lines = (container: HTMLElement) => [...container.querySelectorAll<SVGPathElement>('path.rp-lmap-line')]
const markerFor = (container: HTMLElement, segmentId: string, kind?: string) =>
  container.querySelector<HTMLElement>(
    `[data-segment-id="${segmentId}"]${kind ? `[data-marker-kind="${kind}"]` : ''}`,
  )

describe('LeafletSegmentMap', () => {
  it('draws one OpenStreetMap-attributed polyline per segment, plus official closures', async () => {
    const { container } = renderMap({ segments: SEGMENTS.filter((s) => s.id === 'msr-01') })
    await waitFor(() => expect(lines(container).length).toBeGreaterThan(0))
    // msr-01 plus the always-visible official closure on nh7-06.
    expect(lines(container)).toHaveLength(2)
    expect(container.querySelector('.leaflet-control-attribution')).toHaveTextContent('© OpenStreetMap contributors')
    expect(container.querySelector('.leaflet-tile-pane')).not.toBeNull()
    expect(screen.queryByText('Prototype mockup, synthetic data')).not.toBeInTheDocument()
    expect(screen.getByText('Road lines: approximate, synthetic data')).toBeInTheDocument()
  })

  it('never draws a line green; unknown and stale are grey and dashed; the closure is never dimmed', async () => {
    const { container } = renderMap({ highlight: ['nh7-01'] })
    await waitFor(() => expect(lines(container)).toHaveLength(nh7.length))
    for (const line of lines(container)) {
      expect(line.getAttribute('class')).not.toMatch(/level-clear/)
    }
    // nh7-02 has no reports: unknown, dashed.
    const unknownMarker = markerFor(container, 'nh7-02', 'unknown')
    expect(unknownMarker).not.toBeNull()
    expect(container.querySelectorAll('path.level-unknown.is-dashed').length).toBeGreaterThan(0)
    // nh7-06 is an official closure: outside the highlight but not dimmed.
    const closure = lines(container).find((l) => l.getAttribute('class')?.includes('is-closure'))
    expect(closure?.getAttribute('class')).not.toMatch(/is-dim/)
    expect(markerFor(container, 'nh7-06', 'restriction')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Official closure'),
    )
  })

  it('markers use triangle / shield / question icons with text names, and select on click and Enter', async () => {
    const { container, onSelectSegment } = renderMap()
    await waitFor(() => expect(markerFor(container, 'nh7-06', 'hazard')).not.toBeNull())
    const hazard = markerFor(container, 'nh7-06', 'hazard')!
    expect(hazard).toHaveAttribute('role', 'button')
    expect(hazard).toHaveAttribute('tabindex', '0')
    expect(hazard.getAttribute('aria-label')).toMatch(/^Reported hazard: NH-7 · 06, Chamoli – Joshimath/)
    expect(markerFor(container, 'nh7-06', 'restriction')!.getAttribute('aria-label')).toMatch(/^Official restriction:/)
    expect(markerFor(container, 'nh7-02', 'unknown')!.getAttribute('aria-label')).toMatch(/^Unknown information:/)

    fireEvent.click(hazard)
    expect(onSelectSegment).toHaveBeenLastCalledWith('nh7-06')
    const unknown = markerFor(container, 'nh7-02', 'unknown')!
    unknown.focus()
    fireEvent.keyDown(unknown, { key: 'Enter' })
    expect(onSelectSegment).toHaveBeenLastCalledWith('nh7-02')
  })

  it('clicking a line selects its segment and the selection is shown on the map', async () => {
    const { container, onSelectSegment, rerender } = renderMap()
    await waitFor(() => expect(lines(container)).toHaveLength(nh7.length))
    fireEvent.click(lines(container)[0])
    expect(onSelectSegment).toHaveBeenCalled()

    rerender(
      <PreferencesProvider>
        <LeafletSegmentMap segments={nh7} label="Test road map" selectedSegmentId="nh7-03" onSelectSegment={onSelectSegment} />
      </PreferencesProvider>,
    )
    await waitFor(() => expect(markerFor(container, 'nh7-03')).toHaveAttribute('aria-pressed', 'true'))
    expect(container.querySelectorAll('path.rp-lmap-line.is-selected')).toHaveLength(1)
  })

  it('draws the optional network layer and exposes carrier filtering controls', async () => {
    const onNetworkHeatmapChange = vi.fn()
    const onNetworkCarrierChange = vi.fn()
    const { container } = renderMap({
      networkHeatmap: true,
      onNetworkHeatmapChange,
      onNetworkCarrierChange,
    })
    await waitFor(() =>
      expect(container.querySelectorAll('path.rp-lmap-network-line')).toHaveLength(nh7.length),
    )
    const topLeftOverlay = container.querySelector('.rp-lmap-top-left')!
    expect(topLeftOverlay.children[0]).toHaveClass('rp-lmap-labels')
    expect(topLeftOverlay.children[1]).toHaveClass('rp-lmap-network-control')
    expect(container.querySelector('path.quality-dead_zone')).not.toBeNull()
    expect(screen.getByRole('region', { name: 'Estimated signal coverage' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Network Heatmap' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    fireEvent.change(screen.getByRole('combobox', { name: 'Network carrier filter' }), {
      target: { value: 'bsnl' },
    })
    expect(onNetworkCarrierChange).toHaveBeenCalledWith('bsnl')
  })

  it('draws selectable route alternatives without replacing hazard or network layers', async () => {
    const makeRoute = (segmentId: string): PlannedRoute => {
      const segment = SEGMENTS.find((item) => item.id === segmentId)!
      return {
        id: `route-${segmentId}`,
        designations: ['alternative'],
        steps: [{
          segment,
          fromId: segment.from,
          toId: segment.to,
          reversed: false,
          advisory: undefined,
          networkCoverage: undefined,
        }],
        via: [],
        corridorIds: [segment.corridorId],
        corridorNames: [],
        distanceKm: segment.distanceKm,
        etaMinutes: segment.typicalMinutes,
        safetyScore: 80,
        networkScore: 60,
        hazardCount: 0,
        restrictionCount: 0,
        deadZoneKm: 0,
        hasRoadClosure: false,
      }
    };
    const routes = [makeRoute('nh7-01'), makeRoute('nh7-02')]
    const onSelectRoute = vi.fn()
    const { container } = renderMap({
      routes,
      activeRouteId: routes[0].id,
      onSelectRoute,
      networkHeatmap: true,
    })

    await waitFor(() => {
      expect(container.querySelector('.rp-lmap-route.is-active')).not.toBeNull()
      expect(container.querySelector('.rp-lmap-route.is-alternative')).not.toBeNull()
    })
    expect(container.querySelectorAll('path.rp-lmap-line')).toHaveLength(nh7.length)
    expect(container.querySelectorAll('path.rp-lmap-network-line')).toHaveLength(nh7.length)
    expect(container.querySelectorAll('.rp-lmap-route-point')).toHaveLength(2)
    fireEvent.click(container.querySelector('.rp-lmap-route.is-alternative')!)
    expect(onSelectRoute).toHaveBeenCalledWith(routes[1].id)
  })

  it('is keyboard operable: focusable map, zoom buttons and reset', async () => {
    const { container } = renderMap()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Zoom in' })).toBeEnabled())
    const map = screen.getByRole('region', { name: 'Test road map' })
    expect(map).toHaveAttribute('tabindex', '0')
    expect(map.classList.contains('leaflet-container')).toBe(true)

    const status = container.querySelector('[aria-live="polite"]')!
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    await waitFor(() => expect(status.textContent).toMatch(/^Zoom level \d+$/))
    const zoomedIn = Number(status.textContent!.split(' ').at(-1))
    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }))
    await waitFor(() => expect(Number(status.textContent!.split(' ').at(-1))).toBe(zoomedIn - 1))
    fireEvent.click(screen.getByRole('button', { name: 'Reset map view' }))
  })

  it('locate asks the browser; handles allowed and denied', async () => {
    const joshimath = PLACES.find((p) => p.id === 'joshimath')!
    const geolocation = {
      getCurrentPosition: vi.fn((ok: PositionCallback) =>
        ok({ coords: { latitude: joshimath.lat, longitude: joshimath.lon, accuracy: 25 } } as GeolocationPosition),
      ),
    }
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: geolocation })
    const { container } = renderMap()
    const locate = await screen.findByRole('button', { name: 'Show my location' })
    await waitFor(() => expect(locate).toBeEnabled())
    fireEvent.click(locate)
    expect(await screen.findByRole('status')).toHaveTextContent('Showing your approximate location')
    expect(geolocation.getCurrentPosition).toHaveBeenCalledTimes(1)
    expect(container.querySelector('path.rp-lmap-you')).not.toBeNull()

    geolocation.getCurrentPosition.mockImplementation(((_ok: PositionCallback, fail: PositionErrorCallback) =>
      fail({ code: 1, PERMISSION_DENIED: 1 } as GeolocationPositionError)) as never)
    fireEvent.click(screen.getByRole('button', { name: 'Show my location' }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Location permission denied'))
  })

  it('reports the map as unavailable when tiles fail to load', async () => {
    const { container, onUnavailable } = renderMap()
    await waitFor(() => expect(container.querySelectorAll('img.leaflet-tile').length).toBeGreaterThanOrEqual(TILE_FAILURE_THRESHOLD))
    for (const tile of container.querySelectorAll('img.leaflet-tile')) fireEvent.error(tile)
    expect(onUnavailable).toHaveBeenCalledWith('tiles')
    expect(onUnavailable).toHaveBeenCalledTimes(1)
  })

  it('reports the map as unavailable when the browser goes offline', async () => {
    const { container, onUnavailable } = renderMap()
    await waitFor(() => expect(lines(container).length).toBeGreaterThan(0))
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(onUnavailable).toHaveBeenCalledWith('offline')
  })
})

describe('LeafletMapLegend', () => {
  it('pairs each icon with text and never lists a green "clear" line', () => {
    render(
      <PreferencesProvider>
        <LeafletMapLegend />
      </PreferencesProvider>,
    )
    const legend = within(screen.getByRole('region', { name: 'Map legend' }))
    for (const text of ['Reported hazard', 'Official restriction', 'Unknown information']) {
      const item = legend.getByText(text).closest('li')!
      expect(item.querySelector('svg')).not.toBeNull()
    }
    expect(legend.queryByText(/clear/i)).toBeNull()
  })
})
