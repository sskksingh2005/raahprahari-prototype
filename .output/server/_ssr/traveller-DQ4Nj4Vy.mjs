import { __toESM } from "../_runtime.mjs";
import { cn, placeById, useAppStore, usePrefs } from "./preferences-BoWpYuS4.mjs";
import { require_react } from "../_libs/react.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { useNavigate } from "../_libs/@tanstack/react-router+[4...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { ArrowLeft, ArrowRight, Map as Map$1, Search, ShieldCheck, TriangleAlert, X } from "../_libs/lucide-react3.mjs";
import { Clock3 } from "../_libs/lucide-react14.mjs";
import { List } from "../_libs/lucide-react23.mjs";
import { LocateFixed } from "../_libs/lucide-react25.mjs";
import { MapPin } from "../_libs/lucide-react28.mjs";
import { RotateCcw } from "../_libs/lucide-react30.mjs";
import { UsersRound } from "../_libs/lucide-react32.mjs";
import { Button } from "./button-BwhNanlJ.mjs";
import { ActionBadge, FreshnessChip, PrototypeRibbon, Route$15, SkeletonList, findSeededRoutes, useExitGhosts } from "./router-ip9NLZv6.mjs";
import { getCurrentPosition, inCoverage, nearestPlace } from "./geo-Bmmso9Kl.mjs";
import { LeafletMapLegend, LeafletSegmentMap } from "./leaflet-segment-map-CSIxfagM.mjs";
// node_modules/.nitro/vite/services/ssr/assets/traveller-DQ4Nj4Vy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Typing waits this long after the last keystroke before results update. */
var FILTERS = [
	["all", "All"],
	["roads", "Roads"],
	["hazards", "Hazards"]
];
function TravellerPage() {
	const { t, place, ago } = usePrefs();
	const { segments, corridors, places, advisories, recentSearches: recent, setRecentSearches: setRecent } = useAppStore();
	const navigate = useNavigate();
	const search = Route$15.useSearch();
	const inputRef = (0, import_react.useRef)(null);
	const debounceRef = (0, import_react.useRef)(void 0);
	const lastTypedAtRef = (0, import_react.useRef)(0);
	const from = search.from && placeById(search.from) ? search.from : void 0;
	const to = search.to && placeById(search.to) ? search.to : void 0;
	const journey = !!from && !!to && from !== to;
	const [query, setQuery] = (0, import_react.useState)(search.q ?? (journey && from && to ? `${place(from)} to ${place(to)}` : ""));
	const [searchStatus, setSearchStatus] = (0, import_react.useState)("idle");
	/** True while a typed query is waiting for the debounce to fire. */
	const [pending, setPending] = (0, import_react.useState)(false);
	const [filter, setFilter] = (0, import_react.useState)("all");
	/** Shared by the map, the result list and the selected-section panel. */
	const [selectedSegmentId, setSelectedSegmentId] = (0, import_react.useState)(search.seg);
	const [locationMessage, setLocationMessage] = (0, import_react.useState)(null);
	const [locating, setLocating] = (0, import_react.useState)(false);
	const [manualEntry, setManualEntry] = (0, import_react.useState)(false);
	const activeQuery = search.q?.trim() ?? "";
	const hasSearch = !!activeQuery || journey;
	(0, import_react.useEffect)(() => () => window.clearTimeout(debounceRef.current), []);
	(0, import_react.useEffect)(() => {
		const input = inputRef.current;
		if (!input || document.activeElement === input) return;
		if (Date.now() - lastTypedAtRef.current > 2e3) return;
		input.focus();
		input.setSelectionRange(input.value.length, input.value.length);
	}, [hasSearch]);
	const routeOptions = (0, import_react.useMemo)(() => {
		if (journey && from && to) return findSeededRoutes(from, to);
		const endpoints = routePlaceIds(activeQuery, places);
		return endpoints ? findSeededRoutes(...endpoints) : [];
	}, [
		activeQuery,
		from,
		to,
		journey,
		places
	]);
	const results = (0, import_react.useMemo)(() => {
		try {
			if (journey) return {
				matches: [...new Map(routeOptions.flatMap((route) => route.segments).map((s) => [s.id, s])).values()].map((s) => toMatch(s, true, advisories)),
				error: false
			};
			return {
				matches: searchSegments(activeQuery, {
					segments,
					corridors,
					places,
					advisories
				}),
				error: false
			};
		} catch (error) {
			console.error("Road search failed", error);
			return {
				matches: [],
				error: true
			};
		}
	}, [
		activeQuery,
		journey,
		routeOptions,
		segments,
		corridors,
		places,
		advisories
	]);
	const counts = {
		all: results.matches.length,
		roads: results.matches.filter((m) => m.road).length,
		hazards: results.matches.filter((m) => m.hazard).length
	};
	const filteredResults = results.matches.filter((m) => filter === "roads" ? m.road : filter === "hazards" ? m.hazard : true);
	const routeSummary = routeOptions[0];
	const rememberSearch = (value) => setRecent((previous) => [{
		query: value,
		at: Date.now()
	}, ...previous.filter((item) => item.query.toLowerCase() !== value.toLowerCase())].slice(0, 5));
	/** Puts the query in the URL. Typed (debounced) searches replace history and are not remembered. */
	const commitSearch = (value, remember) => navigate({
		to: "/traveller",
		search: {
			q: value,
			from: void 0,
			to: void 0,
			view: void 0,
			seg: void 0
		},
		replace: !remember
	}).then(() => {
		setSearchStatus("idle");
		setPending(false);
		if (remember && value) rememberSearch(value);
	}).catch((error) => {
		console.error("Road search navigation failed", error);
		setPending(false);
		setSearchStatus("failure");
	});
	const runSearch = (rawQuery = query, options = {}) => {
		const value = rawQuery.trim();
		window.clearTimeout(debounceRef.current);
		setPending(false);
		if (!value) {
			inputRef.current?.focus();
			return;
		}
		setQuery(value);
		if (!options.keepMessage) setLocationMessage(null);
		setSearchStatus("loading");
		window.setTimeout(() => void commitSearch(value, true), 100);
	};
	const onQueryChange = (value) => {
		setQuery(value);
		lastTypedAtRef.current = Date.now();
		window.clearTimeout(debounceRef.current);
		if (searchStatus === "failure") setSearchStatus("idle");
		const trimmed = value.trim();
		if (trimmed === activeQuery && !journey) {
			setPending(false);
			return;
		}
		setPending(true);
		debounceRef.current = window.setTimeout(() => void commitSearch(trimmed || void 0, false), 300);
	};
	const clearSearch = () => {
		window.clearTimeout(debounceRef.current);
		setPending(false);
		setQuery("");
		setSearchStatus("idle");
		setLocationMessage(null);
		setFilter("all");
		navigate({
			to: "/traveller",
			search: {
				q: void 0,
				from: void 0,
				to: void 0,
				view: void 0,
				seg: void 0
			}
		});
	};
	/** Asks the browser for permission; the browser shows its own prompt. */
	const requestCurrentLocation = async () => {
		setLocating(true);
		setLocationMessage(null);
		const result = await getCurrentPosition();
		setLocating(false);
		if (!result.ok) {
			setLocationMessage(result.reason === "denied" ? "Location permission denied. Search manually instead." : "Location is unavailable. You can still search manually.");
			setManualEntry(true);
			inputRef.current?.focus();
			return;
		}
		if (!inCoverage(result.lat, result.lon)) {
			setLocationMessage("Your location is outside the current coverage area. Enter a place or road manually.");
			setManualEntry(true);
			inputRef.current?.focus();
			return;
		}
		const nearest = nearestPlace(result.lat, result.lon);
		const name = place(nearest.id);
		setLocationMessage(`Showing road sections at ${name}, the nearest covered place (location accurate to about ${Math.round(result.accuracyM)} m). Edit the search to change it.`);
		runSearch(name, { keepMessage: true });
	};
	/** Selecting on the map also brings the matching result row into view. */
	const selectFromMap = (id) => {
		setSelectedSegmentId(id);
		requestAnimationFrame(() => document.getElementById(`traveller-result-${id}`)?.scrollIntoView?.({
			block: "nearest",
			behavior: "smooth"
		}));
	};
	const chooseRecent = (value) => {
		setQuery(value);
		runSearch(value);
	};
	const searchForm = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "traveller-search-form",
		onSubmit: (event) => {
			event.preventDefault();
			runSearch();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "traveller-search-label",
				htmlFor: "traveller-query",
				children: "Search a place or road"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "traveller-query-wrap",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
						"aria-hidden": true,
						className: "traveller-query-icon"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: inputRef,
						className: "glass",
						id: "traveller-query",
						value: query,
						onChange: (event) => onQueryChange(event.target.value),
						placeholder: "e.g. Dehradun to Mussoorie",
						autoComplete: "off"
					}),
					query && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "traveller-clear-query",
						"aria-label": "Clear search",
						onClick: clearSearch,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { "aria-hidden": true })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "submit",
				variant: "report",
				className: "traveller-search-submit",
				disabled: !query.trim() || searchStatus === "loading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { "aria-hidden": true }), searchStatus === "loading" || pending ? t("common.searching") : "Search road"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "traveller-location-actions",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					onClick: () => void requestCurrentLocation(),
					disabled: locating,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, { "aria-hidden": true }), locating ? "Getting location…" : "Use current location"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "ghost",
					onClick: () => {
						setManualEntry(true);
						inputRef.current?.focus();
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { "aria-hidden": true }), "Enter location manually"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "traveller-location-note",
				role: locationMessage ? "status" : void 0,
				children: locationMessage ?? (manualEntry ? "Manual search is active. Location access is optional." : "Location access is optional. Search manually at any time.")
			})
		]
	});
	if (!hasSearch && searchStatus !== "failure") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "traveller-page traveller-landing",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "traveller-search-panel glass",
				"aria-labelledby": "traveller-title",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "traveller-panel-content",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "traveller-eyebrow",
							children: "Road advisories · Uttarakhand"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							id: "traveller-title",
							className: "rp-page-title",
							children: "Where are you travelling?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "traveller-panel-description",
							children: "Search reported road conditions, evidence freshness, and official restrictions."
						}),
						searchForm,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecentSearches, {
							recent,
							onChoose: chooseRecent,
							onClear: () => setRecent([])
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TravellerMap, {
				results: [],
				selectedSegmentId,
				onSelectSegment: selectFromMap,
				summary: "All covered road sections · approx."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TravellerFooter, {})
		]
	});
	const resultTitle = "Search results";
	const routeFrom = journey && from ? place(from) : routeSummary ? place(routeSummary.segments[0]?.from ?? "") : void 0;
	const routeTo = journey && to ? place(to) : routeSummary ? place(routeSummary.segments.at(-1)?.to ?? "") : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "traveller-page traveller-results-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "traveller-results-banner photo-surface",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "traveller-results-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "traveller-back-link",
							onClick: clearSearch,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { "aria-hidden": true }), "Back to search"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "rp-page-title",
							children: resultTitle
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Here are the latest reports and advisories for your search." })
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "traveller-results-search",
						children: searchForm
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "traveller-filter-row",
					role: "group",
					"aria-label": "Filter results",
					children: FILTERS.map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": filter === key,
						className: cn("traveller-filter-chip glass", filter === key && "is-active"),
						onClick: () => setFilter(key),
						children: [
							key === "roads" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map$1, { "aria-hidden": true }),
							key === "hazards" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { "aria-hidden": true }),
							label,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "traveller-filter-count",
								children: counts[key]
							})
						]
					}, key))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "traveller-results-layout",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "traveller-result-list",
					"aria-label": "Search results",
					children: searchStatus === "loading" || pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "traveller-state-card glass rp-fade-rise",
						role: "status",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "traveller-loading-mark",
							"aria-hidden": true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Searching road information…" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Checking available synthetic reports and advisories." })] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonList, { count: 2 })] }) : searchStatus === "failure" || results.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "traveller-state-card glass rp-fade-rise",
						role: "alert",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { "aria-hidden": true }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Search could not be completed." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Try again or enter a place or road manually." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => runSearch(),
								children: "Try again"
							})
						] })]
					}) : filteredResults.length ? filteredResults.map(({ segment, advisory }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultRow, {
						segment,
						selected: segment.id === selectedSegmentId,
						onSelect: () => setSelectedSegmentId(segment.id),
						observedAt: advisory.latestObservationAt,
						reason: advisory.evidence[0]?.description ?? advisory.restriction?.title ?? "No recent observation is available for this road section.",
						observedLabel: advisory.latestObservationAt ? ago(advisory.latestObservationAt) : void 0
					}, segment.id)) : results.matches.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "traveller-empty-state glass rp-fade-rise",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { "aria-hidden": true }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
								"No ",
								filter === "roads" ? "road" : "hazard",
								" matches for this search."
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: filter === "hazards" ? "No hazard or restriction is on record here. That does not mean the road is clear." : "Your search only matched report text, not a road name, ID or place." })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								variant: "ghost",
								onClick: () => setFilter("all"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { "aria-hidden": true }),
									"Show all ",
									results.matches.length,
									" results"
								]
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "traveller-empty-state glass rp-fade-rise",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { "aria-hidden": true }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "No matching reports found." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This does not confirm current road conditions." })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								variant: "ghost",
								onClick: clearSearch,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { "aria-hidden": true }), "Try a different search"]
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TravellerMap, {
					results: filteredResults,
					selectedSegmentId,
					onSelectSegment: selectFromMap,
					routeFrom,
					routeTo,
					summary: routeSummary ? "Route summary · approx." : "Matching road sections · approx."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TravellerFooter, {})
		]
	});
}
function getTravellerResultAction(advisory) {
	if (advisory.restriction) return advisory.level === "clear" ? "unknown" : advisory.level;
	if (!advisory.evidence.length) return "unknown";
	return advisory.level === "caution" || advisory.level === "avoid" ? advisory.level : "unknown";
}
function ResultRow({ segment, observedAt, observedLabel, reason, selected = false, onSelect }) {
	const { t, place } = usePrefs();
	const { advisories } = useAppStore();
	const advisory = advisories.get(segment.id);
	if (!advisory) throw new Error(`Missing advisory for segment "${segment.id}"`);
	const action = getTravellerResultAction(advisory);
	const sourceLabel = advisory.evidence.length ? "Community report, not independently verified" : advisory.restriction ? "Official source" : "No reported source";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		id: `traveller-result-${segment.id}`,
		className: cn("rp-card glass rp-enter traveller-result-row", `status-${action}`, advisory.stale && "is-stale", selected && "is-selected"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "traveller-result-badge",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBadge, { level: action })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "traveller-result-main",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "rp-wrap-anywhere",
						children: [
							place(segment.from),
							" – ",
							place(segment.to),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"(",
								segment.code,
								")"
							] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "traveller-road-code",
						children: [
							"km ",
							segment.kmStart,
							"–",
							segment.kmEnd
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "traveller-result-reason",
						children: reason
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "traveller-restriction-detail",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Official restriction:" }),
							" ",
							advisory.restriction?.title ?? "No current official information"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "traveller-source-detail",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Evidence / Source:" }),
							" ",
							sourceLabel
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "traveller-result-metadata",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { "aria-hidden": true }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Observed:" }),
								" ",
								observedLabel ?? "time unavailable"
							] }),
							advisory.restriction && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { "aria-hidden": true }), " Official restriction"] }),
							advisory.evidence.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersRound, { "aria-hidden": true }), " Community evidence"] })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "traveller-row-trailing",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "traveller-freshness-chip",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Freshness:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreshnessChip, {
							observationTimestamp: observedAt,
							className: "traveller-inline-freshness"
						})]
					}),
					onSelect && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: selected ? "secondary" : "ghost",
						className: "traveller-view-details",
						"aria-pressed": selected,
						onClick: onSelect,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map$1, { "aria-hidden": true }), selected ? "Shown on map" : "Show on map"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						type: "button",
						variant: "outline",
						className: "traveller-view-details",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/advisories/$segmentId",
							params: { segmentId: segment.id },
							children: [t("common.viewDetails"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { "aria-hidden": true })]
						})
					})
				]
			})
		]
	});
}
function RecentSearches({ recent, onChoose, onClear }) {
	const [showExample, setShowExample] = (0, import_react.useState)(true);
	const [ghosts, captureGhosts] = useExitGhosts();
	const example = "Dehradun to Mussoorie";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "traveller-recent",
		"aria-labelledby": "traveller-recent-title",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "traveller-recent-heading",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "traveller-recent-title",
				children: "Recent searches"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "ghost",
				onClick: () => {
					captureGhosts(recent);
					onClear();
					setShowExample(false);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { "aria-hidden": true }), "Clear"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [
			recent.map(({ query }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "glass rounded-md",
				onClick: () => onChoose(query),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { "aria-hidden": true }), query]
			}) }, query)),
			ghosts.map(({ query }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				"data-leaving": "true",
				"aria-hidden": true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					tabIndex: -1,
					disabled: true,
					"aria-hidden": true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { "aria-hidden": true }), query]
				})
			}, `ghost-${query}`)),
			!recent.length && showExample && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "traveller-example-search",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Illustrative example" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "glass rounded-md",
					onClick: () => onChoose(example),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { "aria-hidden": true }), example]
				})]
			})
		] })]
	});
}
function TravellerMap({ results, selectedSegmentId, onSelectSegment, routeFrom, routeTo, summary }) {
	const { t, place } = usePrefs();
	const { segments, advisories } = useAppStore();
	const [mode, setMode] = (0, import_react.useState)("map");
	const [mapUnavailable, setMapUnavailable] = (0, import_react.useState)(false);
	const resultSegments = results.map(({ segment }) => segment);
	const shown = resultSegments.length ? resultSegments : segments;
	const selected = selectedSegmentId ? segments.find((s) => s.id === selectedSegmentId) : void 0;
	const selectedAdvisory = selected ? advisories.get(selected.id) : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "traveller-map-panel",
		"aria-label": "Road map",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "traveller-map-surface",
				children: [mode === "map" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeafletSegmentMap, {
					segments: shown,
					highlight: resultSegments.length ? resultSegments.map((s) => s.id) : void 0,
					selectedSegmentId,
					onSelectSegment,
					onUnavailable: () => {
						setMapUnavailable(true);
						setMode("list");
					},
					label: "Interactive map of matching road sections",
					className: "traveller-leaflet",
					showRibbon: false
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [mapUnavailable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "traveller-map-fallback-notice",
					role: "status",
					children: "The map tiles could not be loaded. Showing road sections instead."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "traveller-map-list glass-strong",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Road sections" }), results.length ? results.slice(0, 6).map(({ segment }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "traveller-map-list-row",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"aria-pressed": selectedSegmentId === segment.id,
								onClick: () => onSelectSegment(segment.id),
								children: [
									selectedSegmentId === segment.id ? "Selected: " : "Select: ",
									place(segment.from),
									" – ",
									place(segment.to)
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/advisories/$segmentId",
								params: { segmentId: segment.id },
								children: t("common.viewDetails")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/report",
								search: { segment: segment.id },
								children: t("common.reportRoad")
							})
						]
					}, segment.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Search manually to view matching road sections." })]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "traveller-map-toggle glass-strong",
					role: "group",
					"aria-label": "Map view",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": mode === "map",
						disabled: mapUnavailable,
						onClick: () => setMode("map"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map$1, { "aria-hidden": true }), " Map"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": mode === "list",
						onClick: () => setMode("list"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { "aria-hidden": true }), " List"]
					})]
				})]
			}),
			selected && selectedAdvisory ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "traveller-selected glass",
				"aria-live": "polite",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "sr-only",
						children: "Selected road section:"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
						place(selected.from),
						" – ",
						place(selected.to),
						" (",
						selected.code,
						")"
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBadge, { level: getTravellerResultAction(selectedAdvisory) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/advisories/$segmentId",
						params: { segmentId: selected.id },
						children: t("common.viewDetails")
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "traveller-selected-hint glass-pill",
				children: "Select a road section on the map or in the list."
			}),
			mode === "map" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeafletMapLegend, { className: "traveller-map-legend glass-strong" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "traveller-route-summary glass-strong",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "traveller-summary-icon",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { "aria-hidden": true })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: routeFrom && routeTo ? `${routeFrom} → ${routeTo}` : "Route summary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: summary })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "traveller-summary-approx",
						children: "approx."
					})
				]
			})
		]
	});
}
function TravellerFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "traveller-page-footer",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { "aria-hidden": true }), " Synthetic demo data, not current road conditions."] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrototypeRibbon, {}) })]
	});
}
function toMatch(segment, road, advisories) {
	const advisory = advisories.get(segment.id);
	if (!advisory) throw new Error(`Missing advisory for segment "${segment.id}"`);
	return {
		segment,
		advisory,
		road,
		hazard: advisory.evidence.some((report) => report.kind === "hazard") || !!advisory.restriction
	};
}
/**
* Filters the store's segments by free text. Matches segment ID (nh7-06),
* road code (NH-7, SH-MSR), corridor name, and place names in English or
* Hindi, plus district. "A to B" finds seeded routes between two places.
* Report descriptions, landmarks and restriction titles also match, but
* those results are not counted as road matches.
*/
function searchSegments(query, data) {
	const normalized = normalizeQuery(query);
	if (!normalized) return [];
	const endpoints = routePlaceIds(query, data.places);
	if (endpoints) return [...new Map(findSeededRoutes(...endpoints).flatMap((route) => route.segments).map((s) => [s.id, s])).values()].map((segment) => toMatch(segment, true, data.advisories));
	const words = normalized.split(" ").filter((word) => word && word !== "to");
	const matches = (haystack) => haystack.includes(normalized) || words.length > 0 && words.every((word) => haystack.includes(word));
	const placeText = (id) => {
		const p = data.places.find((candidate) => candidate.id === id);
		return p ? [
			p.id,
			p.name,
			p.nameHi,
			p.district
		] : [id];
	};
	return data.segments.flatMap((segment) => {
		const corridor = data.corridors.find((c) => c.id === segment.corridorId);
		const roadText = normalizeQuery([
			segment.id,
			segment.code,
			corridor?.code,
			corridor?.name,
			...placeText(segment.from),
			...placeText(segment.to)
		].filter(Boolean).join(" "));
		if (matches(roadText)) return [toMatch(segment, true, data.advisories)];
		const advisory = data.advisories.get(segment.id);
		const evidenceText = normalizeQuery([...advisory?.evidence.map((report) => `${report.description} ${report.landmark}`) ?? [], advisory?.restriction?.title].filter(Boolean).join(" "));
		return evidenceText && matches(`${roadText} ${evidenceText}`) ? [toMatch(segment, false, data.advisories)] : [];
	});
}
function routePlaceIds(query, places) {
	const parts = query.split(/\s+(?:to|→|–)\s+/i).map((part) => part.trim()).filter(Boolean);
	if (parts.length !== 2) return void 0;
	const start = findPlaceId(parts[0], places);
	const end = findPlaceId(parts[1], places);
	return start && end ? [start, end] : void 0;
}
function findPlaceId(value, places) {
	const needle = normalizeQuery(value);
	return places.find((place) => [
		place.id,
		place.name,
		place.nameHi
	].some((candidate) => normalizeQuery(candidate) === needle))?.id;
}
function normalizeQuery(value) {
	return value.toLocaleLowerCase().replace(/[.,]/g, " ").replace(/\s+/g, " ").trim();
}
export { ResultRow, TravellerPage as component, getTravellerResultAction, searchSegments };
