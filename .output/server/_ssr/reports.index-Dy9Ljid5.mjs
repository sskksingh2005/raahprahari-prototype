import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/react.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { Button } from "./button-BwhNanlJ.mjs";
import { deriveDeliveryStatus, getActiveAccountScope, listReportsForScope } from "./router-ip9NLZv6.mjs";
// node_modules/.nitro/vite/services/ssr/assets/reports.index-Dy9Ljid5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ReportsIndexPage() {
	const scope = getActiveAccountScope();
	const [items, setItems] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let active = true;
		const subscription = (awaited) => {
			awaited.then((data) => {
				if (active) setItems(data);
			}).catch(() => {
				if (active) setError("Unable to load your reports right now.");
			});
		};
		subscription(listReportsForScope(scope));
		return () => {
			active = false;
		};
	}, [scope]);
	if (scope === "anonymous") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "rp-page-title",
				children: "My Reports"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted-foreground",
				children: "Sign in to see your saved reports here."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/report",
					search: { segment: void 0 },
					children: "Report a hazard"
				})
			})
		]
	});
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "rp-page-title",
			children: "My Reports"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-destructive",
			children: error
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 py-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex items-end justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium text-muted-foreground",
				children: "Traveller"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "rp-page-title",
				children: "My Reports"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "outline",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/report",
					search: { segment: void 0 },
					children: "New report"
				})
			})]
		}), items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "glass rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground",
			children: "You have no saved reports in this account yet."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 md:grid-cols-2",
			children: items.map(({ draft, outbox }) => {
				const status = deriveDeliveryStatus(outbox);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/reports/$id",
					params: { id: draft.id },
					className: "rp-hover-card glass block rounded-2xl border border-border p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium text-foreground",
								children: draft.payload.hazardType || "Hazard report"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "glass-pill border border-border px-2 py-1 text-xs capitalize",
								children: status.replace(/_/g, " ")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 line-clamp-3 text-sm text-muted-foreground",
							children: draft.payload.description || "No description provided."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 text-xs text-muted-foreground",
							children: [
								"Observed",
								" ",
								draft.observedAtLocal || draft.eventTime || "recently"
							]
						})
					]
				}, draft.id);
			})
		})]
	});
}
export { ReportsIndexPage as component };
