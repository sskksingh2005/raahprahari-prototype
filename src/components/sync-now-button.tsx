import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePrefs } from "@/i18n/preferences";
import { getTransportSource, syncNow } from "@/lib/sync/sync-engine";
import { useSyncState, type SyncRunSummary } from "@/lib/sync/sync-state";

function resultMessage(
  result: SyncRunSummary,
  t: (key: import("@/i18n/dictionary").TranslationKey) => string,
) {
  if (result.status === "signed_out") return t("sync.signedOut");
  if (result.status === "offline") return t("sync.offline");
  if (result.status === "not_configured") return t("sync.notConfigured");
  if (result.status === "nothing_to_send") return t("sync.nothingToSend");
  if (result.status === "complete")
    return result.received
      ? t("sync.receivedCount").replace("{count}", `${result.received}`)
      : t("sync.nothingToSend");
  if (result.status === "error")
    return t(
      result.message.includes("account changed")
        ? "sync.accountChanged"
        : "sync.resultError",
    );
  return t("sync.sending");
}

/**
 * Hidden when no transport exists: pressing it could only ever report "not
 * configured", so it would be a button that does nothing. The delivery badge
 * next to it already says the report is saved on this device.
 */
export function SyncNowButton() {
  if (getTransportSource() === "none") return null;
  return <SyncNowControl />;
}

function SyncNowControl() {
  const { t } = usePrefs();
  const { running } = useSyncState();
  const [result, setResult] = useState<SyncRunSummary | null>(null);
  const failed = result?.status === "error";

  const sync = async () => {
    setResult(await syncNow({ reason: "manual" }));
  };

  return (
    <div className="min-w-0 space-y-2">
      <Button
        type="button"
        className="w-full sm:w-auto"
        onClick={() => void sync()}
        disabled={running}
        aria-busy={running}
      >
        <RefreshCw
          aria-hidden
          className={`size-4 ${running ? "animate-spin" : ""}`}
        />
        {running ? t("sync.sending") : t("sync.now")}
      </Button>
      {running ? (
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-muted-foreground"
        >
          {t("sync.sending")}
        </p>
      ) : result ? (
        <p
          role={failed ? "alert" : "status"}
          aria-live={failed ? "assertive" : "polite"}
          className={`break-words text-sm ${failed ? "text-status-dnt" : "text-muted-foreground"}`}
        >
          {resultMessage(result, t)}
        </p>
      ) : null}
    </div>
  );
}
