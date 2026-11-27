import { cn, getAdvisorySourceTimestamp, useAppStore, usePrefs } from "./preferences-BoWpYuS4.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { ArrowRight, Info, ShieldCheck, TriangleAlert } from "../_libs/lucide-react3.mjs";
import { ChevronRight } from "../_libs/lucide-react10.mjs";
import { Clock3 } from "../_libs/lucide-react14.mjs";
import { UsersRound } from "../_libs/lucide-react32.mjs";
import { ActionBadge, CacheTimeLabel, FreshnessChip, OfficialBadge, RoadCode } from "./router-ip9NLZv6.mjs";
// node_modules/.nitro/vite/services/ssr/assets/advisory-card-BwZ-GS4_.js
var import_jsx_runtime = require_jsx_runtime();
function AdvisoryCard({ segment, className, variant = "default", communityReport, showRestrictionDetail = false }) {
	const { t, place, ago, stamp } = usePrefs();
	const { advisories, advisoryCacheTimestamp: cacheTimestamp } = useAppStore();
	const advisory = advisories.get(segment.id);
	if (!advisory) throw new Error(`Missing advisory for segment "${segment.id}"`);
	const report = advisory.evidence[0];
	const activeClosure = advisory.restriction?.type === "road_closed";
	const sources = [...advisory.evidence.length > 0 ? [t("source.community")] : [], ...advisory.restriction ? [t("source.official")] : []];
	if (variant === "community-report") {
		if (!communityReport) throw new Error("A community report is required for the community-report card");
		const level = communityReport.severity === "high" ? "avoid" : "caution";
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
			"data-level": level,
			className: cn("rp-card rp-enter rp-status-card glass rounded-xl", className),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/advisories/$segmentId",
				params: { segmentId: communityReport.ref },
				className: "block rounded-[inherit] p-4 focus-visible:outline-offset-[-3px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base leading-snug font-semibold",
							children: t(`hazard.${communityReport.hazardType}`)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBadge, { level })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 text-sm text-muted-foreground",
						children: communityReport.description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: [
							segment.code,
							" · ",
							communityReport.landmark,
							" · Observed",
							" ",
							ago(communityReport.observedAt)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreshnessChip, { observationTimestamp: communityReport.observedAt }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheTimeLabel, { timestamp: cacheTimestamp }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-blue-on-dark",
								children: "Community report, not an official closure"
							})
						]
					})
				]
			})
		});
	}
	if (variant === "home-featured") {
		const sourceTimestamp = getAdvisorySourceTimestamp(advisory);
		const lastUpdated = sourceTimestamp === void 0 ? t("level.unknown") : `${ago(sourceTimestamp)} · ${stamp(sourceTimestamp)}`;
		const leadHazard = advisory.evidence.find((r) => r.kind === "hazard") ?? report;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
			"data-level": advisory.level,
			className: cn("home-advisory glass-accent", className),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/advisories/$segmentId",
				params: { segmentId: segment.id },
				className: "home-advisory-link",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "home-advisory-kicker",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { "aria-hidden": true }), "Road advisory"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "home-advisory-status",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBadge, {
							level: advisory.level,
							size: "lg",
							className: "home-avoid-badge"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RoadCode, {
							className: "home-advisory-road",
							children: [
								segment.code,
								" · km ",
								segment.kmStart,
								"–",
								segment.kmEnd
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "home-advisory-description",
						children: [
							place(segment.from),
							" – ",
							place(segment.to),
							":",
							" ",
							leadHazard?.description ?? t("copy.noRecent")
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "home-advisory-details",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { "aria-hidden": true }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Official restriction:" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: advisory.restriction?.title ?? "No current official information" })
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersRound, { "aria-hidden": true }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Evidence:" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: t(`basis.${advisory.basis}`) })
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { "aria-hidden": true }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Last updated:" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: lastUpdated })
							] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "home-advisory-footer glass-pill",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { "aria-hidden": true }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Illustrative synthetic information" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { "aria-hidden": true })
						]
					})
				]
			})
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
		"data-level": advisory.level,
		className: cn("rp-card rp-enter rp-status-card glass rounded-xl", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/advisories/$segmentId",
			params: { segmentId: segment.id },
			className: "block rounded-[inherit] p-4 focus-visible:outline-offset-[-3px]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RoadCode, { children: [
							segment.code,
							" · km ",
							segment.kmStart,
							"–",
							segment.kmEnd
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "rp-wrap-anywhere mt-1 text-base leading-snug font-semibold",
							children: [
								place(segment.from),
								" – ",
								place(segment.to)
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBadge, { level: advisory.level })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: report?.description ?? t("copy.noRecent")
				}),
				(showRestrictionDetail || activeClosure) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-semibold text-foreground",
							children: [t("map.restriction"), ":"]
						}),
						" ",
						advisory.restriction?.title ?? "No current official information"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreshnessChip, { observationTimestamp: advisory.latestObservationAt }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheTimeLabel, { timestamp: cacheTimestamp }),
						advisory.restriction && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfficialBadge, { label: t("map.restriction") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: sources.length ? sources.join(" · ") : t("source.unknown")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
							"aria-hidden": true,
							className: "rp-arrow ml-auto size-4 text-link"
						})
					]
				})
			]
		})
	});
}
export { AdvisoryCard };
