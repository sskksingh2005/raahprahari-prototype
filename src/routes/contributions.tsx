import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/page-banner";
import { PrototypeRibbon } from "@/components/prototype-ribbon";
import { ContributionsTabs } from "@/features/contributions/contributions-tabs";
import { usePrefs } from "@/i18n/preferences";

export const Route = createFileRoute("/contributions")({
  head: () => ({
    meta: [{ title: "Points and reputation | RaahPrahari" }],
  }),
  component: ContributionsPage,
});

function ContributionsPage() {
  const { t } = usePrefs();
  return (
    <div className="rp-info-page">
      <PageBanner
        eyebrow={t("contrib.eyebrow")}
        title={t("contrib.title")}
        description={t("contrib.description")}
      />
      <div className="rp-info-container rp-info-content">
        <div className="mb-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          <PrototypeRibbon />
          <p className="m-0 min-w-0 text-sm text-muted-foreground sm:flex-1">
            {t("contrib.notice")}
          </p>
        </div>
        <ContributionsTabs />
      </div>
    </div>
  );
}
