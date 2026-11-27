import { require_jsx_runtime } from "../_libs/react2.mjs";
// node_modules/.nitro/vite/services/ssr/assets/page-banner-CQjN88G-.js
var import_jsx_runtime = require_jsx_runtime();
function PageBanner({ eyebrow, title, description }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "rp-info-banner photo-surface",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rp-info-container rp-info-banner-content glass-strong rounded-3xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "rp-info-eyebrow",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-hidden": true }), eyebrow]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "rp-page-title",
					children: title
				}),
				description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rp-info-banner-description",
					children: description
				})
			]
		})
	});
}
export { PageBanner };
