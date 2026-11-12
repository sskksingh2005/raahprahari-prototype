import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { PreferencesProvider, themeBootScript, usePrefs } from '@/i18n/preferences'
import { STORAGE_KEYS } from '@/lib/storage'

const SRC = join(process.cwd(), 'src')
const styles = readFileSync(join(SRC, 'styles.css'), 'utf8')

function block(selector: string): Record<string, string> {
  const out: Record<string, string> = {}
  // `.dark` blocks are shared with `.photo-surface` (`.dark,\n.photo-surface {`).
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const head = new RegExp(`\\n${escaped}(?:,\\r?\\n\\.photo-surface)? \\{`, 'g')
  for (const found of styles.matchAll(head)) {
    const start = found.index
    const body = styles.slice(start, styles.indexOf('\n}', start))
    for (const m of body.matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)) out[m[1]] = m[2].trim()
  }
  return out
}

// Selector `:root` is matched first in the file; `.dark` is the second theme block with tokens.
const light = block(':root')
const dark = block('.dark')

function luminance(hex: string) {
  const v = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(1 + i, 3 + i), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]
}

function sourceFiles(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      if (name !== 'test') sourceFiles(p, out)
    } else if (/\.(css|tsx|ts)$/.test(name) && !/\.test\.|routeTree\.gen|styles\.css$/.test(name)) {
      out.push(p)
    }
  }
  return out
}

function Probe() {
  const { theme, setTheme } = usePrefs()
  return (
    <div>
      <p data-testid="theme">{theme}</p>
      <button onClick={() => setTheme('light')}>light</button>
      <button onClick={() => setTheme('dark')}>dark</button>
    </div>
  )
}

describe('theme toggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.style.colorScheme = ''
  })

  it('switches the html class and color-scheme and persists the choice', async () => {
    const user = userEvent.setup()
    render(
      <PreferencesProvider>
        <Probe />
      </PreferencesProvider>,
    )
    const html = document.documentElement
    await waitFor(() => expect(html).toHaveClass('dark'))

    await user.click(screen.getByRole('button', { name: 'light' }))
    await waitFor(() => expect(html).not.toHaveClass('dark'))
    expect(html.style.colorScheme).toBe('light')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.theme) ?? 'null')).toBe('light')

    await user.click(screen.getByRole('button', { name: 'dark' }))
    await waitFor(() => expect(html).toHaveClass('dark'))
    expect(html.style.colorScheme).toBe('dark')
  })

  it('boot script applies the saved theme before paint', () => {
    localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify('light'))
    new Function(themeBootScript)()
    expect(document.documentElement).not.toHaveClass('dark')
    expect(document.documentElement.style.colorScheme).toBe('light')

    localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify('dark'))
    new Function(themeBootScript)()
    expect(document.documentElement).toHaveClass('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('keeps a saved light theme on first render instead of flashing dark', async () => {
    localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify('light'))
    render(
      <PreferencesProvider>
        <Probe />
      </PreferencesProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('theme')).toHaveTextContent('light'))
    expect(document.documentElement).not.toHaveClass('dark')
  })
})

describe('theme tokens', () => {
  it('defines different surfaces for light and dark', () => {
    for (const key of ['--background', '--foreground', '--card', '--popover', '--border', '--scrim']) {
      expect(light[key], `${key} in light`).toBeTruthy()
      expect(dark[key], `${key} in dark`).toBeTruthy()
      expect(light[key]).not.toBe(dark[key])
    }
    expect(luminance(light['--background'])).toBeGreaterThan(0.5)
    expect(luminance(dark['--background'])).toBeLessThan(0.05)
    expect(luminance(light['--foreground'])).toBeLessThan(0.1)
    expect(luminance(dark['--foreground'])).toBeGreaterThan(0.5)
  })

  it('defines every --tone token for both themes with a light surface in light mode', () => {
    const tones = Object.keys(dark).filter((k) => k.startsWith('--tone-'))
    expect(tones.length).toBeGreaterThan(100)
    for (const k of tones) expect(light[k], k).toBeTruthy()
    expect(luminance(light['--tone-07151f'])).toBeGreaterThan(0.6)
    expect(luminance(dark['--tone-07151f'])).toBeLessThan(0.02)
  })

  it('has status colours that are never green', () => {
    for (const theme of [light, dark]) {
      for (const k of ['--status-unknown', '--status-stale']) {
        const hex = theme[k]
        const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
        expect(g > r + 20 && g > b + 20, `${k} ${hex}`).toBe(false)
      }
    }
  })
})

describe('no fixed colours outside the token file', () => {
  const files = sourceFiles(SRC)

  it('has no hex or rgb literals in css', () => {
    const offenders: string[] = []
    for (const f of files.filter((p) => p.endsWith('.css'))) {
      const text = readFileSync(f, 'utf8')
      if (/#[0-9a-fA-F]{3,8}\b|\brgba?\(/.test(text)) offenders.push(f)
    }
    expect(offenders).toEqual([])
  })

  it('has no fixed dark background utilities in components', () => {
    const bad = /\bbg-(black|slate-\d+|zinc-\d+|gray-\d+|neutral-\d+)\b|\bbg-\[#[0-9a-fA-F]+\]|\bbg-white\b|\bborder-white\b|\btext-white\b/
    const offenders: string[] = []
    for (const f of files.filter((p) => /\.tsx$/.test(p))) {
      if (bad.test(readFileSync(f, 'utf8'))) offenders.push(f)
    }
    expect(offenders).toEqual([])
  })
})
