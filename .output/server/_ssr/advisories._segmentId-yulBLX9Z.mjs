import { usePrefs } from "./preferences-BoWpYuS4.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { ArrowLeft, CircleQuestionMark } from "../_libs/lucide-react3.mjs";
import { Clock3 } from "../_libs/lucide-react14.mjs";
import { MapPin } from "../_libs/lucide-react28.mjs";
import { Route } from "../_libs/lucide-react31.mjs";
import { Button } from "./button-BwhNanlJ.mjs";
// node_modules/.nitro/vite/services/ssr/assets/advisories._segmentId-yulBLX9Z.js
var import_jsx_runtime = require_jsx_runtime();
function DetailNotFound() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rp-container grid min-h-[55vh] place-items-center py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md space-y-4 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, {
					"aria-hidden": true,
					className: "mx-auto size-8 text-status-unknown"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "rp-page-title",
					children: "Road information not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "This segment or community report is not available."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/advisories",
						children: "Back to search"
					})
				})
			]
		})
	});
}
function Banner({ segment, title, reportRef }) {
	const { place } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "photo-surface relative isolate overflow-hidden border-b border-border text-foreground",
		style: {
			backgroundImage: "linear-gradient(90deg, var(--photo-scrim-a), var(--photo-scrim-b) 60%, var(--photo-scrim-c)), url('/img/banner-strip.png')",
			backgroundPosition: "center",
			backgroundSize: "cover"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rp-container py-4 sm:py-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/advisories",
					className: "mb-2 inline-flex min-h-11 w-fit items-center gap-2 text-sm text-link hover:text-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring sm:mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
						"aria-hidden": true,
						className: "size-4"
					}), "Back to search"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-1 flex items-center gap-2 text-sm font-semibold text-link",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
							"aria-hidden": true,
							className: "size-4"
						}),
						"Mountain road",
						reportRef && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono tracking-normal",
							children: ["· ", reportRef]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "rp-page-title rp-wrap-anywhere max-w-4xl",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted-foreground sm:text-base",
					children: [
						place(segment.from),
						" → ",
						place(segment.to)
					]
				}),
				!reportRef && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouteSummary, { segment })
			]
		})
	});
}
function RouteSummary({ segment }) {
	const { duration } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
		className: "mt-4 grid grid-cols-1 gap-y-2 border-t border-border pt-3 text-xs sm:grid-cols-3 sm:text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryItem, {
				icon: Route,
				label: `${segment.distanceKm} km`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryItem, {
				icon: Clock3,
				label: `~ ${duration(segment.typicalMinutes)}`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryItem, {
				icon: MapPin,
				label: "Elevation unavailable"
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "basis-full text-xs text-muted-foreground",
		children: "All route estimates are illustrative."
	})] });
}
function SummaryItem({ icon: Icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 items-center gap-2 sm:border-r sm:border-border sm:px-3 sm:first:pl-0 sm:last:border-0 sm:last:pr-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				"aria-hidden": true,
				className: "size-4 shrink-0 text-link"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: "sr-only",
				children: "Illustrative route estimate"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
				label,
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: "(illustrative)"
				})
			] })
		]
	});
}
export { Banner, DetailNotFound as notFoundComponent };
