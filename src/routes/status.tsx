import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/page-banner";
import { SystemStatus } from "@/components/system-status";
import { WorkspaceActions } from "@/components/workspace-actions";
import { usePrefs } from "@/i18n/preferences";

export const Route = createFileRoute("/status")({
  head: () => ({ meta: [{ title: "System status | RaahPrahari" }] }),
  component: StatusPage,
});

function StatusPage() {
  const { t } = usePrefs();
  return (
    <div className="rp-info-page">
      <PageBanner
        eyebrow={t("status.eyebrow")}
        title={t("status.title")}
        description={t("status.description")}
      />
      <div className="rp-info-container rp-info-content">
        <SystemStatus />
        <WorkspaceActions />
      </div>
    </div>
  );
}
