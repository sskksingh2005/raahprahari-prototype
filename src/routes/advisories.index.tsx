import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdvisoryCard } from "@/components/advisory-card";
import { DemoBadge } from "@/components/advisory";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { SEGMENTS } from "@/data/fixtures";
import { usePrefs } from "@/i18n/preferences";
import { advisoryFor } from "@/lib/data";
import { cn } from "@/lib/utils";
import "./advisories.index.css";

type Filter = "all" | "issues" | "official" | "unknown";

export const Route = createFileRoute("/advisories/")({
  head: () => ({ meta: [{ title: "Road advisories · RaahPrahari" }] }),
  component: AdvisoriesPage,
});

function AdvisoriesPage() {
  const { t } = usePrefs();
  const [filter, setFilter] = useState<Filter>("all");
  const segments = SEGMENTS.filter((segment) => {
    const advisory = advisoryFor(segment.id);
    if (!advisory)
      throw new Error(`Missing advisory for segment "${segment.id}"`);
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

  return (
    <div className="advisories-list-page pb-8">
      <header className="advisories-list-banner">
        <div className="rp-container py-5">
          <p className="mb-1 inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-link uppercase">
            <span aria-hidden className="h-0.5 w-7 bg-brand-orange" />
            {t("hero.eyebrow")}
          </p>
          <h1 className="max-w-4xl font-display text-2xl leading-tight font-bold text-foreground sm:text-3xl">
            {t("adv.title")}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {t("adv.body")}
          </p>
          <DemoBadge className="mt-4" />
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
        {segments.length ? (
          <div className="grid min-w-0 grid-cols-1 items-stretch gap-3 md:grid-cols-2 xl:grid-cols-3">
            {segments.map((segment) => (
              <AdvisoryCard
                key={segment.id}
                segment={segment}
                showRestrictionDetail
              />
            ))}
          </div>
        ) : (
          <EmptyState title={t("adv.empty")} message={t("help.reminder")} />
        )}
      </div>
    </div>
  );
}
