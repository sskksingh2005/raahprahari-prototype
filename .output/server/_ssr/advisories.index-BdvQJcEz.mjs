import { __toESM } from "../_runtime.mjs";
import { cn, getAdvisorySourceTimestamp, useAppStore, usePrefs } from "./preferences-BoWpYuS4.mjs";
import { require_react } from "../_libs/react.mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { Button } from "./button-BwhNanlJ.mjs";
import { PrototypeRibbon, ScreenEmpty, ScreenError, ScreenLoading } from "./router-ip9NLZv6.mjs";
import { AdvisoryCard } from "./advisory-card-BwZ-GS4_.mjs";
import { useScreenState } from "./use-screen-state-VkDxgmsG.mjs";
// node_modules/.nitro/vite/services/ssr/assets/advisories.index-BdvQJcEz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdvisoriesPage() {
	const { t } = usePrefs();
	const { segments, advisories } = useAppStore();
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)("default");
	const { status, retry } = useScreenState(() => segments.every((segment) => advisories.has(segment.id)));
	const filteredSegments = segments.filter((segment) => {
		const advisory = advisories.get(segment.id);
		if (!advisory) return false;
		if (filter === "issues") return advisory.level === "caution" || advisory.level === "avoid" || advisory.level === "do_not_travel";
		if (filter === "official") return !!advisory.restriction;
		if (filter === "unknown") return advisory.level === "unknown" || advisory.stale;
		return true;
	});
	const sourceTime = (id) => {
		const advisory = advisories.get(id);
		return (advisory && getAdvisorySourceTimestamp(advisory)) ?? -Infinity;
	};
	const visibleSegments = sort === "freshness" ? [...filteredSegments].sort((a, b) => sourceTime(b.id) - sourceTime(a.id)) : filteredSegments;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "advisories-list-page pb-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "advisories-list-banner photo-surface",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rp-container py-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-1 inline-flex items-center gap-2 text-xs font-semibold text-[var(--orange-on-dark)]",
						children: t("hero.eyebrow")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "rp-page-title max-w-4xl text-[var(--photo-text)]",
						children: t("adv.title")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-3xl text-sm text-[var(--photo-text-muted)]",
						children: t("adv.body")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrototypeRibbon, {})
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rp-container space-y-5 py-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "advisories-filter-scroll",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex w-max min-w-full flex-nowrap gap-2 md:w-auto md:min-w-0 md:flex-wrap",
						role: "group",
						"aria-label": t("adv.filter"),
						children: [
							"all",
							"issues",
							"official",
							"unknown"
						].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: filter === value ? "secondary" : "outline",
							"aria-pressed": filter === value,
							className: cn("advisories-filter-pill glass min-h-11 shrink-0 rounded-md", filter === value && "text-link"),
							onClick: () => setFilter(value),
							children: t(value === "all" ? "adv.filterAll" : value === "issues" ? "adv.filterIssues" : value === "official" ? "adv.filterOfficial" : "adv.filterUnknown")
						}, value))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "adv-sort",
						className: "text-muted-foreground",
						children: t("adv.sort")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						id: "adv-sort",
						value: sort,
						onChange: (e) => setSort(e.target.value),
						className: "glass min-h-11 rounded-md border border-border px-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "default",
							children: t("adv.sortDefault")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "freshness",
							children: t("adv.sortFreshness")
						})]
					})]
				}),
				status === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenLoading, {}) : status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenError, { onRetry: retry }) : !segments.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenEmpty, {
					title: t("map.emptyTitle"),
					message: t("map.emptyBody")
				}) : visibleSegments.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid min-w-0 grid-cols-1 items-stretch gap-3 md:grid-cols-2 xl:grid-cols-3",
					children: visibleSegments.map((segment) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdvisoryCard, {
						segment,
						className: "glass",
						showRestrictionDetail: true
					}, segment.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenEmpty, {
					title: t("adv.empty"),
					message: t("help.reminder")
				})
			]
		})]
	});
}
export { AdvisoriesPage as component };
