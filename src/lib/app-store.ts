/**
 * AppStore: the single shared client state for RaahPrahari.
 *
 * React context + localStorage. Holds:
 *  - reference data and seeded segments/reports/restrictions (from fixtures)
 *  - advisories, derived from reports + restrictions (never stored by hand)
 *  - reports saved locally on this device, the report draft, saved roads,
 *    recent searches, language and theme
 *
 * Safety rules kept here:
 *  - Ages are never stored. Only timestamps are; ages are derived at render.
 *  - Locally saved reports are NOT fed into advisories. They are "Saved on
 *    this device": not server received, not reviewed, not verified.
 *  - Advisory levels come only from the pure rules in `@/lib/advisory`, so
 *    unknown or stale evidence can never become a green/clear state.
 *
 * Browser storage is read after mount so server and first client render match.
 */

import {
  Fragment,
  createContext,
  createElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  CORRIDORS,
  DEMO_NOW,
  PLACES,
  REPORTS,
  RESTRICTIONS,
  SEGMENTS,
} from '@/data/fixtures'
import { computeSegmentAdvisory, type SegmentAdvisory } from '@/lib/advisory'
import {
  clearReportDraft as clearStoredDraft,
  readLastLocalReport,
  readLocalReports,
  readReportDraft,
  writeLastLocalReport,
  writeLocalReports,
  writeReportDraft,
  type LocalReport,
  type ReportDraft,
} from '@/lib/report-store'
import { STORAGE_KEYS, readLocal, writeLocal } from '@/lib/storage'
import type {
  CommunityReport,
  Corridor,
  OfficialRestriction,
  Place,
  Segment,
} from '@/lib/types'

export type Lang = 'en' | 'hi'
export type Theme = 'system' | 'dark' | 'light'

export interface SavedRoad {
  id: string
  from: string
  to: string
  savedAt: number
}

/** One shared list for free-text road searches and from → to route searches. */
export interface RecentSearch {
  query: string
  /** Set when the search was a from → to route pick (place ids). */
  from?: string
  to?: string
  at: number
}

/** Accepts older stored shapes ({from,to,at} or {query,at}) and drops junk. */
function normaliseRecent(value: unknown): RecentSearch[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item): RecentSearch[] => {
    if (typeof item !== 'object' || item === null) return []
    const r = item as Record<string, unknown>
    const at = typeof r.at === 'number' ? r.at : 0
    const from = typeof r.from === 'string' ? r.from : undefined
    const to = typeof r.to === 'string' ? r.to : undefined
    const query =
      typeof r.query === 'string'
        ? r.query
        : from && to
          ? `${PLACES.find((p) => p.id === from)?.name ?? from} to ${PLACES.find((p) => p.id === to)?.name ?? to}`
          : ''
    return query ? [{ query, from, to, at }] : []
  })
}

type Updater<T> = T | ((previous: T) => T)

export interface AppStore {
  // Reference data and seeded evidence (read-only in the prototype)
  segments: Segment[]
  corridors: Corridor[]
  places: Place[]
  restrictions: OfficialRestriction[]
  reports: CommunityReport[]

  // Derived advisories
  advisories: Map<string, SegmentAdvisory>
  /** Timestamp the advisories were computed against (the demo clock). */
  advisoryCacheTimestamp: number
  /** Demo clock used for seeded evidence ages. */
  now: number

  // Reports saved locally. Never "received" or "verified".
  localReports: LocalReport[]
  lastLocalReport: LocalReport | null
  /** Throws if the browser cannot store the report. */
  saveLocalReport: (report: LocalReport) => void
  /** Re-reads the last saved report from storage (for the confirmation page). */
  loadLastLocalReport: () => LocalReport | null

  // Report draft
  reportDraft: ReportDraft | null
  /** Throws if the browser cannot store the draft. */
  saveReportDraft: (draft: ReportDraft) => void
  clearReportDraft: () => void
  /** Synchronous read from storage; also syncs store state. */
  loadReportDraft: () => ReportDraft | null

  // Saved roads and recent searches
  savedRoads: SavedRoad[]
  setSavedRoads: (next: Updater<SavedRoad[]>) => void
  recentSearches: RecentSearch[]
  setRecentSearches: (next: Updater<RecentSearch[]>) => void

  // Preferences
  lang: Lang
  setLang: (lang: Lang) => void
  theme: Theme
  setTheme: (theme: Theme) => void
}

const AppStoreContext = createContext<AppStore | null>(null)

const isTheme = (value: unknown): value is Theme =>
  value === 'light' || value === 'dark' || value === 'system'

function safe<T>(read: () => T, fallback: T): T {
  try {
    return read()
  } catch {
    return fallback
  }
}

/** Derived from seeded evidence only; locally saved reports are excluded on purpose. */
function buildAdvisories(
  segments: Segment[],
  reports: CommunityReport[],
  restrictions: OfficialRestriction[],
  now: number,
): Map<string, SegmentAdvisory> {
  return new Map(
    segments.map((s) => [s.id, computeSegmentAdvisory(s.id, reports, restrictions, now)]),
  )
}

/**
 * Optional replacement for the seeded data. This is the seam real persistence
 * (or a test) uses to supply segments, evidence and restrictions. When
 * `advisories` is omitted they are derived from the seeded reports and
 * restrictions with the same rules as always.
 */
export interface AppStoreSeed {
  segments?: Segment[]
  reports?: CommunityReport[]
  restrictions?: OfficialRestriction[]
  advisories?: Map<string, SegmentAdvisory>
  now?: number
}

export function AppStoreProvider({
  children,
  seed,
}: {
  children: ReactNode
  seed?: AppStoreSeed
}) {
  // A store higher in the tree wins, so providers can be nested safely.
  const parent = useContext(AppStoreContext)
  if (parent) return createElement(Fragment, null, children)
  return createElement(RootAppStoreProvider, { seed }, children)
}

function RootAppStoreProvider({ children, seed }: { children?: ReactNode; seed?: AppStoreSeed }) {
  const [localReports, setLocalReportsState] = useState<LocalReport[]>([])
  const [lastLocalReport, setLastLocalReport] = useState<LocalReport | null>(null)
  const [reportDraft, setReportDraftState] = useState<ReportDraft | null>(null)
  const [savedRoads, setSavedRoadsState] = useState<SavedRoad[]>([])
  const [recentSearches, setRecentSearchesState] = useState<RecentSearch[]>([])
  const [lang, setLangState] = useState<Lang>('en')
  const [theme, setThemeState] = useState<Theme>('dark')

  // Load everything from this device after mount; stay in sync with other tabs
  // and with direct writes announced through the storage event.
  useEffect(() => {
   // Keep the previous reference when nothing changed, so loading an empty
    // store does not re-render the whole app.
    const same = <T,>(next: T) => (prev: T) =>
      JSON.stringify(prev) === JSON.stringify(next) ? prev : next
    const load = () => {
      setLocalReportsState(same(safe(readLocalReports, [])))
      setLastLocalReport(same(safe(readLastLocalReport, null)))
      setReportDraftState(same(safe(readReportDraft, null)))
      setSavedRoadsState(same(readLocal<SavedRoad[]>(STORAGE_KEYS.savedRoads, [])))
      setRecentSearchesState(
        same(normaliseRecent(readLocal<unknown>(STORAGE_KEYS.recentSearches, []))),
      )
      setLangState(readLocal<Lang>(STORAGE_KEYS.lang, 'en') === 'hi' ? 'hi' : 'en')
      const storedTheme = readLocal<unknown>(STORAGE_KEYS.theme, 'dark')
      setThemeState(isTheme(storedTheme) ? storedTheme : 'dark')
    }
    load()
    const onStorage = (event: Event) => {
      const key = (event as StorageEvent).key ?? (event as CustomEvent<string>).detail
      if (!key || String(key).startsWith('rp.')) load()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('rp-storage', onStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('rp-storage', onStorage)
    }
  }, [])

  const saveLocalReport = useCallback((report: LocalReport) => {
    const next = [report, ...safe(readLocalReports, [])].slice(0, 50)
    writeLocalReports(next)
    writeLastLocalReport(report)
    setLocalReportsState(next)
    setLastLocalReport(report)
  }, [])

  const loadLastLocalReport = useCallback(() => {
    const report = readLastLocalReport()
    setLastLocalReport(report)
    return report
  }, [])

  const saveReportDraft = useCallback((draft: ReportDraft) => {
    writeReportDraft(draft)
    setReportDraftState(draft)
  }, [])

  const clearReportDraft = useCallback(() => {
    clearStoredDraft()
    setReportDraftState(null)
  }, [])

  const loadReportDraft = useCallback(() => {
    const draft = readReportDraft()
    setReportDraftState(draft)
    return draft
  }, [])

  const setSavedRoads = useCallback((next: Updater<SavedRoad[]>) => {
    const resolved =
      typeof next === 'function'
        ? next(readLocal<SavedRoad[]>(STORAGE_KEYS.savedRoads, []))
        : next
    setSavedRoadsState(resolved)
    writeLocal(STORAGE_KEYS.savedRoads, resolved)
  }, [])

  const setRecentSearches = useCallback((next: Updater<RecentSearch[]>) => {
    const resolved =
      typeof next === 'function'
        ? next(normaliseRecent(readLocal<unknown>(STORAGE_KEYS.recentSearches, [])))
        : next
    setRecentSearchesState(resolved)
    writeLocal(STORAGE_KEYS.recentSearches, resolved)
  }, [])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    writeLocal(STORAGE_KEYS.lang, next)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    writeLocal(STORAGE_KEYS.theme, next)
  }, [])

  const segments = seed?.segments ?? SEGMENTS
  const reports = seed?.reports ?? REPORTS
  const restrictions = seed?.restrictions ?? RESTRICTIONS
  const now = seed?.now ?? DEMO_NOW
  const seededAdvisories = seed?.advisories
  const advisories = useMemo(
    () => seededAdvisories ?? buildAdvisories(segments, reports, restrictions, now),
    [seededAdvisories, segments, reports, restrictions, now],
  )

  const value = useMemo<AppStore>(
    () => ({
      segments,
      corridors: CORRIDORS,
      places: PLACES,
      restrictions,
      reports,
      advisories,
      advisoryCacheTimestamp: now,
      now,
      localReports,
      lastLocalReport,
      saveLocalReport,
      loadLastLocalReport,
      reportDraft,
      saveReportDraft,
      clearReportDraft,
      loadReportDraft,
      savedRoads,
      setSavedRoads,
      recentSearches,
      setRecentSearches,
      lang,
      setLang,
      theme,
      setTheme,
    }),
    [
      segments,
      restrictions,
      reports,
      now,
      advisories,
      localReports,
      lastLocalReport,
      saveLocalReport,
      loadLastLocalReport,
      reportDraft,
      saveReportDraft,
      clearReportDraft,
      loadReportDraft,
      savedRoads,
      setSavedRoads,
      recentSearches,
      setRecentSearches,
      lang,
      setLang,
      theme,
      setTheme,
    ],
  )

  return createElement(AppStoreContext.Provider, { value }, children)
}

export function useAppStore(): AppStore {
  const ctx = useContext(AppStoreContext)
  if (!ctx) throw new Error('useAppStore must be used inside AppStoreProvider')
  return ctx
}
