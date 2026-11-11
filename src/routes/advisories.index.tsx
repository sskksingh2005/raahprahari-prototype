import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdvisoryCard } from "@/components/advisory-card";
import { PrototypeRibbon } from "@/components/prototype-ribbon";
import { Button } from "@/components/ui/button";
import { ScreenEmpty, ScreenError, ScreenLoading } from "@/components/screen-states";
import { useScreenState } from "@/lib/use-screen-state";
import { usePrefs } from "@/i18n/preferences";
import { useAppStore } from "@/lib/app-store";
import { getAdvisorySourceTimestamp } from "@/lib/advisory";
import { cn } from "@/lib/utils";
import "./advisories.index.css";

type Filter = "all" | "issues" | "official" | "unknown";

export const Route = createFileRoute("/advisories/")({
  head: () => ({ meta: [{ title: "Road advisories · RaahPrahari" }] }),
  component: AdvisoriesPage,
});

function AdvisoriesPage() {
  const { t } = usePrefs();
  const { segments, advisories } = useAppStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<"default" | "freshness">("default");
  // A section without an advisory is a data error: show the error state, never a guess.
  const { status, retry } = useScreenState(() =>
    segments.every((segment) => advisories.has(segment.id)),
  );
  const filteredSegments = segments.filter((segment) => {
    const advisory = advisories.get(segment.id);
    if (!advisory) return false;
    if (filter === "issues")
      return (
        advisory.level === "caution" ||
        advisory.level === "avoid" ||
        advisory.level === "do_not_travel"
      );
    if (filter === "official") return !!advisory.restriction;
    if (filter === "unknown")
      return advisory.level === "unknown" || advisory.stale;
    return true;
  });
  // Newest source first; sections with no source timestamp (unknown) go last.
  const sourceTime = (id: string) => {
    const advisory = advisories.get(id);
    return (advisory && getAdvisorySourceTimestamp(advisory)) ?? -Infinity;
  };
  const visibleSegments =
    sort === "freshness"
      ? [...filteredSegments].sort((a, b) => sourceTime(b.id) - sourceTime(a.id))
      : filteredSegments;

  return (
    <div className="advisories-list-page pb-8">
      <header className="advisories-list-banner">
        <div className="rp-container py-8 md:py-12">
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold tracking-widest text-blue-on-dark uppercase">
            <span aria-hidden className="h-0.5 w-7 bg-brand-orange" />
            {t("hero.eyebrow")}
          </p>
          <h1 className="max-w-4xl font-display text-3xl leading-tight font-bold text-text-on-charcoal sm:text-4xl md:text-5xl">
            {t("adv.title")}
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
            {t("adv.body")}
          </p>
          <div className="mt-4"><PrototypeRibbon /></div>
        </div>
      </header>
      <div className="rp-container space-y-5 py-6">
        <div className="advisories-filter-scroll">
          <div
            className="flex w-max min-w-full flex-nowrap gap-2 md:w-auto md:min-w-0 md:flex-wrap"
            role="group"
            aria-label={t("adv.filter")}
          >
            {(["all", "issues", "official", "unknown"] as const).map(
              (value) => (
                <Button
                  key={value}
                  type="button"
                  variant={filter === value ? "secondary" : "outline"}
                  aria-pressed={filter === value}
                  className={cn(
                    "advisories-filter-pill min-h-11 shrink-0 rounded-full",
                    filter === value && "text-link",
                  )}
                  onClick={() => setFilter(value)}
                >
                  {t(
                    value === "all"
                      ? "adv.filterAll"
                      : value === "issues"
                        ? "adv.filterIssues"
                        : value === "official"
                          ? "adv.filterOfficial"
                          : "adv.filterUnknown",
                  )}
                </Button>
              ),
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="adv-sort" className="text-muted-foreground">
            {t("adv.sort")}
          </label>
          <select
            id="adv-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as "default" | "freshness")}
            className="min-h-11 rounded-md border border-border bg-background px-3"
          >
            <option value="default">{t("adv.sortDefault")}</option>
            <option value="freshness">{t("adv.sortFreshness")}</option>
          </select>
        </div>
        {status === "loading" ? (
          <ScreenLoading />
        ) : status === "error" ? (
          <ScreenError onRetry={retry} />
        ) : !segments.length ? (
          <ScreenEmpty title={t("map.emptyTitle")} message={t("map.emptyBody")} />
        ) : visibleSegments.length ? (
          <div className="grid min-w-0 grid-cols-1 items-stretch gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleSegments.map((segment) => (
              <AdvisoryCard
                key={segment.id}
                segment={segment}
                showRestrictionDetail
              />
            ))}
          </div>
        ) : (
          <ScreenEmpty title={t("adv.empty")} message={t("help.reminder")} />
        )}
      </div>
    </div>
  );
}
