import { __toESM } from "../_runtime.mjs";
import { SEGMENTS, cn, segmentById, usePrefs } from "./preferences-BoWpYuS4.mjs";
import { require_react } from "../_libs/react.mjs";
import { useNavigate } from "../_libs/@tanstack/react-router+[4...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { ArrowLeft, ShieldAlert } from "../_libs/lucide-react3.mjs";
import { Lock } from "../_libs/lucide-react27.mjs";
import { Button } from "./button-BwhNanlJ.mjs";
import { useAccountSession } from "./account-session-Cz43bjtr.mjs";
import { PageBanner } from "./page-banner-CQjN88G-.mjs";
import { Field } from "./field-Ds5sKygr.mjs";
import { Input } from "./input-BPLX6SV6.mjs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, LoginDialog, PrototypeRibbon } from "./router-ip9NLZv6.mjs";
import { AdvisoryCard } from "./advisory-card-BwZ-GS4_.mjs";
import { Checkbox } from "./checkbox-BXaFQUax.mjs";
// node_modules/.nitro/vite/services/ssr/assets/official-dNW0j1on.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Resolves the free-text segment field to a known segment id, or undefined. */
function resolveSegment(value) {
	const needle = value.trim().toLowerCase();
	if (!needle) return void 0;
	return segmentById(needle);
}
/**
* Shows the public advisory for a segment with the shared AdvisoryCard, so the
* official workspace presents official/community status exactly as the public
* pages do. Renders nothing when the text does not match a known segment id.
*/
function OfficialSegmentStatus({ segmentText, heading, note }) {
	const headingId = (0, import_react.useId)();
	const segment = resolveSegment(segmentText);
	if (!segment) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": headingId,
		className: "mt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				id: headingId,
				className: "mb-2 text-sm font-semibold text-foreground",
				children: heading
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdvisoryCard, {
				segment,
				showRestrictionDetail: true
			}),
			note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: note
			})
		]
	});
}
/**
* Confirmation step before an official notice is published.
*
* Radix Dialog supplies role="dialog", aria-modal, the focus trap, Escape and
* focus return to the button that opened it. While the notice is being sent,
* Escape, outside clicks and the close button are all ignored, so the request
* cannot be abandoned half-way.
*/
function ConsequentialChangeDialog({ open, draft, submitting, onConfirm, onCancel, returnFocusRef }) {
	const { t, stamp } = usePrefs();
	const [acknowledged, setAcknowledged] = (0, import_react.useState)(false);
	const ackId = (0, import_react.useId)();
	const when = (value) => {
		const ms = Date.parse(value);
		return Number.isNaN(ms) ? "–" : stamp(ms);
	};
	const close = (next) => {
		if (next || submitting) return;
		setAcknowledged(false);
		onCancel();
	};
	const rows = [
		[t("official.field.sourceReference"), draft.sourceReference],
		[t("official.field.segment"), draft.segment],
		[t("official.field.restriction"), t(`official.restriction.${draft.restriction}`)],
		[t("official.dialog.effective"), t("official.dialog.range").replace("{start}", when(draft.effectiveStartTime)).replace("{end}", when(draft.effectiveEndTime))],
		[t("official.field.publicationTime"), when(draft.publicationTime)],
		[t("official.field.jurisdiction"), draft.jurisdiction]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: close,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			showCloseButton: !submitting,
			"aria-busy": submitting || void 0,
			onEscapeKeyDown: (event) => {
				if (submitting) event.preventDefault();
			},
			onInteractOutside: (event) => {
				if (submitting) event.preventDefault();
			},
			onCloseAutoFocus: (event) => {
				const target = returnFocusRef?.current;
				if (target?.isConnected) {
					event.preventDefault();
					target.focus();
				}
			},
			className: "max-h-[calc(100dvh-2rem)] overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "font-display",
					children: t("official.dialog.title")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t("official.dialog.description") })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
					className: "grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-[max-content_1fr]",
					children: rows.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "contents",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "font-semibold text-foreground",
							children: label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "m-0 mb-2 break-words text-muted-foreground sm:mb-0",
							children: value
						})]
					}, label))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
						id: ackId,
						checked: acknowledged,
						onCheckedChange: (value) => setAcknowledged(value === true),
						disabled: submitting,
						className: "mt-0.5"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: ackId,
						className: "text-sm text-foreground",
						children: t("official.dialog.ack")
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					className: "min-h-11",
					onClick: () => close(false),
					disabled: submitting,
					children: t("official.dialog.back")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					className: "min-h-11",
					onClick: onConfirm,
					disabled: !acknowledged || submitting,
					children: submitting ? t("official.dialog.publishing") : t("official.dialog.publish")
				})] })
			]
		})
	});
}
var ENDPOINT = "/api/official/notices";
async function publishNotice(draft) {
	try {
		const res = await fetch(ENDPOINT, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(draft)
		});
		if (res.ok) {
			const data = await res.json().catch(() => ({}));
			return {
				kind: "success",
				noticeId: data && typeof data === "object" && "id" in data ? String(data.id) : ""
			};
		}
		if (res.status === 401) return { kind: "session-expired" };
		if (res.status === 403) return { kind: "forbidden" };
		return {
			kind: "error",
			reason: "server",
			status: res.status
		};
	} catch {
		return {
			kind: "error",
			reason: "network"
		};
	}
}
var bannerClass = "rounded-lg border px-3 py-2.5 text-sm text-foreground [&_strong]:font-semibold";
function PublishFlow({ draft, onRequestSignIn, onSuccess }) {
	const { t } = usePrefs();
	const [phase, setPhase] = (0, import_react.useState)("idle");
	const [result, setResult] = (0, import_react.useState)(null);
	const [openCount, setOpenCount] = (0, import_react.useState)(0);
	const inFlight = (0, import_react.useRef)(false);
	const reviewRef = (0, import_react.useRef)(null);
	async function handleConfirm() {
		if (inFlight.current) return;
		inFlight.current = true;
		setPhase("submitting");
		try {
			const outcome = await publishNotice(draft);
			setResult(outcome);
			setPhase("idle");
			if (outcome.kind === "success") onSuccess?.(outcome.noticeId);
		} finally {
			inFlight.current = false;
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			result?.kind === "forbidden" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "alert",
				className: cn(bannerClass, "border-status-dnt bg-status-dnt/10"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: t("official.result.forbiddenTitle") }),
					" ",
					t("official.result.forbidden")
				]
			}),
			result?.kind === "session-expired" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "alert",
				className: cn(bannerClass, "border-status-caution bg-status-caution/10"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: t("official.result.expiredTitle") }),
					" ",
					t("official.result.expired"),
					onRequestSignIn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						className: "mt-2 min-h-11",
						onClick: onRequestSignIn,
						children: t("official.result.signIn")
					})
				]
			}),
			result?.kind === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: cn(bannerClass, "border-status-dnt bg-status-dnt/10"),
				children: result.reason === "network" ? t("official.result.network") : t("official.result.server").replace("{status}", String(result.status ?? ""))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				ref: reviewRef,
				type: "button",
				className: "min-h-11",
				onClick: () => {
					setResult(null);
					setOpenCount((n) => n + 1);
					setPhase("confirming");
				},
				disabled: phase !== "idle",
				children: t("official.review")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConsequentialChangeDialog, {
				open: phase !== "idle",
				draft,
				submitting: phase === "submitting",
				onConfirm: () => void handleConfirm(),
				onCancel: () => setPhase("idle"),
				returnFocusRef: reviewRef
			}, openCount)
		]
	});
}
var RESTRICTION_TYPES = [
	"Closed",
	"One-lane",
	"Vehicles banned"
];
var EMPTY = {
	sourceReference: "",
	publicationTime: "",
	effectiveStartTime: "",
	effectiveEndTime: "",
	segment: "",
	restriction: "Closed",
	jurisdiction: ""
};
/** Field order on screen, used to focus the first invalid field. */
var FIELD_ORDER = [
	"sourceReference",
	"publicationTime",
	"effectiveStartTime",
	"effectiveEndTime",
	"segment",
	"restriction",
	"jurisdiction"
];
function validateNotice(data) {
	const errors = {};
	const source = data.sourceReference.trim();
	if (!source) errors.sourceReference = "official.err.sourceRequired";
	else if (!/^[A-Za-z0-9/#\s-]+$/.test(source)) errors.sourceReference = "official.err.sourceFormat";
	if (!data.publicationTime) errors.publicationTime = "official.err.publicationRequired";
	if (!data.effectiveStartTime) errors.effectiveStartTime = "official.err.startRequired";
	if (!data.effectiveEndTime) errors.effectiveEndTime = "official.err.endRequired";
	else if (data.effectiveStartTime && data.effectiveEndTime <= data.effectiveStartTime) errors.effectiveEndTime = "official.err.endBeforeStart";
	if (!data.segment.trim()) errors.segment = "official.err.segmentRequired";
	if (!data.jurisdiction.trim()) errors.jurisdiction = "official.err.jurisdictionRequired";
	return errors;
}
var fieldId = (name) => `official-${name}`;
function OfficialNoticeForm() {
	const { t } = usePrefs();
	const [formData, setFormData] = (0, import_react.useState)(EMPTY);
	const [errors, setErrors] = (0, import_react.useState)({});
	const [draft, setDraft] = (0, import_react.useState)(null);
	const [published, setPublished] = (0, import_react.useState)(null);
	const readyRef = (0, import_react.useRef)(null);
	const publishedRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (draft) readyRef.current?.focus();
	}, [draft]);
	(0, import_react.useEffect)(() => {
		if (published) publishedRef.current?.focus();
	}, [published]);
	const handleChange = (event) => {
		const name = event.target.name;
		const value = event.target.value;
		setFormData((prev) => ({
			...prev,
			[name]: value
		}));
		setDraft(null);
		if (errors[name]) setErrors((prev) => ({
			...prev,
			[name]: void 0
		}));
	};
	const handleSubmit = (event) => {
		event.preventDefault();
		setPublished(null);
		const found = validateNotice(formData);
		setErrors(found);
		const firstInvalid = FIELD_ORDER.find((name) => found[name]);
		if (firstInvalid) {
			setDraft(null);
			document.getElementById(fieldId(firstInvalid))?.focus();
			return;
		}
		setDraft(formData);
	};
	const err = (name) => errors[name] ? t(errors[name]) : void 0;
	const textField = (name, label, type, extra = {}) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
		id: fieldId(name),
		label: t(label),
		description: extra.description ? t(extra.description) : void 0,
		error: err(name),
		required: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			type,
			name,
			value: formData[name],
			onChange: handleChange,
			list: extra.list,
			autoComplete: extra.autoComplete ?? "off"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-labelledby": "official-form-title",
				className: "rp-info-card glass",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "official-form-title",
						children: t("official.formTitle")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("official.requiredNote") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSubmit,
						noValidate: true,
						className: "mt-4 grid gap-4",
						children: [
							textField("sourceReference", "official.field.sourceReference", "text", { description: "official.help.sourceReference" }),
							textField("publicationTime", "official.field.publicationTime", "datetime-local"),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 md:grid-cols-2",
								children: [textField("effectiveStartTime", "official.field.effectiveStart", "datetime-local"), textField("effectiveEndTime", "official.field.effectiveEnd", "datetime-local")]
							}),
							textField("segment", "official.field.segment", "text", {
								description: "official.help.segment",
								list: "official-segment-ids"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
								id: "official-segment-ids",
								children: SEGMENTS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: s.id,
									children: [
										s.code,
										" · km ",
										s.kmStart,
										"–",
										s.kmEnd
									]
								}, s.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfficialSegmentStatus, {
								segmentText: formData.segment,
								heading: t("official.statusHeading")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: fieldId("restriction"),
								label: t("official.field.restriction"),
								required: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									id: fieldId("restriction"),
									name: "restriction",
									value: formData.restriction,
									onChange: handleChange,
									required: true,
									className: "rp-field min-h-11 w-full rounded-md border border-input bg-transparent px-3 text-base text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm dark:bg-input/30",
									children: RESTRICTION_TYPES.map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: type,
										children: t(`official.restriction.${type}`)
									}, type))
								})
							}),
							textField("jurisdiction", "official.field.jurisdiction", "text", { description: "official.help.jurisdiction" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								className: "min-h-11 w-full sm:w-fit",
								children: t("official.submit")
							})
						]
					})
				]
			}),
			draft && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-labelledby": "official-ready-title",
				className: "rp-info-card glass",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "official-ready-title",
						ref: readyRef,
						tabIndex: -1,
						className: "outline-none",
						children: t("official.readyTitle")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("official.draftReady") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublishFlow, {
							draft,
							onSuccess: (noticeId) => {
								setPublished({
									noticeId,
									segment: draft.segment
								});
								setDraft(null);
							}
						})
					})
				]
			}),
			published && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rp-info-card glass",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					ref: publishedRef,
					role: "status",
					tabIndex: -1,
					className: "m-0! rounded-lg border border-status-clear bg-status-clear/10 px-3 py-2.5 text-sm font-medium text-foreground! outline-none",
					children: t("official.result.success").replace("{id}", published.noticeId)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfficialSegmentStatus, {
					segmentText: published.segment,
					heading: t("official.publishedStatusHeading"),
					note: t("official.statusNote")
				})]
			})
		]
	});
}
function OfficialPageRoute() {
	const { t } = usePrefs();
	const navigate = useNavigate();
	const session = useAccountSession();
	const [loginOpen, setLoginOpen] = (0, import_react.useState)(false);
	const signInRef = (0, import_react.useRef)(null);
	if (!(session.status === "authenticated" && session.role === "official")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-[80vh] items-center justify-center px-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass-strong w-full max-w-md space-y-6 rounded-xl p-8 text-center text-card-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-16 h-16 bg-status-caution/10 border border-status-caution/20 rounded-full flex items-center justify-center mx-auto text-status-caution",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, {
						"aria-hidden": true,
						className: "w-8 h-8"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "rp-page-title text-foreground",
						children: "Restricted Official Portal"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "This area is restricted to authorized district authorities and road maintenance officers only. Public access is not permitted."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pt-2 space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						ref: signInRef,
						type: "button",
						onClick: () => setLoginOpen(true),
						className: "w-full",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {
							"aria-hidden": true,
							className: "w-4 h-4"
						}), "Sign in with Official Credentials"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "secondary",
						onClick: () => navigate({ to: "/" }),
						className: "w-full",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
							"aria-hidden": true,
							className: "w-4 h-4"
						}), "Return to Public Home"]
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginDialog, {
			open: loginOpen,
			onOpenChange: setLoginOpen,
			returnFocusRef: signInRef
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rp-info-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageBanner, {
			eyebrow: t("official.eyebrow"),
			title: t("official.title"),
			description: t("official.description")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rp-info-container rp-info-content",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-2xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex flex-col items-start gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrototypeRibbon, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "m-0 text-sm text-muted-foreground",
						children: t("official.notice")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfficialNoticeForm, {})]
			})
		})]
	});
}
export { OfficialPageRoute as component };
