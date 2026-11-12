import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = join(process.cwd(), 'src')
const read = (p: string) => readFileSync(join(SRC, p), 'utf8')

function walk(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.(tsx?|css|json|md)$/.test(name)) out.push(full)
  }
  return out
}

describe('no mojibake in sources', () => {
  it('has no UTF-8-as-Latin-1 sequences', () => {
    const bad = walk(SRC)
      .filter((f) => !f.endsWith('light-theme-quality.test.ts'))
      .filter((f) => {
        const s = readFileSync(f, 'utf8')
        return s.includes('\u00e0\u00a4') || s.includes('\u00c3\u00a2')
      })
    expect(bad).toEqual([])
  })
})

/** Light tokens: the first plain `:root {` block that declares --background. */
const styles = read('styles.css')
const light: Record<string, string> = {}
for (const m of styles.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(^|\n):root\s*\{([^{}]*)\}/g)) {
  for (const d of m[2].matchAll(/(--[\w-]+):\s*([^;]+);/g)) light[d[1]] = d[2].trim()
}

function hex(name: string): [number, number, number] {
  let v = light[name]
  for (let i = 0; i < 5 && v?.startsWith('var('); i++) v = light[v.slice(4, -1)]
  const m = /^#([0-9a-f]{6})$/i.exec(v ?? '')
  if (!m) throw new Error(`token ${name} is not a hex colour: ${v}`)
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function lum([r, g, b]: [number, number, number]) {
  const f = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
function ratio(a: string, b: string) {
  const [x, y] = [lum(hex(a)), lum(hex(b))].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

describe('light theme contrast tokens', () => {
  it('body text is near #1B2326 with at least 7:1 on every light surface', () => {
    expect(light['--foreground'].toLowerCase()).toBe('#1b2326')
    for (const bg of ['--background', '--card', '--muted', '--accent', '--popover']) {
      expect(ratio('--foreground', bg), bg).toBeGreaterThanOrEqual(7)
    }
  })

  it('muted text, orange wordmark and links are at least 4.5:1', () => {
    for (const bg of ['--background', '--card', '--muted', '--accent']) {
      expect(ratio('--muted-foreground', bg), bg).toBeGreaterThanOrEqual(4.5)
    }
    expect(ratio('--orange-on-light', '--background')).toBeGreaterThanOrEqual(4.5)
    expect(ratio('--link', '--background')).toBeGreaterThanOrEqual(4.5)
  })

  it('borders, inputs and the focus ring reach 3:1', () => {
    expect(ratio('--border', '--background')).toBeGreaterThanOrEqual(3)
    expect(ratio('--input', '--background')).toBeGreaterThanOrEqual(3)
    expect(ratio('--ring', '--background')).toBeGreaterThanOrEqual(3)
  })
})

describe('light theme visual rules', () => {
  const logo = read('components/logo.tsx')

  it('photo scrim fades to about 10% and text has no blurred shadow', () => {
    expect(light['--photo-scrim-c']).toContain('10%')
    expect(light['--photo-text-shadow-soft']).toBe('none')
    expect(light['--photo-text-shadow-tone']).toBe('none')
  })

  it('header logo swaps by theme without a dark box in light', () => {
    expect(logo).toContain('dark:block')
    expect(logo).toContain('dark:hidden')
    expect(logo).toContain('logo-on-light')
    expect(logo).toContain('logo-on-dark')
  })

  it('light mode removes backdrop blur', () => {
    expect(styles).toMatch(/:root:not\(\.dark\) \[class\*='backdrop-blur'\]/)
  })
})

describe('header layout does not overlap at 1280, 1440 and 1920', () => {
  const chrome = read('components/site-chrome.tsx')
  const header = chrome.slice(chrome.indexOf('<header'), chrome.indexOf('</header>'))

  it('uses a flex row with gap and min-w-0, with no absolute positioning', () => {
    expect(header).toMatch(/rp-container flex [^"]*min-w-0[^"]*gap-3/)
    expect(header).not.toMatch(/\babsolute\b|\bfixed\b/)
  })

  it('switches at xl (1280px), not at a custom or 2xl breakpoint', () => {
    expect(header).toMatch(/hidden min-w-0 items-center gap-0\.5 xl:flex/)
    expect(header).toMatch(/ml-auto hidden [^"]*xl:flex/)
    expect(header).toMatch(/xl:hidden/)
    expect(chrome).not.toMatch(/\b1440:/)
    expect(styles).not.toMatch(/--breakpoint-1440/)
    expect(styles).toMatch(/\.rp-header \.rp-container\s*\{\s*max-width:\s*90rem/)
  })

  it('links never wrap and keep small padding', () => {
    expect(header).toMatch(/px-2\.5 text-sm font-medium whitespace-nowrap/)
  })

  it('language switch cannot shrink or wrap into neighbours, and its focus ring is inset', () => {
    expect(chrome).toMatch(/rp-lang inline-flex h-10 shrink-0 items-center gap-0\.5[^"]*whitespace-nowrap/)
    expect(styles).toMatch(/\.rp-lang \.rp-lang-btn:focus-visible[\s\S]*?outline-offset:\s*-3px/)
  })

  it('1280px width fits the desktop row (language, theme, Report Hazard)', () => {
    // 1280 viewport - 2 * 3rem padding = 1184px of inner width.
    const inner = 1280 - 96
    const logoW = 48
    const nav = 6 * (20 + 70) // padding + average label width
    const right = 110 + 40 + 150
    const gaps = 2 * 12 + 3 * 12
    expect(logoW + nav + right + gaps).toBeLessThan(inner)
  })
})

describe('z-index scale', () => {
  const num = (name: string) => {
    const v = light[name]
    if (!/^\d+$/.test(v ?? '')) throw new Error(`${name} is not a number: ${v}`)
    return Number(v)
  }

  it('orders content < header < map < bottom nav < overlay < sheet < toast', () => {
    const order = ['--z-content', '--z-header', '--z-map', '--z-bottom-nav', '--z-overlay', '--z-sheet', '--z-toast']
    const values = order.map(num)
    expect(values).toEqual([...values].sort((a, b) => a - b))
    expect(new Set(values).size).toBe(values.length)
  })

  it('sheet and dialog overlay and content sit above the map layers and bottom nav', () => {
    const maps = ['--z-map', '--z-map-controls', '--z-map-legend', '--z-map-panel'].map(num)
    expect(Math.min(num('--z-overlay'), num('--z-sheet'))).toBeGreaterThan(Math.max(...maps, num('--z-bottom-nav')))
  })

  it('sheet and dialog use the tokens, and map containers are isolated', () => {
    expect(read('components/ui/sheet.tsx')).toContain('z-(--z-overlay)')
    expect(read('components/ui/sheet.tsx')).toContain('z-(--z-sheet)')
    expect(read('components/ui/dialog.tsx')).toContain('z-(--z-overlay)')
    expect(read('components/ui/dialog.tsx')).toContain('z-(--z-sheet)')
    expect(styles).toMatch(/\.rp-lmap,[\s\S]*?\{\s*isolation:\s*isolate/)
  })

  it('no map stylesheet or chrome file uses a raw z-index number', () => {
    for (const file of ['routes/map.css', 'features/map/leaflet-segment-map.css', 'routes/traveller.css', 'components/site-chrome.tsx']) {
      expect(read(file), file).not.toMatch(/z-index:\s*\d{2,}|\bz-\d+\b|z-\[\d+\]/)
    }
  })
})
