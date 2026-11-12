import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock3,
  ShieldCheck,
  TriangleAlert,
  UsersRound,
} from "lucide-react";
import {
  ActionBadge,
  CacheTimeLabel,
  FreshnessChip,
  OfficialBadge,
  RoadCode,
} from "@/components/advisory";
import { usePrefs } from "@/i18n/preferences";
import { getAdvisorySourceTimestamp } from "@/lib/advisory";
import type { CommunityReport, Segment } from "@/lib/types";
import { useAppStore } from "@/lib/app-store";
import { cn } from "@/lib/utils";

export function AdvisoryCard({
  segment,
  className,
  variant = "default",
  communityReport,
  showRestrictionDetail = false,
}: {
  segment: Segment;
  className?: string;
  variant?: "default" | "home-featured" | "community-report";
  communityReport?: CommunityReport;
  showRestrictionDetail?: boolean;
}) {
  const { t, place, ago, stamp } = usePrefs();
  const { advisories, advisoryCacheTimestamp: cacheTimestamp } = useAppStore();
  const advisory = advisories.get(segment.id);
  if (!advisory) {
    throw new Error(`Missing advisory for segment "${segment.id}"`);
  }
  const report = advisory.evidence[0];
  const activeClosure = advisory.restriction?.type === "road_closed";
  const sources = [
    ...(advisory.evidence.length > 0 ? [t("source.community")] : []),
    ...(advisory.restriction ? [t("source.official")] : []),
  ];

  if (variant === "community-report") {
    if (!communityReport) {
      throw new Error(
        "A community report is required for the community-report card",
      );
    }
    const level = communityReport.severity === "high" ? "avoid" : "caution";
    return (
      <article
        className={cn(
          "rp-card rp-enter rounded-lg border border-border bg-card",
          className,
        )}
      >
        <Link
          to="/advisories/$segmentId"
          params={{ segmentId: communityReport.ref }}
          className="block rounded-[inherit] p-4 focus-visible:outline-offset-[-3px]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">
              {t(`hazard.${communityReport.hazardType}`)}
            </h2>
            <ActionBadge level={level} />
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {communityReport.description}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {segment.code} · {communityReport.landmark} · Observed{" "}
            {ago(communityReport.observedAt)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <FreshnessChip sourceTimestamp={communityReport.observedAt} />
            <CacheTimeLabel timestamp={cacheTimestamp} />
            <span className="text-xs text-blue-on-dark">
              Community report, not an official closure
            </span>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "home-featured") {
    // Everything on this card is derived from the store's advisory for the segment.
    const sourceTimestamp = getAdvisorySourceTimestamp(advisory);
    const lastUpdated =
      sourceTimestamp === undefined
        ? t("level.unknown")
        : `${ago(sourceTimestamp)} · ${stamp(sourceTimestamp)}`;
    const leadHazard =
      advisory.evidence.find((r) => r.kind === "hazard") ?? report;

    return (
      <article className={cn("home-advisory photo-surface", className)}>
        <Link
          to="/advisories/$segmentId"
          params={{ segmentId: segment.id }}
          className="home-advisory-link"
        >
          <p className="home-advisory-kicker">
            <TriangleAlert aria-hidden />
            ROAD ADVISORY
          </p>
          <div className="home-advisory-status">
            <ActionBadge
              level={advisory.level}
              size="lg"
              className="home-avoid-badge"
            />
            <RoadCode className="home-advisory-road">
              {segment.code} · km {segment.kmStart}–{segment.kmEnd}
            </RoadCode>
          </div>
          <p className="home-advisory-description">
            {place(segment.from)} – {place(segment.to)}:{" "}
            {leadHazard?.description ?? t("copy.noRecent")}
          </p>
          <dl className="home-advisory-details">
            <div>
              <ShieldCheck aria-hidden />
              <dt>Official restriction:</dt>
              <dd>
                {advisory.restriction?.title ??
                  "No current official information"}
              </dd>
            </div>
            <div>
              <UsersRound aria-hidden />
              <dt>Evidence:</dt>
              <dd>{t(`basis.${advisory.basis}`)}</dd>
            </div>
            <div>
              <Clock3 aria-hidden />
              <dt>Last updated:</dt>
              <dd>{lastUpdated}</dd>
            </div>
          </dl>
          <p className="home-advisory-footer">
            Illustrative synthetic information
          </p>
        </Link>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "rp-card rp-enter rounded-xl border border-border bg-card",
        className,
      )}
    >
      <Link
        to="/advisories/$segmentId"
        params={{ segmentId: segment.id }}
        className="block rounded-[inherit] p-4 focus-visible:outline-offset-[-3px]"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <RoadCode>
              {segment.code} · km {segment.kmStart}–{segment.kmEnd}
            </RoadCode>
            <h2 className="rp-wrap-anywhere mt-1 font-semibold">
              {place(segment.from)} – {place(segment.to)}
            </h2>
          </div>
          <ActionBadge level={advisory.level} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {report?.description ?? t("copy.noRecent")}
        </p>
        {(showRestrictionDetail || activeClosure) && (
          <p className="mt-3 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {t("map.restriction")}:
            </span>{" "}
            {advisory.restriction?.title ?? "No current official information"}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <FreshnessChip
            sourceTimestamp={getAdvisorySourceTimestamp(advisory)}
          />
          <CacheTimeLabel timestamp={cacheTimestamp} />
          {advisory.restriction && (
            <OfficialBadge label={t("map.restriction")} />
          )}
          <span className="text-xs text-muted-foreground">
            {sources.length ? sources.join(" · ") : t("source.unknown")}
          </span>
          <ArrowRight aria-hidden className="rp-arrow ml-auto size-4 text-link" />
        </div>
      </Link>
    </article>
  );
}
