import { Link } from '@tanstack/react-router'
import { ArrowRight, Camera, CircleQuestionMark, Clock3, Copy, GitCompare, MapPin, Route as RouteIcon, ShieldCheck, TriangleAlert, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ActionBadge, AdvisoryBadge, CacheTimeLabel, FreshnessChip, OfficialBadge, RoadCode } from '@/components/advisory'
import { getFreshnessState, type AdvisoryLevel, type SegmentAdvisory } from '@/lib/advisory'
import { useAppStore } from '@/lib/app-store'
import { usePrefs } from '@/i18n/preferences'
import type { CommunityReport, Segment } from '@/lib/types'
import { cn } from '@/lib/utils'

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-border py-3.5">
      <h4 className="mb-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {title}
      </h4>
      <div className="space-y-1.5 text-sm">{children}</div>
    </div>
  );
}

export function ReportCard({ report }: { report: CommunityReport }) {
  const { t, ago, stamp } = usePrefs();
  const isHazard = report.kind === "hazard";
  return (
    <li className="rounded-xl border border-border bg-raised/60 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-semibold">
          {isHazard ? (
            <TriangleAlert aria-hidden className="size-4 text-status-caution" />
          ) : (
            <MapPin aria-hidden className="size-4 text-muted-foreground" />
          )}
          {isHazard
            ? `${t(`hazard.${report.hazardType}`)} · ${t(`sev.${report.severity}`)}`
            : t("kind.clear")}
        </span>
        <RoadCode>{report.ref}</RoadCode>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {report.description}
      </p>
      <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <dt className="text-muted-foreground">{t("segment.observedAgo")}</dt>
        <dd title={stamp(report.observedAt)}>{ago(report.observedAt)}</dd>
        <dt className="text-muted-foreground">{t("segment.status")}</dt>
        <dd>{t(`status.${report.status}`)}</dd>
        <dt className="text-muted-foreground">{t("segment.source")}</dt>
        <dd>{t("source.community")}</dd>
        <dt className="text-muted-foreground">{t("segment.locConf")}</dt>
        <dd>{t(`conf.${report.locationConfidence}`)}</dd>
      </dl>
      <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs">
        <span className="rounded-full border border-border px-2 py-0.5">
          {t("copy.notOfficial")}
        </span>
        {report.landmark && (
          <span className="rounded-full bg-accent px-2 py-0.5">
            {report.landmark}
          </span>
        )}
        {report.photoCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5">
            <Camera aria-hidden className="size-3" /> {report.photoCount}{" "}
            {t("segment.photos")}
          </span>
        )}
        {report.conflictsWith && (
          <span className="inline-flex items-center gap-1 rounded-full border border-status-caution/70 px-2 py-0.5">
            <GitCompare aria-hidden className="size-3" />{" "}
            {t("segment.conflict")} {report.conflictsWith}
          </span>
        )}
        {report.duplicateOf && (
          <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5">
            <Copy aria-hidden className="size-3" /> {t("segment.duplicate")}{" "}
            {report.duplicateOf}
          </span>
        )}
      </div>
    </li>
  );
}

export function SegmentDetail({
  segmentId,
  segment,
  onClose,
  className,
  variant = "default",
}: {
  segmentId?: string;
  segment?: Segment;
  onClose?: () => void;
  className?: string;
  variant?: "default" | "map" | "overview";
}) {
  const { t, ago, stamp, place } = usePrefs()
  const { segments, corridors, advisories, advisoryCacheTimestamp } = useAppStore()
  const seg = segment ?? (segmentId ? segments.find((s) => s.id === segmentId) : undefined)
  const adv = seg ? advisories.get(seg.id) : undefined

  if (!seg || !adv) {
    return (
      <div
        className={cn(
          "flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center",
          className,
        )}
      >
        <MapPin aria-hidden className="mb-2 size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("segment.select")}</p>
      </div>
    );
  }

  const corridor = corridors.find((c) => c.id === seg.corridorId)
  const hazards = adv.evidence.filter((r) => r.kind === 'hazard')
  const latestHazard = hazards[0]
  const unverified = adv.evidence.some((r) => r.kind === 'hazard' && r.status !== 'verified')
  const sources = new Set(adv.evidence.map((r) => r.source))
  const r = adv.restriction
  const cacheTimestamp = advisoryCacheTimestamp

  if (variant === "map") {
    return (
      <MapSegmentDetail
        segment={seg}
        advisory={adv}
        corridorName={corridor?.name}
        onClose={onClose}
        className={className}
      />
    );
  }

  if (variant === "overview") {
    return <OverviewSegmentDetail segment={seg} className={className} />;
  }

  return (
    <section
      aria-labelledby="seg-title"
      className={cn("rounded-2xl border border-border bg-card p-5", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <RoadCode>
            {seg.code} · km {seg.kmStart}–{seg.kmEnd}
          </RoadCode>
          <h3
            id="seg-title"
            className="rp-wrap-anywhere mt-1 font-display text-xl font-semibold"
          >
            {place(seg.from)} – {place(seg.to)}
          </h3>
          <p className="text-sm text-muted-foreground">{corridor?.name}</p>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon-lg"
            className="-mt-1 -mr-2 rounded-full"
            onClick={onClose}
            aria-label={t("segment.close")}
          >
            <X />
          </Button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <AdvisoryBadge level={adv.level} size="lg" />
        <FreshnessChip observationTimestamp={adv.latestObservationAt} />
        {r && <OfficialBadge label={t(`restriction.${r.type}`)} />}
        {adv.awaitingClearance && (
          <span className="rounded-full border border-dashed border-status-official px-2.5 py-0.5 text-xs font-medium">
            {t("copy.awaitingClearance")}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs font-medium text-muted-foreground">
        {t("copy.estimate")}
      </p>

      <div className="mt-3">
        <Block title={t("segment.observed")}>
          {latestHazard ? (
            <p>
              {t(`hazard.${latestHazard.hazardType}`)} ·{" "}
              {t(`sev.${latestHazard.severity}`)} — {latestHazard.description}
            </p>
          ) : adv.basis === "community_clear" ? (
            <p>{t("basis.community_clear")}</p>
          ) : (
            <p>{t("copy.noRecent")}</p>
          )}
        </Block>

        <Block title={t("segment.action")}>
          <p className="font-medium">{t(`action.${adv.level}`)}</p>
          {(adv.level === "unknown" || adv.level === "clear") && (
            <p className="text-muted-foreground">{t("copy.noReportNotSafe")}</p>
          )}
        </Block>

        <Block title={t("segment.official")}>
          {r ? (
            <div className="rounded-xl border border-status-official/50 bg-status-official/10 p-3">
              <p className="flex items-center gap-2 font-semibold">
                <ShieldCheck
                  aria-hidden
                  className="size-4 text-status-official"
                />
                {t(`restriction.${r.type}`)} — {r.title}
              </p>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                <dt className="text-muted-foreground">
                  {t("segment.issuedBy")}
                </dt>
                <dd>{r.issuingAuthority}</dd>
                <dt className="text-muted-foreground">
                  {t("segment.published")}
                </dt>
                <dd>{stamp(r.publishedAt)}</dd>
                <dt className="text-muted-foreground">
                  {t("segment.effective")}
                </dt>
                <dd>{stamp(r.effectiveFrom)}</dd>
                <dt className="text-muted-foreground">
                  {t("segment.reviewBy")}
                </dt>
                <dd>{stamp(r.reviewBy)}</dd>
                <dt className="text-muted-foreground">{t("segment.status")}</dt>
                <dd className="font-semibold">{t("segment.inForce")}</dd>
                <dt className="text-muted-foreground">{t("segment.ref")}</dt>
                <dd className="font-mono">{r.supportingReference}</dd>
              </dl>
              {adv.restrictionPastReview && (
                <p className="mt-2 text-xs font-medium">
                  {t("copy.pastReview")}
                </p>
              )}
            </div>
          ) : (
            <p>{t("copy.noOfficial")}</p>
          )}
        </Block>

        <Block title={t("segment.source")}>
          <p>
            {t("segment.source")}:{" "}
            {r
              ? t("source.official")
              : adv.evidence.length > 0
                ? t("source.community")
                : t("source.unknown")}
          </p>
          {adv.latestObservationAt ? (
            <p>
              {t("results.latest")}:{" "}
              <span className="font-medium">
                {ago(adv.latestObservationAt)}
              </span>{" "}
              <span className="text-muted-foreground">
                ({stamp(adv.latestObservationAt)})
              </span>
            </p>
          ) : (
            <p>{t("copy.noRecent")}</p>
          )}
          <CacheTimeLabel timestamp={cacheTimestamp} />
          {sources.size > 0 && (
            <p className="text-muted-foreground">
              {[...sources].map((s) => t(`source.${s}`)).join(" · ")} —{" "}
              {adv.evidence.length} {t("segment.reportsCount")}
            </p>
          )}
        </Block>

        <Block title={t("segment.uncertainty")}>
          <p>{t(`basis.${adv.basis}`)}</p>
          {adv.evidence.length > 0 && (
            <p className="text-muted-foreground">
              {adv.reviewedCount} {t("segment.reviewed")} /{" "}
              {adv.evidence.length}
            </p>
          )}
          {unverified && (
            <p className="text-muted-foreground">
              {t("copy.communityUnverified")}
            </p>
          )}
        </Block>
      </div>

      {adv.evidence.length > 0 && (
        <div className="border-t border-border pt-3.5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {t("segment.reports")}
            </h4>
          </div>
          <ul className="space-y-2">
            {adv.evidence.slice(0, 3).map((rep) => (
              <ReportCard key={rep.ref} report={rep} />
            ))}
          </ul>
        </div>
      )}

      <Button asChild variant="outline" className="mt-4 h-11 w-full rounded-xl">
        <Link to="/report" search={{ segment: seg.id }}>
          <TriangleAlert />
          {t("results.reportHere")}
        </Link>
      </Button>
    </section>
  );
}

function OverviewSegmentDetail({
  segment,
  className,
}: {
  segment: Segment
  className?: string
}) {
  const { place, duration } = usePrefs();
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card p-3 sm:p-4",
        className,
      )}
    >
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <RouteIcon aria-hidden className="size-5 shrink-0 text-blue-on-dark" />
        Route details
      </h2>
      <dl className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
        <div className="grid min-w-0 grid-cols-[auto_1fr] items-start gap-x-2">
          <MapPin
            aria-hidden
            className="row-span-2 mt-0.5 size-4 shrink-0 text-muted-foreground"
          />
          <dt className="text-[11px] text-muted-foreground">Starting point</dt>
          <dd className="rp-wrap-anywhere text-xs font-medium">
            {place(segment.from)}
          </dd>
        </div>
        <div className="grid min-w-0 grid-cols-[auto_1fr] items-start gap-x-2">
          <RouteIcon
            aria-hidden
            className="row-span-2 mt-0.5 size-4 shrink-0 text-muted-foreground"
          />
          <dt className="text-[11px] text-muted-foreground">Total distance</dt>
          <dd className="rp-wrap-anywhere text-xs font-medium">
            {segment.distanceKm} km (illustrative)
          </dd>
        </div>
        <div className="grid min-w-0 grid-cols-[auto_1fr] items-start gap-x-2">
          <MapPin
            aria-hidden
            className="row-span-2 mt-0.5 size-4 shrink-0 text-muted-foreground"
          />
          <dt className="text-[11px] text-muted-foreground">End point</dt>
          <dd className="rp-wrap-anywhere text-xs font-medium">
            {place(segment.to)}
          </dd>
        </div>
        <div className="grid min-w-0 grid-cols-[auto_1fr] items-start gap-x-2">
          <Clock3
            aria-hidden
            className="row-span-2 mt-0.5 size-4 shrink-0 text-muted-foreground"
          />
          <dt className="text-[11px] text-muted-foreground">Estimated time</dt>
          <dd className="rp-wrap-anywhere text-xs font-medium">
            {duration(segment.typicalMinutes)} (illustrative)
          </dd>
        </div>
      </dl>
    </section>
  );
}

export function StatusTimeline({
  report,
  level,
}: {
  report: CommunityReport;
  level: AdvisoryLevel;
}) {
  const { t, ago, stamp } = usePrefs()
  const communityLevel: AdvisoryLevel =
    level === "clear" || level === "do_not_travel" ? "unknown" : level;
  const statusLabel =
    report.status === "under_review"
      ? "Under review"
      : report.status === "needs_info"
        ? "More information requested"
        : report.status === "conflicting"
          ? "Conflicting information noted"
          : "Community review status updated";
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-4 text-sm font-semibold">Status history</h2>
      <ol className="space-y-4 border-l border-border pl-4">
        <li className="relative">
          <span className="absolute top-1 -left-[1.32rem] size-2.5 rounded-full bg-blue-on-dark" />
          <p className="text-sm font-medium">{t('segment.timelineReported')}</p>
          <p className="text-xs text-muted-foreground">
            {ago(report.receivedAt)} · {stamp(report.receivedAt)}
          </p>
        </li>
        <li className="relative">
          <span className="absolute top-1 -left-[1.32rem] size-2.5 rounded-full border-2 border-status-unknown bg-background" />
          <p className="text-sm font-medium">{statusLabel}</p>
          <p className="text-xs text-muted-foreground">
            Community review status
          </p>
        </li>
        <li className="relative">
          <span className="absolute top-1 -left-[1.32rem] size-2.5 rounded-full border-2 border-status-unknown bg-background" />
          <p className="text-sm font-medium">{t('segment.aiIndication')}</p>
          <ActionBadge level={communityLevel} className="mt-2" />
        </li>
      </ol>
    </section>
  );
}

export function MapSegmentDetail({
  segment,
  advisory,
  corridorName,
  onClose,
  className,
}: {
  segment: Segment
  advisory: SegmentAdvisory
  corridorName?: string
  onClose?: () => void
  className?: string
}) {
  const { t, ago, stamp, place } = usePrefs()
  const { advisoryCacheTimestamp: cacheTimestamp } = useAppStore()
  const sourceTimestamp = advisory.latestObservationAt
  const condition = advisory.evidence.find((report) => report.kind === 'hazard') ?? advisory.evidence[0]
  const source = advisory.evidence.length
    ? t("source.community")
    : advisory.restriction
      ? t("source.official")
      : t("source.unknown");

  return (
    <section
      className={cn("rp-map-detail-panel", className)}
      aria-labelledby="rp-map-segment-title"
    >
      <div className="rp-map-detail-heading">
        <div className="rp-map-detail-heading-label">
          <span aria-hidden className="rp-map-mountain-mark">
            ⌁
          </span>
          <span>Selected road segment</span>
        </div>
        {onClose && (
          <button
            type="button"
            className="rp-map-detail-close"
            onClick={onClose}
            aria-label="Close selected segment"
          >
            <X aria-hidden />
          </button>
        )}
      </div>

      <div className="rp-map-segment-title-row">
        <h2 id="rp-map-segment-title" className="rp-wrap-anywhere">
          {place(segment.from)} – {place(segment.to)}
        </h2>
        <ActionBadge level={advisory.level} size="lg" />
      </div>
      <p className="rp-map-segment-meta">
        <RoadCode>{segment.code}</RoadCode>
        <span aria-hidden>·</span>
        <span>{segment.distanceKm} km</span>
        {corridorName && (
          <>
            <span aria-hidden>·</span>
            <span>{corridorName}</span>
          </>
        )}
      </p>
      <FreshnessChip
        observationTimestamp={sourceTimestamp}
        className="rp-map-freshness"
      />
      <CacheTimeLabel timestamp={cacheTimestamp} />

      <div className="rp-map-condition">
        <TriangleAlert aria-hidden />
        <div>
          <strong>
            {condition
              ? t(`hazard.${condition.hazardType}`)
              : "No recent observation"}
          </strong>
          <p>{condition?.description ?? t("copy.noRecent")}</p>
        </div>
      </div>

      <dl className="rp-map-observation-grid">
        <div>
          <dt>{t('segment.observationTime')}</dt>
          <dd>
            {advisory.latestObservationAt ? ago(advisory.latestObservationAt) : t('common.unknown')}
            {advisory.latestObservationAt && <small>{stamp(advisory.latestObservationAt)}</small>}
          </dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>
            {source}
            {advisory.evidence.length > 0 && (
              <small>{advisory.evidence.length} reports</small>
            )}
          </dd>
        </div>
        <div>
          <dt>{t('segment.sourceTime')}</dt>
          <dd>
            {sourceTimestamp ? ago(sourceTimestamp) : t('common.unknown')}
            {sourceTimestamp && <small>{stamp(sourceTimestamp)}</small>}
          </dd>
        </div>
      </dl>

      <div className="rp-map-official-info">
        <div className="rp-map-official-heading">
          <ShieldCheck aria-hidden />
          <strong>Official restriction</strong>
        </div>
        {advisory.restriction ? (
          <div className="rp-map-restriction">
            <OfficialBadge
              label={t(`restriction.${advisory.restriction.type}`)}
            />
            <p>{advisory.restriction.title}</p>
            <small>{advisory.restriction.issuingAuthority}</small>
          </div>
        ) : (
          <p className="rp-map-no-official">No current official information</p>
        )}
      </div>

      <Link
        to="/advisories/$segmentId"
        params={{ segmentId: segment.id }}
        className="rp-map-details-link"
      >
        {t('common.viewDetails')} <ArrowRight aria-hidden />
      </Link>

      <div className="rp-map-reports">
        <h3>Available reports ({advisory.evidence.length})</h3>
        {advisory.evidence.length ? (
          <ul>
            {advisory.evidence.slice(0, 3).map((report) => (
              <MapReportRow
                key={report.ref}
                report={report}
                segmentLevel={advisory.level}
              />
            ))}
          </ul>
        ) : (
          <p className="rp-map-no-official">
            No community reports are available for this segment.
          </p>
        )}
      </div>
      <p className="rp-map-detail-footer">
        Prototype visualization · Synthetic data
      </p>
    </section>
  );
}

function MapReportRow({
  report,
  segmentLevel,
}: {
  report: CommunityReport;
  segmentLevel: AdvisoryLevel;
}) {
  const { t, ago, now } = usePrefs();
  const freshness = getFreshnessState(report.observedAt, now);
  const level: AdvisoryLevel =
    freshness === "stale" || report.kind === "clear"
      ? "unknown"
      : segmentLevel === "avoid"
        ? "avoid"
        : "caution";
  const title =
    report.kind === "hazard"
      ? `${t(`hazard.${report.hazardType}`)} reported`
      : "Community condition report";

  return (
    <li className="rp-map-report-row">
      <div className="rp-map-report-icon">
        {level === "unknown" ? (
          <CircleQuestionMark aria-hidden />
        ) : (
          <TriangleAlert aria-hidden />
        )}
      </div>
      <div className="rp-map-report-copy">
        <div className="rp-map-report-title">
          <strong>{title}</strong>
          <ActionBadge level={level} />
        </div>
        <p>{report.description}</p>
        <small>
          {t("source.community")} · {t(`source.${report.source}`)} ·{" "}
          {ago(report.observedAt)}
        </small>
      </div>
    </li>
  );
}
