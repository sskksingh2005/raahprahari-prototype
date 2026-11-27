import { isSupabaseConfigured } from "./supabase-C8XFUyW6.mjs";
import { usePrefs } from "./preferences-BoWpYuS4.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { Accessibility, BadgeInfo, Database, Scale } from "../_libs/lucide-react2.mjs";
import { ArrowRight, Mail } from "../_libs/lucide-react3.mjs";
import { FileText } from "../_libs/lucide-react18.mjs";
import { LockKeyhole } from "../_libs/lucide-react26.mjs";
import { Route } from "../_libs/lucide-react31.mjs";
import { Button } from "./button-BwhNanlJ.mjs";
import { PageBanner } from "./page-banner-CQjN88G-.mjs";
import { Logo, getTransportSource } from "./router-ip9NLZv6.mjs";
// node_modules/.nitro/vite/services/ssr/assets/about-7EYGwGGe.js
var import_jsx_runtime = require_jsx_runtime();
var POLICY_OPEN_QUESTIONS = [];
/** Privacy wording for report delivery, matching this build's transport. */
function deliveryPrivacyKey() {
	switch (getTransportSource()) {
		case "none": return "aboutPage.privacyDeliveryNone";
		case "dev_stub": return "aboutPage.privacyDeliveryDev";
		default: return "aboutPage.privacyDeliveryConfigured";
	}
}
function AboutPage() {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rp-info-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageBanner, {
			eyebrow: t("aboutPage.eyebrow"),
			title: t("about.title"),
			description: t("aboutPage.description")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rp-info-container rp-info-content",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "glass-strong mb-3 rounded-2xl p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {
						variant: "full",
						className: "max-w-[11rem]"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 min-[600px]:grid-cols-2 min-[1050px]:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rp-info-card glass",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, {
									"aria-hidden": true,
									className: "mb-3 size-5 text-brand-orange"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: t("aboutPage.prototypeTitle") }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("aboutPage.prototypeBody") })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rp-info-card glass",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeInfo, {
									"aria-hidden": true,
									className: "mb-3 size-5 text-brand-orange"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: t("aboutPage.readTitle") }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("aboutPage.readBody") }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
									className: "mt-3 space-y-2 pl-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: t("aboutPage.cautionLabel") }),
											" ",
											t("aboutPage.caution")
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: t("aboutPage.avoidLabel") }),
											" ",
											t("aboutPage.avoid")
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: t("aboutPage.unknownLabel") }),
											" ",
											t("aboutPage.unknown")
										] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("aboutPage.readNote") })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rp-info-card glass",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
									"aria-hidden": true,
									className: "mb-3 size-5 text-brand-orange"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: t("aboutPage.limitsTitle") }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("aboutPage.limitsBody") })
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-3 min-[600px]:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							id: "privacy",
							className: "rp-info-card glass scroll-mt-24",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockKeyhole, {
									"aria-hidden": true,
									className: "mb-3 size-5 text-brand-orange"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: t("aboutPage.privacyTitle") }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("aboutPage.privacyBody") }),
								isSupabaseConfigured() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2",
									children: t("aboutPage.privacyAccount")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2",
									children: t(deliveryPrivacyKey())
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2",
									children: t("aboutPage.privacyAi")
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							id: "terms",
							className: "rp-info-card glass scroll-mt-24",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
									"aria-hidden": true,
									className: "mb-3 size-5 text-brand-orange"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: t("aboutPage.termsTitle") }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("aboutPage.termsBody") })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							id: "accessibility",
							className: "rp-info-card glass scroll-mt-24",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Accessibility, {
									"aria-hidden": true,
									className: "mb-3 size-5 text-brand-orange"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: t("aboutPage.accessibilityTitle") }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("aboutPage.accessibilityBody") })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							id: "contact",
							className: "rp-info-card glass scroll-mt-24",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, {
									"aria-hidden": true,
									className: "mb-3 size-5 text-brand-orange"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: t("aboutPage.contactTitle") }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("aboutPage.contactBody") }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/contact",
									className: "text-link underline",
									children: t("aboutPage.contactLink")
								}) })
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					id: "policy-status",
					className: "rp-info-card glass mt-3 scroll-mt-24",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, {
							"aria-hidden": true,
							className: "mb-3 size-5 text-brand-orange"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: t("aboutPage.policyStatusTitle") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("aboutPage.policyStatusBody") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-4 text-sm font-semibold text-foreground",
							children: t("aboutPage.policyOpenHeading")
						}),
						POLICY_OPEN_QUESTIONS.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 space-y-2 pl-5",
							children: POLICY_OPEN_QUESTIONS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [t(`aboutPage.policyArea.${item.area}`), ":"] }),
								" ",
								t(item.question)
							] }, item.id))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("aboutPage.policyOpenNone") })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rp-info-actions",
					role: "group",
					"aria-label": t("aboutPage.actionsLabel"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "min-h-11 rounded-xl",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/traveller",
								children: [
									t("aboutPage.checkRoad"),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { "aria-hidden": true })
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							className: "min-h-11 rounded-xl",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/advisories",
								children: t("aboutPage.viewAdvisories")
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							className: "min-h-11 rounded-xl",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/help",
								children: t("aboutPage.help")
							})
						})
					]
				})
			]
		})]
	});
}
export { AboutPage as component, deliveryPrivacyKey };
