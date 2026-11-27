import { __toESM } from "../_runtime.mjs";
import { PLACES, QUICK_PICKS, cn, placeById, summariseRoute, useAppStore, usePrefs } from "./preferences-BoWpYuS4.mjs";
import { require_react } from "../_libs/react.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { useNavigate } from "../_libs/@tanstack/react-router+[4...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { ArrowRight, CircleQuestionMark, Info, Map, Search, ShieldCheck, TriangleAlert, X } from "../_libs/lucide-react3.mjs";
import { ArrowUpDown, Bookmark, BookmarkCheck } from "../_libs/lucide-react4.mjs";
import { List } from "../_libs/lucide-react23.mjs";
import { LocateFixed } from "../_libs/lucide-react25.mjs";
import { MapPin } from "../_libs/lucide-react28.mjs";
import { RotateCcw } from "../_libs/lucide-react30.mjs";
import { Route } from "../_libs/lucide-react31.mjs";
import { Button } from "./button-BwhNanlJ.mjs";
import { toast } from "../_libs/sonner.mjs";
import { ActionBadge, FreshnessChip, LEVEL_META, RoadCode, Route$24, findSeededRoutes, routeLabel, useExitGhosts } from "./router-ip9NLZv6.mjs";
import { getCurrentPosition, inCoverage, nearestPlace } from "./geo-Bmmso9Kl.mjs";
import { SegmentDetail } from "./segment-detail-De74_zTW.mjs";
// node_modules/.nitro/vite/services/ssr/assets/check-tK2Op4h0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Accessible autocomplete limited to places in the coverage area. */
function PlaceInput({ label, placeholder, value, onChange, invalid, className }) {
	const { place, lang, t } = usePrefs();
	const id = (0, import_react.useId)();
	const listId = `${id}-list`;
	const [query, setQuery] = (0, import_react.useState)(null);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [active, setActive] = (0, import_react.useState)(0);
	const inputRef = (0, import_react.useRef)(null);
	const text = query ?? (value ? place(value) : "");
	const matches = (0, import_react.useMemo)(() => {
		const q = (query ?? "").trim().toLowerCase();
		return (q ? PLACES.filter((p) => p.name.toLowerCase().includes(q) || p.nameHi.includes(q) || p.district.toLowerCase().includes(q)) : PLACES).slice(0, 8);
	}, [query]);
	const choose = (pid) => {
		onChange(pid);
		setQuery(null);
		setOpen(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: id,
				className: "mb-1.5 block text-xs font-semibold text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
					"aria-hidden": true,
					className: "pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: inputRef,
					id,
					role: "combobox",
					"aria-expanded": open,
					"aria-controls": listId,
					"aria-autocomplete": "list",
					"aria-invalid": invalid || void 0,
					"aria-activedescendant": open && matches[active] ? `${listId}-${matches[active].id}` : void 0,
					autoComplete: "off",
					placeholder,
					value: text,
					onFocus: () => setOpen(true),
					onBlur: () => {
						setTimeout(() => setOpen(false), 120);
						if (query !== null && query.trim() === "") {
							onChange(null);
							setQuery(null);
						}
					},
					onChange: (e) => {
						setQuery(e.target.value);
						setActive(0);
						setOpen(true);
						if (value) onChange(null);
					},
					onKeyDown: (e) => {
						if (e.key === "ArrowDown") {
							e.preventDefault();
							setOpen(true);
							setActive((a) => Math.min(a + 1, matches.length - 1));
						} else if (e.key === "ArrowUp") {
							e.preventDefault();
							setActive((a) => Math.max(a - 1, 0));
						} else if (e.key === "Enter" && open && matches[active]) {
							e.preventDefault();
							choose(matches[active].id);
						} else if (e.key === "Escape") setOpen(false);
					},
					className: cn("h-12 w-full rounded-xl border border-input bg-raised pr-3 pl-10 text-base text-foreground placeholder:text-muted-foreground", invalid && "border-status-dnt")
				})]
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				id: listId,
				role: "listbox",
				"aria-label": label,
				className: "glass-strong absolute z-(--z-content) mt-1.5 max-h-72 w-full overflow-auto rounded-xl p-1 shadow-xl",
				children: matches.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "px-3 py-3 text-sm text-muted-foreground",
					children: t("search.noMatch")
				}) : matches.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					id: `${listId}-${p.id}`,
					role: "option",
					"aria-selected": i === active,
					onMouseDown: (e) => {
						e.preventDefault();
						choose(p.id);
					},
					onMouseEnter: () => setActive(i),
					className: cn("flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 text-sm", i === active && "bg-accent"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: lang === "hi" ? p.nameHi : p.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: p.district
					})]
				}, p.id))
			})
		]
	});
}
function RouteSearchCard({ initialFrom = null, initialTo = null, layout = "stacked", destination = "check", className }) {
	const { t, place } = usePrefs();
	const navigate = useNavigate();
	const [from, setFrom] = (0, import_react.useState)(initialFrom);
	const [to, setTo] = (0, import_react.useState)(initialTo);
	const [ghosts, captureGhosts] = useExitGhosts();
	const [locMsg, setLocMsg] = (0, import_react.useState)(null);
	const [locating, setLocating] = (0, import_react.useState)(false);
	const { places, recentSearches, setRecentSearches: setRecent } = useAppStore();
	const recent = recentSearches.filter((r) => !!r.from && !!r.to);
	(0, import_react.useEffect)(() => {
		setFrom(initialFrom);
		setTo(initialTo);
	}, [initialFrom, initialTo]);
	const same = !!from && from === to;
	const valid = !!from && !!to && !same;
	const submit = (e) => {
		e?.preventDefault();
		if (!valid) return;
		const name = (id) => places.find((p) => p.id === id)?.name ?? id;
		const query = `${name(from)} to ${name(to)}`;
		setRecent((prev) => [{
			query,
			from,
			to,
			at: Date.now()
		}, ...prev.filter((r) => r.query.toLowerCase() !== query.toLowerCase())].slice(0, 5));
		if (destination === "traveller") navigate({
			to: "/traveller",
			search: {
				from,
				to
			}
		});
		else navigate({
			to: "/check",
			search: {
				from,
				to
			}
		});
	};
	const locate = async () => {
		setLocating(true);
		setLocMsg(null);
		const res = await getCurrentPosition();
		setLocating(false);
		if (!res.ok) {
			setLocMsg(t(res.reason === "denied" ? "search.locDenied" : "search.locUnavailable"));
			return;
		}
		if (!inCoverage(res.lat, res.lon)) {
			setLocMsg(t("search.locOutside"));
			return;
		}
		const p = nearestPlace(res.lat, res.lon);
		setFrom(p.id);
		setLocMsg(`${t("search.locNearest")}: ${place(p.id)} (±${Math.round(res.accuracyM)} m)`);
	};
	const pick = (id) => {
		if (!from) setFrom(id);
		else if (!to && id !== from) setTo(id);
		else setTo(id);
	};
	const inline = layout === "inline";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: submit,
		noValidate: true,
		className: cn("space-y-4", className),
		"aria-label": t("search.title"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("grid gap-3", inline ? "md:grid-cols-[1fr_auto_1fr_auto] md:items-end" : "grid-cols-1"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceInput, {
						label: t("search.from"),
						placeholder: t("search.fromPh"),
						value: from,
						onChange: setFrom
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("flex", inline ? "justify-center md:pb-0.5" : "-my-2 justify-end"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							size: "icon-lg",
							className: "size-11 rounded-md",
							onClick: () => {
								setFrom(to);
								setTo(from);
							},
							disabled: !from && !to,
							"aria-label": t("search.swap"),
							title: t("search.swap"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: cn(inline && "md:rotate-90") })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceInput, {
						label: t("search.to"),
						placeholder: t("search.toPh"),
						value: to,
						onChange: setTo,
						invalid: same
					}),
					inline && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						disabled: !valid,
						className: "h-12 rounded-md px-6 text-base font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {}), t("search.submit")]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-x-4 gap-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "link",
					className: "h-11 px-0 text-link",
					onClick: locate,
					disabled: locating,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, {}), locating ? t("search.locating") : t("search.useLocation")]
				}), same && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "text-sm font-medium text-status-dnt",
					children: t("search.same")
				})]
			}),
			locMsg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "-mt-2 text-sm text-muted-foreground",
				children: locMsg
			}),
			!inline && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "submit",
				disabled: !valid,
				className: "h-12 w-full rounded-md text-base font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {}), t("search.submit")]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-xs font-semibold text-muted-foreground",
				children: t("search.quick")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5",
				children: QUICK_PICKS.map((id) => {
					const selected = id === from || id === to;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => pick(id),
						"aria-pressed": selected,
						className: cn("rp-press min-h-11 rounded-md border px-3 text-sm", selected ? "border-brand-orange bg-brand-orange/15 text-foreground" : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"),
						children: place(id)
					}, id);
				})
			})] }),
			recent.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold text-muted-foreground",
					children: t("search.recent")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "ghost",
					size: "sm",
					className: "h-9 text-muted-foreground",
					onClick: () => {
						captureGhosts(recent.map(({ from, to }) => ({
							from,
							to
						})));
						setRecent((prev) => prev.filter((r) => !r.from || !r.to));
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {}), t("search.clearRecent")]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "flex flex-wrap gap-1.5",
				children: [recent.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setFrom(r.from);
						setTo(r.to);
					},
					className: "glass inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm hover:bg-(--glass-hover)",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
							"aria-hidden": true,
							className: "size-3.5 text-muted-foreground"
						}),
						place(r.from),
						" → ",
						place(r.to)
					]
				}) }, `${r.from}-${r.to}`)), ghosts.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					"data-leaving": "true",
					"aria-hidden": true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex min-h-11 items-center gap-1.5 rounded-full bg-accent px-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
								"aria-hidden": true,
								className: "size-3.5 text-muted-foreground"
							}),
							place(r.from),
							" → ",
							place(r.to)
						]
					})
				}, `ghost-${r.from}-${r.to}`))]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: t("search.coverage")
			})
		]
	});
}
function Metric({ label, value, mono }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-xs text-muted-foreground",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: cn("mt-0.5 font-semibold", mono && "font-mono text-sm"),
		children: value
	})] });
}
function RouteCard({ route, summary, index, selected, saved, onSelect, onCompare, onDetails, onToggleSave }) {
	const { t, lang, ago, duration } = usePrefs();
	const letter = String.fromCharCode(65 + index);
	const { advisories: advisoryMap } = useAppStore();
	const advisoryFor = (id) => advisoryMap.get(id);
	const advisories = route.segments.map((segment) => advisoryFor(segment.id)).filter((advisory) => advisory !== void 0);
	const timestamps = advisories.map((advisory) => advisory.latestObservationAt).filter((timestamp) => timestamp !== void 0);
	const latestObservationAt = timestamps.length ? Math.max(...timestamps) : void 0;
	const sources = [...advisories.some((advisory) => advisory.evidence.length > 0) ? [t("source.community")] : [], ...advisories.some((advisory) => !!advisory.restriction) ? [t("source.official")] : []];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: cn("rp-card glass rp-enter flex flex-col rounded-2xl p-5", selected && "glass-accent", selected && "is-selected", selected && "border-foreground/60 ring-1 ring-foreground/30"),
		"aria-label": `Route ${letter}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onSelect,
				"aria-pressed": selected,
				className: "-m-2 rounded-xl p-2 text-left",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-xs text-muted-foreground",
							children: ["ROUTE ", letter]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-0.5 font-display text-lg leading-snug font-semibold",
							children: [
								t("results.via"),
								" ",
								routeLabel(route, lang)
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBadge, { level: summary.level })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreshnessChip, { observationTimestamp: latestObservationAt }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: sources.length ? sources.join(" · ") : t("source.unknown")
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex h-2 overflow-hidden rounded-full bg-muted",
						"aria-hidden": true,
						children: route.segments.map((s) => {
							const l = advisoryFor(s.id)?.level ?? "unknown";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("h-full border-r border-card last:border-0", LEVEL_META[l].bar, l === "unknown" && "opacity-50"),
								style: { width: `${s.distanceKm / route.distanceKm * 100}%` }
							}, s.id);
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: t("results.distance"),
						value: `${route.distanceKm} ${t("common.km")}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: t("results.duration"),
						value: duration(route.typicalMinutes)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: t("results.coverage"),
						value: `${Math.round(summary.coverage * 100)}%`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: t("results.latest"),
						value: summary.latestObservationAt ? ago(summary.latestObservationAt) : t("copy.noRecent")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: t("results.hazards"),
						value: summary.hazardCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: t("results.restrictions"),
						value: summary.restrictionCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: t("results.unknownKm"),
						value: `${summary.unknownKm} ${t("common.km")}`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: t("results.typical")
			}),
			summary.awaitingClearance && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 rounded-lg border border-dashed border-status-official px-3 py-2 text-sm",
				children: t("copy.awaitingClearance")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 flex gap-2 rounded-lg bg-accent px-3 py-2.5 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					"aria-hidden": true,
					className: "mt-0.5 size-4 shrink-0 text-muted-foreground"
				}), t("copy.poorCoverage")]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-auto grid grid-cols-2 gap-2 pt-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						className: "h-auto min-h-11 rounded-md py-2 whitespace-normal",
						onClick: onCompare,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, {}), t("results.compare")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						className: "h-auto min-h-11 rounded-md py-2 whitespace-normal",
						onClick: onDetails,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {}), t("results.details")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						className: "h-auto min-h-11 rounded-md py-2 whitespace-normal",
						onClick: onToggleSave,
						"aria-pressed": saved,
						children: [saved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookmarkCheck, { className: "rp-pop" }, "saved") : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, {}), saved ? t("results.saved") : t("results.save")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						className: "h-auto min-h-11 rounded-md py-2 whitespace-normal",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/report",
							search: { segment: route.segments[0]?.id },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {}), t("results.reportHere")]
						})
					})
				]
			})
		]
	});
}
var VIEW = {
	minLon: 77.75,
	maxLon: 80.55,
	minLat: 28.85,
	maxLat: 31.2
};
var W = 1e3;
var H = 970;
var project = (lat, lon) => ({
	x: (lon - VIEW.minLon) / (VIEW.maxLon - VIEW.minLon) * W,
	y: (VIEW.maxLat - lat) / (VIEW.maxLat - VIEW.minLat) * H
});
var unproject = (x, y) => ({
	lon: VIEW.minLon + x / W * (VIEW.maxLon - VIEW.minLon),
	lat: VIEW.maxLat - y / H * (VIEW.maxLat - VIEW.minLat)
});
function SchematicMap({ highlight, endpoints, labelPlaces, selectedSegmentId, onSelectSegment, onPickPoint, pin, terrain = false, className }) {
	const { t, place } = usePrefs();
	const { advisories, segments: SEGMENTS, places: PLACES } = useAppStore();
	const highlightSet = (0, import_react.useMemo)(() => new Set(highlight ?? []), [highlight]);
	const hasHighlight = highlightSet.size > 0;
	const labelIds = new Set(labelPlaces ?? [...QUICK_PICKS, ...endpoints ?? []]);
	const stopIds = new Set(SEGMENTS.flatMap((s) => [s.from, s.to]));
	const handleSvgClick = (e) => {
		if (!onPickPoint) return;
		const svg = e.currentTarget;
		const pt = svg.createSVGPoint();
		pt.x = e.clientX;
		pt.y = e.clientY;
		const ctm = svg.getScreenCTM();
		if (!ctm) return;
		const p = pt.matrixTransform(ctm.inverse());
		const { lat, lon } = unproject(p.x, p.y);
		onPickPoint(lat, lon);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn(terrain ? "relative h-full w-full overflow-hidden bg-transparent" : "glass relative overflow-hidden rounded-2xl rp-grid-bg", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: `0 0 ${W} ${H}`,
			className: cn(terrain ? "block h-full w-full" : "block h-auto w-full", onPickPoint && "cursor-crosshair"),
			role: "group",
			"aria-label": t("map.schematic"),
			onClick: handleSvgClick,
			children: [
				SEGMENTS.map((s) => {
					const a = placeById(s.from);
					const b = placeById(s.to);
					const pa = project(a.lat, a.lon);
					const pb = project(b.lat, b.lon);
					const adv = advisories.get(s.id);
					const level = adv?.level ?? "unknown";
					const inRoute = highlightSet.has(s.id);
					const dim = hasHighlight && !inRoute;
					const selected = s.id === selectedSegmentId;
					const dashed = level === "unknown";
					const label = `${s.code}, ${place(s.from)} – ${place(s.to)}: ${t(`level.${level}`)}${adv?.stale ? `, ${t("level.stale")}` : ""}`;
					const interactive = !!onSelectSegment;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						role: interactive ? "button" : void 0,
						tabIndex: interactive ? 0 : void 0,
						"aria-label": interactive ? label : void 0,
						"aria-pressed": interactive ? selected : void 0,
						onClick: (e) => {
							if (!interactive) return;
							e.stopPropagation();
							onSelectSegment(s.id);
						},
						onKeyDown: (e) => {
							if (interactive && (e.key === "Enter" || e.key === " ")) {
								e.preventDefault();
								onSelectSegment(s.id);
							}
						},
						className: cn(interactive && "cursor-pointer outline-none [&:focus-visible>line.focus]:opacity-100"),
						opacity: dim ? .28 : 1,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: label }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: pa.x,
								y1: pa.y,
								x2: pb.x,
								y2: pb.y,
								stroke: "transparent",
								strokeWidth: 30
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								className: "focus opacity-0",
								x1: pa.x,
								y1: pa.y,
								x2: pb.x,
								y2: pb.y,
								stroke: "var(--ring)",
								strokeWidth: 22,
								strokeLinecap: "round"
							}),
							selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								className: "rp-fade-pulse-once",
								x1: pa.x,
								y1: pa.y,
								x2: pb.x,
								y2: pb.y,
								stroke: "var(--foreground)",
								strokeWidth: 18,
								strokeLinecap: "round",
								opacity: .9
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: pa.x,
								y1: pa.y,
								x2: pb.x,
								y2: pb.y,
								stroke: terrain ? "var(--route-glow)" : LEVEL_META[level].color,
								strokeWidth: inRoute || selected ? 11 : 7,
								strokeLinecap: "round",
								strokeDasharray: dashed ? "4 14" : void 0
							})
						]
					}, s.id);
				}),
				SEGMENTS.map((s) => {
					const adv = advisories.get(s.id);
					if (!adv) return null;
					const a = placeById(s.from);
					const b = placeById(s.to);
					const pa = project(a.lat, a.lon);
					const pb = project(b.lat, b.lon);
					const mx = (pa.x + pb.x) / 2;
					const my = (pa.y + pb.y) / 2;
					const hazards = adv.evidence.filter((r) => r.kind === "hazard").length;
					const unknown = adv.level === "unknown";
					const dim = hasHighlight && !highlightSet.has(s.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						pointerEvents: "none",
						opacity: dim ? .3 : 1,
						children: [
							hazards > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
								transform: `translate(${mx + (adv.restriction ? 22 : unknown ? 16 : 0)}, ${my - 4})`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									r: 17,
									fill: "var(--card)",
									stroke: LEVEL_META[adv.level].color,
									strokeWidth: 3
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
									x: -10,
									y: -11,
									width: 20,
									height: 20,
									color: "var(--foreground)"
								})]
							}),
							adv.restriction && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
								transform: `translate(${mx - (hazards ? 22 : unknown ? 16 : 0)}, ${my - 4})`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									r: 17,
									fill: "var(--status-official)",
									stroke: "var(--card)",
									strokeWidth: 3
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
									x: -10,
									y: -10,
									width: 20,
									height: 20,
									color: "var(--report-foreground)"
								})]
							}),
							unknown && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
								transform: `translate(${mx - (hazards || adv.restriction ? 16 : 0)}, ${my - 4})`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									r: 17,
									fill: "var(--card)",
									stroke: LEVEL_META.unknown.color,
									strokeWidth: 3
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, {
									x: -10,
									y: -10,
									width: 20,
									height: 20,
									color: LEVEL_META.unknown.color
								})]
							})
						]
					}, `m-${s.id}`);
				}),
				PLACES.filter((p) => stopIds.has(p.id)).map((p) => {
					const { x, y } = project(p.lat, p.lon);
					const isEnd = endpoints?.includes(p.id);
					const showLabel = labelIds.has(p.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						pointerEvents: "none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: x,
							cy: y,
							r: isEnd ? 11 : showLabel ? 7 : 4.5,
							fill: isEnd ? "var(--brand-orange)" : "var(--foreground)",
							stroke: "var(--card)",
							strokeWidth: 3
						}), showLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
							x: x + 14,
							y: y + 8,
							fontSize: isEnd ? 28 : 24,
							fontWeight: isEnd ? 700 : 500,
							fill: "var(--foreground)",
							stroke: "var(--card)",
							strokeWidth: 6,
							paintOrder: "stroke",
							style: { fontFamily: "var(--font-body)" },
							children: place(p.id)
						})]
					}, p.id);
				}),
				pin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					transform: `translate(${project(pin.lat, pin.lon).x}, ${project(pin.lat, pin.lon).y})`,
					pointerEvents: "none",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						r: 22,
						fill: "var(--brand-orange)",
						opacity: .25
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						r: 9,
						fill: "var(--brand-orange)",
						stroke: "var(--report-foreground)",
						strokeWidth: 3
					})]
				})
			]
		}), !terrain && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "pointer-events-none absolute right-3 bottom-2 font-mono text-xs text-muted-foreground",
			children: t("map.schematic")
		})]
	});
}
function MapLegend({ className }) {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("glass-strong rounded-2xl p-4", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-xs font-semibold text-muted-foreground",
				children: t("map.legend")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3 xl:grid-cols-2",
				children: [
					[
						"clear",
						"caution",
						"avoid",
						"do_not_travel",
						"unknown"
					].map((l) => {
						const Icon = LEVEL_META[l].icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
									width: "28",
									height: "8",
									"aria-hidden": true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
										x1: "4",
										y1: "4",
										x2: "24",
										y2: "4",
										stroke: LEVEL_META[l].color,
										strokeWidth: "5",
										strokeLinecap: "round",
										strokeDasharray: l === "unknown" ? "2 5" : void 0
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									"aria-hidden": true,
									className: "size-3.5",
									style: { color: LEVEL_META[l].color }
								}),
								t(`level.${l}`)
							]
						}, l);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							className: "inline-flex size-5 items-center justify-center rounded-full border-2 border-status-caution bg-card",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3" })
						}), t("map.hazard")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							className: "inline-flex size-5 items-center justify-center rounded-full bg-status-official",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3 text-primary-foreground" })
						}), t("map.restriction")]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 border-t border-border pt-3 text-xs text-muted-foreground",
				children: t("map.layers")
			})
		]
	});
}
function CheckPage() {
	const { t, place } = usePrefs();
	const { segments, advisories, savedRoads, setSavedRoads } = useAppStore();
	const search = Route$24.useSearch();
	const navigate = Route$24.useNavigate();
	const view = search.view ?? "map";
	const from = search.from && placeById(search.from) ? search.from : null;
	const to = search.to && placeById(search.to) ? search.to : null;
	const journey = !!from && !!to && from !== to;
	const [sort, setSort] = (0, import_react.useState)("fastest");
	const [selectedRouteId, setSelectedRouteId] = (0, import_react.useState)(null);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const explorerRef = (0, import_react.useRef)(null);
	const detailRef = (0, import_react.useRef)(null);
	const routes = (0, import_react.useMemo)(() => {
		if (!journey) return [];
		return findSeededRoutes(from, to).map((r) => ({
			route: r,
			summary: summariseRoute(r.segments, r.segments.map((s) => advisories.get(s.id)))
		})).sort((a, b) => {
			if (sort === "shortest") return a.route.distanceKm - b.route.distanceKm;
			if (sort === "current") return (b.summary.latestObservationAt ?? 0) - (a.summary.latestObservationAt ?? 0) || b.summary.coverage - a.summary.coverage;
			return a.route.typicalMinutes - b.route.typicalMinutes;
		});
	}, [
		journey,
		from,
		to,
		sort,
		advisories
	]);
	const selected = routes.find((r) => r.route.id === selectedRouteId) ?? routes[0];
	const filteredSegments = (0, import_react.useMemo)(() => {
		if (journey) return selected?.route.segments ?? [];
		return segments.filter((s) => {
			const a = advisories.get(s.id);
			if (!a) return false;
			if (filter === "issues") return a.level !== "clear" && a.level !== "unknown";
			if (filter === "official") return !!a.restriction;
			if (filter === "unknown") return a.level === "unknown";
			return true;
		});
	}, [
		journey,
		selected,
		filter,
		segments,
		advisories
	]);
	const setView = (v) => void navigate({
		search: (prev) => ({
			...prev,
			view: v
		}),
		replace: true,
		resetScroll: false
	});
	const selectSeg = (id) => {
		navigate({
			search: (prev) => ({
				...prev,
				seg: id
			}),
			replace: true,
			resetScroll: false
		});
		if (id && window.matchMedia("(max-width: 1279px)").matches) requestAnimationFrame(() => detailRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "start"
		}));
	};
	const goExplorer = (routeId, v) => {
		setSelectedRouteId(routeId);
		setView(v);
		requestAnimationFrame(() => explorerRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "start"
		}));
	};
	const toggleSave = (routeId) => {
		if (!from || !to) return;
		const exists = savedRoads.some((s) => s.id === routeId);
		setSavedRoads((prev) => exists ? prev.filter((s) => s.id !== routeId) : [...prev, {
			id: routeId,
			from,
			to,
			savedAt: Date.now()
		}]);
		toast(exists ? t("results.save") : t("results.saved"));
	};
	const highlight = journey ? selected?.route.segments.map((s) => s.id) : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rp-container space-y-8 py-8 md:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "rp-page-title",
					children: journey ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex flex-wrap items-center gap-x-3",
						children: [
							place(from),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
								"aria-hidden": true,
								className: "size-7 text-brand-orange"
							}),
							" ",
							place(to)
						]
					}) : t("adv.title")
				}), !journey && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-2xl text-muted-foreground",
					children: t("adv.body")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "glass-strong rounded-2xl p-5 md:p-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouteSearchCard, {
					initialFrom: from,
					initialTo: to,
					layout: "inline"
				})
			}),
			journey && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-labelledby": "results-title",
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "results-title",
						className: "font-display text-2xl font-semibold",
						children: t("results.title")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
							"aria-hidden": true,
							className: "size-4"
						}), t("results.seeded")]
					})] }), routes.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						role: "group",
						"aria-label": t("results.sort"),
						className: "flex flex-wrap items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mr-1 text-sm text-muted-foreground",
							children: t("results.sort")
						}), [
							"fastest",
							"shortest",
							"current"
						].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": sort === k,
							onClick: () => setSort(k),
							className: cn("glass min-h-10 rounded-md px-3.5 text-sm", sort === k ? "border-foreground/60 font-medium" : "text-muted-foreground hover:text-foreground"),
							children: t(`sort.${k}`)
						}, k))]
					})]
				}), routes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass rounded-2xl p-8 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
							"aria-hidden": true,
							className: "mx-auto mb-3 size-8 text-muted-foreground"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-lg font-semibold",
							children: t("results.none")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-2 max-w-lg text-sm text-muted-foreground",
							children: t("results.noneBody")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							className: "mt-5 h-11 rounded-md",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/check",
								search: { view: "list" },
								children: t("nav.advisories")
							})
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("grid gap-4", routes.length > 1 && "lg:grid-cols-2", routes.length > 2 && "xl:grid-cols-3"),
					children: routes.map(({ route, summary }, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouteCard, {
						route,
						summary,
						index: i,
						selected: route.id === selected?.route.id,
						saved: savedRoads.some((s) => s.id === route.id),
						onSelect: () => setSelectedRouteId(route.id),
						onCompare: () => goExplorer(route.id, "map"),
						onDetails: () => goExplorer(route.id, "list"),
						onToggleSave: () => toggleSave(route.id)
					}, route.id))
				})]
			}),
			(!journey || routes.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				ref: explorerRef,
				"aria-labelledby": "explorer-title",
				className: "scroll-mt-24 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "explorer-title",
							className: "font-display text-2xl font-semibold",
							children: journey ? t("results.sections") : view === "map" ? t("nav.map") : t("nav.advisories")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							role: "group",
							"aria-label": `${t("view.map")} / ${t("view.list")}`,
							className: "glass inline-flex rounded-lg p-1",
							children: ["map", "list"].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"aria-pressed": view === v,
								onClick: () => setView(v),
								className: cn("inline-flex min-h-10 items-center gap-1.5 rounded-md px-4 text-sm font-medium", view === v ? "glass-accent text-foreground" : "text-muted-foreground hover:text-foreground"),
								children: [v === "map" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, {
									"aria-hidden": true,
									className: "size-4"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
									"aria-hidden": true,
									className: "size-4"
								}), t(`view.${v}`)]
							}, v))
						})]
					}),
					!journey && view === "list" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						role: "group",
						"aria-label": t("adv.filter"),
						className: "flex flex-wrap gap-1.5",
						children: [
							"all",
							"issues",
							"official",
							"unknown"
						].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": filter === f,
							onClick: () => setFilter(f),
							className: cn("glass min-h-10 rounded-md px-3.5 text-sm", filter === f ? "border-foreground/60 font-medium" : "text-muted-foreground hover:text-foreground"),
							children: t(`adv.filter${f[0].toUpperCase()}${f.slice(1)}`)
						}, f))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-w-0 space-y-4",
							children: view === "map" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SchematicMap, {
								highlight,
								endpoints: journey ? [from, to] : void 0,
								selectedSegmentId: search.seg,
								onSelectSegment: selectSeg
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapLegend, {})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SegmentList, {
								segments: filteredSegments,
								grouped: !journey,
								selectedId: search.seg,
								onSelect: selectSeg
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: detailRef,
							className: "scroll-mt-24 xl:sticky xl:top-[calc(var(--shell-bar-height)+1rem)] xl:self-start",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SegmentDetail, {
								segmentId: search.seg,
								onClose: search.seg ? () => selectSeg(void 0) : void 0
							})
						})]
					})
				]
			})
		]
	});
}
function SegmentRow({ segment, selected, onSelect }) {
	const { t, place } = usePrefs();
	const { advisories } = useAppStore();
	const a = advisories.get(segment.id);
	if (!a) throw new Error(`Missing advisory for segment "${segment.id}"`);
	const hazards = a.evidence.filter((r) => r.kind === "hazard").length;
	const sources = [...a.evidence.length > 0 ? [t("source.community")] : [], ...a.restriction ? [t("source.official")] : []];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onSelect,
		"aria-pressed": selected,
		className: cn("glass grid w-full gap-2 rounded-xl p-4 text-left transition-colors sm:grid-cols-[1fr_auto] sm:items-center", selected && "glass-accent border-foreground/60"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RoadCode, { children: [
					segment.code,
					" · km ",
					segment.kmStart,
					"–",
					segment.kmEnd,
					" ·",
					" ",
					segment.distanceKm,
					" ",
					t("common.km")
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-0.5 font-semibold",
					children: [
						place(segment.from),
						" – ",
						place(segment.to)
					]
				}),
				(hazards > 0 || a.restriction) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: [hazards > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-2 inline-flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
								"aria-hidden": true,
								className: "size-3"
							}),
							" ",
							hazards,
							" ",
							t("map.hazard")
						]
					}), a.restriction && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-2 inline-flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
								"aria-hidden": true,
								className: "size-3 text-status-official"
							}),
							" ",
							t(`restriction.${a.restriction.type}`)
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: sources.length ? sources.join(" · ") : t("source.unknown")
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-1.5 sm:justify-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBadge, { level: a.level }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreshnessChip, { observationTimestamp: a.latestObservationAt })]
		})]
	}) });
}
function SegmentList({ segments, grouped, selectedId, onSelect }) {
	const { t } = usePrefs();
	const { corridors } = useAppStore();
	if (segments.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground",
		children: t("adv.empty")
	});
	if (!grouped) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "space-y-2",
		children: segments.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SegmentRow, {
			segment: s,
			selected: s.id === selectedId,
			onSelect: () => onSelect(s.id)
		}, s.id))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-6",
		children: corridors.map((c) => {
			const segs = segments.filter((s) => s.corridorId === c.id);
			if (!segs.length) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "mb-2 flex items-baseline gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoadCode, {
					className: "text-sm",
					children: c.code
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold",
					children: c.name
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: segs.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SegmentRow, {
					segment: s,
					selected: s.id === selectedId,
					onSelect: () => onSelect(s.id)
				}, s.id))
			})] }, c.id);
		})
	});
}
export { CheckPage as component };
