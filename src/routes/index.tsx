import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, CloudDownload, MapPin, Search, ShieldCheck, TriangleAlert, UsersRound } from 'lucide-react'
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
  { topic: 'map-offline', icon: CloudDownload, title: 'home.featOfflineTitle', body: 'home.featOfflineBody', planned: true },
] as const satisfies readonly {
  topic: string
  icon: unknown
  title: TranslationKey
  body: TranslationKey
  planned?: boolean
}[]
/** The featured card shows this seeded segment and links to its detail page. */
const HOME_SAMPLE_SEGMENT_ID = 'nh107-02'

function Home() {
  const { t } = usePrefs()
  const { segments } = useAppStore()
  const sampleSegment = segments.find((s) => s.id === HOME_SAMPLE_SEGMENT_ID)
  if (!sampleSegment) throw new Error(`Missing sample segment "${HOME_SAMPLE_SEGMENT_ID}"`)

  return (
    <div className="home-page">
      <section aria-labelledby="hero-title" className="home-hero">
        <img
          src="/img/hero-mountain.png"
          alt=""
          fetchPriority="high"
          className="home-hero-image rp-hero-zoom"
        />
        <div aria-hidden className="home-hero-overlay" />
        <div className="home-content">
          <div className="home-copy rp-hero-stagger">
            <h1 id="hero-title">{t('hero.title')}</h1>
            <p>{t('hero.body')}</p>
            <div className="home-actions">
              <Link to="/traveller" className="rp-interactive home-action home-action-check">
                <Search aria-hidden />
                <span>Check a road</span>
                <ArrowRight aria-hidden />
              </Link>
              <Link to="/report" search={{ segment: undefined }} className="rp-interactive home-action home-action-report">
                <TriangleAlert aria-hidden />
                <span>Report a hazard</span>
                <ArrowRight aria-hidden />
              </Link>
            </div>
          </div>

          <IllustrativeRoute />
          <AdvisoryCard segment={sampleSegment} variant="home-featured" />
        </div>

        <ul aria-label="RaahPrahari features" className="home-features">
          {FEATURES.map((feature) => {
            const { topic, icon: Icon, title, body } = feature
            return (
            <li key={topic}>
              <Link to="/help/$topic" params={{ topic }}>
                <Icon aria-hidden />
                <span>
                  <strong>{t(title)}</strong>
                  <small>{t(body)}</small>
                  {'planned' in feature && <small className="home-planned">{t('home.planned')}</small>}
                </span>
              </Link>
            </li>
            )
          })}
        </ul>

        <div className="home-prototype-label">
          <PrototypeRibbon />
        </div>
      </section>
    </div>
  )
}

function IllustrativeRoute() {
  return (
    <div
      role="img"
      aria-label="Illustrative route only with three synthetic coordinate pins"
      className="home-route"
    >
      <span className="home-route-label">ILLUSTRATIVE ROUTE ONLY</span>
      <div aria-hidden className="home-route-line home-route-line-one" />
      <div aria-hidden className="home-route-line home-route-line-two" />
      <div className="home-route-pin home-route-pin-one">
        <MapPin aria-hidden />
        <span>32.2435° N<br />77.1890° E</span>
      </div>
      <div className="home-route-pin home-route-pin-two">
        <MapPin aria-hidden />
        <span>32.1876° N<br />77.1420° E</span>
      </div>
      <div className="home-route-pin home-route-pin-three">
        <MapPin aria-hidden />
        <span>32.1042° N<br />77.0931° E</span>
      </div>
    </div>
  )
}
