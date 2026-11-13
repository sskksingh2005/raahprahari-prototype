import { useId, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Camera, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScreenEmpty } from "@/components/screen-states";
import { REVIEW_HAZARDS, SEEDED_ASSIGNMENTS } from "@/data/review";
import { usePrefs } from "@/i18n/preferences";
import type { TranslationKey } from "@/i18n/dictionary";
import { useAppStore } from "@/lib/app-store";
import {
  QUEUES,
  SETTLED_OUTCOMES,
  SEVERITIES,
  buildQueue,
  canClaim,
  defaultSort,
  queueCounts,
  type QueueItem,
  type QueueSort,
  type ReviewQueue,
  type ReviewSearch,
} from "@/lib/review-queue";
import { cn } from "@/lib/utils";
import {
  AssignmentBadge,
  ReviewStatusBadge,
  SeverityLabel,
  selectClass,
} from "./review-ui";
import { useReviewClaims } from "./use-review-claims";

function QueueCard({
  item,
  queue,
  claimable,
  onClaim,
  onRelease,
}: {
  item: QueueItem;
  queue: ReviewQueue;
  claimable: boolean;
  onClaim: (ref: string) => void;
  onRelease: (ref: string) => void;
}) {
  const { t, ago, place } = usePrefs();
  const { segments } = useAppStore();
  const { report, assignment, assignee } = item;
  const segment = segments.find((s) => s.id === report.segmentId);
  return (
    <li
      data-testid={`queue-item-${report.ref}`}
      className="rp-info-card list-none"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="m-0 min-w-0 text-base font-semibold text-foreground">
          {/* The name starts with the visible text (WCAG 2.5.3); the ref keeps it unique. */}
          <Link
            to="/review/$ref"
            params={{ ref: report.ref }}
            className="inline-flex min-h-11 items-center gap-1 underline-offset-4 hover:underline"
          >
            {t(`hazard.${report.hazardType}` as TranslationKey)}
            <span className="sr-only">, {report.ref}</span>
            <ChevronRight aria-hidden className="size-4" />
          </Link>
        </h3>
        <ReviewStatusBadge status={report.status} />
      </div>
      <p className="m-0! font-mono text-xs">
        {report.ref}
        {segment
          ? ` · ${segment.code} ${place(segment.from)}–${place(segment.to)}`
          : ""}
      </p>
      <p className="m-0! mt-2! line-clamp-2 text-sm">{report.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
        <SeverityLabel severity={report.severity} />
        <span>
          {t("review.received").replace("{time}", ago(report.receivedAt))}
        </span>
        <span className="inline-flex items-center gap-1">
          <Camera aria-hidden className="size-3.5" />
          {t("review.photos").replace("{count}", String(report.photoCount))}
        </span>
        {queue !== "history" && (
          <AssignmentBadge assignment={assignment} assignee={assignee} />
        )}
      </div>
      {queue === "needs_review" && claimable && (
        <Button
          type="button"
          variant="outline"
          className="mt-3 min-h-11"
          aria-label={`${t("review.claim")} ${report.ref}`}
          onClick={() => onClaim(report.ref)}
        >
          {t("review.claim")}
        </Button>
      )}
      {queue === "assigned" && (
        <Button
          type="button"
          variant="outline"
          className="mt-3 min-h-11"
          aria-label={`${t("review.release")} ${report.ref}`}
          onClick={() => onRelease(report.ref)}
        >
          {t("review.release")}
        </Button>
      )}
    </li>
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  allLabel,
}: {
  label: string;
  value: T | undefined;
  options: readonly { value: T; label: string }[];
  onChange: (value: T | undefined) => void;
  allLabel?: string;
}) {
  const id = useId();
  return (
    <div className="grid min-w-0 gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <select
        id={id}
        value={value ?? ""}
        onChange={(event) =>
          onChange((event.target.value || undefined) as T | undefined)
        }
        className={selectClass}
      >
        {allLabel !== undefined && <option value="">{allLabel}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ReviewQueueView({
  search,
  onSearch,
}: {
  search: ReviewSearch;
  onSearch: (next: ReviewSearch) => void;
}) {
  const { t } = usePrefs();
  const { reports } = useAppStore();
  const { claims, claim, release } = useReviewClaims();
  const queue = search.queue ?? "needs_review";
  const [announcement, setAnnouncement] = useState("");
  const statusRef = useRef<HTMLParagraphElement>(null);

  const counts = useMemo(
    () => queueCounts(reports, claims, SEEDED_ASSIGNMENTS),
    [reports, claims],
  );
  const items = useMemo(
    () => buildQueue(reports, queue, claims, SEEDED_ASSIGNMENTS, search),
    [reports, queue, claims, search],
  );
  const filtered = Boolean(
    search.hazard || search.severity || search.assignee || search.outcome,
  );

  const update = (patch: Partial<ReviewSearch>) => {
    const next = { ...search, ...patch };
    for (const key of Object.keys(next) as (keyof ReviewSearch)[])
      if (next[key] === undefined) delete next[key];
    onSearch(next);
  };

  // The card just used leaves this queue, so focus moves to the announcement.
  const announce = (message: string) => {
    setAnnouncement(message);
    requestAnimationFrame(() => statusRef.current?.focus());
  };

  const sortOptions: { value: QueueSort; label: string }[] = (
    ["oldest", "newest", "severity"] as const
  ).map((value) => ({ value, label: t(`review.sort.${value}`) }));

  return (
    <div className="grid gap-4">
      <nav aria-label={t("review.queuesLabel")}>
        <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 min-[560px]:grid-cols-3">
          {QUEUES.map((name) => {
            const active = name === queue;
            return (
              <li key={name}>
                <Link
                  to="/review"
                  search={{ queue: name }}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm font-semibold",
                    active
                      ? "border-primary bg-raised text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(`review.queue.${name}`)}
                  {/* Visual badge; the comma-led text keeps a gap in the link's name. */}
                  <span
                    aria-hidden
                    data-testid={`queue-count-${name}`}
                    className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground"
                  >
                    {counts[name]}
                  </span>
                  <span className="sr-only">, {counts[name]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <section aria-labelledby="review-queue-title" className="grid gap-3">
        <div>
          <h2
            id="review-queue-title"
            className="m-0 font-display text-xl font-semibold"
          >
            {t(`review.queue.${queue}`)}
          </h2>
          <p className="m-0 mt-1 text-sm text-muted-foreground">
            {t(`review.queueHelp.${queue}`)}
          </p>
        </div>

        <fieldset className="m-0 grid min-w-0 gap-3 rounded-lg border border-border p-3 min-[560px]:grid-cols-2 lg:grid-cols-4">
          <legend className="px-1 text-sm font-semibold text-foreground">
            {t("review.filtersLabel")}
          </legend>
          <FilterSelect
            label={t("review.filter.hazard")}
            value={search.hazard}
            allLabel={t("review.filter.all")}
            options={REVIEW_HAZARDS.map((value) => ({
              value,
              label: t(`hazard.${value}` as TranslationKey),
            }))}
            onChange={(hazard) => update({ hazard })}
          />
          <FilterSelect
            label={t("review.filter.severity")}
            value={search.severity}
            allLabel={t("review.filter.all")}
            options={SEVERITIES.map((value) => ({
              value,
              label: t(`review.severity.${value}`),
            }))}
            onChange={(severity) => update({ severity })}
          />
          {queue === "needs_review" && (
            <FilterSelect
              label={t("review.filter.assignee")}
              value={search.assignee}
              allLabel={t("review.filter.all")}
              options={[
                {
                  value: "unassigned" as const,
                  label: t("review.assignment.unassigned"),
                },
                {
                  value: "other" as const,
                  label: t("review.assignment.otherAny"),
                },
              ]}
              onChange={(assignee) => update({ assignee })}
            />
          )}
          {queue === "history" && (
            <FilterSelect
              label={t("review.filter.outcome")}
              value={search.outcome}
              allLabel={t("review.filter.all")}
              options={SETTLED_OUTCOMES.map((value) => ({
                value,
                label: t(`status.${value}` as TranslationKey),
              }))}
              onChange={(outcome) => update({ outcome })}
            />
          )}
          <FilterSelect
            label={t("review.filter.sort")}
            value={search.sort ?? defaultSort(queue)}
            options={sortOptions}
            onChange={(sort) => update({ sort })}
          />
        </fieldset>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p
            data-testid="queue-result-count"
            aria-live="polite"
            className="m-0 text-sm text-muted-foreground"
          >
            {t("review.resultCount").replace("{count}", String(items.length))}
          </p>
          {filtered && (
            <Button
              type="button"
              variant="ghost"
              className="min-h-11"
              onClick={() =>
                onSearch({ queue: search.queue, sort: search.sort })
              }
            >
              {t("review.filter.clear")}
            </Button>
          )}
        </div>

        <p
          ref={statusRef}
          role="status"
          tabIndex={-1}
          className={cn(
            "m-0 text-sm text-foreground outline-none",
            !announcement && "sr-only",
          )}
        >
          {announcement}
        </p>

        {items.length === 0 ? (
          <ScreenEmpty
            title={t(`review.queue.${queue}`)}
            message={
              filtered ? t("review.empty.filtered") : t(`review.empty.${queue}`)
            }
          />
        ) : (
          <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <QueueCard
                key={item.report.ref}
                item={item}
                queue={queue}
                claimable={canClaim(item.report, claims, SEEDED_ASSIGNMENTS)}
                onClaim={(ref) => {
                  claim(ref);
                  announce(t("review.claimed"));
                }}
                onRelease={(ref) => {
                  release(ref);
                  announce(t("review.released"));
                }}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
