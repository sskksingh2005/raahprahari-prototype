import { readFileSync } from 'node:fs'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { crossFadeTheme, prefersReducedMotion } from '@/components/motion'
import { Button, buttonVariants } from '@/components/ui/button'
import { Field, CharCounter } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SkeletonList } from '@/components/ui/skeleton'

const css = readFileSync('src/styles.css', 'utf8').replace(/\r\n/g, '\n')
const rootSource = readFileSync('src/routes/__root.tsx', 'utf8')

/** The global prefers-reduced-motion block (the boot/route-progress block after it is local). */
function reducedBlock() {
  const start = css.lastIndexOf('@media (prefers-reduced-motion: reduce)', css.indexOf('animation: none !important'))
  expect(start).toBeGreaterThan(-1)
  return css.slice(start)
}

function mockMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    onchange: null,
  }))
}

afterEach(() => {
  // @ts-expect-error restore jsdom default (no matchMedia)
  delete window.matchMedia
  document.documentElement.className = ''
})

describe('motion tokens', () => {
  it('defines duration, easing, scale and shadow tokens once, in the token file', () => {
    for (const token of [
      '--motion-fast: 120ms',
      '--motion-base: 200ms',
      '--motion-slow: 350ms',
      '--ease-out:',
      '--scale-hover:',
      '--scale-press: 0.97',
      '--shadow-1:',
      '--shadow-3:',
      '--primary-hover:',
      '--report-hover:',
      '--secondary-hover:',
    ]) {
      expect(css).toContain(token)
    }
  })

  it('keeps every one-shot duration at or below 500ms (hero zoom and loops excepted)', () => {
    const ms = [...css.matchAll(/--motion-(fast|base|slow|max):\s*(\d+)ms/g)].map((m) => Number(m[2]))
    expect(ms.length).toBe(4)
    expect(Math.max(...ms)).toBeLessThanOrEqual(500)
    const infinite = [...css.matchAll(/animation:[^;]*infinite[^;]*;/g)].map((m) => m[0])
    // Skeleton shimmer and the boot-screen logo pulse (disabled under reduced motion).
    expect(infinite).toHaveLength(2)
    expect(infinite.some((a) => a.includes('rp-shimmer'))).toBe(true)
    expect(infinite.some((a) => a.includes('rp-boot-pulse'))).toBe(true)
  })

  it('animates only transform properties and opacity inside keyframes', () => {
    const frames = [...css.matchAll(/@keyframes [\w-]+ \{([\s\S]*?)\n\}/g)].map((m) => m[1])
    expect(frames.length).toBeGreaterThan(8)
    const allowed = new Set(['opacity', 'translate', 'scale', 'rotate', 'transform', 'visibility'])
    for (const body of frames) {
      for (const [, prop] of body.matchAll(/^\s+([a-z-]+):/gm)) {
        expect(allowed.has(prop), `keyframe property ${prop}`).toBe(true)
      }
    }
  })
})

describe('reduced motion', () => {
  it('disables animations, transforms, zoom, stagger and pulses; only instant colour changes stay', () => {
    const block = reducedBlock()
    expect(block).toMatch(/animation:\s*none\s*!important/)
    expect(block).toMatch(/transition-duration:\s*0\.01ms\s*!important/)
    expect(block).toMatch(/translate:\s*none\s*!important/)
    expect(block).toMatch(/scale:\s*none\s*!important/)
    for (const hook of ['.rp-card', '.rp-interactive', '.rp-hero-zoom', '[data-reveal-state]', '.rp-attn::after']) {
      expect(block).toContain(hook)
    }
    // Hover/press transforms are only declared outside the reduced block.
    expect(block).not.toContain('--lift-hover')
  })

  it('only smooth-scrolls when motion is allowed', () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*html \{\s*scroll-behavior: smooth/)
  })

  it('reports the preference and skips the theme cross-fade when reduced', () => {
    mockMotion(true)
    expect(prefersReducedMotion()).toBe(true)
    crossFadeTheme()
    expect(document.documentElement.classList.contains('rp-theme-fade')).toBe(false)
    mockMotion(false)
    expect(prefersReducedMotion()).toBe(false)
    crossFadeTheme()
    expect(document.documentElement.classList.contains('rp-theme-fade')).toBe(true)
  })
})

describe('buttons keep their focus rings', () => {
  const variants = ['default', 'report', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const

  it.each(variants)('%s variant has a focus-visible ring and a not-allowed disabled cursor', (variant) => {
    const classes = buttonVariants({ variant })
    expect(classes).toContain('focus-visible:ring-[3px]')
    expect(classes).toContain('focus-visible:ring-ring/50')
    expect(classes).toContain('disabled:cursor-not-allowed')
    expect(classes).toContain('rp-interactive')
    expect(classes).not.toMatch(/(^|\s)outline-none(\s|$)(?!.*focus-visible:ring)/)
  })

  it('does not lift or shadow on hover while focused, disabled or loading', () => {
    const hover = css.match(/\.rp-interactive:not\(:disabled\)[^{]*:hover \{[^}]*\}/)
    expect(hover?.[0]).toBeDefined()
    for (const guard of [':not(:focus-visible)', ':not([data-loading=\'true\'])', ':not([aria-disabled=\'true\'])']) {
      expect(hover?.[0]).toContain(guard)
    }
    expect(css).toMatch(/@media \(hover: hover\) and \(pointer: fine\)/)
  })

  it('never removes the global focus-visible outline', () => {
    expect(css).toMatch(/:focus-visible \{\s*outline: 3px solid var\(--ring\)/)
    expect(css).not.toMatch(/:focus-visible[^{]*\{[^}]*outline:\s*none/)
  })

  it('keeps focus on a button after a click and shows a spinner without changing its label', () => {
    const { rerender } = render(<Button>Save road</Button>)
    const button = screen.getByRole('button', { name: 'Save road' })
    button.focus()
    expect(button).toHaveFocus()
    rerender(<Button loading>Save road</Button>)
    const loading = screen.getByRole('button', { name: 'Save road' })
    expect(loading).toBeDisabled()
    expect(loading).toHaveAttribute('aria-busy', 'true')
    expect(loading.querySelector('svg')).not.toBeNull()
    expect(loading).toHaveTextContent('Save road')
  })

  it('fires clicks on enabled buttons only', () => {
    const onClick = vi.fn()
    render(
      <>
        <Button onClick={onClick}>On</Button>
        <Button disabled onClick={onClick}>Off</Button>
      </>,
    )
    fireEvent.click(screen.getByText('On'))
    fireEvent.click(screen.getByText('Off'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('form inputs animate focus with a glow and still show the ring', () => {
    render(
      <Field label="Name" error="Required">
        <Input />
      </Field>,
    )
    const input = screen.getByLabelText('Name')
    expect(input).toHaveClass('rp-field', 'focus-visible:ring-[3px]')
    expect(screen.getByRole('alert')).toHaveClass('rp-slide-down')
  })

  it('character counters change state near and at the limit', () => {
    const { container, rerender } = render(<CharCounter length={10} max={100} />)
    expect(container.firstElementChild).toHaveAttribute('data-state', 'ok')
    rerender(<CharCounter length={90} max={100} />)
    expect(container.firstElementChild).toHaveAttribute('data-state', 'near')
    rerender(<CharCounter length={100} max={100} />)
    expect(container.firstElementChild).toHaveAttribute('data-state', 'limit')
  })
})

describe('no horizontal overflow from motion', () => {
  it('shifts elements sideways by at most 16px, only in contained components', () => {
    const shifts = [...css.matchAll(/translate:\s*(-?\d+)px\s+0/g)].map((m) => Math.abs(Number(m[1])))
    expect(shifts.length).toBeGreaterThan(0)
    expect(Math.max(...shifts)).toBeLessThanOrEqual(16)
    expect(css).not.toMatch(/\d\s*vw/)
    expect(rootSource).toContain('overflow-x-clip')
  })

  it.each([360, 390, 768, 1440])('renders skeleton and controls without fixed widths at %ipx', (width) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
    const { container } = render(
      <div style={{ width }}>
        <SkeletonList count={3} />
        <Button loading>Search road</Button>
      </div>,
    )
    window.dispatchEvent(new Event('resize'))
    const wide = [...container.querySelectorAll<HTMLElement>('[style]')].filter(
      (el) => el !== container.firstElementChild && parseFloat(el.style.width) > width,
    )
    expect(wide).toHaveLength(0)
    expect(container.innerHTML).not.toMatch(/w-screen|100vw/)
  })
})
