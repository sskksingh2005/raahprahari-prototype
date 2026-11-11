import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { routeTree } from '@/routeTree.gen'
import { NotFoundPage } from '@/components/error-pages'
import { helpTopics } from '@/data/help-topics'
import { SEGMENTS } from '@/data/fixtures'

afterEach(cleanup)

async function mountHome() {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
    defaultNotFoundComponent: NotFoundPage,
    scrollRestoration: false,
  })
  await router.load()
  render(<RouterProvider router={router} />)
  const main = await waitFor(() => {
    const el = document.getElementById('main')
    if (!el?.querySelector('h1')) throw new Error('home not rendered')
    return el
  })
  return { router, main }
}

const pathOf = (link: HTMLElement) => new URL(link.getAttribute('href')!, 'http://x').pathname

describe('home page links', () => {
  it.each([
    ['Check a road', '/traveller'],
    ['Report a hazard', '/report'],
  ])('"%s" opens %s', async (name, target) => {
    const { router, main } = await mountHome()
    const link = within(main).getByRole('link', { name: new RegExp(name, 'i') })
    expect(pathOf(link)).toBe(target)
    fireEvent.click(link)
    await waitFor(() => expect(router.state.location.pathname).toBe(target))
  }, 30_000)

  it('the sample advisory card opens its real segment detail', async () => {
    const { router, main } = await mountHome()
    const card = main.querySelector<HTMLAnchorElement>('.home-advisory a')
    if (!card) throw new Error('Missing home advisory card link')
    const segmentId = pathOf(card).replace('/advisories/', '')
    const segment = SEGMENTS.find((s) => s.id === segmentId)
    expect(segment, `card links to unknown segment "${segmentId}"`).toBeDefined()
    // The card shows that same segment's road code.
    expect(card).toHaveTextContent(segment!.code)

    fireEvent.click(card)
    await waitFor(() => expect(router.state.location.pathname).toBe(`/advisories/${segmentId}`))
    expect(await screen.findByRole('heading', { level: 1, name: new RegExp(segment!.code.split(' · ')[0]) })).toBeVisible()
  }, 30_000)

  it('each feature strip item opens an existing help topic', async () => {
    const { main } = await mountHome()
    const strip = within(main).getByRole('list', { name: 'RaahPrahari features' })
    const items = within(strip).getAllByRole('listitem')
    expect(items).toHaveLength(3)
    const slugs = helpTopics.map((topic) => topic.slug as string)
    const targets = items.map((item) => pathOf(within(item).getByRole('link')))
    expect(targets).toEqual(['/help/report', '/help/freshness', '/help/map-offline'])
    for (const target of targets) {
      expect(slugs).toContain(target.replace('/help/', ''))
    }
  }, 30_000)

  it('has no dead controls in the page content', async () => {
    const { main } = await mountHome()
    // Every action on the home page is a real link; there are no inert buttons.
    expect(within(main).queryAllByRole('button')).toEqual([])
    for (const link of within(main).getAllByRole('link')) {
      const href = link.getAttribute('href') ?? ''
      expect(href, `${link.textContent} has no destination`).toMatch(/^\/[^#]*/)
    }
  }, 30_000)
})
