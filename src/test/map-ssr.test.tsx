// @vitest-environment node
// The interactive map must not break server rendering: Leaflet needs `window`,
// so it may only load in the browser after mount.
import { renderToString } from 'react-dom/server'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { describe, expect, it } from 'vitest'
import { routeTree } from '@/routeTree.gen'

describe('map pages render on the server without Leaflet', () => {
  it.each(['/map', '/traveller', '/traveller?q=Joshimath', '/advisories/nh7-06', '/advisories/RP-418203'])(
    '%s',
    async (path) => {
      expect(typeof window).toBe('undefined')
      const router = createRouter({
        routeTree,
        history: createMemoryHistory({ initialEntries: [path] }),
        isServer: true,
      })
      await router.load()
      const html = renderToString(<RouterProvider router={router} />)

      // The map frame, its labels and the legend are server-rendered...
      expect(html).toContain('data-testid="leaflet-map"')
      expect(html).toContain('Prototype mockup, synthetic data')
      expect(html).toContain('Road lines: approximate, synthetic data')
      // ...but no Leaflet DOM, which only exists after the client loads it.
      expect(html).not.toContain('leaflet-container')
      if (!path.startsWith('/advisories/RP-')) {
        for (const text of ['Reported hazard', 'Official restriction', 'Unknown information']) {
          expect(html).toContain(text)
        }
      }
    },
    30_000,
  )
})
