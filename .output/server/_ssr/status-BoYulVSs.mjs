import { __toESM } from "../_runtime.mjs";
import { isSupabaseConfigured } from "./supabase-C8XFUyW6.mjs";
import { cn, usePrefs } from "./preferences-BoWpYuS4.mjs";
import { require_react } from "../_libs/react.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { ArrowRight, CircleCheck, FlaskConical } from "../_libs/lucide-react3.mjs";
import { CircleSlash, HardDrive } from "../_libs/lucide-react12.mjs";
import { LoaderCircle } from "../_libs/lucide-react24.mjs";
import { useAccountSession } from "./account-session-Cz43bjtr.mjs";
import { PageBanner } from "./page-banner-CQjN88G-.mjs";
import { getTransportSource, useOnlineStatus, useSystemStatus } from "./router-ip9NLZv6.mjs";
// node_modules/.nitro/vite/services/ssr/assets/status-BoYulVSs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Every state pairs an icon and a label with its colour, never colour alone. */
var STATE_DISPLAY = {
	configured: {
		icon: CircleCheck,
		label: "status.state.configured",
		help: "status.stateHelp.configured",
		className: "border-status-clear [&>svg]:text-status-clear"
	},
	simulated: {
		icon: FlaskConical,
		label: "status.state.simulated",
		help: "status.stateHelp.simulated",
		className: "border-status-caution [&>svg]:text-status-caution"
	},
	unavailable: {
		icon: CircleSlash,
		label: "status.state.unavailable",
		help: "status.stateHelp.unavailable",
		className: "border-status-dnt [&>svg]:text-status-dnt"
	},
	checking: {
		icon: LoaderCircle,
		label: "status.state.checking",
		help: null,
		className: "border-status-unknown [&>svg]:text-status-unknown"
	}
};
/**
* The channel line is --foreground text with a status-coloured edge. The
* sentence itself names the state; the colour only repeats it. (Status
* colours as text colour do not keep AA on glass: do-not-travel red reaches
* 3.3:1 on the dark glass.)
*/
var TONE_CLASS = {
	ok: "border-l-4 border-status-clear pl-2 text-foreground",
	warn: "border-l-4 border-status-caution pl-2 text-foreground",
	bad: "border-l-4 border-status-dnt pl-2 text-foreground",
	neutral: "text-muted-foreground"
};
var LEGEND_ORDER = [
	"configured",
	"simulated",
	"unavailable"
];
function StateBadge({ state }) {
	const { t } = usePrefs();
	const { icon: Icon, label, className } = STATE_DISPLAY[state];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		"data-testid": "integration-state",
		"data-state": state,
		className: cn("glass-pill inline-flex shrink-0 items-center gap-1.5 border px-2 py-0.5 text-xs font-semibold text-foreground shadow-none", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			"aria-hidden": true,
			className: cn("size-3.5 motion-reduce:animate-none", state === "checking" && "animate-spin")
		}), t(label)]
	});
}
function IntegrationRow({ item }) {
	const { t, stamp } = usePrefs();
	const channel = item.channel;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		"data-testid": `integration-${item.id}`,
		className: "rp-info-card glass list-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: t(item.name) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StateBadge, { state: item.state })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t(item.reason) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 border-t border-(--glass-divider) pt-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "m-0! text-xs font-semibold text-muted-foreground",
					children: t("status.channelLabel")
				}), channel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("mt-1! font-medium", TONE_CLASS[channel.tone]),
						children: t(channel.label)
					}),
					channel.lastSuccessAt !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1!",
						children: [
							t("status.lastSuccess"),
							":",
							" ",
							channel.lastSuccessAt === null ? t("status.never") : stamp(channel.lastSuccessAt)
						]
					}) : null,
					channel.nextAttemptAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1!",
						children: [
							t("status.nextAttempt"),
							": ",
							stamp(channel.nextAttemptAt)
						]
					}) : null
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1!",
					children: t("status.channelNone")
				})]
			})
		]
	});
}
function SystemStatusView({ items }) {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			"aria-label": t("status.legendLabel"),
			className: "mb-4 grid gap-2 min-[700px]:grid-cols-3",
			children: LEGEND_ORDER.map((state) => {
				const { help } = STATE_DISPLAY[state];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass flex min-w-0 flex-col items-start gap-1.5 rounded-2xl p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StateBadge, { state }), help ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: t(help)
					}) : null]
				}, state);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "m-0 grid list-none gap-3 p-0 min-[600px]:grid-cols-2 min-[1050px]:grid-cols-3",
			children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntegrationRow, { item }, item.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 max-w-reading text-sm text-muted-foreground",
			children: t("status.disclaimer")
		})
	] });
}
function SystemStatus() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SystemStatusView, { items: useSystemStatus() });
}
var action = (id, availability, reason) => ({
	id,
	name: `audit.action.${id}`,
	availability,
	reason
});
/**
* Report delivery needs a transport AND an access token (syncNow and
* retryAttachmentUpload in sync-engine.ts). The development stub supplies both
* itself, so it counts as simulated.
*/
function delivery(input, id) {
	if (input.transport === "none") return action(id, "blocked", "audit.reason.noReportService");
	if (input.transport === "dev_stub" || input.transport === "injected") return action(id, "simulated", "audit.reason.devReceiptStub");
	if (input.session !== "authenticated" && !input.supabaseConfigured) return action(id, "blocked", "audit.reason.noSignInForDelivery");
	return action(id, "available", "audit.reason.reportService");
}
/** Sign-in works through Supabase, or through the dev stub's own helper. */
function canSignIn(input) {
	return input.supabaseConfigured || input.transport === "dev_stub";
}
function deriveWorkspaceActions(input) {
	const signedIn = input.session === "authenticated";
	return [
		{
			id: "roads",
			name: "audit.screen.roads",
			route: "/traveller",
			actions: [
				action("searchRoutes", "simulated", "audit.reason.seededRoutes"),
				action("readAdvisories", "simulated", "audit.reason.seededAdvisories"),
				action("useLocation", "available", "audit.reason.browserLocation"),
				input.online === "offline" ? action("mapTiles", "blocked", "audit.reason.tilesOffline") : action("mapTiles", "available", "audit.reason.tilesOnline"),
				action("saveRoad", "device", "audit.reason.savedRoads")
			]
		},
		{
			id: "report",
			name: "audit.screen.report",
			route: "/report",
			actions: [
				action("saveDraft", "device", "audit.reason.indexedDb"),
				action("submitReport", "device", "audit.reason.submitQueuesOnly"),
				delivery(input, "sendReport"),
				delivery(input, "retryPhoto")
			]
		},
		{
			id: "myReports",
			name: "audit.screen.myReports",
			route: "/reports",
			actions: [signedIn ? action("viewMyReports", "available", "audit.reason.myReportsSignedIn") : canSignIn(input) ? action("viewMyReports", "available", "audit.reason.myReportsAfterSignIn") : action("viewMyReports", "blocked", "audit.reason.myReportsNoSignIn")]
		},
		{
			id: "review",
			name: "audit.screen.review",
			route: "/review",
			actions: [
				action("viewQueues", "simulated", "audit.reason.syntheticReports"),
				action("claimReport", "device", "audit.reason.claimsLocal"),
				action("recordDecision", "blocked", "audit.reason.noReviewService")
			]
		},
		{
			id: "account",
			name: "audit.screen.account",
			route: null,
			actions: [
				input.supabaseConfigured ? action("signIn", "available", "audit.reason.supabase") : input.transport === "dev_stub" ? action("signIn", "simulated", "audit.reason.devSignIn") : action("signIn", "blocked", "audit.reason.noSupabase"),
				input.supabaseConfigured ? action("signUp", "available", "audit.reason.supabaseEmail") : action("signUp", "blocked", "audit.reason.noSupabase"),
				input.supabaseConfigured ? action("resetPassword", "available", "audit.reason.supabaseEmail") : action("resetPassword", "blocked", "audit.reason.noSupabase")
			]
		},
		{
			id: "official",
			name: "audit.screen.official",
			route: "/official",
			actions: [action("checkNotice", "available", "audit.reason.checkNotice"), input.devBuild ? action("publishNotice", "simulated", "audit.reason.publishMock") : action("publishNotice", "blocked", "audit.reason.noPublishService")]
		},
		{
			id: "contributions",
			name: "audit.screen.contributions",
			route: "/contributions",
			actions: [
				action("viewPoints", "simulated", "audit.reason.syntheticContributions"),
				action("privacySettings", "device", "audit.reason.contribSettings"),
				action("saveAppeal", "device", "audit.reason.appealsLocal")
			]
		},
		{
			id: "contact",
			name: "audit.screen.contact",
			route: "/contact",
			actions: [action("sendMessage", "blocked", "audit.reason.noMessageService")]
		}
	];
}
function countByAvailability(screens) {
	const counts = {
		available: 0,
		device: 0,
		simulated: 0,
		blocked: 0
	};
	for (const screen of screens) for (const item of screen.actions) counts[item.availability] += 1;
	return counts;
}
/** Every state pairs an icon and a label with its colour, never colour alone. */
var AVAILABILITY = {
	available: {
		icon: CircleCheck,
		label: "audit.state.available",
		help: "audit.stateHelp.available",
		className: "border-status-clear text-status-clear"
	},
	device: {
		icon: HardDrive,
		label: "audit.state.device",
		help: "audit.stateHelp.device",
		className: "border-border text-foreground"
	},
	simulated: {
		icon: FlaskConical,
		label: "audit.state.simulated",
		help: "audit.stateHelp.simulated",
		className: "border-status-caution text-status-caution"
	},
	blocked: {
		icon: CircleSlash,
		label: "audit.state.blocked",
		help: "audit.stateHelp.blocked",
		className: "border-status-dnt text-status-dnt"
	}
};
var ORDER = [
	"available",
	"device",
	"simulated",
	"blocked"
];
function AvailabilityBadge({ availability }) {
	const { t } = usePrefs();
	const { icon: Icon, label, className } = AVAILABILITY[availability];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		"data-testid": "action-availability",
		"data-availability": availability,
		className: cn("glass-pill inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			"aria-hidden": true,
			className: "size-3.5"
		}), t(label)]
	});
}
function ScreenLink({ route, name }) {
	const { t } = usePrefs();
	const label = t("audit.openScreen").replace("{screen}", name);
	const className = "mt-1 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-link underline underline-offset-4";
	const content = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
		"aria-hidden": true,
		className: "size-4"
	})] });
	return route === "/report" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/report",
		search: { segment: void 0 },
		className,
		children: content
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: route,
		className,
		children: content
	});
}
function ScreenCard({ screen }) {
	const { t } = usePrefs();
	const name = t(screen.name);
	const headingId = `audit-${screen.id}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": headingId,
		"data-testid": `audit-screen-${screen.id}`,
		className: "rp-info-card glass",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				id: headingId,
				className: "m-0 font-display text-lg font-semibold text-foreground",
				children: name
			}),
			screen.route ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenLink, {
				route: screen.route,
				name
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "m-0! mt-1! text-sm",
				children: t("audit.dialogScreen")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "m-0 mt-3 list-none space-y-3 p-0",
				children: screen.actions.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					"data-testid": `audit-action-${item.id}`,
					className: "border-t border-border pt-3 first:border-t-0 first:pt-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 text-sm font-semibold text-foreground",
							children: t(item.name)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvailabilityBadge, { availability: item.availability })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "m-0! mt-1! text-sm",
						children: t(item.reason)
					})]
				}, item.id))
			})
		]
	});
}
function WorkspaceActionsView({ screens }) {
	const { t } = usePrefs();
	const counts = countByAvailability(screens);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "audit-title",
		className: "mt-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "audit-title",
				className: "font-display text-2xl font-semibold text-foreground",
				children: t("audit.title")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-reading text-sm text-muted-foreground",
				children: t("audit.intro")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				"aria-label": t("audit.summaryLabel"),
				className: "mt-4 grid gap-2 min-[560px]:grid-cols-2 min-[1050px]:grid-cols-4",
				children: ORDER.map((state) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-testid": `audit-count-${state}`,
					className: "glass flex min-w-0 flex-col items-start gap-1.5 rounded-lg p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvailabilityBadge, { availability: state }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "m-0 font-display text-2xl font-semibold text-foreground",
							children: counts[state]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "m-0 text-xs text-muted-foreground",
							children: t(AVAILABILITY[state].help)
						})
					]
				}, state))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 min-[700px]:grid-cols-2 min-[1050px]:grid-cols-3",
				children: screens.map((screen) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenCard, { screen }, screen.id))
			})
		]
	});
}
/** Reads the same runtime facts the feature screens use; changes with them. */
function WorkspaceActions() {
	const online = useOnlineStatus();
	const session = useAccountSession().status;
	const screens = (0, import_react.useMemo)(() => deriveWorkspaceActions({
		transport: getTransportSource(),
		supabaseConfigured: isSupabaseConfigured(),
		session,
		devBuild: false,
		online
	}), [online, session]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceActionsView, { screens });
}
function StatusPage() {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rp-info-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageBanner, {
			eyebrow: t("status.eyebrow"),
			title: t("status.title"),
			description: t("status.description")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rp-info-container rp-info-content",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SystemStatus, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceActions, {})]
		})]
	});
}
export { StatusPage as component };
