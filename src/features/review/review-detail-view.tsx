import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { FreshnessChip, RoadCode } from "@/components/advisory";
import { Button } from "@/components/ui/button";
import { SEEDED_ASSIGNMENTS } from "@/data/review";
import { usePrefs } from "@/i18n/preferences";
import type { TranslationKey } from "@/i18n/dictionary";
import { useAppStore } from "@/lib/app-store";
import {
  assignmentOf,
  canClaim,
  isPending,
  relatedReports,
} from "@/lib/review-queue";
import type { CommunityReport } from "@/lib/types";
import { ReviewActionDialog } from "./review-action-dialog";
import {
  REVIEW_ACTIONS,
  type ReviewAction,
  type ReviewDecisionAdapter,
  type ReviewSnapshot,
  type ReviewSnapshotLoader,
} from "./review-decision";
import { ObservationEvidence } from "./review-observations";
import { ReviewTimeline } from "./review-timeline";
import { AssignmentBadge, ReviewStatusBadge, SeverityLabel } from "./review-ui";
import { useReviewClaims } from "./use-review-claims";

function RelatedList({
  title,
  reports,
}: {
  title: string;
  reports: CommunityReport[];
}) {
  const { t } = usePrefs();
  if (!reports.length) return null;
  return (
    <div className="mt-3">
      <h3 className="m-0 text-sm font-semibold text-foreground">{title}</h3>
      <ul className="m-0 mt-2 list-none space-y-2 p-0">
        {reports.map((other) => (
          <li
            key={other.ref}
            className="flex flex-wrap items-center justify-between gap-2"
          >
            <Link
              to="/review/$ref"
              params={{ ref: other.ref }}
              className="inline-flex min-h-11 items-center font-mono text-sm text-link underline underline-offset-4"
            >
              {other.ref}
            </Link>
            <span className="text-xs text-muted-foreground">
              {t(`hazard.${other.hazardType}` as TranslationKey)}
            </span>
            <ReviewStatusBadge status={other.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * `onDecision` is the adapter to the review backend. Without one there is no
 * service to store a decision, so no decision control is shown.
 */
export function ReviewDetailView({
  report,
  onDecision,
  loadSnapshot,
}: {
  report: CommunityReport;
  onDecision?: ReviewDecisionAdapter;
  /** Loads the current version and authorised history. Without it no history is shown and no version is sent. */
  loadSnapshot?: ReviewSnapshotLoader;
}) {
  const { t, stamp, ago, place } = usePrefs();
  const { segments, reports } = useAppStore();
  const { claims, claim, release } = useReviewClaims();
  const [announcement, setAnnouncement] = useState("");
  const [dialogAction, setDialogAction] = useState<ReviewAction | null>(null);
  const [snapshot, setSnapshot] = useState<ReviewSnapshot | null>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const reportRef = report.ref;
  const refetch = useCallback(async () => {
    if (loadSnapshot) setSnapshot(await loadSnapshot(reportRef));
  }, [loadSnapshot, reportRef]);
  useEffect(() => {
    let live = true;
    void loadSnapshot?.(reportRef).then(
      (next) => {
        if (live) setSnapshot(next);
      },
      () => {
        if (live) setSnapshot(null);
      },
    );
    return () => {
      live = false;
    };
  }, [loadSnapshot, reportRef]);
  const segment = segments.find((s) => s.id === report.segmentId);
  const { assignment, assignee } = assignmentOf(
    report,
    claims,
    SEEDED_ASSIGNMENTS,
  );
  const claimable = canClaim(report, claims, SEEDED_ASSIGNMENTS);
  const related = relatedReports(report, reports);
  const pending = isPending(report.status);
  const observationGroup = [report, ...related.linked];

  // The claim and release buttons replace each other, so focus follows.
  const act = (fn: () => void, message: string) => {
    fn();
    setAnnouncement(message);
    requestAnimationFrame(() => actionRef.current?.focus());
  };

  const rows: [string, React.ReactNode][] = [
    [
      t("review.detail.kind"),
      t(`review.detail.kind.${report.kind}` as TranslationKey),
    ],
    [
      t("review.detail.observed"),
      `${stamp(report.observedAt)} · ${ago(report.observedAt)}`,
    ],
    [t("review.detail.received"), stamp(report.receivedAt)],
    [t("review.detail.landmark"), report.landmark],
    [t("review.detail.source"), t(`source.${report.source}` as TranslationKey)],
    [
      t("review.detail.location"),
      t(`conf.${report.locationConfidence}` as TranslationKey),
    ],
    [
      t("review.detail.photos"),
      report.photoCount
        ? t("review.photos").replace("{count}", String(report.photoCount))
        : t("review.detail.noPhotos"),
    ],
  ];

  return (
    <div className="grid gap-4">
      <Link
        to="/review"
        className="inline-flex min-h-11 w-fit items-center gap-1 text-sm font-medium text-link underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {t("review.back")}
      </Link>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section
          aria-labelledby="review-report-title"
          className="rp-info-card glass min-w-0"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 id="review-report-title" className="m-0!">
              {t(`hazard.${report.hazardType}` as TranslationKey)}
            </h2>
            <ReviewStatusBadge status={report.status} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <SeverityLabel severity={report.severity} />
            <FreshnessChip observationTimestamp={report.observedAt} />
          </div>
          <p className="mt-3! text-base text-foreground!">
            {report.description}
          </p>
          {report.duplicateOf && (
            <p>
              {t("review.detail.duplicateOf").replace(
                "{ref}",
                report.duplicateOf,
              )}
            </p>
          )}
          {report.conflictsWith && (
            <p>
              {t("review.detail.conflictsWith").replace(
                "{ref}",
                report.conflictsWith,
              )}
            </p>
          )}
          <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-[max-content_1fr]">
            {rows.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="font-semibold text-foreground">{label}</dt>
                <dd className="m-0 mb-2 break-words text-muted-foreground sm:mb-0">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="grid min-w-0 content-start gap-4">
          <section
            aria-labelledby="review-assignment-title"
            className="rp-info-card glass"
          >
            <h2 id="review-assignment-title">
              {t("review.detail.assignment")}
            </h2>
            <div className="mt-3">
              {pending ? (
                <AssignmentBadge assignment={assignment} assignee={assignee} />
              ) : (
                <ReviewStatusBadge status={report.status} />
              )}
            </div>
            {pending && assignment === "other" && (
              <p>{t("review.heldByOther").replace("{name}", assignee ?? "")}</p>
            )}
            {claimable && (
              <Button
                ref={actionRef}
                type="button"
                className="mt-3 min-h-11 w-full sm:w-auto"
                onClick={() =>
                  act(() => claim(report.ref), t("review.claimed"))
                }
              >
                {t("review.claim")}
              </Button>
            )}
            {pending && assignment === "mine" && (
              <Button
                ref={actionRef}
                type="button"
                variant="outline"
                className="mt-3 min-h-11 w-full sm:w-auto"
                onClick={() =>
                  act(() => release(report.ref), t("review.released"))
                }
              >
                {t("review.release")}
              </Button>
            )}
            <p role="status" className={announcement ? "mt-2!" : "sr-only"}>
              {announcement}
            </p>
          </section>

          <section
            aria-labelledby="review-decision-title"
            className="rp-info-card glass"
          >
            <h2 id="review-decision-title">
              {t("review.detail.decisionTitle")}
            </h2>
            {pending && onDecision ? (
              <>
                <p className="flex items-start gap-2">
                  <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
                  <span>{t("review.act.note")}</span>
                </p>
                <div
                  role="group"
                  aria-label={t("review.act.group")}
                  className="mt-3 flex flex-wrap gap-2"
                >
                  {REVIEW_ACTIONS.map((a) => (
                    <Button
                      key={a}
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        returnFocusRef.current = e.currentTarget;
                        setDialogAction(a);
                      }}
                    >
                      {t(`review.act.${a}` as TranslationKey)}
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <p className="flex items-start gap-2">
                <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
                <span>
                  {pending
                    ? t("review.detail.decisionBlocked")
                    : t("review.detail.decisionSettled").replace(
                        "{status}",
                        t(`status.${report.status}` as TranslationKey),
                      )}
                </span>
              </p>
            )}
          </section>

          {segment && (
            <section
              aria-labelledby="review-road-title"
              className="rp-info-card glass"
            >
              <h2 id="review-road-title">{t("review.detail.road")}</h2>
              <RoadCode className="mt-2 block">
                {segment.code} · km {segment.kmStart}–{segment.kmEnd}
              </RoadCode>
              <p className="mt-1!">
                {place(segment.from)} – {place(segment.to)}
              </p>
              <Link
                to="/advisories/$segmentId"
                params={{ segmentId: segment.id }}
                className="mt-1 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-link underline underline-offset-4"
              >
                {t("review.detail.viewRoad")}
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </section>
          )}
        </div>
      </div>

      <ObservationEvidence group={observationGroup} />

      {snapshot && (
        <ReviewTimeline
          entries={snapshot.history}
          version={snapshot.version}
        />
      )}

      <section
        aria-labelledby="review-related-title"
        className="rp-info-card glass"
      >
        <h2 id="review-related-title">{t("review.detail.related")}</h2>
        {related.linked.length || related.sameSegment.length ? (
          <>
            <RelatedList
              title={t("review.detail.linked")}
              reports={related.linked}
            />
            <RelatedList
              title={t("review.detail.sameSegment")}
              reports={related.sameSegment}
            />
          </>
        ) : (
          <p>{t("review.detail.noRelated")}</p>
        )}
      </section>
      {onDecision && (
        <ReviewActionDialog
          action={dialogAction}
          report={report}
          mergeTargets={related.linked}
          onSubmit={onDecision}
          returnFocusRef={returnFocusRef}
          version={snapshot?.version}
          onConflict={refetch}
          onClose={() => setDialogAction(null)}
          onDone={(a) => {
            setDialogAction(null);
            setAnnouncement(
              t("review.act.done").replace(
                "{action}",
                t(`review.act.${a}` as TranslationKey),
              ),
            );
          }}
        />
      )}
    </div>
  );
}
