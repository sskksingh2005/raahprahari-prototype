import { __toESM } from "../_runtime.mjs";
import { SupabaseConfigError, env, getSupabaseClient, isSupabaseConfigured } from "./supabase-C8XFUyW6.mjs";
import { PreferencesProvider, REPORTS, SEGMENTS, cn, en, getFreshnessState, hi, observationExtras, placeById, readLocal, segmentById, themeBootScript, useAppStore, usePrefs, writeLocal } from "./preferences-BoWpYuS4.mjs";
import { require_react } from "../_libs/react.mjs";
import { notFound, useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { HeadContent, Scripts, createFileRoute, createRootRoute, createRouter, lazyRouteComponent, useNavigate, useRouterState } from "../_libs/@tanstack/react-router+[4...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { Activity, ArrowLeft, ArrowRight, ArrowUp, Award, BookOpen, ChevronDown, ChevronsLeft, ChevronsRight, Circle, CircleCheck, CircleDashed, CircleQuestionMark, ClipboardCheck, Clock, CloudUpload, FileExclamationPoint, FlaskConical, House, Info, ListChecks, Mail, Map as Map$1, Megaphone, OctagonAlert, OctagonX, Plus, Save, Search, Settings, ShieldAlert, ShieldCheck, TriangleAlert, Trophy, UserRound, WifiOff, X } from "../_libs/lucide-react3.mjs";
import { CircleAlert } from "../_libs/lucide-react11.mjs";
import { LoaderCircle } from "../_libs/lucide-react24.mjs";
import { Slot } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { Button } from "./button-BwhNanlJ.mjs";
import { _enum, array, boolean, email, literal, number, object, record, string } from "../_libs/zod.mjs";
import { applyAuthSession, connectSupabaseSession, getAccessToken, getAccountSession, signOutAccount, subscribeAccountSession, useAccountSession } from "./account-session-Cz43bjtr.mjs";
import { Dexie, liveQuery } from "../_libs/dexie.mjs";
import { Dialog as Dialog$1, DialogClose, DialogContent as DialogContent$1, DialogDescription as DialogDescription$1, DialogOverlay as DialogOverlay$1, DialogPortal as DialogPortal$1, DialogTitle as DialogTitle$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { Label } from "./field-Ds5sKygr.mjs";
import { Input } from "./input-BPLX6SV6.mjs";
import { Toaster, toast } from "../_libs/sonner.mjs";
import { Controller, FormProvider, u, useForm, useFormContext, useFormState } from "../_libs/@hookform/resolvers+[...].mjs";
import { DropdownMenu as DropdownMenu$1, DropdownMenuContent as DropdownMenuContent$1, DropdownMenuItem as DropdownMenuItem$1, DropdownMenuItemIndicator, DropdownMenuLabel as DropdownMenuLabel$1, DropdownMenuPortal, DropdownMenuRadioGroup as DropdownMenuRadioGroup$1, DropdownMenuRadioItem as DropdownMenuRadioItem$1, DropdownMenuSeparator as DropdownMenuSeparator$1, DropdownMenuTrigger as DropdownMenuTrigger$1 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { Tooltip as Tooltip$1, TooltipArrow, TooltipContent as TooltipContent$1, TooltipPortal, TooltipProvider as TooltipProvider$1, TooltipTrigger as TooltipTrigger$1 } from "../_libs/@radix-ui/react-tooltip+[...].mjs";
import { Popover as Popover$1, PopoverContent as PopoverContent$1, PopoverPortal, PopoverTrigger as PopoverTrigger$1 } from "../_libs/radix-ui__react-popover.mjs";
// node_modules/.nitro/vite/services/ssr/assets/logo-Ca_Vs41W.js
var import_jsx_runtime = require_jsx_runtime();
var LOGO_ALT = "RaahPrahari";
/** Theme logo files in public/img and their real pixel sizes (update both together when a file is replaced). */
var LIGHT = {
	src: "/img/logo-on-light.png",
	width: 577,
	height: 433
};
var DARK = {
	src: "/img/logo-on-dark.png",
	width: 505,
	height: 494
};
/**
* Both theme files are always in the DOM; CSS (`.dark` on <html>) shows exactly one,
* so there is no flash on reload. The light file is the default and carries the alt text;
* the dark one is hidden from assistive tech so the name is read once.
*/
function ThemedImages({ imgClassName }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: LIGHT.src,
		width: LIGHT.width,
		height: LIGHT.height,
		alt: LOGO_ALT,
		decoding: "async",
		"data-logo-theme": "light",
		className: cn("block dark:hidden", imgClassName)
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: DARK.src,
		width: DARK.width,
		height: DARK.height,
		alt: "",
		"aria-hidden": "true",
		decoding: "async",
		"data-logo-theme": "dark",
		className: cn("hidden dark:block", imgClassName)
	})] });
}
/** The one shared RaahPrahari logo. Uses the two theme files as-is: no filter, tile or box. */
function Logo({ variant = "header", className, heightClassName = "h-9", decorative }) {
	if (variant === "header") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/",
		"aria-label": "RaahPrahari home",
		className: cn("inline-flex min-h-11 shrink-0 items-center rounded-md", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemedImages, { imgClassName: cn(heightClassName, "w-auto max-w-none") })
	});
	if (variant === "crest") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		role: decorative ? void 0 : "img",
		"aria-label": decorative ? void 0 : LOGO_ALT,
		"aria-hidden": decorative ? true : void 0,
		"data-logo-variant": "crest",
		className: cn("relative inline-block h-7 w-12 shrink-0 overflow-hidden", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemedImages, { imgClassName: "absolute top-0 left-1/2 h-14 w-auto max-w-none -translate-x-1/2" })
	});
	const imgClassName = variant === "mark" ? "h-10 w-auto" : "h-auto w-full";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		role: decorative ? void 0 : "img",
		"aria-label": decorative ? void 0 : LOGO_ALT,
		"aria-hidden": decorative ? true : void 0,
		className: cn(variant === "full" ? "block w-full max-w-[16rem]" : "inline-block shrink-0", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemedImages, { imgClassName })
	});
}
// node_modules/.nitro/vite/services/ssr/assets/draft-repository-qhV20TGH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function getActiveAccountScope() {
	const session = getAccountSession();
	return session.status === "authenticated" ? `user:${session.userId}` : "anonymous";
}
var RaahPrahariLocalDB = class extends Dexie {
	drafts;
	attachments;
	outbox;
	receiptEvents;
	constructor(databaseName = "raahprahari-local") {
		super(databaseName);
		this.version(1).stores({
			drafts: "&id, accountScope, [accountScope+status], [accountScope+updatedAt], eventTime, createdAt, updatedAt, savedAt",
			attachments: "&id, draftId, accountScope, createdAt"
		});
		this.version(2).stores({
			drafts: "&id, accountScope, [accountScope+status], [accountScope+updatedAt], eventTime, createdAt, updatedAt, savedAt",
			attachments: "&id, draftId, accountScope, createdAt",
			outbox: "&id, reportId, accountScope, [accountScope+state], nextAttemptAt, updatedAt"
		});
		this.version(3).stores({
			drafts: "&id, accountScope, [accountScope+status], [accountScope+updatedAt], eventTime, createdAt, updatedAt, savedAt",
			attachments: "&id, draftId, accountScope, [accountScope+uploadState], createdAt",
			outbox: "&id, reportId, accountScope, [accountScope+state], [accountScope+nextAttemptAt], nextAttemptAt, updatedAt"
		}).upgrade(async (transaction) => {
			await transaction.table("drafts").toCollection().modify((draft) => {
				if (draft.ownerUserId === void 0) draft.ownerUserId = null;
			});
			await transaction.table("attachments").toCollection().modify((attachment) => {
				attachment.uploadState ??= "not_started";
				attachment.uploadError ??= null;
				attachment.uploadedAt ??= null;
				attachment.uploadAttempts ??= 0;
				attachment.uploadTarget ??= null;
			});
			await transaction.table("outbox").toCollection().modify((entry) => {
				if (entry.state === "done") entry.state = "received";
				entry.lastErrorCode ??= null;
				entry.lastErrorMessage ??= null;
				entry.retryAfterAt ??= null;
				entry.metadataReceipt ??= null;
				entry.deliveredAt ??= null;
				entry.authBlocked ??= false;
				entry.ownerUserId ??= null;
				entry.attempts ??= 0;
				entry.nextAttemptAt ??= 0;
			});
		});
		this.version(4).stores({
			drafts: "&id, accountScope, [accountScope+status], [accountScope+updatedAt], eventTime, createdAt, updatedAt, savedAt",
			attachments: "&id, draftId, accountScope, [accountScope+uploadState], createdAt",
			outbox: "&id, reportId, accountScope, [accountScope+state], [accountScope+nextAttemptAt], nextAttemptAt, updatedAt",
			receiptEvents: "++id, reportId, [accountScope+reportId+at]"
		}).upgrade(async (transaction) => {
			const events = (await transaction.table("drafts").toArray()).filter((draft) => draft.accountScope && draft.savedAt).map((draft) => ({
				reportId: draft.id,
				accountScope: draft.accountScope,
				type: "saved_locally",
				at: draft.savedAt ?? Date.now(),
				code: "saved",
				detail: draft.payload?.hazardType || null,
				receiptId: null,
				serverReceivedAt: null
			}));
			const outboxEntries = await transaction.table("outbox").toArray();
			for (const outbox of outboxEntries) if (outbox.metadataReceipt && outbox.accountScope) events.push({
				reportId: outbox.reportId,
				accountScope: outbox.accountScope,
				type: "server_received",
				at: Date.parse(outbox.metadataReceipt.receivedAt) || Date.now(),
				code: "received",
				detail: outbox.metadataReceipt.receiptId || null,
				receiptId: outbox.metadataReceipt.receiptId || null,
				serverReceivedAt: outbox.metadataReceipt.receivedAt || null
			});
			if (events.length) await transaction.table("receiptEvents").bulkAdd(events);
		});
	}
};
var localDb = new RaahPrahariLocalDB();
var draftSaveQueues = /* @__PURE__ */ new Map();
var ACTIVE_DRAFT_KEY_PREFIX = "rp.activeDraftId.";
function activeDraftPointerKey(scope) {
	return `${ACTIVE_DRAFT_KEY_PREFIX}${scope}`;
}
function formatLocalDateTime(date) {
	const pad = (value) => `${value}`.padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function toUtcIso(dateValue) {
	if (!dateValue) return (/* @__PURE__ */ new Date()).toISOString();
	const parsed = new Date(dateValue);
	if (Number.isNaN(parsed.getTime())) return (/* @__PURE__ */ new Date()).toISOString();
	return parsed.toISOString();
}
function normalizePayload(payload) {
	const seed = payload ?? {
		hazardType: "",
		description: "",
		observedAt: formatLocalDateTime(/* @__PURE__ */ new Date()),
		photo: null,
		location: null
	};
	return {
		hazardType: seed.hazardType ?? "",
		description: seed.description ?? "",
		observedAt: seed.observedAt ?? formatLocalDateTime(/* @__PURE__ */ new Date()),
		photo: seed.photo ?? null,
		location: seed.location ?? null,
		...observationExtras(seed)
	};
}
function deriveEventTime(observedAt) {
	if (!observedAt) return "";
	const parsed = new Date(observedAt);
	return Number.isNaN(parsed.getTime()) ? "" : toUtcIso(observedAt);
}
function mapStorageError(error) {
	const value = error instanceof Error ? error : new Error(String(error));
	const name = value.name || "";
	const message = value.message.toLowerCase();
	if (name === "QuotaExceededError" || /quota/i.test(message) || /exceeded/i.test(message) || /disk full/i.test(message)) return {
		ok: false,
		code: "quota_exceeded",
		message: "Device storage is full. Free up space and try again. Your report was NOT saved."
	};
	if (typeof indexedDB === "undefined" || name === "OpenFailedError" || /openfailed/i.test(message) || /private mode/i.test(message) || /storage blocked/i.test(message) || /storage is unavailable/i.test(message) || /securityerror/i.test(message) || /invalidstateerror/i.test(message) || /blocked/i.test(message) || name === "SecurityError") return {
		ok: false,
		code: "storage_unavailable",
		message: "This browser can't store drafts (private mode or storage blocked). Your report was NOT saved."
	};
	return {
		ok: false,
		code: "write_failed",
		message: "Could not save on this device. Try again."
	};
}
function newReportId() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
		const random = Math.floor(Math.random() * 16);
		return (character === "x" ? random : random & 3 | 8).toString(16);
	});
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
function readLegacyLocalReports() {
	if (typeof window === "undefined") return [];
	const raw = window.localStorage.getItem("rp.localReports");
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function readLegacyLastReport() {
	if (typeof window === "undefined") return null;
	const raw = window.localStorage.getItem("rp.lastLocalReport");
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw);
		return typeof parsed === "object" && parsed ? parsed : null;
	} catch {
		return null;
	}
}
async function legacyPhotoBlob(photoId) {
	if (typeof window === "undefined" || typeof window.indexedDB === "undefined") return null;
	return await new Promise((resolve) => {
		const request = window.indexedDB.open("raahprahari-report-evidence", 1);
		request.onsuccess = () => {
			const db = request.result;
			try {
				const fileRequest = db.transaction("photos", "readonly").objectStore("photos").get(photoId);
				fileRequest.onsuccess = () => {
					const blob = fileRequest.result;
					db.close();
					resolve(blob ?? null);
				};
				fileRequest.onerror = () => {
					db.close();
					resolve(null);
				};
			} catch {
				db.close();
				resolve(null);
			}
		};
		request.onerror = () => resolve(null);
	});
}
async function migrateLegacyData(scope) {
	if (typeof window === "undefined") return;
	if (!!!(window.localStorage.getItem("rp.reportDraft") || window.localStorage.getItem("rp.localReports") || window.localStorage.getItem("rp.lastLocalReport"))) return;
	if (await localDb.drafts.where("accountScope").equals(scope).limit(1).first()) return;
	const records = [];
	const attachments = [];
	const legacyDraft = readLegacyDraft();
	if (legacyDraft && typeof legacyDraft === "object") {
		const payload = normalizePayload(legacyDraft);
		const id = newReportId();
		records.push({
			id,
			accountScope: scope,
			ownerUserId: null,
			status: "draft",
			eventTime: deriveEventTime(payload.observedAt),
			observedAtLocal: payload.observedAt,
			payload,
			attachments: payload.photo ? [{
				...payload.photo,
				timestamp: payload.photo.timestamp ?? Date.now(),
				locationTag: payload.photo.locationTag ?? "No location tag"
			}] : [],
			localReference: null,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			savedAt: Date.now(),
			schemaVersion: 1
		});
		if (payload.photo?.id) {
			const blob = await legacyPhotoBlob(payload.photo.id);
			if (blob) attachments.push({
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
				uploadTarget: null
			});
		}
	}
	for (const report of readLegacyLocalReports()) {
		const draft = report.draft ?? report.payload ?? report;
		if (!draft || typeof draft !== "object") continue;
		const payload = normalizePayload(draft);
		const localReference = typeof report.reference === "string" ? report.reference : null;
		const savedAt = typeof report.savedAt === "number" ? report.savedAt : Date.now();
		const id = newReportId();
		records.push({
			id,
			accountScope: scope,
			ownerUserId: null,
			status: "ready_to_send",
			eventTime: deriveEventTime(payload.observedAt),
			observedAtLocal: payload.observedAt,
			payload,
			attachments: payload.photo ? [{
				...payload.photo,
				timestamp: payload.photo.timestamp ?? savedAt,
				locationTag: payload.photo.locationTag ?? "No location tag"
			}] : [],
			localReference,
			createdAt: savedAt,
			updatedAt: savedAt,
			savedAt,
			schemaVersion: 1
		});
		if (payload.photo?.id) {
			const blob = await legacyPhotoBlob(payload.photo.id);
			if (blob) attachments.push({
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
				uploadTarget: null
			});
		}
	}
	const last = readLegacyLastReport();
	if (last && typeof last === "object" && "draft" in last) {
		const draft = last.draft;
		if (draft) {
			const payload = normalizePayload(draft);
			const localReference = typeof last.reference === "string" ? last.reference : null;
			const savedAt = typeof last.savedAt === "number" ? last.savedAt : Date.now();
			const id = newReportId();
			records.push({
				id,
				accountScope: scope,
				ownerUserId: null,
				status: "ready_to_send",
				eventTime: deriveEventTime(payload.observedAt),
				observedAtLocal: payload.observedAt,
				payload,
				attachments: payload.photo ? [{
					...payload.photo,
					timestamp: payload.photo.timestamp ?? savedAt,
					locationTag: payload.photo.locationTag ?? "No location tag"
				}] : [],
				localReference,
				createdAt: savedAt,
				updatedAt: savedAt,
				savedAt,
				schemaVersion: 1
			});
			if (payload.photo?.id) {
				const blob = await legacyPhotoBlob(payload.photo.id);
				if (blob) attachments.push({
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
					uploadTarget: null
				});
			}
		}
	}
	if (!records.length) return;
	try {
		await localDb.transaction("rw", localDb.drafts, localDb.attachments, async () => {
			await localDb.drafts.bulkPut(records);
			if (attachments.length) await localDb.attachments.bulkPut(attachments);
		});
		if (await localDb.drafts.where("accountScope").equals(scope).count() === 0) throw new Error("Legacy readback failed");
		window.localStorage.removeItem("rp.reportDraft");
		window.localStorage.removeItem("rp.localReports");
		window.localStorage.removeItem("rp.lastLocalReport");
		if (typeof window !== "undefined" && typeof window.indexedDB !== "undefined") try {
			window.indexedDB.deleteDatabase("raahprahari-report-evidence");
		} catch {}
	} catch {}
}
async function ensureScopeData(scope) {
	await migrateLegacyData(scope);
}
async function listReceiptEvents(reportId, scope = getActiveAccountScope()) {
	if (!reportId || scope === "anonymous") return [];
	try {
		return (await localDb.receiptEvents.where("reportId").equals(reportId).toArray()).filter((event) => event.accountScope === scope);
	} catch (error) {
		if (error instanceof Error && error.name === "NotFoundError") return [];
		throw error;
	}
}
async function appendReceiptEvent(reportId, scope = getActiveAccountScope(), event) {
	if (!reportId || scope === "anonymous") return null;
	try {
		const record = {
			reportId,
			accountScope: scope,
			...event
		};
		const sorted = [...(await localDb.receiptEvents.where("reportId").equals(reportId).toArray()).filter((item) => item.accountScope === scope)].sort((a, b) => a.at - b.at);
		const overflow = sorted.length + 1 - 50;
		if (overflow > 0) {
			const idsToDelete = /* @__PURE__ */ new Set();
			const sendFailed = sorted.filter((item) => item.type === "send_failed");
			for (const item of sendFailed) {
				if (idsToDelete.size >= overflow) break;
				if (item.id !== void 0) idsToDelete.add(item.id);
			}
			if (idsToDelete.size < overflow) for (const item of sorted) {
				if (idsToDelete.size >= overflow) break;
				if (item.type === "send_failed") continue;
				if (item.id !== void 0) idsToDelete.add(item.id);
			}
			if (idsToDelete.size > 0) await localDb.receiptEvents.bulkDelete([...idsToDelete]);
		}
		return {
			id: await localDb.receiptEvents.add(record),
			...record
		};
	} catch (error) {
		if (error instanceof Error && error.name === "NotFoundError") return null;
		throw error;
	}
}
async function listReportsForScope(scope = getActiveAccountScope()) {
	const drafts = await localDb.drafts.where("accountScope").equals(scope).sortBy("updatedAt");
	const reportIds = drafts.map((draft) => draft.id);
	const outboxes = await localDb.outbox.where("accountScope").equals(scope).filter((entry) => reportIds.includes(entry.reportId)).toArray();
	const byId = new Map(outboxes.map((entry) => [entry.reportId, entry]));
	return drafts.map((draft) => ({
		draft,
		outbox: byId.get(draft.id) ?? null
	}));
}
async function writeDraft(input, scope, id) {
	const payload = normalizePayload(input.payload ?? input.draft);
	const now = Date.now();
	try {
		const existing = await localDb.drafts.get(id);
		const next = {
			id,
			accountScope: scope,
			ownerUserId: existing ? existing.ownerUserId : getAccountSession().status === "authenticated" ? getAccountSession().userId : null,
			status: input.status ?? existing?.status ?? "draft",
			eventTime: input.eventTime ?? existing?.eventTime ?? deriveEventTime(payload.observedAt),
			observedAtLocal: input.observedAtLocal ?? existing?.observedAtLocal ?? payload.observedAt,
			payload,
			attachments: input.attachments ?? existing?.attachments ?? (payload.photo ? [{
				...payload.photo,
				timestamp: payload.photo.timestamp ?? now,
				locationTag: payload.photo.locationTag ?? "No location tag"
			}] : []),
			localReference: input.localReference ?? existing?.localReference ?? null,
			createdAt: input.createdAt ?? existing?.createdAt ?? now,
			updatedAt: input.updatedAt ?? now,
			savedAt: input.savedAt ?? now,
			schemaVersion: input.schemaVersion ?? existing?.schemaVersion ?? 1
		};
		await localDb.drafts.put(next);
		await appendReceiptEvent(id, scope, {
			type: "saved_locally",
			at: next.savedAt ?? now,
			code: "saved",
			detail: next.payload.hazardType || null,
			receiptId: null,
			serverReceivedAt: null
		});
		if (typeof window !== "undefined") {
			window.localStorage.setItem(activeDraftPointerKey(scope), id);
			window.localStorage.setItem("rp.reportDraft", JSON.stringify(next.payload));
		}
		return {
			ok: true,
			id,
			savedAt: next.savedAt ?? now
		};
	} catch (error) {
		return mapStorageError(error);
	}
}
async function saveDraft(input = {}) {
	const scope = input.accountScope ?? getActiveAccountScope();
	const id = input.id ?? newReportId();
	const key = `${scope}:${id}`;
	const previous = draftSaveQueues.get(key);
	const current = (previous ? previous.then(() => void 0, () => void 0) : Promise.resolve()).then(() => writeDraft(input, scope, id));
	draftSaveQueues.set(key, current);
	try {
		return await current;
	} finally {
		if (draftSaveQueues.get(key) === current) draftSaveQueues.delete(key);
	}
}
async function loadActiveDraft(scope = getActiveAccountScope()) {
	await ensureScopeData(scope);
	const pointerId = typeof window !== "undefined" ? window.localStorage.getItem(activeDraftPointerKey(scope)) : null;
	if (pointerId) {
		const record = await localDb.drafts.get(pointerId);
		if (record && record.accountScope === scope) return record;
	}
	const [latest] = (await localDb.drafts.where("accountScope").equals(scope).filter((record) => record.status === "draft").reverse().sortBy("updatedAt")).slice(-1);
	if (latest) {
		if (typeof window !== "undefined") window.localStorage.setItem(activeDraftPointerKey(scope), latest.id);
		return latest;
	}
	return null;
}
var LAST_SUBMITTED_KEY_PREFIX = "rp.lastSubmittedId.";
async function enqueueReport(id, scope = getActiveAccountScope()) {
	try {
		let result = {
			ok: false,
			code: "write_failed",
			message: "Could not queue this report on this device."
		};
		await localDb.transaction("rw", localDb.drafts, localDb.outbox, async () => {
			if (getActiveAccountScope() !== scope) return;
			const draft = await localDb.drafts.get(id);
			if (!draft || draft.accountScope !== scope) return;
			const now = Date.now();
			const existing = await localDb.outbox.get(id);
			if (existing && (existing.accountScope !== scope || existing.ownerUserId !== draft.ownerUserId)) return;
			const entry = existing ?? {
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
				updatedAt: now
			};
			await localDb.drafts.put({
				...draft,
				status: "ready_to_send",
				updatedAt: now
			});
			await localDb.outbox.put(entry);
			result = {
				ok: true,
				id,
				savedAt: now
			};
		});
		if (result.ok && typeof window !== "undefined") window.localStorage.setItem(`${LAST_SUBMITTED_KEY_PREFIX}${scope}`, id);
		return result;
	} catch (error) {
		return mapStorageError(error);
	}
}
function getLastSubmittedReportId(scope = getActiveAccountScope()) {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem(`${LAST_SUBMITTED_KEY_PREFIX}${scope}`);
}
async function getSubmittedReport(id, scope = getActiveAccountScope()) {
	const [draft, outbox, attachments] = await Promise.all([
		localDb.drafts.get(id),
		localDb.outbox.get(id),
		localDb.attachments.where("draftId").equals(id).toArray()
	]);
	if (!draft || draft.accountScope !== scope || !outbox || outbox.accountScope !== scope) return null;
	return {
		draft,
		outbox,
		attachments: attachments.filter((item) => item.accountScope === scope)
	};
}
function observeSubmittedReport(id, scope, onValue, onError) {
	return liveQuery(() => getSubmittedReport(id, scope)).subscribe({
		next: onValue,
		error: onError
	});
}
/**
* One report for the detail page: its draft, outbox entry (null until queued)
* and photo attachments, all limited to this account scope. Read-only.
*/
async function getReportDetail(id, scope = getActiveAccountScope()) {
	const [draft, outbox, attachments] = await Promise.all([
		localDb.drafts.get(id),
		localDb.outbox.get(id),
		localDb.attachments.where("draftId").equals(id).toArray()
	]);
	if (!draft || draft.accountScope !== scope) return null;
	return {
		draft,
		outbox: outbox && outbox.accountScope === scope ? outbox : null,
		attachments: attachments.filter((item) => item.accountScope === scope)
	};
}
/** Live version of getReportDetail, so upload progress updates on screen. */
function observeReportDetail(id, scope, onValue, onError) {
	return liveQuery(() => getReportDetail(id, scope)).subscribe({
		next: onValue,
		error: onError
	});
}
async function listOutbox(scope = getActiveAccountScope()) {
	return await localDb.outbox.where("accountScope").equals(scope).sortBy("createdAt");
}
async function getNextOutboxAttemptAt(scope = getActiveAccountScope(), ownerUserId) {
	if (!ownerUserId) return null;
	const dueTimes = (await localDb.outbox.where("accountScope").equals(scope).toArray()).filter((entry) => entry.ownerUserId === ownerUserId && !entry.authBlocked && (entry.state === "pending" || entry.state === "failed")).map((entry) => entry.nextAttemptAt).filter((time) => time > Date.now());
	return dueTimes.length ? Math.min(...dueTimes) : null;
}
async function saveAttachment(draftId, scope = getActiveAccountScope(), file) {
	const attachmentId = `attachment-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
	try {
		await ensureScopeData(scope);
		let savedId = attachmentId;
		let savedName = file.name;
		let savedType = file.type || "image/jpeg";
		let savedSize = file.size;
		await localDb.transaction("rw", localDb.drafts, localDb.attachments, async () => {
			const draft = await localDb.drafts.get(draftId);
			if (!draft || draft.accountScope !== scope) throw new Error("Draft not found for this account scope.");
			const attachmentRecord = {
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
				uploadTarget: null
			};
			const nextPhotoRef = {
				id: attachmentId,
				name: file.name,
				type: file.type || "image/jpeg",
				size: file.size,
				timestamp: Date.now(),
				locationTag: draft.payload.location?.lat !== null && draft.payload.location?.lat !== void 0 && draft.payload.location?.lon !== null ? `${Math.abs(draft.payload.location.lat).toFixed(4)}° ${draft.payload.location.lat >= 0 ? "N" : "S"}, ${Math.abs(draft.payload.location.lon).toFixed(4)}° ${draft.payload.location.lon >= 0 ? "E" : "W"}` : draft.payload.photo?.locationTag || "No location tag"
			};
			await localDb.attachments.put(attachmentRecord);
			const existingRefs = draft.attachments.filter((ref) => ref.id !== attachmentId);
			const nextDraft = {
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
						locationTag: nextPhotoRef.locationTag
					}
				},
				attachments: [...existingRefs, nextPhotoRef],
				updatedAt: Date.now(),
				savedAt: Date.now()
			};
			await localDb.drafts.put(nextDraft);
			savedId = attachmentId;
			savedName = file.name;
			savedType = file.type || "image/jpeg";
			savedSize = file.size;
		});
		return {
			ok: true,
			id: savedId,
			name: savedName,
			type: savedType,
			size: savedSize,
			savedAt: Date.now()
		};
	} catch (error) {
		return {
			...mapStorageError(error),
			id: attachmentId,
			name: file.name,
			type: file.type || "image/jpeg",
			size: file.size
		};
	}
}
async function loadAttachmentBlob(id, scope = getActiveAccountScope()) {
	await ensureScopeData(scope);
	const record = await localDb.attachments.get(id);
	if (!record || record.accountScope !== scope) return null;
	return record.blob ?? null;
}
async function removeAttachment(id, scope = getActiveAccountScope()) {
	try {
		await ensureScopeData(scope);
		let result = {
			ok: true,
			id,
			savedAt: Date.now()
		};
		await localDb.transaction("rw", localDb.drafts, localDb.attachments, async () => {
			const attachment = await localDb.attachments.get(id);
			if (!attachment || attachment.accountScope !== scope) return;
			const draft = await localDb.drafts.get(attachment.draftId);
			if (!draft || draft.accountScope !== scope) return;
			const nextRefs = draft.attachments.filter((ref) => ref.id !== id);
			const nextDraft = {
				...draft,
				ownerUserId: draft.ownerUserId,
				payload: {
					...draft.payload,
					photo: nextRefs.length ? { ...nextRefs[nextRefs.length - 1] } : null
				},
				attachments: nextRefs,
				updatedAt: Date.now(),
				savedAt: Date.now()
			};
			await localDb.attachments.delete(id);
			await localDb.drafts.put(nextDraft);
			result = {
				ok: true,
				id,
				savedAt: nextDraft.savedAt ?? Date.now()
			};
		});
		return result;
	} catch (error) {
		return mapStorageError(error);
	}
}
/**
* Reports in this account scope that the server has not received yet: local
* drafts and queued reports whose outbox entry is not "received". Rejected
* reports are excluded because they will not be sent again.
*/
async function countUnsyncedDrafts(scope = getActiveAccountScope()) {
	if (scope === "anonymous") return 0;
	const [drafts, outbox] = await Promise.all([localDb.drafts.where("accountScope").equals(scope).toArray(), localDb.outbox.where("accountScope").equals(scope).toArray()]);
	const settled = new Set(outbox.filter((entry) => entry.state === "received" || entry.state === "rejected").map((entry) => entry.reportId));
	const unsynced = /* @__PURE__ */ new Set();
	for (const draft of drafts) if (!settled.has(draft.id)) unsynced.add(draft.id);
	for (const entry of outbox) if (!settled.has(entry.reportId)) unsynced.add(entry.reportId);
	return unsynced.size;
}
// node_modules/.nitro/vite/services/ssr/assets/sync-engine-DDzyTWYH.js
var listeners = /* @__PURE__ */ new Set();
var state = {
	running: false,
	lastResult: null,
	lastSuccessfulSyncAt: null,
	nextAttemptAt: null
};
function emit() {
	for (const listener of listeners) listener();
}
function getSyncState() {
	return state;
}
function setSyncState(patch) {
	state = {
		...state,
		...patch
	};
	emit();
}
function subscribeSyncState(listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}
function useSyncState() {
	return (0, import_react.useSyncExternalStore)(subscribeSyncState, getSyncState, getSyncState);
}
function canProcess(entry, scope, session) {
	return session.status === "authenticated" && session.userId.length > 0 && scope === `user:${session.userId}` && entry.accountScope === scope && entry.ownerUserId === session.userId && entry.reportId === entry.id && entry.state !== "received" && entry.state !== "rejected";
}
var activeRuns = /* @__PURE__ */ new Map();
function runQueue(options) {
	const existing = activeRuns.get(options.scope);
	if (existing) return existing;
	const run = (async () => {
		const controller = new AbortController();
		const abortForScopeChange = () => {
			if (getActiveAccountScope() !== options.scope) controller.abort(new DOMException("Account scope changed", "AbortError"));
		};
		const abortFromCaller = () => controller.abort(options.signal?.reason);
		const unsubscribe = subscribeAccountSession(abortForScopeChange);
		options.signal?.addEventListener("abort", abortFromCaller, { once: true });
		if (options.signal?.aborted) abortFromCaller();
		let processed = 0;
		let skipped = 0;
		try {
			for (const entry of options.entries) {
				if (controller.signal.aborted) break;
				if (!canProcess(entry, options.scope, getAccountSession())) {
					skipped += 1;
					continue;
				}
				await options.processItem(entry, controller.signal);
				processed += 1;
			}
			return {
				processed,
				skipped,
				aborted: controller.signal.aborted
			};
		} finally {
			unsubscribe();
			options.signal?.removeEventListener("abort", abortFromCaller);
		}
	})();
	activeRuns.set(options.scope, run);
	run.finally(() => {
		if (activeRuns.get(options.scope) === run) activeRuns.delete(options.scope);
	});
	return run;
}
/**
* Assumed backend contract: PUT /reports/{reportId} accepts idempotent metadata;
* POST /reports/{reportId}/attachments/{attachmentId}/upload-target returns a
* short-lived signed PUT URL. The endpoint templates live here for backend changes.
*/
var REPORT_SYNC_ENDPOINTS = {
	metadata: "/reports/{reportId}",
	uploadTarget: "/reports/{reportId}/attachments/{attachmentId}/upload-target"
};
var IsoUtcSchema = string().datetime({ offset: false });
var uuidV4Schema = string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, "Expected a UUID v4");
var ReportMetadataPayloadSchema = object({
	schemaVersion: number().int().positive(),
	reportId: uuidV4Schema,
	eventTime: IsoUtcSchema,
	clientSavedAt: IsoUtcSchema,
	hazardType: _enum([
		"landslide",
		"flooding",
		"road_block",
		"fallen_tree",
		"damaged_bridge",
		"accident",
		"poor_visibility",
		"other"
	]),
	description: string().max(500),
	location: object({
		lat: number().finite().min(-90).max(90),
		lon: number().finite().min(-180).max(180),
		accuracyM: number().finite().nonnegative().nullable(),
		source: _enum(["device", "manual"]),
		confirmed: literal(true),
		roadSegment: string(),
		query: string()
	}),
	attachments: array(object({
		attachmentId: string().min(1),
		name: string(),
		type: string(),
		size: number().int().nonnegative()
	}))
});
var ReportReceiptSchema = object({
	reportId: uuidV4Schema,
	receiptId: string().min(1),
	receivedAt: IsoUtcSchema,
	duplicate: boolean(),
	attachmentUploads: array(object({
		attachmentId: string().min(1),
		uploadUrl: string().url(),
		method: literal("PUT"),
		headers: record(string(), string()).optional(),
		expiresAt: IsoUtcSchema
	})).optional()
});
var UploadTargetSchema = object({
	uploadUrl: string().url(),
	method: literal("PUT"),
	headers: record(string(), string()).optional(),
	expiresAt: IsoUtcSchema
});
function failure(error) {
	return {
		ok: false,
		error
	};
}
function retryAfterMs(value, now = Date.now()) {
	if (!value) return void 0;
	const seconds = Number(value);
	if (Number.isFinite(seconds)) return Math.max(0, seconds * 1e3);
	const date = Date.parse(value);
	return Number.isNaN(date) ? void 0 : Math.max(0, date - now);
}
function combinedSignal(parent) {
	const timeoutMs = 2e4;
	if (typeof AbortSignal.any === "function" && typeof AbortSignal.timeout === "function") return {
		signal: AbortSignal.any([parent, AbortSignal.timeout(timeoutMs)]),
		cleanup: () => void 0
	};
	const controller = new AbortController();
	const abort = () => controller.abort(parent.reason);
	parent.addEventListener("abort", abort, { once: true });
	const timer = setTimeout(() => controller.abort(new DOMException("Request timed out", "TimeoutError")), timeoutMs);
	if (parent.aborted) abort();
	return {
		signal: controller.signal,
		cleanup: () => {
			clearTimeout(timer);
			parent.removeEventListener("abort", abort);
		}
	};
}
function requestError(_error, signal) {
	if (signal.aborted) {
		const timedOut = signal.reason instanceof DOMException && signal.reason.name === "TimeoutError";
		return {
			kind: timedOut ? "timeout" : "aborted",
			retryable: !timedOut,
			message: timedOut ? "The report service took too long to respond." : "The sync was cancelled."
		};
	}
	return {
		kind: "network",
		retryable: true,
		message: "Could not reach the report service. Check your connection and retry."
	};
}
function responseError(response, now = Date.now()) {
	const retryMs = retryAfterMs(response.headers.get("Retry-After"), now);
	if (response.status === 401 || response.status === 403) return {
		kind: "auth_required",
		retryable: true,
		message: "Sign in again to continue sending reports."
	};
	if ([
		400,
		404,
		413,
		422
	].includes(response.status)) return {
		kind: "rejected",
		retryable: false,
		message: `The report was rejected by the service (${response.status}).`
	};
	if (response.status === 408 || response.status === 429 || response.status >= 500) return {
		kind: "server",
		retryable: true,
		retryAfterMs: retryMs,
		message: `The report service is temporarily unavailable (${response.status}).`
	};
	return {
		kind: "server",
		retryable: false,
		message: `The report service returned an unexpected response (${response.status}).`
	};
}
function configuredBaseUrl() {
	return null;
}
function createHttpTransport(baseUrl) {
	const base = baseUrl.replace(/\/+$/, "");
	return {
		async sendMetadata(payload, context) {
			const { signal, cleanup } = combinedSignal(context.signal);
			try {
				const response = await fetch(`${base}${REPORT_SYNC_ENDPOINTS.metadata.replace("{reportId}", encodeURIComponent(payload.reportId))}`, {
					method: "PUT",
					signal,
					headers: {
						"Content-Type": "application/json",
						"Idempotency-Key": payload.reportId,
						Authorization: `Bearer ${context.accessToken}`
					},
					body: JSON.stringify(payload)
				});
				if (![
					200,
					201,
					409
				].includes(response.status)) return failure(responseError(response));
				let body;
				try {
					body = await response.json();
				} catch {
					return failure({
						kind: "malformed_response",
						retryable: true,
						message: "The service returned an invalid receipt. The report is not marked received."
					});
				}
				const parsed = ReportReceiptSchema.safeParse(body);
				if (!parsed.success || parsed.data.reportId !== payload.reportId) return failure({
					kind: "malformed_response",
					retryable: true,
					message: "The service returned an invalid receipt. The report is not marked received."
				});
				return {
					ok: true,
					value: parsed.data
				};
			} catch (error) {
				return failure(requestError(error, signal));
			} finally {
				cleanup();
			}
		},
		async requestUploadTarget(reportId, attachmentId, context) {
			const { signal, cleanup } = combinedSignal(context.signal);
			try {
				const path = REPORT_SYNC_ENDPOINTS.uploadTarget.replace("{reportId}", encodeURIComponent(reportId)).replace("{attachmentId}", encodeURIComponent(attachmentId));
				const response = await fetch(`${base}${path}`, {
					method: "POST",
					signal,
					headers: { Authorization: `Bearer ${context.accessToken}` }
				});
				if (!response.ok) return failure(responseError(response));
				let body;
				try {
					body = await response.json();
				} catch {
					return failure({
						kind: "malformed_response",
						retryable: true,
						message: "The service returned an invalid photo upload target."
					});
				}
				const parsed = UploadTargetSchema.safeParse(body);
				if (!parsed.success) return failure({
					kind: "malformed_response",
					retryable: true,
					message: "The service returned an invalid photo upload target."
				});
				return {
					ok: true,
					value: parsed.data
				};
			} catch (error) {
				return failure(requestError(error, signal));
			} finally {
				cleanup();
			}
		},
		async uploadBlob(target, blob, context) {
			const { signal, cleanup } = combinedSignal(context.signal);
			try {
				context.onProgress?.(0);
				const response = await fetch(target.uploadUrl, {
					method: target.method,
					signal,
					headers: {
						...target.headers,
						"Content-Type": blob.type || "application/octet-stream"
					},
					body: blob
				});
				if (!response.ok) return failure(responseError(response));
				context.onProgress?.(1);
				return {
					ok: true,
					value: void 0
				};
			} catch (error) {
				return failure(requestError(error, signal));
			} finally {
				cleanup();
			}
		}
	};
}
function getConfiguredTransport() {
	const base = configuredBaseUrl();
	return base ? createHttpTransport(base) : null;
}
var LAST_SYNC_KEY_PREFIX = "rp.lastSync.";
var activeSync = null;
function nextDelay(attempts, retryAfterMs = 0, rng = Math.random) {
	const exponent = Math.max(0, Math.min(20, attempts - 1));
	const base = Math.min(9e5, 5e3 * 2 ** exponent);
	const jittered = Math.min(9e5, Math.round(base * (.8 + rng() * .4)));
	return Math.max(jittered, retryAfterMs);
}
function getTransportSource() {
	if (getConfiguredTransport()) return "http";
	return "none";
}
function getTransport() {
	switch (getTransportSource()) {
		case "injected": return Promise.resolve(null);
		case "http": return Promise.resolve(getConfiguredTransport());
		case "dev_stub": return import("./receipt-stub-Dv4QM_FV.mjs").then(({ getDevReceiptStub }) => getDevReceiptStub());
		case "none": return Promise.resolve(null);
	}
}
function parseIso(value) {
	return IsoUtcSchema.safeParse(value).success;
}
function buildMetadataPayload(draft, outbox) {
	if (!parseIso(draft.eventTime) || !draft.savedAt || !Number.isFinite(draft.savedAt)) return {
		ok: false,
		message: "The saved report is missing a valid observation or save time."
	};
	if (!draft.payload.location?.confirmed) return {
		ok: false,
		message: "Confirm the report location before sending it."
	};
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
			query: location.query
		},
		attachments: draft.attachments.map(({ id, name, type, size }) => ({
			attachmentId: id,
			name,
			type,
			size
		}))
	};
	const parsed = ReportMetadataPayloadSchema.safeParse(candidate);
	return parsed.success ? {
		ok: true,
		payload: parsed.data
	} : {
		ok: false,
		message: "The saved report details are incomplete or invalid."
	};
}
function currentScopeIs(scope, signal) {
	return !signal.aborted && getActiveAccountScope() === scope;
}
function currentEntryIsOwned(entry, scope) {
	const session = getAccountSession();
	return session.status === "authenticated" && scope === `user:${session.userId}` && entry.accountScope === scope && entry.ownerUserId === session.userId && entry.id === entry.reportId;
}
async function updateOutbox(scope, id, update, signal) {
	await localDb.transaction("rw", localDb.outbox, async () => {
		const entry = await localDb.outbox.get(id);
		if (!entry || !currentEntryIsOwned(entry, scope) || !currentScopeIs(scope, signal)) return;
		await localDb.outbox.put(update(entry));
	});
}
async function blockAuthForScope(scope, ownerUserId) {
	await localDb.transaction("rw", localDb.outbox, async () => {
		const entries = await localDb.outbox.where("accountScope").equals(scope).toArray();
		for (const entry of entries) if (entry.ownerUserId === ownerUserId && !entry.authBlocked && (entry.state === "pending" || entry.state === "failed")) await localDb.outbox.put({
			...entry,
			authBlocked: true,
			state: "failed",
			nextAttemptAt: 0,
			updatedAt: Date.now()
		});
	});
}
async function saveFailure(scope, entry, error, signal) {
	await localDb.transaction("rw", localDb.outbox, localDb.receiptEvents, async () => {
		const current = await localDb.outbox.get(entry.id);
		if (!current || !currentEntryIsOwned(current, scope) || !currentScopeIs(scope, signal)) return;
		const authBlocked = error.kind === "auth_required";
		const attempts = authBlocked ? current.attempts : current.attempts + 1;
		const delay = error.retryable ? nextDelay(attempts || 1, error.retryAfterMs) : 0;
		const retryAt = error.retryAfterMs ? Date.now() + error.retryAfterMs : null;
		const nextState = error.kind === "rejected" || !error.retryable ? "rejected" : "failed";
		await localDb.outbox.put({
			...current,
			state: nextState,
			attempts,
			nextAttemptAt: error.retryable && !authBlocked ? Math.max(Date.now() + delay, retryAt ?? 0) : 0,
			lastErrorCode: error.kind,
			lastErrorMessage: error.message,
			retryAfterAt: retryAt,
			authBlocked,
			updatedAt: Date.now()
		});
		await appendReceiptEvent(current.reportId, scope, {
			type: nextState === "rejected" ? "rejected" : "send_failed",
			at: Date.now(),
			code: error.kind,
			detail: error.message,
			receiptId: null,
			serverReceivedAt: null
		});
	});
}
async function persistInvalidReport(scope, entry, message, signal) {
	await localDb.transaction("rw", localDb.outbox, async () => {
		const current = await localDb.outbox.get(entry.id);
		if (!current || !currentEntryIsOwned(current, scope) || !currentScopeIs(scope, signal)) return;
		await localDb.outbox.put({
			...current,
			state: "rejected",
			lastErrorCode: "invalid_local_report",
			lastErrorMessage: message,
			authBlocked: false,
			updatedAt: Date.now()
		});
	});
}
async function persistReceipt(scope, entry, receipt, signal) {
	await localDb.transaction("rw", localDb.outbox, localDb.attachments, localDb.receiptEvents, async () => {
		const current = await localDb.outbox.get(entry.id);
		if (!current || !currentEntryIsOwned(current, scope) || !currentScopeIs(scope, signal)) return;
		const now = Date.now();
		await localDb.outbox.put({
			...current,
			state: "received",
			metadataReceipt: {
				receiptId: receipt.receiptId,
				receivedAt: receipt.receivedAt,
				duplicate: receipt.duplicate
			},
			deliveredAt: now,
			lastErrorCode: null,
			lastErrorMessage: null,
			retryAfterAt: null,
			authBlocked: false,
			updatedAt: now
		});
		await appendReceiptEvent(current.reportId, scope, {
			type: "server_received",
			at: now,
			code: "received",
			detail: receipt.receiptId || null,
			receiptId: receipt.receiptId || null,
			serverReceivedAt: receipt.receivedAt || null
		});
		for (const target of receipt.attachmentUploads ?? []) {
			const attachment = await localDb.attachments.get(target.attachmentId);
			if (attachment && attachment.accountScope === scope && attachment.draftId === entry.id) await localDb.attachments.put({
				...attachment,
				uploadTarget: target,
				uploadState: "not_started",
				uploadError: null
			});
		}
	});
}
function asError(result) {
	return result.ok ? null : result.error;
}
async function saveMediaFailure(scope, attachment, error, signal) {
	await localDb.transaction("rw", localDb.attachments, localDb.receiptEvents, async () => {
		const current = await localDb.attachments.get(attachment.id);
		if (!current || current.accountScope !== scope || !currentScopeIs(scope, signal)) return;
		await localDb.attachments.put({
			...current,
			uploadState: "failed",
			uploadError: error.message,
			uploadAttempts: current.uploadAttempts + 1
		});
		await appendReceiptEvent(current.draftId, scope, {
			type: "media_failed",
			at: Date.now(),
			code: error.kind,
			detail: current.name,
			receiptId: null,
			serverReceivedAt: null
		});
	});
}
async function uploadAttachment(transport, attachment, reportId, scope, token, signal) {
	const setState = async (update) => {
		await localDb.transaction("rw", localDb.attachments, async () => {
			const current = await localDb.attachments.get(attachment.id);
			if (!current || current.accountScope !== scope || !currentScopeIs(scope, signal)) return;
			await localDb.attachments.put({
				...current,
				...update
			});
		});
	};
	if (!currentScopeIs(scope, signal)) return false;
	const existingTarget = attachment.uploadTarget;
	const expired = !existingTarget || Date.parse(existingTarget.expiresAt) <= Date.now();
	let target = existingTarget;
	if (expired) {
		const targetResult = await transport.requestUploadTarget(reportId, attachment.id, {
			signal,
			accessToken: token
		});
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
		uploadTarget: target
	});
	const uploadResult = await transport.uploadBlob(target, attachment.blob, { signal });
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
		uploadError: null
	});
	await appendReceiptEvent(reportId, scope, {
		type: "media_uploaded",
		at: Date.now(),
		code: "uploaded",
		detail: attachment.name,
		receiptId: null,
		serverReceivedAt: null
	});
	return true;
}
async function uploadPendingAttachments(transport, draft, scope, token, signal) {
	const attachments = await localDb.attachments.where("draftId").equals(draft.id).toArray();
	for (const attachment of attachments) {
		if (!currentScopeIs(scope, signal)) return;
		if (attachment.accountScope !== scope || attachment.uploadState === "uploaded") continue;
		await uploadAttachment(transport, attachment, draft.id, scope, token, signal);
	}
}
async function syncOne(entry, scope, token, transport, signal) {
	if (!canProcess(entry, scope, getAccountSession()) || !currentScopeIs(scope, signal)) return null;
	const draft = await localDb.drafts.get(entry.reportId);
	if (!draft || draft.accountScope !== scope || draft.ownerUserId !== entry.ownerUserId) {
		await persistInvalidReport(scope, entry, "The saved report is unavailable in this account.", signal);
		return {
			kind: "rejected",
			retryable: false,
			message: "The saved report is unavailable in this account."
		};
	}
	const payload = buildMetadataPayload(draft, entry);
	if (!payload.ok) {
		await persistInvalidReport(scope, entry, payload.message, signal);
		return {
			kind: "rejected",
			retryable: false,
			message: payload.message
		};
	}
	await updateOutbox(scope, entry.id, (current) => ({
		...current,
		state: "sending",
		updatedAt: Date.now()
	}), signal);
	const response = await transport.sendMetadata(payload.payload, {
		signal,
		accessToken: token
	});
	const error = asError(response);
	if (error) {
		if (error.kind !== "aborted") await saveFailure(scope, entry, error, signal);
		return error;
	}
	const parsedReceipt = response.ok ? ReportReceiptSchema.safeParse(response.value) : null;
	if (!response.ok || !parsedReceipt?.success || parsedReceipt.data.reportId !== entry.reportId) {
		const mismatch = {
			kind: "malformed_response",
			retryable: true,
			message: "The service returned a receipt for a different report."
		};
		await saveFailure(scope, entry, mismatch, signal);
		return mismatch;
	}
	await persistReceipt(scope, entry, parsedReceipt.data, signal);
	if (!currentScopeIs(scope, signal)) return null;
	await uploadPendingAttachments(transport, draft, scope, token, signal);
	return null;
}
async function recoverInterruptedItems(scope, ownerUserId) {
	await localDb.transaction("rw", localDb.outbox, async () => {
		if (getActiveAccountScope() !== scope || getAccountSession().status !== "authenticated" || getAccountSession().userId !== ownerUserId) return;
		const entries = await localDb.outbox.where("accountScope").equals(scope).toArray();
		for (const entry of entries) if (entry.ownerUserId === ownerUserId && entry.state === "sending") await localDb.outbox.put({
			...entry,
			state: "pending",
			nextAttemptAt: 0,
			updatedAt: Date.now()
		});
	});
}
async function retryAttachmentUpload(reportId, attachmentId) {
	const scope = getActiveAccountScope();
	const session = getAccountSession();
	if (session.status !== "authenticated" || scope === "anonymous") return {
		ok: false,
		message: "Sign in again to continue sending reports."
	};
	const outbox = await localDb.outbox.get(reportId);
	const attachment = await localDb.attachments.get(attachmentId);
	if (!outbox || outbox.accountScope !== scope || outbox.ownerUserId !== session.userId || outbox.state !== "received" || !attachment || attachment.accountScope !== scope || attachment.draftId !== reportId) return {
		ok: false,
		message: "This photo is not available for upload in the current account."
	};
	const token = await getAccessToken();
	if (!token) return {
		ok: false,
		message: "Sign in again to continue sending reports."
	};
	const transport = await getTransport();
	if (!transport) return {
		ok: false,
		message: "Sending isn't available yet because the report service isn't configured."
	};
	const controller = new AbortController();
	const abortOnScopeChange = () => {
		if (getActiveAccountScope() !== scope) controller.abort(new DOMException("Account scope changed", "AbortError"));
	};
	const unsubscribe = subscribeAccountSession(abortOnScopeChange);
	try {
		return await uploadAttachment(transport, attachment, reportId, scope, token, controller.signal) ? { ok: true } : {
			ok: false,
			message: "The photo upload failed. Retry when you are online."
		};
	} finally {
		unsubscribe();
	}
}
function summary(status, received = 0, failed = 0, message = "") {
	return {
		status,
		received,
		failed,
		message
	};
}
async function syncNow({ reason }) {
	if (getAccountSession().status !== "authenticated") {
		const result = summary("signed_out", 0, 0, "Sign in to send reports saved under your account.");
		if (!activeSync) setSyncState({
			running: false,
			lastResult: result
		});
		return result;
	}
	if (typeof navigator !== "undefined" && !navigator.onLine) {
		const result = summary("offline", 0, 0, "You are offline. Your report remains saved on this device.");
		if (!activeSync) setSyncState({
			running: false,
			lastResult: result
		});
		return result;
	}
	if (activeSync) return activeSync;
	const run = (async () => {
		setSyncState({ running: true });
		const session = getAccountSession();
		if (session.status !== "authenticated") {
			const result = summary("signed_out", 0, 0, "Sign in to send reports saved under your account.");
			setSyncState({
				running: false,
				lastResult: result
			});
			return result;
		}
		if (typeof navigator !== "undefined" && !navigator.onLine) {
			const result = summary("offline", 0, 0, "You are offline. Your report remains saved on this device.");
			setSyncState({
				running: false,
				lastResult: result
			});
			return result;
		}
		const transport = await getTransport();
		if (!transport) {
			const result = summary("not_configured", 0, 0, "Sending isn't available yet because the report service isn't configured. Your report stays saved on this device.");
			setSyncState({
				running: false,
				lastResult: result
			});
			return result;
		}
		const scope = getActiveAccountScope();
		const token = await getAccessToken();
		if (!token) {
			if (session.status === "authenticated") await blockAuthForScope(scope, session.userId);
			const result = summary("signed_out", 0, 0, "Sign in again to continue sending reports.");
			setSyncState({
				running: false,
				lastResult: result
			});
			return result;
		}
		const now = Date.now();
		await recoverInterruptedItems(scope, session.userId);
		await localDb.transaction("rw", localDb.outbox, async () => {
			if (getActiveAccountScope() !== scope || getAccountSession().status !== "authenticated" || getAccountSession().userId !== session.userId) return;
			const entries = await localDb.outbox.where("accountScope").equals(scope).toArray();
			for (const entry of entries) if (entry.ownerUserId === session.userId && entry.authBlocked) await localDb.outbox.put({
				...entry,
				authBlocked: false,
				state: "failed",
				nextAttemptAt: 0,
				updatedAt: now
			});
		});
		const entries = (await listOutbox(scope)).filter((entry) => {
			if (!canProcess(entry, scope, getAccountSession())) return false;
			if (entry.authBlocked && reason !== "manual") return false;
			return entry.state === "pending" || entry.state === "failed";
		}).filter((entry) => reason === "manual" || entry.nextAttemptAt <= now);
		if (!entries.length) {
			const result = summary("nothing_to_send", 0, 0, "There are no reports ready to send.");
			setSyncState({
				running: false,
				lastResult: result,
				nextAttemptAt: await getNextOutboxAttemptAt(scope, session.userId)
			});
			return result;
		}
		let received = 0;
		let failed = 0;
		const controller = new AbortController();
		let queueResult;
		try {
			queueResult = await runQueue({
				scope,
				entries,
				signal: controller.signal,
				processItem: async (entry, signal) => {
					const before = await localDb.outbox.get(entry.id);
					const error = await syncOne(entry, scope, token, transport, signal);
					const after = await localDb.outbox.get(entry.id);
					if (after?.accountScope === scope && before?.state !== "received" && after.state === "received") received += 1;
					else if (error && error.kind !== "aborted") failed += 1;
				}
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : "The sync queue could not be processed.";
			const result = summary("error", received, failed + 1, message);
			setSyncState({
				running: false,
				lastResult: result,
				nextAttemptAt: await getNextOutboxAttemptAt(scope, session.userId)
			});
			return result;
		}
		const nextAttemptAt = await getNextOutboxAttemptAt(scope, session.userId);
		const result = queueResult.aborted ? summary("error", received, failed, "Sync stopped because the account changed.") : failed ? summary("error", received, failed, "Some reports could not be sent. Review their status and retry.") : summary("complete", received, 0, received ? `${received} report(s) received by the server.` : "There are no reports ready to send.");
		setSyncState({
			running: false,
			lastResult: result,
			nextAttemptAt
		});
		if (received > 0) {
			const successfulAt = Date.now();
			if (typeof window !== "undefined") window.localStorage.setItem(`${LAST_SYNC_KEY_PREFIX}${scope}`, `${successfulAt}`);
			setSyncState({ lastSuccessfulSyncAt: successfulAt });
		}
		return result;
	})();
	activeSync = run;
	try {
		return await run;
	} catch (error) {
		const result = summary("error", 0, 1, error instanceof Error ? error.message : "The sync could not be completed.");
		setSyncState({
			running: false,
			lastResult: result
		});
		return result;
	} finally {
		activeSync = null;
		setSyncState({ running: false });
	}
}
async function queueReportForSync(reportId) {
	const queued = await enqueueReport(reportId, getActiveAccountScope());
	if (queued.ok) await registerBackgroundSync();
	return queued;
}
async function detectBackgroundSync() {
	if (typeof window === "undefined" || !("SyncManager" in window)) return "unsupported";
	if (typeof navigator === "undefined") return "unsupported";
	const serviceWorker = "serviceWorker" in navigator ? navigator.serviceWorker : void 0;
	if (!serviceWorker) return "unsupported";
	const registration = await serviceWorker.getRegistration();
	if (!registration) return "no_service_worker";
	return "sync" in registration ? "available" : "unsupported";
}
async function registerBackgroundSync() {
	try {
		if (await detectBackgroundSync() !== "available") return false;
		const registration = await ("serviceWorker" in navigator ? navigator.serviceWorker : void 0)?.getRegistration();
		if (!registration?.sync) return false;
		await registration.sync.register("rp-report-sync");
		return true;
	} catch (error) {
		setSyncState({ lastResult: summary("error", 0, 1, error instanceof Error ? error.message : "Background retry could not be scheduled.") });
		return false;
	}
}
function getLastSyncAt(scope = getActiveAccountScope()) {
	if (typeof window === "undefined") return null;
	const value = Number(window.localStorage.getItem(`${LAST_SYNC_KEY_PREFIX}${scope}`));
	return Number.isFinite(value) && value > 0 ? value : null;
}
// node_modules/.nitro/vite/services/ssr/assets/prototype-ribbon-BPOjPF24.js
/**
* The one prototype label. It has no variants and takes no props: every page
* shows the same text ("Prototype mockup, synthetic data") in the same style.
* Place it in a wrapper if a page needs to position it.
*/
function PrototypeRibbon() {
	const { lang } = useAppStore();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		"data-testid": "prototype-ribbon",
		className: "glass-pill inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlaskConical, {
			"aria-hidden": true,
			className: "size-3"
		}), (lang === "hi" ? hi : en)["demo.badge"]]
	});
}
// node_modules/.nitro/vite/services/ssr/assets/skeleton-v-PyBMn_.js
/** Placeholder block with a shimmer sweep (static under reduced motion). */
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "skeleton",
		"aria-hidden": true,
		className: cn("rp-shimmer rounded-md bg-(--glass-divider)", className),
		...props
	});
}
/** Card-shaped placeholder that matches AdvisoryCard / route card proportions. */
function SkeletonCard({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-slot": "skeleton-card",
		"aria-hidden": true,
		className: cn("glass grid gap-3 rounded-2xl p-4", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-20 rounded-full" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-full" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-4/5" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-24 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-16 rounded-full" })]
			})
		]
	});
}
function SkeletonList({ count = 3, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"aria-hidden": true,
		className: cn("grid gap-3", className),
		children: Array.from({ length: count }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonCard, {}, i))
	});
}
// node_modules/.nitro/vite/services/ssr/assets/feedback-BYJO4Vl_.js
function LoadingState({ label = "Loading", variant = "inline", className }) {
	if (variant === "cards") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "status",
		"aria-live": "polite",
		"aria-busy": "true",
		className: cn("grid gap-3", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonList, { count: 3 })]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "status",
		"aria-live": "polite",
		"aria-busy": "true",
		className: cn("flex min-h-24 items-center justify-center gap-2 text-sm text-muted-foreground", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
			"aria-hidden": "true",
			className: "size-4 motion-safe:animate-spin"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label })]
	});
}
function ErrorState({ title = "Unable to load this information", message, retryLabel = "Try again", onRetry, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		role: "alert",
		className: cn("rp-fade-rise grid min-h-24 justify-items-center gap-3 rounded-xl border border-status-closed/50 p-6 text-center", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
				"aria-hidden": "true",
				className: "rp-pop size-5 text-action-restricted"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-prose text-sm text-muted-foreground",
				children: message
			}),
			onRetry && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				onClick: onRetry,
				children: retryLabel
			})
		]
	});
}
function EmptyState({ title, message, action, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("rp-fade-rise grid min-h-24 justify-items-center gap-3 rounded-xl border border-dashed border-border p-6 text-center", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-prose text-sm text-muted-foreground",
				children: message
			}),
			action
		]
	});
}
function SkipLink({ className, href = "#main", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		href,
		className: cn("sr-only z-[var(--z-dialog)] rounded-md bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3", className),
		...props
	});
}
// node_modules/.nitro/vite/services/ssr/assets/dialog-C7NrkQVt.js
function Dialog({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog$1, {
		"data-slot": "dialog",
		...props
	});
}
function DialogPortal({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogPortal$1, {
		"data-slot": "dialog-portal",
		...props
	});
}
function DialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
		"data-slot": "dialog-overlay",
		className: cn("fixed inset-0 z-(--z-overlay) bg-scrim data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", className),
		...props
	});
}
function DialogContent({ className, children, showCloseButton = true, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, {
		"data-slot": "dialog-portal",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
			"data-slot": "dialog-content",
			className: cn("fixed top-[50%] left-[50%] z-(--z-sheet) grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-3xl glass-strong p-6 duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg", className),
			...props,
			children: [children, showCloseButton && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
				"data-slot": "dialog-close",
				className: "absolute top-2 right-2 grid size-11 place-items-center rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "sr-only",
					children: "Close"
				})]
			})]
		})]
	});
}
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "dialog-header",
		className: cn("flex flex-col gap-2 text-center sm:text-left", className),
		...props
	});
}
function DialogFooter({ className, showCloseButton = false, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-slot": "dialog-footer",
		className: cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
		...props,
		children: [children, showCloseButton && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				children: "Close"
			})
		})]
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		"data-slot": "dialog-title",
		className: cn("text-lg leading-none font-semibold", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		"data-slot": "dialog-description",
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
// node_modules/.nitro/vite/services/ssr/assets/auth-forms-Bar8BVKy.js
var Form = FormProvider;
var FormFieldContext = import_react.createContext({});
var FormField = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormFieldContext.Provider, {
		value: { name: props.name },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Controller, { ...props })
	});
};
var useFormField = () => {
	const fieldContext = import_react.useContext(FormFieldContext);
	const itemContext = import_react.useContext(FormItemContext);
	const { getFieldState } = useFormContext();
	const formState = useFormState({ name: fieldContext.name });
	const fieldState = getFieldState(fieldContext.name, formState);
	if (!fieldContext) throw new Error("useFormField should be used within <FormField>");
	const { id } = itemContext;
	return {
		id,
		name: fieldContext.name,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
		...fieldState
	};
};
var FormItemContext = import_react.createContext({});
function FormItem({ className, ...props }) {
	const id = import_react.useId();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormItemContext.Provider, {
		value: { id },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-slot": "form-item",
			className: cn("grid gap-2", className),
			...props
		})
	});
}
function FormLabel({ className, ...props }) {
	const { error, formItemId } = useFormField();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
		"data-slot": "form-label",
		"data-error": !!error,
		className: cn("data-[error=true]:text-destructive", className),
		htmlFor: formItemId,
		...props
	});
}
function FormControl({ ...props }) {
	const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slot, {
		"data-slot": "form-control",
		id: formItemId,
		"aria-describedby": !error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`,
		"aria-invalid": !!error,
		...props
	});
}
function FormDescription({ className, ...props }) {
	const { formDescriptionId } = useFormField();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		"data-slot": "form-description",
		id: formDescriptionId,
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
function FormMessage({ className, ...props }) {
	const { error, formMessageId } = useFormField();
	const body = error ? String(error?.message ?? "") : props.children;
	if (!body) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		"data-slot": "form-message",
		id: formMessageId,
		className: cn("text-sm text-destructive", className),
		...props,
		children: body
	});
}
/** Normalize account identifiers consistently before sending them to Supabase. */
function normalizeAuthEmail(email) {
	return email.trim().toLowerCase();
}
/** Maps Supabase errors to safe categories; never surfaces raw provider text. */
function classifyAuthFlowError(error) {
	if (error instanceof SupabaseConfigError) return "not_configured";
	if (typeof navigator !== "undefined" && navigator.onLine === false) return "network";
	const e = error ?? {};
	switch (e.code) {
		case "user_already_exists":
		case "email_exists": return "user_exists";
		case "weak_password": return "weak_password";
		case "same_password": return "same_password";
		case "over_email_send_rate_limit":
		case "over_request_rate_limit": return "rate_limited";
		case "session_not_found":
		case "session_expired": return "session_missing";
		case "flow_state_not_found":
		case "flow_state_expired":
		case "bad_code_verifier":
		case "otp_expired":
		case "bad_jwt": return "link_invalid";
	}
	if (e.name === "AuthSessionMissingError") return "session_missing";
	if (e.status === 429) return "rate_limited";
	if (e.name === "AuthRetryableFetchError" || e.name === "TypeError" || e.status === 0) return "network";
	return "generic";
}
function origin() {
	return typeof window === "undefined" ? "" : window.location.origin;
}
/** Where email links land. `next` is resolved by the callback route. */
function callbackUrl(next) {
	const url = new URL("/auth/callback", origin() || "http://localhost");
	if (next) url.searchParams.set("next", next);
	return url.toString();
}
async function signUpWithEmail(email, password) {
	const { data, error } = await getSupabaseClient().auth.signUp({
		email: normalizeAuthEmail(email),
		password,
		options: { emailRedirectTo: callbackUrl() }
	});
	if (error) throw error;
	if (data.session) {
		applyAuthSession(data.session);
		return { kind: "signed_in" };
	}
	if (data.user) return { kind: "check_email" };
	throw Object.assign(/* @__PURE__ */ new Error("Signup returned no user"), { code: "generic" });
}
async function requestPasswordReset(email) {
	const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email, { redirectTo: callbackUrl("/auth/reset-password") });
	if (error) throw error;
}
async function updatePassword(password) {
	const { data, error } = await getSupabaseClient().auth.updateUser({ password });
	if (error) throw error;
	if (!data.user) throw Object.assign(/* @__PURE__ */ new Error("No user returned"), { code: "session_not_found" });
}
/** Only these internal paths may follow a callback (no open redirects). */
var SAFE_NEXT = ["/", "/auth/reset-password"];
function safeNext(value) {
	return SAFE_NEXT.includes(value ?? "") ? value : "/";
}
/**
* Completes an email confirmation or recovery link. Succeeds only when
* Supabase exchanges the code for a real session.
*/
async function completeAuthCallback(href, auth) {
	const url = new URL(href);
	const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
	const errorCode = url.searchParams.get("error_code") ?? hash.get("error_code") ?? url.searchParams.get("error") ?? hash.get("error");
	if (errorCode) {
		const kind = classifyAuthFlowError({ code: errorCode });
		return {
			ok: false,
			kind: kind === "generic" ? "link_invalid" : kind
		};
	}
	const code = url.searchParams.get("code");
	if (!code) return {
		ok: false,
		kind: "missing_code"
	};
	try {
		const { data, error } = await (auth ?? getSupabaseClient().auth).exchangeCodeForSession(code);
		if (error) {
			const kind = classifyAuthFlowError(error);
			return {
				ok: false,
				kind: kind === "generic" ? "link_invalid" : kind
			};
		}
		if (!data.session) return {
			ok: false,
			kind: "link_invalid"
		};
		applyAuthSession(data.session);
		return {
			ok: true,
			next: safeNext(url.searchParams.get("next"))
		};
	} catch (error) {
		return {
			ok: false,
			kind: classifyAuthFlowError(error)
		};
	}
}
var AUTH_ERROR_KEYS = {
	network: "login.networkError",
	not_configured: "login.notConfigured",
	user_exists: "authErr.userExists",
	weak_password: "authErr.weakPassword",
	same_password: "authErr.samePassword",
	rate_limited: "authErr.rateLimited",
	session_missing: "authErr.sessionMissing",
	link_invalid: "authErr.linkInvalid",
	missing_code: "authErr.missingCode",
	generic: "login.genericError"
};
function RootError({ message }) {
	if (!message) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		role: "alert",
		className: "flex items-start gap-2 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
			"aria-hidden": true,
			className: "mt-0.5 size-4 shrink-0 text-destructive"
		}), message]
	});
}
var passwordShape = (t) => ({
	password: string().min(8, t("signup.passwordTooShort")),
	confirm: string()
});
var passwordsMatch = (t) => [(v) => v.password === v.confirm, {
	path: ["confirm"],
	message: t("signup.passwordMismatch")
}];
/** Password + confirm fields shared by signup and reset. */
function PasswordPairFields({ control, passwordLabel }) {
	const { t } = usePrefs();
	const fields = [["password", passwordLabel], ["confirm", t("signup.confirmPassword")]];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: fields.map(([name, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
		control,
		name,
		render: ({ field }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FormItem, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormLabel, { children: label }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormControl, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "password",
				autoComplete: "new-password",
				required: true,
				minLength: name === "password" ? 8 : void 0,
				...field
			}) }),
			name === "password" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormDescription, { children: t("signup.passwordHint") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormMessage, {})
		] })
	}, name)) });
}
function SignupForm({ onSignedIn }) {
	const { t } = usePrefs();
	const schema = (0, import_react.useMemo)(() => object({
		email: string().transform(normalizeAuthEmail).pipe(email(t("login.emailInvalid"))),
		...passwordShape(t)
	}).refine(...passwordsMatch(t)), [t]);
	const form = useForm({
		resolver: u(schema),
		defaultValues: {
			email: "",
			password: "",
			confirm: ""
		}
	});
	const [checkEmail, setCheckEmail] = (0, import_react.useState)(false);
	const submit = form.handleSubmit(async ({ email, password }) => {
		form.clearErrors("root");
		try {
			const result = await signUpWithEmail(email, password);
			form.reset();
			if (result.kind === "signed_in") {
				toast.success(t("signup.signedIn"));
				onSignedIn();
			} else setCheckEmail(true);
		} catch (error) {
			form.setValue("password", "");
			form.setValue("confirm", "");
			const kind = classifyAuthFlowError(error);
			form.setError("root", { message: t(kind === "generic" ? "signup.error" : AUTH_ERROR_KEYS[kind]) });
		}
	});
	if (checkEmail) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		role: "status",
		children: t("signup.checkEmail")
	});
	const pending = form.formState.isSubmitting;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Form, {
		...form,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
			onSubmit: submit,
			noValidate: true,
			className: "space-y-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				disabled: pending,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
						control: form.control,
						name: "email",
						render: ({ field }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FormItem, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormLabel, { children: t("login.email") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormControl, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "email",
								autoComplete: "email",
								required: true,
								...field
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormMessage, {})
						] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordPairFields, {
						control: form.control,
						passwordLabel: t("login.password")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RootError, { message: form.formState.errors.root?.message }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						"aria-busy": pending,
						children: pending ? t("signup.submitting") : t("signup.submit")
					})
				]
			})
		})
	});
}
function ForgotPasswordForm() {
	const { t } = usePrefs();
	const schema = (0, import_react.useMemo)(() => object({ email: email(t("login.emailInvalid")) }), [t]);
	const form = useForm({
		resolver: u(schema),
		defaultValues: { email: "" }
	});
	const [sent, setSent] = (0, import_react.useState)(false);
	const submit = form.handleSubmit(async ({ email }) => {
		form.clearErrors("root");
		try {
			await requestPasswordReset(email.trim());
			setSent(true);
		} catch (error) {
			form.setError("root", { message: t(AUTH_ERROR_KEYS[classifyAuthFlowError(error)]) });
		}
	});
	if (sent) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		role: "status",
		children: t("forgot.sent")
	});
	const pending = form.formState.isSubmitting;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Form, {
		...form,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
			onSubmit: submit,
			noValidate: true,
			className: "space-y-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				disabled: pending,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
						control: form.control,
						name: "email",
						render: ({ field }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FormItem, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormLabel, { children: t("login.email") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormControl, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "email",
								autoComplete: "email",
								required: true,
								...field
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormMessage, {})
						] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RootError, { message: form.formState.errors.root?.message }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						"aria-busy": pending,
						children: pending ? t("forgot.submitting") : t("forgot.submit")
					})
				]
			})
		})
	});
}
function NewPasswordForm({ onDone }) {
	const { t } = usePrefs();
	const schema = (0, import_react.useMemo)(() => object(passwordShape(t)).refine(...passwordsMatch(t)), [t]);
	const form = useForm({
		resolver: u(schema),
		defaultValues: {
			password: "",
			confirm: ""
		}
	});
	const submit = form.handleSubmit(async ({ password }) => {
		form.clearErrors("root");
		try {
			await updatePassword(password);
			form.reset();
			onDone();
		} catch (error) {
			form.setValue("password", "");
			form.setValue("confirm", "");
			form.setError("root", { message: t(AUTH_ERROR_KEYS[classifyAuthFlowError(error)]) });
		}
	});
	const pending = form.formState.isSubmitting;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Form, {
		...form,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
			onSubmit: submit,
			noValidate: true,
			className: "space-y-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				disabled: pending,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordPairFields, {
						control: form.control,
						passwordLabel: t("reset.newPassword")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RootError, { message: form.formState.errors.root?.message }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						"aria-busy": pending,
						children: pending ? t("reset.submitting") : t("reset.submit")
					})
				]
			})
		})
	});
}
// node_modules/.nitro/vite/services/ssr/assets/routing-BgYRHLWn.js
var MAX_ROUTES = 3;
var graph = /* @__PURE__ */ new Map();
for (const s of SEGMENTS) {
	graph.set(s.from, [...graph.get(s.from) ?? [], {
		to: s.to,
		segment: s
	}]);
	graph.set(s.to, [...graph.get(s.to) ?? [], {
		to: s.from,
		segment: s
	}]);
}
function findSeededRoutes(fromId, toId) {
	if (fromId === toId || !graph.has(fromId) || !graph.has(toId)) return [];
	const found = [];
	const visit = (node, nodes, segs) => {
		if (found.length > 50 || segs.length > 16) return;
		if (node === toId) {
			found.push({
				nodes,
				segs
			});
			return;
		}
		for (const e of graph.get(node) ?? []) {
			if (nodes.includes(e.to)) continue;
			visit(e.to, [...nodes, e.to], [...segs, e.segment]);
		}
	};
	visit(fromId, [fromId], []);
	return found.map(({ nodes, segs }) => ({
		id: nodes.join(">"),
		segments: segs,
		distanceKm: segs.reduce((n, s) => n + s.distanceKm, 0),
		typicalMinutes: segs.reduce((n, s) => n + s.typicalMinutes, 0),
		via: nodes.slice(1, -1),
		corridorIds: [...new Set(segs.map((s) => s.corridorId))]
	})).sort((a, b) => a.typicalMinutes - b.typicalMinutes).slice(0, MAX_ROUTES);
}
var seededRoutingProvider = {
	mode: "seeded",
	findRoutes: async (fromId, toId) => findSeededRoutes(fromId, toId)
};
function routeLabel(r, lang) {
	if (r.via.length === 0) return lang === "hi" ? hi["results.direct"] : en["results.direct"];
	const names = r.via.filter((_, i, arr) => arr.length <= 3 || i % Math.ceil(arr.length / 3) === 0).map((id) => lang === "hi" ? placeById(id)?.nameHi : placeById(id)?.name);
	return names.length ? names.join(" · ") : lang === "hi" ? hi["common.notAvailable"] : en["common.notAvailable"];
}
// node_modules/.nitro/vite/services/ssr/assets/help-topics-CGQgBLZN.js
var helpTopics = [
	{
		slug: "report",
		titleKey: "help.report",
		descriptionKey: "help.reportBody",
		detailTitleKey: "help.reportDetailTitle",
		detailBodyKey: "help.reportDetailBody",
		detailExtraKey: "help.reportDetailExtra"
	},
	{
		slug: "status",
		titleKey: "help.status",
		descriptionKey: "help.statusBody",
		detailTitleKey: "help.statusDetailTitle",
		detailBodyKey: "help.statusDetailBody",
		detailExtraKey: "help.statusDetailExtra"
	},
	{
		slug: "freshness",
		titleKey: "help.freshness",
		descriptionKey: "help.freshnessBody",
		detailTitleKey: "help.freshnessDetailTitle",
		detailBodyKey: "help.freshnessDetailBody",
		detailExtraKey: "help.freshnessDetailExtra"
	},
	{
		slug: "map-offline",
		titleKey: "help.map",
		descriptionKey: "help.mapBody",
		detailTitleKey: "help.mapDetailTitle",
		detailBodyKey: "help.mapDetailBody",
		detailExtraKey: "help.mapDetailExtra"
	},
	{
		slug: "privacy",
		titleKey: "help.privacy",
		descriptionKey: "help.privacyBody",
		detailTitleKey: "help.privacyDetailTitle",
		detailBodyKey: "help.privacyDetailBody",
		detailExtraKey: "help.privacyDetailExtra"
	},
	{
		slug: "restrictions",
		titleKey: "help.restrictions",
		descriptionKey: "help.restrictionsBody",
		detailTitleKey: "help.restrictionsDetailTitle",
		detailBodyKey: "help.restrictionsDetailBody",
		detailExtraKey: "help.restrictionsDetailExtra"
	}
];
// node_modules/.nitro/vite/services/ssr/assets/advisory-D6--ha9j.js
/**
* A flat 15% tint of --tint over a glass pill's fill. It is a gradient layer
* only so the tint sits on top of the glass background colour instead of
* replacing it; both stops are the same colour, so it looks flat.
*/
var TINT_15 = "bg-[linear-gradient(color-mix(in_srgb,var(--tint)_15%,transparent),color-mix(in_srgb,var(--tint)_15%,transparent))]";
var LEVEL_META = {
	clear: {
		icon: CircleCheck,
		color: "var(--status-clear)",
		chip: "border-status-clear [--tint:var(--status-clear)]",
		bar: "bg-status-clear"
	},
	caution: {
		icon: TriangleAlert,
		color: "var(--status-caution)",
		chip: "border-status-caution [--tint:var(--status-caution)]",
		bar: "bg-status-caution"
	},
	avoid: {
		icon: OctagonAlert,
		color: "var(--status-avoid)",
		chip: "border-status-avoid [--tint:var(--status-avoid)]",
		bar: "bg-status-avoid"
	},
	do_not_travel: {
		icon: OctagonX,
		color: "var(--status-dnt)",
		chip: "border-status-dnt [--tint:var(--status-dnt)]",
		bar: "bg-status-dnt"
	},
	unknown: {
		icon: CircleQuestionMark,
		color: "var(--status-unknown)",
		chip: "border-status-unknown [--tint:var(--status-unknown)]",
		bar: "bg-status-unknown"
	}
};
function AdvisoryBadge({ level, size = "sm", className }) {
	const { t } = usePrefs();
	const meta = LEVEL_META[level];
	const Icon = meta.icon;
	const attention = level === "avoid" || level === "do_not_travel";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		style: attention ? { "--rp-attn-color": meta.color } : void 0,
		className: cn("rp-fade-in glass-pill inline-flex items-center gap-1.5 rounded-full border font-semibold text-foreground shadow-none", TINT_15, attention && "rp-attn", size === "lg" ? "px-3 py-1.5 text-sm" : "px-2.5 py-0.5 text-xs", meta.chip, className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			"aria-hidden": true,
			className: size === "lg" ? "size-4" : "size-3.5",
			style: { color: meta.color }
		}), t(`level.${level}`)]
	});
}
function ActionBadge({ level, size = "sm", className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdvisoryBadge, {
		level,
		size,
		className
	});
}
var FRESHNESS_META = {
	fresh: {
		icon: CircleCheck,
		color: "var(--link)",
		chip: "border-link/50 bg-link/10"
	},
	stale: {
		icon: Clock,
		color: "var(--status-stale)",
		chip: "border-status-stale/50 bg-status-stale/10"
	},
	unknown: {
		icon: CircleQuestionMark,
		color: "var(--status-unknown)",
		chip: "border-status-unknown/50 bg-status-unknown/10"
	}
};
function FreshnessChip({ observationTimestamp, className }) {
	const { t, ago, now } = usePrefs();
	const state = getFreshnessState(observationTimestamp, now);
	const meta = FRESHNESS_META[state];
	const Icon = meta.icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		"data-testid": "freshness-chip",
		className: cn("rp-fade-in glass-pill inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium text-foreground", meta.chip, className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				"aria-hidden": true,
				className: "size-3.5",
				style: { color: meta.color }
			}),
			state === "unknown" ? t("freshness.observationUnknown") : t(`freshness.${state}`),
			observationTimestamp && state !== "unknown" ? ` · ${ago(observationTimestamp)}` : ""
		]
	});
}
function CacheTimeLabel({ timestamp }) {
	const { stamp, t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "text-xs text-muted-foreground",
		"data-testid": "cache-time",
		children: [
			t("advisory.calculatedLocally"),
			":",
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
				dateTime: new Date(timestamp).toISOString(),
				children: stamp(timestamp)
			})
		]
	});
}
function OfficialBadge({ label, className }) {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("rp-fade-in rp-attn [--rp-attn-color:var(--status-official)] [--tint:var(--status-official)] glass-pill inline-flex items-center gap-1.5 rounded-full border border-status-official px-2.5 py-0.5 text-xs font-semibold text-foreground shadow-none", TINT_15, className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
			"aria-hidden": true,
			className: "size-3.5 text-status-official"
		}), label ?? t("level.official")]
	});
}
function RoadCode({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("font-mono text-xs font-medium text-muted-foreground", className),
		children
	});
}
// node_modules/.nitro/vite/services/ssr/assets/review-queue-8zoDo_i1.js
/**
* SYNTHETIC reviewer assignments: pending reports already held by a made-up
* second reviewer, so the queues show all three assignment states. No real
* person is named.
*/
var SEEDED_ASSIGNMENTS = {
	"RP-419260": "Reviewer B",
	"RP-419150": "Reviewer B"
};
/** Hazard types a filter may name; the order is the order shown in the menu. */
var REVIEW_HAZARDS = [
	"landslide",
	"rockfall",
	"flooding",
	"road_block",
	"fallen_tree",
	"damaged_bridge",
	"road_damage",
	"snow_ice",
	"poor_visibility",
	"accident",
	"other"
];
var QUEUES = [
	"needs_review",
	"assigned",
	"history"
];
var PENDING_STATUSES = [
	"under_review",
	"needs_info",
	"conflicting"
];
var SETTLED_OUTCOMES = [
	"verified",
	"duplicate",
	"rejected"
];
var SEVERITIES = [
	"high",
	"moderate",
	"low"
];
var isPending = (status) => PENDING_STATUSES.includes(status);
function assignmentOf(report, claims, seeded) {
	if (!isPending(report.status)) return { assignment: "unassigned" };
	if (seeded[report.ref]) return {
		assignment: "other",
		assignee: seeded[report.ref]
	};
	if (claims[report.ref]) return { assignment: "mine" };
	return { assignment: "unassigned" };
}
function queueOf(report, claims, seeded) {
	if (!isPending(report.status)) return "history";
	return assignmentOf(report, claims, seeded).assignment === "mine" ? "assigned" : "needs_review";
}
/** A claim is possible only on a pending report that nobody holds. */
function canClaim(report, claims, seeded) {
	return assignmentOf(report, claims, seeded).assignment === "unassigned" && isPending(report.status);
}
var SEVERITY_RANK = {
	high: 0,
	moderate: 1,
	low: 2
};
function defaultSort(queue) {
	return queue === "history" ? "newest" : "oldest";
}
function buildQueue(reports, queue, claims, seeded, filters = {}) {
	const items = reports.filter((report) => queueOf(report, claims, seeded) === queue).map((report) => ({
		report,
		...assignmentOf(report, claims, seeded)
	})).filter(({ report, assignment }) => {
		if (filters.hazard && report.hazardType !== filters.hazard) return false;
		if (filters.severity && report.severity !== filters.severity) return false;
		if (queue === "needs_review" && filters.assignee && assignment !== filters.assignee) return false;
		if (queue === "history" && filters.outcome && report.status !== filters.outcome) return false;
		return true;
	});
	const sort = filters.sort ?? defaultSort(queue);
	return items.sort((a, b) => {
		if (sort === "severity") {
			const bySeverity = SEVERITY_RANK[a.report.severity] - SEVERITY_RANK[b.report.severity];
			if (bySeverity) return bySeverity;
		}
		const ordered = a.report.receivedAt - b.report.receivedAt || a.report.ref.localeCompare(b.report.ref);
		return sort === "newest" ? -ordered : ordered;
	});
}
function queueCounts(reports, claims, seeded) {
	const counts = {
		needs_review: 0,
		assigned: 0,
		history: 0
	};
	for (const report of reports) counts[queueOf(report, claims, seeded)] += 1;
	return counts;
}
/** Reports this one points to, and reports on the same road segment. */
function relatedReports(report, reports) {
	const linked = new Set([report.duplicateOf, report.conflictsWith].filter(Boolean));
	for (const other of reports) if (other.duplicateOf === report.ref || other.conflictsWith === report.ref) linked.add(other.ref);
	const byRef = (ref) => reports.find((r) => r.ref === ref);
	return {
		linked: [...linked].map((ref) => byRef(ref)).filter((r) => !!r),
		sameSegment: reports.filter((other) => other.ref !== report.ref && other.segmentId === report.segmentId && !linked.has(other.ref))
	};
}
var SORTS = [
	"oldest",
	"newest",
	"severity"
];
var ASSIGNEE_FILTERS = ["unassigned", "other"];
/** Narrows untrusted URL search values; anything unrecognised is dropped. */
function parseQueueSearch(search, hazards) {
	const pick = (value, allowed) => typeof value === "string" && allowed.includes(value) ? value : void 0;
	const parsed = {
		queue: pick(search.queue, QUEUES),
		hazard: pick(search.hazard, hazards),
		severity: pick(search.severity, SEVERITIES),
		assignee: pick(search.assignee, ASSIGNEE_FILTERS),
		outcome: pick(search.outcome, SETTLED_OUTCOMES),
		sort: pick(search.sort, SORTS)
	};
	return Object.fromEntries(Object.entries(parsed).filter(([, value]) => value !== void 0));
}
// node_modules/.nitro/vite/services/ssr/assets/router-ip9NLZv6.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
/**
* The secondary button on a glass card: transparent with a glass edge, so it
* stays a quiet outline over the frosted fill (same pattern as the rail's
* sign-in button).
*/
var GLASS_OUTLINE = "min-h-11 rounded-xl border-(--glass-line) bg-transparent text-foreground hover:bg-(--glass-hover) dark:border-(--glass-line) dark:bg-transparent dark:hover:bg-(--glass-hover)";
function NotFoundPage() {
	(0, import_react.useEffect)(() => {
		document.title = "Page not found | RaahPrahari";
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rp-info-page rp-error-page",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass-strong w-full max-w-lg rounded-3xl p-8 text-center sm:p-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {
					variant: "full",
					className: "mx-auto mb-5 max-w-[11rem]"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "rp-info-eyebrow",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-hidden": true }), "PAGE NOT FOUND"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "rp-page-title",
					children: "This page could not be found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground",
					children: "The address may be incorrect or the page may have moved. Choose one of these routes to continue."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rp-info-actions justify-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						className: "min-h-11 rounded-xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { "aria-hidden": true }), "Back to home"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						className: GLASS_OUTLINE,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/traveller",
							children: ["Check a road", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { "aria-hidden": true })]
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 flex justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrototypeRibbon, {})
				})
			]
		})
	});
}
function RouteErrorPage({ reset }) {
	const router = useRouter();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rp-error-page",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass-strong w-full max-w-md space-y-6 rounded-3xl p-8 text-center sm:p-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "rp-page-title",
					children: "This page couldn’t load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "text-muted-foreground",
					children: "Please try again, or return to the home page."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap justify-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => {
							router.invalidate();
							reset();
						},
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						asChild: true,
						className: GLASS_OUTLINE,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/",
							children: "Go home"
						})
					})]
				})
			]
		})
	});
}
function EnvBanner() {
	if (env.appEnv !== "demo") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "note",
		"data-testid": "env-banner",
		className: "glass-strong border-status-caution px-3 py-2 text-center font-semibold text-foreground",
		children: "DEMO: yahan ka saara data synthetic (nakli) hai. Asli advisory nahi hai."
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		theme: "light",
		position: "top-right",
		offset: 72,
		mobileOffset: 72,
		duration: 4e3,
		className: "toaster group",
		toastOptions: { classNames: { toast: "glass-strong" } },
		icons: {
			success: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }),
			info: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-4" }),
			warning: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" }),
			error: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OctagonX, { className: "size-4" }),
			loading: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 motion-safe:animate-spin" })
		},
		style: {
			"--normal-text": "var(--popover-foreground)",
			"--normal-border": "var(--glass-line)",
			"--border-radius": "1rem"
		},
		...props
	});
};
function TooltipProvider({ delayDuration = 0, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider$1, {
		"data-slot": "tooltip-provider",
		delayDuration,
		...props
	});
}
function Tooltip({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip$1, {
		"data-slot": "tooltip",
		...props
	});
}
function TooltipTrigger({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger$1, {
		"data-slot": "tooltip-trigger",
		...props
	});
}
function TooltipContent({ className, sideOffset = 0, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipContent$1, {
		"data-slot": "tooltip-content",
		sideOffset,
		className: cn("z-(--z-popover) w-fit origin-(--radix-tooltip-content-transform-origin) animate-in rounded-xl glass-strong px-3 py-1.5 text-xs text-balance text-foreground fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipArrow, { className: "z-(--z-popover) size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-(--glass-panel-strong) fill-(--glass-panel-strong)" })]
	}) });
}
/** The first five are the suggestions shown before anything is typed. */
var FEATURES = [
	{
		id: "home",
		path: "/",
		category: "general"
	},
	{
		id: "map",
		path: "/map",
		category: "navigation"
	},
	{
		id: "review",
		path: "/review",
		category: "review"
	},
	{
		id: "official",
		path: "/official",
		category: "official"
	},
	{
		id: "contributions",
		path: "/contributions",
		category: "community"
	},
	{
		id: "traveller",
		path: "/traveller",
		category: "navigation"
	},
	{
		id: "advisories",
		path: "/advisories",
		category: "navigation"
	},
	{
		id: "report",
		path: "/report",
		category: "reports"
	},
	{
		id: "myReports",
		path: "/reports",
		category: "reports",
		signedInOnly: true
	},
	{
		id: "profile",
		path: "/profile",
		category: "account"
	},
	{
		id: "status",
		path: "/status",
		category: "system"
	},
	{
		id: "help",
		path: "/help",
		category: "help"
	},
	{
		id: "about",
		path: "/about",
		category: "help"
	},
	{
		id: "contact",
		path: "/contact",
		category: "help"
	}
];
var featureTitleKey = (id) => `palette.feature.${id}.title`;
var featureDescriptionKey = (id) => `palette.feature.${id}.description`;
var categoryKey = (category) => `palette.category.${category}`;
/** Lower-cases and strips accents so "Map", "map" and "máp" match alike. */
function normalise(text) {
	return text.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
}
/**
* Empty query: the suggestions. Otherwise every word must appear in the
* title, description or category, in the current language or in English
* (so a Hindi reader can still type "map").
*/
function searchFeatures(query, translate, english, { signedIn }) {
	const visible = FEATURES.filter((feature) => !feature.signedInOnly || signedIn);
	const words = normalise(query).split(/\s+/).filter(Boolean);
	if (!words.length) return visible.slice(0, 5);
	return visible.filter((feature) => {
		const haystack = normalise([
			featureTitleKey(feature.id),
			featureDescriptionKey(feature.id),
			categoryKey(feature.category)
		].flatMap((key) => [translate(key), english(key)]).join(" "));
		return words.every((word) => haystack.includes(word));
	});
}
var FEATURE_ICON = {
	home: House,
	map: Map$1,
	review: ClipboardCheck,
	official: ShieldCheck,
	contributions: Trophy,
	traveller: Search,
	advisories: ListChecks,
	report: FileExclamationPoint,
	myReports: BookOpen,
	profile: UserRound,
	status: Activity,
	help: CircleQuestionMark,
	about: Info,
	contact: Mail
};
/** True for Ctrl+K, or Cmd+K on a Mac keyboard. */
function isToggleShortcut(event) {
	return (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "k";
}
/**
* Command palette for jumping to any screen.
*
* The input is an ARIA combobox that owns a listbox of results: arrow keys
* move the highlighted option, Enter opens it, Escape closes the dialog.
* Focus stays in the input throughout, and Radix Dialog traps it.
*/
function FeatureSearchModal({ open, onOpenChange, returnFocusRef, shortcutEnabled = true }) {
	const { t } = usePrefs();
	const navigate = useNavigate();
	const signedIn = useAccountSession().status === "authenticated";
	const [query, setQuery] = (0, import_react.useState)("");
	const [active, setActive] = (0, import_react.useState)(0);
	const baseId = (0, import_react.useId)();
	const listId = `${baseId}-list`;
	const optionId = (id) => `${baseId}-${id}`;
	const changeOpen = (next) => {
		if (!next) {
			setQuery("");
			setActive(0);
		}
		onOpenChange(next);
	};
	const shortcutOrigin = (0, import_react.useRef)(null);
	const onShortcut = (0, import_react.useEffectEvent)((event) => {
		if (!isToggleShortcut(event) || event.repeat) return;
		if (!open && !shortcutEnabled) return;
		event.preventDefault();
		if (!open && document.activeElement instanceof HTMLElement) shortcutOrigin.current = document.activeElement;
		changeOpen(!open);
	});
	(0, import_react.useEffect)(() => {
		window.addEventListener("keydown", onShortcut);
		return () => window.removeEventListener("keydown", onShortcut);
	}, []);
	const results = (0, import_react.useMemo)(() => searchFeatures(query, t, (key) => en[key], { signedIn }), [
		query,
		t,
		signedIn
	]);
	const suggested = !query.trim();
	const current = results[Math.min(active, results.length - 1)];
	(0, import_react.useEffect)(() => {
		if (!current) return;
		document.getElementById(optionId(current.id))?.scrollIntoView?.({ block: "nearest" });
	}, [current?.id]);
	const select = (feature) => {
		changeOpen(false);
		if (feature.path === "/report") navigate({
			to: "/report",
			search: { segment: void 0 }
		});
		else navigate({ to: feature.path });
	};
	const onInputKeyDown = (event) => {
		if (!results.length) return;
		const last = results.length - 1;
		const index = Math.min(active, last);
		if (event.key === "ArrowDown") {
			event.preventDefault();
			setActive(index >= last ? 0 : index + 1);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			setActive(index <= 0 ? last : index - 1);
		} else if (event.key === "Enter" && current) {
			event.preventDefault();
			select(current);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: changeOpen,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "top-[12vh] translate-y-0 gap-0 overflow-hidden p-0 text-popover-foreground sm:max-w-xl",
			showCloseButton: false,
			onCloseAutoFocus: (event) => {
				const target = shortcutOrigin.current ?? returnFocusRef?.current;
				shortcutOrigin.current = null;
				if (target?.isConnected) {
					event.preventDefault();
					target.focus();
				}
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
					className: "sr-only",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: t("palette.title") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t("palette.description") })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative border-b border-(--glass-divider) p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
						"aria-hidden": true,
						className: "pointer-events-none absolute top-1/2 left-6 z-(--z-content) size-4 -translate-y-1/2 text-muted-foreground"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						role: "combobox",
						"aria-label": t("palette.inputLabel"),
						"aria-expanded": results.length > 0,
						"aria-controls": listId,
						"aria-autocomplete": "list",
						"aria-activedescendant": current ? optionId(current.id) : void 0,
						autoComplete: "off",
						spellCheck: false,
						value: query,
						placeholder: t("palette.placeholder"),
						onChange: (event) => {
							setQuery(event.target.value);
							setActive(0);
						},
						onKeyDown: onInputKeyDown,
						className: "h-11 pl-10"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					role: "region",
					"aria-labelledby": `${baseId}-heading`,
					tabIndex: 0,
					className: "max-h-[min(60vh,24rem)] overflow-y-auto p-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							id: `${baseId}-heading`,
							children: suggested ? t("palette.suggested") : t("palette.results")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-live": "polite",
							className: "font-normal normal-case",
							children: suggested ? "" : t("palette.resultCount").replace("{count}", String(results.length))
						})]
					}), results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						className: "px-3 py-8 text-center text-sm text-muted-foreground",
						children: t("palette.noResults").replace("{query}", query.trim())
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						id: listId,
						role: "listbox",
						"aria-labelledby": `${baseId}-heading`,
						className: "m-0 list-none space-y-1 p-0",
						children: results.map((feature, index) => {
							const Icon = FEATURE_ICON[feature.id];
							const selected = feature.id === current?.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								id: optionId(feature.id),
								role: "option",
								"aria-selected": selected,
								"data-testid": `feature-${feature.id}`,
								onMouseDown: (event) => event.preventDefault(),
								onMouseMove: () => setActive(index),
								onClick: () => select(feature),
								className: cn("flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors motion-reduce:transition-none", selected ? "border-(--glass-line) bg-(--glass-panel-strong) shadow-[inset_3px_0_0_var(--glass-accent-line)]" : "border-transparent"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": true,
										className: "grid size-9 shrink-0 place-items-center rounded-xl bg-(--glass-divider) text-(--glass-accent-text)",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex flex-wrap items-center gap-x-2 text-sm font-semibold text-foreground",
											children: [t(featureTitleKey(feature.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-normal text-muted-foreground",
												children: t(categoryKey(feature.category))
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-xs text-muted-foreground",
											children: t(featureDescriptionKey(feature.id))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
										"aria-hidden": true,
										className: cn("size-4 shrink-0", selected ? "text-link" : "text-muted-foreground")
									})
								]
							}, feature.id);
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"aria-hidden": true,
					className: "hidden flex-wrap items-center gap-x-4 gap-y-1 border-t border-(--glass-divider) px-4 py-2.5 text-xs text-muted-foreground sm:flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kbd, { children: "↑" }),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kbd, { children: "↓" }),
							" ",
							t("palette.hintNavigate")
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kbd, { children: "Enter" }),
							" ",
							t("palette.hintOpen")
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kbd, { children: "Esc" }),
							" ",
							t("palette.hintClose")
						] })
					]
				})
			]
		})
	});
}
function Kbd({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
		className: "rounded-md border border-(--glass-line) bg-(--glass-divider) px-1.5 py-0.5 font-mono text-xs text-foreground",
		children
	});
}
/**
* Sign-out flow that first checks this account's unsynced reports. Drafts are
* never deleted; they stay in this account's local scope and resume syncing
* after the same account signs in again. Render `dialog` somewhere that stays
* mounted (e.g. not inside a menu that closes).
*/
function useSignOutFlow() {
	const { t } = usePrefs();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [pending, setPending] = (0, import_react.useState)(null);
	const signOut = async () => {
		setBusy(true);
		try {
			await signOutAccount();
		} catch {
			toast.error(t("login.signOutError"));
		} finally {
			setBusy(false);
			setPending(null);
		}
	};
	const start = async () => {
		setBusy(true);
		let count;
		try {
			count = await countUnsyncedDrafts(getActiveAccountScope());
		} catch {
			count = null;
		}
		setBusy(false);
		if (count === 0) await signOut();
		else setPending({ count });
	};
	const count = pending?.count ?? null;
	const warning = count === null ? t("signout.unknown") : t(count === 1 ? "signout.unsyncedOne" : "signout.unsyncedMany").replace("{count}", String(count));
	return {
		busy,
		start,
		dialog: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: pending !== null,
			onOpenChange: (open) => {
				if (!open && !busy) setPending(null);
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "font-display",
					children: t("signout.title")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: warning })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: t("signout.kept")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					disabled: busy,
					onClick: () => setPending(null),
					children: t("signout.cancel")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					disabled: busy,
					"aria-busy": busy,
					onClick: () => void signOut(),
					children: busy ? t("login.signingOut") : t("signout.confirm")
				})] })
			] })
		})
	};
}
function SignOutButton({ className, variant = "outline" }) {
	const { t } = usePrefs();
	const { busy, start, dialog } = useSignOutFlow();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		variant,
		className,
		disabled: busy,
		"aria-busy": busy,
		onClick: () => void start(),
		children: busy ? t("login.signingOut") : t("login.signOut")
	}), dialog] });
}
var ERROR_KEYS = {
	invalid_credentials: "login.invalidCredentials",
	credentials_or_confirmation: "login.credentialsOrConfirmation",
	network: "login.networkError",
	not_configured: "login.notConfigured",
	no_session: "login.noSession",
	generic: "login.genericError"
};
/** Maps Supabase/auth errors to a user-facing category without exposing details. */
function classifyLoginError(error) {
	if (error instanceof SupabaseConfigError) return "not_configured";
	if (typeof navigator !== "undefined" && navigator.onLine === false) return "network";
	const e = error ?? {};
	if (e.code === "invalid_credentials") return "invalid_credentials";
	if (e.code === "email_not_confirmed" || e.name === "AuthApiError" && e.status === 422) return "credentials_or_confirmation";
	if (e.name === "AuthApiError" && e.status === 400) return "invalid_credentials";
	if (e.name === "AuthRetryableFetchError" || e.name === "TypeError" || e.status === 0) return "network";
	return "generic";
}
/** Signs in with Supabase. Resolves only when Supabase returns a session. */
async function signInWithEmail(email, password) {
	const { data, error } = await getSupabaseClient().auth.signInWithPassword({
		email: normalizeAuthEmail(email),
		password
	});
	if (error) throw error;
	if (!data.session) throw Object.assign(/* @__PURE__ */ new Error("No session returned"), { code: "no_session" });
	applyAuthSession(data.session);
	return data.session;
}
function LoginForm({ onSignedIn }) {
	const { t } = usePrefs();
	const schema = (0, import_react.useMemo)(() => object({
		email: string().transform(normalizeAuthEmail).pipe(email(t("login.emailInvalid"))),
		password: string().min(1, t("login.passwordRequired"))
	}), [t]);
	const form = useForm({
		resolver: u(schema),
		defaultValues: {
			email: "",
			password: ""
		}
	});
	const submit = form.handleSubmit(async ({ email, password }) => {
		form.clearErrors("root");
		try {
			await signInWithEmail(email.trim(), password);
			form.reset();
			onSignedIn();
		} catch (error) {
			const kind = error?.code === "no_session" ? "no_session" : classifyLoginError(error);
			form.setValue("password", "");
			form.setError("root", { message: t(ERROR_KEYS[kind]) });
		}
	});
	const pending = form.formState.isSubmitting;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Form, {
		...form,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
			onSubmit: submit,
			noValidate: true,
			className: "space-y-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				disabled: pending,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
						control: form.control,
						name: "email",
						render: ({ field }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FormItem, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormLabel, { children: t("login.email") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormControl, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "email",
								autoComplete: "email",
								required: true,
								...field
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormMessage, {})
						] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
						control: form.control,
						name: "password",
						render: ({ field }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FormItem, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormLabel, { children: t("login.password") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormControl, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "password",
								autoComplete: "current-password",
								required: true,
								...field
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormMessage, {})
						] })
					}),
					form.formState.errors.root && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						role: "alert",
						className: "flex items-start gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
							"aria-hidden": true,
							className: "mt-0.5 size-4 shrink-0 text-destructive"
						}), form.formState.errors.root.message]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						"aria-busy": pending,
						children: pending ? t("login.submitting") : t("login.submit")
					})
				]
			})
		})
	});
}
function SignedInPanel({ onNavigate }) {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				children: t("login.signedIn")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "link",
				className: "px-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/profile",
					onClick: onNavigate,
					children: t("profile.link")
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignOutButton, { className: "w-full" })
		]
	});
}
var MODE_COPY = {
	login: {
		title: "login.title",
		body: "login.body"
	},
	signup: {
		title: "signup.title",
		body: "signup.body"
	},
	forgot: {
		title: "forgot.title",
		body: "forgot.body"
	}
};
function LoginDialog({ open, onOpenChange, returnFocusRef }) {
	const { t } = usePrefs();
	const session = useAccountSession();
	const [mode, setMode] = (0, import_react.useState)("login");
	const close = () => {
		setMode("login");
		onOpenChange(false);
	};
	const signedOut = session.status === "signed_out";
	const copy = MODE_COPY[signedOut ? mode : "login"];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (next) => {
			if (!next) setMode("login");
			onOpenChange(next);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			onCloseAutoFocus: (event) => {
				if (returnFocusRef.current?.isConnected) {
					event.preventDefault();
					returnFocusRef.current.focus();
				}
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "font-display",
					children: t(copy.title)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t(copy.body) })] }),
				session.status === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					children: t("login.checking")
				}) : session.status === "authenticated" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedInPanel, { onNavigate: close }) : mode === "signup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignupForm, { onSignedIn: close }) : mode === "forgot" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForgotPasswordForm, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginForm, { onSignedIn: close }),
				signedOut && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap justify-between gap-x-4",
					children: mode === "login" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "link",
						className: "px-0",
						onClick: () => setMode("forgot"),
						children: t("login.forgot")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "link",
						className: "px-0",
						onClick: () => setMode("signup"),
						children: t("login.toSignup")
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "link",
						className: "px-0",
						onClick: () => setMode("login"),
						children: t("login.toLogin")
					})
				})
			]
		})
	});
}
/** Desktop rail, in order. */
var RAIL_NAV = [
	{
		to: "/",
		label: "nav.home",
		icon: House
	},
	{
		to: "/traveller",
		label: "shell.checkRoad",
		icon: Search
	},
	{
		to: "/map",
		label: "shell.liveMap",
		icon: Map$1
	},
	{
		to: "/advisories",
		label: "nav.advisories",
		icon: ListChecks
	},
	{
		to: "/reports",
		label: "shell.myReports",
		icon: BookOpen,
		requiresSignIn: true
	},
	{
		to: "/contributions",
		label: "nav.contributions",
		icon: Award
	},
	{
		to: "/help",
		label: "nav.help",
		icon: CircleQuestionMark
	}
];
var REVIEW_ITEM = {
	to: "/review",
	label: "shell.reviewQueue",
	icon: ClipboardCheck
};
var OFFICIAL_ITEM = {
	to: "/official",
	label: "shell.officialUpdates",
	icon: Megaphone
};
/**
* Role-based extra rail items. The role is only read from the session (set
* server-side); an unknown or missing role shows neither item. The UI never
* grants or chooses a role, and the backend still enforces access.
*/
function roleNavItems(role) {
	if (role === "reviewer") return [REVIEW_ITEM];
	if (role === "official") return [OFFICIAL_ITEM];
	return [];
}
/** Mobile bottom tabs, in order. The centre item is the raised report action. */
var TAB_NAV = [
	{
		to: "/",
		label: "nav.home",
		icon: House
	},
	{
		to: "/map",
		label: "shell.tabMap",
		icon: Map$1
	},
	{
		to: "/report",
		label: "shell.tabReport",
		icon: Plus,
		primaryAction: true
	},
	{
		to: "/reports",
		label: "shell.tabReports",
		icon: BookOpen,
		requiresSignIn: true
	},
	{
		to: "/profile",
		label: "shell.tabProfile",
		icon: UserRound,
		requiresSignIn: true
	}
];
/** Which shell item is current for a URL. `view` is the /check view search param. */
function activeNavTarget(pathname, view) {
	const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
	const under = (base) => path === base || path.startsWith(`${base}/`);
	if (path === "/") return "/";
	if (path === "/traveller") return "/traveller";
	if (path === "/map" || path === "/check" && view !== "list") return "/map";
	if (under("/advisories") || path === "/check") return "/advisories";
	if (under("/help")) return "/help";
	if (under("/reports")) return "/reports";
	if (under("/report")) return "/report";
	if (under("/review")) return "/review";
	if (under("/official")) return "/official";
	if (path === "/profile") return "/profile";
	if (path === "/contributions") return "/contributions";
	return null;
}
/**
* The mobile top bar names the section you are in; pages keep their own h1.
* Ported from the previous site chrome's sectionLabel(): the current shell
* item's label, plus a few routes that have no item of their own.
*/
function sectionLabel(pathname, active) {
	const item = [
		...RAIL_NAV,
		REVIEW_ITEM,
		OFFICIAL_ITEM,
		...TAB_NAV
	].find(({ to }) => to === active);
	if (item) return item.label;
	if (pathname.startsWith("/status")) return "footer.status";
	if (pathname.startsWith("/review")) return "review.title";
	if (pathname.startsWith("/official")) return "official.title";
	if (pathname.startsWith("/profile")) return "nav.account";
	return null;
}
var RAIL_COLLAPSED_KEY = "rp.rail.collapsed";
var BANNER_DISMISSED_KEY = "rp.shell.bannerDismissed";
function DropdownMenu({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenu$1, {
		"data-slot": "dropdown-menu",
		...props
	});
}
/**
* How the menu that is about to open was triggered. Radix stops a pointer
* press from focusing the trigger and then focuses the menu itself from
* <body>, and Edge and Chrome report :focus-visible for that, so a mouse click
* would draw the keyboard focus ring (see styles.css). The content records this
* as data-open-source, and the ring rules only apply to keyboard opens.
*/
var lastOpenSource = "keyboard";
function DropdownMenuTrigger({ onPointerDown, onKeyDown, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger$1, {
		"data-slot": "dropdown-menu-trigger",
		onPointerDown: (event) => {
			lastOpenSource = "pointer";
			onPointerDown?.(event);
		},
		onKeyDown: (event) => {
			lastOpenSource = "keyboard";
			onKeyDown?.(event);
		},
		...props
	});
}
function DropdownMenuContent({ className, sideOffset = 4, ref, ...props }) {
	const setRef = import_react.useCallback((node) => {
		if (node) node.dataset.openSource = lastOpenSource;
		if (typeof ref === "function") ref(node);
		else if (ref) ref.current = node;
	}, [ref]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent$1, {
		"data-slot": "dropdown-menu-content",
		ref: setRef,
		sideOffset,
		className: cn("z-(--z-popover) max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-2xl glass-strong p-1 text-popover-foreground data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", className),
		...props
	}) });
}
function DropdownMenuItem({ className, inset, variant = "default", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem$1, {
		"data-slot": "dropdown-menu-item",
		"data-inset": inset,
		"data-variant": variant,
		className: cn("relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!", className),
		...props
	});
}
function DropdownMenuRadioGroup({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioGroup$1, {
		"data-slot": "dropdown-menu-radio-group",
		...props
	});
}
function DropdownMenuRadioItem({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuRadioItem$1, {
		"data-slot": "dropdown-menu-radio-item",
		className: cn("relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "size-2 fill-current" }) })
		}), children]
	});
}
function DropdownMenuLabel({ className, inset, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel$1, {
		"data-slot": "dropdown-menu-label",
		"data-inset": inset,
		className: cn("px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", className),
		...props
	});
}
function DropdownMenuSeparator({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator$1, {
		"data-slot": "dropdown-menu-separator",
		className: cn("-mx-1 my-1 h-px bg-(--glass-divider)", className),
		...props
	});
}
function Popover({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Popover$1, {
		"data-slot": "popover",
		...props
	});
}
function PopoverTrigger({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger$1, {
		"data-slot": "popover-trigger",
		...props
	});
}
function PopoverContent({ className, align = "center", sideOffset = 4, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent$1, {
		"data-slot": "popover-content",
		align,
		sideOffset,
		className: cn("z-(--z-popover) w-72 origin-(--radix-popover-content-transform-origin) rounded-2xl glass-strong p-4 text-popover-foreground outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", className),
		...props
	}) });
}
function useOnlineStatus() {
	const [status, setStatus] = (0, import_react.useState)("unknown");
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		const update = () => {
			setStatus(typeof navigator === "undefined" ? "unknown" : navigator.onLine ? "online" : "offline");
		};
		update();
		window.addEventListener("online", update);
		window.addEventListener("offline", update);
		return () => {
			window.removeEventListener("online", update);
			window.removeEventListener("offline", update);
		};
	}, []);
	return status;
}
function useUnsyncedCounts(scope = getActiveAccountScope()) {
	const [counts, setCounts] = (0, import_react.useState)({
		pending: 0,
		failed: 0
	});
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		let disposed = false;
		const refresh = async () => {
			try {
				const entries = await listOutbox(scope);
				if (disposed) return;
				const scopedEntries = entries.filter((entry) => entry.accountScope === scope && entry.ownerUserId !== null);
				setCounts({
					pending: scopedEntries.filter((entry) => entry.state === "pending" || entry.state === "failed").length,
					failed: scopedEntries.filter((entry) => entry.state === "failed").length
				});
			} catch (error) {
				console.error("Unable to read pending report delivery status", error);
			}
		};
		refresh();
		const handle = setInterval(() => void refresh(), 3e4);
		return () => {
			disposed = true;
			clearInterval(handle);
		};
	}, [scope]);
	return counts;
}
function deliveryChannel(input) {
	if (input.transport === "none") return null;
	const { sync, online } = input;
	const times = {
		lastSuccessAt: sync.lastSuccessfulSyncAt,
		nextAttemptAt: sync.nextAttemptAt
	};
	if (sync.running) return {
		label: "status.channel.syncing",
		tone: "neutral",
		...times
	};
	if (online === "offline") return {
		label: "status.channel.deviceOffline",
		tone: "warn",
		...times
	};
	const last = sync.lastResult;
	if (!last) return {
		label: sync.lastSuccessfulSyncAt === null ? "status.channel.noSyncYet" : "status.channel.lastRunComplete",
		tone: sync.lastSuccessfulSyncAt === null ? "neutral" : "ok",
		...times
	};
	switch (last.status) {
		case "complete": return {
			label: "status.channel.lastRunComplete",
			tone: "ok",
			...times
		};
		case "nothing_to_send": return {
			label: "status.channel.lastRunNothing",
			tone: "neutral",
			...times
		};
		case "error": return {
			label: "status.channel.lastRunError",
			tone: "bad",
			...times
		};
		case "signed_out": return {
			label: "status.channel.lastRunSignedOut",
			tone: "warn",
			...times
		};
		case "offline": return {
			label: "status.channel.lastRunOffline",
			tone: "warn",
			...times
		};
		case "not_configured": return {
			label: "status.channel.lastRunNotConfigured",
			tone: "bad",
			...times
		};
		case "idle":
		case "running": return {
			label: "status.channel.noSyncYet",
			tone: "neutral",
			...times
		};
	}
}
function deliveryStatus(input) {
	return {
		id: "reportDelivery",
		name: "status.item.reportDelivery",
		state: input.transport === "http" ? "configured" : input.transport === "none" ? "unavailable" : "simulated",
		reason: input.transport === "http" ? "status.reason.deliveryHttp" : input.transport === "none" ? "status.reason.deliveryNone" : "status.reason.deliveryStub",
		channel: deliveryChannel(input)
	};
}
function sessionStatus(input) {
	const simulated = input.transport === "dev_stub" || input.transport === "injected";
	const signedIn = input.session === "authenticated";
	const providerConfigured = input.authProvider === "supabase";
	return {
		id: "accountSession",
		name: "status.item.accountSession",
		state: simulated ? "simulated" : signedIn || providerConfigured ? "configured" : "unavailable",
		reason: simulated ? "status.reason.sessionStub" : signedIn ? "status.reason.sessionLive" : providerConfigured ? "status.reason.sessionSignedOut" : "status.reason.sessionNone",
		channel: input.session === "authenticated" ? {
			label: "status.channel.sessionSignedIn",
			tone: "ok"
		} : input.session === "loading" ? {
			label: "status.channel.sessionLoading",
			tone: "neutral"
		} : {
			label: "status.channel.sessionSignedOut",
			tone: "warn"
		}
	};
}
function backgroundStatus(input) {
	const detected = input.backgroundSync;
	return {
		id: "backgroundSync",
		name: "status.item.backgroundSync",
		state: detected === null ? "checking" : detected === "available" ? "configured" : "unavailable",
		reason: detected === null ? "status.reason.backgroundChecking" : detected === "available" ? "status.reason.backgroundAvailable" : detected === "no_service_worker" ? "status.reason.backgroundNoWorker" : "status.reason.backgroundUnsupported",
		channel: null
	};
}
function mapTilesChannel(online) {
	if (online === "offline") return {
		label: "status.channel.tilesOffline",
		tone: "warn"
	};
	if (online === "online") return {
		label: "status.channel.tilesOnline",
		tone: "neutral"
	};
	return {
		label: "status.channel.tilesChecking",
		tone: "neutral"
	};
}
function deriveSystemStatus(input) {
	return [
		deliveryStatus(input),
		sessionStatus(input),
		backgroundStatus(input),
		{
			id: "advisoryData",
			name: "status.item.advisoryData",
			state: "simulated",
			reason: "status.reason.advisoryData",
			channel: {
				label: "status.channel.seededData",
				tone: "neutral"
			}
		},
		{
			id: "routing",
			name: "status.item.routing",
			state: input.routingMode === "live" ? "configured" : "simulated",
			reason: input.routingMode === "live" ? "status.reason.routingLive" : "status.reason.routingSeeded",
			channel: null
		},
		{
			id: "mapTiles",
			name: "status.item.mapTiles",
			state: "configured",
			reason: "status.reason.mapTiles",
			channel: mapTilesChannel(input.online)
		},
		{
			id: "officialPublishing",
			name: "status.item.officialPublishing",
			state: "unavailable",
			reason: "status.reason.officialPublishing",
			channel: null
		}
	];
}
/** Reads the existing stores and the engine's own detection; it owns no sync logic. */
function useSystemStatus() {
	const online = useOnlineStatus();
	const session = useAccountSession();
	const sync = useSyncState();
	const [backgroundSync, setBackgroundSync] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let disposed = false;
		detectBackgroundSync().then((result) => {
			if (!disposed) setBackgroundSync(result);
		}).catch(() => {
			if (!disposed) setBackgroundSync("unsupported");
		});
		return () => {
			disposed = true;
		};
	}, []);
	const { lastResult, lastSuccessfulSyncAt, nextAttemptAt, running } = sync;
	return (0, import_react.useMemo)(() => deriveSystemStatus({
		transport: getTransportSource(),
		online,
		session: session.status,
		authProvider: isSupabaseConfigured() ? "supabase" : "none",
		sync: {
			lastResult,
			lastSuccessfulSyncAt,
			nextAttemptAt,
			running
		},
		backgroundSync,
		routingMode: seededRoutingProvider.mode
	}), [
		online,
		session.status,
		lastResult,
		lastSuccessfulSyncAt,
		nextAttemptAt,
		running,
		backgroundSync
	]);
}
function chipState(status) {
	if (status.online === "offline") return "offline";
	if (status.pending > 0) return "pending";
	if (status.lastSuccessfulSyncAt === null) return "never";
	return "synced";
}
/** Banner only for offline, pending reports or a failed last sync. */
function bannerSignature(status) {
	const offline = status.online === "offline";
	if (!offline && status.pending === 0 && !status.lastFailed) return null;
	return `${offline ? 1 : 0}|${status.pending}|${status.lastFailed ? 1 : 0}`;
}
/** Reads the existing sources; it owns no sync logic. */
function useShellStatus() {
	const online = useOnlineStatus();
	const sync = useSyncState();
	const { pending, failed } = useUnsyncedCounts();
	return {
		online,
		lastSuccessfulSyncAt: sync.lastSuccessfulSyncAt,
		pending,
		failed,
		lastFailed: sync.lastResult?.status === "error" || failed > 0
	};
}
function useChipText(state, pending) {
	const { t } = usePrefs();
	if (state === "offline") return t("shell.status.offline");
	if (state === "pending") return t("shell.status.pending").replace("{count}", String(pending));
	if (state === "never") return t("shell.status.neverSynced");
	return t("shell.status.synced");
}
/** Dot or icon. Blue and neutral only: never green, amber or red. */
function ChipMark({ state }) {
	if (state === "offline") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, {
		"aria-hidden": true,
		className: "size-4 shrink-0"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		"aria-hidden": true,
		"data-testid": "status-mark",
		"data-mark": state === "never" ? "hollow" : "filled",
		className: cn("inline-block size-2.5 shrink-0 rounded-full", state === "never" && "border-2 border-shell-muted", state === "synced" && "bg-brand-blue", state === "pending" && "bg-shell-muted")
	});
}
/** The status lines shared by the chip popover and the menu dialog. */
function StatusDetailsContent({ status }) {
	const { t, stamp } = usePrefs();
	const delivery = useSystemStatus().find((item) => item.id === "reportDelivery");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: status.online === "offline" ? t("offline.deviceOffline") : status.online === "online" ? t("offline.deviceOnline") : t("offline.checking") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				t("offline.lastSync"),
				":",
				" ",
				status.lastSuccessfulSyncAt === null ? t("offline.notSynced") : stamp(status.lastSuccessfulSyncAt)
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				t("offline.pending"),
				": ",
				status.pending
			] }),
			status.failed > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				t("offline.failed"),
				": ",
				status.failed
			] }) : null,
			delivery ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-shell-muted",
				children: t(delivery.reason)
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-shell-muted",
				children: t("shell.status.note")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/status",
				className: "text-shell-link underline underline-offset-4",
				children: t("shell.status.fullPage")
			}) })
		]
	});
}
/** Status chip (desktop) or dot (mobile) that opens the details popover. */
function StatusChip({ status, compact = false }) {
	const { t } = usePrefs();
	const state = chipState(status);
	const text = useChipText(state, status.pending);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			"data-testid": "status-chip",
			"data-state-kind": state,
			"aria-label": compact ? t("shell.status.label").replace("{state}", text) : void 0,
			className: cn("glass inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-md text-sm text-shell-text", compact ? "px-0" : "px-3"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChipMark, { state }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: compact ? "sr-only" : void 0,
				children: text
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
		align: "end",
		className: "rp-shell w-80 text-shell-text",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-2 text-sm font-semibold",
			children: t("shell.statusDetails")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusDetailsContent, { status })]
	})] });
}
/** Same details as a dialog, for menu entries that have no chip to anchor to. */
function StatusDetailsDialog({ open, onOpenChange, status }) {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "rp-shell text-shell-text",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: t("shell.statusDetails") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
				className: "text-shell-muted",
				children: t("shell.status.label").replace("{state}", chipState(status) === "pending" ? t("shell.status.pending").replace("{count}", String(status.pending)) : t(chipState(status) === "offline" ? "shell.status.offline" : chipState(status) === "never" ? "shell.status.neverSynced" : "shell.status.synced"))
			})] }), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusDetailsContent, { status }) : null]
		})
	});
}
function readDismissed() {
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
function ShellStatusBanner({ status, onOpenDetails }) {
	const { t } = usePrefs();
	const signature = bannerSignature(status);
	const [dismissed, setDismissed] = (0, import_react.useState)(void 0);
	(0, import_react.useEffect)(() => {
		setDismissed(readDismissed());
	}, []);
	if (!signature || dismissed === void 0 || dismissed === signature) return null;
	const dismiss = () => {
		try {
			window.sessionStorage.setItem(BANNER_DISMISSED_KEY, signature);
		} catch {}
		setDismissed(signature);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "status",
		"data-testid": "shell-status-banner",
		className: "rp-shell glass flex w-full items-start gap-3 border-x-0 border-t-0 px-4 py-2 text-sm text-shell-text sm:px-6",
		children: [
			status.online === "offline" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, {
				"aria-hidden": true,
				className: "mt-0.5 size-4 shrink-0"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1 space-y-0.5",
				children: [
					status.online === "offline" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("shell.banner.offline") }) : null,
					status.pending > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("shell.banner.pending").replace("{count}", String(status.pending)) }) : null,
					status.lastFailed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("shell.banner.failed") }) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				className: "h-11 shrink-0 text-shell-link underline underline-offset-4",
				onClick: onOpenDetails,
				children: t("shell.statusDetails")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				size: "icon",
				"aria-label": t("shell.banner.dismiss"),
				className: "shrink-0",
				onClick: dismiss,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { "aria-hidden": true })
			})
		]
	});
}
/** 44px minimum touch target for every menu row (the shared item is ~32px). */
var ITEM = "min-h-11";
/** The account menu shared by the desktop rail and the mobile top bar. */
function AccountMenu({ status, trigger, onOpenLogin, onOpenSearch, pageLinks = false }) {
	const { t, theme, setTheme, lang, setLang } = usePrefs();
	const session = useAccountSession();
	const { start: startSignOut, dialog: signOutDialog } = useSignOutFlow();
	const [statusOpen, setStatusOpen] = (0, import_react.useState)(false);
	const signedIn = session.status === "authenticated";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: trigger
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
			align: "end",
			className: "rp-shell w-60 text-shell-text",
			children: [
				pageLinks ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
						asChild: true,
						className: ITEM,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/advisories",
							children: t("nav.advisories")
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
						asChild: true,
						className: ITEM,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/help",
							children: t("nav.help")
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
						asChild: true,
						className: ITEM,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/contributions",
							children: t("nav.contributions")
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {})
				] }) : null,
				!signedIn && onOpenLogin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
					className: ITEM,
					onSelect: () => onOpenLogin(),
					children: t("nav.login")
				}) : null,
				signedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
					asChild: true,
					className: ITEM,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/profile",
						children: t("shell.settings")
					})
				}) : null,
				onOpenSearch ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
					className: ITEM,
					onSelect: () => onOpenSearch(),
					children: t("palette.open")
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, { children: t("shell.theme") }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuRadioGroup, {
					value: theme,
					onValueChange: (value) => setTheme(value),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioItem, {
							value: "light",
							className: ITEM,
							children: t("shell.themeLight")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioItem, {
							value: "dark",
							className: ITEM,
							children: t("shell.themeDark")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioItem, {
							value: "system",
							className: ITEM,
							children: t("shell.themeSystem")
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, { children: t("shell.language") }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuRadioGroup, {
					value: lang,
					onValueChange: (value) => setLang(value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioItem, {
						value: "en",
						className: ITEM,
						children: "English"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioItem, {
						value: "hi",
						lang: "hi",
						className: ITEM,
						children: "हिन्दी"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
					className: ITEM,
					onSelect: () => setStatusOpen(true),
					children: t("shell.statusDetails")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
					asChild: true,
					className: ITEM,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/about",
						children: t("shell.about")
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
					asChild: true,
					className: ITEM,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/contact",
						children: t("shell.contact")
					})
				}),
				signedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
					className: ITEM,
					onSelect: () => void startSignOut(),
					children: t("shell.logout")
				})] }) : null
			]
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusDetailsDialog, {
			open: statusOpen,
			onOpenChange: setStatusOpen,
			status
		}),
		signOutDialog
	] });
}
/**
* Logo link to "/": the existing logo files (public/img/logo-on-*.png via
* <Logo variant="crest">, never redrawn) plus the "RaahPrahari" wordmark
* (Oxanium 600). Without the wordmark (collapsed rail) only the mark shows;
* the link's aria-label names it either way.
*/
function ShellLogo({ showWordmark = true, className, wordmarkClassName }) {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/",
		"aria-label": t("shell.homeLabel"),
		"data-testid": "shell-logo",
		className: cn("inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md text-shell-text", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {
			variant: "crest",
			decorative: true
		}), showWordmark ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			className: cn("font-display text-lg font-semibold", wordmarkClassName),
			children: "RaahPrahari"
		}) : null]
	});
}
function displayName(email) {
	return email ? email.split("@")[0] : "";
}
function RailItem({ item, active, collapsed, onGuard }) {
	const { t } = usePrefs();
	const Icon = item.icon;
	const label = t(item.label);
	const link = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: item.to,
		"aria-current": active ? "page" : void 0,
		"aria-label": collapsed ? label : void 0,
		onClick: (event) => {
			if (item.requiresSignIn && onGuard(item.to)) event.preventDefault();
		},
		className: cn("rp-shell-transition relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium", collapsed && "justify-center px-0", active ? "rp-rail-active text-shell-text" : "text-shell-muted hover:bg-(--glass-hover) hover:text-shell-text"),
		children: [
			active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"aria-hidden": true,
				"data-testid": "rail-active-bar",
				className: "rp-rail-active-bar absolute inset-y-2 left-0 w-0.5 rounded-full"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				"aria-hidden": true,
				className: "size-5 shrink-0"
			}),
			collapsed ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label })
		]
	});
	if (!collapsed) return link;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
		asChild: true,
		children: link
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
		side: "right",
		children: label
	})] });
}
/** Left rail (desktop). Sticky, full height. */
function Rail({ active, collapsed, onToggle, status, onGuard, onOpenLogin, onOpenSearch, searchRef }) {
	const { t, lang, setLang } = usePrefs();
	const navigate = useNavigate();
	const [query, setQuery] = (0, import_react.useState)("");
	const session = useAccountSession();
	const signedIn = session.status === "authenticated";
	const items = [...RAIL_NAV, ...session.status === "authenticated" ? roleNavItems(session.role) : []];
	const name = signedIn ? displayName(session.email) : "";
	const initial = (name || "?").charAt(0).toUpperCase();
	const submitSearch = (event) => {
		event.preventDefault();
		const value = query.trim();
		navigate({
			to: "/traveller",
			search: {
				q: value || void 0,
				from: void 0,
				to: void 0,
				view: void 0,
				seg: void 0
			}
		});
	};
	const avatarButton = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"aria-label": t("shell.accountMenu"),
		className: cn("glass flex min-h-11 w-full items-center gap-3 rounded-md px-1.5 text-left text-sm text-shell-text", collapsed && "justify-center px-0"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			className: "grid size-8 shrink-0 place-items-center rounded-full bg-(--glass-hover) font-semibold",
			children: initial
		}), collapsed ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 flex-1 truncate",
			children: name || t("nav.account")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
			"aria-hidden": true,
			className: "mr-1.5 size-4 shrink-0 text-shell-muted"
		})] })]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		"aria-label": t("nav.primary"),
		"data-testid": "shell-rail",
		"data-collapsed": collapsed,
		className: cn("rp-shell rp-shell-transition sticky top-0 hidden h-svh shrink-0 p-4 text-shell-text lg:flex", collapsed ? "w-[calc(var(--shell-rail-collapsed)+2rem)]" : "w-[calc(var(--shell-rail-expanded)+2rem)]"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-testid": "shell-rail-panel",
			className: "glass-strong flex min-h-0 w-full flex-col overflow-hidden rounded-3xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("flex h-14 items-center border-b border-(--glass-divider) px-3", collapsed && "justify-center px-0"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShellLogo, { showWordmark: !collapsed })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "m-0 flex flex-1 list-none flex-col gap-1 overflow-y-auto p-2",
					children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailItem, {
						item,
						active: active === item.to,
						collapsed,
						onGuard
					}) }), item.to === "/help" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "min-w-0",
						children: collapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/traveller",
								"aria-label": t("shell.search"),
								className: "rp-shell-transition mx-auto flex size-11 items-center justify-center rounded-xl text-shell-muted hover:bg-(--glass-hover) hover:text-shell-text",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
									"aria-hidden": true,
									className: "size-5"
								})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
							side: "right",
							children: t("shell.search")
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							role: "search",
							onSubmit: submitSearch,
							className: "relative min-w-0 px-1 py-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "rail-search",
									className: "sr-only",
									children: t("shell.search")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
									"aria-hidden": true,
									className: "pointer-events-none absolute top-1/2 left-3 z-(--z-content) size-4 -translate-y-1/2 text-shell-muted"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "rail-search",
									ref: searchRef,
									type: "search",
									value: query,
									onChange: (event) => setQuery(event.target.value),
									placeholder: t("shell.searchCompact"),
									"aria-keyshortcuts": "Control+K Meta+K",
									className: "glass h-9 w-full min-w-0 rounded-xl pr-2 pl-8 text-xs text-shell-text placeholder:text-shell-muted"
								})
							]
						})
					}) : null] }, item.to))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2 border-t border-(--glass-divider) p-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						"aria-label": collapsed ? t("shell.expand") : t("shell.collapse"),
						"aria-expanded": !collapsed,
						onClick: onToggle,
						className: cn("min-h-11 justify-start gap-3 px-3 text-shell-muted", collapsed && "justify-center px-0"),
						children: collapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsRight, {
							"aria-hidden": true,
							className: "size-5"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsLeft, {
							"aria-hidden": true,
							className: "size-5"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm",
							children: t("shell.collapse")
						})] })
					}), signedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountMenu, {
						status,
						trigger: avatarButton,
						onOpenSearch
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("flex flex-col gap-2", collapsed && "items-center"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							"aria-label": collapsed ? t("nav.login") : void 0,
							onClick: onOpenLogin,
							className: cn("min-h-11 w-full gap-2 rounded-xl border-(--glass-line) bg-transparent text-shell-text hover:bg-(--glass-hover) dark:bg-transparent dark:hover:bg-(--glass-hover)", collapsed && "w-11 px-0"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, {
								"aria-hidden": true,
								className: "size-5"
							}), collapsed ? null : t("nav.login")]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								role: "group",
								"aria-label": t("lang.label"),
								className: "flex gap-1",
								children: ["en", "hi"].map((language) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									lang: language,
									"aria-pressed": lang === language,
									onClick: () => setLang(language),
									className: cn("rp-shell-transition min-h-11 min-w-11 rounded-md px-2 text-sm font-medium", lang === language ? "bg-(--glass-hover) text-shell-text" : "text-shell-muted hover:text-shell-text"),
									children: language === "en" ? "EN" : "हिन्दी"
								}, language))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountMenu, {
								status,
								onOpenSearch,
								trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "ghost",
									size: "icon",
									"aria-label": t("shell.settings"),
									className: "text-shell-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { "aria-hidden": true })
								})
							})]
						})]
					})]
				})
			]
		})
	});
}
/**
* Behaviour helpers for the motion system. All timing and easing live in CSS
* tokens in `src/styles.css`; this file only toggles classes and attributes.
* Every helper is a no-op during SSR and when reduced motion is requested.
*/
var useIsoLayoutEffect = typeof window === "undefined" ? import_react.useEffect : import_react.useLayoutEffect;
function prefersReducedMotion() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
/** Elements that fade in once, the first time they are scrolled into view. */
var REVEAL_SELECTOR = "[data-reveal], .rp-info-card, .help-reminder, .help-page-footer";
/** Fades the main region in with a small upward motion on every route change. */
function PageTransition() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const first = (0, import_react.useRef)(true);
	useIsoLayoutEffect(() => {
		if (first.current) {
			first.current = false;
			return;
		}
		if (prefersReducedMotion()) return;
		const main = document.getElementById("main");
		if (!main) return;
		main.classList.remove("rp-page-enter");
		main.offsetWidth;
		main.classList.add("rp-page-enter");
		const done = () => main.classList.remove("rp-page-enter");
		main.addEventListener("animationend", done, { once: true });
		return () => main.removeEventListener("animationend", done);
	}, [pathname]);
	return null;
}
/**
* Marks `REVEAL_SELECTOR` elements that start below the fold as hidden, then
* reveals each one once. Elements already on screen are never hidden, so there
* is no flash on first paint and nothing stays invisible if scripts fail.
*/
function RevealObserver() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const initialPath = (0, import_react.useRef)(pathname);
	const navigated = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (pathname !== initialPath.current) navigated.current = true;
		if (!navigated.current) return;
		if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.setAttribute("data-reveal-state", "visible");
				observer.unobserve(entry.target);
			}
		}, {
			rootMargin: "0px 0px -8% 0px",
			threshold: .05
		});
		const scan = () => {
			document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
				if (el.hasAttribute("data-reveal-state")) return;
				if (el.getBoundingClientRect().top < window.innerHeight) return;
				el.setAttribute("data-reveal-state", "hidden");
				observer.observe(el);
			});
		};
		scan();
		const main = document.getElementById("main");
		let frame = 0;
		const mutations = main && typeof MutationObserver !== "undefined" ? new MutationObserver(() => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(scan);
		}) : null;
		if (main && mutations) mutations.observe(main, {
			childList: true,
			subtree: true
		});
		return () => {
			cancelAnimationFrame(frame);
			mutations?.disconnect();
			observer.disconnect();
			document.querySelectorAll("[data-reveal-state=\"hidden\"]").forEach((el) => el.setAttribute("data-reveal-state", "visible"));
		};
	}, [pathname]);
	return null;
}
/** The desktop content column, which scrolls instead of the window from xl. */
var contentScroller = () => typeof document === "undefined" ? null : document.getElementById("rp-content");
/** How far the page has scrolled: the window below xl, the content column from xl. */
function scrollOffset() {
	return Math.max(window.scrollY, contentScroller()?.scrollTop ?? 0);
}
/** Scrolls the page back to its top, whichever element is scrolling. */
function scrollContentToTop(behavior = "auto") {
	window.scrollTo({
		top: 0,
		behavior
	});
	const scroller = contentScroller();
	if (scroller && typeof scroller.scrollTo === "function") scroller.scrollTo({
		top: 0,
		behavior
	});
}
/** True once the page has scrolled past `offset` pixels. */
function useScrolled(offset = 4) {
	const [scrolled, setScrolled] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const onScroll = () => setScrolled(scrollOffset() > offset);
		onScroll();
		window.addEventListener("scroll", onScroll, {
			passive: true,
			capture: true
		});
		return () => window.removeEventListener("scroll", onScroll, { capture: true });
	}, [offset]);
	return scrolled;
}
/** Floating button that fades in after the page has scrolled down. */
function BackToTop() {
	const { t } = usePrefs();
	const visible = useScrolled(600);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		variant: "secondary",
		size: "icon-lg",
		"aria-label": t("nav.backToTop"),
		title: t("nav.backToTop"),
		tabIndex: visible ? 0 : -1,
		"aria-hidden": visible ? void 0 : true,
		"data-visible": visible,
		className: "rp-fab fixed bottom-[calc(var(--shell-tabs-height)+1.5rem+env(safe-area-inset-bottom))] left-3 z-(--z-bottom-nav) rounded-md border border-border shadow-lg lg:right-4 lg:bottom-12 lg:left-auto",
		onClick: () => scrollContentToTop(prefersReducedMotion() ? "auto" : "smooth"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, {})
	});
}
/**
* Measures the pressed button inside a `.rp-segmented` container and exposes its
* box as CSS variables, so the highlight slides between options.
*/
function useSlidingHighlight(activeKey) {
	const ref = (0, import_react.useRef)(null);
	const measure = (0, import_react.useCallback)(() => {
		const box = ref.current;
		const active = box?.querySelector("[aria-pressed=\"true\"]");
		if (!box || !active) return;
		box.style.setProperty("--rp-seg-x", `${active.offsetLeft}px`);
		box.style.setProperty("--rp-seg-y", `${active.offsetTop}px`);
		box.style.setProperty("--rp-seg-w", `${active.offsetWidth}px`);
		box.style.setProperty("--rp-seg-h", `${active.offsetHeight}px`);
		box.style.setProperty("--rp-seg-on", "1");
		box.dataset.measured = "true";
	}, []);
	useIsoLayoutEffect(measure, [measure, activeKey]);
	(0, import_react.useEffect)(() => {
		window.addEventListener("resize", measure);
		return () => window.removeEventListener("resize", measure);
	}, [measure]);
	return ref;
}
/**
* Keeps removed list items on screen for one `--motion-base` while they slide
* out. The ghosts are decorative copies, so the real list can update at once.
*/
function useExitGhosts(ms = 200) {
	const [ghosts, setGhosts] = (0, import_react.useState)([]);
	const timer = (0, import_react.useRef)(void 0);
	(0, import_react.useEffect)(() => () => clearTimeout(timer.current), []);
	return [ghosts, (0, import_react.useCallback)((items) => {
		if (prefersReducedMotion() || items.length === 0) return;
		setGhosts(items);
		clearTimeout(timer.current);
		timer.current = setTimeout(() => setGhosts([]), ms);
	}, [ms])];
}
/** The one orange element in the shell. Colours come from the report tokens. */
function ReportButton({ className }) {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		variant: "report",
		className: cn("min-h-11 gap-2 rounded-xl px-4 font-semibold", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/report",
			search: { segment: void 0 },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { "aria-hidden": true }), t("shell.reportHazard")]
		})
	});
}
/** Desktop top bar (56px): flexible space, status chip, report. */
function DesktopTopBar({ status }) {
	const scrolled = useScrolled(4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		"data-testid": "shell-topbar",
		"data-scrolled": scrolled,
		className: "rp-shell rp-topbar sticky top-0 z-(--z-header) flex h-14 shrink-0 items-center gap-3 border-b px-4 text-shell-text max-lg:hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, { status }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportButton, {})
		]
	});
}
/** Mobile top bar (56px): logo, search icon, language, status dot, avatar. */
function MobileTopBar({ status, section, onOpenLogin, onOpenSearch }) {
	const { t, lang, setLang } = usePrefs();
	const session = useAccountSession();
	const signedIn = session.status === "authenticated";
	const initial = (session.status === "authenticated" && session.email ? session.email : "?").charAt(0).toUpperCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		"data-testid": "shell-mobilebar",
		className: "rp-shell sticky top-0 z-(--z-header) flex h-14 shrink-0 items-center gap-1 border-b glass-strong px-3 text-shell-text lg:hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShellLogo, {
				className: "min-w-0 shrink",
				wordmarkClassName: "min-w-0 truncate max-sm:text-base max-390:hidden"
			}),
			section ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				"data-testid": "shell-section",
				className: "m-0 min-w-0 truncate font-display text-base font-semibold max-sm:sr-only",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "sr-only",
					children: [t("nav.section"), ": "]
				}), t(section)]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "ghost",
				size: "icon",
				"aria-label": t("shell.checkRoad"),
				className: "shrink-0 text-shell-text",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/traveller",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { "aria-hidden": true })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-label": t("shell.language"),
					className: "rp-shell-transition inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1 rounded-md px-2 text-sm font-medium text-shell-text hover:bg-shell-surface",
					children: [lang === "en" ? "EN" : "हिन्दी", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
						"aria-hidden": true,
						className: "size-4 max-sm:hidden"
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
				align: "end",
				className: "rp-shell text-shell-text",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuRadioGroup, {
					value: lang,
					onValueChange: (value) => setLang(value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioItem, {
						value: "en",
						className: ITEM,
						children: "English"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioItem, {
						value: "hi",
						lang: "hi",
						className: ITEM,
						children: "हिन्दी"
					})]
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, {
				status,
				compact: true
			}),
			signedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountMenu, {
				status,
				onOpenSearch,
				pageLinks: true,
				trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": t("shell.accountMenu"),
					className: "rp-shell-transition grid min-h-11 min-w-11 shrink-0 place-items-center rounded-md text-shell-text hover:bg-shell-surface",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						className: "grid size-8 place-items-center rounded-full bg-shell-raised text-sm font-semibold",
						children: initial
					})
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountMenu, {
				status,
				onOpenLogin,
				onOpenSearch,
				pageLinks: true,
				trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "icon",
					"aria-label": t("shell.accountMenu"),
					className: "shrink-0 text-shell-text",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { "aria-hidden": true })
				})
			})
		]
	});
}
/** Mobile bottom tabs. Fixed, with the safe-area inset below. */
function BottomTabs({ active, onGuard }) {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		"aria-label": t("nav.primary"),
		"data-testid": "shell-tabs",
		className: "rp-shell glass-strong fixed inset-x-0 bottom-0 z-(--z-bottom-nav) rounded-t-3xl border-x-0 border-b-0 pb-[env(safe-area-inset-bottom)] text-shell-text lg:hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "m-0 flex h-16 list-none items-end justify-around p-0 px-1",
			children: TAB_NAV.map((item) => {
				const Icon = item.icon;
				const isActive = active === item.to;
				const label = t(item.label);
				if (item.primaryAction) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "flex flex-1 justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/report",
						search: { segment: void 0 },
						"aria-label": t("shell.reportAHazard"),
						"aria-current": isActive ? "page" : void 0,
						className: "-mt-5 grid size-14 place-items-center self-start rounded-lg bg-report text-report-foreground shadow-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							"aria-hidden": true,
							className: "size-7"
						})
					})
				}, item.to);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						"aria-current": isActive ? "page" : void 0,
						onClick: (event) => {
							if (item.requiresSignIn && onGuard(item.to)) event.preventDefault();
						},
						className: cn("rp-shell-transition relative flex min-h-14 min-w-11 flex-col items-center justify-center gap-0.5 text-xs text-shell-text", isActive ? "font-semibold" : "font-medium"),
						children: [
							isActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"aria-hidden": true,
								"data-testid": "tab-active-bar",
								className: "absolute inset-x-4 top-0 h-0.5 rounded-full bg-shell-active-bar"
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								"aria-hidden": true,
								className: "size-5"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label })
						]
					})
				}, item.to);
			})
		})
	});
}
/**
* Rail collapsed state, remembered in localStorage. Read after mount so the
* server and first client render match (expanded), like useLocalState.
*/
function useRailCollapsed() {
	const [collapsed, setCollapsed] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setCollapsed(readLocal(RAIL_COLLAPSED_KEY, false) === true);
	}, []);
	return {
		collapsed,
		toggle: (0, import_react.useCallback)(() => {
			setCollapsed((current) => {
				writeLocal(RAIL_COLLAPSED_KEY, !current);
				return !current;
			});
		}, [])
	};
}
/**
* Where a sign-in-only destination goes when the visitor is signed out: the
* existing sign-in dialog opens and, once a session exists, navigation
* continues to the original route. A signed-in visitor navigates directly.
*/
function useGuardedNavigate(openLogin) {
	const navigate = useNavigate();
	const session = useAccountSession();
	const [returnTo, setReturnTo] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (returnTo && session.status === "authenticated") {
			navigate({ to: returnTo });
			setReturnTo(null);
		}
	}, [
		returnTo,
		session.status,
		navigate
	]);
	return {
		requestSignIn: (0, import_react.useCallback)((to) => {
			if (session.status === "authenticated") return false;
			setReturnTo(to);
			openLogin();
			return true;
		}, [session.status, openLogin]),
		cancelReturn: (0, import_react.useCallback)(() => {
			if (getAccountSession().status !== "authenticated") setReturnTo(null);
		}, []),
		pendingReturn: returnTo
	};
}
/** True for Ctrl+K, or Cmd+K on a Mac keyboard. */
function isSearchShortcut(event) {
	return (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "k";
}
/**
* The one app shell for every route: a left rail and top bar from 1024px up,
* a top bar and bottom tabs below. Page content renders in `children`.
*/
function AppShell({ children, footer }) {
	const { pathname, view } = useRouterState({ select: (state) => ({
		pathname: state.location.pathname,
		view: state.location.search.view
	}) });
	const active = activeNavTarget(pathname, view);
	const section = sectionLabel(pathname, active);
	const status = useShellStatus();
	const { collapsed, toggle } = useRailCollapsed();
	const [loginOpen, setLoginOpen] = (0, import_react.useState)(false);
	const loginReturnRef = (0, import_react.useRef)(null);
	const openLogin = (0, import_react.useCallback)(() => {
		const opener = document.activeElement;
		loginReturnRef.current = opener instanceof HTMLButtonElement ? opener : null;
		setLoginOpen(true);
	}, []);
	const { requestSignIn, cancelReturn } = useGuardedNavigate(openLogin);
	const [statusOpen, setStatusOpen] = (0, import_react.useState)(false);
	const [paletteOpen, setPaletteOpen] = (0, import_react.useState)(false);
	const paletteReturnRef = (0, import_react.useRef)(null);
	const searchRef = (0, import_react.useRef)(null);
	const isMap = pathname === "/map";
	const openPalette = (0, import_react.useCallback)(() => {
		if (document.activeElement instanceof HTMLElement) paletteReturnRef.current = document.activeElement;
		setPaletteOpen(true);
	}, []);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			if (!isSearchShortcut(event) || event.repeat || paletteOpen) return;
			event.preventDefault();
			const field = searchRef.current;
			if (field && field.offsetParent !== null) {
				field.focus();
				field.select();
				return;
			}
			openPalette();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [paletteOpen, openPalette]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rp-shell flex min-h-svh overflow-x-clip text-shell-text",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rail, {
				active,
				collapsed,
				onToggle: toggle,
				status,
				onGuard: requestSignIn,
				onOpenLogin: openLogin,
				onOpenSearch: openPalette,
				searchRef
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("flex min-w-0 flex-1 flex-col pb-[calc(var(--shell-tabs-height)+env(safe-area-inset-bottom))] lg:pb-0", isMap && "h-svh overflow-hidden"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileTopBar, {
						status,
						section,
						onOpenLogin: openLogin,
						onOpenSearch: openPalette
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesktopTopBar, { status }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShellStatusBanner, {
						status,
						onOpenDetails: () => setStatusOpen(true)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						id: "main",
						"aria-busy": "true",
						className: cn("min-w-0 flex-1 text-foreground", isMap && "rp-shell-map flex min-h-0 flex-col"),
						children
					}),
					footer
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomTabs, {
				active,
				onGuard: requestSignIn
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusDetailsDialog, {
				open: statusOpen,
				onOpenChange: setStatusOpen,
				status
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureSearchModal, {
				open: paletteOpen,
				onOpenChange: setPaletteOpen,
				returnFocusRef: paletteReturnRef,
				shortcutEnabled: false
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginDialog, {
				open: loginOpen,
				onOpenChange: (open) => {
					setLoginOpen(open);
					if (!open) cancelReturn();
				},
				returnFocusRef: loginReturnRef
			})
		]
	});
}
var FOOTER_LINKS = [
	[
		"footer.about",
		"/about",
		void 0
	],
	[
		"footer.privacy",
		"/about",
		"privacy"
	],
	[
		"footer.terms",
		"/about",
		"terms"
	],
	[
		"footer.accessibility",
		"/about",
		"accessibility"
	],
	[
		"footer.contact",
		"/contact",
		void 0
	],
	[
		"nav.myReports",
		"/reports",
		void 0
	],
	[
		"footer.contributions",
		"/contributions",
		void 0
	],
	[
		"footer.status",
		"/status",
		void 0
	]
];
/** Page footer (unchanged content; it moved out of the old site chrome). */
function SiteFooter() {
	const { t } = usePrefs();
	const signedIn = useAccountSession().status === "authenticated";
	const items = FOOTER_LINKS.filter(([, to]) => to !== "/reports" || signedIn);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		"data-reveal": true,
		className: "glass rounded-t-3xl border-x-0 border-b-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rp-container flex flex-col gap-6 py-10 md:flex-row md:items-start md:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-sm space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: t("footer.tagline")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: t("footer.note")
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"aria-label": t("nav.footer"),
				className: "flex flex-wrap gap-x-5 gap-y-1",
				children: items.map(([key, to, hash]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to,
					hash,
					className: "inline-flex min-h-11 items-center text-sm text-muted-foreground hover:text-foreground",
					children: t(key)
				}, key))
			})]
		})
	});
}
var BOOT_SESSION_KEY = "rp.loading.shown";
function BootScreen({ state = "loading" }) {
	const failed = state === "error";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		id: "rp-boot",
		className: "rp-boot",
		role: "status",
		"data-state": state,
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-boot-loading": true,
			hidden: failed,
			className: "rp-boot-body",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {
				variant: "full",
				decorative: true,
				className: "rp-boot-logo"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Loading RaahPrahari"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-boot-error": true,
			hidden: !failed,
			className: "rp-boot-body rp-boot-error",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {
					variant: "mark",
					decorative: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "rp-boot-title",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							lang: "en",
							children: "RaahPrahari could not load."
						}),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							lang: "hi",
							children: "RaahPrahari लोड नहीं हो सका।"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"data-boot-reload": true,
					className: "rp-boot-reload",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							lang: "en",
							children: "Reload"
						}),
						" / ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							lang: "hi",
							children: "पुनः लोड करें"
						})
					]
				})
			]
		})]
	});
}
/**
* Runs before hydration. Sets the start screen's phase on `data-phase`
* (pending, shown, leaving, gone), applies the once-per-session rule and the
* 800ms cap, switches to the error state if a script fails to load (or the
* app has not hydrated after 15s), and wires the Reload button. It listens for
* `rp-boot-ready` from BootGate and announces `rp-boot-done` once hidden.
* Plain ES5 on purpose; sessionStorage and matchMedia can throw, so both are guarded.
*/
var bootGuardScript = `(function(){var b=document.getElementById('rp-boot');if(!b)return;
var K='${BOOT_SESSION_KEY}',seen=false,rm=false,ready=false,done=false,leaving=false,timers=[];
try{seen=window.sessionStorage.getItem(K)==='1';window.sessionStorage.setItem(K,'1');}catch(x){}
try{rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(x){}
function clear(){for(var i=0;i<timers.length;i++)window.clearTimeout(timers[i]);timers=[];}
function gone(){clear();done=true;if(b.getAttribute('data-state')!=='error')b.setAttribute('data-phase','gone');window.dispatchEvent(new Event('rp-boot-done'));}
function hide(){if(done||leaving)return;clear();if(rm||b.getAttribute('data-phase')!=='shown'){gone();return;}leaving=true;b.setAttribute('data-phase','leaving');timers.push(window.setTimeout(gone,250));}
function fail(){clear();done=true;b.removeAttribute('data-phase');b.setAttribute('data-state','error');var l=b.querySelector('[data-boot-loading]'),e=b.querySelector('[data-boot-error]'),m=document.getElementById('main');if(l)l.hidden=true;if(e)e.hidden=false;if(m)m.removeAttribute('aria-busy');}
if(seen){gone();}else{b.setAttribute('data-phase','pending');timers.push(window.setTimeout(function(){if(!done&&!leaving)b.setAttribute('data-phase','shown');},300));timers.push(window.setTimeout(hide,800));}
window.addEventListener('rp-boot-ready',function(){ready=true;hide();});
window.setTimeout(function(){if(!ready&&document.getElementById('rp-boot'))fail();},15000);
window.addEventListener('error',function(ev){var t=ev.target;if(t&&t.tagName==='SCRIPT')fail();},true);
b.addEventListener('click',function(ev){var t=ev.target;if(t&&t.closest&&t.closest('[data-boot-reload]'))location.reload();});
})();`;
function subscribeToBootDone(onStoreChange) {
	window.addEventListener("rp-boot-done", onStoreChange);
	return () => window.removeEventListener("rp-boot-done", onStoreChange);
}
/** Done once the start screen has gone, or when there is none to show. */
function getBootDone() {
	const boot = document.getElementById("rp-boot");
	return !boot || boot.getAttribute("data-phase") === "gone";
}
/**
* Keeps the start screen in the DOM while it fades, then removes it. On mount
* (hydration) it clears the busy state and tells the guard script the app is
* ready. Mounted once by the root, so route changes never bring it back.
*/
function BootGate() {
	const done = (0, import_react.useSyncExternalStore)(subscribeToBootDone, getBootDone, () => false);
	(0, import_react.useEffect)(() => {
		document.getElementById("main")?.removeAttribute("aria-busy");
		window.dispatchEvent(new Event("rp-boot-ready"));
	}, []);
	if (done) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootScreen, {});
}
/** Slim top bar for route changes. Appears only if a navigation takes longer than ~150ms. */
function RouteProgress() {
	if (!useRouterState({ select: (s) => s.isLoading || s.status === "pending" })) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"aria-hidden": "true",
		className: "rp-route-progress"
	});
}
function AccountScopeBoundary({ children }) {
	const scope = (0, import_react.useSyncExternalStore)(subscribeAccountSession, getActiveAccountScope, () => "anonymous");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children }, scope);
}
/**
* Restores and follows the Supabase session after mount (browser only).
* The development receipt stub manages its own session, so Supabase is not
* connected while the stub is enabled.
*/
function AuthSessionBridge() {
	(0, import_react.useEffect)(() => {
		if (!isSupabaseConfigured()) return;
		let disconnect;
		try {
			disconnect = connectSupabaseSession(getSupabaseClient().auth);
		} catch (error) {
			console.error(error instanceof Error ? error.message : error);
		}
		return () => disconnect?.();
	}, []);
	return null;
}
function SyncProvider({ children }) {
	const session = useAccountSession();
	(0, import_react.useEffect)(() => {
		if (session.status !== "authenticated") return;
		const scope = getActiveAccountScope();
		let timer = null;
		let lastTriggerAt = 0;
		let disposed = false;
		setSyncState({ lastSuccessfulSyncAt: getLastSyncAt(scope) });
		const scheduleNextAttempt = async () => {
			if (timer) clearTimeout(timer);
			timer = null;
			try {
				const entries = await listOutbox(scope);
				if (disposed || getActiveAccountScope() !== scope) return;
				const times = entries.filter((entry) => entry.ownerUserId === session.userId && !entry.authBlocked && (entry.state === "pending" || entry.state === "failed")).map((entry) => entry.nextAttemptAt).filter((at) => at > Date.now());
				const nextAttemptAt = times.length ? Math.min(...times) : null;
				if (!times.length) {
					setSyncState({ nextAttemptAt });
					return;
				}
				setSyncState({ nextAttemptAt });
				timer = setTimeout(() => trigger("foreground"), Math.max(0, (nextAttemptAt ?? Date.now()) - Date.now()));
			} catch (error) {
				console.error("Unable to schedule the next report sync attempt", error);
			}
		};
		const trigger = (reason) => {
			if (disposed || getActiveAccountScope() !== scope) return;
			if (reason !== "startup" && reason !== "background" && document.visibilityState === "hidden") return;
			if (Date.now() - lastTriggerAt < 1e3) return;
			lastTriggerAt = Date.now();
			syncNow({ reason }).finally(() => void scheduleNextAttempt());
		};
		const onVisibilityChange = () => {
			if (document.visibilityState === "visible") trigger("foreground");
		};
		const onOnline = () => trigger("online");
		const onServiceWorkerMessage = (event) => {
			if (event.data?.type === "rp-sync") trigger("background");
		};
		const serviceWorker = "serviceWorker" in navigator ? navigator.serviceWorker : void 0;
		window.addEventListener("online", onOnline);
		document.addEventListener("visibilitychange", onVisibilityChange);
		serviceWorker?.addEventListener("message", onServiceWorkerMessage);
		const subscription = liveQuery(() => listOutbox(scope)).subscribe({
			next: () => void scheduleNextAttempt(),
			error: (error) => console.error("Unable to observe the sync queue", error)
		});
		trigger("startup");
		return () => {
			disposed = true;
			if (timer) clearTimeout(timer);
			subscription.unsubscribe();
			window.removeEventListener("online", onOnline);
			document.removeEventListener("visibilitychange", onVisibilityChange);
			serviceWorker?.removeEventListener("message", onServiceWorkerMessage);
		};
	}, [session.status, session.userId]);
	return children;
}
var siteName = "RaahPrahari: Know before you go";
var siteDescription = "Check reported road hazards, information freshness, and official restrictions across Uttarakhand before your journey.";
var Route$27 = createRootRoute({
	head: ({ matches }) => {
		const title = matches.some((match) => match.status === "notFound" || match._notFound) ? "Page not found | RaahPrahari" : siteName;
		return {
			meta: [
				{ charSet: "utf-8" },
				{
					name: "viewport",
					content: "width=device-width, initial-scale=1"
				},
				{ title },
				{
					name: "description",
					content: siteDescription
				},
				{
					property: "og:title",
					content: title
				},
				{
					property: "og:description",
					content: siteDescription
				},
				{
					property: "og:type",
					content: "website"
				},
				{
					name: "twitter:card",
					content: "summary_large_image"
				},
				{
					name: "theme-color",
					content: "#07151f",
					media: "(prefers-color-scheme: dark)"
				},
				{
					name: "theme-color",
					content: "#e6e4dc",
					media: "(prefers-color-scheme: light)"
				}
			],
			links: [
				{
					rel: "manifest",
					href: "/manifest.webmanifest"
				},
				{
					rel: "icon",
					href: "/favicon.ico",
					sizes: "48x48"
				},
				{
					rel: "icon",
					type: "image/png",
					href: "/favicon-32.png",
					sizes: "32x32"
				},
				{
					rel: "apple-touch-icon",
					href: "/apple-touch-icon.png",
					sizes: "180x180"
				},
				{
					rel: "preconnect",
					href: "https://fonts.googleapis.com"
				},
				{
					rel: "preconnect",
					href: "https://fonts.gstatic.com",
					crossOrigin: "anonymous"
				},
				{
					rel: "stylesheet",
					href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&family=Noto+Sans+Devanagari:wght@400;600&display=swap"
				}
			]
		};
	},
	shellComponent: RootDocument,
	notFoundComponent: NotFoundPage
});
/** First focusable element: jumps past the rail and top bar to the page. */
function ShellSkipLink() {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipLink, { children: t("shell.skip") });
}
function RootDocument({ children }) {
	const { isHome, isTraveller, isMap, isHelp, isNotFound, isAdvisories, isReport, hasInlineRibbon } = useRouterState({ select: (state) => ({
		isReport: state.location.pathname.startsWith("/report"),
		hasInlineRibbon: state.location.pathname === "/contributions" || state.location.pathname === "/review" || state.location.pathname.startsWith("/review/"),
		isHome: state.location.pathname === "/",
		isTraveller: state.location.pathname === "/traveller",
		isMap: state.location.pathname === "/map",
		isHelp: state.location.pathname === "/help",
		isNotFound: state.matches.some((match) => match.status === "notFound" || match._notFound),
		isAdvisories: state.location.pathname === "/advisories" || state.location.pathname === "/advisories/"
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "dark",
		style: { colorScheme: "dark" },
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: themeBootScript } }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": "true",
				className: "rp-backdrop"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootGate, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: bootGuardScript } }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("noscript", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: "#rp-boot{display:none!important}" }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreferencesProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSessionBridge, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountScopeBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SyncProvider, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShellSkipLink, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTransition, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouteProgress, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RevealObserver, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackToTop, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
					footer: !isHome && !isTraveller && !isMap && !isHelp ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {}) : null,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnvBanner, {}),
						children,
						!isHome && !isTraveller && !isMap && !isHelp && !isNotFound && !isReport && !isAdvisories && !hasInlineRibbon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rp-demo-badge-ribbon pointer-events-none fixed right-2 bottom-[calc(var(--shell-tabs-height)+1.5rem+env(safe-area-inset-bottom))] left-16 z-(--z-bottom-nav) flex justify-end lg:bottom-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrototypeRibbon, {})
						})
					]
				})
			] }) })] }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	});
}
var $$splitComponentImporter$24 = () => import("./routes-C2CLq2Vm.mjs");
var Route$26 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$24, "component") });
/** Each feature opens the help topic that explains it (slugs from data/help-topics). */
/** The featured card shows this seeded segment and links to its detail page. */
/**
* The headline with one word picked out in orange gradient text. The text is
* unchanged (one node per part, read as one heading); only the styling differs.
*/
/** Hands the query to the traveller search (/traveller?q=), which does the matching. */
var $$splitComponentImporter$23 = () => import("./about-7EYGwGGe.mjs");
var Route$25 = createFileRoute("/about")({
	head: () => ({ meta: [{ title: "About | RaahPrahari" }] }),
	component: lazyRouteComponent($$splitComponentImporter$23, "component")
});
var $$splitComponentImporter$22 = () => import("./check-tK2Op4h0.mjs");
var Route$24 = createFileRoute("/check")({
	validateSearch: (s) => ({
		from: typeof s.from === "string" ? s.from : void 0,
		to: typeof s.to === "string" ? s.to : void 0,
		view: s.view === "list" ? "list" : s.view === "map" ? "map" : void 0,
		seg: typeof s.seg === "string" ? s.seg : void 0
	}),
	head: () => ({ meta: [{ title: "Check a road · RaahPrahari" }] }),
	component: lazyRouteComponent($$splitComponentImporter$22, "component")
});
var $$splitComponentImporter$21 = () => import("./contact-BMjq9sOW.mjs");
var Route$23 = createFileRoute("/contact")({
	head: () => ({ meta: [{ title: "Contact | RaahPrahari" }] }),
	component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
var $$splitComponentImporter$20 = () => import("./contributions-DDM7aNub.mjs");
var Route$22 = createFileRoute("/contributions")({
	head: () => ({ meta: [{ title: "Points and reputation | RaahPrahari" }] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./help-CceI5vcs.mjs");
var Route$21 = createFileRoute("/help")({
	head: () => ({ meta: [{ title: "Help & Safety Centre · RaahPrahari" }] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
var $$splitComponentImporter$18 = () => import("./map-CnlNaIzC.mjs");
var Route$20 = createFileRoute("/map")({
	validateSearch: (search) => ({
		seg: typeof search.seg === "string" ? search.seg : void 0,
		view: search.view === "list" ? "list" : search.view === "map" ? "map" : void 0
	}),
	head: () => ({ meta: [{ title: "Live map · RaahPrahari" }] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./official-dNW0j1on.mjs");
var Route$19 = createFileRoute("/official")({
	head: () => ({ meta: [{ title: "Official notice | RaahPrahari" }] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./profile-WRiT1-lO.mjs");
var Route$18 = createFileRoute("/profile")({
	head: () => ({ meta: [{ title: "Profile | RaahPrahari" }] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./report-BwByANGH.mjs");
var Route$17 = createFileRoute("/report")({
	validateSearch: (search) => ({ segment: typeof search.segment === "string" ? search.segment : void 0 }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./status-BoYulVSs.mjs");
var Route$16 = createFileRoute("/status")({
	head: () => ({ meta: [{ title: "System status | RaahPrahari" }] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./traveller-DQ4Nj4Vy.mjs");
var Route$15 = createFileRoute("/traveller")({
	validateSearch: (search) => ({
		q: typeof search.q === "string" ? search.q : void 0,
		from: typeof search.from === "string" ? search.from : void 0,
		to: typeof search.to === "string" ? search.to : void 0,
		view: search.view === "list" ? "list" : search.view === "map" ? "map" : void 0,
		seg: typeof search.seg === "string" ? search.seg : void 0
	}),
	head: () => ({ meta: [{ title: "Search roads · RaahPrahari" }] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./advisories.index-BdvQJcEz.mjs");
var Route$14 = createFileRoute("/advisories/")({
	head: () => ({ meta: [{ title: "Road advisories · RaahPrahari" }] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var reportByRef = (ref) => REPORTS.find((r) => r.ref === ref);
var $$splitComponentImporter$11 = () => import("./advisories._segmentId-DTaY8_-S.mjs");
var $$splitNotFoundComponentImporter = () => import("./advisories._segmentId-yulBLX9Z.mjs");
var $$splitErrorComponentImporter = () => import("./advisories._segmentId-BOBS-Pzw.mjs");
var Route$13 = createFileRoute("/advisories/$segmentId")({
	loader: ({ params }) => {
		const report = reportByRef(params.segmentId);
		if (report) {
			const segment = segmentById(report.segmentId);
			if (!segment) throw new Error(`Missing segment "${report.segmentId}" for report "${report.ref}"`);
			return {
				kind: "report",
				report,
				segment
			};
		}
		const segment = segmentById(params.segmentId);
		if (!segment) throw notFound();
		return {
			kind: "segment",
			segment
		};
	},
	head: ({ loaderData }) => ({ meta: [{ title: loaderData?.kind === "report" ? `${loaderData.report.ref} · RaahPrahari` : `${loaderData?.segment.code ?? "Road details"} · RaahPrahari` }] }),
	pendingComponent: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingState, {
		label: "Loading road information…",
		variant: "cards",
		className: "rp-container py-8"
	}),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent"),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
/** Report location: exact report coordinates are not shared, so the whole road section is shown. */
var $$splitComponentImporter$10 = () => import("./auth.callback-COuNsBgh.mjs");
var Route$12 = createFileRoute("/auth/callback")({
	head: () => ({ meta: [{ title: "Confirming your link | RaahPrahari" }] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./auth.reset-password-QSkkjoK5.mjs");
var Route$11 = createFileRoute("/auth/reset-password")({
	head: () => ({ meta: [{ title: "Set a new password | RaahPrahari" }] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./help._topic-Ckp6XELm.mjs");
var Route$10 = createFileRoute("/help/$topic")({
	loader: ({ params }) => {
		const topic = helpTopics.find(({ slug }) => slug === params.topic);
		if (!topic) throw notFound();
		return topic;
	},
	head: () => ({ meta: [{ title: "Help topic · RaahPrahari" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./report.index-C44jyfmB.mjs");
var Route$9 = createFileRoute("/report/")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./report.location-C_OWoaiC.mjs");
var Route$8 = createFileRoute("/report/location")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./report.photo-DAYzxVvq.mjs");
var Route$7 = createFileRoute("/report/photo")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./report.received-DR_KMiJd.mjs");
var Route$6 = createFileRoute("/report/received")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./report.review-dGwmyrpZ.mjs");
var Route$5 = createFileRoute("/report/review")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./reports.index-Dy9Ljid5.mjs");
var Route$4 = createFileRoute("/reports/")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
function deriveDeliveryStatus(outbox) {
	if (!outbox) return "saved_not_delivered";
	if (outbox.metadataReceipt && outbox.state === "received") return "server_received";
	if (outbox.state === "rejected") return "rejected";
	if (outbox.authBlocked) return "waiting_for_sign_in";
	if (outbox.state === "sending") return "sending";
	if (outbox.state === "failed") return "retrying";
	return "saved_not_delivered";
}
function DeliveryStepper({ draft, outbox, attachments = [], reviewOutcome }) {
	const { t } = usePrefs();
	const deliveryStatus = deriveDeliveryStatus(outbox);
	const attachmentSummary = (0, import_react.useMemo)(() => {
		if (!attachments.length) return {
			state: "not_applicable",
			label: t("report.noPhotos"),
			failed: false
		};
		const failed = attachments.some((attachment) => attachment.uploadState === "failed");
		const uploading = attachments.some((attachment) => attachment.uploadState === "uploading");
		const allUploaded = attachments.every((attachment) => attachment.uploadState === "uploaded");
		if (failed) return {
			state: "failed",
			label: t("sync.photoFailed"),
			failed: true
		};
		if (uploading) return {
			state: "uploading",
			label: t("sync.uploading"),
			failed: false
		};
		if (allUploaded) return {
			state: "uploaded",
			label: t("sync.uploaded"),
			failed: false
		};
		return {
			state: "pending",
			label: t("sync.photoPending"),
			failed: false
		};
	}, [attachments, t]);
	const stages = [
		{
			key: "saved",
			title: "Saved locally",
			status: draft?.savedAt ? new Date(draft.savedAt).toLocaleString() : "Saved locally",
			active: !outbox || deliveryStatus === "saved_not_delivered",
			done: Boolean(draft?.savedAt),
			icon: Save,
			failed: false
		},
		{
			key: "sending",
			title: "Sending",
			status: deliveryStatus === "waiting_for_sign_in" ? "Waiting for sign-in" : deliveryStatus === "rejected" ? `Rejected: ${outbox?.lastErrorMessage ?? "Report rejected"}` : deliveryStatus === "retrying" ? `Retrying at ${outbox?.nextAttemptAt ? new Date(outbox.nextAttemptAt).toLocaleString() : "soon"}` : deliveryStatus === "sending" ? "Sending…" : "Not delivered",
			active: [
				"sending",
				"retrying",
				"waiting_for_sign_in",
				"rejected",
				"saved_not_delivered"
			].includes(deliveryStatus),
			done: ["server_received"].includes(deliveryStatus),
			icon: CircleDashed,
			failed: deliveryStatus === "rejected"
		},
		{
			key: "received",
			title: "Server received",
			status: outbox?.metadataReceipt?.receiptId ? `Receipt ${outbox.metadataReceipt.receiptId}` : "Not delivered yet",
			active: deliveryStatus === "server_received" || !outbox?.metadataReceipt && deliveryStatus !== "saved_not_delivered",
			done: deliveryStatus === "server_received",
			icon: CircleCheck,
			failed: false
		},
		{
			key: "media",
			title: t("review.detail.photos"),
			status: attachmentSummary.label,
			active: attachmentSummary.state !== "not_applicable",
			done: attachmentSummary.state === "uploaded",
			icon: CloudUpload,
			failed: attachmentSummary.failed
		}
	];
	const reviewStage = reviewOutcome ? {
		key: "review",
		title: "Review",
		status: reviewOutcome,
		active: false,
		done: true,
		icon: ShieldAlert,
		failed: false
	} : null;
	const finalStages = reviewStage ? [...stages, reviewStage] : stages;
	const activeIndex = finalStages.findIndex((stage) => stage.active);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "grid gap-3",
			"aria-label": "Delivery stages",
			children: finalStages.map((stage, index) => {
				const Icon = stage.icon;
				const isActive = index === activeIndex;
				const isFailed = stage.failed;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "relative",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: [
							"flex h-full min-h-32 flex-col gap-2 rounded-xl border p-3",
							isActive ? "border-action-info bg-action-info/5" : "glass",
							isFailed ? "border-destructive/60 bg-destructive/5" : ""
						].join(" "),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										"aria-hidden": true,
										className: "size-4"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-medium",
										children: stage.title
									})]
								}), isActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									className: "text-xs text-muted-foreground",
									children: "Current"
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm",
								role: isFailed ? "alert" : void 0,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-current": isActive ? "step" : void 0,
									children: stage.status
								})
							}),
							stage.key === "received" && !outbox?.metadataReceipt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: t("sync.notDeliveredYet")
							}) : null,
							reviewStage && stage.key === "review" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Received and reviewed do not mean the hazard is verified or confirmed, and neither creates an official road closure."
							}) : null
						]
					})
				}, stage.key);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-live": "polite",
			className: "sr-only",
			children: finalStages[activeIndex]?.status ?? "Delivery status updated"
		})]
	});
}
/** Loading skeleton: role="status", same card shapes as the lists it replaces. */
function ScreenLoading() {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid justify-items-center gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {
			variant: "mark",
			decorative: true,
			className: "motion-safe:animate-pulse"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingState, {
			variant: "cards",
			label: t("state.loading"),
			className: "w-full"
		})]
	});
}
/** Error with a retry action: role="alert". */
function ScreenError({ onRetry }) {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
		title: t("state.errorTitle"),
		message: t("state.errorBody"),
		retryLabel: t("state.retry"),
		onRetry
	});
}
/** Empty state: role="status". Empty never implies the road is clear. */
function ScreenEmpty({ title, message }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "status",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title,
			message
		})
	});
}
var Route$3 = createFileRoute("/reports/$id")({ component: ReportsDetailPage });
function ReportsDetailPage() {
	const { id } = Route$3.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportDetailView, { id });
}
/** Local, account-scoped report detail. Exported for tests. */
function ReportDetailView({ id }) {
	const scope = getActiveAccountScope();
	const key = `${scope}|${id}`;
	const [loaded, setLoaded] = (0, import_react.useState)(null);
	const state = loaded?.key === key ? loaded.state : { status: "loading" };
	const [receiptEvents, setReceiptEvents] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		const subscription = observeReportDetail(id, scope, (detail) => setLoaded({
			key: `${scope}|${id}`,
			state: detail ? {
				status: "ready",
				detail
			} : { status: "missing" }
		}), () => setLoaded({
			key: `${scope}|${id}`,
			state: { status: "error" }
		}));
		return () => subscription.unsubscribe();
	}, [id, scope]);
	(0, import_react.useEffect)(() => {
		if (!id || scope === "anonymous") return;
		let active = true;
		listReceiptEvents(id, scope).then((events) => {
			if (active) setReceiptEvents(events);
		});
		return () => {
			active = false;
		};
	}, [id, scope]);
	if (state.status === "loading") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenLoading, {});
	if (state.status === "error") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenError, { onRetry: () => window.location.reload() });
	if (state.status === "missing") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotFoundPage, {});
	const { draft, outbox, attachments } = state.detail;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Private detail"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "rp-page-title",
					children: ["Report #", draft.id.slice(0, 8)]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-[1.5fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass rounded-2xl border border-border p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-3 font-semibold",
							children: "Observation"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-3 whitespace-pre-wrap text-sm text-muted-foreground",
							children: draft.payload.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "grid gap-2 text-sm sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: "Hazard"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-medium",
								children: draft.payload.hazardType || "Not specified"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: "Observed"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: draft.observedAtLocal || draft.eventTime || "Unknown" })] })]
						}),
						draft.payload.photo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass mt-4 rounded-xl border border-border p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "Photo evidence"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: draft.payload.photo.name
							})]
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "glass rounded-2xl border border-border p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-4 font-semibold",
						children: "Delivery status"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeliveryStepper, {
						draft,
						outbox,
						attachments
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "glass mt-8 rounded-2xl border border-border p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 font-semibold",
					children: "Receipt history"
				}), receiptEvents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No receipt history is available for this report."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "space-y-3",
					children: receiptEvents.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "glass rounded-xl border border-border p-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium capitalize",
									children: event.type.replace(/_/g, " ")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: new Date(event.at).toLocaleString()
								})]
							}),
							event.detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-muted-foreground",
								children: event.detail
							}) : null,
							event.receiptId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-xs",
								children: event.receiptId
							}) : null
						]
					}, event.id ?? `${event.type}-${event.at}`))
				})]
			})
		]
	});
}
var $$splitComponentImporter$1 = () => import("./review.index-CnULixC0.mjs");
var Route$2 = createFileRoute("/review/")({
	validateSearch: (search) => parseQueueSearch(search, REVIEW_HAZARDS),
	head: () => ({ meta: [{ title: "Review queue | RaahPrahari" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./review._ref-CgLr6YNB.mjs");
var Route$1 = createFileRoute("/review/$ref")({
	loader: ({ params }) => {
		if (!REPORTS.some((report) => report.ref === params.ref)) throw notFound();
		return { ref: params.ref };
	},
	head: ({ params }) => ({ meta: [{ title: `${params.ref} · Review | RaahPrahari` }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$26.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$27
});
var AboutRoute = Route$25.update({
	id: "/about",
	path: "/about",
	getParentRoute: () => Route$27
});
var CheckRoute = Route$24.update({
	id: "/check",
	path: "/check",
	getParentRoute: () => Route$27
});
var ContactRoute = Route$23.update({
	id: "/contact",
	path: "/contact",
	getParentRoute: () => Route$27
});
var ContributionsRoute = Route$22.update({
	id: "/contributions",
	path: "/contributions",
	getParentRoute: () => Route$27
});
var HelpRoute = Route$21.update({
	id: "/help",
	path: "/help",
	getParentRoute: () => Route$27
});
var MapRoute = Route$20.update({
	id: "/map",
	path: "/map",
	getParentRoute: () => Route$27
});
var OfficialRoute = Route$19.update({
	id: "/official",
	path: "/official",
	getParentRoute: () => Route$27
});
var ProfileRoute = Route$18.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => Route$27
});
var ReportRoute = Route$17.update({
	id: "/report",
	path: "/report",
	getParentRoute: () => Route$27
});
var StatusRoute = Route$16.update({
	id: "/status",
	path: "/status",
	getParentRoute: () => Route$27
});
var TravellerRoute = Route$15.update({
	id: "/traveller",
	path: "/traveller",
	getParentRoute: () => Route$27
});
var AdvisoriesIndexRoute = Route$14.update({
	id: "/advisories/",
	path: "/advisories/",
	getParentRoute: () => Route$27
});
var AdvisoriesSegmentIdRoute = Route$13.update({
	id: "/advisories/$segmentId",
	path: "/advisories/$segmentId",
	getParentRoute: () => Route$27
});
var AuthCallbackRoute = Route$12.update({
	id: "/auth/callback",
	path: "/auth/callback",
	getParentRoute: () => Route$27
});
var AuthResetPasswordRoute = Route$11.update({
	id: "/auth/reset-password",
	path: "/auth/reset-password",
	getParentRoute: () => Route$27
});
var HelpTopicRoute = Route$10.update({
	id: "/$topic",
	path: "/$topic",
	getParentRoute: () => HelpRoute
});
var ReportIndexRoute = Route$9.update({
	id: "/",
	path: "/",
	getParentRoute: () => ReportRoute
});
var ReportLocationRoute = Route$8.update({
	id: "/location",
	path: "/location",
	getParentRoute: () => ReportRoute
});
var ReportPhotoRoute = Route$7.update({
	id: "/photo",
	path: "/photo",
	getParentRoute: () => ReportRoute
});
var ReportReceivedRoute = Route$6.update({
	id: "/received",
	path: "/received",
	getParentRoute: () => ReportRoute
});
var ReportReviewRoute = Route$5.update({
	id: "/review",
	path: "/review",
	getParentRoute: () => ReportRoute
});
var ReportsIndexRoute = Route$4.update({
	id: "/reports/",
	path: "/reports/",
	getParentRoute: () => Route$27
});
var ReportsIdRoute = Route$3.update({
	id: "/reports/$id",
	path: "/reports/$id",
	getParentRoute: () => Route$27
});
var ReviewIndexRoute = Route$2.update({
	id: "/review/",
	path: "/review/",
	getParentRoute: () => Route$27
});
var ReviewRefRoute = Route$1.update({
	id: "/review/$ref",
	path: "/review/$ref",
	getParentRoute: () => Route$27
});
var HelpRouteChildren = { HelpTopicRoute };
var HelpRouteWithChildren = HelpRoute._addFileChildren(HelpRouteChildren);
var ReportRouteChildren = {
	ReportLocationRoute,
	ReportPhotoRoute,
	ReportReceivedRoute,
	ReportReviewRoute,
	ReportIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AboutRoute,
	CheckRoute,
	ContactRoute,
	ContributionsRoute,
	HelpRoute: HelpRouteWithChildren,
	MapRoute,
	OfficialRoute,
	ProfileRoute,
	ReportRoute: ReportRoute._addFileChildren(ReportRouteChildren),
	StatusRoute,
	TravellerRoute,
	AdvisoriesSegmentIdRoute,
	AuthCallbackRoute,
	AuthResetPasswordRoute,
	ReportsIdRoute,
	ReviewRefRoute,
	AdvisoriesIndexRoute,
	ReportsIndexRoute,
	ReviewIndexRoute
};
var routeTree = Route$27._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	return createRouter({
		routeTree,
		defaultErrorComponent: RouteErrorPage,
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
export { AUTH_ERROR_KEYS, ActionBadge, AdvisoryBadge, CacheTimeLabel, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, FreshnessChip, LEVEL_META, LoginDialog, Logo, NewPasswordForm, OfficialBadge, PrototypeRibbon, QUEUES, REVIEW_HAZARDS, RoadCode, Route$1, Route$10, Route$13, Route$15, Route$2, Route$20, Route$24, Route$9, RouteErrorPage, SEEDED_ASSIGNMENTS, SETTLED_OUTCOMES, SEVERITIES, ScreenEmpty, ScreenError, ScreenLoading, SignOutButton, SkeletonList, assignmentOf, buildQueue, canClaim, completeAuthCallback, defaultSort, deriveDeliveryStatus, findSeededRoutes, getActiveAccountScope, getLastSubmittedReportId, getTransportSource, helpTopics, isPending, listReportsForScope, loadActiveDraft, loadAttachmentBlob, newReportId, observeSubmittedReport, queueCounts, queueReportForSync, relatedReports, removeAttachment, retryAttachmentUpload, routeLabel, router_exports, saveAttachment, saveDraft, scrollContentToTop, syncNow, useExitGhosts, useOnlineStatus, useSlidingHighlight, useSyncState, useSystemStatus };
