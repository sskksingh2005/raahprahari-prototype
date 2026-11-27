import { __toESM } from "../_runtime.mjs";
import { DEMO_NOW$1, STORAGE_KEYS, cn, useAppStore, useLocalState, usePrefs } from "./preferences-BoWpYuS4.mjs";
import { require_react } from "../_libs/react.mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { ShieldCheck, Trophy } from "../_libs/lucide-react3.mjs";
import { BadgeCheck, Coins, EyeOff, MessageSquareWarning, RotateCcwClock, ShieldOff, Sprout, TrendingUp } from "../_libs/lucide-react6.mjs";
import { Button } from "./button-BwhNanlJ.mjs";
import { PageBanner } from "./page-banner-CQjN88G-.mjs";
import { toast } from "../_libs/sonner.mjs";
import { PrototypeRibbon } from "./router-ip9NLZv6.mjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs-CXsxBRtY.mjs";
import { Textarea } from "./textarea-DnhVosJ1.mjs";
import { Switch as Switch$1, SwitchThumb } from "../_libs/radix-ui__react-switch.mjs";
// node_modules/.nitro/vite/services/ssr/assets/contributions-DDM7aNub.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var counts = (verified, duplicate, rejected, pending, needsInfo = 0, conflicting = 0) => ({
	verified,
	duplicate,
	rejected,
	under_review: pending,
	needs_info: needsInfo,
	conflicting
});
var SYNTHETIC_CONTRIBUTORS = [
	{
		id: "c1",
		handle: "PahadiScout",
		counts: counts(18, 3, 1, 2),
		synthetic: true,
		optedIn: true
	},
	{
		id: "c2",
		handle: "KedarWatch",
		counts: counts(12, 2, 2, 1, 1),
		synthetic: true,
		optedIn: true
	},
	{
		id: "c3",
		handle: "RoadRunner42",
		counts: counts(10, 6, 11, 3, 0, 2),
		synthetic: true,
		optedIn: true
	},
	{
		id: "c4",
		handle: "GangaGhat",
		counts: counts(9, 1, 1, 0),
		synthetic: true,
		optedIn: true
	},
	{
		id: "c5",
		handle: "DoonDriver",
		counts: counts(6, 2, 4, 1),
		synthetic: true,
		optedIn: true
	},
	{
		id: "c6",
		handle: "NewToTheHills",
		counts: counts(3, 0, 0, 4),
		synthetic: true,
		optedIn: false
	},
	{
		id: "c7",
		handle: "BhagirathiBlue",
		counts: counts(2, 1, 0, 0),
		synthetic: true,
		optedIn: true
	},
	{
		id: "c8",
		handle: "FogLamp",
		counts: counts(0, 0, 2, 1),
		synthetic: true,
		optedIn: false
	}
];
var POINTS_PER_OUTCOME = {
	verified: 10,
	duplicate: 2,
	under_review: 0,
	needs_info: 0,
	conflicting: 0,
	rejected: 0
};
/** Outcomes where the review has settled. The rest earn nothing until it does. */
var SETTLED_OUTCOMES = [
	"verified",
	"duplicate",
	"rejected"
];
var UNSETTLED_OUTCOMES = [
	"under_review",
	"needs_info",
	"conflicting"
];
var REPUTATION_RELIABLE_SHARE = .5;
var REPUTATION_TRUSTED_SHARE = .8;
function emptyCounts() {
	return {
		verified: 0,
		duplicate: 0,
		rejected: 0,
		under_review: 0,
		needs_info: 0,
		conflicting: 0
	};
}
function computePoints(counts) {
	return Object.keys(POINTS_PER_OUTCOME).reduce((total, outcome) => total + counts[outcome] * POINTS_PER_OUTCOME[outcome], 0);
}
function computeReputation(counts) {
	const decided = counts.verified + counts.rejected;
	const verifiedShare = decided === 0 ? null : counts.verified / decided;
	let level = "new";
	if (verifiedShare !== null && decided >= 5) level = verifiedShare >= .8 ? "trusted" : verifiedShare >= .5 ? "reliable" : "building";
	return {
		level,
		decided,
		verifiedShare
	};
}
/**
* Ranks by points, then by verified share, then by handle order given. Equal
* points and share share a rank (competition ranking: 1, 2, 2, 4).
*/
function rankByPoints(entries) {
	const scored = entries.map((entry) => ({
		entry,
		points: computePoints(entry.counts),
		reputation: computeReputation(entry.counts)
	}));
	scored.sort((a, b) => b.points - a.points || (b.reputation.verifiedShare ?? -1) - (a.reputation.verifiedShare ?? -1));
	const ranked = [];
	scored.forEach((item, index) => {
		const prev = ranked[index - 1];
		const tied = prev !== void 0 && prev.points === item.points && prev.reputation.verifiedShare === item.reputation.verifiedShare;
		ranked.push({
			...item,
			rank: tied ? prev.rank : index + 1
		});
	});
	return ranked;
}
function isReversal(entry) {
	return entry.points < 0;
}
function ledgerBalance(entries) {
	return entries.reduce((total, entry) => total + entry.points, 0);
}
/** An entry can be appealed when it removed points and no decision is recorded. */
function canAppeal(entry) {
	return isReversal(entry) && entry.appealOutcome === void 0;
}
var PHONE_LIKE = /(?:\+?\d[\s().-]?){7,}/;
var COORDINATE_PAIR = /-?\d{1,3}\.\d{3,}\s*[,;/\s]\s*-?\d{1,3}\.\d{3,}/;
/** Returns the first problem found, or null when the note is acceptable. */
function checkAppealNote(note) {
	const text = note.trim();
	if (!text) return "empty";
	if (text.length > 300) return "tooLong";
	if (COORDINATE_PAIR.test(text)) return "coordinates";
	if (PHONE_LIKE.test(text)) return "phone";
	return null;
}
var DEFAULT_CONTRIBUTION_SETTINGS = {
	showOnLeaderboard: false,
	includeInAggregates: false,
	pseudonym: null
};
function aggregateCounts(groups, minParticipants = 5) {
	if (groups.length < minParticipants) return {
		participants: groups.length,
		totals: null
	};
	const sum = groups.reduce((acc, c) => ({
		verified: acc.verified + c.verified,
		duplicate: acc.duplicate + c.duplicate,
		rejected: acc.rejected + c.rejected
	}), {
		verified: 0,
		duplicate: 0,
		rejected: 0
	});
	const decided = sum.verified + sum.rejected;
	return {
		participants: groups.length,
		totals: {
			...sum,
			verifiedShare: decided === 0 ? null : sum.verified / decided
		}
	};
}
var ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
var WORDS = [
	"Hiker",
	"Ridge",
	"Pine",
	"Cedar",
	"Glacier",
	"Valley"
];
/** Random label such as "Cedar-7K2Q". Uses the browser's random source only. */
function makePseudonym() {
	const bytes = /* @__PURE__ */ new Uint8Array(5);
	crypto.getRandomValues(bytes);
	return `${WORDS[bytes[0] % WORDS.length]}-${Array.from(bytes.slice(1), (b) => ALPHABET[b % 32]).join("")}`;
}
var LEVEL_ICON = {
	new: Sprout,
	building: TrendingUp,
	reliable: BadgeCheck,
	trusted: ShieldCheck
};
var percent = (share) => `${Math.round(share * 100)}`;
/** Fills {name} placeholders in a dictionary string. */
function fill(template, values) {
	return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, `${value}`), template);
}
/** Icon and label together, never colour alone. */
function LevelBadge({ level }) {
	const { t } = usePrefs();
	const Icon = LEVEL_ICON[level];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		"data-testid": "reputation-level",
		"data-level": level,
		className: "glass-pill inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap text-foreground sm:gap-1.5 sm:px-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			"aria-hidden": true,
			className: "size-3.5"
		}), t(`contrib.level.${level}`)]
	});
}
function Card({ icon: Icon, title, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("rp-info-card glass", className),
		children: [
			Icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				"aria-hidden": true,
				className: "mb-3 size-5 text-brand-orange"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: title }),
			children
		]
	});
}
function Table({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "table-container",
		className: "glass relative w-full overflow-x-auto rounded-2xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
			"data-slot": "table",
			className: cn("w-full caption-bottom text-sm", className),
			...props
		})
	});
}
function TableHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
		"data-slot": "table-header",
		className: cn("[&_tr]:border-b", className),
		...props
	});
}
function TableBody({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
		"data-slot": "table-body",
		className: cn("[&_tr:last-child]:border-0", className),
		...props
	});
}
function TableRow({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
		"data-slot": "table-row",
		className: cn("border-b border-(--glass-divider) transition-colors hover:bg-(--glass-panel-strong) has-aria-expanded:bg-(--glass-panel-strong) data-[state=selected]:bg-(--glass-panel-strong) data-[state=selected]:shadow-[inset_3px_0_0_var(--glass-accent-line)]", className),
		...props
	});
}
function TableHead({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		"data-slot": "table-head",
		className: cn("h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className),
		...props
	});
}
function TableCell({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		"data-slot": "table-cell",
		className: cn("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className),
		...props
	});
}
function TableCaption({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("caption", {
		"data-slot": "table-caption",
		className: cn("mt-4 text-sm text-muted-foreground", className),
		...props
	});
}
var daysAgo = (d) => DEMO_NOW$1 - d * 24 * 36e5;
/**
* SYNTHETIC example ledger that walks through an award, a reversal, an upheld
* appeal and an appealable reversal. It belongs to no real person, and its
* report references are made up.
*/
var EXAMPLE_LEDGER = [
	{
		id: "e1",
		at: daysAgo(12),
		points: 10,
		reason: "verified",
		reportRef: "RP-418203"
	},
	{
		id: "e2",
		at: daysAgo(11),
		points: 2,
		reason: "duplicate",
		reportRef: "RP-418815"
	},
	{
		id: "e3",
		at: daysAgo(9),
		points: 10,
		reason: "verified",
		reportRef: "RP-418770"
	},
	{
		id: "e4",
		at: daysAgo(6),
		points: -10,
		reason: "verification_withdrawn",
		reportRef: "RP-418770",
		reverses: "e3"
	},
	{
		id: "e5",
		at: daysAgo(5),
		points: 10,
		reason: "verified",
		reportRef: "RP-419215"
	},
	{
		id: "e6",
		at: daysAgo(4),
		points: -10,
		reason: "review_corrected",
		reportRef: "RP-419215",
		reverses: "e5",
		appealOutcome: "upheld"
	},
	{
		id: "e7",
		at: daysAgo(2),
		points: 10,
		reason: "appeal_upheld",
		reportRef: "RP-419215",
		reverses: "e6"
	}
];
/** Settings stay in this browser. Nothing here is sent anywhere. */
function useContributionSettings() {
	const [settings, setSettings] = useLocalState(STORAGE_KEYS.contribSettings, DEFAULT_CONTRIBUTION_SETTINGS);
	return {
		settings,
		update: (0, import_react.useCallback)((patch) => setSettings((prev) => {
			const next = {
				...prev,
				...patch
			};
			const anyOn = next.showOnLeaderboard || next.includeInAggregates;
			return {
				...next,
				pseudonym: anyOn ? prev.pseudonym ?? makePseudonym() : null
			};
		}), [setSettings]),
		newPseudonym: (0, import_react.useCallback)(() => setSettings((prev) => ({
			...prev,
			pseudonym: makePseudonym()
		})), [setSettings]),
		reset: (0, import_react.useCallback)(() => setSettings(DEFAULT_CONTRIBUTION_SETTINGS), [setSettings])
	};
}
function useAppeals() {
	const [appeals, setAppeals] = useLocalState(STORAGE_KEYS.contribAppeals, {});
	return {
		appeals,
		save: (0, import_react.useCallback)((entryId, note) => setAppeals((prev) => ({
			...prev,
			[entryId]: {
				note: note.trim(),
				at: Date.now()
			}
		})), [setAppeals]),
		withdraw: (0, import_react.useCallback)((entryId) => setAppeals((prev) => {
			const { [entryId]: _removed, ...rest } = prev;
			return rest;
		}), [setAppeals]),
		clear: (0, import_react.useCallback)(() => setAppeals({}), [setAppeals])
	};
}
function AppealControl({ entry }) {
	const { t, stamp } = usePrefs();
	const { appeals, save, withdraw } = useAppeals();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)("");
	const [problem, setProblem] = (0, import_react.useState)(null);
	const focusNext = (0, import_react.useRef)(null);
	const fieldRef = (0, import_react.useRef)(null);
	const savedRef = (0, import_react.useRef)(null);
	const actionRef = (0, import_react.useRef)(null);
	const setFocusNext = (target) => {
		focusNext.current = target;
	};
	(0, import_react.useEffect)(() => {
		const pending = focusNext.current;
		if (!pending) return;
		focusNext.current = null;
		({
			field: fieldRef,
			saved: savedRef,
			action: actionRef
		})[pending].current?.focus();
	});
	const saved = appeals[entry.id];
	if (entry.appealOutcome) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "m-0! mt-1! text-xs font-semibold text-foreground!",
		children: t(entry.appealOutcome === "upheld" ? "contrib.appeal.upheld" : "contrib.appeal.notUpheld")
	});
	if (saved) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-1 space-y-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				ref: savedRef,
				role: "status",
				tabIndex: -1,
				className: "m-0! text-xs outline-none",
				children: fill(t("contrib.appeal.saved"), { date: stamp(saved.at) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "m-0! text-xs italic",
				children: saved.note
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				size: "sm",
				className: "min-h-11",
				onClick: () => {
					withdraw(entry.id);
					setFocusNext("action");
				},
				children: t("contrib.appeal.withdraw")
			})
		]
	});
	if (!canAppeal(entry)) return null;
	if (!open) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		ref: actionRef,
		type: "button",
		variant: "outline",
		size: "sm",
		className: "mt-1 min-h-11",
		onClick: () => {
			setOpen(true);
			setFocusNext("field");
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquareWarning, { "aria-hidden": true }), t("contrib.appeal.action")]
	});
	const fieldId = `appeal-${entry.id}`;
	const errorId = `${fieldId}-error`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mt-2 space-y-2",
		noValidate: true,
		onSubmit: (event) => {
			event.preventDefault();
			const found = checkAppealNote(note);
			setProblem(found);
			if (found) {
				fieldRef.current?.focus();
				return;
			}
			save(entry.id, note);
			setOpen(false);
			setNote("");
			setFocusNext("saved");
		},
		onKeyDown: (event) => {
			if (event.key !== "Escape") return;
			event.preventDefault();
			setOpen(false);
			setProblem(null);
			setFocusNext("action");
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: fieldId,
				className: "block text-sm font-medium text-foreground",
				children: t("contrib.appeal.label")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				ref: fieldRef,
				id: fieldId,
				value: note,
				maxLength: 350,
				"aria-invalid": problem ? true : void 0,
				"aria-describedby": problem ? errorId : void 0,
				autoComplete: "off",
				onChange: (event) => setNote(event.target.value)
			}),
			problem ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				id: errorId,
				role: "alert",
				className: "m-0! text-sm text-status-dnt!",
				children: fill(t(`contrib.appeal.err.${problem}`), { max: 300 })
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					size: "sm",
					className: "min-h-11",
					children: t("contrib.appeal.submit")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					size: "sm",
					className: "min-h-11",
					onClick: () => {
						setOpen(false);
						setProblem(null);
						setFocusNext("action");
					},
					children: t("contrib.appeal.cancel")
				})]
			})
		]
	});
}
function LedgerTab() {
	const { t, stamp } = usePrefs();
	const balance = ledgerBalance(EXAMPLE_LEDGER);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 min-[900px]:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					icon: RotateCcwClock,
					title: t("contrib.ledger.title"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("contrib.ledger.how") })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					title: t("contrib.ledger.yours"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-testid": "your-ledger-empty",
						children: t("contrib.ledger.yoursEmpty")
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				title: t("contrib.ledger.exampleTitle"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("contrib.ledger.exampleNote") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, {
						className: "mt-3 [&_td]:px-1 [&_th]:px-1 sm:[&_td]:px-2 sm:[&_th]:px-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: t("contrib.col.date") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: t("contrib.col.reason") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right",
								children: t("contrib.col.points")
							})
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: EXAMPLE_LEDGER.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
							"data-testid": `ledger-${entry.id}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "align-top text-xs whitespace-normal",
									children: stamp(entry.at)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
									className: "align-top whitespace-normal",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-foreground",
											children: t(`contrib.reason.${entry.reason}`)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-0.5 block font-mono text-xs text-muted-foreground",
											children: [entry.reportRef, entry.reverses ? ` · ${fill(t("contrib.ledger.reverses"), { id: entry.reverses })}` : ""]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppealControl, { entry })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: cn("text-right align-top font-semibold whitespace-nowrap", isReversal(entry) ? "text-status-dnt" : "text-foreground"),
									children: entry.points > 0 ? `+${entry.points}` : `−${Math.abs(entry.points)}`
								})
							]
						}, entry.id)) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-testid": "ledger-balance",
						className: "font-semibold text-foreground!",
						children: fill(t("contrib.ledger.balance"), { points: balance })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				title: t("contrib.appeal.title"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("contrib.appeal.how") })
			})
		]
	});
}
function Switch({ className, size = "default", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
		"data-slot": "switch",
		"data-size": size,
		className: cn("peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-(--glass-line) rp-field outline-none after:absolute after:inset-y-[-13px] after:inset-x-[-6px] after:content-[''] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, {
			"data-slot": "switch-thumb",
			className: cn("pointer-events-none block rounded-full bg-background ring-0 transition-transform duration-(--motion-base) ease-(--ease-out) motion-reduce:transition-none group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground")
		})
	});
}
function Option({ id, label, help, checked, onChange }) {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start gap-3 border-t border-border pt-3 first:border-t-0 first:pt-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			id,
			checked,
			onCheckedChange: onChange,
			"aria-describedby": `${id}-help`,
			className: "mt-1"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: id,
				className: "block text-sm font-medium text-foreground",
				children: t(label)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				id: `${id}-help`,
				className: "m-0! mt-1! text-xs",
				children: t(help)
			})]
		})]
	});
}
function SettingsTab() {
	const { t } = usePrefs();
	const { settings, update, newPseudonym, reset } = useContributionSettings();
	const appeals = useAppeals();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3 min-[900px]:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			icon: EyeOff,
			title: t("contrib.set.title"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("contrib.set.intro") }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Option, {
						id: "opt-board",
						label: "contrib.set.board",
						help: "contrib.set.boardHelp",
						checked: settings.showOnLeaderboard,
						onChange: (value) => update({ showOnLeaderboard: value })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Option, {
						id: "opt-aggregates",
						label: "contrib.set.aggregates",
						help: "contrib.set.aggregatesHelp",
						checked: settings.includeInAggregates,
						onChange: (value) => update({ includeInAggregates: value })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 border-t border-border pt-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "m-0! text-sm font-medium text-foreground!",
							children: t("contrib.set.pseudonym")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-testid": "pseudonym",
							className: "m-0! mt-1! font-mono text-sm",
							children: settings.pseudonym ?? t("contrib.set.pseudonymNone")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "m-0! mt-1! text-xs",
							children: t("contrib.set.pseudonymNote")
						}),
						settings.pseudonym ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							className: "mt-2 min-h-11",
							onClick: newPseudonym,
							children: t("contrib.set.pseudonymNew")
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					className: "mt-4 h-auto min-h-11 w-full whitespace-normal",
					onClick: () => {
						reset();
						appeals.clear();
						toast(t("contrib.set.resetDone"));
					},
					children: t("contrib.set.reset")
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			icon: ShieldOff,
			title: t("contrib.never.title"),
			className: "content-start",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("contrib.never.body") })
		})]
	});
}
var LEVELS = [
	"new",
	"building",
	"reliable",
	"trusted"
];
var OUTCOME_ORDER = [...SETTLED_OUTCOMES, ...UNSETTLED_OUTCOMES];
function PointsTab() {
	const { t } = usePrefs();
	const { localReports } = useAppStore();
	const yourPoints = computePoints(emptyCounts());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3 min-[900px]:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid content-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				icon: Coins,
				title: t("contrib.points.yours"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-testid": "your-points",
					className: "m-0! mt-2! font-display text-4xl font-semibold text-foreground!",
					children: yourPoints
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: fill(t("contrib.points.yoursNote"), { count: localReports.length }) })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				title: t("contrib.points.howTitle"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("contrib.points.howBody") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("contrib.points.noDeduction") })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			title: t("contrib.points.tableCaption"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, {
				className: "mt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: t("contrib.col.outcome") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: t("contrib.col.points")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: t("contrib.col.meaning") })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: OUTCOME_ORDER.map((outcome) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					"data-testid": `outcome-${outcome}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium whitespace-normal",
							children: t(`contrib.outcome.${outcome}`)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right whitespace-normal",
							children: POINTS_PER_OUTCOME[outcome] > 0 ? fill(t("contrib.points.perReport"), { points: POINTS_PER_OUTCOME[outcome] }) : t("contrib.points.none")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "whitespace-normal text-muted-foreground",
							children: t(`contrib.meaning.${outcome}`)
						})
					]
				}, outcome)) })]
			})
		})]
	});
}
function ReputationTab() {
	const { t } = usePrefs();
	const mine = computeReputation(emptyCounts());
	const values = {
		min: 5,
		percent: percent(REPUTATION_RELIABLE_SHARE),
		upper: percent(REPUTATION_TRUSTED_SHARE)
	};
	const ruleValues = {
		new: values,
		building: {
			...values,
			percent: percent(REPUTATION_RELIABLE_SHARE)
		},
		reliable: values,
		trusted: {
			...values,
			percent: percent(REPUTATION_TRUSTED_SHARE)
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3 min-[900px]:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid content-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				icon: ShieldCheck,
				title: t("contrib.rep.yours"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelBadge, { level: mine.level })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: fill(t("contrib.rep.yoursNote"), {
					count: mine.decided,
					min: 5
				}) })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				title: t("contrib.rep.howTitle"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("contrib.rep.howBody") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: t("contrib.rep.formula") }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: fill(t("contrib.rep.minimum"), values) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("contrib.rep.limit") })
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			title: t("contrib.rep.tableCaption"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, {
				className: "mt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: t("contrib.col.level") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: t("contrib.col.rule") })] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: LEVELS.map((level) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					"data-testid": `level-${level}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelBadge, { level }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "whitespace-normal text-muted-foreground",
						children: fill(t(`contrib.levelRule.${level}`), ruleValues[level])
					})]
				}, level)) })]
			})
		})]
	});
}
function LeaderboardTab() {
	const { t } = usePrefs();
	const { settings } = useContributionSettings();
	const pool = SYNTHETIC_CONTRIBUTORS.filter((c) => c.optedIn).map((c) => ({
		id: c.id,
		handle: c.handle,
		counts: c.counts,
		you: false
	}));
	if (settings.showOnLeaderboard && settings.pseudonym !== null) pool.push({
		id: "you",
		handle: settings.pseudonym ?? "",
		counts: emptyCounts(),
		you: true
	});
	const ranked = rankByPoints(pool);
	const aggregate = aggregateCounts([...SYNTHETIC_CONTRIBUTORS.filter((c) => c.optedIn).map((c) => c.counts), ...settings.includeInAggregates ? [emptyCounts()] : []]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			icon: Trophy,
			title: t("contrib.board.title"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("contrib.board.body") }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("contrib.board.optedInOnly") }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, {
					className: "mt-3 [&_td]:px-1 [&_th]:px-1 sm:[&_td]:px-2 sm:[&_th]:px-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCaption, {
							className: "sr-only",
							children: t("contrib.board.caption")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: t("contrib.col.rank") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: t("contrib.col.contributor") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right",
								children: t("contrib.col.points")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: t("contrib.col.level") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "hidden text-right sm:table-cell",
								children: t("contrib.col.verified")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "hidden text-right sm:table-cell",
								children: t("contrib.col.decided")
							})
						] }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: ranked.map(({ entry, rank, points, reputation }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
							"data-testid": `rank-${entry.id}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "font-display font-semibold",
									children: rank
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: entry.handle
									}),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "block font-mono text-xs text-muted-foreground sm:inline",
										children: [
											"(",
											entry.you ? t("contrib.board.you") : t("contrib.board.synthetic"),
											")"
										]
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "text-right font-semibold",
									children: points
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelBadge, { level: reputation.level }) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "hidden text-right sm:table-cell",
									children: reputation.verifiedShare === null ? "–" : `${percent(reputation.verifiedShare)}%`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "hidden text-right sm:table-cell",
									children: reputation.decided
								})
							]
						}, entry.id)) })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("contrib.board.note") })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			title: t("contrib.agg.title"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("contrib.agg.body") }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-testid": "agg-participants",
					className: "font-semibold text-foreground!",
					children: fill(t("contrib.agg.participants"), { count: aggregate.participants })
				}),
				aggregate.totals ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
					"data-testid": "agg-totals",
					className: "mt-3 grid grid-cols-2 gap-2 min-[600px]:grid-cols-4",
					children: [
						["contrib.agg.verified", aggregate.totals.verified],
						["contrib.agg.duplicate", aggregate.totals.duplicate],
						["contrib.agg.rejected", aggregate.totals.rejected],
						["contrib.agg.share", aggregate.totals.verifiedShare === null ? "–" : `${percent(aggregate.totals.verifiedShare)}%`]
					].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass rounded-lg p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-xs text-muted-foreground",
							children: t(label)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "m-0 font-display text-2xl font-semibold text-foreground",
							children: value
						})]
					}, label))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-testid": "agg-hidden",
					children: fill(t("contrib.agg.tooFew"), { min: 5 })
				})
			]
		})]
	});
}
function ContributionsTabs() {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
		defaultValue: "points",
		className: "gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
				"aria-label": t("contrib.tabsLabel"),
				className: "grid h-auto w-full grid-cols-2 min-[520px]:grid-cols-3 lg:w-fit lg:grid-cols-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
						value: "points",
						className: "data-[state=active]:glass-accent",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { "aria-hidden": true }), t("contrib.tab.points")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
						value: "reputation",
						className: "data-[state=active]:glass-accent",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { "aria-hidden": true }), t("contrib.tab.reputation")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
						value: "leaderboard",
						className: "data-[state=active]:glass-accent",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { "aria-hidden": true }), t("contrib.tab.leaderboard")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
						value: "ledger",
						className: "data-[state=active]:glass-accent",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcwClock, { "aria-hidden": true }), t("contrib.tab.ledger")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
						value: "settings",
						className: "data-[state=active]:glass-accent",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { "aria-hidden": true }), t("contrib.tab.settings")]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "points",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PointsTab, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "reputation",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReputationTab, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "leaderboard",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeaderboardTab, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "ledger",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LedgerTab, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "settings",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsTab, {})
			})
		]
	});
}
function ContributionsPage() {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rp-info-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageBanner, {
			eyebrow: t("contrib.eyebrow"),
			title: t("contrib.title"),
			description: t("contrib.description")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rp-info-container rp-info-content",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrototypeRibbon, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "m-0 min-w-0 text-sm text-muted-foreground sm:flex-1",
					children: t("contrib.notice")
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContributionsTabs, {})]
		})]
	});
}
export { ContributionsPage as component };
