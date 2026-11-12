import { liveQuery } from "dexie";
import { getActiveAccountScope } from "@/lib/account-scope";
import { getAccountSession } from "@/lib/account-session";
import {
  localDb,
  type AttachmentRecord,
  type DraftAttachmentReference,
  type DraftRecord,
  type DraftStatus,
  type OutboxRecord,
  type ReceiptEventRecord,
  type ReceiptEventType,
} from "@/lib/local-db";
import { makeLocalReference, type ReportDraft } from "@/lib/report-store";

export type RepositoryWriteResult =
  | { ok: true; id: string; savedAt: number }
  | {
      ok: false;
      code: "quota_exceeded" | "storage_unavailable" | "write_failed";
      message: string;
    };

export type DraftInput = {
  id?: string;
  accountScope?: string;
  status?: DraftStatus;
  eventTime?: string;
  observedAtLocal?: string;
  payload?: ReportDraft;
  draft?: ReportDraft;
  attachments?: DraftAttachmentReference[];
  localReference?: string | null;
  createdAt?: number;
  updatedAt?: number;
  savedAt?: number | null;
  schemaVersion?: number;
};

const ACTIVE_DRAFT_KEY_PREFIX = "rp.activeDraftId.";

function activeDraftPointerKey(scope: string) {
  return `${ACTIVE_DRAFT_KEY_PREFIX}${scope}`;
}

function formatLocalDateTime(date: Date) {
  const pad = (value: number) => `${value}`.padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toUtcIso(dateValue: string | undefined) {
  if (!dateValue) return new Date().toISOString();
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
}

function normalizePayload(payload?: ReportDraft | null): ReportDraft {
  const seed = payload ?? {
    hazardType: "",
    description: "",
    observedAt: formatLocalDateTime(new Date()),
    photo: null,
    location: null,
  };
  return {
    hazardType: seed.hazardType ?? "",
    description: seed.description ?? "",
    observedAt: seed.observedAt ?? formatLocalDateTime(new Date()),
    photo: seed.photo ?? null,
    location: seed.location ?? null,
  };
}

function deriveEventTime(observedAt: string | undefined) {
  if (!observedAt) return "";
  const parsed = new Date(observedAt);
  return Number.isNaN(parsed.getTime()) ? "" : toUtcIso(observedAt);
}

function mapStorageError(error: unknown): RepositoryWriteResult {
  const value = error instanceof Error ? error : new Error(String(error));
  const name = value.name || "";
  const message = value.message.toLowerCase();

  if (
    name === "QuotaExceededError" ||
    /quota/i.test(message) ||
    /exceeded/i.test(message) ||
    /disk full/i.test(message)
  ) {
    return {
      ok: false,
      code: "quota_exceeded",
      message:
        "Device storage is full. Free up space and try again. Your report was NOT saved.",
    };
  }

  if (
    typeof indexedDB === "undefined" ||
    name === "OpenFailedError" ||
    /openfailed/i.test(message) ||
    /private mode/i.test(message) ||
    /storage blocked/i.test(message) ||
    /storage is unavailable/i.test(message) ||
    /securityerror/i.test(message) ||
    /invalidstateerror/i.test(message) ||
    /blocked/i.test(message) ||
    name === "SecurityError"
  ) {
    return {
      ok: false,
      code: "storage_unavailable",
      message:
        "This browser can't store drafts (private mode or storage blocked). Your report was NOT saved.",
    };
  }

  return {
    ok: false,
    code: "write_failed",
    message: "Could not save on this device. Try again.",
  };
}

export function newReportId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (character) => {
      const random = Math.floor(Math.random() * 16);
      return (character === "x" ? random : (random & 0x3) | 0x8).toString(16);
    },
  );
}

function readLegacyDraft() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("rp.reportDraft");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : null;
  } catch {
    return null;
  }
}

function readLegacyLocalReports(): Array<Record<string, unknown>> {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem("rp.localReports");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? (parsed as Array<Record<string, unknown>>)
      : [];
  } catch {
    return [];
  }
}

function readLegacyLastReport(): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("rp.lastLocalReport");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

async function legacyPhotoBlob(photoId: string): Promise<Blob | null> {
  if (typeof window === "undefined" || typeof window.indexedDB === "undefined")
    return null;
  return await new Promise<Blob | null>((resolve) => {
    const request = window.indexedDB.open("raahprahari-report-evidence", 1);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("photos", "readonly");
      const store = tx.objectStore("photos");
      const fileRequest = store.get(photoId);
      fileRequest.onsuccess = () => {
        const blob = fileRequest.result as Blob | undefined;
        db.close();
        resolve(blob ?? null);
      };
      fileRequest.onerror = () => {
        db.close();
        resolve(null);
      };
    };
    request.onerror = () => resolve(null);
  });
}

async function migrateLegacyData(scope: string) {
  if (typeof window === "undefined") return;

  const hasLegacy = !!(
    window.localStorage.getItem("rp.reportDraft") ||
    window.localStorage.getItem("rp.localReports") ||
    window.localStorage.getItem("rp.lastLocalReport")
  );
  if (!hasLegacy) return;

  const existing = await localDb.drafts
    .where("accountScope")
    .equals(scope)
    .limit(1)
    .first();
  if (existing) return;

  const records: DraftRecord[] = [];
  const attachments: AttachmentRecord[] = [];

  const legacyDraft = readLegacyDraft();
  if (legacyDraft && typeof legacyDraft === "object") {
    const payload = normalizePayload(legacyDraft as ReportDraft);
    const id = newReportId();
    records.push({
      id,
      accountScope: scope,
      ownerUserId: null,
      status: "draft",
      eventTime: deriveEventTime(payload.observedAt),
      observedAtLocal: payload.observedAt,
      payload,
      attachments: payload.photo
        ? [
            {
              ...payload.photo,
              timestamp: payload.photo.timestamp ?? Date.now(),
              locationTag: payload.photo.locationTag ?? "No location tag",
            },
          ]
        : [],
      localReference: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      savedAt: Date.now(),
      schemaVersion: 1,
    });
    if (payload.photo?.id) {
      const blob = await legacyPhotoBlob(payload.photo.id);
      if (blob) {
        attachments.push({
          id: payload.photo.id,
          draftId: id,
          accountScope: scope,
          blob,
          name: payload.photo.name || "photo",
          type: payload.photo.type || "image/jpeg",
          size: payload.photo.size || blob.size,
          createdAt: Date.now(),
          uploadState: "not_started",
          uploadError: null,
          uploadedAt: null,
          uploadAttempts: 0,
          uploadTarget: null,
        });
      }
    }
  }

  for (const report of readLegacyLocalReports()) {
    const draft = (report.draft ?? report.payload ?? report) as
      ReportDraft | undefined;
    if (!draft || typeof draft !== "object") continue;
    const payload = normalizePayload(draft);
    const localReference =
      typeof report.reference === "string" ? report.reference : null;
    const savedAt =
      typeof report.savedAt === "number" ? report.savedAt : Date.now();
    const id = newReportId();
    records.push({
      id,
      accountScope: scope,
      ownerUserId: null,
      status: "ready_to_send",
      eventTime: deriveEventTime(payload.observedAt),
      observedAtLocal: payload.observedAt,
      payload,
      attachments: payload.photo
        ? [
            {
              ...payload.photo,
              timestamp: payload.photo.timestamp ?? savedAt,
              locationTag: payload.photo.locationTag ?? "No location tag",
            },
          ]
        : [],
      localReference,
      createdAt: savedAt,
      updatedAt: savedAt,
      savedAt,
      schemaVersion: 1,
    });
    if (payload.photo?.id) {
      const blob = await legacyPhotoBlob(payload.photo.id);
      if (blob) {
        attachments.push({
          id: payload.photo.id,
          draftId: id,
          accountScope: scope,
          blob,
          name: payload.photo.name || "photo",
          type: payload.photo.type || "image/jpeg",
          size: payload.photo.size || blob.size,
          createdAt: savedAt,
          uploadState: "not_started",
          uploadError: null,
          uploadedAt: null,
          uploadAttempts: 0,
          uploadTarget: null,
        });
      }
    }
  }

  const last = readLegacyLastReport();
  if (last && typeof last === "object" && "draft" in last) {
    const draft = last.draft as ReportDraft | undefined;
    if (draft) {
      const payload = normalizePayload(draft);
      const localReference =
        typeof last.reference === "string" ? last.reference : null;
      const savedAt =
        typeof last.savedAt === "number" ? last.savedAt : Date.now();
      const id = newReportId();
      records.push({
        id,
        accountScope: scope,
        ownerUserId: null,
        status: "ready_to_send",
        eventTime: deriveEventTime(payload.observedAt),
        observedAtLocal: payload.observedAt,
        payload,
        attachments: payload.photo
          ? [
              {
                ...payload.photo,
                timestamp: payload.photo.timestamp ?? savedAt,
                locationTag: payload.photo.locationTag ?? "No location tag",
              },
            ]
          : [],
        localReference,
        createdAt: savedAt,
        updatedAt: savedAt,
        savedAt,
        schemaVersion: 1,
      });
      if (payload.photo?.id) {
        const blob = await legacyPhotoBlob(payload.photo.id);
        if (blob) {
          attachments.push({
            id: payload.photo.id,
            draftId: id,
            accountScope: scope,
            blob,
            name: payload.photo.name || "photo",
            type: payload.photo.type || "image/jpeg",
            size: payload.photo.size || blob.size,
            createdAt: savedAt,
            uploadState: "not_started",
            uploadError: null,
            uploadedAt: null,
            uploadAttempts: 0,
            uploadTarget: null,
          });
        }
      }
    }
  }

  if (!records.length) return;

  try {
    await localDb.transaction(
      "rw",
      localDb.drafts,
      localDb.attachments,
      async () => {
        await localDb.drafts.bulkPut(records);
        if (attachments.length) await localDb.attachments.bulkPut(attachments);
      },
    );
    const readBack = await localDb.drafts
      .where("accountScope")
      .equals(scope)
      .count();
    if (readBack === 0) throw new Error("Legacy readback failed");

    window.localStorage.removeItem("rp.reportDraft");
    window.localStorage.removeItem("rp.localReports");
    window.localStorage.removeItem("rp.lastLocalReport");
    if (
      typeof window !== "undefined" &&
      typeof window.indexedDB !== "undefined"
    ) {
      try {
        window.indexedDB.deleteDatabase("raahprahari-report-evidence");
      } catch {
        // Intentional: best-effort cleanup for legacy storage.
      }
    }
  } catch {
    // Keep legacy data untouched on failure; no destructive cleanup is attempted.
  }
}

async function ensureScopeData(scope: string) {
  await migrateLegacyData(scope);
}

export async function listReceiptEvents(
  reportId: string,
  scope = getActiveAccountScope(),
) {
  if (!reportId || scope === "anonymous") return [];
  try {
    const eventList = await localDb.receiptEvents
      .where("reportId")
      .equals(reportId)
      .toArray();
    return eventList.filter((event) => event.accountScope === scope);
  } catch (error) {
    if (error instanceof Error && error.name === "NotFoundError") return [];
    throw error;
  }
}

export function useReceiptEvents(reportId: string | null | undefined) {
  return liveQuery(() => {
    if (!reportId) return [];
    return listReceiptEvents(reportId, getActiveAccountScope());
  });
}

export async function appendReceiptEvent(
  reportId: string,
  scope = getActiveAccountScope(),
  event: Omit<ReceiptEventRecord, "id" | "reportId" | "accountScope"> & {
    type: ReceiptEventType;
  },
) {
  if (!reportId || scope === "anonymous") return null;

  try {
    const record: ReceiptEventRecord = {
      reportId,
      accountScope: scope,
      ...event,
    };

    const existing = await localDb.receiptEvents
      .where("reportId")
      .equals(reportId)
      .toArray();
    const scoped = existing.filter((item) => item.accountScope === scope);
    const sorted = [...scoped].sort((a, b) => a.at - b.at);
    const overflow = sorted.length + 1 - 50;
    if (overflow > 0) {
      const idsToDelete = new Set<number>();
      const sendFailed = sorted.filter((item) => item.type === "send_failed");
      for (const item of sendFailed) {
        if (idsToDelete.size >= overflow) break;
        if (item.id !== undefined) idsToDelete.add(item.id);
      }
      if (idsToDelete.size < overflow) {
        for (const item of sorted) {
          if (idsToDelete.size >= overflow) break;
          if (item.type === "send_failed") continue;
          if (item.id !== undefined) idsToDelete.add(item.id);
        }
      }
      if (idsToDelete.size > 0) {
        await localDb.receiptEvents.bulkDelete([...idsToDelete]);
      }
    }

    const id = await localDb.receiptEvents.add(record);
    return { id, ...record };
  } catch (error) {
    if (error instanceof Error && error.name === "NotFoundError") return null;
    throw error;
  }
}

export async function listReportsForScope(scope = getActiveAccountScope()) {
  const drafts = await localDb.drafts
    .where("accountScope")
    .equals(scope)
    .sortBy("updatedAt");

  const reportIds = drafts.map((draft) => draft.id);
  const outboxes = await localDb.outbox
    .where("accountScope")
    .equals(scope)
    .filter((entry) => reportIds.includes(entry.reportId))
    .toArray();
  const byId = new Map(outboxes.map((entry) => [entry.reportId, entry]));

  return drafts.map((draft) => ({
    draft,
    outbox: byId.get(draft.id) ?? null,
  }));
}

export async function createDraft(
  input: DraftInput = {},
): Promise<RepositoryWriteResult> {
  const scope = input.accountScope ?? getActiveAccountScope();
  const id = input.id ?? newReportId();
  const payload = normalizePayload(input.payload ?? input.draft);
  const record: DraftRecord = {
    id,
    accountScope: scope,
    ownerUserId:
      getAccountSession().status === "authenticated"
        ? getAccountSession().userId
        : null,
    status: input.status ?? "draft",
    eventTime: input.eventTime ?? deriveEventTime(payload.observedAt),
    observedAtLocal: input.observedAtLocal ?? payload.observedAt,
    payload,
    attachments:
      input.attachments ??
      (payload.photo
        ? [
            {
              ...payload.photo,
              timestamp: payload.photo.timestamp ?? Date.now(),
              locationTag: payload.photo.locationTag ?? "No location tag",
            },
          ]
        : []),
    localReference: input.localReference ?? null,
    createdAt: input.createdAt ?? Date.now(),
    updatedAt: input.updatedAt ?? Date.now(),
    savedAt: input.savedAt ?? Date.now(),
    schemaVersion: input.schemaVersion ?? 1,
  };

  try {
    await localDb.drafts.put(record);
    await appendReceiptEvent(id, scope, {
      type: "saved_locally",
      at: record.savedAt ?? Date.now(),
      code: "saved",
      detail: record.payload.hazardType || null,
      receiptId: null,
      serverReceivedAt: null,
    });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(activeDraftPointerKey(scope), id);
      window.localStorage.setItem(
        "rp.reportDraft",
        JSON.stringify(record.payload),
      );
    }
    return { ok: true, id, savedAt: record.savedAt ?? Date.now() };
  } catch (error) {
    return mapStorageError(error);
  }
}

export async function saveDraft(
  input: DraftInput = {},
): Promise<RepositoryWriteResult> {
  const scope = input.accountScope ?? getActiveAccountScope();
  const id = input.id ?? newReportId();
  const payload = normalizePayload(input.payload ?? input.draft);
  const now = Date.now();

  try {
    const existing = await localDb.drafts.get(id);
    const next: DraftRecord = {
      id,
      accountScope: scope,
      ownerUserId: existing
        ? existing.ownerUserId
        : getAccountSession().status === "authenticated"
          ? getAccountSession().userId
          : null,
      status: input.status ?? existing?.status ?? "draft",
      eventTime:
        input.eventTime ??
        existing?.eventTime ??
        deriveEventTime(payload.observedAt),
      observedAtLocal:
        input.observedAtLocal ??
        existing?.observedAtLocal ??
        payload.observedAt,
      payload,
      attachments:
        input.attachments ??
        existing?.attachments ??
        (payload.photo
          ? [
              {
                ...payload.photo,
                timestamp: payload.photo.timestamp ?? now,
                locationTag: payload.photo.locationTag ?? "No location tag",
              },
            ]
          : []),
      localReference: input.localReference ?? existing?.localReference ?? null,
      createdAt: input.createdAt ?? existing?.createdAt ?? now,
      updatedAt: input.updatedAt ?? now,
      savedAt: input.savedAt ?? now,
      schemaVersion: input.schemaVersion ?? existing?.schemaVersion ?? 1,
    };
    await localDb.drafts.put(next);
    await appendReceiptEvent(id, scope, {
      type: "saved_locally",
      at: next.savedAt ?? now,
      code: "saved",
      detail: next.payload.hazardType || null,
      receiptId: null,
      serverReceivedAt: null,
    });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(activeDraftPointerKey(scope), id);
      window.localStorage.setItem(
        "rp.reportDraft",
        JSON.stringify(next.payload),
      );
    }
    return { ok: true, id, savedAt: next.savedAt ?? now };
  } catch (error) {
    return mapStorageError(error);
  }
}

export async function loadActiveDraft(
  scope = getActiveAccountScope(),
): Promise<DraftRecord | null> {
  await ensureScopeData(scope);

  const pointerId =
    typeof window !== "undefined"
      ? window.localStorage.getItem(activeDraftPointerKey(scope))
      : null;
  if (pointerId) {
    const record = await localDb.drafts.get(pointerId);
    if (record && record.accountScope === scope) {
      return record;
    }
  }

  const fallback = await localDb.drafts
    .where("accountScope")
    .equals(scope)
    .filter((record) => record.status === "draft")
    .reverse()
    .sortBy("updatedAt");
  const [latest] = fallback.slice(-1);
  if (latest) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(activeDraftPointerKey(scope), latest.id);
    }
    return latest;
  }

  return null;
}

export async function getDraft(id: string, scope = getActiveAccountScope()) {
  await ensureScopeData(scope);
  const record = await localDb.drafts.get(id);
  return record && record.accountScope === scope ? record : null;
}

export async function listDrafts(scope = getActiveAccountScope()) {
  await ensureScopeData(scope);
  return await localDb.drafts
    .where("accountScope")
    .equals(scope)
    .reverse()
    .sortBy("updatedAt");
}

export async function deleteDraft(
  id: string,
  scope = getActiveAccountScope(),
): Promise<RepositoryWriteResult> {
  try {
    await localDb.transaction(
      "rw",
      localDb.drafts,
      localDb.attachments,
      async () => {
        const draft = await localDb.drafts.get(id);
        if (!draft || draft.accountScope !== scope) return;
        const relatedAttachmentIds = draft.attachments.map(
          (attachment) => attachment.id,
        );
        if (relatedAttachmentIds.length) {
          await localDb.attachments.bulkDelete(relatedAttachmentIds);
        }
        await localDb.drafts.delete(id);
        const pointer =
          typeof window !== "undefined"
            ? window.localStorage.getItem(activeDraftPointerKey(scope))
            : null;
        if (pointer === id) {
          window.localStorage.removeItem(activeDraftPointerKey(scope));
        }
      },
    );
    return { ok: true, id, savedAt: Date.now() };
  } catch (error) {
    return mapStorageError(error);
  }
}

export async function markReadyToSend(
  id: string,
  scope = getActiveAccountScope(),
): Promise<RepositoryWriteResult> {
  try {
    let result: RepositoryWriteResult = { ok: true, id, savedAt: Date.now() };
    await localDb.transaction("rw", localDb.drafts, async () => {
      const draft = await localDb.drafts.get(id);
      if (!draft || draft.accountScope !== scope) {
        result = {
          ok: false,
          code: "write_failed",
          message: "Could not save on this device. Try again.",
        };
        return;
      }
      const nextSavedAt = Date.now();
      const next: DraftRecord = {
        ...draft,
        ownerUserId: draft.ownerUserId,
        status: "ready_to_send",
        localReference:
          draft.localReference ?? makeLocalReference(new Date(nextSavedAt)),
        updatedAt: nextSavedAt,
        savedAt: nextSavedAt,
      };
      await localDb.drafts.put(next);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(activeDraftPointerKey(scope), id);
        window.localStorage.setItem(
          "rp.reportDraft",
          JSON.stringify(next.payload),
        );
      }
      result = { ok: true, id, savedAt: nextSavedAt };
    });
    return result;
  } catch (error) {
    return mapStorageError(error);
  }
}

const LAST_SUBMITTED_KEY_PREFIX = "rp.lastSubmittedId.";

export async function enqueueReport(
  id: string,
  scope = getActiveAccountScope(),
): Promise<RepositoryWriteResult> {
  try {
    let result: RepositoryWriteResult = {
      ok: false,
      code: "write_failed",
      message: "Could not queue this report on this device.",
    };
    await localDb.transaction(
      "rw",
      localDb.drafts,
      localDb.outbox,
      async () => {
        if (getActiveAccountScope() !== scope) return;
        const draft = await localDb.drafts.get(id);
        if (!draft || draft.accountScope !== scope) return;
        const now = Date.now();
        const existing = await localDb.outbox.get(id);
        if (
          existing &&
          (existing.accountScope !== scope ||
            existing.ownerUserId !== draft.ownerUserId)
        )
          return;
        const entry: OutboxRecord = existing ?? {
          id,
          reportId: id,
          accountScope: scope,
          ownerUserId: draft.ownerUserId,
          state: "pending",
          attempts: 0,
          nextAttemptAt: 0,
          lastErrorCode: null,
          lastErrorMessage: null,
          retryAfterAt: null,
          metadataReceipt: null,
          deliveredAt: null,
          authBlocked: false,
          createdAt: now,
          updatedAt: now,
        };
        await localDb.drafts.put({
          ...draft,
          status: "ready_to_send",
          updatedAt: now,
        });
        await localDb.outbox.put(entry);
        result = { ok: true, id, savedAt: now };
      },
    );
    if (result.ok && typeof window !== "undefined") {
      window.localStorage.setItem(`${LAST_SUBMITTED_KEY_PREFIX}${scope}`, id);
    }
    return result;
  } catch (error) {
    return mapStorageError(error);
  }
}

export function getLastSubmittedReportId(scope = getActiveAccountScope()) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(`${LAST_SUBMITTED_KEY_PREFIX}${scope}`);
}

export async function getSubmittedReport(
  id: string,
  scope = getActiveAccountScope(),
) {
  const [draft, outbox, attachments] = await Promise.all([
    localDb.drafts.get(id),
    localDb.outbox.get(id),
    localDb.attachments.where("draftId").equals(id).toArray(),
  ]);
  if (
    !draft ||
    draft.accountScope !== scope ||
    !outbox ||
    outbox.accountScope !== scope
  )
    return null;
  return {
    draft,
    outbox,
    attachments: attachments.filter((item) => item.accountScope === scope),
  };
}

export function observeSubmittedReport(
  id: string,
  scope: string,
  onValue: (value: Awaited<ReturnType<typeof getSubmittedReport>>) => void,
  onError: (error: unknown) => void,
) {
  return liveQuery(() => getSubmittedReport(id, scope)).subscribe({
    next: onValue,
    error: onError,
  });
}

export async function listOutbox(scope = getActiveAccountScope()) {
  return await localDb.outbox
    .where("accountScope")
    .equals(scope)
    .sortBy("createdAt");
}

export async function getNextOutboxAttemptAt(
  scope = getActiveAccountScope(),
  ownerUserId: string | null,
) {
  if (!ownerUserId) return null;
  const entries = await localDb.outbox
    .where("accountScope")
    .equals(scope)
    .toArray();
  const dueTimes = entries
    .filter(
      (entry) =>
        entry.ownerUserId === ownerUserId &&
        !entry.authBlocked &&
        (entry.state === "pending" || entry.state === "failed"),
    )
    .map((entry) => entry.nextAttemptAt)
    .filter((time) => time > Date.now());
  return dueTimes.length ? Math.min(...dueTimes) : null;
}

export async function saveAttachment(
  draftId: string,
  scope = getActiveAccountScope(),
  file: File,
): Promise<
  RepositoryWriteResult & {
    id: string;
    name: string;
    type: string;
    size: number;
  }
> {
  const attachmentId = `attachment-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  try {
    await ensureScopeData(scope);
    let savedId = attachmentId;
    let savedName = file.name;
    let savedType = file.type || "image/jpeg";
    let savedSize = file.size;

    await localDb.transaction(
      "rw",
      localDb.drafts,
      localDb.attachments,
      async () => {
        const draft = await localDb.drafts.get(draftId);
        if (!draft || draft.accountScope !== scope) {
          throw new Error("Draft not found for this account scope.");
        }

        const attachmentRecord: AttachmentRecord = {
          id: attachmentId,
          draftId,
          accountScope: scope,
          blob: file,
          name: file.name,
          type: file.type || "image/jpeg",
          size: file.size,
          createdAt: Date.now(),
          uploadState: "not_started",
          uploadError: null,
          uploadedAt: null,
          uploadAttempts: 0,
          uploadTarget: null,
        };

        const nextPhotoRef: DraftAttachmentReference = {
          id: attachmentId,
          name: file.name,
          type: file.type || "image/jpeg",
          size: file.size,
          timestamp: Date.now(),
          locationTag:
            draft.payload.location?.lat !== null &&
            draft.payload.location?.lat !== undefined &&
            draft.payload.location?.lon !== null
              ? `${Math.abs(draft.payload.location.lat).toFixed(4)}° ${draft.payload.location.lat >= 0 ? "N" : "S"}, ${Math.abs(draft.payload.location.lon).toFixed(4)}° ${draft.payload.location.lon >= 0 ? "E" : "W"}`
              : draft.payload.photo?.locationTag || "No location tag",
        };

        await localDb.attachments.put(attachmentRecord);
        const existingRefs = draft.attachments.filter(
          (ref) => ref.id !== attachmentId,
        );
        const nextDraft: DraftRecord = {
          ...draft,
          ownerUserId: draft.ownerUserId,
          payload: {
            ...draft.payload,
            photo: {
              id: attachmentId,
              name: file.name,
              type: file.type || "image/jpeg",
              size: file.size,
              timestamp: Date.now(),
              locationTag: nextPhotoRef.locationTag,
            },
          },
          attachments: [...existingRefs, nextPhotoRef],
          updatedAt: Date.now(),
          savedAt: Date.now(),
        };
        await localDb.drafts.put(nextDraft);
        savedId = attachmentId;
        savedName = file.name;
        savedType = file.type || "image/jpeg";
        savedSize = file.size;
      },
    );
    return {
      ok: true,
      id: savedId,
      name: savedName,
      type: savedType,
      size: savedSize,
      savedAt: Date.now(),
    };
  } catch (error) {
    const failure = mapStorageError(error);
    return {
      ...failure,
      id: attachmentId,
      name: file.name,
      type: file.type || "image/jpeg",
      size: file.size,
    };
  }
}

export async function loadAttachmentBlob(
  id: string,
  scope = getActiveAccountScope(),
) {
  await ensureScopeData(scope);
  const record = await localDb.attachments.get(id);
  if (!record || record.accountScope !== scope) return null;
  return record.blob ?? null;
}

export async function removeAttachment(
  id: string,
  scope = getActiveAccountScope(),
): Promise<RepositoryWriteResult> {
  try {
    await ensureScopeData(scope);
    let result: RepositoryWriteResult = { ok: true, id, savedAt: Date.now() };
    await localDb.transaction(
      "rw",
      localDb.drafts,
      localDb.attachments,
      async () => {
        const attachment = await localDb.attachments.get(id);
        if (!attachment || attachment.accountScope !== scope) return;
        const draft = await localDb.drafts.get(attachment.draftId);
        if (!draft || draft.accountScope !== scope) return;
        const nextRefs = draft.attachments.filter((ref) => ref.id !== id);
        const nextDraft: DraftRecord = {
          ...draft,
          ownerUserId: draft.ownerUserId,
          payload: {
            ...draft.payload,
            photo: nextRefs.length
              ? { ...nextRefs[nextRefs.length - 1] }
              : null,
          },
          attachments: nextRefs,
          updatedAt: Date.now(),
          savedAt: Date.now(),
        };
        await localDb.attachments.delete(id);
        await localDb.drafts.put(nextDraft);
        result = { ok: true, id, savedAt: nextDraft.savedAt ?? Date.now() };
      },
    );
    return result;
  } catch (error) {
    return mapStorageError(error);
  }
}

export function getActiveDraftPointer(scope: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(activeDraftPointerKey(scope));
}

export function setActiveDraftPointer(scope: string, id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(activeDraftPointerKey(scope), id);
}

/**
 * Reports in this account scope that the server has not received yet: local
 * drafts and queued reports whose outbox entry is not "received". Rejected
 * reports are excluded because they will not be sent again.
 */
export async function countUnsyncedDrafts(scope = getActiveAccountScope()) {
  if (scope === "anonymous") return 0;
  const [drafts, outbox] = await Promise.all([
    localDb.drafts.where("accountScope").equals(scope).toArray(),
    localDb.outbox.where("accountScope").equals(scope).toArray(),
  ]);
  const settled = new Set(
    outbox
      .filter((entry) => entry.state === "received" || entry.state === "rejected")
      .map((entry) => entry.reportId),
  );
  const unsynced = new Set<string>();
  for (const draft of drafts) if (!settled.has(draft.id)) unsynced.add(draft.id);
  for (const entry of outbox)
    if (!settled.has(entry.reportId)) unsynced.add(entry.reportId);
  return unsynced.size;
}
