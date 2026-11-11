import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Camera,
  CircleHelp,
  Clock3,
  FileText,
  ImageOff,
  Info,
  List,
  Link2,
  Map as MapIcon,
  MapPin,
  Route as RouteIcon,
  Shield,
  TriangleAlert,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { ActionBadge, FreshnessChip } from "@/components/advisory";
import { AdvisoryCard } from "@/components/advisory-card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/feedback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SegmentMap } from "@/features/routes/schematic-map";
import {
  SegmentDetail,
  StatusTimeline,
} from "@/features/routes/segment-detail";
import { RouteErrorPage } from "@/components/error-pages";
import { REPORTS, segmentById } from "@/data/fixtures";
import { advisoryFor, reportByRef } from "@/lib/data";
import { getAdvisorySourceTimestamp, type AdvisoryLevel } from "@/lib/advisory";
import { usePrefs } from "@/i18n/preferences";
import type { CommunityReport, Segment } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/advisories/$segmentId")({
  loader: ({ params }) => {
    const report = reportByRef(params.segmentId);
    if (report) {
      const segment = segmentById(report.segmentId);
      if (!segment)
        throw new Error(
          `Missing segment "${report.segmentId}" for report "${report.ref}"`,
        );
      return { kind: "report" as const, report, segment };
    }

    const segment = segmentById(params.segmentId);
    if (!segment) throw notFound();
    return { kind: "segment" as const, segment };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title:
          loaderData?.kind === "report"
            ? `${loaderData.report.ref} · RaahPrahari`
            : `${loaderData?.segment.code ?? "Road details"} · RaahPrahari`,
      },
    ],
  }),
  pendingComponent: () => (
    <LoadingState label="Loading road information…" className="min-h-72" />
  ),
  errorComponent: RouteErrorPage,
  notFoundComponent: DetailNotFound,
  component: SegmentPage,
});

function DetailNotFound() {
  return (
    <div className="rp-container grid min-h-[55vh] place-items-center py-12">
      <div className="max-w-md space-y-4 text-center">
        <CircleHelp
          aria-hidden
          className="mx-auto size-8 text-status-unknown"
        />
        <h1 className="font-display text-2xl font-bold">
          Road information not found
        </h1>
        <p className="text-sm text-muted-foreground">
          This segment or community report is not available.
        </p>
        <Button asChild>
          <Link to="/advisories">Back to search</Link>
        </Button>
      </div>
    </div>
  );
}

function SegmentPage() {
  const data = Route.useLoaderData();
  if (data.kind === "report") {
    return <HazardDetail report={data.report} segment={data.segment} />;
  }
  return <SegmentOverview segment={data.segment} />;
}

export function Banner({
  segment,
  title,
  reportRef,
}: {
  segment: Segment;
  title: string;
  reportRef?: string;
}) {
  const { place } = usePrefs();
  return (
    <header className="border-b border-border bg-card text-foreground">
      <div className="rp-container py-4 sm:py-5">
        <Link
          to="/advisories"
          className="mb-2 inline-flex min-h-11 w-fit items-center gap-2 text-sm text-link hover:text-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring sm:mb-3"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Back to search
        </Link>
        <p className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-link">
          <RouteIcon aria-hidden className="size-4" />
          MOUNTAIN ROAD
          {reportRef && (
            <span className="font-mono tracking-normal">· {reportRef}</span>
          )}
        </p>
        <h1 className="rp-wrap-anywhere max-w-4xl font-display text-2xl leading-tight font-bold sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {place(segment.from)} → {place(segment.to)}
        </p>
        {!reportRef && <RouteSummary segment={segment} />}
      </div>
    </header>
  );
}

function RouteSummary({ segment }: { segment: Segment }) {
  const { duration } = usePrefs();
  return (
    <div>
      <dl className="mt-4 grid grid-cols-1 gap-y-2 border-t border-border pt-3 text-xs sm:grid-cols-3 sm:text-sm">
        <SummaryItem icon={RouteIcon} label={`${segment.distanceKm} km`} />
        <SummaryItem
          icon={Clock3}
          label={`~ ${duration(segment.typicalMinutes)}`}
        />
        <SummaryItem icon={MapPin} label="Elevation unavailable" />
      </dl>
      <p className="basis-full text-[11px] text-muted-foreground">
        All route estimates are illustrative.
      </p>
    </div>
  );
}

function SummaryItem({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 sm:border-r sm:border-white/20 sm:px-3 sm:first:pl-0 sm:last:border-0 sm:last:pr-0">
      <Icon aria-hidden className="size-4 shrink-0 text-blue-on-dark" />
      <dt className="sr-only">Illustrative route estimate</dt>
      <dd>
        {label} <span className="text-text-on-charcoal/65">(illustrative)</span>
      </dd>
    </div>
  );
}

function SegmentOverview({ segment }: { segment: Segment }) {
  const { place, stamp } = usePrefs();
  const [tab, setTab] = useState("overview");
  const advisory = advisoryFor(segment.id);
  if (!advisory)
    throw new Error(`Missing advisory for segment "${segment.id}"`);

  const reports = REPORTS.filter(
    (report) =>
      report.segmentId === segment.id &&
      report.status !== "duplicate" &&
      report.status !== "rejected",
  );
  const hazards = reports.filter((report) => report.kind === "hazard");
  const sourceTimestamp = getAdvisorySourceTimestamp(advisory);

  return (
    <div className="pb-8">
      <Banner
        segment={segment}
        title={`${segment.code.split(" · ")[0]} — ${place(segment.from)} to ${place(segment.to)}`}
      />
      <div className="rp-container grid gap-5 py-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(19rem,0.8fr)] lg:py-6">
        <div className="min-w-0">
          <Tabs value={tab} onValueChange={setTab} className="min-w-0">
            <div
              className="overflow-x-auto border-b border-border"
              tabIndex={0}
              aria-label="Scrollable road information tabs"
            >
              <TabsList
                aria-label="Road information"
                variant="line"
                className="min-w-max gap-2 rounded-none p-0"
              >
                <TabsTrigger
                  value="overview"
                  className="min-w-28 rounded-none px-4 data-[state=active]:text-blue-on-dark"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="hazards"
                  className="min-w-28 rounded-none px-4 data-[state=active]:text-blue-on-dark"
                >
                  Hazards
                </TabsTrigger>
                <TabsTrigger
                  value="conditions"
                  className="min-w-28 rounded-none px-4 data-[state=active]:text-blue-on-dark"
                >
                  Conditions
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="pt-4">
              <div className="grid gap-3 sm:grid-cols-5">
                <SegmentDetail
                  segmentId={segment.id}
                  variant="overview"
                  className="sm:col-span-3"
                />

                <InfoCard
                  title="Information freshness"
                  icon={Clock3}
                  className="sm:col-span-2"
                >
                  <FreshnessChip sourceTimestamp={sourceTimestamp} />
                  <dl className="mt-3 space-y-2 text-xs">
                    <Fact
                      label="Last updated"
                      value={
                        sourceTimestamp ? stamp(sourceTimestamp) : "Unknown"
                      }
                      icon={Link2}
                    />
                    <Fact
                      label="Source"
                      value="Community reports and official sources"
                      icon={UsersRound}
                    />
                  </dl>
                </InfoCard>

                <InfoCard
                  title="Available community reports"
                  icon={UsersRound}
                  className="sm:col-span-3"
                >
                  <div className="grid gap-2 min-[430px]:grid-cols-2">
                    <CountLink
                      count={hazards.length}
                      label="Hazards reported"
                      icon={TriangleAlert}
                      onClick={() => setTab("hazards")}
                    />
                    <CountLink
                      count={reports.length}
                      label="Total reports"
                      icon={FileText}
                      onClick={() => setTab("hazards")}
                    />
                  </div>
                </InfoCard>

                <OfficialRestrictionCard
                  segmentId={segment.id}
                  className="sm:col-span-2"
                />

                <InfoCard
                  title="Source information"
                  icon={Link2}
                  className="sm:col-span-5"
                >
                  <dl className="grid gap-3 text-xs sm:grid-cols-3">
                    <Fact
                      label="Source"
                      value="Submitted by community contributors"
                      icon={UsersRound}
                    />
                    <Fact
                      label="Last updated"
                      value={
                        sourceTimestamp ? stamp(sourceTimestamp) : "Unknown"
                      }
                      icon={Clock3}
                    />
                    <Fact
                      label="Information note"
                      value="Community reports are not official restrictions."
                      icon={Info}
                    />
                  </dl>
                </InfoCard>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link to="/map" search={{ seg: segment.id }}>
                    <MapIcon aria-hidden />
                    View on map
                    <ArrowUpRight aria-hidden />
                  </Link>
                </Button>
                <Button
                  asChild
                  className="bg-brand-orange text-[#111719] hover:bg-brand-orange/90"
                >
                  <Link to="/report" search={{ segment: segment.id }}>
                    <TriangleAlert aria-hidden />
                    Report a hazard
                  </Link>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="hazards" className="space-y-3 pt-4">
              {hazards.length ? (
                hazards.map((report) => (
                  <AdvisoryCard
                    key={report.ref}
                    segment={segment}
                    communityReport={report}
                    variant="community-report"
                  />
                ))
              ) : (
                <EmptyPanel
                  title="No community hazard reports"
                  message="This means no report is available here; it does not establish road conditions."
                />
              )}
            </TabsContent>

            <TabsContent value="conditions" className="space-y-3 pt-4">
              <InfoCard title="Information freshness" icon={Clock3}>
                <FreshnessChip sourceTimestamp={sourceTimestamp} />
                <p className="mt-3 text-sm text-muted-foreground">
                  Freshness reflects the age of the most recent available source
                  timestamp, not a road-safety assessment.
                </p>
              </InfoCard>
              <OfficialRestrictionCard segmentId={segment.id} />
              <InfoCard title="Community information" icon={UsersRound}>
                <p className="text-sm">
                  Submitted by community contributors. Community reports do not
                  establish an official restriction.
                </p>
              </InfoCard>
            </TabsContent>
          </Tabs>
        </div>

        <TerrainPanel segment={segment} reports={hazards} />
      </div>
    </div>
  );
}

function InfoCard({
  title,
  icon: Icon,
  className,
  children,
}: {
  title: string;
  icon: LucideIcon;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card p-3 sm:p-4",
        className,
      )}
    >
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Icon aria-hidden className="size-5 shrink-0 text-blue-on-dark" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Fact({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="grid min-w-0 grid-cols-[auto_1fr] items-start gap-x-2">
      <Icon
        aria-hidden
        className="row-span-2 mt-0.5 size-4 shrink-0 text-muted-foreground"
      />
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="rp-wrap-anywhere text-xs font-medium">{value}</dd>
    </div>
  );
}

function CountLink({
  count,
  label,
  icon: Icon,
  onClick,
}: {
  count: number;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-16 items-center gap-3 rounded-lg border border-border bg-background/50 px-3 text-left hover:border-blue-on-dark/60 focus-visible:outline-2 focus-visible:outline-ring"
    >
      <Icon aria-hidden className="size-5 shrink-0 text-orange-on-dark" />
      <span className="text-lg font-semibold tabular-nums">{count}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
      <ArrowUpRight
        aria-hidden
        className="ml-auto size-4 text-muted-foreground"
      />
    </button>
  );
}

function OfficialRestrictionCard({
  segmentId,
  className,
}: {
  segmentId: string;
  className?: string;
}) {
  const advisory = advisoryFor(segmentId);
  if (!advisory) throw new Error(`Missing advisory for segment "${segmentId}"`);
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card p-3 sm:p-4",
        className,
      )}
    >
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Shield aria-hidden className="size-5 text-status-official" />
        Official restrictions
      </h2>
      {advisory.restriction ? (
        <div className="rounded-md border border-status-official/50 bg-status-official/10 p-3">
          <p className="font-semibold">{advisory.restriction.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {advisory.restriction.issuingAuthority}
          </p>
        </div>
      ) : (
        <p className="flex items-center gap-2 rounded-md border border-status-unknown/40 bg-status-unknown/10 p-3 text-sm">
          <CircleHelp
            aria-hidden
            className="size-4 shrink-0 text-status-unknown"
          />
          No current official information
          <span className="ml-auto text-[11px] text-status-unknown">
            UNKNOWN
          </span>
        </p>
      )}
    </section>
  );
}

function TerrainPanel({
  segment,
  reports,
}: {
  segment: Segment;
  reports: CommunityReport[];
}) {
  const { t, place } = usePrefs();
  const [view, setView] = useState<"map" | "list">("map");
  return (
    <aside
      className="min-w-0 lg:sticky lg:top-20 lg:self-start"
      aria-label="Route map and community reports"
    >
      <div className="relative min-h-[360px] overflow-hidden rounded-xl border border-border bg-[#0b2531] sm:min-h-[440px] lg:min-h-[510px]">
        {view === "map" ? (
          <>
            <img
              src="/img/map-terrain.png"
              alt=""
              className="absolute inset-0 size-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-[#07151f]/20" />
            <SegmentMap
              terrain
              highlight={[segment.id]}
              selectedSegmentId={segment.id}
              endpoints={[segment.from, segment.to]}
              labelPlaces={[segment.from, segment.to]}
              className="absolute inset-0"
            />
          </>
        ) : (
          <div className="relative z-10 h-full min-h-[360px] overflow-y-auto bg-background/95 p-4 sm:min-h-[440px] lg:min-h-[510px]">
            <h2 className="mb-3 font-semibold">Community hazard reports</h2>
            {reports.length ? (
              <ul className="space-y-2">
                {reports.map((report) => (
                  <li key={report.ref}>
                    <Link
                      to="/advisories/$segmentId"
                      params={{ segmentId: report.ref }}
                      className="block rounded-lg border border-border bg-card p-3 hover:border-blue-on-dark/60 focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <TriangleAlert
                          aria-hidden
                          className="size-4 text-orange-on-dark"
                        />
                        {t(`hazard.${report.hazardType}`)}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {report.landmark} · {place(segment.from)}–
                        {place(segment.to)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No community hazard reports are available.
              </p>
            )}
          </div>
        )}

        <div className="absolute top-3 right-3 z-20 inline-flex rounded-lg border border-white/20 bg-[#07151f]/85 p-1">
          <button
            type="button"
            aria-pressed={view === "map"}
            onClick={() => setView("map")}
            className={cn(
              "inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 text-xs",
              view === "map"
                ? "bg-primary text-primary-foreground"
                : "text-white/75 hover:text-white",
            )}
          >
            <MapIcon aria-hidden className="size-3.5" /> Map
          </button>
          <button
            type="button"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
            className={cn(
              "inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 text-xs",
              view === "list"
                ? "bg-primary text-primary-foreground"
                : "text-white/75 hover:text-white",
            )}
          >
            <List aria-hidden className="size-3.5" /> List
          </button>
        </div>

        <ul className="absolute inset-x-2 bottom-2 z-20 grid grid-cols-3 gap-1 rounded-lg border border-white/15 bg-[#07151f]/90 p-2 text-[10px] text-white sm:inset-x-3 sm:bottom-3 sm:gap-2 sm:p-3 sm:text-xs">
          <LegendItem icon={TriangleAlert} label="Reported hazard" />
          <LegendItem icon={Shield} label="Official restriction" />
          <LegendItem icon={CircleHelp} label="Unknown information" />
        </ul>
      </div>
    </aside>
  );
}

function LegendItem({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <li className="flex min-w-0 items-center justify-center gap-1 border-r border-white/15 px-1 last:border-0 sm:gap-2">
      <Icon aria-hidden className="size-4 shrink-0 text-blue-on-dark" />
      <span className="text-center">{label}</span>
    </li>
  );
}

function HazardDetail({
  report,
  segment,
}: {
  report: CommunityReport;
  segment: Segment;
}) {
  const { t, place, stamp, ago } = usePrefs();
  const level: AdvisoryLevel = report.severity === "high" ? "avoid" : "caution";

  return (
    <div className="pb-8">
      <Banner
        segment={segment}
        title={`${t(`hazard.${report.hazardType}`)} report`}
        reportRef={report.ref}
      />
      <div className="rp-container grid gap-5 py-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:py-6">
        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Community report, not an official closure
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold">
                  {t(`hazard.${report.hazardType}`)}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {report.description}
                </p>
              </div>
              <ActionBadge level={level} size="lg" />
            </div>
            <ReportGallery report={report} />
            <h3 className="mb-2 mt-4 text-sm font-semibold">Report facts</h3>
            <dl className="grid gap-x-5 gap-y-3 text-sm sm:grid-cols-2">
              <Fact
                label="Hazard type"
                value={t(`hazard.${report.hazardType}`)}
                icon={TriangleAlert}
              />
              <Fact
                label="Road segment"
                value={`${segment.code} · ${place(segment.from)} to ${place(segment.to)}`}
                icon={RouteIcon}
              />
              <Fact
                label="Observation time"
                value={`${ago(report.observedAt)} · ${stamp(report.observedAt)}`}
                icon={Clock3}
              />
              <Fact
                label="Report submission time"
                value={`${ago(report.receivedAt)} · ${stamp(report.receivedAt)}`}
                icon={FileText}
              />
              <Fact
                label="Source"
                value="Submitted by community contributors"
                icon={UsersRound}
              />
              <Fact
                label="Location accuracy"
                value={`${report.locationConfidence} confidence`}
                icon={MapPin}
              />
              <div className="sm:col-span-2">
                <dt className="mb-1 text-xs text-muted-foreground">
                  Information freshness
                </dt>
                <dd>
                  <FreshnessChip sourceTimestamp={report.observedAt} />
                </dd>
              </div>
            </dl>
          </section>

          <StatusTimeline report={report} level={level} />
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link to="/map" search={{ seg: segment.id }}>
                <MapIcon aria-hidden /> View on map
              </Link>
            </Button>
            <Button
              asChild
              className="bg-brand-orange text-[#111719] hover:bg-brand-orange/90"
            >
              <Link to="/report" search={{ segment: segment.id }}>
                <TriangleAlert aria-hidden /> Report an update
              </Link>
            </Button>
          </div>
          <p className="border-t border-border pt-3 text-xs text-muted-foreground">
            This is a community-reported hazard and has not been independently
            confirmed.
          </p>
        </div>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <OfficialRestrictionCard segmentId={segment.id} />
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <MapPin aria-hidden className="size-5 text-blue-on-dark" />{" "}
              Location
            </h2>
            <p className="text-sm font-medium">{report.landmark}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {place(segment.from)} to {place(segment.to)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Location accuracy: {report.locationConfidence} confidence
            </p>
            <div className="relative mt-3 h-44 overflow-hidden rounded-lg border border-border">
              <img
                src="/img/map-terrain.png"
                alt=""
                className="size-full object-cover"
              />
              <div className="absolute inset-0 grid place-items-center bg-[#07151f]/55 text-center">
                <div>
                  <CircleHelp
                    aria-hidden
                    className="mx-auto size-7 text-status-unknown"
                  />
                  <p className="mt-1 text-xs text-white">
                    Coordinates unavailable
                  </p>
                </div>
              </div>
            </div>
          </section>
          <p className="rounded-lg border border-status-unknown/40 bg-status-unknown/10 p-3 text-xs text-muted-foreground">
            <Info
              aria-hidden
              className="mr-1 inline size-4 align-text-bottom"
            />
            The community report and any official restriction are shown as
            separate information.
          </p>
        </div>
      </div>
    </div>
  );
}

function ReportGallery({ report }: { report: CommunityReport }) {
  const imageCount = Math.min(report.photoCount, 4);
  return (
    <section aria-label="Community report image gallery" className="mt-4">
      {imageCount > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: imageCount }, (_, index) => (
            <div
              key={index}
              className="grid min-h-24 place-items-center rounded-lg border border-dashed border-border bg-background/70 p-3 text-center"
            >
              <div>
                <ImageOff
                  aria-hidden
                  className="mx-auto size-5 text-muted-foreground"
                />
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Community image unavailable in demo
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
          <Camera
            aria-hidden
            className="mr-1 inline size-4 align-text-bottom"
          />
          No images were submitted with this report.
        </p>
      )}
    </section>
  );
}

function EmptyPanel({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-5 text-center">
      <CircleHelp aria-hidden className="mx-auto size-6 text-status-unknown" />
      <h2 className="mt-2 font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
