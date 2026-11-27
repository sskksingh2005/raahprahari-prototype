import { __toESM } from "../_runtime.mjs";
import { usePrefs } from "./preferences-BoWpYuS4.mjs";
import { require_react } from "../_libs/react.mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { Button } from "./button-BwhNanlJ.mjs";
import { useAccountSession } from "./account-session-Cz43bjtr.mjs";
import { Label } from "./field-Ds5sKygr.mjs";
import { LoginDialog, SignOutButton } from "./router-ip9NLZv6.mjs";
import { RadioGroup, RadioGroupItem } from "./radio-group-0svYIRBF.mjs";
// node_modules/.nitro/vite/services/ssr/assets/profile-WRiT1-lO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ChoiceGroup({ id, legend, value, options, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
			className: "text-sm font-semibold",
			children: legend
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroup, {
			value,
			onValueChange: (next) => onChange(next),
			className: "flex flex-wrap gap-4",
			children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-11 items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, {
					value: option.value,
					id: `${id}-${option.value}`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: `${id}-${option.value}`,
					lang: option.lang,
					children: option.label
				})]
			}, option.value))
		})]
	});
}
function AccountSection() {
	const { t } = usePrefs();
	const session = useAccountSession();
	const [loginOpen, setLoginOpen] = (0, import_react.useState)(false);
	const signInRef = (0, import_react.useRef)(null);
	if (session.status === "loading") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		role: "status",
		children: t("login.checking")
	});
	if (session.status !== "authenticated") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: t("profile.signedOut")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				ref: signInRef,
				type: "button",
				onClick: () => setLoginOpen(true),
				children: t("login.submit")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginDialog, {
				open: loginOpen,
				onOpenChange: setLoginOpen,
				returnFocusRef: signInRef
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: t("profile.email")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "break-all",
						children: session.email ?? t("profile.emailUnknown")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: t("profile.role")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: session.role ?? t("profile.roleNone") })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: t("profile.roleNote")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignOutButton, {})
		]
	});
}
function ProfilePage() {
	const { t, lang, setLang, theme, setTheme } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rp-container py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-reading space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "rp-page-title",
					children: t("profile.title")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-labelledby": "profile-account",
					className: "glass space-y-4 rounded-xl p-6 text-card-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "profile-account",
						className: "font-display text-xl font-semibold",
						children: t("profile.account")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountSection, {})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-labelledby": "profile-prefs",
					className: "glass space-y-6 rounded-xl p-6 text-card-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "profile-prefs",
							className: "font-display text-xl font-semibold",
							children: t("profile.preferences")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: t("profile.prefsNote")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChoiceGroup, {
							id: "profile-lang",
							legend: t("profile.language"),
							value: lang,
							onChange: setLang,
							options: [{
								value: "en",
								label: "English",
								lang: "en"
							}, {
								value: "hi",
								label: "हिन्दी",
								lang: "hi"
							}]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChoiceGroup, {
							id: "profile-theme",
							legend: t("profile.theme"),
							value: theme,
							onChange: setTheme,
							options: [
								{
									value: "light",
									label: "profile.themeLight"
								},
								{
									value: "dark",
									label: "profile.themeDark"
								},
								{
									value: "system",
									label: "profile.themeSystem"
								}
							].map((o) => ({
								value: o.value,
								label: t(o.label)
							}))
						})
					]
				})
			]
		})
	});
}
var SplitComponent = ProfilePage;
export { SplitComponent as component };
