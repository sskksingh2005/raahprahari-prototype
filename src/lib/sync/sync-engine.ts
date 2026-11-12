import { getActiveAccountScope } from "@/lib/account-scope";
import {
  getAccessToken,
  getAccountSession,
  subscribeAccountSession,
} from "@/lib/account-session";
import {
  appendReceiptEvent,
  enqueueReport,
  getNextOutboxAttemptAt,
  listOutbox,
} from "@/lib/draft-repository";
import {
  localDb,
  type AttachmentRecord,
  type DraftRecord,
  type OutboxRecord,
} from "@/lib/local-db";
import { canProcess, runQueue } from "@/lib/queue-guard";
import {
  ReportMetadataPayloadSchema,
  ReportReceiptSchema,
  IsoUtcSchema,
  type AttachmentUploadTransport,
  type ReportMetadataPayload,
  type ReportReceipt,
  type SyncError,
  type TransportResult,
} from "@/lib/sync/contract";
import {
  getConfiguredTransport,
  type SyncTransport,
} from "@/lib/sync/http-transport";
import { setSyncState, type SyncRunSummary } from "@/lib/sync/sync-state";

export type SyncReason =
  "manual" | "foreground" | "online" | "startup" | "background";
export type SyncResult = SyncRunSummary;

const LAST_SYNC_KEY_PREFIX = "rp.lastSync.";
let injectedTransport: SyncTransport | null | undefined;
let activeSync: Promise<SyncResult> | null = null;

export function nextDelay(
  attempts: number,
  retryAfterMs = 0,
  rng = Math.random,
) {
  const exponent = Math.max(0, Math.min(20, attempts - 1));
  const base = Math.min(15 * 60_000, 5_000 * 2 ** exponent);
  const jittered = Math.min(
    15 * 60_000,
    Math.round(base * (0.8 + rng() * 0.4)),
  );
  return Math.max(jittered, retryAfterMs);
}

export function setSyncTransportForTests(
  transport: SyncTransport | null | undefined,
) {
  injectedTransport = transport;
}

/**
 * Where the engine's transport comes from, in precedence order:
 * a test-injected transport, the configured HTTP service, the development
 * receipt stub, or nothing. This is the only place that order is decided;
 * `getTransport` and the System Status view both read it.
 */
export type TransportSource = "injected" | "http" | "dev_stub" | "none";

export function getTransportSource(): TransportSource {
  if (injectedTransport !== undefined)
    return injectedTransport ? "injected" : "none";
  if (getConfiguredTransport()) return "http";
  if (import.meta.env.DEV && import.meta.env.VITE_DEV_RECEIPT_STUB === "true")
    return "dev_stub";
  return "none";
}

export function getTransport(): Promise<SyncTransport | null> {
  switch (getTransportSource()) {
    case "injected":
      return Promise.resolve(injectedTransport ?? null);
    case "http":
      return Promise.resolve(getConfiguredTransport());
    case "dev_stub":
      return import("@/dev/receipt-stub").then(({ getDevReceiptStub }) =>
        getDevReceiptStub(),
      );
    case "none":
      return Promise.resolve(null);
  }
}

function parseIso(value: string) {
  return IsoUtcSchema.safeParse(value).success;
}

export function buildMetadataPayload(
  draft: DraftRecord,
  outbox: OutboxRecord,
):
  | { ok: true; payload: ReportMetadataPayload }
  | { ok: false; message: string } {
  if (
    !parseIso(draft.eventTime) ||
    !draft.savedAt ||
    !Number.isFinite(draft.savedAt)
  ) {
    return {
      ok: false,
      message: "The saved report is missing a valid observation or save time.",
    };
  }
  if (!draft.payload.location?.confirmed) {
    return {
      ok: false,
      message: "Confirm the report location before sending it.",
    };
  }
  const location = draft.payload.location;
  const source = location.source;
  const candidate = {
    schemaVersion: draft.schemaVersion,
    reportId: outbox.reportId,
    eventTime: draft.eventTime,
    clientSavedAt: new Date(draft.savedAt).toISOString(),
    hazardType: draft.payload.hazardType,
    description: draft.payload.description,
    location: {
      lat: location.lat,
      lon: location.lon,
      accuracyM: location.accuracyM,
      source,
      confirmed: true,
      roadSegment: location.roadSegment,
      query: location.query,
    },
    attachments: draft.attachments.map(({ id, name, type, size }) => ({
      attachmentId: id,
      name,
      type,
      size,
    })),
  };
  const parsed = ReportMetadataPayloadSchema.safeParse(candidate);
  return parsed.success
    ? { ok: true, payload: parsed.data }
    : {
        ok: false,
        message: "The saved report details are incomplete or invalid.",
      };
}

function currentScopeIs(scope: string, signal: AbortSignal) {
  return !signal.aborted && getActiveAccountScope() === scope;
}

function currentEntryIsOwned(entry: OutboxRecord, scope: string) {
  const session = getAccountSession();
  return (
    session.status === "authenticated" &&
    scope === `user:${session.userId}` &&
    entry.accountScope === scope &&
    entry.ownerUserId === session.userId &&
    entry.id === entry.reportId
  );
}

async function updateOutbox(
  scope: string,
  id: string,
  update: (entry: OutboxRecord) => OutboxRecord,
  signal: AbortSignal,
) {
  await localDb.transaction("rw", localDb.outbox, async () => {
    const entry = await localDb.outbox.get(id);
    if (
      !entry ||
      !currentEntryIsOwned(entry, scope) ||
      !currentScopeIs(scope, signal)
    )
      return;
    await localDb.outbox.put(update(entry));
  });
}

async function blockAuthForScope(scope: string, ownerUserId: string) {
  await localDb.transaction("rw", localDb.outbox, async () => {
    const entries = await localDb.outbox
      .where("accountScope")
      .equals(scope)
      .toArray();
    for (const entry of entries) {
      if (
        entry.ownerUserId === ownerUserId &&
        !entry.authBlocked &&
        (entry.state === "pending" || entry.state === "failed")
      ) {
        await localDb.outbox.put({
          ...entry,
          authBlocked: true,
          state: "failed",
          nextAttemptAt: 0,
          updatedAt: Date.now(),
        });
      }
    }
  });
}

async function saveFailure(
  scope: string,
  entry: OutboxRecord,
  error: SyncError,
  signal: AbortSignal,
) {
  await localDb.transaction(
    "rw",
    localDb.outbox,
    localDb.receiptEvents,
    async () => {
      const current = await localDb.outbox.get(entry.id);
      if (
        !current ||
        !currentEntryIsOwned(current, scope) ||
        !currentScopeIs(scope, signal)
      )
        return;
      const authBlocked = error.kind === "auth_required";
      const attempts = authBlocked ? current.attempts : current.attempts + 1;
      const delay = error.retryable
        ? nextDelay(attempts || 1, error.retryAfterMs)
        : 0;
      const retryAt = error.retryAfterMs ? Date.now() + error.retryAfterMs : null;
      const nextState =
        error.kind === "rejected" || !error.retryable ? "rejected" : "failed";
      await localDb.outbox.put({
        ...current,
        state: nextState,
        attempts,
        nextAttemptAt:
          error.retryable && !authBlocked
            ? Math.max(Date.now() + delay, retryAt ?? 0)
            : 0,
        lastErrorCode: error.kind,
        lastErrorMessage: error.message,
        retryAfterAt: retryAt,
        authBlocked,
        updatedAt: Date.now(),
      });
      await appendReceiptEvent(current.reportId, scope, {
        type: nextState === "rejected" ? "rejected" : "send_failed",
        at: Date.now(),
        code: error.kind,
        detail: error.message,
        receiptId: null,
        serverReceivedAt: null,
      });
    },
  );
}

async function persistInvalidReport(
  scope: string,
  entry: OutboxRecord,
  message: string,
  signal: AbortSignal,
) {
  await localDb.transaction("rw", localDb.outbox, async () => {
    const current = await localDb.outbox.get(entry.id);
    if (
      !current ||
      !currentEntryIsOwned(current, scope) ||
      !currentScopeIs(scope, signal)
    )
      return;
    await localDb.outbox.put({
      ...current,
      state: "rejected",
      lastErrorCode: "invalid_local_report",
      lastErrorMessage: message,
      authBlocked: false,
      updatedAt: Date.now(),
    });
  });
}

async function persistReceipt(
  scope: string,
  entry: OutboxRecord,
  receipt: ReportReceipt,
  signal: AbortSignal,
) {
  await localDb.transaction(
    "rw",
    localDb.outbox,
    localDb.attachments,
    localDb.receiptEvents,
    async () => {
      const current = await localDb.outbox.get(entry.id);
      if (
        !current ||
        !currentEntryIsOwned(current, scope) ||
        !currentScopeIs(scope, signal)
      )
        return;
      const now = Date.now();
      await localDb.outbox.put({
        ...current,
        state: "received",
        metadataReceipt: {
          receiptId: receipt.receiptId,
          receivedAt: receipt.receivedAt,
          duplicate: receipt.duplicate,
        },
        deliveredAt: now,
        lastErrorCode: null,
        lastErrorMessage: null,
        retryAfterAt: null,
        authBlocked: false,
        updatedAt: now,
      });
      await appendReceiptEvent(current.reportId, scope, {
        type: "server_received",
        at: now,
        code: "received",
        detail: receipt.receiptId || null,
        receiptId: receipt.receiptId || null,
        serverReceivedAt: receipt.receivedAt || null,
      });
      for (const target of receipt.attachmentUploads ?? []) {
        const attachment = await localDb.attachments.get(target.attachmentId);
        if (
          attachment &&
          attachment.accountScope === scope &&
          attachment.draftId === entry.id
        ) {
          await localDb.attachments.put({
            ...attachment,
            uploadTarget: target,
            uploadState: "not_started",
            uploadError: null,
          });
        }
      }
    },
  );
}

function asError<T>(result: TransportResult<T>): SyncError | null {
  return result.ok ? null : result.error;
}

async function saveMediaFailure(
  scope: string,
  attachment: AttachmentRecord,
  error: SyncError,
  signal: AbortSignal,
) {
  await localDb.transaction(
    "rw",
    localDb.attachments,
    localDb.receiptEvents,
    async () => {
      const current = await localDb.attachments.get(attachment.id);
      if (
        !current ||
        current.accountScope !== scope ||
        !currentScopeIs(scope, signal)
      )
        return;
      await localDb.attachments.put({
        ...current,
        uploadState: "failed",
        uploadError: error.message,
        uploadAttempts: current.uploadAttempts + 1,
      });
      await appendReceiptEvent(current.draftId, scope, {
        type: "media_failed",
        at: Date.now(),
        code: error.kind,
        detail: current.name,
        receiptId: null,
        serverReceivedAt: null,
      });
    },
  );
}

async function uploadAttachment(
  transport: AttachmentUploadTransport,
  attachment: AttachmentRecord,
  reportId: string,
  scope: string,
  token: string,
  signal: AbortSignal,
) {
  const setState = async (update: Partial<AttachmentRecord>) => {
    await localDb.transaction("rw", localDb.attachments, async () => {
      const current = await localDb.attachments.get(attachment.id);
      if (
        !current ||
        current.accountScope !== scope ||
        !currentScopeIs(scope, signal)
      )
        return;
      await localDb.attachments.put({ ...current, ...update });
    });
  };
  if (!currentScopeIs(scope, signal)) return false;
  const existingTarget = attachment.uploadTarget;
  const expired =
    !existingTarget || Date.parse(existingTarget.expiresAt) <= Date.now();
  let target = existingTarget;
  if (expired) {
    const targetResult = await transport.requestUploadTarget(
      reportId,
      attachment.id,
      { signal, accessToken: token },
    );
    const targetError = asError(targetResult);
    if (targetError) {
      await saveMediaFailure(scope, attachment, targetError, signal);
      return false;
    }
    if (!targetResult.ok) return false;
    target = targetResult.value;
  }
  if (!target) return false;
  await setState({
    uploadState: "uploading",
    uploadError: null,
    uploadTarget: target,
  });
  const uploadResult = await transport.uploadBlob(target, attachment.blob, {
    signal,
  });
  const uploadError = asError(uploadResult);
  if (uploadError) {
    await saveMediaFailure(scope, attachment, uploadError, signal);
    return false;
  }
  if (!uploadResult.ok) return false;
  await setState({
    uploadState: "uploaded",
    uploadedAt: Date.now(),
    uploadAttempts: attachment.uploadAttempts + 1,
    uploadError: null,
  });
  await appendReceiptEvent(reportId, scope, {
    type: "media_uploaded",
    at: Date.now(),
    code: "uploaded",
    detail: attachment.name,
    receiptId: null,
    serverReceivedAt: null,
  });
  return true;
}

async function uploadPendingAttachments(
  transport: SyncTransport,
  draft: DraftRecord,
  scope: string,
  token: string,
  signal: AbortSignal,
) {
  const attachments = await localDb.attachments
    .where("draftId")
    .equals(draft.id)
    .toArray();
  for (const attachment of attachments) {
    if (!currentScopeIs(scope, signal)) return;
    if (
      attachment.accountScope !== scope ||
      attachment.uploadState === "uploaded"
    )
      continue;
    await uploadAttachment(
      transport,
      attachment,
      draft.id,
      scope,
      token,
      signal,
    );
  }
}

async function syncOne(
  entry: OutboxRecord,
  scope: string,
  token: string,
  transport: SyncTransport,
  signal: AbortSignal,
) {
  if (
    !canProcess(entry, scope, getAccountSession()) ||
    !currentScopeIs(scope, signal)
  )
    return null;
  const draft = await localDb.drafts.get(entry.reportId);
  if (
    !draft ||
    draft.accountScope !== scope ||
    draft.ownerUserId !== entry.ownerUserId
  ) {
    await persistInvalidReport(
      scope,
      entry,
      "The saved report is unavailable in this account.",
      signal,
    );
    return {
      kind: "rejected",
      retryable: false,
      message: "The saved report is unavailable in this account.",
    } satisfies SyncError;
  }
  const payload = buildMetadataPayload(draft, entry);
  if (!payload.ok) {
    await persistInvalidReport(scope, entry, payload.message, signal);
    return {
      kind: "rejected",
      retryable: false,
      message: payload.message,
    } satisfies SyncError;
  }
  await updateOutbox(
    scope,
    entry.id,
    (current) => ({ ...current, state: "sending", updatedAt: Date.now() }),
    signal,
  );
  const response = await transport.sendMetadata(payload.payload, {
    signal,
    accessToken: token,
  });
  const error = asError(response);
  if (error) {
    if (error.kind !== "aborted")
      await saveFailure(scope, entry, error, signal);
    return error;
  }
  const parsedReceipt = response.ok
    ? ReportReceiptSchema.safeParse(response.value)
    : null;
  if (
    !response.ok ||
    !parsedReceipt?.success ||
    parsedReceipt.data.reportId !== entry.reportId
  ) {
    const mismatch: SyncError = {
      kind: "malformed_response",
      retryable: true,
      message: "The service returned a receipt for a different report.",
    };
    await saveFailure(scope, entry, mismatch, signal);
    return mismatch;
  }
  await persistReceipt(scope, entry, parsedReceipt.data, signal);
  if (!currentScopeIs(scope, signal)) return null;
  await uploadPendingAttachments(transport, draft, scope, token, signal);
  return null;
}

async function recoverInterruptedItems(scope: string, ownerUserId: string) {
  await localDb.transaction("rw", localDb.outbox, async () => {
    if (
      getActiveAccountScope() !== scope ||
      getAccountSession().status !== "authenticated" ||
      getAccountSession().userId !== ownerUserId
    )
      return;
    const entries = await localDb.outbox
      .where("accountScope")
      .equals(scope)
      .toArray();
    for (const entry of entries) {
      if (entry.ownerUserId === ownerUserId && entry.state === "sending") {
        await localDb.outbox.put({
          ...entry,
          state: "pending",
          nextAttemptAt: 0,
          updatedAt: Date.now(),
        });
      }
    }
  });
}

export async function retryAttachmentUpload(
  reportId: string,
  attachmentId: string,
) {
  const scope = getActiveAccountScope();
  const session = getAccountSession();
  if (session.status !== "authenticated" || scope === "anonymous") {
    return {
      ok: false as const,
      message: "Sign in again to continue sending reports.",
    };
  }
  const outbox = await localDb.outbox.get(reportId);
  const attachment = await localDb.attachments.get(attachmentId);
  if (
    !outbox ||
    outbox.accountScope !== scope ||
    outbox.ownerUserId !== session.userId ||
    outbox.state !== "received" ||
    !attachment ||
    attachment.accountScope !== scope ||
    attachment.draftId !== reportId
  ) {
    return {
      ok: false as const,
      message: "This photo is not available for upload in the current account.",
    };
  }
  const token = await getAccessToken();
  if (!token)
    return {
      ok: false as const,
      message: "Sign in again to continue sending reports.",
    };
  const transport = await getTransport();
  if (!transport)
    return {
      ok: false as const,
      message:
        "Sending isn't available yet because the report service isn't configured.",
    };
  const controller = new AbortController();
  const abortOnScopeChange = () => {
    if (getActiveAccountScope() !== scope)
      controller.abort(new DOMException("Account scope changed", "AbortError"));
  };
  const unsubscribe = subscribeAccountSession(abortOnScopeChange);
  try {
    const ok = await uploadAttachment(
      transport,
      attachment,
      reportId,
      scope,
      token,
      controller.signal,
    );
    return ok
      ? { ok: true as const }
      : {
          ok: false as const,
          message: "The photo upload failed. Retry when you are online.",
        };
  } finally {
    unsubscribe();
  }
}

function summary(
  status: SyncRunSummary["status"],
  received = 0,
  failed = 0,
  message = "",
): SyncResult {
  return { status, received, failed, message };
}

export async function syncNow({
  reason,
}: {
  reason: SyncReason;
}): Promise<SyncResult> {
  const sessionAtCall = getAccountSession();
  if (sessionAtCall.status !== "authenticated") {
    const result = summary(
      "signed_out",
      0,
      0,
      "Sign in to send reports saved under your account.",
    );
    if (!activeSync) setSyncState({ running: false, lastResult: result });
    return result;
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const result = summary(
      "offline",
      0,
      0,
      "You are offline. Your report remains saved on this device.",
    );
    if (!activeSync) setSyncState({ running: false, lastResult: result });
    return result;
  }
  if (activeSync) return activeSync;
  const run = (async () => {
    setSyncState({ running: true });
    const session = getAccountSession();
    if (session.status !== "authenticated") {
      const result = summary(
        "signed_out",
        0,
        0,
        "Sign in to send reports saved under your account.",
      );
      setSyncState({ running: false, lastResult: result });
      return result;
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const result = summary(
        "offline",
        0,
        0,
        "You are offline. Your report remains saved on this device.",
      );
      setSyncState({ running: false, lastResult: result });
      return result;
    }
    const transport = await getTransport();
    if (!transport) {
      const result = summary(
        "not_configured",
        0,
        0,
        "Sending isn't available yet because the report service isn't configured. Your report stays saved on this device.",
      );
      setSyncState({ running: false, lastResult: result });
      return result;
    }
    const scope = getActiveAccountScope();
    const token = await getAccessToken();
    if (!token) {
      if (session.status === "authenticated") {
        await blockAuthForScope(scope, session.userId);
      }
      const result = summary(
        "signed_out",
        0,
        0,
        "Sign in again to continue sending reports.",
      );
      setSyncState({ running: false, lastResult: result });
      return result;
    }
    const now = Date.now();
    await recoverInterruptedItems(scope, session.userId);
    await localDb.transaction("rw", localDb.outbox, async () => {
      if (
        getActiveAccountScope() !== scope ||
        getAccountSession().status !== "authenticated" ||
        getAccountSession().userId !== session.userId
      )
        return;
      const entries = await localDb.outbox
        .where("accountScope")
        .equals(scope)
        .toArray();
      for (const entry of entries) {
        if (entry.ownerUserId === session.userId && entry.authBlocked) {
          await localDb.outbox.put({
            ...entry,
            authBlocked: false,
            state: "failed",
            nextAttemptAt: 0,
            updatedAt: now,
          });
        }
      }
    });
    const entries = (await listOutbox(scope))
      .filter((entry) => {
        if (!canProcess(entry, scope, getAccountSession())) return false;
        if (entry.authBlocked && reason !== "manual") return false;
        return entry.state === "pending" || entry.state === "failed";
      })
      .filter((entry) => reason === "manual" || entry.nextAttemptAt <= now);
    if (!entries.length) {
      const result = summary(
        "nothing_to_send",
        0,
        0,
        "There are no reports ready to send.",
      );
      setSyncState({
        running: false,
        lastResult: result,
        nextAttemptAt: await getNextOutboxAttemptAt(scope, session.userId),
      });
      return result;
    }
    let received = 0;
    let failed = 0;
    const controller = new AbortController();
    let queueResult: Awaited<ReturnType<typeof runQueue>>;
    try {
      queueResult = await runQueue({
        scope,
        entries,
        signal: controller.signal,
        processItem: async (entry, signal) => {
          const before = await localDb.outbox.get(entry.id);
          const error = await syncOne(entry, scope, token, transport, signal);
          const after = await localDb.outbox.get(entry.id);
          if (
            after?.accountScope === scope &&
            before?.state !== "received" &&
            after.state === "received"
          )
            received += 1;
          else if (error && error.kind !== "aborted") failed += 1;
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The sync queue could not be processed.";
      const result = summary("error", received, failed + 1, message);
      setSyncState({
        running: false,
        lastResult: result,
        nextAttemptAt: await getNextOutboxAttemptAt(scope, session.userId),
      });
      return result;
    }
    const nextAttemptAt = await getNextOutboxAttemptAt(scope, session.userId);
    const result = queueResult.aborted
      ? summary(
          "error",
          received,
          failed,
          "Sync stopped because the account changed.",
        )
      : failed
        ? summary(
            "error",
            received,
            failed,
            "Some reports could not be sent. Review their status and retry.",
          )
        : summary(
            "complete",
            received,
            0,
            received
              ? `${received} report(s) received by the server.`
              : "There are no reports ready to send.",
          );
    setSyncState({ running: false, lastResult: result, nextAttemptAt });
    if (received > 0) {
      const successfulAt = Date.now();
      if (typeof window !== "undefined")
        window.localStorage.setItem(
          `${LAST_SYNC_KEY_PREFIX}${scope}`,
          `${successfulAt}`,
        );
      setSyncState({ lastSuccessfulSyncAt: successfulAt });
    }
    return result;
  })();
  activeSync = run;
  try {
    return await run;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The sync could not be completed.";
    const result = summary("error", 0, 1, message);
    setSyncState({ running: false, lastResult: result });
    return result;
  } finally {
    activeSync = null;
    setSyncState({ running: false });
  }
}

export async function queueReportForSync(reportId: string) {
  const queued = await enqueueReport(reportId, getActiveAccountScope());
  if (queued.ok) await registerBackgroundSync();
  return queued;
}

export type BackgroundSyncAvailability =
  "unsupported" | "no_service_worker" | "available";
type SyncManagerRegistration = ServiceWorkerRegistration & {
  sync: { register(tag: string): Promise<void> };
};

export async function detectBackgroundSync(): Promise<BackgroundSyncAvailability> {
  if (typeof window === "undefined" || !("SyncManager" in window)) {
    return "unsupported";
  }
  if (typeof navigator === "undefined") return "unsupported";
  const serviceWorker =
    "serviceWorker" in navigator ? navigator.serviceWorker : undefined;
  if (!serviceWorker) return "unsupported";
  const registration = await serviceWorker.getRegistration();
  if (!registration) return "no_service_worker";
  return "sync" in registration ? "available" : "unsupported";
}

export async function registerBackgroundSync() {
  try {
    if ((await detectBackgroundSync()) !== "available") return false;
    const serviceWorker =
      "serviceWorker" in navigator ? navigator.serviceWorker : undefined;
    const registration = (await serviceWorker?.getRegistration()) as
      SyncManagerRegistration | undefined;
    if (!registration?.sync) return false;
    await registration.sync.register("rp-report-sync");
    return true;
  } catch (error) {
    setSyncState({
      lastResult: summary(
        "error",
        0,
        1,
        error instanceof Error
          ? error.message
          : "Background retry could not be scheduled.",
      ),
    });
    return false;
  }
}

export function getLastSyncAt(scope = getActiveAccountScope()) {
  if (typeof window === "undefined") return null;
  const value = Number(
    window.localStorage.getItem(`${LAST_SYNC_KEY_PREFIX}${scope}`),
  );
  return Number.isFinite(value) && value > 0 ? value : null;
}
