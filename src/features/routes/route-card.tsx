import { Link } from '@tanstack/react-router'
import { Bookmark, BookmarkCheck, Info, List, Map as MapIcon, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ActionBadge, FreshnessChip, LEVEL_META } from '@/components/advisory'
import { usePrefs } from '@/i18n/preferences'
import { useAppStore } from '@/lib/app-store'
import type { RouteAdvisorySummary } from '@/lib/advisory'
import type { RouteOption } from '@/features/routes/routing'
import { routeLabel } from '@/features/routes/routing'
import { cn } from '@/lib/utils'
import { getAdvisorySourceTimestamp } from '@/lib/advisory'

function Metric({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn('mt-0.5 font-semibold', mono && 'font-mono text-sm')}>{value}</dd>
    </div>
  )
}

export function RouteCard({
  route,
  summary,
  index,
  selected,
  saved,
  onSelect,
  onCompare,
  onDetails,
  onToggleSave,
}: {
  route: RouteOption
  summary: RouteAdvisorySummary
  index: number
  selected: boolean
  saved: boolean
  onSelect: () => void
  onCompare: () => void
  onDetails: () => void
  onToggleSave: () => void
}) {
  const { t, lang, ago, duration } = usePrefs()
  const letter = String.fromCharCode(65 + index)
  const { advisories: advisoryMap } = useAppStore()
  const advisoryFor = (id: string) => advisoryMap.get(id)
  const advisories = route.segments.map((segment) => advisoryFor(segment.id)).filter((advisory) => advisory !== undefined)
  const timestamps = advisories
    .map(getAdvisorySourceTimestamp)
    .filter((timestamp): timestamp is number => timestamp !== undefined)
  const latestSourceAt = timestamps.length ? Math.max(...timestamps) : undefined
  const sources = [
    ...(advisories.some((advisory) => advisory.evidence.length > 0) ? [t('source.community')] : []),
    ...(advisories.some((advisory) => !!advisory.restriction) ? [t('source.official')] : []),
  ]
  return (
    <article
      className={cn(
        'rp-card rp-enter flex flex-col rounded-2xl border bg-card p-5',
        selected && 'is-selected',
        selected ? 'border-foreground/60 ring-1 ring-foreground/30' : 'border-border',
      )}
      aria-label={`Route ${letter}`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="-m-2 rounded-xl p-2 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="font-mono text-xs text-muted-foreground">ROUTE {letter}</span>
            <p className="mt-0.5 font-display text-lg leading-snug font-semibold">
              {t('results.via')} {routeLabel(route, lang)}
            </p>
          </div>
          <ActionBadge level={summary.level} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <FreshnessChip sourceTimestamp={latestSourceAt} />
          <span className="text-xs text-muted-foreground">
            {sources.length ? sources.join(' · ') : t('source.unknown')}
          </span>
        </div>
        {/* Per-section strip, proportional to distance */}
        <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
          {route.segments.map((s) => {
            const l = advisoryFor(s.id)?.level ?? 'unknown'
            return (
              <span
                key={s.id}
                className={cn('h-full border-r border-card last:border-0', LEVEL_META[l].bar, l === 'unknown' && 'opacity-50')}
                style={{ width: `${(s.distanceKm / route.distanceKm) * 100}%` }}
              />
            )
          })}
        </div>
      </button>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        <Metric label={t('results.distance')} value={`${route.distanceKm} ${t('common.km')}`} />
        <Metric label={t('results.duration')} value={duration(route.typicalMinutes)} />
        <Metric label={t('results.coverage')} value={`${Math.round(summary.coverage * 100)}%`} />
        <Metric label={t('results.latest')} value={summary.latestObservationAt ? ago(summary.latestObservationAt) : '—'} />
        <Metric label={t('results.hazards')} value={summary.hazardCount} />
        <Metric label={t('results.restrictions')} value={summary.restrictionCount} />
        <Metric label={t('results.unknownKm')} value={`${summary.unknownKm} ${t('common.km')}`} />
      </dl>
      <p className="mt-2 text-xs text-muted-foreground">{t('results.typical')}</p>

      {summary.awaitingClearance && (
        <p className="mt-3 rounded-lg border border-dashed border-status-official px-3 py-2 text-sm">
          {t('copy.awaitingClearance')}
        </p>
      )}
      <p className="mt-3 flex gap-2 rounded-lg bg-accent px-3 py-2.5 text-sm">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        {t('copy.poorCoverage')}
      </p>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
        <Button variant="secondary" className="h-auto min-h-11 rounded-xl py-2 whitespace-normal" onClick={onCompare}>
          <MapIcon />
          {t('results.compare')}
        </Button>
        <Button variant="secondary" className="h-auto min-h-11 rounded-xl py-2 whitespace-normal" onClick={onDetails}>
          <List />
          {t('results.details')}
        </Button>
        <Button variant="outline" className="h-auto min-h-11 rounded-xl py-2 whitespace-normal" onClick={onToggleSave} aria-pressed={saved}>
          {saved ? <BookmarkCheck key="saved" className="rp-pop" /> : <Bookmark />}
          {saved ? t('results.saved') : t('results.save')}
        </Button>
        <Button asChild variant="outline" className="h-auto min-h-11 rounded-xl py-2 whitespace-normal">
          <Link to="/report" search={{ segment: route.segments[0]?.id }}>
            <TriangleAlert />
            {t('results.reportHere')}
          </Link>
        </Button>
      </div>
    </article>
  )
}
