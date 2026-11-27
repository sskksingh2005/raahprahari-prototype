import { __toESM } from "../_runtime.mjs";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase-C8XFUyW6.mjs";
import { LANE_DIRECTIONS, OBSERVATION_SOURCES, PLACES, REPORT_HAZARDS, SEGMENTS, VEHICLE_APPLICABILITY, createEmptyReportDraft, decodeReportPhoto, observationExtras, photoValidationCode, placeById, readReportDraft, toLocalDateTime, usePrefs, validateHazardType, validateObservation, withObservationDefaults, writeReportDraft } from "./preferences-BoWpYuS4.mjs";
import { require_react } from "../_libs/react.mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { ArrowLeft, ArrowRight, CircleCheck, CircleQuestionMark, Save, Search, ShieldAlert, TriangleAlert, X } from "../_libs/lucide-react3.mjs";
import { Camera } from "../_libs/lucide-react7.mjs";
import { CarFront, Construction, ImagePlus, RefreshCw, Send, Sparkles, TreePine, WavesHorizontal, Wind } from "../_libs/lucide-react8.mjs";
import { Check } from "../_libs/lucide-react9.mjs";
import { CircleAlert } from "../_libs/lucide-react11.mjs";
import { Clock3 } from "../_libs/lucide-react14.mjs";
import { LoaderCircle } from "../_libs/lucide-react24.mjs";
import { MapPin } from "../_libs/lucide-react28.mjs";
import { Mountain } from "../_libs/lucide-react29.mjs";
import { RotateCcw } from "../_libs/lucide-react30.mjs";
import { Button } from "./button-BwhNanlJ.mjs";
import { getAccountSession } from "./account-session-Cz43bjtr.mjs";
import { Label } from "./field-Ds5sKygr.mjs";
import { Input } from "./input-BPLX6SV6.mjs";
import { deriveDeliveryStatus, getActiveAccountScope, getLastSubmittedReportId, getTransportSource, loadActiveDraft, loadAttachmentBlob, newReportId, observeSubmittedReport, queueReportForSync, removeAttachment, retryAttachmentUpload, saveAttachment, saveDraft, scrollContentToTop, syncNow, useSyncState } from "./router-ip9NLZv6.mjs";
import { getCurrentPosition, inCoverage, segmentCandidates } from "./geo-Bmmso9Kl.mjs";
import { OSM_ATTRIBUTION, OSM_TILE_URL, loadLeaflet } from "./leaflet-segment-map-CSIxfagM.mjs";
import { Textarea } from "./textarea-DnhVosJ1.mjs";
import { RadioGroup, RadioGroupItem } from "./radio-group-0svYIRBF.mjs";
import { tt } from "../_libs/exifr.mjs";
// node_modules/.nitro/vite/services/ssr/assets/report-step-page-DxVRkcCI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DeliveryStatusBadge({ outbox }) {
	const { t } = usePrefs();
	const status = deriveDeliveryStatus(outbox);
	const content = {
		server_received: {
			label: t("sync.received"),
			Icon: CircleCheck
		},
		rejected: {
			label: t("sync.rejected").replace("{reason}", outbox?.lastErrorMessage ?? ""),
			Icon: ShieldAlert
		},
		waiting_for_sign_in: {
			label: t("sync.signInToContinue"),
			Icon: CircleAlert
		},
		sending: {
			label: t("sync.sendingStatus"),
			Icon: LoaderCircle
		},
		retrying: {
			label: t("sync.retryingAt").replace("{time}", new Date(outbox?.nextAttemptAt ?? 0).toLocaleString()),
			Icon: Clock3
		},
		saved_not_delivered: {
			label: t("sync.savedNotDelivered"),
			Icon: Save
		}
	}[status];
	const Icon = content.Icon;
	const receipt = outbox?.metadataReceipt?.receiptId;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "inline-flex max-w-full items-center gap-2 rounded-full border border-border px-3 py-1 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				"aria-hidden": true,
				className: "size-4 shrink-0"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: content.label })]
		}), status === "server_received" && receipt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "max-w-full break-all font-mono text-xs text-muted-foreground",
			children: [
				t("sync.receiptId"),
				": ",
				receipt
			]
		}) : null]
	});
}
function useLocalSaveStatus() {
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [savedAt, setSavedAt] = (0, import_react.useState)(null);
	const [errorCode, setErrorCode] = (0, import_react.useState)(null);
	return {
		status,
		savedAt,
		errorCode,
		setSaving: (0, import_react.useCallback)(() => {
			setStatus("saving");
			setErrorCode(null);
		}, []),
		setSaved: (0, import_react.useCallback)((nextSavedAt) => {
			setSavedAt(nextSavedAt);
			setStatus("saved_locally");
			setErrorCode(null);
		}, []),
		setError: (0, import_react.useCallback)((code) => {
			setErrorCode(code);
			setStatus("error");
		}, []),
		reset: (0, import_react.useCallback)(() => {
			setStatus("idle");
			setSavedAt(null);
			setErrorCode(null);
		}, [])
	};
}
function LocalSaveStatus({ status, savedAt, errorCode, onRetry }) {
	const { t } = usePrefs();
	if (status === "idle") return null;
	if (status === "saving") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "status",
		"aria-live": "polite",
		className: "mt-3 inline-flex items-center gap-2 rounded-xl border border-status-caution/50 bg-status-caution/10 px-3 py-2 text-sm font-medium text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, {
			"aria-hidden": true,
			className: "size-4 text-status-caution"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("saveStatus.saving") })]
	});
	if (status === "saved_locally") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "status",
		"aria-live": "polite",
		className: "mt-3 rounded-xl border border-status-clear/50 bg-status-clear/10 p-3 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2 font-medium text-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
					"aria-hidden": true,
					className: "size-4 text-status-clear"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("saveStatus.savedLocally") }),
				savedAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: new Date(savedAt).toLocaleTimeString([], {
						hour: "numeric",
						minute: "2-digit"
					})
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-muted-foreground",
			children: t("saveStatus.notDelivered")
		})]
	});
	const errorMessage = errorCode === "quota_exceeded" ? t("saveStatus.errorQuota") : errorCode === "storage_unavailable" ? t("saveStatus.errorUnavailable") : t("saveStatus.errorGeneric");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "alert",
		"aria-live": "assertive",
		className: "mt-3 rounded-xl border border-status-dnt/60 bg-status-dnt/10 p-3 text-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
				"aria-hidden": true,
				className: "mt-0.5 size-4 text-status-dnt"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium text-foreground",
					children: errorMessage
				}), onRetry ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onRetry,
					className: "mt-2 inline-flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 font-medium hover:bg-accent",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
						"aria-hidden": true,
						className: "size-4"
					}), t("saveStatus.retry")]
				}) : null]
			})]
		})
	});
}
function resultMessage(result, t) {
	if (result.status === "signed_out") return t("sync.signedOut");
	if (result.status === "offline") return t("sync.offline");
	if (result.status === "not_configured") return t("sync.notConfigured");
	if (result.status === "nothing_to_send") return t("sync.nothingToSend");
	if (result.status === "complete") return result.received ? t("sync.receivedCount").replace("{count}", `${result.received}`) : t("sync.nothingToSend");
	if (result.status === "error") return t(result.message.includes("account changed") ? "sync.accountChanged" : "sync.resultError");
	return t("sync.sending");
}
/**
* Hidden when no transport exists: pressing it could only ever report "not
* configured", so it would be a button that does nothing. The delivery badge
* next to it already says the report is saved on this device.
*/
function SyncNowButton() {
	if (getTransportSource() === "none") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SyncNowControl, {});
}
function SyncNowControl() {
	const { t } = usePrefs();
	const { running } = useSyncState();
	const [result, setResult] = (0, import_react.useState)(null);
	const failed = result?.status === "error";
	const sync = async () => {
		setResult(await syncNow({ reason: "manual" }));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			className: "w-full sm:w-auto",
			onClick: () => void sync(),
			disabled: running,
			"aria-busy": running,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
				"aria-hidden": true,
				className: `size-4 ${running ? "animate-spin" : ""}`
			}), running ? t("sync.sending") : t("sync.now")]
		}), running ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "status",
			"aria-live": "polite",
			className: "text-sm text-muted-foreground",
			children: t("sync.sending")
		}) : result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: failed ? "alert" : "status",
			"aria-live": failed ? "assertive" : "polite",
			className: `break-words text-sm ${failed ? "text-status-dnt" : "text-muted-foreground"}`,
			children: resultMessage(result, t)
		}) : null]
	});
}
/**
* Removes obvious personal data from a free-text description before it leaves
* the device for AI extraction. This is a best-effort filter for common
* patterns, not a guarantee that no personal data remains.
*/
var REDACTED = "[removed]";
var EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
var PHONE = /(?:\+|\()?\d[\d\s().-]{8,}\d/g;
var LONG_DIGITS = /\d{7,}/g;
function sanitizeDescription(text) {
	return text.replace(EMAIL, REDACTED).replace(PHONE, (match) => match.replace(/\D/g, "").length >= 10 ? REDACTED : match).replace(LONG_DIGITS, REDACTED);
}
/** Client wait; a little longer than the function's own 20 s provider deadline. */
var AI_CLIENT_TIMEOUT_MS = 25e3;
var AI_FUNCTION_NAME = "extract-hazard";
var AI_MAX_DESCRIPTION = 2e3;
var GUEST_ID_STORAGE_KEY = "raahprahari.ai-guest-id";
var UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
var volatileGuestId = null;
var SAFE_ERROR_MESSAGES = {
	auth_required: "The function rejected the session.",
	auth_unavailable: "Authentication could not be verified.",
	invalid_input: "The description was rejected.",
	not_configured: "The suggestion service is not configured.",
	quota_unavailable: "The request limit could not be checked.",
	rate_limited: "The request limit was reached.",
	timeout: "The suggestion service timed out.",
	upstream_error: "The suggestion provider failed.",
	network: "The suggestion service could not be reached.",
	request_failed: "The suggestion request failed."
};
function createGuestId() {
	if (typeof crypto === "undefined") return null;
	if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
	const bytes = /* @__PURE__ */ new Uint8Array(16);
	crypto.getRandomValues(bytes);
	bytes[6] = bytes[6] & 15 | 64;
	bytes[8] = bytes[8] & 63 | 128;
	const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0"));
	return [
		hex.slice(0, 4).join(""),
		hex.slice(4, 6).join(""),
		hex.slice(6, 8).join(""),
		hex.slice(8, 10).join(""),
		hex.slice(10).join("")
	].join("-");
}
function getGuestId() {
	if (typeof window === "undefined") return null;
	if (volatileGuestId) return volatileGuestId;
	try {
		const stored = window.localStorage.getItem(GUEST_ID_STORAGE_KEY);
		if (stored && UUID_PATTERN.test(stored)) {
			volatileGuestId = stored;
			return stored;
		}
	} catch {}
	volatileGuestId = createGuestId();
	if (!volatileGuestId) return null;
	try {
		window.localStorage.setItem(GUEST_ID_STORAGE_KEY, volatileGuestId);
	} catch {}
	return volatileGuestId;
}
async function classifyInvokeError(error) {
	const aborted = (name) => name === "AbortError" || name === "TimeoutError";
	if (aborted(error.name) || aborted(error.context?.name)) {
		error.context?.status;
		return {
			status: "error",
			kind: "timeout"
		};
	}
	if (error.name === "FunctionsFetchError" || error.name === "FunctionsRelayError") {
		error.context?.status;
		return {
			status: "error",
			kind: "network"
		};
	}
	const status = error.context?.status;
	let body;
	try {
		body = await error.context?.json?.();
	} catch {
		body = void 0;
	}
	const rawCode = body?.error;
	const code = typeof rawCode === "string" && rawCode in SAFE_ERROR_MESSAGES ? rawCode : status === 401 ? "auth_required" : status === 429 ? "rate_limited" : status === 504 ? "timeout" : "request_failed";
	if (code === "rate_limited" || status === 429) {
		const seconds = Number(body?.retryAfterSeconds);
		return {
			status: "error",
			kind: "rate_limited",
			retryAfterSeconds: Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : 60
		};
	}
	if (code === "not_configured" || status === 404) return { status: "unavailable" };
	if (code === "auth_required" || status === 401) return { status: "signin_required" };
	if (code === "invalid_input") return {
		status: "error",
		kind: "invalid_input"
	};
	if (code === "timeout" || status === 504) return {
		status: "error",
		kind: "timeout"
	};
	return {
		status: "error",
		kind: "failed"
	};
}
/** Calls the Edge Function with a PII-sanitized description. */
async function requestAiSuggestions(description) {
	if (!isSupabaseConfigured()) return { status: "unavailable" };
	const accountSession = getAccountSession();
	if (accountSession.status === "loading") return { status: "signin_required" };
	const isSignedIn = accountSession.status === "authenticated";
	const guestId = isSignedIn ? null : getGuestId();
	if (!isSignedIn && !guestId) return {
		status: "error",
		kind: "failed"
	};
	const text = sanitizeDescription(description).slice(0, AI_MAX_DESCRIPTION);
	if (!text.split("[removed]").join("").trim()) return {
		status: "error",
		kind: "invalid_input"
	};
	if (typeof navigator !== "undefined" && navigator.onLine === false) return {
		status: "error",
		kind: "network"
	};
	try {
		const { data, error } = await getSupabaseClient().functions.invoke(AI_FUNCTION_NAME, {
			body: { description: text },
			headers: guestId ? { "x-guest-id": guestId } : void 0,
			timeout: AI_CLIENT_TIMEOUT_MS
		});
		if (error) return classifyInvokeError(error);
		const raw = data?.suggestions;
		if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return {
			status: "error",
			kind: "failed"
		};
		const hazard = raw.hazardType;
		return {
			status: "success",
			suggestions: {
				hazardType: REPORT_HAZARDS.includes(hazard) ? hazard : "unknown",
				...observationExtras(raw)
			}
		};
	} catch (error) {
		const name = error?.name;
		return {
			status: "error",
			kind: name === "AbortError" || name === "TimeoutError" ? "timeout" : "network"
		};
	}
}
function useAiExtraction() {
	const [state, setState] = (0, import_react.useState)({ status: "idle" });
	const requestId = (0, import_react.useRef)(0);
	return {
		state,
		run: (0, import_react.useCallback)(async (description) => {
			const id = ++requestId.current;
			setState({ status: "loading" });
			const result = await requestAiSuggestions(description);
			if (id === requestId.current) setState(result);
		}, []),
		reset: (0, import_react.useCallback)(() => {
			requestId.current++;
			setState({ status: "idle" });
		}, [])
	};
}
var ERROR_KEYS = {
	network: "ai.errorNetwork",
	invalid_input: "ai.errorInvalid",
	timeout: "ai.errorTimeout",
	rate_limited: "ai.errorRateLimited",
	failed: "ai.errorFailed"
};
var selectClass = "glass h-11 min-w-0 flex-1 rounded-md border border-input px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
function SuggestionPanel({ suggestions, hazardOptions, onApply, onDone }) {
	const { t } = usePrefs();
	const fields = [
		{
			field: "hazardType",
			label: t("ai.field.hazard"),
			options: hazardOptions
		},
		{
			field: "source",
			label: t("obs.review.source"),
			options: OBSERVATION_SOURCES.map((v) => ({
				value: v,
				label: t(`obs.source.${v}`)
			}))
		},
		{
			field: "laneDirection",
			label: t("obs.review.lane"),
			options: LANE_DIRECTIONS.map((v) => ({
				value: v,
				label: t(`obs.lane.${v}`)
			}))
		},
		{
			field: "vehicleApplicability",
			label: t("obs.review.vehicle"),
			options: VEHICLE_APPLICABILITY.map((v) => ({
				value: v,
				label: t(`obs.vehicle.${v}`)
			}))
		}
	];
	const suggested = fields.filter(({ field }) => suggestions[field] !== "unknown");
	const [values, setValues] = (0, import_react.useState)(() => Object.fromEntries(suggested.map(({ field }) => [field, suggestions[field]])));
	const [open, setOpen] = (0, import_react.useState)(() => suggested.map(({ field }) => field));
	const close = (field) => {
		const next = open.filter((f) => f !== field);
		setOpen(next);
		if (next.length === 0) onDone();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "ai-suggestion-title",
		className: "mt-3 space-y-3 rounded-xl border border-brand-blue/50 bg-brand-blue/5 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				id: "ai-suggestion-title",
				className: "flex items-center gap-2 text-sm font-semibold",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
						"aria-hidden": true,
						className: "size-4"
					}),
					" ",
					t("ai.suggestionTitle")
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: t("ai.suggestionHelp")
			}),
			suggested.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "text-sm",
				children: t("ai.none")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				onClick: onDone,
				children: t("ai.dismiss")
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-3",
				children: fields.filter(({ field }) => open.includes(field)).map(({ field, label, options }) => {
					const id = `ai-suggest-${field}`;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: id,
							className: "block text-sm font-medium",
							children: label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									id,
									className: selectClass,
									value: values[field],
									onChange: (event) => setValues((current) => ({
										...current,
										[field]: event.target.value
									})),
									children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: option.value,
										children: option.label
									}, option.value))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "outline",
									"aria-label": `${t("ai.accept")}: ${label}`,
									onClick: () => {
										onApply({ [field]: values[field] });
										close(field);
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { "aria-hidden": true }),
										" ",
										t("ai.accept")
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "ghost",
									"aria-label": `${t("ai.reject")}: ${label}`,
									onClick: () => close(field),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { "aria-hidden": true }),
										" ",
										t("ai.reject")
									]
								})
							]
						})]
					}, field);
				})
			})
		]
	});
}
/**
* Optional AI help for the observation step. Suggestions are shown for review
* and only change the draft when the user accepts a field.
*/
function AiSuggestionAssist({ description, hazardOptions, onApply }) {
	const { t } = usePrefs();
	const { state, run, reset } = useAiExtraction();
	const [round, setRound] = (0, import_react.useState)(0);
	if (!description.trim() && state.status === "idle") return null;
	const loading = state.status === "loading";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3",
		children: [
			description.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "secondary",
				disabled: loading,
				"aria-busy": loading,
				onClick: () => {
					setRound((n) => n + 1);
					run(description);
				},
				children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					"aria-hidden": true,
					className: "animate-spin motion-reduce:animate-none"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { "aria-hidden": true }), t("ai.suggest")]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: t("ai.privacy")
			})] }),
			loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-2 text-sm",
				children: t("ai.loading")
			}),
			state.status === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "alert",
				className: "mt-2 text-sm text-status-dnt",
				children: [
					t(ERROR_KEYS[state.kind]).replace("{seconds}", String(state.retryAfterSeconds ?? 60)),
					" ",
					t("ai.manual")
				]
			}),
			state.status === "unavailable" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "status",
				className: "mt-2 text-sm",
				children: [
					t("ai.unavailable"),
					" ",
					t("ai.manual")
				]
			}),
			state.status === "signin_required" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "status",
				className: "mt-2 text-sm",
				children: [
					t("ai.signinRequired"),
					" ",
					t("ai.manual")
				]
			}),
			state.status === "success" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuggestionPanel, {
				suggestions: state.suggestions,
				hazardOptions,
				onApply,
				onDone: reset
			}, round)
		]
	});
}
function ReportLocationMap({ lat, lon, onChange }) {
	const containerRef = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const markerRef = (0, import_react.useRef)(null);
	const changeRef = (0, import_react.useRef)(onChange);
	const initialLatRef = (0, import_react.useRef)(lat);
	const initialLonRef = (0, import_react.useRef)(lon);
	const [failure, setFailure] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		changeRef.current = onChange;
	}, [onChange]);
	(0, import_react.useEffect)(() => {
		const container = containerRef.current;
		if (!container) return;
		let cancelled = false;
		let map = null;
		let resizeObserver = null;
		const resizeMap = () => map?.invalidateSize();
		loadLeaflet().then((L) => {
			if (cancelled) return;
			if (typeof navigator !== "undefined" && navigator.onLine === false) {
				setFailure("Map tiles are unavailable while offline. Coordinates already selected remain saved.");
				return;
			}
			const initialLat = initialLatRef.current;
			const initialLon = initialLonRef.current;
			const center = initialLat !== null && initialLon !== null ? [initialLat, initialLon] : [30.07, 79.2];
			const createdMap = L.map(container, {
				attributionControl: false,
				zoomControl: true,
				keyboard: true,
				minZoom: 6,
				maxZoom: 18,
				maxBounds: L.latLngBounds([27.8, 76.8], [32.2, 81.8])
			}).setView(center, initialLat !== null && initialLon !== null ? 13 : 7);
			map = createdMap;
			mapRef.current = {
				map: createdMap,
				L
			};
			L.control.attribution({
				prefix: "<a href=\"https://leafletjs.com\">Leaflet</a>",
				position: "bottomleft"
			}).addAttribution(OSM_ATTRIBUTION).addTo(createdMap);
			let loaded = 0;
			let errors = 0;
			L.tileLayer(OSM_TILE_URL, {
				maxZoom: 19,
				crossOrigin: true
			}).on("tileload", () => {
				loaded += 1;
			}).on("tileerror", () => {
				errors += 1;
				if (loaded === 0 && errors >= 4) setFailure("The map tiles could not be loaded. You can still enter coordinates manually.");
			}).addTo(createdMap);
			const placeMarker = (pointLat, pointLon) => {
				if (markerRef.current) markerRef.current.setLatLng([pointLat, pointLon]);
				else markerRef.current = L.marker([pointLat, pointLon], { draggable: true }).addTo(createdMap).on("dragend", (event) => {
					const point = event.target.getLatLng();
					changeRef.current(point.lat, point.lng);
				});
			};
			if (initialLat !== null && initialLon !== null) placeMarker(initialLat, initialLon);
			createdMap.on("click", (event) => {
				placeMarker(event.latlng.lat, event.latlng.lng);
				changeRef.current(event.latlng.lat, event.latlng.lng);
			});
			if (typeof ResizeObserver !== "undefined") {
				resizeObserver = new ResizeObserver(resizeMap);
				resizeObserver.observe(container);
			} else window.addEventListener("resize", resizeMap);
		}).catch(() => {
			if (!cancelled) setFailure("The interactive map could not start. You can still enter coordinates manually.");
		});
		return () => {
			cancelled = true;
			resizeObserver?.disconnect();
			window.removeEventListener("resize", resizeMap);
			if (map) map.remove();
			if (mapRef.current?.map === map) {
				mapRef.current = null;
				markerRef.current = null;
			}
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!mapRef.current || lat === null || lon === null) return;
		const { map, L } = mapRef.current;
		if (markerRef.current) markerRef.current.setLatLng([lat, lon]);
		else markerRef.current = L.marker([lat, lon], { draggable: true }).addTo(map).on("dragend", (event) => {
			const point = event.target.getLatLng();
			changeRef.current(point.lat, point.lng);
		});
	}, [lat, lon]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		failure && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "alert",
			className: "mb-2 rounded-lg border border-status-caution/50 bg-status-caution/10 p-2 text-xs",
			children: failure
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: containerRef,
			role: "application",
			"aria-label": "Interactive map for choosing the hazard location",
			className: "h-64 w-full rounded-xl border border-border sm:h-80"
		}),
		lat === null || lon === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-muted-foreground",
			children: "Default area: Uttarakhand. Choose a point on the map to mark the hazard."
		}) : null
	] });
}
async function readPhotoGps(file) {
	try {
		const { latitude, longitude } = await tt.gps(file);
		if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
		return {
			lat: latitude,
			lon: longitude
		};
	} catch {
		return null;
	}
}
var STEPS = [
	{
		label: "Photo",
		path: "/report/photo"
	},
	{
		label: "Location",
		path: "/report/location"
	},
	{
		label: "Describe",
		path: "/report"
	},
	{
		label: "Review & send",
		path: "/report/review"
	}
];
var HAZARDS = [
	{
		value: "landslide",
		label: "Landslide",
		icon: Mountain
	},
	{
		value: "flooding",
		label: "Flooding",
		icon: WavesHorizontal
	},
	{
		value: "road_block",
		label: "Road Block",
		icon: Construction
	},
	{
		value: "fallen_tree",
		label: "Fallen Tree",
		icon: TreePine
	},
	{
		value: "damaged_bridge",
		label: "Damaged Bridge",
		icon: Construction
	},
	{
		value: "accident",
		label: "Accident",
		icon: CarFront
	},
	{
		value: "poor_visibility",
		label: "Poor Visibility",
		icon: Wind
	},
	{
		value: "other",
		label: "Other",
		icon: CircleQuestionMark
	}
];
var formatBytes = (size) => size < 1048576 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`;
/** Device accuracy radius, e.g. "±25 m". */
var formatAccuracy = (meters) => `±${Math.round(meters)} m`;
var formatCoordinates = (lat, lon) => `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}, ${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? "E" : "W"}`;
var isoFromLocalDate = (value) => {
	if (!value) return void 0;
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return void 0;
	return parsed.toISOString();
};
function optionsFor(query) {
	const search = query.trim().toLocaleLowerCase();
	if (!search) return [];
	const placeOptions = PLACES.filter((place) => place.name.toLocaleLowerCase().includes(search)).map((place) => ({
		key: `place-${place.id}`,
		label: place.name,
		lat: place.lat,
		lon: place.lon,
		segment: ""
	}));
	return [...SEGMENTS.filter((segment) => {
		const from = placeById(segment.from)?.name ?? "";
		const to = placeById(segment.to)?.name ?? "";
		return `${segment.code} ${from} ${to}`.toLocaleLowerCase().includes(search);
	}).map((segment) => {
		const from = placeById(segment.from);
		const to = placeById(segment.to);
		return {
			key: `segment-${segment.id}`,
			label: `${segment.code} · ${from?.name ?? ""} – ${to?.name ?? ""}`,
			lat: ((from?.lat ?? 0) + (to?.lat ?? 0)) / 2,
			lon: ((from?.lon ?? 0) + (to?.lon ?? 0)) / 2,
			segment: segment.code
		};
	}), ...placeOptions].slice(0, 6);
}
/** Stored when no segment is within range; the report can still be confirmed. */
var NO_SEGMENT = "Road segment not identified";
function makeLocation(lat, lon, query, roadSegment, source, accuracyM = null) {
	const candidates = segmentCandidates(lat, lon);
	const fallbackSegment = candidates.length === 1 ? candidates[0].label : candidates.length === 0 ? NO_SEGMENT : "";
	return {
		query,
		roadSegment: roadSegment || fallbackSegment,
		lat,
		lon,
		accuracyM,
		source,
		confirmed: false
	};
}
function ReportStepPage({ step, navigate, prefillSegmentId }) {
	const { t } = usePrefs();
	const { setSaving, setSaved, setError, ...saveStatus } = useLocalSaveStatus();
	const [draft, setDraft] = (0, import_react.useState)(() => ({
		...createEmptyReportDraft(),
		observedAt: ""
	}));
	const [draftId, setDraftId] = (0, import_react.useState)(null);
	const draftIdRef = (0, import_react.useRef)(null);
	const confirmedLocationRef = (0, import_react.useRef)(null);
	const mountedRef = (0, import_react.useRef)(false);
	const [loaded, setLoaded] = (0, import_react.useState)(false);
	const [storageError, setStorageError] = (0, import_react.useState)("");
	const [errors, setErrors] = (0, import_react.useState)({});
	const [notice, setNotice] = (0, import_react.useState)("");
	const [photoError, setPhotoError] = (0, import_react.useState)("");
	const [photoAsset, setPhotoAsset] = (0, import_react.useState)(null);
	const [locationSearch, setLocationSearch] = (0, import_react.useState)("");
	const [gpsError, setGpsError] = (0, import_react.useState)("");
	const [locating, setLocating] = (0, import_react.useState)(false);
	const [adjustingPin, setAdjustingPin] = (0, import_react.useState)(false);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [submittedReportId] = (0, import_react.useState)(() => {
		if (step !== "received" || typeof window === "undefined") return null;
		return getLastSubmittedReportId();
	});
	const [submittedReport, setSubmittedReport] = (0, import_react.useState)(null);
	const cameraInput = (0, import_react.useRef)(null);
	const libraryInput = (0, import_react.useRef)(null);
	const setCurrentDraftId = (0, import_react.useCallback)((id) => {
		draftIdRef.current = id;
		setDraftId(id);
	}, []);
	const getOrCreateDraftId = (0, import_react.useCallback)(() => {
		const id = draftIdRef.current ?? draftId ?? newReportId();
		draftIdRef.current = id;
		return id;
	}, [draftId]);
	(0, import_react.useEffect)(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);
	const tRef = (0, import_react.useRef)(t);
	(0, import_react.useEffect)(() => {
		tRef.current = t;
	}, [t]);
	(0, import_react.useEffect)(() => {
		const t = tRef.current;
		let active = true;
		const loadSavedDraft = async () => {
			const legacyDraft = readReportDraft();
			if (legacyDraft) {
				confirmedLocationRef.current = legacyDraft.location?.confirmed ? legacyDraft.location : null;
				setDraft(legacyDraft.observedAt ? legacyDraft : {
					...legacyDraft,
					observedAt: toLocalDateTime(/* @__PURE__ */ new Date())
				});
				setLocationSearch(legacyDraft.location?.query ?? "");
			}
			try {
				const scope = getActiveAccountScope();
				const saved = await loadActiveDraft(scope);
				if (!active) return;
				if (saved) {
					const restoredDraft = withObservationDefaults(saved.payload);
					confirmedLocationRef.current = restoredDraft.location?.confirmed ? restoredDraft.location : null;
					setDraft(restoredDraft.observedAt ? restoredDraft : {
						...restoredDraft,
						observedAt: toLocalDateTime(/* @__PURE__ */ new Date())
					});
					setCurrentDraftId(saved.id);
					setLocationSearch(saved.payload.location?.query ?? "");
					setNotice(t("saveStatus.draftRestored"));
				} else if (legacyDraft) {
					setCurrentDraftId(null);
					setNotice(t("saveStatus.draftRestored"));
				} else {
					setDraft((current) => current.observedAt ? current : {
						...current,
						observedAt: toLocalDateTime(/* @__PURE__ */ new Date())
					});
					setCurrentDraftId(null);
					const segment = prefillSegmentId ? SEGMENTS.find((item) => item.id === prefillSegmentId) : void 0;
					if (segment) {
						const from = placeById(segment.from);
						const to = placeById(segment.to);
						const label = `${segment.code} · ${from?.name ?? ""} – ${to?.name ?? ""}`;
						const location = makeLocation(((from?.lat ?? 0) + (to?.lat ?? 0)) / 2, ((from?.lon ?? 0) + (to?.lon ?? 0)) / 2, label, label, "manual");
						setDraft((current) => current.location ? current : {
							...current,
							location
						});
						setLocationSearch((current) => current || label);
					}
				}
			} catch {
				if (active) {
					setStorageError("Could not read the saved draft from this device.");
					setDraft((current) => current.observedAt ? current : {
						...current,
						observedAt: toLocalDateTime(/* @__PURE__ */ new Date())
					});
				}
			} finally {
				if (active) setLoaded(true);
			}
		};
		if (step === "received") return;
		loadSavedDraft();
		return () => {
			active = false;
		};
	}, [
		prefillSegmentId,
		setCurrentDraftId,
		step
	]);
	(0, import_react.useEffect)(() => {
		if (step !== "received" || !submittedReportId) return;
		const scope = getActiveAccountScope();
		const subscription = observeSubmittedReport(submittedReportId, scope, (report) => setSubmittedReport(report), () => setStorageError(t("sync.readFailure")));
		return () => subscription.unsubscribe();
	}, [
		step,
		submittedReportId,
		t
	]);
	(0, import_react.useEffect)(() => {
		if (!loaded || step === "received") return;
		if (step === "location" && !draft.photo) {
			navigate("/report/photo");
			return;
		}
		if (step === "observation" && (!draft.photo || !draft.location?.confirmed)) {
			navigate(draft.photo ? "/report/location" : "/report/photo");
			return;
		}
		if (step === "review") {
			const target = !draft.photo ? "/report/photo" : !draft.location?.confirmed ? "/report/location" : validateHazardType(draft.hazardType) ? "/report" : null;
			if (target) navigate(target);
		}
	}, [
		draft.photo,
		draft.location?.confirmed,
		draft.hazardType,
		loaded,
		navigate,
		step
	]);
	(0, import_react.useEffect)(() => {
		if (!loaded || step === "received") return;
		let active = true;
		const timer = window.setTimeout(() => {
			(async () => {
				if (!draftId && !draft.hazardType && !draft.description && !draft.location && !draft.photo) return;
				const scope = getActiveAccountScope();
				const id = getOrCreateDraftId();
				setSaving();
				const result = await saveDraft({
					id,
					accountScope: scope,
					status: "draft",
					payload: draft,
					eventTime: isoFromLocalDate(draft.observedAt),
					observedAtLocal: draft.observedAt
				});
				if (!active || !mountedRef.current || draftIdRef.current !== id) return;
				if (!result.ok) {
					setError(result.code);
					return;
				}
				setCurrentDraftId(result.id);
				writeReportDraft(draft);
				setSaved(result.savedAt);
			})();
		}, 500);
		return () => {
			active = false;
			window.clearTimeout(timer);
		};
	}, [
		draft,
		loaded,
		step,
		draftId,
		getOrCreateDraftId,
		setCurrentDraftId,
		setSaving,
		setError,
		setSaved
	]);
	(0, import_react.useEffect)(() => {
		let active = true;
		let objectUrl = "";
		const photoId = draft.photo?.id;
		if (!photoId) return;
		loadAttachmentBlob(photoId, getActiveAccountScope()).then((blob) => {
			if (!active) return;
			if (!blob) {
				setPhotoAsset({
					id: photoId,
					url: "",
					error: "The saved photo is unavailable on this device. You can remove it and choose another."
				});
				return;
			}
			objectUrl = URL.createObjectURL(blob);
			setPhotoAsset({
				id: photoId,
				url: objectUrl
			});
		}).catch(() => {
			if (active) setPhotoAsset({
				id: photoId,
				url: "",
				error: "Could not load the saved photo from this device."
			});
		});
		return () => {
			active = false;
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [draft.photo?.id]);
	const currentPhotoAsset = draft.photo && photoAsset?.id === draft.photo.id ? photoAsset : null;
	const photoPreview = currentPhotoAsset?.url ?? "";
	const photoLoadError = currentPhotoAsset?.error ?? "";
	const updateDraft = (patch) => {
		if (!loaded) return;
		setDraft((current) => ({
			...current,
			...patch
		}));
		setNotice("");
	};
	const updateLocation = (location) => {
		if (!loaded) return;
		setDraft((current) => ({
			...current,
			location,
			photo: current.photo ? {
				...current.photo,
				locationTag: location.lat !== null && location.lon !== null ? formatCoordinates(location.lat, location.lon) : "No location tag"
			} : null
		}));
		confirmedLocationRef.current = location.confirmed ? location : null;
		setNotice("");
	};
	const persistDraft = async (nextDraft = draft) => {
		const scope = getActiveAccountScope();
		const id = getOrCreateDraftId();
		setSaving();
		const result = await saveDraft({
			id,
			accountScope: scope,
			status: "draft",
			payload: nextDraft,
			eventTime: isoFromLocalDate(nextDraft.observedAt),
			observedAtLocal: nextDraft.observedAt
		});
		if (!mountedRef.current || draftIdRef.current !== id) return null;
		if (!result.ok) {
			setError(result.code);
			setStorageError(result.message);
			return null;
		}
		setCurrentDraftId(result.id);
		writeReportDraft(nextDraft);
		setStorageError("");
		setSaved(result.savedAt);
		return result;
	};
	const saveDraft$1 = () => {
		persistDraft();
	};
	const ensureDraftIsPersisted = async (nextDraft = draft) => {
		return persistDraft(nextDraft);
	};
	const persistAndGo = async (path) => {
		if (!loaded) return;
		if (draftIdRef.current || draft.hazardType || draft.description || draft.location || draft.photo) {
			if (!await ensureDraftIsPersisted(draft)) return;
		}
		go(path);
	};
	const go = (path) => {
		navigate(path);
		scrollContentToTop();
	};
	const continueObservation = async () => {
		if (!loaded) return;
		const nextErrors = validateObservation(draft);
		setErrors(nextErrors);
		if (Object.keys(nextErrors).length) return;
		if (!draft.photo || !draft.location?.confirmed) {
			go(!draft.photo ? "/report/photo" : "/report/location");
			return;
		}
		if (!await ensureDraftIsPersisted(draft)) return;
		go("/report/review");
	};
	const choosePhoto = async (file) => {
		if (!loaded) return;
		setPhotoError("");
		if (!file) return;
		const validationCode = photoValidationCode(file);
		if (validationCode) {
			setPhotoError(t(validationCode === "type" ? "report.photoTypeErr" : validationCode === "empty" ? "report.photoEmptyErr" : "report.photoSizeErr"));
			return;
		}
		const decoded = await decodeReportPhoto(file);
		if (!mountedRef.current) return;
		if (!decoded) {
			setPhotoError("This image is corrupt or could not be decoded. Choose another JPG or PNG.");
			return;
		}
		const gpsCoordinates = await readPhotoGps(file);
		if (!mountedRef.current) return;
		const photoLocation = gpsCoordinates && inCoverage(gpsCoordinates.lat, gpsCoordinates.lon) ? makeLocation(gpsCoordinates.lat, gpsCoordinates.lon, "Photo GPS location", "", "device") : null;
		const confirmedLocation = confirmedLocationRef.current ?? (draft.location?.confirmed ? draft.location : null);
		const draftBeforePhoto = confirmedLocation ? {
			...draft,
			location: confirmedLocation
		} : draft;
		const scope = getActiveAccountScope();
		const nextDraftId = getOrCreateDraftId();
		const persisted = await saveDraft({
			id: nextDraftId,
			accountScope: scope,
			status: "draft",
			payload: draftBeforePhoto,
			eventTime: isoFromLocalDate(draftBeforePhoto.observedAt),
			observedAtLocal: draftBeforePhoto.observedAt
		});
		if (!mountedRef.current || draftIdRef.current !== nextDraftId) return;
		if (!persisted.ok) {
			setError(persisted.code);
			setPhotoError(t("report.photoSaveErr"));
			return;
		}
		const location = confirmedLocationRef.current ?? (draft.location?.confirmed ? draft.location : null) ?? photoLocation ?? draftBeforePhoto.location;
		const attachmentResult = await saveAttachment(persisted.id, scope, file);
		if (!mountedRef.current || draftIdRef.current !== nextDraftId) {
			if (attachmentResult.ok) await removeAttachment(attachmentResult.id, scope);
			return;
		}
		if (!attachmentResult.ok) {
			setPhotoError(t("report.photoSaveErr"));
			setError(attachmentResult.code);
			return;
		}
		setCurrentDraftId(persisted.id);
		const nextPhoto = {
			id: attachmentResult.id,
			name: file.name,
			type: file.type || "image/jpeg",
			size: file.size,
			timestamp: Date.now(),
			locationTag: location?.lat !== null && location?.lat !== void 0 && location.lon !== null ? formatCoordinates(location.lat, location.lon) : "No location tag"
		};
		const nextDraft = {
			...draftBeforePhoto,
			photo: nextPhoto,
			location
		};
		const photoSaved = await saveDraft({
			id: persisted.id,
			accountScope: scope,
			status: "draft",
			payload: nextDraft,
			eventTime: isoFromLocalDate(nextDraft.observedAt),
			observedAtLocal: nextDraft.observedAt
		});
		if (!photoSaved.ok) {
			await removeAttachment(attachmentResult.id, scope);
			if (mountedRef.current && draftIdRef.current === nextDraftId) {
				setError(photoSaved.code);
				setPhotoError(t("report.photoSaveErr"));
			}
			return;
		}
		if (!mountedRef.current || draftIdRef.current !== nextDraftId) return;
		updateDraft({
			photo: nextPhoto,
			location
		});
		if (draft.photo) await removeAttachment(draft.photo.id, scope);
	};
	const removePhoto = async () => {
		if (!loaded || !draft.photo) return;
		const scope = getActiveAccountScope();
		if (!(await removeAttachment(draft.photo.id, scope)).ok) {
			setPhotoError("Could not remove the photo from this device. Try again.");
			return;
		}
		updateDraft({ photo: null });
		setPhotoError("");
	};
	const chooseSearchOption = (option) => {
		if (!loaded) return;
		setLocationSearch(option.label);
		updateLocation(makeLocation(option.lat, option.lon, option.label, option.segment, "manual"));
		setGpsError("");
	};
	const useDeviceLocation = async () => {
		if (!loaded) return;
		setLocating(true);
		setGpsError("");
		const result = await getCurrentPosition();
		if (!mountedRef.current) return;
		setLocating(false);
		if (!result.ok) {
			setGpsError(t(result.reason === "denied" ? "loc.gpsDenied" : result.reason === "unsupported" ? "loc.gpsUnsupported" : "loc.gpsUnavailable"));
			return;
		}
		if (!inCoverage(result.lat, result.lon)) {
			setGpsError(t("loc.gpsOutside"));
			return;
		}
		const loc = makeLocation(result.lat, result.lon, "Current device location", "", "device", result.accuracyM);
		updateLocation(loc);
		setLocationSearch(loc.query);
	};
	const setMapPoint = (lat, lon) => {
		if (!loaded) return;
		const location = makeLocation(lat, lon, "Manually adjusted map pin", "", "manual");
		updateLocation(location);
	};
	/** An explicit segment choice; any location edit clears confirmation. */
	const chooseSegment = (label) => {
		if (!loaded || !draft.location) return;
		updateLocation({
			...draft.location,
			roadSegment: label,
			confirmed: false
		});
		setErrors((current) => ({
			...current,
			location: ""
		}));
	};
	const confirmLocation = async () => {
		if (!loaded) return;
		if (!draft.location || draft.location.lat === null || draft.location.lon === null) {
			setErrors({ location: "Search for a place or road, use device location, or adjust the map pin." });
			return;
		}
		if (!draft.location.roadSegment) {
			setErrors({ location: t("loc.chooseSegmentError") });
			return;
		}
		const next = {
			...draft,
			location: {
				...draft.location,
				confirmed: true
			}
		};
		confirmedLocationRef.current = next.location;
		setDraft(next);
		const scope = getActiveAccountScope();
		const id = getOrCreateDraftId();
		const result = await saveDraft({
			id,
			accountScope: scope,
			status: "draft",
			payload: next,
			eventTime: isoFromLocalDate(next.observedAt),
			observedAtLocal: next.observedAt
		});
		if (!mountedRef.current || draftIdRef.current !== id) return;
		if (!result.ok) {
			setError(result.code);
			setStorageError(result.message);
			return;
		}
		setCurrentDraftId(result.id);
		writeReportDraft(next);
		setStorageError("");
		setErrors({});
		go("/report");
	};
	const submitReport = async () => {
		if (!loaded || submitting) return;
		if (!draft.photo) {
			setErrors({ photo: "Add at least one photo before submitting." });
			go("/report/photo");
			return;
		}
		const observationErrors = validateObservation(draft);
		if (Object.keys(observationErrors).length) {
			setErrors(observationErrors);
			return;
		}
		if (!draft.location?.confirmed) {
			setErrors({ location: "Confirm a report location before submitting." });
			return;
		}
		const scope = getActiveAccountScope();
		const savedReportDraft = {
			...draft,
			location: {
				...draft.location,
				confirmed: true
			}
		};
		const id = getOrCreateDraftId();
		setSubmitting(true);
		setSaving();
		const saved = await saveDraft({
			id,
			accountScope: scope,
			status: "draft",
			payload: savedReportDraft,
			eventTime: isoFromLocalDate(savedReportDraft.observedAt),
			observedAtLocal: savedReportDraft.observedAt
		});
		if (!mountedRef.current || draftIdRef.current !== id) return;
		if (!saved.ok) {
			setSubmitting(false);
			setError(saved.code);
			setStorageError(saved.message);
			return;
		}
		setCurrentDraftId(saved.id);
		const queued = await queueReportForSync(saved.id);
		if (!mountedRef.current || draftIdRef.current !== id) return;
		if (!queued.ok) {
			setSubmitting(false);
			setError(queued.code);
			setStorageError(queued.message);
			return;
		}
		setStorageError("");
		setSaved(saved.savedAt);
		setSubmitting(false);
		go("/report/received");
	};
	const searchChosen = draft.location?.lat != null && draft.location.query === locationSearch;
	const allMatches = (0, import_react.useMemo)(() => optionsFor(locationSearch), [locationSearch]);
	const matchingOptions = searchChosen ? [] : allMatches;
	const locLat = draft.location?.lat ?? null;
	const locLon = draft.location?.lon ?? null;
	const nearbyChoices = (0, import_react.useMemo)(() => locLat !== null && locLon !== null ? segmentCandidates(locLat, locLon) : [], [locLat, locLon]);
	const currentStep = step === "photo" ? 1 : step === "location" ? 2 : step === "observation" ? 3 : 4;
	if (step === "received") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceivedReport, {
		report: submittedReport,
		hasReportId: Boolean(submittedReportId),
		navigate,
		storageError
	});
	if (!loaded) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rp-container max-w-content py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "status",
			"aria-live": "polite",
			children: t("saveStatus.restoringDraft")
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-full overflow-x-clip",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "photo-surface relative border-b border-border bg-cover bg-center",
			style: { backgroundImage: "linear-gradient(90deg, var(--photo-scrim-a), var(--photo-scrim-b) 60%, var(--photo-scrim-c)), url('/img/banner-strip.png')" },
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rp-container relative py-6 sm:py-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 flex flex-wrap items-end justify-between gap-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Report a hazard"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "rp-page-title",
							children: step === "photo" ? "Add photo evidence" : step === "location" ? "Confirm the location" : step === "observation" ? "Describe the hazard" : "Review your report"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-2xl text-sm text-muted-foreground",
							children: "Share what you observed to help others make informed decisions."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						"aria-label": "Report steps",
						className: "grid min-w-72 grid-cols-4 gap-2 sm:min-w-[26rem]",
						children: STEPS.map((item, index) => {
							const number = index + 1;
							const active = currentStep === number;
							const complete = currentStep > number;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								"aria-current": active ? "step" : void 0,
								className: `relative flex min-w-0 flex-col items-center gap-1 text-center ${index > 0 ? `before:absolute before:top-4 before:right-[calc(50%+1.25rem)] before:h-0.5 before:w-[calc(100%-1.75rem)] before:rounded-full ${currentStep >= number ? "before:bg-brand-orange" : "before:bg-border"}` : ""}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `glass-pill relative flex size-8 items-center justify-center border-2 text-xs font-semibold ${active ? "border-brand-orange bg-brand-orange text-report-foreground" : complete ? "border-brand-orange text-brand-orange" : "border-border text-muted-foreground"}`,
									children: complete ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
										"aria-hidden": true,
										className: "size-4"
									}) : number
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `text-xs ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`,
									children: item.label
								})]
							}, item.label);
						})
					})]
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rp-container max-w-content py-5 sm:py-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: step === "observation" ? "grid gap-5 lg:grid-cols-[minmax(16rem,0.7fr)_minmax(0,1.3fr)]" : "mx-auto max-w-5xl",
				children: [step === "observation" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "glass-strong relative hidden h-[min(36rem,calc(100svh-8rem))] overflow-hidden rounded-2xl border border-border lg:sticky lg:top-[calc(var(--shell-bar-height)+1rem)] lg:block lg:self-start",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/img/hero-road.png",
							alt: "Illustrative mountain road through a Himalayan valley.",
							className: "absolute inset-0 size-full object-cover"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"aria-hidden": true,
							className: "absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/5"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute inset-x-0 bottom-0 p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-2xl font-semibold",
								children: "Local observations matter"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 max-w-sm text-sm text-foreground/90",
								children: "Share what you saw. A community report provides information, not an official road restriction."
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						storageError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							role: "alert",
							className: "mb-4 flex items-start gap-2 rounded-xl border border-status-dnt/60 bg-status-dnt/10 p-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
								"aria-hidden": true,
								className: "mt-0.5 size-4 shrink-0 text-status-dnt"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: storageError })]
						}),
						notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "glass mb-4 rounded-xl border border-border p-3 text-sm",
							children: notice
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalSaveStatus, {
							status: saveStatus.status,
							savedAt: saveStatus.savedAt,
							errorCode: saveStatus.errorCode,
							onRetry: () => {
								saveDraft$1();
							}
						}),
						step === "observation" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							"aria-labelledby": "observation-heading",
							className: "glass-strong rounded-2xl border border-border p-4 sm:p-7",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									id: "observation-heading",
									className: "font-display text-xl font-semibold",
									children: "What did you observe?"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
									className: "mt-5",
									"aria-describedby": errors.hazardType ? "hazard-error" : void 0,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
											className: "mb-3 text-sm font-medium",
											children: "Choose the condition that best describes the road"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
											children: HAZARDS.map(({ value, label, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												"aria-pressed": draft.hazardType === value,
												onClick: () => {
													updateDraft({ hazardType: value });
													setErrors((current) => ({
														...current,
														hazardType: ""
													}));
												},
												className: `glass relative flex min-h-24 flex-col items-start justify-between gap-3 rounded-xl border-2 p-3 text-left text-sm transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${draft.hazardType === value ? "border-brand-orange bg-brand-orange/12 font-semibold shadow-[0_0_0_4px_color-mix(in_srgb,var(--brand-orange)_18%,transparent)]" : "border-border hover:border-brand-orange/60 hover:bg-accent"}`,
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														"aria-hidden": true,
														className: `flex size-10 items-center justify-center rounded-lg ${draft.hazardType === value ? "bg-brand-orange text-report-foreground" : "bg-brand-orange/15 text-brand-orange"}`,
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
													draft.hazardType === value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
														"aria-hidden": true,
														className: "absolute top-2.5 right-2.5 size-4 text-brand-orange"
													})
												]
											}, value))
										}),
										errors.hazardType && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											id: "hazard-error",
											role: "alert",
											className: "mt-2 flex items-start gap-2 text-sm text-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
												"aria-hidden": true,
												className: "mt-0.5 size-4 shrink-0 text-status-dnt"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: errors.hazardType })]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mb-2 flex items-center justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												htmlFor: "report-description",
												className: "text-sm font-medium",
												children: "Describe the condition"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												"aria-live": "polite",
												className: "text-xs text-muted-foreground",
												children: [draft.description.length, "/500"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											id: "report-description",
											rows: 4,
											maxLength: 500,
											value: draft.description,
											"aria-invalid": Boolean(errors.description),
											"aria-describedby": errors.description ? "description-error description-count" : "description-count",
											onChange: (event) => updateDraft({ description: event.target.value }),
											placeholder: "Add details that may help someone understand your observation.",
											className: "rounded-xl"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-1 flex justify-between gap-3",
											children: [errors.description && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												id: "description-error",
												role: "alert",
												className: "flex items-start gap-2 text-sm text-foreground",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
													"aria-hidden": true,
													className: "mt-0.5 size-4 shrink-0 text-status-dnt"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: errors.description })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												id: "description-count",
												className: "ml-auto sr-only",
												children: [draft.description.length, " of 500 characters"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AiSuggestionAssist, {
											description: draft.description,
											hazardOptions: HAZARDS,
											onApply: (patch) => {
												updateDraft(patch);
												if (patch.hazardType) setErrors((current) => ({
													...current,
													hazardType: ""
												}));
											}
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5 max-w-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											htmlFor: "report-observed-at",
											className: "mb-2 block text-sm font-medium",
											children: "When did you observe it?"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "report-observed-at",
											type: "datetime-local",
											value: draft.observedAt,
											"aria-invalid": Boolean(errors.observedAt),
											"aria-describedby": errors.observedAt ? "observed-at-error" : void 0,
											onChange: (event) => updateDraft({ observedAt: event.target.value })
										}),
										errors.observedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											id: "observed-at-error",
											role: "alert",
											className: "mt-1.5 flex items-start gap-2 text-sm text-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
												"aria-hidden": true,
												className: "mt-0.5 size-4 shrink-0 text-status-dnt"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: errors.observedAt })]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-6 space-y-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted-foreground",
											children: t("obs.optionalNote")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObservationChoice, {
											id: "report-source",
											legend: t("obs.source.legend"),
											value: draft.source,
											options: OBSERVATION_SOURCES,
											labelKey: (value) => `obs.source.${value}`,
											onChange: (source) => updateDraft({ source })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObservationChoice, {
											id: "report-lane",
											legend: t("obs.lane.legend"),
											value: draft.laneDirection,
											options: LANE_DIRECTIONS,
											labelKey: (value) => `obs.lane.${value}`,
											onChange: (laneDirection) => updateDraft({ laneDirection })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObservationChoice, {
											id: "report-vehicle",
											legend: t("obs.vehicle.legend"),
											value: draft.vehicleApplicability,
											options: VEHICLE_APPLICABILITY,
											labelKey: (value) => `obs.vehicle.${value}`,
											onChange: (vehicleApplicability) => updateDraft({ vehicleApplicability })
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-4 flex items-start gap-3 rounded-xl border border-status-caution/50 border-l-4 border-l-status-caution bg-status-caution/10 p-3 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
										"aria-hidden": true,
										className: "mt-0.5 size-4 shrink-0 text-status-caution"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Capture evidence only when you are away from traffic. Do not stop in a dangerous area." })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepActions, {
									back: () => void persistAndGo("/report/location"),
									continueLabel: "Continue",
									onContinue: continueObservation,
									onSave: saveDraft$1,
									backLabel: "Back"
								})
							]
						}),
						step === "photo" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							"aria-labelledby": "photo-heading",
							className: "glass-strong rounded-2xl border border-border p-4 sm:p-7",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(15rem,0.7fr)]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											id: "photo-heading",
											className: "font-display text-xl font-semibold",
											children: "Add photo evidence"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted-foreground",
											children: "Attach one image to support your observation."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-4 grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => cameraInput.current?.click(),
												className: "flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-orange/45 bg-brand-orange/5 px-3 text-sm font-semibold transition-colors motion-reduce:transition-none hover:border-brand-orange hover:bg-brand-orange/10",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													"aria-hidden": true,
													className: "flex size-11 items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-5" })
												}), "Take photo"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => libraryInput.current?.click(),
												className: "glass flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-3 text-center text-sm font-semibold transition-colors motion-reduce:transition-none hover:border-brand-orange hover:bg-brand-orange/10",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													"aria-hidden": true,
													className: "glass-pill flex size-11 items-center justify-center rounded-full text-foreground",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "size-5" })
												}), "Choose existing photo"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											ref: cameraInput,
											type: "file",
											accept: "image/jpeg,image/png,.jpg,.jpeg,.png",
											capture: "environment",
											className: "sr-only",
											"aria-label": "Take a JPG or PNG photo",
											"aria-describedby": "photo-format photo-error",
											onChange: (event) => {
												const file = event.target.files?.[0];
												event.target.value = "";
												choosePhoto(file);
											}
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											ref: libraryInput,
											type: "file",
											accept: "image/jpeg,image/png,.jpg,.jpeg,.png",
											className: "sr-only",
											"aria-label": "Choose an existing JPG or PNG photo",
											"aria-describedby": "photo-format photo-error",
											onChange: (event) => {
												const file = event.target.files?.[0];
												event.target.value = "";
												choosePhoto(file);
											}
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											id: "photo-format",
											className: "mt-2 text-xs text-muted-foreground",
											children: t("report.photosHint")
										}),
										photoError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											id: "photo-error",
											role: "alert",
											className: "mt-2 flex items-start gap-2 text-sm text-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
												"aria-hidden": true,
												className: "mt-0.5 size-4 shrink-0 text-status-dnt"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: photoError })]
										}),
										photoLoadError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											role: "alert",
											className: "mt-2 flex items-start gap-2 text-sm text-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
												"aria-hidden": true,
												className: "mt-0.5 size-4 shrink-0 text-status-dnt"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: photoLoadError })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-6",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
													className: "text-sm font-semibold",
													children: "Sample examples"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 text-xs text-muted-foreground",
													children: "Synthetic examples only; these are not attached to your report."
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mt-3 grid grid-cols-2 gap-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
														className: "overflow-hidden rounded-xl border border-border",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
															src: "/img/hero-road.png",
															alt: "",
															className: "h-28 w-full object-cover"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", {
															className: "p-2 text-xs text-muted-foreground",
															children: "Mountain road · example"
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
														className: "overflow-hidden rounded-xl border border-border",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
															src: "/img/hero-mountain.png",
															alt: "",
															className: "h-28 w-full object-cover"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", {
															className: "p-2 text-xs text-muted-foreground",
															children: "Mountain view · example"
														})]
													})]
												})
											]
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
										className: "glass rounded-xl border border-border p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
											className: "flex items-center gap-2 text-sm font-semibold",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {
												"aria-hidden": true,
												className: "size-4"
											}), " Photo information"]
										}), draft.photo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 space-y-3",
											children: [
												photoPreview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: photoPreview,
													alt: `Selected photo: ${draft.photo.name}`,
													className: "max-h-64 w-full rounded-lg object-contain"
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground",
													children: "Loading saved photo…"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted-foreground",
													children: t("report.photoLocal")
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
													className: "grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-xs",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
															className: "text-muted-foreground",
															children: "File name"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
															className: "break-all",
															children: draft.photo.name
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
															className: "text-muted-foreground",
															children: "File size"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: formatBytes(draft.photo.size) }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
															className: "text-muted-foreground",
															children: "Timestamp"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: new Date(draft.photo.timestamp).toLocaleString() }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
															className: "text-muted-foreground",
															children: "Location tag"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: draft.photo.locationTag })
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													type: "button",
													variant: "outline",
													className: "w-full",
													onClick: removePhoto,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { "aria-hidden": true }), " Remove photo"]
												})
											]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 rounded-lg border border-dashed border-border p-5 text-center text-sm text-muted-foreground",
											children: "No photo added"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-5 rounded-xl border border-status-caution/50 bg-status-caution/10 p-3 text-sm",
									children: t("report.photoGpsInfo")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepActions, {
									back: () => void persistAndGo("/"),
									continueLabel: "Continue",
									onContinue: async () => {
										if (!draft.photo || photoLoadError) {
											setPhotoError(!draft.photo ? "Add at least one photo to continue." : "The saved photo is unavailable. Remove it or choose another photo.");
											return;
										}
										if (!await ensureDraftIsPersisted(draft)) return;
										go("/report/location");
									},
									onSave: saveDraft$1
								})
							]
						}),
						step === "location" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							"aria-labelledby": "location-heading",
							className: "glass-strong rounded-2xl border border-border p-4 sm:p-7",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-end justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										id: "location-heading",
										className: "font-display text-xl font-semibold",
										children: "Confirm the location"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted-foreground",
										children: "Check the map pin and road segment before continuing."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										variant: "secondary",
										disabled: locating,
										onClick: useDeviceLocation,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { "aria-hidden": true }),
											" ",
											locating ? "Finding location…" : "Use current location"
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative mt-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											htmlFor: "report-location-search",
											className: "mb-2 block text-sm font-medium",
											children: "Search road or place"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
												"aria-hidden": true,
												className: "pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "report-location-search",
												value: locationSearch,
												onChange: (event) => {
													setLocationSearch(event.target.value);
													if (loaded) setDraft((current) => ({
														...current,
														location: current.location ? {
															...current.location,
															query: event.target.value,
															confirmed: false
														} : {
															query: event.target.value,
															roadSegment: "",
															lat: null,
															lon: null,
															accuracyM: null,
															source: null,
															confirmed: false
														}
													}));
												},
												"aria-describedby": `location-search-help${gpsError ? " location-error" : ""}${errors.location ? " location-validation-error" : ""}`,
												"aria-invalid": Boolean(errors.location),
												placeholder: "Search a place or road code",
												className: "pl-10"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											id: "location-search-help",
											className: "mt-1 text-xs text-muted-foreground",
											children: "Search is limited to this prototype’s synthetic location list."
										}),
										matchingOptions.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											role: "status",
											className: "mt-2 text-sm font-medium",
											children: t("loc.multipleMatches")
										}),
										matchingOptions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											role: "listbox",
											"aria-label": "Matching places and roads",
											className: "glass-strong absolute z-(--z-content) mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border p-1",
											children: matchingOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
												role: "option",
												"aria-selected": false,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													className: "min-h-11 w-full rounded-lg px-3 text-left text-sm hover:bg-accent",
													onClick: () => chooseSearchOption(option),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "block font-medium",
														children: option.label
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xs text-muted-foreground",
														children: option.segment || t("loc.placeOption")
													})]
												})
											}, option.key))
										})
									]
								}),
								gpsError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									id: "location-error",
									role: "status",
									className: "mt-3 rounded-xl border border-status-caution/50 bg-status-caution/10 p-3 text-sm",
									children: gpsError
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(15rem,0.6fr)]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportLocationMap, {
										lat: draft.location?.lat ?? null,
										lon: draft.location?.lon ?? null,
										onChange: setMapPoint
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex flex-wrap gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "button",
											variant: "outline",
											onClick: () => setAdjustingPin((value) => !value),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { "aria-hidden": true }),
												" ",
												adjustingPin ? "Finish adjusting" : "Adjust location"
											]
										}), adjustingPin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "self-center text-xs text-muted-foreground",
											children: "Click the map or focus it and use arrow keys."
										})]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
										className: "glass rounded-xl border border-border p-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
												className: "flex items-center gap-2 font-semibold",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
														"aria-hidden": true,
														className: "size-4 text-brand-orange"
													}),
													" ",
													"Location Details"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
												className: "mt-4 space-y-4 text-sm",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
														className: "text-xs text-muted-foreground",
														children: "Road / segment"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
														className: "mt-1 font-medium",
														children: draft.location?.roadSegment || t("loc.segmentNotChosen")
													})] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
														className: "text-xs text-muted-foreground",
														children: "Coordinates"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
														className: "mt-1 font-mono text-xs",
														children: draft.location?.lat !== null && draft.location?.lat !== void 0 && draft.location.lon !== null ? `${formatCoordinates(draft.location.lat, draft.location.lon)}${draft.location.accuracyM != null ? ` (${formatAccuracy(draft.location.accuracyM)})` : ""}` : "Not selected"
													})] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
														className: "text-xs text-muted-foreground",
														children: "Location accuracy"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
														className: "mt-1",
														children: draft.location?.accuracyM !== null && draft.location?.accuracyM !== void 0 ? formatAccuracy(draft.location.accuracyM) : draft.location?.lat !== null && draft.location?.lat !== void 0 ? t("loc.accuracyApprox") : t("loc.accuracyUnknown")
													})] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
														className: "text-xs text-muted-foreground",
														children: t("loc.statusLabel")
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
														className: "mt-1",
														"aria-live": "polite",
														children: draft.location?.confirmed ? t("loc.statusConfirmed") : t("loc.statusUnconfirmed")
													})] })
												]
											}),
											nearbyChoices.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
												className: "mt-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
													className: "mb-2 text-sm font-medium",
													children: t("loc.chooseSegment")
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroup, {
													value: nearbyChoices.some((c) => c.label === draft.location?.roadSegment) ? draft.location?.roadSegment : "",
													onValueChange: chooseSegment,
													className: "gap-1",
													children: nearbyChoices.map((choice) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex min-h-11 items-center gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, {
															value: choice.label,
															id: `segment-choice-${choice.id}`
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
															htmlFor: `segment-choice-${choice.id}`,
															className: "font-normal",
															children: [
																choice.label,
																" ",
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-xs text-muted-foreground",
																	children: t("loc.kmAway").replace("{km}", choice.km.toFixed(1))
																})
															]
														})]
													}, choice.id))
												})]
											}),
											adjustingPin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-4 grid grid-cols-2 gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "text-xs text-muted-foreground",
													htmlFor: "pin-latitude",
													children: ["Latitude", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														id: "pin-latitude",
														type: "number",
														step: "0.0001",
														min: "28.7",
														max: "31.5",
														value: draft.location?.lat ?? "",
														onChange: (event) => {
															const lat = Number(event.target.value);
															if (event.target.value && Number.isFinite(lat) && lat >= 28.7 && lat <= 31.5 && draft.location && draft.location.lon !== null) setMapPoint(lat, draft.location.lon);
														},
														className: "mt-1"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "text-xs text-muted-foreground",
													htmlFor: "pin-longitude",
													children: ["Longitude", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														id: "pin-longitude",
														type: "number",
														step: "0.0001",
														min: "77.5",
														max: "81.1",
														value: draft.location?.lon ?? "",
														onChange: (event) => {
															const lon = Number(event.target.value);
															if (event.target.value && Number.isFinite(lon) && lon >= 77.5 && lon <= 81.1 && draft.location?.lat !== null && draft.location?.lat !== void 0) setMapPoint(draft.location.lat, lon);
														},
														className: "mt-1"
													})]
												})]
											})
										]
									})]
								}),
								errors.location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									id: "location-validation-error",
									role: "alert",
									className: "mt-3 flex items-start gap-2 text-sm text-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
										"aria-hidden": true,
										className: "mt-0.5 size-4 shrink-0 text-status-dnt"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: errors.location })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-5 rounded-xl border border-status-caution/50 bg-status-caution/10 p-3 text-sm",
									children: "Location access is optional. If permission is denied, search manually or place the pin on the map."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepActions, {
									back: () => void persistAndGo("/report/photo"),
									continueLabel: t("loc.confirm"),
									onContinue: confirmLocation,
									onSave: saveDraft$1
								})
							]
						}),
						step === "review" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							"aria-labelledby": "review-heading",
							className: "glass-strong rounded-2xl border border-border p-4 sm:p-7",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									id: "review-heading",
									className: "font-display text-xl font-semibold",
									children: "Review your report"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: "Check the details before saving this observation on your device."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5 grid gap-3 lg:grid-cols-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ReviewSection, {
											title: "Hazard details",
											edit: () => go("/report"),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-medium",
												children: HAZARDS.find(({ value }) => value === draft.hazardType)?.label ?? "Not selected"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 whitespace-pre-wrap text-muted-foreground",
												children: draft.description || "No description provided"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewSection, {
											title: "Photo evidence",
											edit: () => go("/report/photo"),
											children: draft.photo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-3",
												children: [photoPreview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: photoPreview,
													alt: "",
													className: "size-16 rounded-lg object-cover"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "min-w-0",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "truncate",
														children: draft.photo.name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs text-muted-foreground",
														children: formatBytes(draft.photo.size)
													})]
												})]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-muted-foreground",
												children: "No photo attached"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ReviewSection, {
											title: "Location",
											edit: () => go("/report/location"),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: draft.location?.roadSegment ?? "Not selected" }), draft.location?.lat !== null && draft.location?.lat !== void 0 && draft.location.lon !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 font-mono text-xs text-muted-foreground",
												children: formatCoordinates(draft.location.lat, draft.location.lon)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewSection, {
											title: t("obs.review.title"),
											edit: () => go("/report"),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
												className: "grid grid-cols-[auto_1fr] gap-x-3 gap-y-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
														className: "text-muted-foreground",
														children: t("obs.review.source")
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: t(`obs.source.${draft.source}`) }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
														className: "text-muted-foreground",
														children: t("obs.review.lane")
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: t(`obs.lane.${draft.laneDirection}`) }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
														className: "text-muted-foreground",
														children: t("obs.review.vehicle")
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: t(`obs.vehicle.${draft.vehicleApplicability}`) })
												]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewSection, {
											title: t("segment.observationTime"),
											edit: () => go("/report"),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: draft.observedAt ? new Date(draft.observedAt).toLocaleString() : "Not specified" })
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 rounded-xl border border-status-caution/50 bg-status-caution/10 p-4 text-sm font-medium",
									children: "Your report will be subject to review and is not an official road closure."
								}),
								Object.keys(errors).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									role: "alert",
									className: "mt-3 flex items-start gap-2 text-sm text-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
										"aria-hidden": true,
										className: "mt-0.5 size-4 shrink-0 text-status-dnt"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Review the observation and location details before submitting." })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-6 flex flex-col-reverse justify-between gap-3 border-t border-border pt-5 sm:flex-row",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										variant: "outline",
										onClick: () => go("/report/location"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { "aria-hidden": true }), " Back to location"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col-reverse gap-3 sm:flex-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "button",
											variant: "secondary",
											onClick: saveDraft$1,
											children: "Save draft"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "button",
											onClick: submitReport,
											disabled: submitting,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { "aria-hidden": true }),
												" ",
												submitting ? "Submitting…" : "Submit report"
											]
										})]
									})]
								})
							]
						})
					]
				})]
			})
		})]
	});
}
function StepActions({ back, onContinue, onSave, continueLabel, backLabel = "Back" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 flex flex-col-reverse justify-between gap-3 border-t border-border pt-5 sm:flex-row",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col-reverse gap-2 sm:flex-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "ghost",
				onClick: back,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { "aria-hidden": true }),
					" ",
					backLabel
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				onClick: onSave,
				children: "Save draft"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			onClick: onContinue,
			children: [continueLabel, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { "aria-hidden": true })]
		})]
	});
}
/** Optional single-choice observation field; "unknown" is a real, explicit choice. */
function ObservationChoice({ id, legend, value, options, labelKey, onChange }) {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
		className: "mb-2 text-sm font-medium",
		children: legend
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroup, {
		value,
		onValueChange: (next) => onChange(next),
		className: "grid gap-1 sm:grid-cols-2",
		children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-11 items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, {
				value: option,
				id: `${id}-${option}`
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: `${id}-${option}`,
				className: "font-normal",
				children: t(labelKey(option))
			})]
		}, option))
	})] });
}
function ReviewSection({ title, edit, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "glass rounded-xl border border-border p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-semibold",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				className: "h-11",
				onClick: edit,
				children: "Edit"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 text-sm",
			children
		})]
	});
}
function ReceivedReport({ report, hasReportId, navigate, storageError }) {
	const { t } = usePrefs();
	const receipt = report?.outbox.metadataReceipt;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "photo-surface relative flex min-h-[70svh] items-center justify-center overflow-hidden bg-cover bg-center px-4 py-10",
		style: { backgroundImage: "linear-gradient(90deg, var(--photo-scrim-a), var(--photo-scrim-b) 60%, var(--photo-scrim-c)), url('/img/hero-mountain.png')" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			"aria-labelledby": "report-saved-heading",
			className: "glass-strong w-full max-w-xl rounded-2xl border border-border p-5 sm:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 flex size-14 items-center justify-center rounded-full border border-brand-orange text-brand-orange",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
						"aria-hidden": true,
						className: "size-7"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					id: "report-saved-heading",
					className: "rp-page-title mt-4",
					children: t("sync.savedReportHeading")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeliveryStatusBadge, { outbox: report?.outbox ?? null })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SyncNowButton, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: t("sync.notOfficialClosure")
				}),
				report ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass mt-5 rounded-xl border border-border p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "break-all font-mono text-sm",
							children: report.draft.id
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-medium",
								children: [t("sync.observed"), ": "]
							}), report.draft.eventTime ? new Date(report.draft.eventTime).toLocaleString() : t("sync.unknownTime")] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: receipt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-medium",
								children: [
									t("sync.serverReceived"),
									":",
									" "
								]
							}), new Date(receipt.receivedAt).toLocaleString()] }) : t("sync.notDeliveredYet") })]
						}),
						report.attachments.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 space-y-3 border-t border-border pt-3",
							children: report.attachments.map((attachment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex flex-wrap items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "break-all text-sm font-medium",
										children: attachment.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentDeliveryStatus, { attachment })]
								}), attachment.uploadState === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RetryAttachmentButton, {
									reportId: report.draft.id,
									attachmentId: attachment.id
								}) : null]
							}, attachment.id))
						}) : null
					]
				}) : storageError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					role: "alert",
					className: "mt-4 flex items-start gap-2 text-sm text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
						"aria-hidden": true,
						className: "mt-0.5 size-4 shrink-0 text-status-dnt"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: storageError })]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted-foreground",
					children: hasReportId ? t("sync.loadingReport") : t("sync.noSubmittedReport")
				}),
				report ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted-foreground",
					children: t("sync.deliveryLimits")
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 grid gap-3 sm:grid-cols-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						className: "w-full",
						onClick: () => navigate("/"),
						children: "Back to home"
					})
				})
			]
		})
	});
}
function AttachmentDeliveryStatus({ attachment }) {
	const { t } = usePrefs();
	const status = attachment.uploadState;
	const label = status === "uploaded" ? t("sync.uploaded") : status === "uploading" ? t("sync.uploading") : status === "failed" ? t("sync.photoFailed") : t("sync.photoPending");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "text-xs text-muted-foreground",
		"aria-live": "polite",
		children: [label, status === "failed" && attachment.uploadError ? `: ${attachment.uploadError}` : ""]
	});
}
function RetryAttachmentButton({ reportId, attachmentId }) {
	const { t } = usePrefs();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(false);
	const retry = async () => {
		setBusy(true);
		try {
			const result = await retryAttachmentUpload(reportId, attachmentId);
			setError(!result.ok);
		} catch {
			setError(true);
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-start gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "outline",
			className: "min-h-10",
			disabled: busy,
			onClick: () => void retry(),
			children: busy ? t("sync.uploading") : t("sync.retryUpload")
		}), error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			role: "alert",
			className: "flex items-start gap-2 text-xs text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
				"aria-hidden": true,
				className: "mt-0.5 size-3.5 shrink-0 text-status-dnt"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("sync.uploadFailedMessage") })]
		}) : null]
	});
}
export { ReportStepPage };
