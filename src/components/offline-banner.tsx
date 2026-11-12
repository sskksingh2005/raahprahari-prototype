import { AlertTriangle, Info, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { usePrefs } from "@/i18n/preferences";
import { getActiveAccountScope } from "@/lib/account-scope";
import { listOutbox } from "@/lib/draft-repository";
import { useSyncState } from "@/lib/sync/sync-state";
import { useOnlineStatus } from "@/lib/use-online-status";
import { cn } from "@/lib/utils";

export const STALE_AFTER_MS = 6 * 60 * 60 * 1000;

export function useUnsyncedCounts(scope = getActiveAccountScope()) {
  const [counts, setCounts] = useState({ pending: 0, failed: 0 });
  useEffect(() => {
    if (typeof window === "undefined") return;
    let disposed = false;
    const refresh = async () => {
      try {
        const entries = await listOutbox(scope);
        if (disposed) return;
        const scopedEntries = entries.filter(
          (entry) => entry.accountScope === scope && entry.ownerUserId !== null,
        );
        setCounts({
          pending: scopedEntries.filter(
            (entry) => entry.state === "pending" || entry.state === "failed",
          ).length,
          failed: scopedEntries.filter((entry) => entry.state === "failed")
            .length,
        });
      } catch (error) {
        console.error("Unable to read pending report delivery status", error);
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
  syncResultMessage,
}: {
  online: "unknown" | "online" | "offline";
  lastSuccessfulSyncAt: number | null;
  pendingCount: number;
  failedCount: number;
  syncResultMessage?: string;
}) {
  const { t, stamp } = usePrefs();
  const [now, setNow] = useState(0);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, []);

  const stale =
    now > 0 &&
    lastSuccessfulSyncAt !== null &&
    now - lastSuccessfulSyncAt > STALE_AFTER_MS;
  const serverUnavailable =
    online === "online" &&
    !!syncResultMessage &&
    /timeout|network|failed to fetch|offline|unreachable/.test(
      syncResultMessage.toLowerCase(),
    );
  const warning =
    online !== "online" || serverUnavailable || stale || pendingCount > 0;
  const networkLabel =
    online === "offline"
      ? t("offline.deviceOffline")
      : online === "unknown"
        ? t("offline.checking")
        : serverUnavailable
          ? t("offline.serverUnavailable")
          : t("offline.deviceOnline");
  const lastSyncText =
    lastSuccessfulSyncAt === null
      ? t("offline.notSynced")
      : stamp(lastSuccessfulSyncAt);
  const deliveryNote =
    lastSuccessfulSyncAt === null
      ? t("offline.noSuccessfulSync")
      : stale
        ? t("offline.syncStale")
        : null;
  const StatusIcon =
    online === "offline"
      ? WifiOff
      : warning
        ? AlertTriangle
        : online === "online"
          ? Info
          : Wifi;

  return (
    <div
      className={cn(
        "border-b border-border/80",
        warning
          ? "bg-amber-100/70 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100"
          : "bg-muted/70 text-foreground",
      )}
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 sm:px-6">
        <StatusIcon aria-hidden className="size-4 shrink-0" />
        <p className="min-w-0 flex-1 text-xs leading-5 sm:text-sm">
          <strong>{networkLabel}</strong>
          {deliveryNote ? (
            <span>
              <span className="mx-1.5 opacity-70" aria-hidden>
                ·
              </span>
              {deliveryNote}
            </span>
          ) : null}
          {pendingCount > 0 ? (
            <>
              <span className="mx-1.5 opacity-70" aria-hidden>
                ·
              </span>
              <span>
                {t("offline.pending")}: {pendingCount}
              </span>
            </>
          ) : null}
        </p>
        {pendingCount > 0 ? (
          <Link
            to="/reports"
            className="inline-flex min-h-11 items-center rounded-md px-2 text-xs font-semibold underline underline-offset-4 hover:bg-black/5 dark:hover:bg-white/10 sm:text-sm"
          >
            {t("offline.viewReports")}
          </Link>
        ) : null}
        <details className="w-full pl-7 text-xs sm:w-auto sm:pl-0">
          <summary className="min-h-8 cursor-pointer content-center font-medium underline underline-offset-2">
            {t("offline.details")}
          </summary>
          <div className="max-w-3xl space-y-1 pb-1 pt-1 sm:absolute sm:right-6 sm:z-10 sm:mt-1 sm:rounded-md sm:border sm:border-border sm:bg-background sm:p-3 sm:text-foreground sm:shadow-md">
            <p>
              {t("offline.lastSync")}: {lastSyncText}
            </p>
            {failedCount > 0 ? (
              <p>
                {t("offline.failed")}: {failedCount}
              </p>
            ) : null}
            <p>{t("offline.statusDisclaimer")}</p>
          </div>
        </details>
      </div>
    </div>
  );
}

export function OfflineBanner() {
  const online = useOnlineStatus();
  const syncState = useSyncState();
  const { pending, failed } = useUnsyncedCounts();
  const [now, setNow] = useState(0);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, []);

  const lastSuccessfulSyncAt = syncState.lastSuccessfulSyncAt;
  const stale =
    now > 0 &&
    lastSuccessfulSyncAt !== null &&
    now - lastSuccessfulSyncAt > STALE_AFTER_MS;
  const serverUnavailable =
    online === "online" &&
    !!syncState.lastResult &&
    /timeout|network|failed to fetch|offline|unreachable/.test(
      syncState.lastResult.message.toLowerCase(),
    );
  const shouldShow =
    online !== "online" ||
    pending > 0 ||
    lastSuccessfulSyncAt === null ||
    now === 0 ||
    stale ||
    serverUnavailable;

  if (!shouldShow) return null;

  return (
    <OfflineBannerView
      online={online}
      lastSuccessfulSyncAt={lastSuccessfulSyncAt}
      pendingCount={pending}
      failedCount={failed}
      syncResultMessage={syncState.lastResult?.message}
    />
  );
}
