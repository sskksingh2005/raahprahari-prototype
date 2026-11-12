import { useRouterState } from '@tanstack/react-router'
import { ArrowUp } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { usePrefs } from '@/i18n/preferences'

/**
 * Behaviour helpers for the motion system. All timing and easing live in CSS
 * tokens in `src/styles.css`; this file only toggles classes and attributes.
 * Every helper is a no-op during SSR and when reduced motion is requested.
 */

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Elements that fade and rise in once, the first time they are scrolled into view. */
export const REVEAL_SELECTOR = '[data-reveal], .rp-info-card, .help-reminder, .help-page-footer'

/** Fades the main region in with a small upward motion on every route change. */
export function PageTransition() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const first = useRef(true)
  useIsoLayoutEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (prefersReducedMotion()) return
    const main = document.getElementById('main')
    if (!main) return
    main.classList.remove('rp-page-enter')
    void main.offsetWidth // restart the animation
    main.classList.add('rp-page-enter')
    const done = () => main.classList.remove('rp-page-enter')
    main.addEventListener('animationend', done, { once: true })
    return () => main.removeEventListener('animationend', done)
  }, [pathname])
  return null
}

/**
 * Marks `REVEAL_SELECTOR` elements that start below the fold as hidden, then
 * reveals each one once. Elements already on screen are never hidden, so there
 * is no flash on first paint and nothing stays invisible if scripts fail.
 */
export function RevealObserver() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  useEffect(() => {
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.setAttribute('data-reveal-state', 'visible')
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    const scan = () => {
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((el) => {
        if (el.hasAttribute('data-reveal-state')) return
        const rect = el.getBoundingClientRect()
        if (rect.top < window.innerHeight) return // already in view: leave alone
        el.setAttribute('data-reveal-state', 'hidden')
        observer.observe(el)
      })
    }
    scan()
    const main = document.getElementById('main')
    let frame = 0
    const mutations =
      main && typeof MutationObserver !== 'undefined'
        ? new MutationObserver(() => {
            cancelAnimationFrame(frame)
            frame = requestAnimationFrame(scan)
          })
        : null
    if (main && mutations) mutations.observe(main, { childList: true, subtree: true })
    return () => {
      cancelAnimationFrame(frame)
      mutations?.disconnect()
      observer.disconnect()
      // Anything still hidden must not stay hidden.
      document.querySelectorAll('[data-reveal-state="hidden"]').forEach((el) => el.setAttribute('data-reveal-state', 'visible'))
    }
  }, [pathname])
  return null
}

/** True once the page has scrolled past `offset` pixels. */
export function useScrolled(offset = 4) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [offset])
  return scrolled
}

/** Floating button that fades in after the page has scrolled down. */
export function BackToTop() {
  const { t } = usePrefs()
  const visible = useScrolled(600)
  return (
    <Button
      type="button"
      variant="secondary"
      size="icon-lg"
      aria-label={t('nav.backToTop')}
      title={t('nav.backToTop')}
      tabIndex={visible ? 0 : -1}
      aria-hidden={visible ? undefined : true}
      data-visible={visible}
      className="rp-fab fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-3 z-(--z-bottom-nav) rounded-full border border-border shadow-lg xl:bottom-4"
      onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })}
    >
      <ArrowUp />
    </Button>
  )
}

/**
 * Measures the pressed button inside a `.rp-segmented` container and exposes its
 * box as CSS variables, so the highlight slides between options.
 */
export function useSlidingHighlight<T extends HTMLElement>(activeKey: string) {
  const ref = useRef<T>(null)
  const measure = useCallback(() => {
    const box = ref.current
    const active = box?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!box || !active) return
    box.style.setProperty('--rp-seg-x', `${active.offsetLeft}px`)
    box.style.setProperty('--rp-seg-y', `${active.offsetTop}px`)
    box.style.setProperty('--rp-seg-w', `${active.offsetWidth}px`)
    box.style.setProperty('--rp-seg-h', `${active.offsetHeight}px`)
    box.style.setProperty('--rp-seg-on', '1')
    box.dataset.measured = 'true'
  }, [])
  useIsoLayoutEffect(measure, [measure, activeKey])
  useEffect(() => {
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])
  return ref
}

/** Briefly true after `flash()`; used to swap an icon for a checkmark. */
export function useFlash(ms = 1600) {
  const [on, setOn] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const flash = useCallback(() => {
    setOn(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOn(false), ms)
  }, [ms])
  return [on, flash] as const
}

/**
 * Keeps removed list items on screen for one `--motion-base` while they slide
 * out. The ghosts are decorative copies, so the real list can update at once.
 */
export function useExitGhosts<T>(ms = 200) {
  const [ghosts, setGhosts] = useState<T[]>([])
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const capture = useCallback(
    (items: T[]) => {
      if (prefersReducedMotion() || items.length === 0) return
      setGhosts(items)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setGhosts([]), ms)
    },
    [ms],
  )
  return [ghosts, capture] as const
}

/** Cross-fades colours across the page for one `--motion-base` while the theme changes. */
export function crossFadeTheme() {
  if (typeof document === 'undefined' || prefersReducedMotion()) return
  const root = document.documentElement
  root.classList.add('rp-theme-fade')
  window.setTimeout(() => root.classList.remove('rp-theme-fade'), 300)
}
