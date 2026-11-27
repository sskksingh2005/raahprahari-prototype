import { __toESM } from "../_runtime.mjs";
import { usePrefs } from "./preferences-BoWpYuS4.mjs";
import { require_react } from "../_libs/react.mjs";
import { Outlet } from "../_libs/@tanstack/react-router+[2...].mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { useRouterState } from "../_libs/@tanstack/react-router+[4...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { ArrowLeft, ArrowRight, Map, Search, ShieldAlert, ShieldCheck, TriangleAlert } from "../_libs/lucide-react3.mjs";
import { Clock3 } from "../_libs/lucide-react14.mjs";
import { FileText } from "../_libs/lucide-react18.mjs";
import { Landmark } from "../_libs/lucide-react20.mjs";
import { LockKeyhole } from "../_libs/lucide-react26.mjs";
import { Mountain } from "../_libs/lucide-react29.mjs";
import { Input } from "./input-BPLX6SV6.mjs";
import { PrototypeRibbon, helpTopics } from "./router-ip9NLZv6.mjs";
// node_modules/.nitro/vite/services/ssr/assets/help-CceI5vcs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var topicIcons = {
	report: TriangleAlert,
	status: ShieldAlert,
	freshness: Clock3,
	"map-offline": Map,
	privacy: LockKeyhole,
	restrictions: Landmark
};
function HelpPage() {
	const { t } = usePrefs();
	const isHelpTopic = useRouterState({ select: (state) => state.location.pathname !== "/help" });
	const [query, setQuery] = (0, import_react.useState)("");
	const filteredTopics = (0, import_react.useMemo)(() => {
		const normalized = query.trim().toLocaleLowerCase();
		if (!normalized) return helpTopics;
		return helpTopics.filter(({ titleKey, descriptionKey }) => `${t(titleKey)} ${t(descriptionKey)}`.toLocaleLowerCase().includes(normalized));
	}, [query, t]);
	if (isHelpTopic) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "help-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "help-banner photo-surface",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "help-container help-banner-content",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "help-eyebrow",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-hidden": true }), t("help.eyebrow")]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "rp-page-title",
							children: t("help.title")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "help-banner-description",
							children: t("help.subtitle")
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "help-container help-content",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "help-topics",
					"aria-label": t("help.topics"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "help-search",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: t("help.search")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
								"aria-hidden": true,
								className: "help-search-icon"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "search",
								value: query,
								onChange: (event) => setQuery(event.target.value),
								placeholder: t("help.search"),
								className: "glass help-search-input"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "help-topic-grid",
						children: [filteredTopics.map(({ slug, titleKey, descriptionKey }) => {
							const Icon = topicIcons[slug];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/help/$topic",
								params: { topic: slug },
								className: "rp-card glass rp-enter help-topic-card",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `help-topic-icon help-topic-icon-${slug}`,
										"aria-hidden": true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "help-topic-copy",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "help-topic-title",
											children: [t(titleKey), slug === "map-offline" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "help-planned",
												children: t("help.planned")
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "help-topic-description",
											children: t(descriptionKey)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
										"aria-hidden": true,
										className: "rp-arrow help-topic-arrow"
									})
								]
							}, slug);
						}), filteredTopics.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "help-empty",
							role: "status",
							children: t("help.empty")
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "help-reminder glass-strong",
					"aria-labelledby": "help-reminder-title",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "help-reminder-content",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "help-reminder-label",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { "aria-hidden": true }), t("help.reminderLabel")]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "help-reminder-title",
								children: t("help.reminderTitle")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "help-reminder-body",
								children: t("help.reminderBody")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "help-reminder-items",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mountain, { "aria-hidden": true }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("help.reminderConditions") })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { "aria-hidden": true }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("help.reminderUpdates") })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { "aria-hidden": true }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("help.reminderResponsibly") })] })
								]
							})
						]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "help-page-footer",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "help-container help-footer-content",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "help-back-link",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { "aria-hidden": true }), t("help.backHome")]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrototypeRibbon, {})]
				})
			})
		]
	});
}
export { HelpPage as component };
