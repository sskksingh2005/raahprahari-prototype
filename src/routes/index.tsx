import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useId, useState } from 'react'
import {
  ArrowRight,
  CloudDownload,
  MapPin,
  Search,
  ShieldCheck,
  TriangleAlert,
  UsersRound,
} from 'lucide-react'
import { AdvisoryCard } from '@/components/advisory-card'
import { PrototypeRibbon } from '@/components/prototype-ribbon'
import type { TranslationKey } from '@/i18n/dictionary'
import { useAppStore } from '@/lib/app-store'
import { usePrefs } from '@/i18n/preferences'
import './home.css'

export const Route = createFileRoute('/')({
  component: Home,
})

/** Each feature opens the help topic that explains it (slugs from data/help-topics). */
const FEATURES = [
  { topic: 'report', icon: UsersRound, title: 'home.featReportTitle', body: 'home.featReportBody' },
  { topic: 'freshness', icon: ShieldCheck, title: 'home.featFreshTitle', body: 'home.featFreshBody' },
  // Offline access is planned, not built: no service worker or saved map content exists yet.
  { topic: 'map-offline', icon: CloudDownload, title: 'home.featOfflineTitle', body: 'home.featOfflineBody' },
] as const satisfies readonly {
  topic: string
  icon: unknown
  title: TranslationKey
  body: TranslationKey

}[]
/** The featured card shows this seeded segment and links to its detail page. */
const HOME_SAMPLE_SEGMENT_ID = 'nh107-02'

/**
 * The headline with one word picked out in orange gradient text. The text is
 * unchanged (one node per part, read as one heading); only the styling differs.
 */
function HeroTitle({ title, highlight }: { title: string; highlight: string | null }) {
  const at = highlight ? title.search(new RegExp(`\\b${highlight}\\b`)) : -1
  if (!highlight || at < 0) return <>{title}</>
  return (
    <>
      {title.slice(0, at)}
      <span className="home-you">{title.slice(at, at + highlight.length)}</span>
      {title.slice(at + highlight.length)}
    </>
  )
}
function Home() {
  const { t, lang } = usePrefs()
  const { segments } = useAppStore()
  const sampleSegment = segments.find((s) => s.id === HOME_SAMPLE_SEGMENT_ID)
  if (!sampleSegment) throw new Error(`Missing sample segment "${HOME_SAMPLE_SEGMENT_ID}"`)

  return (
    <div className="home-page">
      {/* The photo is the app-wide fixed backdrop (.rp-backdrop in __root). */}
      <section aria-labelledby="hero-title" className="home-hero photo-surface">
        <div className="home-content">
          <div className="home-copy rp-hero-stagger">
            <h1 id="hero-title">
              <HeroTitle title={t('hero.title')} highlight={lang === 'en' ? 'you' : null} />
            </h1>
            <p>{t('hero.body')}</p>
            <HomeRoadSearch />
            <div className="home-actions">
              <Link to="/report" search={{ segment: undefined }} className="home-action home-action-report glass">
                <TriangleAlert aria-hidden />
                <span>Report a hazard</span>
                <ArrowRight aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="home-support">
        <AdvisoryCard segment={sampleSegment} variant="home-featured" />

        <ul aria-label="RaahPrahari features" className="home-features">
          {FEATURES.map((feature) => {
            const { topic, icon: Icon, title, body } = feature
            return (
            <li key={topic}>
              <Link to="/help/$topic" params={{ topic }} className="glass">
                <Icon aria-hidden />
                <span>
                  <strong>{t(title)}</strong>
                  <small>{t(body)}</small>
                </span>
              </Link>
            </li>
            )
          })}
        </ul>

        <div className="home-prototype-label">
          <PrototypeRibbon />
        </div>
      </div>
    </div>
  )
}

/** Hands the query to the traveller search (/traveller?q=), which does the matching. */
function HomeRoadSearch() {
  const { t } = usePrefs()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const id = useId()

  return (
    <form
      role="search"
      className="home-search glass-strong"
      onSubmit={(event) => {
        event.preventDefault()
        const q = query.trim()
        void navigate({ to: '/traveller', search: q ? { q } : {} })
      }}
    >
      <label htmlFor={id} className="home-search-label">
        <MapPin aria-hidden />
        {t('home.searchLabel')}
      </label>
      <div className="home-search-field glass">
        <Search aria-hidden />
        <input
          id={id}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('home.searchPlaceholder')}
          autoComplete="off"
        />
        <button type="submit" className="glass-btn-accent">
          {t('home.searchSubmit')}
          <ArrowRight aria-hidden />
        </button>
      </div>
    </form>
  )
}
