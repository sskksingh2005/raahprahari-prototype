import { Info } from "lucide-react";
import { usePrefs } from "@/i18n/preferences";
import type { TranslationKey } from "@/i18n/dictionary";
import type { ReviewHistoryEntry } from "./review-decision";

/**
 * Read-only review history. It shows exactly what the review service returned
 * for this reviewer, oldest first. There is no edit or delete control: a
 * correction is a new entry added by the service.
 */
export function ReviewTimeline({
  entries,
  version,
}: {
  entries: readonly ReviewHistoryEntry[];
  version?: number;
}) {
  const { t, ago, stamp } = usePrefs();
  // Copy before sorting so the adapter's array is never changed. Ties keep their received order.
  const ordered = [...entries].sort((a, b) => a.at - b.at);
  return (
    <section
      aria-labelledby="review-timeline-title"
      className="rp-info-card glass"
      data-testid="review-timeline"
    >
      <h2 id="review-timeline-title">{t("review.timeline.title")}</h2>
      <p className="flex items-start gap-2">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
        <span>{t("review.timeline.intro")}</span>
      </p>
      {version !== undefined && (
        <p className="m-0 text-xs text-muted-foreground">
          {t("review.timeline.version").replace("{version}", String(version))}
        </p>
      )}
      {ordered.length ? (
        <ol className="mt-3 space-y-4 border-l border-border pl-4">
          {ordered.map((entry) => (
            <li
              key={entry.id}
              data-testid="review-timeline-entry"
              className="relative"
            >
              <span
                aria-hidden
                className="absolute top-1 -left-[1.32rem] size-2.5 rounded-full border-2 border-status-unknown bg-background"
              />
              <p className="m-0 text-sm font-medium text-foreground">
                {entry.action === "correction"
                  ? t("review.timeline.action.correction")
                  : t(`review.act.${entry.action}` as TranslationKey)}{" "}
                <span className="font-normal text-muted-foreground">
                  {t("review.timeline.by").replace("{actor}", entry.actor)}
                </span>
              </p>
              <p className="m-0 text-xs text-muted-foreground">
                <time dateTime={new Date(entry.at).toISOString()}>
                  {stamp(entry.at)} · {ago(entry.at)}
                </time>
              </p>
              <p className="m-0 mt-1 break-words text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {t("review.timeline.rationale")}:
                </span>{" "}
                {entry.rationale?.trim() || t("review.timeline.noRationale")}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p>{t("review.timeline.empty")}</p>
      )}
    </section>
  );
}
