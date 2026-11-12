import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { routeTree } from '@/routeTree.gen'
import { NotFoundPage } from '@/components/error-pages'
import { CORRIDORS, PLACES, SEGMENTS } from '@/data/fixtures'
import { getAdvisories } from '@/lib/data'
import { STORAGE_KEYS } from '@/lib/storage'
import { searchSegments, SEARCH_DEBOUNCE_MS } from '@/routes/traveller'

const TIMEOUT = 30_000
const originalGeolocation = Object.getOwnPropertyDescriptor(navigator, 'geolocation')

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  window.localStorage.clear()
  if (originalGeolocation) Object.defineProperty(navigator, 'geolocation', originalGeolocation)
  else Reflect.deleteProperty(navigator, 'geolocation')
})

async function mountAt(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    defaultNotFoundComponent: NotFoundPage,
    scrollRestoration: false,
  })
  await router.load()
  render(<RouterProvider router={router} />)
  await screen.findByLabelText('Search a place or road')
  return router
}

const q = (router: Awaited<ReturnType<typeof mountAt>>) =>
  (router.state.location.search as { q?: string }).q
const rows = () => [...document.querySelectorAll<HTMLElement>('.traveller-result-row')]
const rowTitles = () => rows().map((row) => row.querySelector('h2')?.textContent ?? '')
const storedRecent = () =>
  JSON.parse(window.localStorage.getItem(STORAGE_KEYS.recentSearches) ?? '[]') as { query: string }[]
const data = { segments: SEGMENTS, corridors: CORRIDORS, places: PLACES, advisories: getAdvisories() }

describe('searchSegments', () => {
  const ids = (query: string) => searchSegments(query, data).map((m) => m.segment.id)

  it('matches segment ID, road code, place (English and Hindi), district and corridor', () => {
    expect(ids('nh7-06')).toEqual(['nh7-06'])
    expect(ids('SH-MSR')).toEqual(['msr-01'])
    expect(ids('Joshimath')).toEqual(['nh7-06', 'nh7-07'])
    expect(ids('जोशीमठ')).toEqual(['nh7-06', 'nh7-07'])
    expect(ids('Rishikesh Badrinath')).toEqual(SEGMENTS.filter((s) => s.corridorId === 'nh7').map((s) => s.id))
    expect(ids('Pithoragarh')).toEqual(expect.arrayContaining(['pth-03', 'nh9-03']))
    expect(searchSegments('Joshimath', data).every((m) => m.road)).toBe(true)
  })

  it('matches report text without counting it as a road match', () => {
    const matches = searchSegments('Pipalkoti', data)
    expect(matches.map((m) => m.segment.id)).toEqual(['nh7-06'])
    expect(matches[0]).toMatchObject({ road: false, hazard: true })
  })

  it('returns nothing for blank or unknown text', () => {
    expect(ids('   ')).toEqual([])
    expect(ids('not-a-road')).toEqual([])
  })
})

describe('/traveller search', () => {
  it('filters as you type after a debounce, without saving every keystroke', async () => {
    const router = await mountAt('/traveller')
    const navigate = vi.spyOn(router, 'navigate')
    const input = screen.getByLabelText('Search a place or road')

    for (const partial of ['n', 'nh', 'nh7', 'nh7-06']) fireEvent.change(input, { target: { value: partial } })
    // Nothing is committed until typing pauses; the button shows the pending search.
    expect(navigate).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /Searching/ })).toBeEnabled()

    await waitFor(() => expect(q(router)).toBe('nh7-06'), { timeout: SEARCH_DEBOUNCE_MS * 6 })
    expect(navigate).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole('heading', { name: 'Search results' })).toBeVisible()
    expect(rowTitles()).toEqual([expect.stringContaining('Chamoli – Joshimath')])
    // Typing keeps the cursor in the search box across the layout change.
    await waitFor(() => expect(screen.getByLabelText('Search a place or road')).toHaveFocus())
    expect(storedRecent()).toEqual([])

    // Changing the text updates the results again.
    fireEvent.change(screen.getByLabelText('Search a place or road'), { target: { value: 'Joshimath' } })
    expect(screen.getByRole('status')).toHaveTextContent('Searching road information')
    await waitFor(() => expect(rows()).toHaveLength(2), { timeout: SEARCH_DEBOUNCE_MS * 6 })
  }, TIMEOUT)

  it('All / Roads / Hazards pills filter the matches', async () => {
    await mountAt('/traveller?q=Chamoli')
    await screen.findByRole('heading', { name: 'Search results' })
    const pills = within(screen.getByRole('group', { name: 'Filter results' }))
    const all = rows().length
    expect(all).toBeGreaterThan(1)
    expect(pills.getByRole('button', { name: /^All/ })).toHaveAttribute('aria-pressed', 'true')
    expect(pills.getByRole('button', { name: /^All/ })).toHaveTextContent(String(all))

    fireEvent.click(pills.getByRole('button', { name: /^Hazards/ }))
    expect(pills.getByRole('button', { name: /^Hazards/ })).toHaveAttribute('aria-pressed', 'true')
    const hazardRows = rows()
    expect(hazardRows.length).toBeGreaterThan(0)
    expect(hazardRows.length).toBeLessThan(all)
    for (const row of hazardRows) {
      expect(row.textContent).toMatch(/Community evidence|Official restriction/)
    }

    fireEvent.click(pills.getByRole('button', { name: /^Roads/ }))
    expect(rows()).toHaveLength(all)
    fireEvent.click(pills.getByRole('button', { name: /^All/ }))
    expect(rows()).toHaveLength(all)
  }, TIMEOUT)

  it('Roads shows an explicit empty state when only report text matched', async () => {
    await mountAt('/traveller?q=Pipalkoti')
    await screen.findByRole('heading', { name: 'Search results' })
    expect(rows()).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: /^Roads/ }))
    expect(rows()).toHaveLength(0)
    expect(screen.getByText('No road matches for this search.')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Show all 1 results' }))
    expect(rows()).toHaveLength(1)
  }, TIMEOUT)

  it('View details opens the segment detail page', async () => {
    const router = await mountAt('/traveller?q=nh7-06')
    await screen.findByRole('heading', { name: 'Search results' })
    const link = within(rows()[0]).getByRole('link', { name: /View details/ })
    expect(link).toHaveAttribute('href', '/advisories/nh7-06')
    fireEvent.click(link)
    await waitFor(() => expect(router.state.location.pathname).toBe('/advisories/nh7-06'))
  }, TIMEOUT)

  it('shows the no-results state for unknown text', async () => {
    await mountAt('/traveller?q=zzzz-no-road')
    expect(await screen.findByText('No matching reports found.')).toBeVisible()
  }, TIMEOUT)

  it('shows the error state when a typed search fails, and Try again recovers', async () => {
    const router = await mountAt('/traveller?q=SH-MSR')
    await screen.findByRole('heading', { name: 'Search results' })
    const realNavigate = router.navigate.bind(router)
    const navigate = vi.spyOn(router, 'navigate').mockRejectedValueOnce(new Error('synthetic failure'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    fireEvent.change(screen.getByLabelText('Search a place or road'), { target: { value: 'Joshimath' } })
    expect(await screen.findByRole('alert')).toHaveTextContent('Search could not be completed.')

    navigate.mockImplementation(realNavigate)
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    await waitFor(() => expect(q(router)).toBe('Joshimath'))
    await waitFor(() => expect(rows()).toHaveLength(2))
  }, TIMEOUT)
})

describe('/traveller current location', () => {
  const mockGeolocation = (impl: (ok: PositionCallback, fail: PositionErrorCallback) => void) => {
    const geolocation = { getCurrentPosition: vi.fn(impl) }
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: geolocation })
    return geolocation
  }

  it('asks the browser and, when allowed, searches the nearest covered place', async () => {
    const joshimath = PLACES.find((p) => p.id === 'joshimath')!
    const geolocation = mockGeolocation((ok) =>
      ok({ coords: { latitude: joshimath.lat + 0.01, longitude: joshimath.lon, accuracy: 40 } } as GeolocationPosition),
    )
    const router = await mountAt('/traveller')
    fireEvent.click(screen.getByRole('button', { name: 'Use current location' }))

    expect(geolocation.getCurrentPosition).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(q(router)).toBe('Joshimath'))
    expect(await screen.findByText(/Showing road sections at Joshimath, the nearest covered place/)).toBeVisible()
    await waitFor(() => expect(rows()).toHaveLength(2))
    expect(storedRecent()[0]?.query).toBe('Joshimath')
  }, TIMEOUT)

  it('when denied, explains it and keeps manual search ready', async () => {
    mockGeolocation((_ok, fail) => fail({ code: 1, PERMISSION_DENIED: 1 } as GeolocationPositionError))
    await mountAt('/traveller')
    fireEvent.click(screen.getByRole('button', { name: 'Use current location' }))

    expect(await screen.findByText('Location permission denied. Search manually instead.')).toBeVisible()
    expect(screen.getByLabelText('Search a place or road')).toHaveFocus()
    expect(screen.getByRole('heading', { name: 'Where are you travelling?' })).toBeVisible()
  }, TIMEOUT)

  it('explains when the browser has no location support', async () => {
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: undefined })
    await mountAt('/traveller')
    fireEvent.click(screen.getByRole('button', { name: 'Use current location' }))
    expect(await screen.findByText('Location is unavailable. You can still search manually.')).toBeVisible()
  }, TIMEOUT)
})

describe('/traveller recent searches', () => {
  it('saves submitted searches in the store; they can be reopened and cleared', async () => {
    const router = await mountAt('/traveller')
    fireEvent.change(screen.getByLabelText('Search a place or road'), { target: { value: 'SH-MSR' } })
    fireEvent.submit(screen.getByLabelText('Search a place or road').closest('form')!)
    await waitFor(() => expect(storedRecent().map((r) => r.query)).toEqual(['SH-MSR']))

    fireEvent.click(screen.getByRole('button', { name: 'Back to search' }))
    const recent = within(await screen.findByRole('region', { name: 'Recent searches' }))
    fireEvent.click(recent.getByRole('button', { name: 'SH-MSR' }))
    await waitFor(() => expect(q(router)).toBe('SH-MSR'))
    expect(await screen.findByRole('heading', { name: 'Search results' })).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Back to search' }))
    const again = within(await screen.findByRole('region', { name: 'Recent searches' }))
    fireEvent.click(again.getByRole('button', { name: 'Clear' }))
    expect(again.queryByRole('button', { name: 'SH-MSR' })).not.toBeInTheDocument()
    expect(storedRecent()).toEqual([])
  }, TIMEOUT)

  it('loads searches already saved on this device', async () => {
    window.localStorage.setItem(
      STORAGE_KEYS.recentSearches,
      JSON.stringify([{ query: 'Joshimath', at: 1 }]),
    )
    await mountAt('/traveller')
    const recent = within(screen.getByRole('region', { name: 'Recent searches' }))
    expect(await recent.findByRole('button', { name: 'Joshimath' })).toBeVisible()
  }, TIMEOUT)
})
