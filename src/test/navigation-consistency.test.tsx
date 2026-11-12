import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { routeTree } from '@/routeTree.gen'
import { NotFoundPage } from '@/components/error-pages'
import { activeNavTarget } from '@/components/site-chrome'

const PRIMARY = [
  ['Home', '/'],
  ['Search roads', '/traveller'],
  ['Live Map', '/map'],
  ['Advisories', '/advisories'],
  ['Help', '/help'],
] as const

const BOTTOM = [
  ['Home', '/'],
  ['Search roads', '/traveller'],
  ['Report Hazard', '/report'],
  ['Live Map', '/map'],
  ['Advisories', '/advisories'],
] as const

/** Every route that must show the shared header, with the nav item expected to be active. */
const ROUTES: { path: string; active: string | null }[] = [
  { path: '/', active: '/' },
  { path: '/traveller', active: '/traveller' },
  { path: '/map', active: '/map' },
  { path: '/advisories', active: '/advisories' },
  { path: '/advisories/nh7-06', active: '/advisories' },
  { path: '/help', active: '/help' },
  { path: '/about', active: '/about' },
  { path: '/contact', active: '/contact' },
  { path: '/reports', active: '/reports' },
  { path: '/report', active: '/report' },
  { path: '/no-such-page', active: null },
]

afterEach(cleanup)

async function mountAt(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    defaultNotFoundComponent: NotFoundPage,
    scrollRestoration: false,
  })
  await router.load()
  const rendered = render(<RouterProvider router={router} />, {
    container: document as unknown as HTMLElement,
  })
  // Wait until the shell is on screen.
  await waitFor(() => siteHeader())
  return { router, ...rendered }
}

/**
 * The site header. Testing Library reports every <header> as a banner, but
 * page title headers live inside <main> and are not banner landmarks there.
 */
function siteHeader() {
  const banners = screen.getAllByRole('banner').filter((el) => !el.closest('main'))
  expect(banners).toHaveLength(1)
  return banners[0]
}

const linkPairs = (nav: HTMLElement) =>
  within(nav)
    .getAllByRole('link')
    .map((link) => [link.textContent?.trim(), new URL(link.getAttribute('href')!, 'http://x').pathname])

const currentHref = (nav: HTMLElement) =>
  within(nav)
    .queryAllByRole('link')
    .filter((link) => link.getAttribute('aria-current') === 'page')
    .map((link) => new URL(link.getAttribute('href')!, 'http://x').pathname)

describe('shared site navigation', () => {
  it.each(ROUTES)(
    '$path shows the same header, links and order',
    async ({ path, active }) => {
      await mountAt(path)

      // Exactly one site header, and it comes before the page content.
      const header = siteHeader()
      expect(document.body.querySelector('header, nav, main')).toBe(header)

      // Only the shared navigation landmarks exist; pages add no navs or sidebars of their own.
      const navNames = screen
        .getAllByRole('navigation')
        .map((nav) => nav.getAttribute('aria-label'))
      expect(navNames.filter((name) => name !== 'Footer')).toEqual(['Primary', 'Quick navigation'])

      const primary = within(header).getByRole('navigation', { name: 'Primary' })
      expect(linkPairs(primary)).toEqual(PRIMARY.map(([label, href]) => [label, href]))

      const bottom = screen.getByRole('navigation', { name: 'Quick navigation' })
      expect(linkPairs(bottom)).toEqual(BOTTOM.map(([label, href]) => [label, href]))

      // Right-hand controls, in order: language, theme, Community Login, Report Hazard.
      const controls = [
        within(header).getByRole('group', { name: 'Language' }),
        within(header).getByRole('button', { name: /theme/i }),
        within(header).getByRole('button', { name: 'Community Login' }),
        within(header).getAllByRole('link', { name: 'Report Hazard' })[0],
      ]
      for (let i = 1; i < controls.length; i++) {
        expect(
          controls[i - 1].compareDocumentPosition(controls[i]) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy()
      }
      const reportLinks = within(header).getAllByRole('link', { name: 'Report Hazard' })
      expect(reportLinks).toHaveLength(2)
      expect(reportLinks.map((link) => link.getAttribute('href'))).toEqual(['/report', '/report'])
      expect(within(header).getByRole('button', { name: 'Open menu' })).toBeInTheDocument()

      // Active item follows the route.
      const expectedPrimary = PRIMARY.some(([, href]) => href === active) ? [active] : []
      expect(currentHref(primary)).toEqual(expectedPrimary)
      expect(currentHref(bottom)).toEqual(active && BOTTOM.some(([, href]) => href === active) ? [active] : [])
    },
    30_000,
  )

  it('maps routes to the active nav item', () => {
    expect(activeNavTarget('/')).toBe('/')
    expect(activeNavTarget('/advisories/')).toBe('/advisories')
    expect(activeNavTarget('/advisories/RP-418203')).toBe('/advisories')
    expect(activeNavTarget('/help/freshness')).toBe('/help')
    expect(activeNavTarget('/report/review')).toBe('/report')
    expect(activeNavTarget('/check', 'list')).toBe('/advisories')
    expect(activeNavTarget('/check')).toBe('/map')
    expect(activeNavTarget('/contact')).toBe('/contact')
    expect(activeNavTarget('/reports')).toBe('/reports')
  })

  // The mobile menu's contents, Escape and close-on-route-change are covered on the
  // header in isolation in src/components/site-chrome.a11y.test.tsx.
})
