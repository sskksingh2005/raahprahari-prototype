import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import { en, hi, type TranslationKey } from '@/i18n/dictionary'
import { placeById } from '@/data/fixtures'
import { readLocal, STORAGE_KEYS } from '@/lib/storage'
import { AppStoreProvider, useAppStore, type Lang, type Theme } from '@/lib/app-store'
const DEMO_NOW = Date.UTC(2026, 9, 15, 7, 0, 0)
export type { Lang, Theme }

interface Preferences {
  lang: Lang
  setLang: (l: Lang) => void
  theme: Theme
  setTheme: (t: Theme) => void
  now: number
  t: (key: TranslationKey) => string
  /** Human age relative to the injected clock (the store's now). */
  ago: (ts: number) => string
  /** Absolute local time, e.g. "25 Oct, 14:30" */
  stamp: (ts: number) => string
  place: (id: string) => string
  duration: (minutes: number) => string
}

const PreferencesContext = createContext<Preferences | null>(null)

/** Language and theme live in the app store; this layer adds formatting helpers. */
export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppStoreProvider>
      <PreferencesBridge>{children}</PreferencesBridge>
    </AppStoreProvider>
  )
}

function PreferencesBridge({ children }: { children: React.ReactNode }) {
  // The clock comes from the store (the seeded 2026 demo clock, or an injected one).
  const { lang, setLang, theme, setTheme, now } = useAppStore()
  
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const hydrated = useRef(false)
  useEffect(() => {
    const media =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null
    // The store starts on its default before it has read this device, so the first pass
    // reads the saved value directly. That keeps the theme the boot script already set.
    let effective: Theme = theme
    if (!hydrated.current) {
      hydrated.current = true
      const saved = readLocal<unknown>(STORAGE_KEYS.theme, theme)
      if (saved === 'dark' || saved === 'light' || saved === 'system') effective = saved
    }
    const applyTheme = () => {
      const dark =
        effective === 'system' ? (media?.matches ?? false) : effective === 'dark'
      document.documentElement.classList.toggle('dark', dark)
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
    }

    applyTheme()
    if (effective !== 'system' || !media) return

    media.addEventListener('change', applyTheme)
    return () => media.removeEventListener('change', applyTheme)
  }, [theme])

  const value = useMemo<Preferences>(() => {
    const dict = lang === 'hi' ? hi : en
    const t = (key: TranslationKey) => dict[key] ?? en[key]
    return {
      lang,
      setLang,
      theme,
      setTheme,
      now,
      t,
      ago: (ts) => {
        const mins = Math.max(0, Math.round((now - ts) / 60_000))
        if (mins < 5) return t('time.justNow')
        if (mins < 60) return `${mins} ${t('time.minAgo')}`
        const h = Math.round(mins / 60)
        if (h < 48) return `${h} ${t('time.hAgo')}`
        return `${Math.round(h / 24)} ${t('time.dAgo')}`
      },
      stamp: (ts) =>
        new Date(ts).toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Kolkata',
        }),
      place: (id) => {
        const p = placeById(id)
        return p ? (lang === 'hi' ? p.nameHi : p.name) : id
      },
      duration: (minutes) => {
        const h = Math.floor(minutes / 60)
        const m = minutes % 60
        return h ? `${h} ${t('common.hr')} ${m ? `${m} ${t('common.min')}` : ''}`.trim() : `${m} ${t('common.min')}`
      },
    }
  }, [lang, theme, setLang, setTheme, now])

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

// Module-level so its functions keep the same identity across renders;
// components that list `t` in effect dependencies must not re-run every render.
const FALLBACK_PREFS = {
  lang: 'en' as const,
  setLang: () => undefined,
  theme: 'dark' as const,
  setTheme: () => undefined,
  now: DEMO_NOW,
  t: (key: TranslationKey) => en[key] ?? key,
  ago: (ts: number) => `${Math.max(0, Math.round((DEMO_NOW - ts) / 60_000))} min ago`,
  stamp: (ts: number) => new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }),
  place: (id: string) => id,
  duration: (minutes: number) => `${minutes} min`,
}

export function usePrefs() {
  const ctx = useContext(PreferencesContext)
  return ctx ?? FALLBACK_PREFS
}

/** Inline script that applies the saved theme before first paint. */
export const themeBootScript = `(()=>{let dark=true;try{const theme=JSON.parse(localStorage.getItem('${STORAGE_KEYS.theme}')||'null');if(theme==='dark')dark=true;else if(theme==='light')dark=false;else if(theme==='system')dark=typeof window.matchMedia==='function'&&window.matchMedia('(prefers-color-scheme: dark)').matches}catch{}document.documentElement.classList.toggle('dark',dark);document.documentElement.style.colorScheme=dark?'dark':'light'})()`
