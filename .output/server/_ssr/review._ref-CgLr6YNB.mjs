import { __toESM } from "../_runtime.mjs";
import { useAppStore, usePrefs } from "./preferences-BoWpYuS4.mjs";
import { require_react } from "../_libs/react.mjs";
import { notFound } from "../_libs/@tanstack/react-router+[...].mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { ArrowLeft, ArrowRight, CircleQuestionMark, Info } from "../_libs/lucide-react3.mjs";
import { Link2Off } from "../_libs/lucide-react21.mjs";
import { Link2 } from "../_libs/lucide-react22.mjs";
import { LoaderCircle } from "../_libs/lucide-react24.mjs";
import { Button } from "./button-BwhNanlJ.mjs";
import { PageBanner } from "./page-banner-CQjN88G-.mjs";
import { Label } from "./field-Ds5sKygr.mjs";
import { Input } from "./input-BPLX6SV6.mjs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, FreshnessChip, PrototypeRibbon, RoadCode, Route$1, SEEDED_ASSIGNMENTS, assignmentOf, canClaim, isPending, relatedReports } from "./router-ip9NLZv6.mjs";
import { Textarea } from "./textarea-DnhVosJ1.mjs";
import { Checkbox } from "./checkbox-BXaFQUax.mjs";
import { AssignmentBadge, ReviewStatusBadge, SeverityLabel, useReviewClaims } from "./use-review-claims-DnvxVkSa.mjs";
// node_modules/.nitro/vite/services/ssr/assets/review._ref-CgLr6YNB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Thrown by the adapter when the server holds a newer version than `expectedVersion`. */
var ReviewVersionConflictError = class extends Error {
	constructor(message = "Version conflict") {
		super(message);
		this.name = "ReviewVersionConflictError";
	}
};
var REVIEW_ACTIONS = [
	"confirm",
	"reject",
	"merge",
	"escalate"
];
function ReviewActionDialog({ action, ...rest }) {
	const busyRef = (0, import_react.useRef)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: action !== null,
		onOpenChange: (open) => {
			if (!open && !busyRef.current) rest.onClose();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			"aria-describedby": "review-act-desc",
			onCloseAutoFocus: (e) => {
				e.preventDefault();
				rest.returnFocusRef.current?.focus();
			},
			children: action && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogForm, {
				action,
				busyRef,
				...rest
			})
		})
	});
}
function DialogForm({ action, report, mergeTargets, onSubmit, onClose, onDone, version, onConflict, busyRef }) {
	const { t } = usePrefs();
	const [rationale, setRationale] = (0, import_react.useState)("");
	const [targetRef, setTargetRef] = (0, import_react.useState)("");
	const [reason, setReason] = (0, import_react.useState)("");
	const [submitted, setSubmitted] = (0, import_react.useState)(false);
	const [pending, setPending] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [conflict, setConflict] = (0, import_react.useState)(false);
	const [confirmed, setConfirmed] = (0, import_react.useState)(false);
	const [refetchError, setRefetchError] = (0, import_react.useState)(null);
	const rationaleMissing = !rationale.trim();
	const targetMissing = action === "merge" && !targetRef;
	const reasonMissing = action === "escalate" && !reason.trim();
	const showRationaleError = submitted && rationaleMissing;
	const showTargetError = submitted && targetMissing;
	const showReasonError = submitted && reasonMissing;
	const run = async () => {
		if (busyRef.current) return;
		setSubmitted(true);
		if (rationaleMissing || targetMissing || reasonMissing) return;
		if (conflict && !confirmed) return;
		const input = {
			ref: report.ref,
			action,
			rationale: rationale.trim(),
			...action === "merge" ? { targetRef } : {},
			...action === "escalate" ? { reason: reason.trim() } : {},
			...version !== void 0 ? { expectedVersion: version } : {}
		};
		busyRef.current = true;
		setPending(true);
		setError(null);
		try {
			await onSubmit(input);
			busyRef.current = false;
			onDone(action);
		} catch (e) {
			if (e instanceof ReviewVersionConflictError) {
				setConflict(true);
				setConfirmed(false);
				setRefetchError(null);
				try {
					await onConflict?.();
				} catch (refetch) {
					setRefetchError(refetch instanceof Error && refetch.message ? refetch.message : t("review.act.errorGeneric"));
				}
				busyRef.current = false;
				setPending(false);
				return;
			}
			busyRef.current = false;
			setPending(false);
			setError(e instanceof Error && e.message ? e.message : t("review.act.errorGeneric"));
		}
	};
	const fieldError = "mt-1 text-sm font-medium text-destructive";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		noValidate: true,
		className: "grid gap-4",
		onSubmit: (e) => {
			e.preventDefault();
			run();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: t(`review.act.title.${action}`) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
				id: "review-act-desc",
				children: [
					t(`review.act.desc.${action}`),
					" ",
					t("review.act.note")
				]
			})] }),
			action === "merge" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "review-act-target",
					children: t("review.act.target")
				}),
				mergeTargets.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					id: "review-act-target",
					className: `rp-field min-h-11 w-full rounded-md border border-input bg-transparent px-3 text-base text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm dark:bg-input/30 mt-1`,
					value: targetRef,
					disabled: pending,
					"aria-invalid": showTargetError,
					"aria-describedby": showTargetError ? "review-act-target-error" : void 0,
					onChange: (e) => setTargetRef(e.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: t("review.act.targetNone")
					}), mergeTargets.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: r.ref,
						children: r.ref
					}, r.ref))]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: t("review.act.targetEmpty")
				}),
				showTargetError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					id: "review-act-target-error",
					className: fieldError,
					children: t("review.act.targetRequired")
				})
			] }),
			action === "escalate" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "review-act-reason",
					children: t("review.act.reason")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "review-act-reason",
					className: "mt-1",
					value: reason,
					disabled: pending,
					"aria-invalid": showReasonError,
					"aria-describedby": showReasonError ? "review-act-reason-error" : void 0,
					onChange: (e) => setReason(e.target.value)
				}),
				showReasonError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					id: "review-act-reason-error",
					className: fieldError,
					children: t("review.act.reasonRequired")
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "review-act-rationale",
					children: t("review.act.rationale")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: "review-act-rationale",
					className: "mt-1",
					rows: 4,
					value: rationale,
					readOnly: pending,
					"aria-invalid": showRationaleError,
					"aria-describedby": showRationaleError ? "review-act-rationale-error" : void 0,
					onChange: (e) => setRationale(e.target.value)
				}),
				showRationaleError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					id: "review-act-rationale-error",
					className: fieldError,
					children: t("review.act.rationaleRequired")
				})
			] }),
			conflict && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "alert",
				"data-testid": "review-conflict",
				className: "grid gap-3 rounded-md border border-status-caution p-3 text-sm text-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "m-0 font-semibold",
						children: t("review.conflict.notice")
					}),
					refetchError !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "m-0",
						children: t("review.conflict.refetchFailed").replace("{message}", refetchError)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							id: "review-act-confirm",
							checked: confirmed,
							disabled: pending || refetchError !== null,
							"aria-invalid": submitted && !confirmed,
							"aria-describedby": submitted && !confirmed ? "review-act-confirm-error" : void 0,
							onCheckedChange: (v) => setConfirmed(v === true)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "review-act-confirm",
							children: t("review.conflict.confirm")
						})]
					}),
					submitted && !confirmed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						id: "review-act-confirm-error",
						className: fieldError,
						children: t("review.conflict.confirmRequired")
					})
				]
			}),
			error !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "alert",
				"data-testid": "review-act-error",
				className: "grid gap-2 rounded-md border border-destructive p-3 text-sm text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "m-0",
					children: t("review.act.error").replace("{message}", error)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					className: "w-fit",
					disabled: pending,
					onClick: () => void run(),
					children: t("review.act.retry")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				disabled: pending,
				onClick: onClose,
				children: t("review.act.cancel")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "submit",
				disabled: pending,
				"aria-busy": pending,
				children: [pending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					"aria-hidden": true,
					"data-testid": "review-act-spinner",
					className: "animate-spin motion-reduce:animate-none"
				}), pending ? t("review.act.submitting") : t("review.act.submit")]
			})] })
		]
	});
}
/** Corroborated only when a reviewer recorded independent evidence. Score and count never decide it. */
function hasIndependentEvidence(group) {
	return group.length > 1 && group.some((r) => r.independent === true);
}
function ObservationEvidence({ group }) {
	const { t } = usePrefs();
	const corroborated = hasIndependentEvidence(group);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "review-observations-title",
		className: "rp-info-card glass",
		"data-testid": "review-observations",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "review-observations-title",
				children: t("review.obs.title")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-start gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					"aria-hidden": true,
					className: "mt-0.5 size-4 shrink-0"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("review.obs.intro") })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-testid": "review-corroboration",
				"data-corroborated": corroborated,
				className: "font-semibold text-foreground",
				children: corroborated ? t("review.obs.corroborated") : t("review.obs.notCorroborated")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "m-0 mt-3 list-none space-y-3 p-0",
				children: group.map((obs) => {
					const Icon = obs.independent === true ? Link2Off : obs.independent === false ? Link2 : CircleQuestionMark;
					const independence = obs.independent === true ? t("review.obs.independent") : obs.independent === false ? t("review.obs.notIndependent") : t("review.obs.independenceUnknown");
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						"data-testid": `observation-${obs.ref}`,
						className: "rounded-md border border-border p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "m-0 text-sm font-semibold text-foreground",
								children: t("review.obs.item").replace("{ref}", obs.ref)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "m-0 mt-1 text-xs text-muted-foreground",
								children: t("review.obs.received")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-[max-content_1fr]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "font-semibold text-foreground",
										children: t("review.obs.source")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "m-0 text-muted-foreground",
										children: t(`source.${obs.source}`)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "font-semibold text-foreground",
										children: t("review.obs.independence")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
										className: "m-0 flex items-center gap-1.5 text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
											"aria-hidden": true,
											className: "size-4 shrink-0"
										}), independence]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "font-semibold text-foreground",
										children: t("review.obs.rationale")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "m-0 break-words text-muted-foreground",
										children: obs.independenceRationale || t("review.obs.noRationale")
									})
								]
							})
						]
					}, obs.ref);
				})
			})
		]
	});
}
/**
* Read-only review history. It shows exactly what the review service returned
* for this reviewer, oldest first. There is no edit or delete control: a
* correction is a new entry added by the service.
*/
function ReviewTimeline({ entries, version }) {
	const { t, ago, stamp } = usePrefs();
	const ordered = [...entries].sort((a, b) => a.at - b.at);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "review-timeline-title",
		className: "rp-info-card glass",
		"data-testid": "review-timeline",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "review-timeline-title",
				children: t("review.timeline.title")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-start gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					"aria-hidden": true,
					className: "mt-0.5 size-4 shrink-0"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("review.timeline.intro") })]
			}),
			version !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "m-0 text-xs text-muted-foreground",
				children: t("review.timeline.version").replace("{version}", String(version))
			}),
			ordered.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-3 space-y-4 border-l border-border pl-4",
				children: ordered.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					"data-testid": "review-timeline-entry",
					className: "relative",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							className: "absolute top-1 -left-[1.32rem] size-2.5 rounded-full border-2 border-status-unknown bg-background"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "m-0 text-sm font-medium text-foreground",
							children: [
								entry.action === "correction" ? t("review.timeline.action.correction") : t(`review.act.${entry.action}`),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-normal text-muted-foreground",
									children: t("review.timeline.by").replace("{actor}", entry.actor)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "m-0 text-xs text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("time", {
								dateTime: new Date(entry.at).toISOString(),
								children: [
									stamp(entry.at),
									" · ",
									ago(entry.at)
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "m-0 mt-1 break-words text-sm text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-semibold text-foreground",
									children: [t("review.timeline.rationale"), ":"]
								}),
								" ",
								entry.rationale?.trim() || t("review.timeline.noRationale")
							]
						})
					]
				}, entry.id))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("review.timeline.empty") })
		]
	});
}
function RelatedList({ title, reports }) {
	const { t } = usePrefs();
	if (!reports.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "m-0 text-sm font-semibold text-foreground",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "m-0 mt-2 list-none space-y-2 p-0",
			children: reports.map((other) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/review/$ref",
						params: { ref: other.ref },
						className: "inline-flex min-h-11 items-center font-mono text-sm text-link underline underline-offset-4",
						children: other.ref
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: t(`hazard.${other.hazardType}`)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewStatusBadge, { status: other.status })
				]
			}, other.ref))
		})]
	});
}
/**
* `onDecision` is the adapter to the review backend. Without one there is no
* service to store a decision, so no decision control is shown.
*/
function ReviewDetailView({ report, onDecision, loadSnapshot }) {
	const { t, stamp, ago, place } = usePrefs();
	const { segments, reports } = useAppStore();
	const { claims, claim, release } = useReviewClaims();
	const [announcement, setAnnouncement] = (0, import_react.useState)("");
	const [dialogAction, setDialogAction] = (0, import_react.useState)(null);
	const [snapshot, setSnapshot] = (0, import_react.useState)(null);
	const actionRef = (0, import_react.useRef)(null);
	const returnFocusRef = (0, import_react.useRef)(null);
	const reportRef = report.ref;
	const refetch = (0, import_react.useCallback)(async () => {
		if (loadSnapshot) setSnapshot(await loadSnapshot(reportRef));
	}, [loadSnapshot, reportRef]);
	(0, import_react.useEffect)(() => {
		let live = true;
		loadSnapshot?.(reportRef).then((next) => {
			if (live) setSnapshot(next);
		}, () => {
			if (live) setSnapshot(null);
		});
		return () => {
			live = false;
		};
	}, [loadSnapshot, reportRef]);
	const segment = segments.find((s) => s.id === report.segmentId);
	const { assignment, assignee } = assignmentOf(report, claims, SEEDED_ASSIGNMENTS);
	const claimable = canClaim(report, claims, SEEDED_ASSIGNMENTS);
	const related = relatedReports(report, reports);
	const pending = isPending(report.status);
	const observationGroup = [report, ...related.linked];
	const act = (fn, message) => {
		fn();
		setAnnouncement(message);
		requestAnimationFrame(() => actionRef.current?.focus());
	};
	const rows = [
		[t("review.detail.kind"), t(`review.detail.kind.${report.kind}`)],
		[t("review.detail.observed"), `${stamp(report.observedAt)} · ${ago(report.observedAt)}`],
		[t("review.detail.received"), stamp(report.receivedAt)],
		[t("review.detail.landmark"), report.landmark],
		[t("review.detail.source"), t(`source.${report.source}`)],
		[t("review.detail.location"), t(`conf.${report.locationConfidence}`)],
		[t("review.detail.photos"), report.photoCount ? t("review.photos").replace("{count}", String(report.photoCount)) : t("review.detail.noPhotos")]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/review",
				className: "inline-flex min-h-11 w-fit items-center gap-1 text-sm font-medium text-link underline underline-offset-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
					"aria-hidden": true,
					className: "size-4"
				}), t("review.back")]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-labelledby": "review-report-title",
					className: "rp-info-card glass min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "review-report-title",
								className: "m-0!",
								children: t(`hazard.${report.hazardType}`)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewStatusBadge, { status: report.status })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeverityLabel, { severity: report.severity }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreshnessChip, { observationTimestamp: report.observedAt })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3! text-base text-foreground!",
							children: report.description
						}),
						report.duplicateOf && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("review.detail.duplicateOf").replace("{ref}", report.duplicateOf) }),
						report.conflictsWith && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("review.detail.conflictsWith").replace("{ref}", report.conflictsWith) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
							className: "mt-4 grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-[max-content_1fr]",
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
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid min-w-0 content-start gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							"aria-labelledby": "review-assignment-title",
							className: "rp-info-card glass",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									id: "review-assignment-title",
									children: t("review.detail.assignment")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3",
									children: pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssignmentBadge, {
										assignment,
										assignee
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewStatusBadge, { status: report.status })
								}),
								pending && assignment === "other" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("review.heldByOther").replace("{name}", assignee ?? "") }),
								claimable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									ref: actionRef,
									type: "button",
									className: "mt-3 min-h-11 w-full sm:w-auto",
									onClick: () => act(() => claim(report.ref), t("review.claimed")),
									children: t("review.claim")
								}),
								pending && assignment === "mine" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									ref: actionRef,
									type: "button",
									variant: "outline",
									className: "mt-3 min-h-11 w-full sm:w-auto",
									onClick: () => act(() => release(report.ref), t("review.released")),
									children: t("review.release")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									role: "status",
									className: announcement ? "mt-2!" : "sr-only",
									children: announcement
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							"aria-labelledby": "review-decision-title",
							className: "rp-info-card glass",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "review-decision-title",
								children: t("review.detail.decisionTitle")
							}), pending && onDecision ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
									"aria-hidden": true,
									className: "mt-0.5 size-4 shrink-0"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("review.act.note") })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								role: "group",
								"aria-label": t("review.act.group"),
								className: "mt-3 flex flex-wrap gap-2",
								children: REVIEW_ACTIONS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									onClick: (e) => {
										returnFocusRef.current = e.currentTarget;
										setDialogAction(a);
									},
									children: t(`review.act.${a}`)
								}, a))
							})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
									"aria-hidden": true,
									className: "mt-0.5 size-4 shrink-0"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: pending ? t("review.detail.decisionBlocked") : t("review.detail.decisionSettled").replace("{status}", t(`status.${report.status}`)) })]
							})]
						}),
						segment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							"aria-labelledby": "review-road-title",
							className: "rp-info-card glass",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									id: "review-road-title",
									children: t("review.detail.road")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RoadCode, {
									className: "mt-2 block",
									children: [
										segment.code,
										" · km ",
										segment.kmStart,
										"–",
										segment.kmEnd
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1!",
									children: [
										place(segment.from),
										" – ",
										place(segment.to)
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/advisories/$segmentId",
									params: { segmentId: segment.id },
									className: "mt-1 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-link underline underline-offset-4",
									children: [t("review.detail.viewRoad"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
										"aria-hidden": true,
										className: "size-4"
									})]
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObservationEvidence, { group: observationGroup }),
			snapshot && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewTimeline, {
				entries: snapshot.history,
				version: snapshot.version
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-labelledby": "review-related-title",
				className: "rp-info-card glass",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "review-related-title",
					children: t("review.detail.related")
				}), related.linked.length || related.sameSegment.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RelatedList, {
					title: t("review.detail.linked"),
					reports: related.linked
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RelatedList, {
					title: t("review.detail.sameSegment"),
					reports: related.sameSegment
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("review.detail.noRelated") })]
			}),
			onDecision && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewActionDialog, {
				action: dialogAction,
				report,
				mergeTargets: related.linked,
				onSubmit: onDecision,
				returnFocusRef,
				version: snapshot?.version,
				onConflict: refetch,
				onClose: () => setDialogAction(null),
				onDone: (a) => {
					setDialogAction(null);
					setAnnouncement(t("review.act.done").replace("{action}", t(`review.act.${a}`)));
				}
			})
		]
	});
}
function ReviewDetailPage() {
	const { t } = usePrefs();
	const { ref } = Route$1.useLoaderData();
	const { reports } = useAppStore();
	const report = reports.find((item) => item.ref === ref);
	if (!report) throw notFound();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rp-info-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageBanner, {
			eyebrow: t("review.eyebrow"),
			title: report.ref,
			description: t("review.notice")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rp-info-container rp-info-content",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrototypeRibbon, {})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewDetailView, { report })]
		})]
	});
}
export { ReviewDetailPage as component };
