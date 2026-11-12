import { useCallback, useEffect, useState } from 'react'

// Device-local persistence for the prototype. Values load after mount so the
// server render and first client render match.

const EVENT = 'rp-storage'

export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeLocal<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new CustomEvent(EVENT, { detail: key }))
  } catch {
    // Storage may be full or disabled; the prototype keeps working in memory.
  }
}

export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial)

  useEffect(() => {
    // Storage is intentionally read after mount to avoid a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(readLocal(key, initial))
    const sync = (e: Event) => {
      if ((e as CustomEvent).detail === key) setValue(readLocal(key, initial))
    }
    window.addEventListener(EVENT, sync)
    return () => window.removeEventListener(EVENT, sync)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === 'function' ? (next as (p: T) => T)(readLocal(key, initial)) : next
      setValue(resolved)
      writeLocal(key, resolved)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  )

  return [value, update] as const
}

export const STORAGE_KEYS = {
  theme: 'rp.theme',
  lang: 'rp.lang',
  recentSearches: 'rp.recentSearches',
  savedRoads: 'rp.savedRoads',
  reportDraft: 'rp.reportDraft',
  localReports: 'rp.localReports',
  lastLocalReport: 'rp.lastLocalReport',
  contribSettings: 'rp.contribSettings',
  contribAppeals: 'rp.contribAppeals',
} as const
