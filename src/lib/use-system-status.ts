import { useEffect, useMemo, useState } from "react";
import { seededRoutingProvider } from "@/features/routes/routing";
import { useAccountSession } from "@/lib/account-session";
import { deriveSystemStatus, type IntegrationStatus } from "@/lib/system-status";
import {
  detectBackgroundSync,
  getTransportSource,
  type BackgroundSyncAvailability,
} from "@/lib/sync/sync-engine";
import { useSyncState } from "@/lib/sync/sync-state";
import { useOnlineStatus } from "@/lib/use-online-status";

/** Reads the existing stores and the engine's own detection; it owns no sync logic. */
export function useSystemStatus(): IntegrationStatus[] {
  const online = useOnlineStatus();
  const session = useAccountSession();
  const sync = useSyncState();
  const [backgroundSync, setBackgroundSync] =
    useState<BackgroundSyncAvailability | null>(null);

  useEffect(() => {
    let disposed = false;
    detectBackgroundSync()
      .then((result) => {
        if (!disposed) setBackgroundSync(result);
      })
      .catch(() => {
        if (!disposed) setBackgroundSync("unsupported");
      });
    return () => {
      disposed = true;
    };
  }, []);

  const { lastResult, lastSuccessfulSyncAt, nextAttemptAt, running } = sync;
  return useMemo(
    () =>
      deriveSystemStatus({
        transport: getTransportSource(),
        online,
        session: session.status,
        sync: { lastResult, lastSuccessfulSyncAt, nextAttemptAt, running },
        backgroundSync,
        routingMode: seededRoutingProvider.mode,
      }),
    [
      online,
      session.status,
      lastResult,
      lastSuccessfulSyncAt,
      nextAttemptAt,
      running,
      backgroundSync,
    ],
  );
}
