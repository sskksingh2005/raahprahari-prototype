import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Check,
  Clock,
  List,
  Map as MapIcon,
  Mic,
  Radio,
  Route as RouteIcon,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { AdvisoryCard } from "@/components/advisory-card";
import { VoiceCopilotDrawer } from "@/components/voice-copilot-drawer";
import { useSlidingHighlight } from "@/components/motion";
import { PLACES } from "@/data/fixtures";
import {
  LeafletMapLegend,
  LeafletSegmentMap,
} from "@/features/map/leaflet-segment-map";
import { NetworkCoverageInsights } from "@/features/map/network-coverage-insights";
import {
  ScreenEmpty,
  ScreenError,
  ScreenLoading,
} from "@/components/screen-states";
import { SegmentDetail } from "@/features/routes/segment-detail";
import { usePrefs } from "@/i18n/preferences";
import { useAppStore } from "@/lib/app-store";
import { useScreenState } from "@/lib/use-screen-state";
import { cn } from "@/lib/utils";
import { planRoutes, type RouteDesignation } from "@/lib/route-planner";
import {
  getConvoyPulse,
  getDepartureAdvice,
  recordSafeTransitCheckIn,
  type DepartureRating,
  type DepartureReason,
  type SafeTransitCheckInState,
} from "@/lib/departure-advisor";
import {
  processVoiceCommand,
  type VoiceCopilotLanguage,
  type VoiceCopilotResult,
} from "@/lib/voice-copilot";
import { getNetworkCoverage } from "@/data/network-coverage";
import type { NetworkCarrierFilter, NetworkQuality } from "@/lib/types";
import { createEmptyReportDraft, REPORT_HAZARDS } from "@/lib/report-store";
import { toast } from "sonner";
import "./map.css";

type MapSearch = { seg?: string; view?: "map" | "list" };
type ViewMode = "map" | "list";

const designationLabel: Record<
  RouteDesignation,
  | "planner.safest"
  | "planner.fastest"
  | "planner.bestNetwork"
  | "planner.alternative"
> = {
  safest: "planner.safest",
  fastest: "planner.fastest",
  best_network: "planner.bestNetwork",
  alternative: "planner.alternative",
};

const networkLabel: Record<
  NetworkQuality,
  "network.strong" | "network.moderate" | "network.weak" | "network.deadZone"
> = {
  strong: "network.strong",
  moderate: "network.moderate",
  weak: "network.weak",
  dead_zone: "network.deadZone",
};

const departureRatingLabel: Record<
  DepartureRating,
  | "departure.rating.optimal"
  | "departure.rating.caution"
  | "departure.rating.highRisk"
> = {
  optimal: "departure.rating.optimal",
  caution: "departure.rating.caution",
  high_risk: "departure.rating.highRisk",
};

const departureGuidanceLabel: Record<
  DepartureRating,
  | "departure.guidance.optimal"
  | "departure.guidance.caution"
  | "departure.guidance.highRisk"
> = {
  optimal: "departure.guidance.optimal",
  caution: "departure.guidance.caution",
  high_risk: "departure.guidance.highRisk",
};

const departureReasonLabel: Record<
  DepartureReason,
  | "departure.reason.daylight"
  | "departure.reason.night"
  | "departure.reason.afternoon"
  | "departure.reason.hazard"
  | "departure.reason.restriction"
  | "departure.reason.network"
  | "departure.reason.updates"
  | "departure.reason.closed"
> = {
  daylight: "departure.reason.daylight",
  night_visibility: "departure.reason.night",
  afternoon_weather: "departure.reason.afternoon",
  active_hazard: "departure.reason.hazard",
  official_restriction: "departure.reason.restriction",
  network_gaps: "departure.reason.network",
  limited_updates: "departure.reason.updates",
  closed_route: "departure.reason.closed",
};

function localTimeLabel(timestamp: number, lang: "en" | "hi"): string {
  return new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

export const Route = createFileRoute("/map")({
  validateSearch: (search: Record<string, unknown>): MapSearch => ({
    seg: typeof search.seg === "string" ? search.seg : undefined,
    view:
      search.view === "list"
        ? "list"
        : search.view === "map"
          ? "map"
          : undefined,
  }),
  head: () => ({ meta: [{ title: "Live map · RaahPrahari" }] }),
  component: MapPage,
});

function MapPage() {
  const { t, place, stamp, lang } = usePrefs();
  const {
    segments: SEGMENTS,
    corridors,
    advisories,
    reportDraft,
    saveReportDraft,
  } = useAppStore();
  const { status, retry } = useScreenState(() =>
    SEGMENTS.every((segment) => advisories.has(segment.id)),
  );
  const corridorById = (id: string) =>
    corridors.find((corridor) => corridor.id === id);
  const segmentById = (id: string) =>
    SEGMENTS.find((segment) => segment.id === id);
  const search = Route.useSearch();
  const initialSegment =
    search.seg && segmentById(search.seg) ? search.seg : "nh7-06";
  const [selectedSegmentId, setSelectedSegmentId] = useState<
    string | undefined
  >(initialSegment);
  const [view, setView] = useState<ViewMode>(search.view ?? "map");
  const [query, setQuery] = useState("");
  const [mapFailed, setMapFailed] = useState(false);
  const [networkHeatmap, setNetworkHeatmap] = useState(false);
  const [networkCarrier, setNetworkCarrier] =
    useState<NetworkCarrierFilter>("all");
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [originId, setOriginId] = useState("dehradun");
  const [destinationId, setDestinationId] = useState("badrinath");
  const [activeRouteId, setActiveRouteId] = useState<string>();
  const [departureReferenceTime] = useState(() => Date.now());
  const [selectedDepartureIndex, setSelectedDepartureIndex] = useState(0);
  const [transitCheckInsByRoute, setTransitCheckInsByRoute] = useState<
    Record<string, SafeTransitCheckInState>
  >({});
  const navigate = Route.useNavigate();
  const toggleRef = useSlidingHighlight<HTMLDivElement>(view);

  const selectSegment = (id: string | undefined) => {
    setSelectedSegmentId(id);
    void navigate({
      search: (previous) => ({ ...previous, seg: id }),
      replace: true,
      resetScroll: false,
    });
  };
  const onMapUnavailable = () => {
    setMapFailed(true);
    setView("list");
  };

  const filteredSegments = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return SEGMENTS;
    return SEGMENTS.filter((segment) => {
      const corridor = corridors.find((item) => item.id === segment.corridorId);
      return [
        segment.code,
        corridor?.name,
        place(segment.from),
        place(segment.to),
      ].some((value) => value?.toLocaleLowerCase().includes(term));
    });
  }, [place, query, SEGMENTS, corridors]);
  const selectedSegment = selectedSegmentId
    ? segmentById(selectedSegmentId)
    : undefined;
  const selectedNetworkCoverage =
    networkHeatmap && selectedSegmentId
      ? getNetworkCoverage(selectedSegmentId)
      : undefined;
  const plannedRoutes = useMemo(
    () =>
      plannerOpen
        ? planRoutes({
            originId,
            destinationId,
            advisories,
            places: PLACES,
            corridors,
            segments: SEGMENTS,
          })
        : [],
    [advisories, corridors, destinationId, originId, plannerOpen, SEGMENTS],
  );
  const activeRoute =
    plannedRoutes.find((route) => route.id === activeRouteId) ??
    plannedRoutes[0];
  const departureAdvice = useMemo(
    () =>
      activeRoute
        ? getDepartureAdvice(activeRoute, {
            referenceTime: departureReferenceTime,
          })
        : undefined,
    [activeRoute, departureReferenceTime],
  );
  const selectedDepartureWindow =
    departureAdvice?.windows[selectedDepartureIndex] ??
    departureAdvice?.bestWindow;
  const convoyPulse = activeRoute
    ? getConvoyPulse(
        activeRoute,
        transitCheckInsByRoute[activeRoute.id] ?? { count: 0 },
      )
    : undefined;
  const safeTransitCheckInAllowed = Boolean(
    convoyPulse?.canCheckIn && selectedDepartureWindow?.rating !== "high_risk",
  );
  const highlightedSegments = selectedSegment
    ? SEGMENTS.filter(
        (segment) => segment.corridorId === selectedSegment.corridorId,
      ).map((segment) => segment.id)
    : undefined;

  const changeView = (nextView: ViewMode) => {
    if (nextView === "map" && mapFailed) return;
    setView(nextView);
  };

  const runVoiceCommand = (
    command: string,
    lang: VoiceCopilotLanguage,
  ): VoiceCopilotResult =>
    processVoiceCommand(command, lang, {
      segments: SEGMENTS,
      places: PLACES,
      corridors,
      advisories,
      selectedSegmentId,
    });

  const applyVoiceResult = (result: VoiceCopilotResult) => {
    setView("map");
    const focusSegmentId = result.focusSegmentIds[0];
    if (result.intent === "route_query" && result.routePair) {
      setVoiceOpen(false);
      setPlannerOpen(true);
      setOriginId(result.routePair.fromId);
      setDestinationId(result.routePair.toId);
      setActiveRouteId(result.routeOptions[0]?.id);
      if (focusSegmentId) selectSegment(focusSegmentId);
      return;
    }

    if (result.intent === "hazard_draft" && result.draftReport) {
      const currentDraftHasContent = Boolean(
        reportDraft?.hazardType ||
        reportDraft?.description ||
        reportDraft?.location ||
        reportDraft?.photo,
      );
      if (
        currentDraftHasContent &&
        !window.confirm(t("voice.replaceDraftConfirm"))
      ) {
        return;
      }

      const voiceDraft = result.draftReport;
      const supportedHazard =
        REPORT_HAZARDS.find((hazard) => hazard === voiceDraft.hazardType) ??
        "other";
      const segment = voiceDraft.segmentId
        ? segmentById(voiceDraft.segmentId)
        : undefined;
      const fromPlace = segment
        ? PLACES.find((item) => item.id === segment.from)
        : undefined;
      const toPlace = segment
        ? PLACES.find((item) => item.id === segment.to)
        : undefined;
      const location = segment
        ? {
            query: `${place(segment.from)} – ${place(segment.to)}`,
            roadSegment: segment.code,
            lat:
              fromPlace && toPlace ? (fromPlace.lat + toPlace.lat) / 2 : null,
            lon:
              fromPlace && toPlace ? (fromPlace.lon + toPlace.lon) / 2 : null,
            accuracyM: null,
            source: "manual" as const,
            confirmed: false,
          }
        : null;
      const categoryNote =
        voiceDraft.hazardType === supportedHazard
          ? ""
          : t("voice.draftCategory").replace(
              "{category}",
              voiceDraft.hazardType.replaceAll("_", " "),
            ) + "\n";
      const severityNote =
        voiceDraft.severity === "unknown"
          ? ""
          : t("voice.draftSeverity").replace(
              "{severity}",
              t(
                voiceDraft.severity === "high"
                  ? "voice.severityHigh"
                  : voiceDraft.severity === "moderate"
                    ? "voice.severityModerate"
                    : "voice.severityLow",
              ),
            ) + "\n";
      try {
        saveReportDraft({
          ...createEmptyReportDraft(new Date()),
          hazardType: supportedHazard,
          description:
            `${categoryNote}${severityNote}${voiceDraft.description}`.slice(
              0,
              500,
            ),
          location,
        });
      } catch {
        toast.error(t("voice.draftSaveFailed"));
        return;
      }
      setVoiceOpen(false);
      if (focusSegmentId) selectSegment(focusSegmentId);
      void navigate({
        to: "/report",
        search: { segment: voiceDraft.segmentId },
      });
      return;
    }

    if (focusSegmentId) {
      setPlannerOpen(false);
      setVoiceOpen(false);
      selectSegment(focusSegmentId);
    }
  };

  return (
    <div className="rp-map-page">
      <div
        className="rp-map-toolbar glass"
        role="search"
        aria-label="Search road segments"
      >
        <label className="rp-map-search glass">
          <Search aria-hidden className="size-4 shrink-0" />
          <span className="sr-only">Search by road, place, or location</span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              const nextQuery = event.target.value;
              setQuery(nextQuery);
              const normalized = nextQuery.trim().toLocaleLowerCase();
              if (!normalized) return;
              const matching = SEGMENTS.find((segment) => {
                const corridor = corridorById(segment.corridorId);
                return [
                  segment.code,
                  corridor?.name,
                  place(segment.from),
                  place(segment.to),
                ].some((value) =>
                  value?.toLocaleLowerCase().includes(normalized),
                );
              });
              if (matching) selectSegment(matching.id);
            }}
            placeholder="Search by road, place, or location..."
          />
          {query && (
            <button
              type="button"
              className="rp-map-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X aria-hidden className="size-4" />
            </button>
          )}
        </label>
        <div className="rp-map-toolbar-actions">
          <button
            type="button"
            className="rp-map-plan-toggle glass"
            aria-expanded={plannerOpen}
            aria-label={t(plannerOpen ? "planner.close" : "planner.open")}
            onClick={() => {
              setView("map");
              setVoiceOpen(false);
              setPlannerOpen((open) => !open);
            }}
          >
            <RouteIcon aria-hidden />
            <span>{t("planner.open")}</span>
          </button>
          <button
            type="button"
            className="rp-map-voice-toggle glass"
            aria-pressed={voiceOpen}
            aria-label={t(voiceOpen ? "voice.close" : "voice.open")}
            onClick={() => {
              setView("map");
              setPlannerOpen(false);
              setVoiceOpen((open) => !open);
            }}
          >
            <Mic aria-hidden />
            <span>{t("voice.open")}</span>
          </button>
          <div
            ref={toggleRef}
            className="rp-map-toggle glass-pill rp-segmented"
            role="group"
            aria-label="Map or list view"
          >
            {(["map", "list"] as const).map((nextView) => (
              <button
                key={nextView}
                type="button"
                aria-pressed={view === nextView}
                disabled={nextView === "map" && mapFailed}
                onClick={() => changeView(nextView)}
              >
                {nextView === "map" ? (
                  <MapIcon aria-hidden />
                ) : (
                  <List aria-hidden />
                )}
                {nextView === "map" ? "Map" : "List"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rp-map-layout">
        <div className="rp-map-main">
          {view === "map" && <h1 className="sr-only">Live road map</h1>}
          {mapFailed && (
            <p className="rp-map-fallback-notice glass-strong" role="status">
              The map tiles could not be loaded. Showing the road list instead.
            </p>
          )}

          {status === "loading" ? (
            <div className="rp-map-state">
              <ScreenLoading />
            </div>
          ) : status === "error" ? (
            <div className="rp-map-state">
              <ScreenError onRetry={retry} />
            </div>
          ) : !SEGMENTS.length ? (
            <div className="rp-map-state">
              <ScreenEmpty
                title={t("map.emptyTitle")}
                message={t("map.emptyBody")}
              />
            </div>
          ) : view === "map" ? (
            <section className="rp-map-canvas" aria-label="Live road map">
              <LeafletSegmentMap
                segments={SEGMENTS}
                highlight={highlightedSegments}
                fitTo={SEGMENTS.map((segment) => segment.id)}
                selectedSegmentId={selectedSegmentId}
                onSelectSegment={selectSegment}
                onUnavailable={onMapUnavailable}
                label="Interactive map of road segments"
                className="rp-map-leaflet"
                networkHeatmap={networkHeatmap}
                onNetworkHeatmapChange={setNetworkHeatmap}
                networkCarrier={networkCarrier}
                onNetworkCarrierChange={setNetworkCarrier}
                routes={plannedRoutes}
                activeRouteId={activeRoute?.id}
                onSelectRoute={setActiveRouteId}
              />
              <LeafletMapLegend className="rp-map-legend glass-strong" />
              {voiceOpen ? (
                <VoiceCopilotDrawer
                  onClose={() => setVoiceOpen(false)}
                  onCommand={runVoiceCommand}
                  onResult={applyVoiceResult}
                />
              ) : plannerOpen ? (
                <aside
                  className="rp-map-detail rp-map-route-planner glass-strong"
                  aria-label={t("planner.title")}
                >
                  <header className="rp-map-detail-heading">
                    <span className="rp-map-detail-heading-label">
                      <RouteIcon aria-hidden className="size-4" />
                      {t("planner.title")}
                    </span>
                    <button
                      type="button"
                      className="rp-map-detail-close"
                      onClick={() => setPlannerOpen(false)}
                      aria-label={t("planner.close")}
                    >
                      <X aria-hidden />
                    </button>
                  </header>

                  <div className="rp-map-planner-form">
                    <label>
                      <span>{t("search.from")}</span>
                      <select
                        value={originId}
                        onChange={(event) => setOriginId(event.target.value)}
                      >
                        {PLACES.map((item) => (
                          <option key={item.id} value={item.id}>
                            {place(item.id)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      className="rp-map-planner-swap"
                      aria-label={t("search.swap")}
                      onClick={() => {
                        setOriginId(destinationId);
                        setDestinationId(originId);
                      }}
                    >
                      <ArrowLeftRight aria-hidden />
                    </button>
                    <label>
                      <span>{t("search.to")}</span>
                      <select
                        value={destinationId}
                        onChange={(event) =>
                          setDestinationId(event.target.value)
                        }
                      >
                        {PLACES.map((item) => (
                          <option key={item.id} value={item.id}>
                            {place(item.id)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="rp-map-planner-presets">
                    <h2>{t("planner.quickRoutes")}</h2>
                    <div>
                      {[
                        ["dehradun", "rishikesh"],
                        ["rishikesh", "badrinath"],
                        ["dehradun", "mussoorie"],
                      ].map(([from, to]) => (
                        <button
                          key={`${from}-${to}`}
                          type="button"
                          aria-pressed={
                            originId === from && destinationId === to
                          }
                          onClick={() => {
                            setOriginId(from);
                            setDestinationId(to);
                          }}
                        >
                          {place(from)} → {place(to)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="rp-map-planner-disclaimer">
                    {t("planner.disclaimer")}
                  </p>

                  {plannedRoutes.length ? (
                    <>
                      <section
                        className="rp-map-planner-comparisons"
                        aria-label={t("planner.alternatives")}
                      >
                        <h2>{t("planner.alternatives")}</h2>
                        {plannedRoutes.map((route) => (
                          <button
                            key={route.id}
                            type="button"
                            className={cn(
                              "rp-map-planner-card",
                              route.id === activeRoute?.id && "is-active",
                            )}
                            aria-pressed={route.id === activeRoute?.id}
                            onClick={() => {
                              setActiveRouteId(route.id);
                              setSelectedDepartureIndex(0);
                            }}
                          >
                            <span className="rp-map-planner-card-heading">
                              <strong>
                                {route.designations
                                  .map((designation) =>
                                    t(designationLabel[designation]),
                                  )
                                  .join(" · ")}
                              </strong>
                            </span>
                            <span className="rp-map-planner-card-stats">
                              <span>
                                {t("planner.distance")}: {route.distanceKm} km
                              </span>
                              <span>
                                {t("planner.eta")}:{" "}
                                {t("planner.minutes").replace(
                                  "{count}",
                                  String(route.etaMinutes),
                                )}
                              </span>
                              <span>
                                {t("planner.safetyScore")}: {route.safetyScore}
                                /100
                              </span>
                              <span>
                                {t("planner.networkScore")}:{" "}
                                {route.networkScore}/100
                              </span>
                              <span>
                                {t("planner.hazards")}: {route.hazardCount}
                              </span>
                              <span>
                                {t("planner.restrictions")}:{" "}
                                {route.restrictionCount}
                              </span>
                              <span>
                                {t("planner.deadZoneKm").replace(
                                  "{count}",
                                  String(route.deadZoneKm),
                                )}
                              </span>
                            </span>
                            {route.hasRoadClosure && (
                              <span className="rp-map-planner-closure">
                                {t("planner.officialClosure")}
                              </span>
                            )}
                            {route.corridorNames.length > 0 && (
                              <span className="rp-map-planner-corridors">
                                {route.corridorNames.join(" · ")}
                              </span>
                            )}
                          </button>
                        ))}
                      </section>

                      {activeRoute &&
                        departureAdvice &&
                        selectedDepartureWindow &&
                        convoyPulse && (
                          <section
                            className="rp-map-departure"
                            aria-label={t("departure.title")}
                          >
                            <header className="rp-map-departure-heading">
                              <span>
                                <Clock aria-hidden />
                                {t("departure.title")}
                              </span>
                            </header>

                            <div
                              className="rp-map-departure-best"
                              data-rating={departureAdvice.bestWindow.rating}
                            >
                              <div>
                                <span>{t("departure.bestWindow")}</span>
                                <strong>
                                  {localTimeLabel(
                                    departureAdvice.bestWindow.departureAt,
                                    lang,
                                  )}{" "}
                                  · {departureAdvice.bestWindow.score}/100 ·{" "}
                                  {t(
                                    departureRatingLabel[
                                      departureAdvice.bestWindow.rating
                                    ],
                                  )}
                                </strong>
                              </div>
                              <p>
                                {t("departure.scoreDelta").replace(
                                  "{count}",
                                  String(departureAdvice.scoreDelta),
                                )}
                              </p>
                              <p>
                                {t(
                                  departureGuidanceLabel[
                                    departureAdvice.bestWindow.rating
                                  ],
                                )}
                              </p>
                              {departureAdvice.bestWindow.reasons.length >
                                0 && (
                                <ul>
                                  {departureAdvice.bestWindow.reasons.map(
                                    (reason) => (
                                      <li key={reason}>
                                        {t(departureReasonLabel[reason])}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              )}
                            </div>

                            <div className="rp-map-departure-slots">
                              <h3>{t("departure.slots")}</h3>
                              <div
                                role="group"
                                aria-label={t("departure.slots")}
                              >
                                {departureAdvice.windows.map(
                                  (window, index) => (
                                    <button
                                      key={window.departureAt}
                                      type="button"
                                      aria-pressed={
                                        index === selectedDepartureIndex
                                      }
                                      aria-label={
                                        t("departure.leaveAt").replace(
                                          "{time}",
                                          localTimeLabel(
                                            window.departureAt,
                                            lang,
                                          ),
                                        ) +
                                        ` · ${window.score}/100 · ${t(departureRatingLabel[window.rating])}`
                                      }
                                      data-rating={window.rating}
                                      onClick={() =>
                                        setSelectedDepartureIndex(index)
                                      }
                                    >
                                      {localTimeLabel(window.departureAt, lang)}
                                      <span>
                                        {t(departureRatingLabel[window.rating])}
                                      </span>
                                    </button>
                                  ),
                                )}
                              </div>
                            </div>

                            <div
                              className="rp-map-departure-selected"
                              data-rating={selectedDepartureWindow.rating}
                            >
                              <div className="rp-map-departure-selected-stats">
                                <span>
                                  {t("departure.selectedScore")}
                                  <strong>
                                    {selectedDepartureWindow.score}/100 ·{" "}
                                    {t(
                                      departureRatingLabel[
                                        selectedDepartureWindow.rating
                                      ],
                                    )}
                                  </strong>
                                </span>
                                <span>
                                  {t("departure.projectedArrival")}
                                  <strong>
                                    {localTimeLabel(
                                      selectedDepartureWindow.arrivalAt,
                                      lang,
                                    )}
                                  </strong>
                                </span>
                              </div>
                              <p>
                                {t(
                                  departureGuidanceLabel[
                                    selectedDepartureWindow.rating
                                  ],
                                )}
                              </p>
                              {selectedDepartureWindow.reasons.length > 0 && (
                                <ul>
                                  {selectedDepartureWindow.reasons.map(
                                    (reason) => (
                                      <li key={reason}>
                                        {t(departureReasonLabel[reason])}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              )}
                            </div>

                            <div className="rp-map-convoy-pulse">
                              <div className="rp-map-convoy-heading">
                                <h3>
                                  <Radio aria-hidden />
                                  {t("departure.pulseTitle")}
                                </h3>
                                <strong>{convoyPulse.pulseCount}</strong>
                              </div>
                              <p>
                                {t("departure.estimatedCrossings")}:{" "}
                                {convoyPulse.estimatedSafeCrossingsLastHour}
                              </p>
                              <p>
                                {t("departure.localCheckIns").replace(
                                  "{count}",
                                  String(convoyPulse.localCheckInCount),
                                )}
                              </p>
                              <p>
                                <span>{t("departure.lastVerified")}: </span>
                                {convoyPulse.lastVerifiedRoadCheckInAt
                                  ? stamp(convoyPulse.lastVerifiedRoadCheckInAt)
                                  : t("departure.noVerified")}
                              </p>
                              {convoyPulse.lastLocalCheckInAt && (
                                <p role="status">
                                  {t("departure.lastLocalCheckIn")}:{" "}
                                  {stamp(convoyPulse.lastLocalCheckInAt)}
                                </p>
                              )}
                              <button
                                type="button"
                                className="rp-map-convoy-check-in"
                                disabled={!safeTransitCheckInAllowed}
                                onClick={() => {
                                  const checkInAt = Date.now();
                                  setTransitCheckInsByRoute((current) => ({
                                    ...current,
                                    [activeRoute.id]: recordSafeTransitCheckIn(
                                      current[activeRoute.id] ?? { count: 0 },
                                      checkInAt,
                                    ),
                                  }));
                                  toast.success(t("departure.checkInSaved"));
                                }}
                              >
                                <ShieldCheck aria-hidden />
                                {t("departure.checkIn")}
                              </button>
                              {!safeTransitCheckInAllowed && (
                                <p
                                  className="rp-map-convoy-blocked"
                                  role="status"
                                >
                                  {t("departure.checkInBlocked")}
                                </p>
                              )}
                              <p className="rp-map-convoy-disclaimer">
                                {t("departure.pulseDisclaimer")}
                              </p>
                            </div>
                          </section>
                        )}

                      {activeRoute && (
                        <section className="rp-map-planner-steps">
                          <h2>{t("planner.segmentBreakdown")}</h2>
                          {activeRoute.steps.map((step) => (
                            <article
                              className="rp-map-planner-step"
                              key={step.segment.id}
                            >
                              <div>
                                <h3>
                                  {place(step.fromId)} → {place(step.toId)}
                                </h3>
                                <span>
                                  {step.segment.code} ·{" "}
                                  {step.segment.distanceKm} km
                                </span>
                              </div>
                              <div className="rp-map-planner-step-status">
                                <span
                                  className={`rp-map-planner-level level-${step.advisory?.level ?? "unknown"}`}
                                >
                                  {t(
                                    `level.${step.advisory?.level ?? "unknown"}`,
                                  )}
                                </span>
                                {step.networkCoverage && (
                                  <span>
                                    {t(
                                      networkLabel[
                                        step.networkCoverage.quality
                                      ],
                                    )}
                                  </span>
                                )}
                              </div>
                            </article>
                          ))}
                        </section>
                      )}
                    </>
                  ) : (
                    <p className="rp-map-planner-empty" role="status">
                      {originId === destinationId
                        ? t("planner.chooseDifferentPlaces")
                        : t("results.none")}
                    </p>
                  )}
                </aside>
              ) : (
                <SegmentDetail
                  segmentId={selectedSegmentId}
                  variant="map"
                  className="rp-map-detail glass-strong"
                  onClose={() => selectSegment(undefined)}
                  additionalContent={
                    selectedNetworkCoverage ? (
                      <NetworkCoverageInsights
                        coverage={selectedNetworkCoverage}
                        carrier={networkCarrier}
                      />
                    ) : undefined
                  }
                />
              )}
            </section>
          ) : (
            <section
              className="rp-map-list-view"
              aria-label="Road segment list"
            >
              <div className="rp-map-list">
                <div className="rp-map-list-heading">
                  <div>
                    <p className="rp-map-kicker">Road conditions</p>
                    <h1 className="rp-page-title">Road segments</h1>
                  </div>
                  <span>{filteredSegments.length} segments</span>
                </div>
                {filteredSegments.length ? (
                  <div className="rp-map-list-cards">
                    {filteredSegments.map((segment) => (
                      <article
                        key={segment.id}
                        className={cn(
                          "rp-map-list-card glass",
                          segment.id === selectedSegmentId && "is-selected",
                        )}
                      >
                        <button
                          type="button"
                          className="rp-map-list-select glass"
                          aria-pressed={segment.id === selectedSegmentId}
                          onClick={() => selectSegment(segment.id)}
                        >
                          <span>
                            {segment.id === selectedSegmentId
                              ? "Selected segment"
                              : "Select segment"}
                          </span>
                          {segment.id === selectedSegmentId && (
                            <Check aria-hidden className="size-4" />
                          )}
                        </button>
                        <AdvisoryCard segment={segment} />
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="rp-map-no-results">
                    No road segments match “{query}”.
                  </p>
                )}
              </div>
              <SegmentDetail
                segmentId={selectedSegmentId}
                variant="map"
                className="rp-map-list-detail glass-strong"
                onClose={() => selectSegment(undefined)}
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
