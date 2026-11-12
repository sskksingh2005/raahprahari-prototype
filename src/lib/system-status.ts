import type { TranslationKey } from "@/i18n/dictionary";
import type { AccountSession } from "@/lib/account-session";
import type {
  BackgroundSyncAvailability,
  TransportSource,
} from "@/lib/sync/sync-engine";
import type { SyncState } from "@/lib/sync/sync-state";
import type { OnlineStatus } from "@/lib/use-online-status";

/**
 * Pure derivation of the System Status view.
 *
 * It only interprets state that other modules already own: the transport source
 * and background-sync detection come from the sync engine, run results and times
 * from the sync state store, the session from the account session store. It never
 * sends, retries, schedules or probes anything itself.
 */

/**
 * configured:  a real integration is wired up in this build. This does not mean
 *              it is reachable; reachability lives in `channel`.
 * simulated:   stands in for a real integration with synthetic or dev-only behaviour.
 * unavailable: nothing is connected, or the browser cannot support it.
 * checking:    still being detected on this device.
 */
export type IntegrationState =
  "configured" | "simulated" | "unavailable" | "checking";

export type ChannelTone = "ok" | "warn" | "bad" | "neutral";

export type IntegrationId =
  | "reportDelivery"
  | "accountSession"
  | "backgroundSync"
  | "advisoryData"
  | "routing"
  | "mapTiles"
  | "officialPublishing";

/** What was actually observed on the channel, as opposed to how it is wired. */
export interface ChannelObservation {
  label: TranslationKey;
  tone: ChannelTone;
  /** Last successful sync, only for the report delivery channel. */
  lastSuccessAt?: number | null;
  /** Next scheduled retry, only for the report delivery channel. */
  nextAttemptAt?: number | null;
}

export interface IntegrationStatus {
  id: IntegrationId;
  name: TranslationKey;
  state: IntegrationState;
  reason: TranslationKey;
  channel: ChannelObservation | null;
}

export interface SystemStatusInput {
  transport: TransportSource;
  online: OnlineStatus;
  session: AccountSession["status"];
  /** Whether a sign-in provider is configured in this build (not whether it is reachable). */
  authProvider?: "supabase" | "none";
  sync: Pick<
    SyncState,
    "running" | "lastResult" | "lastSuccessfulSyncAt" | "nextAttemptAt"
  >;
  /** null while detection is still running. */
  backgroundSync: BackgroundSyncAvailability | null;
  routingMode: "seeded" | "live";
}

function deliveryChannel(input: SystemStatusInput): ChannelObservation | null {
  if (input.transport === "none") return null;
  const { sync, online } = input;
  const times = {
    lastSuccessAt: sync.lastSuccessfulSyncAt,
    nextAttemptAt: sync.nextAttemptAt,
  };
  if (sync.running)
    return { label: "status.channel.syncing", tone: "neutral", ...times };
  if (online === "offline")
    return { label: "status.channel.deviceOffline", tone: "warn", ...times };
  const last = sync.lastResult;
  if (!last)
    return {
      label:
        sync.lastSuccessfulSyncAt === null
          ? "status.channel.noSyncYet"
          : "status.channel.lastRunComplete",
      tone: sync.lastSuccessfulSyncAt === null ? "neutral" : "ok",
      ...times,
    };
  switch (last.status) {
    case "complete":
      return { label: "status.channel.lastRunComplete", tone: "ok", ...times };
    case "nothing_to_send":
      return {
        label: "status.channel.lastRunNothing",
        tone: "neutral",
        ...times,
      };
    case "error":
      return { label: "status.channel.lastRunError", tone: "bad", ...times };
    case "signed_out":
      return {
        label: "status.channel.lastRunSignedOut",
        tone: "warn",
        ...times,
      };
    case "offline":
      return { label: "status.channel.lastRunOffline", tone: "warn", ...times };
    case "not_configured":
      return {
        label: "status.channel.lastRunNotConfigured",
        tone: "bad",
        ...times,
      };
    case "idle":
    case "running":
      return { label: "status.channel.noSyncYet", tone: "neutral", ...times };
  }
}

function deliveryStatus(input: SystemStatusInput): IntegrationStatus {
  const state: IntegrationState =
    input.transport === "http"
      ? "configured"
      : input.transport === "none"
        ? "unavailable"
        : "simulated";
  const reason: TranslationKey =
    input.transport === "http"
      ? "status.reason.deliveryHttp"
      : input.transport === "none"
        ? "status.reason.deliveryNone"
        : "status.reason.deliveryStub";
  return {
    id: "reportDelivery",
    name: "status.item.reportDelivery",
    state,
    reason,
    channel: deliveryChannel(input),
  };
}

function sessionStatus(input: SystemStatusInput): IntegrationStatus {
  const simulated =
    input.transport === "dev_stub" || input.transport === "injected";
  const signedIn = input.session === "authenticated";
  const providerConfigured = input.authProvider === "supabase";
  const state: IntegrationState = simulated
    ? "simulated"
    : signedIn || providerConfigured
      ? "configured"
      : "unavailable";
  const reason: TranslationKey = simulated
    ? "status.reason.sessionStub"
    : signedIn
      ? "status.reason.sessionLive"
      : providerConfigured
        ? "status.reason.sessionSignedOut"
        : "status.reason.sessionNone";
  const channel: ChannelObservation =
    input.session === "authenticated"
      ? { label: "status.channel.sessionSignedIn", tone: "ok" }
      : input.session === "loading"
        ? { label: "status.channel.sessionLoading", tone: "neutral" }
        : { label: "status.channel.sessionSignedOut", tone: "warn" };
  return {
    id: "accountSession",
    name: "status.item.accountSession",
    state,
    reason,
    channel,
  };
}

function backgroundStatus(input: SystemStatusInput): IntegrationStatus {
  const detected = input.backgroundSync;
  const state: IntegrationState =
    detected === null
      ? "checking"
      : detected === "available"
        ? "configured"
        : "unavailable";
  const reason: TranslationKey =
    detected === null
      ? "status.reason.backgroundChecking"
      : detected === "available"
        ? "status.reason.backgroundAvailable"
        : detected === "no_service_worker"
          ? "status.reason.backgroundNoWorker"
          : "status.reason.backgroundUnsupported";
  return {
    id: "backgroundSync",
    name: "status.item.backgroundSync",
    state,
    reason,
    channel: null,
  };
}

function mapTilesChannel(online: OnlineStatus): ChannelObservation {
  if (online === "offline")
    return { label: "status.channel.tilesOffline", tone: "warn" };
  if (online === "online")
    return { label: "status.channel.tilesOnline", tone: "neutral" };
  return { label: "status.channel.tilesChecking", tone: "neutral" };
}

export function deriveSystemStatus(
  input: SystemStatusInput,
): IntegrationStatus[] {
  return [
    deliveryStatus(input),
    sessionStatus(input),
    backgroundStatus(input),
    {
      id: "advisoryData",
      name: "status.item.advisoryData",
      state: "simulated",
      reason: "status.reason.advisoryData",
      channel: { label: "status.channel.seededData", tone: "neutral" },
    },
    {
      id: "routing",
      name: "status.item.routing",
      state: input.routingMode === "live" ? "configured" : "simulated",
      reason:
        input.routingMode === "live"
          ? "status.reason.routingLive"
          : "status.reason.routingSeeded",
      channel: null,
    },
    {
      id: "mapTiles",
      name: "status.item.mapTiles",
      state: "configured",
      reason: "status.reason.mapTiles",
      channel: mapTilesChannel(input.online),
    },
    {
      // publishApi.ts posts to /api/official/notices, and this build has no such
      // route. DEV builds can mock responses with ?mock=, which is not a backend.
      id: "officialPublishing",
      name: "status.item.officialPublishing",
      state: "unavailable",
      reason: "status.reason.officialPublishing",
      channel: null,
    },
  ];
}
