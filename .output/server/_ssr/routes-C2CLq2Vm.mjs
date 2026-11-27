import { __toESM } from "../_runtime.mjs";
import { useAppStore, usePrefs } from "./preferences-BoWpYuS4.mjs";
import { require_react } from "../_libs/react.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { useNavigate } from "../_libs/@tanstack/react-router+[4...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { ArrowRight, Search, ShieldCheck, TriangleAlert } from "../_libs/lucide-react3.mjs";
import { CloudDownload } from "../_libs/lucide-react15.mjs";
import { MapPin } from "../_libs/lucide-react28.mjs";
import { UsersRound } from "../_libs/lucide-react32.mjs";
import { PrototypeRibbon } from "./router-ip9NLZv6.mjs";
import { AdvisoryCard } from "./advisory-card-BwZ-GS4_.mjs";
// node_modules/.nitro/vite/services/ssr/assets/routes-C2CLq2Vm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Each feature opens the help topic that explains it (slugs from data/help-topics). */
var FEATURES = [
	{
		topic: "report",
		icon: UsersRound,
		title: "home.featReportTitle",
		body: "home.featReportBody"
	},
	{
		topic: "freshness",
		icon: ShieldCheck,
		title: "home.featFreshTitle",
		body: "home.featFreshBody"
	},
	{
		topic: "map-offline",
		icon: CloudDownload,
		title: "home.featOfflineTitle",
		body: "home.featOfflineBody"
	}
];
/** The featured card shows this seeded segment and links to its detail page. */
var HOME_SAMPLE_SEGMENT_ID = "nh107-02";
/**
* The headline with one word picked out in orange gradient text. The text is
* unchanged (one node per part, read as one heading); only the styling differs.
*/
function HeroTitle({ title, highlight }) {
	const at = highlight ? title.search(new RegExp(`\\b${highlight}\\b`)) : -1;
	if (!highlight || at < 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: title });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		title.slice(0, at),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "home-you",
			children: title.slice(at, at + highlight.length)
		}),
		title.slice(at + highlight.length)
	] });
}
function Home() {
	const { t, lang } = usePrefs();
	const { segments } = useAppStore();
	const sampleSegment = segments.find((s) => s.id === HOME_SAMPLE_SEGMENT_ID);
	if (!sampleSegment) throw new Error(`Missing sample segment "${HOME_SAMPLE_SEGMENT_ID}"`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "home-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			"aria-labelledby": "hero-title",
			className: "home-hero photo-surface",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "home-content",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "home-copy rp-hero-stagger",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							id: "hero-title",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroTitle, {
								title: t("hero.title"),
								highlight: lang === "en" ? "you" : null
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("hero.body") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeRoadSearch, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "home-actions",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/report",
								search: { segment: void 0 },
								className: "home-action home-action-report glass",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { "aria-hidden": true }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Report a hazard" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { "aria-hidden": true })
								]
							})
						})
					]
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "home-support",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdvisoryCard, {
					segment: sampleSegment,
					variant: "home-featured"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					"aria-label": "RaahPrahari features",
					className: "home-features",
					children: FEATURES.map((feature) => {
						const { topic, icon: Icon, title, body } = feature;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/help/$topic",
							params: { topic },
							className: "glass",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { "aria-hidden": true }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: t(title) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: t(body) })] })]
						}) }, topic);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "home-prototype-label",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrototypeRibbon, {})
				})
			]
		})]
	});
}
/** Hands the query to the traveller search (/traveller?q=), which does the matching. */
function HomeRoadSearch() {
	const { t } = usePrefs();
	const navigate = useNavigate();
	const [query, setQuery] = (0, import_react.useState)("");
	const id = (0, import_react.useId)();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		role: "search",
		className: "home-search glass-strong",
		onSubmit: (event) => {
			event.preventDefault();
			const q = query.trim();
			navigate({
				to: "/traveller",
				search: q ? { q } : {}
			});
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			htmlFor: id,
			className: "home-search-label",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { "aria-hidden": true }), t("home.searchLabel")]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "home-search-field glass",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { "aria-hidden": true }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id,
					type: "search",
					value: query,
					onChange: (event) => setQuery(event.target.value),
					placeholder: t("home.searchPlaceholder"),
					autoComplete: "off"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "submit",
					className: "glass-btn-accent",
					children: [t("home.searchSubmit"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { "aria-hidden": true })]
				})
			]
		})]
	});
}
export { Home as component };
