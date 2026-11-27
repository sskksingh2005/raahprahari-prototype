import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { WifiOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUnsyncedCounts } from "@/components/offline-banner";
import { usePrefs } from "@/i18n/preferences";
import { useSyncState } from "@/lib/sync/sync-state";
import { useOnlineStatus, type OnlineStatus } from "@/lib/use-online-status";
import { useSystemStatus } from "@/lib/use-system-status";
import { cn } from "@/lib/utils";
import { BANNER_DISMISSED_KEY } from "./nav";

/** Only states the existing sync and online sources can actually report. */
export type ChipState = "offline" | "pending" | "never" | "synced";

export interface ShellStatus {
  online: OnlineStatus;
  lastSuccessfulSyncAt: number | null;
  pending: number;
  failed: number;
  /** The last sync run ended in an error, or a report failed to send. */
  lastFailed: boolean;
}

export function chipState(status: ShellStatus): ChipState {
  if (status.online === "offline") return "offline";
  if (status.pending > 0) return "pending";
  if (status.lastSuccessfulSyncAt === null) return "never";
  return "synced";
}

/** Banner only for offline, pending reports or a failed last sync. */
export function bannerSignature(status: ShellStatus): string | null {
  const offline = status.online === "offline";
  if (!offline && status.pending === 0 && !status.lastFailed) return null;
  return `${offline ? 1 : 0}|${status.pending}|${status.lastFailed ? 1 : 0}`;
}

/** Reads the existing sources; it owns no sync logic. */
export function useShellStatus(): ShellStatus {
  const online = useOnlineStatus();
  const sync = useSyncState();
  const { pending, failed } = useUnsyncedCounts();
  return {
    online,
    lastSuccessfulSyncAt: sync.lastSuccessfulSyncAt,
    pending,
    failed,
    lastFailed: sync.lastResult?.status === "error" || failed > 0,
  };
}

function useChipText(state: ChipState, pending: number) {
  const { t } = usePrefs();
  if (state === "offline") return t("shell.status.offline");
  if (state === "pending")
    return t("shell.status.pending").replace("{count}", String(pending));
  if (state === "never") return t("shell.status.neverSynced");
  return t("shell.status.synced");
}

/** Dot or icon. Blue and neutral only: never green, amber or red. */
function ChipMark({ state }: { state: ChipState }) {
  if (state === "offline")
    return <WifiOff aria-hidden className="size-4 shrink-0" />;
  return (
    <span
      aria-hidden
      data-testid="status-mark"
      data-mark={state === "never" ? "hollow" : "filled"}
      className={cn(
        "inline-block size-2.5 shrink-0 rounded-full",
        state === "never" && "border-2 border-shell-muted",
        state === "synced" && "bg-brand-blue",
        state === "pending" && "bg-shell-muted",
      )}
    />
  );
}

/** The status lines shared by the chip popover and the menu dialog. */
export function StatusDetailsContent({ status }: { status: ShellStatus }) {
  const { t, stamp } = usePrefs();
  const delivery = useSystemStatus().find(
    (item) => item.id === "reportDelivery",
  );
  return (
    <div className="space-y-2 text-sm">
      <p>
        {status.online === "offline"
          ? t("offline.deviceOffline")
          : status.online === "online"
            ? t("offline.deviceOnline")
            : t("offline.checking")}
      </p>
      <p>
        {t("offline.lastSync")}:{" "}
        {status.lastSuccessfulSyncAt === null
          ? t("offline.notSynced")
          : stamp(status.lastSuccessfulSyncAt)}
      </p>
      <p>
        {t("offline.pending")}: {status.pending}
      </p>
      {status.failed > 0 ? (
        <p>
          {t("offline.failed")}: {status.failed}
        </p>
      ) : null}
      {delivery ? (
        <p className="text-shell-muted">{t(delivery.reason)}</p>
      ) : null}
      <p className="text-shell-muted">{t("shell.status.note")}</p>
      <p>
        <Link
          to="/status"
          className="text-shell-link underline underline-offset-4"
        >
          {t("shell.status.fullPage")}
        </Link>
      </p>
    </div>
  );
}

/** Status chip (desktop) or dot (mobile) that opens the details popover. */
export function StatusChip({
  status,
  compact = false,
}: {
  status: ShellStatus;
  compact?: boolean;
}) {
  const { t } = usePrefs();
  const state = chipState(status);
  const text = useChipText(state, status.pending);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid="status-chip"
          data-state-kind={state}
          aria-label={
            compact
              ? t("shell.status.label").replace("{state}", text)
              : undefined
          }
          className={cn(
            "glass inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-md text-sm text-shell-text",
            compact ? "px-0" : "px-3",
          )}
        >
          <ChipMark state={state} />
          {/* Real text, so the state never depends on colour alone. */}
          <span className={compact ? "sr-only" : undefined}>{text}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="rp-shell w-80 text-shell-text"
      >
        <h2 className="mb-2 text-sm font-semibold">
          {t("shell.statusDetails")}
        </h2>
        <StatusDetailsContent status={status} />
      </PopoverContent>
    </Popover>
  );
}

/** Same details as a dialog, for menu entries that have no chip to anchor to. */
export function StatusDetailsDialog({
  open,
  onOpenChange,
  status,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: ShellStatus;
}) {
  const { t } = usePrefs();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rp-shell text-shell-text">
        <DialogHeader>
          <DialogTitle>{t("shell.statusDetails")}</DialogTitle>
          <DialogDescription className="text-shell-muted">
            {t("shell.status.label").replace(
              "{state}",
              chipState(status) === "pending"
                ? t("shell.status.pending").replace(
                    "{count}",
                    String(status.pending),
                  )
                : t(
                    chipState(status) === "offline"
                      ? "shell.status.offline"
                      : chipState(status) === "never"
                        ? "shell.status.neverSynced"
                        : "shell.status.synced",
                  ),
            )}
          </DialogDescription>
        </DialogHeader>
        {open ? <StatusDetailsContent status={status} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function readDismissed(): string | null {
  try {
    return window.sessionStorage.getItem(BANNER_DISMISSED_KEY);
  } catch {
    return null;
  }
}

/**
 * Full-width banner under the top bar, only when offline, reports are pending
 * or the last sync failed. Dismissal lasts for this browser session and only
 * for the exact state that was dismissed: a change brings it back.
 */
export function ShellStatusBanner({
  status,
  onOpenDetails,
}: {
  status: ShellStatus;
  onOpenDetails: () => void;
}) {
  const { t } = usePrefs();
  const signature = bannerSignature(status);
  // sessionStorage is read after mount so server and client markup match.
  const [dismissed, setDismissed] = useState<string | null | undefined>(
    undefined,
  );
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(readDismissed());
  }, []);

  if (!signature || dismissed === undefined || dismissed === signature)
    return null;

  const dismiss = () => {
    try {
      window.sessionStorage.setItem(BANNER_DISMISSED_KEY, signature);
    } catch {
      // Storage disabled: dismissal still applies until reload.
    }
    setDismissed(signature);
  };

  return (
    <div
      role="status"
      data-testid="shell-status-banner"
      className="rp-shell glass flex w-full items-start gap-3 border-x-0 border-t-0 px-4 py-2 text-sm text-shell-text sm:px-6"
    >
      {status.online === "offline" ? (
        <WifiOff aria-hidden className="mt-0.5 size-4 shrink-0" />
      ) : null}
      <div className="min-w-0 flex-1 space-y-0.5">
        {status.online === "offline" ? (
          <p>{t("shell.banner.offline")}</p>
        ) : null}
        {status.pending > 0 ? (
          <p>
            {t("shell.banner.pending").replace(
              "{count}",
              String(status.pending),
            )}
          </p>
        ) : null}
        {status.lastFailed ? <p>{t("shell.banner.failed")}</p> : null}
      </div>
      <Button
        type="button"
        variant="ghost"
        className="h-11 shrink-0 text-shell-link underline underline-offset-4"
        onClick={onOpenDetails}
      >
        {t("shell.statusDetails")}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t("shell.banner.dismiss")}
        className="shrink-0"
        onClick={dismiss}
      >
        <X aria-hidden />
      </Button>
    </div>
  );
}
