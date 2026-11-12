import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDevReceiptStub } from "@/dev/receipt-stub";
import {
  getAccountSession,
  setAccessTokenProvider,
  setAccountSession,
} from "@/lib/account-session";
import { localDb, type DraftRecord, type OutboxRecord } from "@/lib/local-db";
import {
  buildMetadataPayload,
  detectBackgroundSync,
  getTransport,
  nextDelay,
  registerBackgroundSync,
  setSyncTransportForTests,
  syncNow,
} from "@/lib/sync/sync-engine";
import type { ReportMetadataPayload, ReportReceipt } from "@/lib/sync/contract";
import type { SyncTransport } from "@/lib/sync/http-transport";

const userId = "user-123";
const scope = `user:${userId}`;
const incidentAt = "2026-10-25T04:30:00.000Z";

function draftRecord(overrides: Partial<DraftRecord> = {}): DraftRecord {
  const savedAt = Date.parse("2026-10-25T05:00:00.000Z");
  return {
    id: "472a8308-8866-4a2d-bf4a-9d8b381f6f03",
    accountScope: scope,
    ownerUserId: userId,
    status: "ready_to_send",
    eventTime: incidentAt,
    observedAtLocal: "2026-10-25T10:00",
    payload: {
      hazardType: "landslide",
      description: "Loose debris on the road.",
      observedAt: "2026-10-25T10:00",
      photo: null,
      location: {
        query: "Joshimath",
        roadSegment: "NH-7",
        lat: 30.555,
        lon: 79.5643,
        accuracyM: 12,
        source: "device",
        confirmed: true,
      },
      source: "firsthand",
      laneDirection: "one_lane",
      vehicleApplicability: "light_vehicles",
    },
    attachments: [],
    localReference: null,
    createdAt: savedAt,
    updatedAt: savedAt,
    savedAt,
    schemaVersion: 1,
    ...overrides,
  };
}

function outboxRecord(
  draft: DraftRecord,
  overrides: Partial<OutboxRecord> = {},
): OutboxRecord {
  return {
    id: draft.id,
    reportId: draft.id,
    accountScope: scope,
    ownerUserId: userId,
    state: "pending",
    attempts: 0,
    nextAttemptAt: 0,
    lastErrorCode: null,
    lastErrorMessage: null,
    retryAfterAt: null,
    metadataReceipt: null,
    deliveredAt: null,
    authBlocked: false,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
    ...overrides,
  };
}

function receipt(reportId: string): ReportReceipt {
  return {
    reportId,
    receiptId: "receipt-test",
    receivedAt: "2026-10-28T04:30:00.000Z",
    duplicate: false,
  };
}

function transport(sendMetadata: SyncTransport["sendMetadata"]): SyncTransport {
  return {
    sendMetadata,
    requestUploadTarget: async () => ({
      ok: false,
      error: { kind: "server", retryable: true, message: "target failed" },
    }),
    uploadBlob: async () => ({ ok: true, value: undefined }),
  };
}

async function addToQueue(draft = draftRecord(), outbox = outboxRecord(draft)) {
  await localDb.drafts.put(draft);
  await localDb.outbox.put(outbox);
  return { draft, outbox };
}

beforeEach(async () => {
  vi.useRealTimers();
  await localDb.drafts.clear();
  await localDb.attachments.clear();
  await localDb.outbox.clear();
  window.localStorage.clear();
  Object.defineProperty(navigator, "onLine", {
    configurable: true,
    value: true,
  });
  setAccountSession({ status: "authenticated", userId });
  setAccessTokenProvider(async () => "test-only-token");
});

afterEach(() => {
  setAccountSession({ status: "signed_out", userId: null });
  setAccessTokenProvider(null);
  setSyncTransportForTests(undefined);
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("sync contract and queue behavior", () => {
  it("uses the dev receipt stub when no API base is configured and the flag is enabled", async () => {
    vi.stubEnv("VITE_REPORTS_API_BASE", "");
    vi.stubEnv("VITE_DEV_RECEIPT_STUB", "true");

    await expect(getTransport()).resolves.toBe(getDevReceiptStub());
  });

  it("exposes development sign-in helpers when the receipt stub is loaded in a browser", () => {
    expect(window.__rpDev).toBeDefined();
    window.__rpDev!.signIn("dev-user");
    expect(getAccountSession()).toEqual({
      status: "authenticated",
      userId: "dev-user",
    });

    window.__rpDev!.signOut();
    expect(getAccountSession()).toEqual({
      status: "signed_out",
      userId: null,
    });
  });

  it("uses the stored event time unchanged when sending days later", async () => {
    const stored = draftRecord();
    const { outbox } = await addToQueue(stored);
    const storedPayload = buildMetadataPayload(stored, outbox);
    expect(storedPayload.ok && storedPayload.payload.eventTime).toBe(
      incidentAt,
    );
    const sent: ReportMetadataPayload[] = [];
    setSyncTransportForTests(
      transport(async (payload) => {
        sent.push(payload);
        return { ok: true, value: receipt(payload.reportId) };
      }),
    );
    vi.useFakeTimers();
    vi.setSystemTime(Date.parse("2026-10-28T05:00:00.000Z"));

    await syncNow({ reason: "manual" });

    expect(sent[0].eventTime).toBe(incidentAt);
    expect(sent[0].clientSavedAt).toBe(new Date(stored.savedAt!).toISOString());
    expect(sent[0].eventTime).not.toBe(sent[0].clientSavedAt);
    expect(sent[0].reportId).toBe(outbox.reportId);
    expect(
      (await localDb.outbox.get(outbox.id))?.metadataReceipt?.receivedAt,
    ).toBe(receipt(outbox.reportId).receivedAt);
  });

  it("rejects invalid event time or unconfirmed locations locally without a request", async () => {
    const draft = draftRecord({
      eventTime: "",
      payload: {
        ...draftRecord().payload,
        location: { ...draftRecord().payload.location!, confirmed: false },
      },
    });
    await addToQueue(draft);
    const sendMetadata = vi.fn(async () => ({
      ok: true as const,
      value: receipt(draft.id),
    }));
    setSyncTransportForTests(transport(sendMetadata));

    await syncNow({ reason: "manual" });

    expect(sendMetadata).not.toHaveBeenCalled();
    expect(await localDb.outbox.get(draft.id)).toMatchObject({
      state: "rejected",
      lastErrorCode: "invalid_local_report",
    });
  });

  it("marks a valid receipt as received and stores it with the outbox row", async () => {
    const draft = draftRecord();
    await addToQueue(draft);
    setSyncTransportForTests(
      transport(async (payload) => ({
        ok: true,
        value: receipt(payload.reportId),
      })),
    );

    const result = await syncNow({ reason: "manual" });
    const stored = await localDb.outbox.get(draft.id);

    expect(result.received).toBe(1);
    expect(stored).toMatchObject({
      state: "received",
      metadataReceipt: {
        receiptId: "receipt-test",
        receivedAt: receipt(draft.id).receivedAt,
        duplicate: false,
      },
    });
    expect(stored?.deliveredAt).toEqual(expect.any(Number));
  });

  it("does not mark malformed transport receipts as received", async () => {
    const draft = draftRecord();
    await addToQueue(draft);
    setSyncTransportForTests(
      transport(async (payload) => ({
        ok: true,
        value: {
          reportId: payload.reportId,
          receiptId: "",
          receivedAt: "invalid-date",
          duplicate: false,
        },
      })),
    );

    await syncNow({ reason: "manual" });

    expect(await localDb.outbox.get(draft.id)).toMatchObject({
      state: "failed",
      attempts: 1,
      metadataReceipt: null,
      lastErrorCode: "malformed_response",
    });
  });

  it("does not increment attempts when authentication is required", async () => {
    const draft = draftRecord();
    await addToQueue(draft);
    setSyncTransportForTests(
      transport(async () => ({
        ok: false,
        error: {
          kind: "auth_required",
          retryable: true,
          message: "Sign in again.",
        },
      })),
    );

    await syncNow({ reason: "manual" });

    expect(await localDb.outbox.get(draft.id)).toMatchObject({
      state: "failed",
      attempts: 0,
      authBlocked: true,
      lastErrorCode: "auth_required",
    });
  });

  it("retries a lost acknowledgment with the same report ID and one stub receipt", async () => {
    const draft = draftRecord();
    await addToQueue(draft);
    const stub = getDevReceiptStub();
    window.__rpDevStub?.dropAckNext(1);
    setSyncTransportForTests(stub);

    await syncNow({ reason: "manual" });
    const retry = await syncNow({ reason: "manual" });
    const received = window.__rpDevStub
      ?.received()
      .filter((item) => item.reportId === draft.id);

    expect(received).toHaveLength(1);
    expect(retry.received).toBe(1);
    expect(
      (await localDb.outbox.get(draft.id))?.metadataReceipt?.duplicate,
    ).toBe(true);
  });

  it("never sends anonymous-owned queue items", async () => {
    const draft = draftRecord({ ownerUserId: null, accountScope: "anonymous" });
    const outbox = outboxRecord(draft, {
      ownerUserId: null,
      accountScope: "anonymous",
    });
    await addToQueue(draft, outbox);
    const sendMetadata = vi.fn(async () => ({
      ok: true as const,
      value: receipt(draft.id),
    }));
    setSyncTransportForTests(transport(sendMetadata));

    await syncNow({ reason: "manual" });

    expect(sendMetadata).not.toHaveBeenCalled();
    expect((await localDb.outbox.get(draft.id))?.state).toBe("pending");
  });

  it("does not persist an acknowledgment after the account changes mid-request", async () => {
    const draft = draftRecord();
    await addToQueue(draft);
    let respond!: (
      result: Awaited<ReturnType<SyncTransport["sendMetadata"]>>,
    ) => void;
    const response = new Promise<
      Awaited<ReturnType<SyncTransport["sendMetadata"]>>
    >((resolve) => {
      respond = resolve;
    });
    setSyncTransportForTests(transport(async () => await response));

    const running = syncNow({ reason: "manual" });
    await vi.waitFor(async () =>
      expect((await localDb.outbox.get(draft.id))?.state).toBe("sending"),
    );
    setAccountSession({ status: "authenticated", userId: "other-user" });
    respond({ ok: true, value: receipt(draft.id) });
    await running;

    expect(await localDb.outbox.get(draft.id)).toMatchObject({
      accountScope: scope,
      state: "sending",
      metadataReceipt: null,
    });
    expect(
      await localDb.outbox
        .where("accountScope")
        .equals("user:other-user")
        .count(),
    ).toBe(0);
  });

  it("returns explicit unavailable results without making requests", async () => {
    const draft = draftRecord();
    await addToQueue(draft);
    const sendMetadata = vi.fn(async () => ({
      ok: true as const,
      value: receipt(draft.id),
    }));
    setSyncTransportForTests(transport(sendMetadata));
    setAccountSession({ status: "signed_out", userId: null });
    expect((await syncNow({ reason: "manual" })).status).toBe("signed_out");
    setAccountSession({ status: "authenticated", userId });
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: false,
    });
    expect((await syncNow({ reason: "manual" })).status).toBe("offline");
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    });
    setSyncTransportForTests(null);
    expect((await syncNow({ reason: "manual" })).status).toBe("not_configured");
    expect(sendMetadata).not.toHaveBeenCalled();
  });

  it("lets manual sync bypass backoff while automatic sync respects it", async () => {
    const draft = draftRecord();
    await addToQueue(
      draft,
      outboxRecord(draft, {
        state: "failed",
        attempts: 2,
        nextAttemptAt: Date.now() + 60_000,
      }),
    );
    const sendMetadata = vi.fn(async (payload: ReportMetadataPayload) => ({
      ok: true as const,
      value: receipt(payload.reportId),
    }));
    setSyncTransportForTests(transport(sendMetadata));

    expect((await syncNow({ reason: "foreground" })).status).toBe(
      "nothing_to_send",
    );
    expect(sendMetadata).not.toHaveBeenCalled();
    expect((await syncNow({ reason: "manual" })).received).toBe(1);
    expect(sendMetadata).toHaveBeenCalledOnce();
    // Local-only observation details are not part of the agreed API contract.
    const [sentPayload] = sendMetadata.mock.calls[0];
    expect(sentPayload).not.toHaveProperty("source");
    expect(sentPayload).not.toHaveProperty("laneDirection");
    expect(sentPayload).not.toHaveProperty("vehicleApplicability");
  });

  it("deduplicates concurrent sync calls into one queue run", async () => {
    const draft = draftRecord();
    await addToQueue(draft);
    let respond!: (
      result: Awaited<ReturnType<SyncTransport["sendMetadata"]>>,
    ) => void;
    const response = new Promise<
      Awaited<ReturnType<SyncTransport["sendMetadata"]>>
    >((resolve) => {
      respond = resolve;
    });
    const sendMetadata = vi.fn(async () => await response);
    setSyncTransportForTests(transport(sendMetadata));

    const first = syncNow({ reason: "manual" });
    const second = syncNow({ reason: "manual" });
    await vi.waitFor(() => expect(sendMetadata).toHaveBeenCalledOnce());
    respond({ ok: true, value: receipt(draft.id) });

    expect(await Promise.all([first, second])).toEqual([
      expect.objectContaining({ received: 1 }),
      expect.objectContaining({ received: 1 }),
    ]);
    expect(sendMetadata).toHaveBeenCalledOnce();
  });

  it("keeps metadata received when media fails and retries media without resending metadata", async () => {
    const attachmentRef = {
      id: "attachment-1",
      name: "road.jpg",
      type: "image/jpeg",
      size: 5,
      timestamp: Date.parse(incidentAt),
      locationTag: "30.5550° N",
    };
    const base = draftRecord();
    const draft = draftRecord({
      attachments: [attachmentRef],
      payload: { ...base.payload, photo: attachmentRef },
    });
    await addToQueue(draft);
    await localDb.attachments.put({
      ...attachmentRef,
      draftId: draft.id,
      accountScope: scope,
      blob: new Blob(["image"]),
      createdAt: Date.now(),
      uploadState: "not_started",
      uploadError: null,
      uploadedAt: null,
      uploadAttempts: 0,
      uploadTarget: null,
    });
    const metadataSend = vi.fn(async (value: ReportMetadataPayload) => ({
      ok: true as const,
      value: receipt(value.reportId),
    }));
    let uploadCount = 0;
    const mediaTransport: SyncTransport = {
      sendMetadata: metadataSend,
      requestUploadTarget: async () => ({
        ok: true,
        value: {
          uploadUrl: "https://storage.example/file",
          method: "PUT",
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
        },
      }),
      uploadBlob: async () => {
        uploadCount += 1;
        return uploadCount === 1
          ? {
              ok: false,
              error: {
                kind: "network",
                retryable: true,
                message: "Photo transfer failed.",
              },
            }
          : { ok: true, value: undefined };
      },
    };
    setSyncTransportForTests(mediaTransport);

    await syncNow({ reason: "manual" });
    expect(await localDb.outbox.get(draft.id)).toMatchObject({
      state: "received",
    });
    expect(await localDb.attachments.get(attachmentRef.id)).toMatchObject({
      uploadState: "failed",
    });

    const retry = await (
      await import("@/lib/sync/sync-engine")
    ).retryAttachmentUpload(draft.id, attachmentRef.id);

    expect(retry.ok).toBe(true);
    expect(metadataSend).toHaveBeenCalledTimes(1);
    expect(await localDb.attachments.get(attachmentRef.id)).toMatchObject({
      uploadState: "uploaded",
    });
  });

  it("refreshes an expired signed upload target when retrying media", async () => {
    const attachmentRef = {
      id: "attachment-expired",
      name: "road.jpg",
      type: "image/jpeg",
      size: 5,
      timestamp: Date.parse(incidentAt),
      locationTag: "30.5550° N",
    };
    const draft = draftRecord({ attachments: [attachmentRef] });
    await localDb.drafts.put(draft);
    await localDb.outbox.put(
      outboxRecord(draft, {
        state: "received",
        metadataReceipt: {
          receiptId: "receipt-existing",
          receivedAt: "2026-10-28T04:30:00.000Z",
          duplicate: false,
        },
      }),
    );
    await localDb.attachments.put({
      ...attachmentRef,
      draftId: draft.id,
      accountScope: scope,
      blob: new Blob(["image"]),
      createdAt: Date.now(),
      uploadState: "failed",
      uploadError: "Expired URL.",
      uploadedAt: null,
      uploadAttempts: 1,
      uploadTarget: {
        uploadUrl: "https://storage.example/old",
        method: "PUT",
        expiresAt: "2020-01-01T00:00:00.000Z",
      },
    });
    const refresh = vi.fn(async () => ({
      ok: true as const,
      value: {
        uploadUrl: "https://storage.example/new",
        method: "PUT" as const,
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      },
    }));
    const metadataSend = vi.fn();
    setSyncTransportForTests({
      ...transport(async () => ({ ok: true, value: receipt(draft.id) })),
      sendMetadata: metadataSend,
      requestUploadTarget: refresh,
    });

    const { retryAttachmentUpload } = await import("@/lib/sync/sync-engine");
    const result = await retryAttachmentUpload(draft.id, attachmentRef.id);

    expect(result.ok).toBe(true);
    expect(refresh).toHaveBeenCalledOnce();
    expect(metadataSend).not.toHaveBeenCalled();
    expect(
      (await localDb.attachments.get(attachmentRef.id))?.uploadTarget
        ?.uploadUrl,
    ).toBe("https://storage.example/new");
  });

  it("detects Background Sync support and registers only when available", async () => {
    expect(await detectBackgroundSync()).toBe("unsupported");
    Object.defineProperty(window, "SyncManager", {
      configurable: true,
      value: class SyncManager {},
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { getRegistration: vi.fn(async () => undefined) },
    });
    expect(await detectBackgroundSync()).toBe("no_service_worker");

    const register = vi.fn(async () => undefined);
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { getRegistration: vi.fn(async () => ({ sync: { register } })) },
    });
    expect(await detectBackgroundSync()).toBe("available");
    expect(await registerBackgroundSync()).toBe(true);
    expect(register).toHaveBeenCalledWith("rp-report-sync");

    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: undefined,
    });
    delete (window as Window & { SyncManager?: unknown }).SyncManager;
  });
});

describe("retry delay", () => {
  it("grows exponentially, applies bounded jitter, caps at fifteen minutes, and honors Retry-After", () => {
    expect(nextDelay(1, 0, () => 0)).toBe(4_000);
    expect(nextDelay(2, 0, () => 0.5)).toBe(10_000);
    expect(nextDelay(100, 0, () => 1)).toBe(15 * 60_000);
    expect(nextDelay(1, 60_000, () => 0.5)).toBe(60_000);
  });
});
