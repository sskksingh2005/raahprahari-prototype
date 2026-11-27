import { __toESM } from "../_runtime.mjs";
import { cn, useAppStore, usePrefs } from "./preferences-BoWpYuS4.mjs";
import { require_react } from "../_libs/react.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { Camera } from "../_libs/lucide-react7.mjs";
import { ChevronRight } from "../_libs/lucide-react10.mjs";
import { Button } from "./button-BwhNanlJ.mjs";
import { PageBanner } from "./page-banner-CQjN88G-.mjs";
import { PrototypeRibbon, QUEUES, REVIEW_HAZARDS, Route$2, SEEDED_ASSIGNMENTS, SETTLED_OUTCOMES, SEVERITIES, ScreenEmpty, buildQueue, canClaim, defaultSort, queueCounts } from "./router-ip9NLZv6.mjs";
import { AssignmentBadge, ReviewStatusBadge, SeverityLabel, selectClass, useReviewClaims } from "./use-review-claims-DnvxVkSa.mjs";
// node_modules/.nitro/vite/services/ssr/assets/review.index-CnULixC0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function QueueCard({ item, queue, claimable, onClaim, onRelease }) {
	const { t, ago, place } = usePrefs();
	const { segments } = useAppStore();
	const { report, assignment, assignee } = item;
	const segment = segments.find((s) => s.id === report.segmentId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		"data-testid": `queue-item-${report.ref}`,
		"data-severity": report.severity,
		className: "rp-info-card glass rp-review-card rp-hover-card list-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "m-0 min-w-0 text-base font-semibold text-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/review/$ref",
						params: { ref: report.ref },
						className: "inline-flex min-h-11 items-center gap-1 underline-offset-4 hover:underline",
						children: [
							t(`hazard.${report.hazardType}`),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "sr-only",
								children: [", ", report.ref]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
								"aria-hidden": true,
								className: "size-4"
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewStatusBadge, { status: report.status })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "m-0! font-mono text-xs",
				children: [report.ref, segment ? ` · ${segment.code} ${place(segment.from)}–${place(segment.to)}` : ""]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "m-0! mt-2! line-clamp-2 text-sm",
				children: report.description
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeverityLabel, { severity: report.severity }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("review.received").replace("{time}", ago(report.receivedAt)) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {
							"aria-hidden": true,
							className: "size-3.5"
						}), t("review.photos").replace("{count}", String(report.photoCount))]
					}),
					queue !== "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssignmentBadge, {
						assignment,
						assignee
					})
				]
			}),
			queue === "needs_review" && claimable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				className: "mt-3 min-h-11",
				"aria-label": `${t("review.claim")} ${report.ref}`,
				onClick: () => onClaim(report.ref),
				children: t("review.claim")
			}),
			queue === "assigned" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				className: "mt-3 min-h-11",
				"aria-label": `${t("review.release")} ${report.ref}`,
				onClick: () => onRelease(report.ref),
				children: t("review.release")
			})
		]
	});
}
function FilterSelect({ label, value, options, onChange, allLabel }) {
	const id = (0, import_react.useId)();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-w-0 gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			htmlFor: id,
			className: "text-sm font-medium text-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
			id,
			value: value ?? "",
			onChange: (event) => onChange(event.target.value || void 0),
			className: selectClass,
			children: [allLabel !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: "",
				children: allLabel
			}), options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: option.value,
				children: option.label
			}, option.value))]
		})]
	});
}
function ReviewQueueView({ search, onSearch }) {
	const { t } = usePrefs();
	const { reports } = useAppStore();
	const { claims, claim, release } = useReviewClaims();
	const queue = search.queue ?? "needs_review";
	const [announcement, setAnnouncement] = (0, import_react.useState)("");
	const statusRef = (0, import_react.useRef)(null);
	const counts = (0, import_react.useMemo)(() => queueCounts(reports, claims, SEEDED_ASSIGNMENTS), [reports, claims]);
	const items = (0, import_react.useMemo)(() => buildQueue(reports, queue, claims, SEEDED_ASSIGNMENTS, search), [
		reports,
		queue,
		claims,
		search
	]);
	const filtered = Boolean(search.hazard || search.severity || search.assignee || search.outcome);
	const update = (patch) => {
		const next = {
			...search,
			...patch
		};
		for (const key of Object.keys(next)) if (next[key] === void 0) delete next[key];
		onSearch(next);
	};
	const announce = (message) => {
		setAnnouncement(message);
		requestAnimationFrame(() => statusRef.current?.focus());
	};
	const sortOptions = [
		"oldest",
		"newest",
		"severity"
	].map((value) => ({
		value,
		label: t(`review.sort.${value}`)
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			"aria-label": t("review.queuesLabel"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "m-0 grid list-none grid-cols-1 gap-2 p-0 min-[560px]:grid-cols-3",
				children: QUEUES.map((name) => {
					const active = name === queue;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/review",
						search: { queue: name },
						"aria-current": active ? "page" : void 0,
						className: cn("glass flex min-h-14 items-center justify-between gap-2 rounded-md border-b-4 px-4 py-2 text-sm font-semibold transition-colors motion-reduce:transition-none", active ? "glass-accent border-brand-orange/50 border-b-brand-orange text-foreground" : "border-border border-b-border text-muted-foreground hover:border-b-brand-orange/50 hover:text-foreground"),
						children: [
							t(`review.queue.${name}`),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"aria-hidden": true,
								"data-testid": `queue-count-${name}`,
								className: cn("min-w-8 rounded-full px-2.5 py-0.5 text-center font-mono text-sm", active ? "bg-brand-orange text-report-foreground" : "glass-pill text-foreground"),
								children: counts[name]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "sr-only",
								children: [", ", counts[name]]
							})
						]
					}) }, name);
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			"aria-labelledby": "review-queue-title",
			className: "grid gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "review-queue-title",
					className: "m-0 font-display text-xl font-semibold",
					children: t(`review.queue.${queue}`)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "m-0 mt-1 text-sm text-muted-foreground",
					children: t(`review.queueHelp.${queue}`)
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
					className: "glass-strong m-0 grid min-w-0 gap-3 rounded-xl p-4 min-[560px]:grid-cols-2 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "px-1 text-sm font-semibold text-foreground",
							children: t("review.filtersLabel")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
							label: t("review.filter.hazard"),
							value: search.hazard,
							allLabel: t("review.filter.all"),
							options: REVIEW_HAZARDS.map((value) => ({
								value,
								label: t(`hazard.${value}`)
							})),
							onChange: (hazard) => update({ hazard })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
							label: t("review.filter.severity"),
							value: search.severity,
							allLabel: t("review.filter.all"),
							options: SEVERITIES.map((value) => ({
								value,
								label: t(`review.severity.${value}`)
							})),
							onChange: (severity) => update({ severity })
						}),
						queue === "needs_review" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
							label: t("review.filter.assignee"),
							value: search.assignee,
							allLabel: t("review.filter.all"),
							options: [{
								value: "unassigned",
								label: t("review.assignment.unassigned")
							}, {
								value: "other",
								label: t("review.assignment.otherAny")
							}],
							onChange: (assignee) => update({ assignee })
						}),
						queue === "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
							label: t("review.filter.outcome"),
							value: search.outcome,
							allLabel: t("review.filter.all"),
							options: SETTLED_OUTCOMES.map((value) => ({
								value,
								label: t(`status.${value}`)
							})),
							onChange: (outcome) => update({ outcome })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
							label: t("review.filter.sort"),
							value: search.sort ?? defaultSort(queue),
							options: sortOptions,
							onChange: (sort) => update({ sort })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-testid": "queue-result-count",
						"aria-live": "polite",
						className: "m-0 text-sm text-muted-foreground",
						children: t("review.resultCount").replace("{count}", String(items.length))
					}), filtered && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						className: "min-h-11",
						onClick: () => onSearch({
							queue: search.queue,
							sort: search.sort
						}),
						children: t("review.filter.clear")
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					ref: statusRef,
					role: "status",
					tabIndex: -1,
					className: cn("m-0 text-sm text-foreground outline-none", !announcement && "sr-only"),
					children: announcement
				}),
				items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenEmpty, {
					title: t(`review.queue.${queue}`),
					message: filtered ? t("review.empty.filtered") : t(`review.empty.${queue}`)
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "m-0 grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-3",
					children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueueCard, {
						item,
						queue,
						claimable: canClaim(item.report, claims, SEEDED_ASSIGNMENTS),
						onClaim: (ref) => {
							claim(ref);
							announce(t("review.claimed"));
						},
						onRelease: (ref) => {
							release(ref);
							announce(t("review.released"));
						}
					}, item.report.ref))
				})
			]
		})]
	});
}
function ReviewQueuePage() {
	const { t } = usePrefs();
	const search = Route$2.useSearch();
	const navigate = Route$2.useNavigate();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rp-info-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageBanner, {
			eyebrow: t("review.eyebrow"),
			title: t("review.title"),
			description: t("review.description")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rp-info-container rp-info-content",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrototypeRibbon, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "m-0 min-w-0 text-sm text-muted-foreground sm:flex-1",
					children: t("review.notice")
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewQueueView, {
				search,
				onSearch: (next) => void navigate({
					search: next,
					replace: true
				})
			})]
		})]
	});
}
export { ReviewQueuePage as component };
