import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = join(process.cwd(), 'src')
const read = (p: string) => readFileSync(join(SRC, p), 'utf8')
const styles = read('styles.css')

const OVERLAY_TOKENS = ['--photo-scrim-a', '--photo-scrim-b', '--photo-scrim-c', '--photo-scrim-flat']

/** Custom properties declared in every rule whose selector list contains `selector`. */
function declared(selector: string) {
  const out: Record<string, string> = {}
  const re = /(^|\n)([^{}\n]*(?:\r?\n[^{}\n]*)*?)\{([^{}]*)\}/g
  for (const m of styles.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(re)) {
    if (!m[2].split(',').map((s) => s.trim()).includes(selector)) continue
    for (const d of m[3].matchAll(/(--[\w-]+):\s*([^;]+);/g)) out[d[1]] = d[2].trim()
  }
  return out
}

/** Tokens a .photo-surface resolves to under the active theme (html.dark or not). */
function resolve(dark: boolean) {
  return { ...declared(':root'), ...(dark ? declared('.dark') : {}) }
}

const alpha = (v: string) => Number(/\/\s*(\d+)%/.exec(v)?.[1])
const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => {
    const x = parseInt(hex.slice(i, i + 2), 16) / 255
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe('photo hero overlays follow the theme', () => {
  it('toggling the theme changes the hero overlay token and the text token', () => {
    const light = resolve(false)
    const dark = resolve(true)
    for (const token of [...OVERLAY_TOKENS, '--photo-text', '--text-on-charcoal']) {
      expect(light[token], `${token} light`).toBeTruthy()
      expect(dark[token], `${token} dark`).toBeTruthy()
      expect(light[token], `${token} must differ between themes`).not.toBe(dark[token])
    }
    // Dark: navy overlay, ivory text. Light: warm ivory overlay, charcoal text.
    expect(dark['--photo-scrim-a']).toMatch(/^rgb\(3 15 22/)
    expect(dark['--photo-text']).toBe('#f6f4ec')
    expect(light['--photo-scrim-a']).toMatch(/^rgb\(250 247 238/)
    expect(light['--photo-text']).toBe('#1b2326')
    // .photo-surface is no longer pinned to the dark palette.
    expect(declared('.photo-surface')['--background']).toBeUndefined()
  })

  it('light overlay is a soft gradient: 55-70%+ at the text edge, 10-15% far side', () => {
    const light = resolve(false)
    expect(alpha(light['--photo-scrim-a'])).toBeGreaterThanOrEqual(55)
    expect(alpha(light['--photo-scrim-a'])).toBeLessThanOrEqual(75)
    expect(alpha(light['--photo-scrim-c'])).toBeGreaterThanOrEqual(10)
    expect(alpha(light['--photo-scrim-c'])).toBeLessThanOrEqual(15)
  })

  it('light-theme text on the overlay keeps AA contrast, even over black photo', () => {
    const light = resolve(false)
    // Worst case: a pure black photo pixel under the text-side overlay (72% ivory).
    const a = alpha(light['--photo-scrim-a']) / 100
    const mix = (ch: number) => Math.round(250 * a + ch * (1 - a))
    const bg = `#${[mix(0), mix(0), mix(0)].map((n) => n.toString(16).padStart(2, '0')).join('')}`
    expect(ratio(light['--photo-text'], bg)).toBeGreaterThanOrEqual(4.5)
    expect(ratio(light['--blue-on-dark'], bg)).toBeGreaterThanOrEqual(4.5)
    expect(ratio(light['--orange-on-dark'], bg)).toBeGreaterThanOrEqual(4.5)
    expect(ratio(light['--primary-foreground'], light['--primary'])).toBeGreaterThanOrEqual(4.5)
  })

  it('every photo section uses the overlay tokens and never washes the photo', () => {
    const banners: Array<[string, string]> = [
      ['components/page-banner.css', '.rp-info-banner'],
      ['routes/help.css', '.help-banner'],
      ['routes/advisories.index.css', '.advisories-list-banner'],
      ['routes/traveller.css', '.traveller-results-banner'],
      ['routes/home.css', '.home-hero-overlay'],
    ]
    for (const [file, selector] of banners) {
      const rule =
        [...read(file).matchAll(new RegExp(`\\n${selector.replace('.', '\\.')} \\{[^}]*\\}`, 'g'))]
          .map((m) => m[0])
          .find((r) => r.includes('background')) ?? ''
      expect(rule, `${file} ${selector}`).toContain('var(--photo-scrim-a)')
      expect(rule, `${file} ${selector}`).not.toMatch(/opacity|blur|mix-blend|backdrop|filter/)
    }
    const tsx: Array<[string, string]> = [
      ['components/page-banner.tsx', 'photo-surface'],
      ['routes/index.tsx', 'home-hero photo-surface'],
      ['routes/help.tsx', 'help-banner photo-surface'],
      ['routes/advisories.index.tsx', 'advisories-list-banner photo-surface'],
      ['routes/advisories.$segmentId.tsx', 'photo-surface'],
      ['routes/traveller.tsx', 'traveller-results-banner photo-surface'],
    ]
    for (const [file, needle] of tsx) expect(read(file), file).toContain(needle)
    expect(styles).not.toMatch(/\.photo-surface[^{]*\{[^}]*(opacity|filter|backdrop|mix-blend|color-scheme)/)
  })
})
