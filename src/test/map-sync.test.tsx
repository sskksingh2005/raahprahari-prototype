import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { routeTree } from '@/routeTree.gen'
import { NotFoundPage } from '@/components/error-pages'
import { TILE_FAILURE_THRESHOLD } from '@/features/map/leaflet-segment-map'

const TIMEOUT = 30_000

// jsdom has no layout; give elements a size so Leaflet lays out a viewport.
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

async function mountAt(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    defaultNotFoundComponent: NotFoundPage,
    scrollRestoration: false,
  })
  await router.load()
  const utils = render(<RouterProvider router={router} />)
  return { router, ...utils }
}

const marker = (segmentId: string, kind?: string) =>
  document.querySelector<HTMLElement>(
    `.leaflet-marker-pane [data-segment-id="${segmentId}"]${kind ? `[data-marker-kind="${kind}"]` : ''}`,
  )
const waitForMarker = (segmentId: string, kind?: string) =>
  waitFor(() => {
    const el = marker(segmentId, kind)
    if (!el) throw new Error(`No marker for ${segmentId}`)
    return el
  })

describe('/map selection sync', () => {
  it('map → panel → list, and list → map, share one selection', async () => {
    const { router } = await mountAt('/map')
    // Clicking a marker selects that segment and updates the detail panel and URL.
    fireEvent.click(await waitForMarker('nh107-02', 'hazard'))
    expect(await screen.findByRole('heading', { name: 'Agastyamuni – Guptkashi' })).toBeVisible()
    await waitFor(() => expect((router.state.location.search as { seg?: string }).seg).toBe('nh107-02'))
    expect(marker('nh107-02')).toHaveAttribute('aria-pressed', 'true')

    // The list shows the same selection.
    fireEvent.click(screen.getByRole('button', { name: 'List' }))
    const card = (id: string) =>
      document.querySelector(`a[href="/advisories/${id}"]`)!.closest<HTMLElement>('.rp-map-list-card')!
    expect(within(card('nh107-02')).getByRole('button', { name: 'Selected segment' })).toHaveAttribute('aria-pressed', 'true')

    // Selecting in the list carries back to the map and the panel.
    fireEvent.click(within(card('nh7-03')).getByRole('button', { name: 'Select segment' }))
    // The selected-segment panel (not the list card) follows the list selection.
    await waitFor(() =>
      expect(document.getElementById('rp-map-segment-title')).toHaveTextContent('Srinagar (Garhwal) – Rudraprayag'),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Map' }))
    await waitFor(() => expect(marker('nh7-03')).toHaveAttribute('aria-pressed', 'true'))
    expect(marker('nh107-02')).toHaveAttribute('aria-pressed', 'false')
  }, TIMEOUT)

  it('a marker can be selected from the keyboard', async () => {
    await mountAt('/map')
    const unknown = await waitForMarker('nh7-02', 'unknown')
    unknown.focus()
    expect(unknown).toHaveFocus()
    fireEvent.keyDown(unknown, { key: 'Enter' })
    expect(await screen.findByRole('heading', { name: 'Devprayag – Srinagar (Garhwal)' })).toBeVisible()
  }, TIMEOUT)

  it('shows the OpenStreetMap attribution, legend and prototype label', async () => {
    const { container } = await mountAt('/map')
    await waitFor(() => expect(container.querySelector('.leaflet-control-attribution')).toHaveTextContent('© OpenStreetMap contributors'))
    const legend = within(screen.getByRole('region', { name: 'Map legend' }))
    expect(legend.getByText('Reported hazard')).toBeVisible()
    expect(legend.getByText('Official restriction')).toBeVisible()
    expect(legend.getByText('Unknown information')).toBeVisible()
    expect(screen.getAllByText('Prototype mockup, synthetic data').length).toBeGreaterThan(0)
  }, TIMEOUT)
})

describe('/traveller selection sync', () => {
  it('map ↔ result list ↔ selected-section panel', async () => {
    await mountAt('/traveller?q=Joshimath')
    await screen.findByRole('heading', { name: 'Search results' })

    fireEvent.click(await waitForMarker('nh7-07'))
    const row = (id: string) => document.getElementById(`traveller-result-${id}`)!
    await waitFor(() => expect(row('nh7-07')).toHaveClass('is-selected'))
    expect(within(row('nh7-07')).getByRole('button', { name: 'Shown on map' })).toHaveAttribute('aria-pressed', 'true')
    expect(document.querySelector('.traveller-selected')).toHaveTextContent('Joshimath – Badrinath')

    fireEvent.click(within(row('nh7-06')).getByRole('button', { name: 'Show on map' }))
    await waitFor(() => expect(marker('nh7-06')).toHaveAttribute('aria-pressed', 'true'))
    expect(row('nh7-07')).not.toHaveClass('is-selected')
    expect(document.querySelector('.traveller-selected')).toHaveTextContent('Chamoli – Joshimath')
  }, TIMEOUT)

  it('keeps the official closure visible on the map for an unrelated search', async () => {
    await mountAt('/traveller?q=SH-MSR')
    const closure = await waitForMarker('nh7-06', 'restriction')
    expect(closure.getAttribute('aria-label')).toMatch(/Official closure/)
    expect(closure.querySelector('.rp-lmap-marker')).not.toHaveClass('is-dim')
  }, TIMEOUT)
})

describe('/advisories/:id map', () => {
  it('shows the segment selected; choosing another section opens its detail page', async () => {
    const { router } = await mountAt('/advisories/nh7-03')
    await waitFor(() => expect(marker('nh7-03')).toHaveAttribute('aria-pressed', 'true'))
    fireEvent.click(await waitForMarker('nh7-04'))
    await waitFor(() => expect(router.state.location.pathname).toBe('/advisories/nh7-04'))
    await waitFor(() => expect(marker('nh7-04')).toHaveAttribute('aria-pressed', 'true'))
  }, TIMEOUT)

  it('falls back to the reports list with a notice when tiles fail', async () => {
    const { container } = await mountAt('/advisories/nh7-06')
    const aside = await waitFor(() => {
      const el = container.querySelector<HTMLElement>('aside[aria-label="Route map and community reports"]')
      if (!el?.querySelectorAll('img.leaflet-tile').length) throw new Error('tiles not requested yet')
      return el
    })
    await waitFor(() => expect(aside.querySelectorAll('img.leaflet-tile').length).toBeGreaterThanOrEqual(TILE_FAILURE_THRESHOLD))
    aside.querySelectorAll('img.leaflet-tile').forEach((tile) => fireEvent.error(tile))
    expect(await within(aside).findByRole('status')).toHaveTextContent('Showing the community reports list instead')
    expect(within(aside).getByRole('heading', { name: 'Community hazard reports' })).toBeVisible()
    expect(within(aside).getByRole('button', { name: /Map/ })).toBeDisabled()
  }, TIMEOUT)
})
