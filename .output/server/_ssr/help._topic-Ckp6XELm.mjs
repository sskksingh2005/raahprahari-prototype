import { usePrefs } from "./preferences-BoWpYuS4.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { ArrowLeft } from "../_libs/lucide-react3.mjs";
import { Route$10 } from "./router-ip9NLZv6.mjs";
// node_modules/.nitro/vite/services/ssr/assets/help._topic-Ckp6XELm.js
var import_jsx_runtime = require_jsx_runtime();
function HelpTopicPage() {
	const topic = Route$10.useLoaderData();
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "help-detail-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "help-banner help-detail-banner photo-surface",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "help-container help-banner-content",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/help",
						className: "help-detail-back",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { "aria-hidden": true }), t("help.backTopics")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "help-eyebrow",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-hidden": true }), t("help.eyebrow")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "rp-page-title",
						children: t(topic.titleKey)
					}),
					topic.slug === "map-offline" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "help-planned help-planned-detail",
						children: t("help.planned")
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "help-container help-detail-content",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "help-detail-card glass",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "help-detail-intro",
						children: t(topic.descriptionKey)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: t(topic.detailTitleKey) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t(topic.detailBodyKey) }),
					topic.detailExtraKey && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t(topic.detailExtraKey) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "help-detail-caution",
						children: t("help.reminderBody")
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/help",
				className: "help-back-link",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { "aria-hidden": true }), t("help.backTopics")]
			})]
		})]
	});
}
export { HelpTopicPage as component };
