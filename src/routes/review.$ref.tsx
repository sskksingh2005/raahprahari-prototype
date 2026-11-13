import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageBanner } from "@/components/page-banner";
import { PrototypeRibbon } from "@/components/prototype-ribbon";
import { REPORTS } from "@/data/fixtures";
import { ReviewDetailView } from "@/features/review/review-detail-view";
import { usePrefs } from "@/i18n/preferences";
import { useAppStore } from "@/lib/app-store";

export const Route = createFileRoute("/review/$ref")({
  loader: ({ params }) => {
    if (!REPORTS.some((report) => report.ref === params.ref)) throw notFound();
    return { ref: params.ref };
  },
  head: ({ params }) => ({
    meta: [{ title: `${params.ref} · Review | RaahPrahari` }],
  }),
  component: ReviewDetailPage,
});

function ReviewDetailPage() {
  const { t } = usePrefs();
  const { ref } = Route.useLoaderData();
  const { reports } = useAppStore();
  const report = reports.find((item) => item.ref === ref);
  if (!report) throw notFound();
  return (
    <div className="rp-info-page">
      <PageBanner
        eyebrow={t("review.eyebrow")}
        title={report.ref}
        description={t("review.notice")}
      />
      <div className="rp-info-container rp-info-content">
        <div className="mb-4">
          <PrototypeRibbon />
        </div>
        <ReviewDetailView report={report} />
      </div>
    </div>
  );
}
