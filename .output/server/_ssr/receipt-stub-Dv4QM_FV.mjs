import { setAccessTokenProvider, setAccountSession } from "./account-session-Cz43bjtr.mjs";
// node_modules/.nitro/vite/services/ssr/assets/receipt-stub-Dv4QM_FV.js
var reports = /* @__PURE__ */ new Map();
var failuresRemaining = 0;
var authFailuresRemaining = 0;
var failureKind = "network";
var droppedAcksRemaining = 0;
var mediaFailuresRemaining = 0;
var latencyMs = 0;
var receiptSequence = 0;
var requestLog = [];
var failureMessages = {
	network: "Could not reach the development receipt stub.",
	timeout: "The development receipt stub timed out.",
	auth_required: "Sign in again to continue sending reports.",
	rejected: "The development receipt stub rejected the report.",
	server: "The development receipt stub is unavailable.",
	malformed_response: "The development receipt stub returned an invalid receipt.",
	not_configured: "Sending is not configured.",
	aborted: "The sync was cancelled."
};
function failure(kind) {
	return {
		ok: false,
		error: {
			kind,
			retryable: ![
				"auth_required",
				"rejected",
				"not_configured",
				"aborted"
			].includes(kind),
			message: failureMessages[kind]
		}
	};
}
async function wait(signal) {
	if (signal.aborted) throw new DOMException("Aborted", "AbortError");
	if (latencyMs) await new Promise((resolve, reject) => {
		const timer = setTimeout(resolve, latencyMs);
		signal.addEventListener("abort", () => {
			clearTimeout(timer);
			reject(new DOMException("Aborted", "AbortError"));
		}, { once: true });
	});
}
function logRequest(method, path, reportId, headers) {
	requestLog.push({
		method,
		path,
		headers: Object.fromEntries(Object.entries(headers).map(([key, value]) => [key, key.toLowerCase() === "authorization" ? "******" : value])),
		reportId,
		at: Date.now()
	});
}
var stub = {
	async sendMetadata(payload, { signal, accessToken }) {
		await wait(signal);
		if (signal.aborted) return failure("aborted");
		logRequest("PUT", `/reports/${payload.reportId}`, payload.reportId, { Authorization: accessToken ? "******" : "none" });
		if (authFailuresRemaining > 0) {
			authFailuresRemaining -= 1;
			return failure("auth_required");
		}
		if (failuresRemaining > 0) {
			failuresRemaining -= 1;
			return failure(failureKind);
		}
		let stored = reports.get(payload.reportId);
		const duplicate = Boolean(stored);
		if (!stored) {
			stored = {
				payload,
				receipt: {
					reportId: payload.reportId,
					receiptId: `DEV-${++receiptSequence}`,
					receivedAt: (/* @__PURE__ */ new Date()).toISOString(),
					duplicate: false
				}
			};
			reports.set(payload.reportId, stored);
		}
		if (droppedAcksRemaining > 0) {
			droppedAcksRemaining -= 1;
			return failure("network");
		}
		return {
			ok: true,
			value: {
				...stored.receipt,
				duplicate
			}
		};
	},
	async requestUploadTarget(reportId, attachmentId, { signal, accessToken }) {
		await wait(signal);
		if (signal.aborted) return failure("aborted");
		logRequest("POST", `/reports/${reportId}/attachments/${attachmentId}/upload-target`, reportId, { Authorization: accessToken ? "******" : "none" });
		return {
			ok: true,
			value: {
				uploadUrl: "https://dev.invalid/upload",
				method: "PUT",
				expiresAt: new Date(Date.now() + 6e4).toISOString()
			}
		};
	},
	async uploadBlob(_target, _blob, { signal, onProgress }) {
		await wait(signal);
		if (signal.aborted) return failure("aborted");
		if (mediaFailuresRemaining > 0) {
			mediaFailuresRemaining -= 1;
			return failure("network");
		}
		onProgress?.(1);
		return {
			ok: true,
			value: void 0
		};
	}
};
var controls = {
	failNext(count, kind) {
		failuresRemaining = Math.max(0, Math.floor(count));
		failureKind = kind;
	},
	failAuthNext(count) {
		authFailuresRemaining = Math.max(0, Math.floor(count));
	},
	dropAckNext(count) {
		droppedAcksRemaining = Math.max(0, Math.floor(count));
	},
	setLatency(milliseconds) {
		latencyMs = Math.max(0, milliseconds);
	},
	received() {
		return [...reports.values()].map(({ receipt }) => ({
			reportId: receipt.reportId,
			receiptId: receipt.receiptId,
			receivedAt: receipt.receivedAt
		}));
	},
	failMediaNext(count) {
		mediaFailuresRemaining = Math.max(0, Math.floor(count));
	},
	requests() {
		return requestLog.map((entry) => ({
			...entry,
			headers: { ...entry.headers }
		}));
	},
	reset() {
		reports.clear();
		requestLog.length = 0;
		failuresRemaining = 0;
		authFailuresRemaining = 0;
		droppedAcksRemaining = 0;
		mediaFailuresRemaining = 0;
		latencyMs = 0;
		receiptSequence = 0;
		setAccessTokenProvider(null);
		setAccountSession({
			status: "signed_out",
			userId: null
		});
	}
};
if (typeof window !== "undefined") {
	window.__rpDevStub = controls;
	window.__rpDev = {
		signIn(userId, options = {}) {
			if (!userId.trim()) throw new Error("A user ID is required to sign in to the dev stub.");
			const expiresAt = typeof options.expiresInMs === "number" && options.expiresInMs > 0 ? Date.now() + options.expiresInMs : void 0;
			setAccessTokenProvider(async () => {
				if (typeof expiresAt === "number" && expiresAt <= Date.now()) {
					setAccountSession({
						status: "signed_out",
						userId: null
					});
					return null;
				}
				return "dev-receipt-stub-token";
			});
			const nextSession = {
				status: "authenticated",
				userId
			};
			if (typeof expiresAt === "number") nextSession.expiresAt = expiresAt;
			setAccountSession(nextSession);
		},
		signOut() {
			setAccessTokenProvider(null);
			setAccountSession({
				status: "signed_out",
				userId: null
			});
		}
	};
}
function getDevReceiptStub() {
	return stub;
}
export { getDevReceiptStub };
