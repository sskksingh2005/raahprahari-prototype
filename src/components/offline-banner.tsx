import { AlertTriangle, ChevronRight, Info, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

/** Ticks once a minute after mount (0 on the server and the first render). */
function useMinuteClock() {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const initialTimer = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, []);
  return now;
}

const SERVER_UNAVAILABLE =
  /timeout|network|failed to fetch|offline|unreachable/;

function isStale(now: number, lastSuccessfulSyncAt: number | null) {
  return (
    now > 0 &&
    lastSuccessfulSyncAt !== null &&
    now - lastSuccessfulSyncAt > STALE_AFTER_MS
  );
}

/**
 * Connection and delivery details. Shown inside the sync status panel; it is
 * the same information the old banner carried, laid out as a short list.
 */
export function OfflineBannerView({
  online,
  lastSuccessfulSyncAt,
  pendingCount,
  failedCount,
  syncResultMessage,
  announce = true,
}: {
  online: "unknown" | "online" | "offline";
  lastSuccessfulSyncAt: number | null;
  pendingCount: number;
  failedCount: number;
  syncResultMessage?: string;
  /** False when a parent already provides a persistent live region. */
  announce?: boolean;
}) {
  const { t, stamp } = usePrefs();
  const now = useMinuteClock();

  const stale = isStale(now, lastSuccessfulSyncAt);
  const serverUnavailable =
    online === "online" &&
    !!syncResultMessage &&
    SERVER_UNAVAILABLE.test(syncResultMessage.toLowerCase());
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
      className="rp-sync-panel grid gap-3 text-sm"
      aria-live={announce ? "polite" : undefined}
    >
      <p className="m-0 flex items-start gap-2.5">
        <StatusIcon
          aria-hidden
          className={cn(
            "mt-0.5 size-4 shrink-0",
            warning ? "text-status-caution" : "text-muted-foreground",
          )}
        />
        <span className="min-w-0">
          <strong className="block text-foreground">{networkLabel}</strong>
          {deliveryNote ? (
            <span className="block text-muted-foreground">{deliveryNote}</span>
          ) : null}
        </span>
      </p>
      {pendingCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-status-caution/50 bg-status-caution/10 px-3 py-2">
          <span className="font-medium text-foreground">
            {t("offline.pending")}: {pendingCount}
          </span>
          <Link
            to="/reports"
            className="inline-flex min-h-11 items-center rounded-lg px-2 font-semibold text-foreground underline underline-offset-4 hover:bg-(--glass-panel-strong)"
          >
            {t("offline.viewReports")}
          </Link>
        </div>
      ) : null}
      <dl className="m-0 grid gap-1 text-muted-foreground">
        <div className="flex flex-wrap gap-x-1">
          <dt>{t("offline.lastSync")}:</dt>
          <dd className="m-0 text-foreground">{lastSyncText}</dd>
        </div>
        {failedCount > 0 ? (
          <div className="flex flex-wrap gap-x-1">
            <dt>{t("offline.failed")}:</dt>
            {/* --foreground, not the red status colour: that does not keep AA on glass. */}
            <dd className="m-0 font-semibold text-foreground">{failedCount}</dd>
          </div>
        ) : null}
      </dl>
      <p className="m-0 text-xs text-muted-foreground">
        {t("offline.statusDisclaimer")}
      </p>
    </div>
  );
}

type SyncTone = "ok" | "checking" | "warning" | "offline" | "error";

/** Derives the chip's tone and short label from the same signals the banner used. */
function useSyncSummary() {
  const { t } = usePrefs();
  const online = useOnlineStatus();
  const syncState = useSyncState();
  const { pending, failed } = useUnsyncedCounts();
  const now = useMinuteClock();

  const lastSuccessfulSyncAt = syncState.lastSuccessfulSyncAt;
  const stale = isStale(now, lastSuccessfulSyncAt);
  const serverUnavailable =
    online === "online" &&
    !!syncState.lastResult &&
    SERVER_UNAVAILABLE.test(syncState.lastResult.message.toLowerCase());

  // Most urgent first: offline, failed uploads, unreachable server, waiting
  // uploads, a stale sync. "Never synced" with nothing waiting is not news.
  let tone: SyncTone;
  let label: string;
  if (online === "offline") {
    tone = "offline";
    label = t("sync.chip.offline");
  } else if (failed > 0) {
    tone = "error";
    label = t("sync.chip.failed").replace("{count}", String(failed));
  } else if (serverUnavailable) {
    tone = "error";
    label = t("sync.chip.server");
  } else if (pending > 0) {
    tone = "warning";
    label = t("sync.chip.waiting").replace("{count}", String(pending));
  } else if (stale) {
    tone = "warning";
    label = t("sync.chip.stale");
  } else if (online === "unknown") {
    tone = "checking";
    label = t("sync.chip.checking");
  } else {
    tone = "ok";
    label = t("sync.chip.online");
  }

  return {
    tone,
    label,
    attention: tone === "offline" || tone === "error" || tone === "warning",
    details: {
      online,
      lastSuccessfulSyncAt,
      pendingCount: pending,
      failedCount: failed,
      syncResultMessage: syncState.lastResult?.message,
    },
  };
}

const TONE_CLASS: Record<SyncTone, string> = {
  ok: "border-border text-muted-foreground",
  checking: "border-border text-muted-foreground",
  warning: "border-status-caution/60 bg-status-caution/12 text-foreground",
  offline: "border-status-caution/70 bg-status-caution/15 text-foreground",
  error: "border-status-dnt/70 bg-status-dnt/12 text-foreground",
};

const DOT_CLASS: Record<SyncTone, string> = {
  ok: "bg-status-clear",
  checking: "bg-status-unknown",
  warning: "bg-status-caution",
  offline: "bg-status-caution",
  error: "bg-status-dnt",
};

/**
 * Compact connection and sync status for the app shell. Problems (offline,
 * failed or waiting uploads, unreachable server, stale sync) always show their
 * label; a healthy state shrinks to a dot on narrow screens. The details open
 * in a panel, with a link to the full status page.
 */
export function SyncStatusIndicator({ className }: { className?: string }) {
  const { t } = usePrefs();
  const { tone, label, attention, details } = useSyncSummary();

  return (
    <div className={cn("rp-sync-status", className)} data-tone={tone}>
      {/* Problems are announced as they appear; the healthy state is not.
          A polite live region without role="status", so pages keep their own
          single status region (e.g. Help search results). */}
      <span aria-live="polite" aria-atomic="true" className="sr-only">
        {attention ? label : ""}
      </span>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={t("sync.chip.label").replace("{status}", label)}
            className={cn(
              "rp-press inline-flex h-11 max-w-full min-w-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium whitespace-nowrap xl:w-full xl:justify-start",
              TONE_CLASS[tone],
              // Healthy on a phone: a quiet dot, not a ringed button.
              !attention && "max-sm:border-transparent max-sm:bg-transparent",
            )}
          >
            <span
              aria-hidden
              className={cn("size-2.5 shrink-0 rounded-full", DOT_CLASS[tone])}
            />
            <span
              aria-hidden
              className={cn("truncate", !attention && "max-sm:sr-only")}
            >
              {label}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          side="bottom"
          className="w-[min(20rem,calc(100vw-2rem))] rounded-xl p-4"
        >
          <p className="mt-0 mb-3 font-display text-base font-semibold text-foreground">
            {t("sync.panelTitle")}
          </p>
          <OfflineBannerView {...details} announce={false} />
          <Link
            to="/status"
            className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-link underline-offset-4 hover:underline"
          >
            {t("offline.details")}
            <ChevronRight aria-hidden className="size-4" />
          </Link>
        </PopoverContent>
      </Popover>
    </div>
  );
}
