import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/page-banner";
import { PrototypeRibbon } from "@/components/prototype-ribbon";
import { REVIEW_HAZARDS } from "@/data/review";
import { ReviewQueueView } from "@/features/review/review-queue-view";
import { usePrefs } from "@/i18n/preferences";
import { parseQueueSearch } from "@/lib/review-queue";

export const Route = createFileRoute("/review/")({
  validateSearch: (search: Record<string, unknown>) =>
    parseQueueSearch(search, REVIEW_HAZARDS),
  head: () => ({ meta: [{ title: "Review queue | RaahPrahari" }] }),
  component: ReviewQueuePage,
});

function ReviewQueuePage() {
  const { t } = usePrefs();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <div className="rp-info-page">
      <PageBanner
        eyebrow={t("review.eyebrow")}
        title={t("review.title")}
        description={t("review.description")}
      />
      <div className="rp-info-container rp-info-content">
        <div className="mb-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          <PrototypeRibbon />
          <p className="m-0 min-w-0 text-sm text-muted-foreground sm:flex-1">
            {t("review.notice")}
          </p>
        </div>
        <ReviewQueueView
          search={search}
          onSearch={(next) => void navigate({ search: next, replace: true })}
        />
      </div>
    </div>
  );
}
