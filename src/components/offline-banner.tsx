import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Info, Wifi, WifiOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { usePrefs } from "@/i18n/preferences";
import { getActiveAccountScope } from "@/lib/account-scope";
import { listOutbox } from "@/lib/draft-repository";
import { useSyncState } from "@/lib/sync/sync-state";
import { useOnlineStatus } from "@/lib/use-online-status";
import { cn } from "@/lib/utils";

export const STALE_AFTER_MS = 6 * 60 * 60 * 1000;

export function useOfflineReadiness() {
  const [appCached, setAppCached] = useState<boolean>(() => {
    if (typeof navigator === "undefined") return false;
    const storageIsAvailable = "storage" in navigator && "estimate" in navigator.storage;
    return !storageIsAvailable;
  });

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const storageIsAvailable = "storage" in navigator && "estimate" in navigator.storage;
    if (!storageIsAvailable) return;

    void navigator.storage
      .estimate()
      .then((estimate) => {
        setAppCached(Boolean(estimate.usage && estimate.usage > 0));
      })
      .catch(() => setAppCached(true));
  }, []);
  return { appCached };
}

export function useUnsyncedCounts(scope = getActiveAccountScope()) {
  const [counts, setCounts] = useState({ pending: 0, failed: 0 });
  useEffect(() => {
    if (typeof window === "undefined") return;
    let disposed = false;
    const refresh = async () => {
      try {
        const entries = await listOutbox(scope);
        if (disposed) return;
        const pending = entries.filter(
          (entry) =>
            entry.accountScope === scope &&
            (entry.state === "pending" || entry.state === "failed") &&
            entry.ownerUserId !== null,
        ).length;
        const failed = entries.filter(
          (entry) =>
            entry.accountScope === scope &&
            entry.state === "failed" &&
            entry.ownerUserId !== null,
        ).length;
        setCounts({ pending, failed });
      } catch {
        setCounts({ pending: 0, failed: 0 });
      }
    };
    void refresh();
    const handle = setInterval(() => void refresh(), 30_000);
    return () => {
      disposed = true;
      clearInterval(handle);
    };
  }, [scope]);
  return counts;
}

export function OfflineBannerView({
  online,
  lastSuccessfulSyncAt,
  pendingCount,
  failedCount,
  appCached = false,
  syncResultMessage,
  onDismiss,
}: {
  online: "unknown" | "online" | "offline";
  lastSuccessfulSyncAt: number | null;
  pendingCount: number;
  failedCount: number;
  appCached?: boolean;
  syncResultMessage?: string;
  onDismiss?: () => void;
}) {
  const { t, stamp } = usePrefs();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const totalPending = pendingCount + failedCount;
  const stale =
    lastSuccessfulSyncAt !== null && now - lastSuccessfulSyncAt > STALE_AFTER_MS;

  const tone =
    online === "offline" || stale || totalPending > 0 || online === "unknown"
      ? "warning"
      : "info";

  const networkLabel =
    online === "offline"
      ? "Offline"
      : online === "unknown"
        ? "Checking…"
        : syncResultMessage &&
            /timeout|network|failed to fetch|offline|unreachable/.test(
              syncResultMessage.toLowerCase(),
            )
          ? "Can't reach the server"
          : "Online";

  const lastSyncText =
    lastSuccessfulSyncAt === null
      ? "Not synced on this device yet"
      : `${stamp(lastSuccessfulSyncAt)}`;

  const infoText =
    "Information shown here may be old or incomplete. Always check official sources before travelling.";

  const [expanded, setExpanded] = useState(false);
  const detailsId = "offline-banner-details";
  const banner = (
    <div
      className={cn(
        "border-b border-border text-foreground",
        tone === "warning"
          ? "bg-action-caution/15"
          : "bg-action-info/10",
      )}
      aria-live="polite"
    >
      <div className="mx-auto max-w-7xl px-4 py-1 sm:px-6">
        <div className="flex min-h-8 items-center gap-2 text-xs">
          {tone === "warning" ? (
            <AlertTriangle aria-hidden className="size-3.5 shrink-0" />
          ) : (
            <Info aria-hidden className="size-3.5 shrink-0" />
          )}
          {online === "offline" ? (
            <WifiOff aria-hidden className="size-3.5 shrink-0" />
          ) : online === "unknown" ? (
            <Wifi aria-hidden className="size-3.5 shrink-0" />
          ) : (
            <CheckCircle2 aria-hidden className="size-3.5 shrink-0" />
          )}
          <p className="min-w-0 flex-1 truncate">
            <span className="font-medium">{networkLabel}</span>
            <span className="text-muted-foreground"> · {lastSyncText} · </span>
            <span>
              {t("offline.pending")}: {totalPending}
            </span>
          </p>
          <button
            type="button"
            className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-md px-2 font-medium underline-offset-4 hover:underline"
            aria-expanded={expanded}
            aria-controls={detailsId}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? (
              <ChevronUp aria-hidden className="size-3.5" />
            ) : (
              <ChevronDown aria-hidden className="size-3.5" />
            )}
            {expanded ? "Hide details" : "Details"}
          </button>
          {onDismiss ? (
            <button
              type="button"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-accent"
              onClick={onDismiss}
              aria-label="Dismiss banner"
            >
              <X aria-hidden className="size-4" />
            </button>
          ) : null}
        </div>
        <div id={detailsId} hidden={!expanded} className="space-y-1 pb-2 pl-6 text-sm">
          <div>
            <span>{t("offline.lastSync")}</span>: {lastSuccessfulSyncAt === null ? t("offline.notSynced") : stamp(lastSuccessfulSyncAt)}
          </div>
          <div>
            {t("offline.pending")}: {totalPending}
          </div>
          <p>{infoText}</p>
          {!appCached ? <p className="text-xs text-muted-foreground">{t("offline.cachedWarning")}</p> : null}
          {totalPending > 0 ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Link to="/reports" className="text-sm font-medium underline underline-offset-4">
                {t("offline.viewReports")}
              </Link>
              <Button asChild size="sm" variant="secondary" className="h-8 rounded-full">
                <Link to="/reports">{t("sync.now")}</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );  return banner;
}

export function OfflineBanner() {
  const online = useOnlineStatus();
  const syncState = useSyncState();
  const { appCached } = useOfflineReadiness();
  const { pending, failed } = useUnsyncedCounts();
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const lastSuccessfulSyncAt = syncState.lastSuccessfulSyncAt;

  const situationKey = `${online}:${pending + failed}:${syncState.lastResult?.message ?? ""}`;
  if (dismissedKey === situationKey) return null;

  const shouldShow =
    online !== "online" ||
    pending + failed > 0 ||
    lastSuccessfulSyncAt === null ||
    (syncState.lastResult !== null &&
      /timeout|network|failed to fetch|offline|unreachable/.test(
        syncState.lastResult.message.toLowerCase(),
      ));

  if (!shouldShow) return null;

  return (
    <OfflineBannerView
      online={online}
      lastSuccessfulSyncAt={lastSuccessfulSyncAt}
      pendingCount={pending}
      failedCount={failed}
      appCached={appCached}
      syncResultMessage={syncState.lastResult?.message}
      onDismiss={() => setDismissedKey(situationKey)}
    />
  );
}
