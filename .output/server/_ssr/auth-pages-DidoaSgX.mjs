import { __toESM } from "../_runtime.mjs";
import { usePrefs } from "./preferences-BoWpYuS4.mjs";
import { require_react } from "../_libs/react.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { CircleAlert } from "../_libs/lucide-react11.mjs";
import { useAccountSession } from "./account-session-Cz43bjtr.mjs";
import { AUTH_ERROR_KEYS, NewPasswordForm, completeAuthCallback } from "./router-ip9NLZv6.mjs";
// node_modules/.nitro/vite/services/ssr/assets/auth-pages-DidoaSgX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthPageShell({ title, children }) {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rp-container py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			"aria-labelledby": "auth-page-title",
			className: "glass-strong mx-auto max-w-md space-y-4 rounded-xl p-6 text-card-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				id: "auth-page-title",
				className: "rp-page-title",
				children: t(title)
			}), children]
		})
	});
}
function HomeLink() {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/",
		className: "inline-flex min-h-11 items-center text-sm text-link underline-offset-4 hover:underline",
		children: t("callback.home")
	});
}
/**
* /auth/callback: exchanges the one-time code from a confirmation or
* recovery email for a session, then continues to an allow-listed page.
*/
function AuthCallbackPage({ onContinue, run = completeAuthCallback }) {
	const { t } = usePrefs();
	const [result, setResult] = (0, import_react.useState)(null);
	const started = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (started.current) return;
		started.current = true;
		run(window.location.href).then((r) => {
			setResult(r);
			if (r.ok) onContinue(r.next);
		});
	}, [run, onContinue]);
	if (!result || result.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthPageShell, {
		title: "callback.title",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "status",
			children: t("callback.checking")
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthPageShell, {
		title: "callback.failedTitle",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			role: "alert",
			className: "flex items-start gap-2 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
				"aria-hidden": true,
				className: "mt-0.5 size-4 shrink-0 text-destructive"
			}), t(AUTH_ERROR_KEYS[result.kind])]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeLink, {})]
	});
}
/** /auth/reset-password: needs the recovery session created by the callback. */
function ResetPasswordPage() {
	const { t } = usePrefs();
	const session = useAccountSession();
	const [done, setDone] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthPageShell, {
		title: "reset.title",
		children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "status",
			children: t("reset.done")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeLink, {})] }) : session.status === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "status",
			children: t("login.checking")
		}) : session.status === "authenticated" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: t("reset.body")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewPasswordForm, { onDone: () => setDone(true) })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			role: "alert",
			className: "flex items-start gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
				"aria-hidden": true,
				className: "mt-0.5 size-4 shrink-0"
			}), t("reset.noSession")]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeLink, {})] })
	});
}
export { AuthCallbackPage, ResetPasswordPage };
