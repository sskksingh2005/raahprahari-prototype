import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/page-banner";
import { PrototypeRibbon } from "@/components/prototype-ribbon";
import { usePrefs } from "@/i18n/preferences";
import { OfficialNoticeForm } from "@/official/OfficialNoticeForm";

export const Route = createFileRoute("/official")({
  head: () => ({ meta: [{ title: "Official notice | RaahPrahari" }] }),
  component: OfficialWorkspacePage,
});

function OfficialWorkspacePage() {
  const { t } = usePrefs();
  return (
    <div className="rp-info-page">
      <PageBanner
        eyebrow={t("official.eyebrow")}
        title={t("official.title")}
        description={t("official.description")}
      />
      <div className="rp-info-container rp-info-content">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex flex-col items-start gap-2">
            <PrototypeRibbon />
            <p className="m-0 text-sm text-muted-foreground">
              {t("official.notice")}
            </p>
          </div>
          <OfficialNoticeForm />
        </div>
      </div>
    </div>
  );
}
