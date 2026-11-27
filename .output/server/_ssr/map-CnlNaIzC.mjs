import { __toESM } from "../_runtime.mjs";
import { cn, useAppStore, usePrefs } from "./preferences-BoWpYuS4.mjs";
import { require_react } from "../_libs/react.mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { Map, Search, X } from "../_libs/lucide-react3.mjs";
import { Check } from "../_libs/lucide-react9.mjs";
import { List } from "../_libs/lucide-react23.mjs";
import { Route$20, ScreenEmpty, ScreenError, ScreenLoading, useSlidingHighlight } from "./router-ip9NLZv6.mjs";
import { AdvisoryCard } from "./advisory-card-BwZ-GS4_.mjs";
import { LeafletMapLegend, LeafletSegmentMap } from "./leaflet-segment-map-CSIxfagM.mjs";
import { SegmentDetail } from "./segment-detail-De74_zTW.mjs";
import { useScreenState } from "./use-screen-state-VkDxgmsG.mjs";
// node_modules/.nitro/vite/services/ssr/assets/map-CnlNaIzC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MapPage() {
	const { t, place } = usePrefs();
	const { segments: SEGMENTS, corridors, advisories } = useAppStore();
	const { status, retry } = useScreenState(() => SEGMENTS.every((segment) => advisories.has(segment.id)));
	const corridorById = (id) => corridors.find((corridor) => corridor.id === id);
	const segmentById = (id) => SEGMENTS.find((segment) => segment.id === id);
	const search = Route$20.useSearch();
	const initialSegment = search.seg && segmentById(search.seg) ? search.seg : "nh7-06";
	const [selectedSegmentId, setSelectedSegmentId] = (0, import_react.useState)(initialSegment);
	const [view, setView] = (0, import_react.useState)(search.view ?? "map");
	const [query, setQuery] = (0, import_react.useState)("");
	const [mapFailed, setMapFailed] = (0, import_react.useState)(false);
	const navigate = Route$20.useNavigate();
	const toggleRef = useSlidingHighlight(view);
	const selectSegment = (id) => {
		setSelectedSegmentId(id);
		navigate({
			search: (previous) => ({
				...previous,
				seg: id
			}),
			replace: true,
			resetScroll: false
		});
	};
	const onMapUnavailable = () => {
		setMapFailed(true);
		setView("list");
	};
	const filteredSegments = (0, import_react.useMemo)(() => {
		const term = query.trim().toLocaleLowerCase();
		if (!term) return SEGMENTS;
		return SEGMENTS.filter((segment) => {
			const corridor = corridors.find((item) => item.id === segment.corridorId);
			return [
				segment.code,
				corridor?.name,
				place(segment.from),
				place(segment.to)
			].some((value) => value?.toLocaleLowerCase().includes(term));
		});
	}, [
		place,
		query,
		SEGMENTS,
		corridors
	]);
	const selectedSegment = selectedSegmentId ? segmentById(selectedSegmentId) : void 0;
	const highlightedSegments = selectedSegment ? SEGMENTS.filter((segment) => segment.corridorId === selectedSegment.corridorId).map((segment) => segment.id) : void 0;
	const changeView = (nextView) => {
		if (nextView === "map" && mapFailed) return;
		setView(nextView);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rp-map-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rp-map-toolbar glass",
			role: "search",
			"aria-label": "Search road segments",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "rp-map-search glass",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
						"aria-hidden": true,
						className: "size-4 shrink-0"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "sr-only",
						children: "Search by road, place, or location"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "search",
						value: query,
						onChange: (event) => {
							const nextQuery = event.target.value;
							setQuery(nextQuery);
							const normalized = nextQuery.trim().toLocaleLowerCase();
							if (!normalized) return;
							const matching = SEGMENTS.find((segment) => {
								const corridor = corridorById(segment.corridorId);
								return [
									segment.code,
									corridor?.name,
									place(segment.from),
									place(segment.to)
								].some((value) => value?.toLocaleLowerCase().includes(normalized));
							});
							if (matching) selectSegment(matching.id);
						},
						placeholder: "Search by road, place, or location..."
					}),
					query && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "rp-map-clear",
						onClick: () => setQuery(""),
						"aria-label": "Clear search",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
							"aria-hidden": true,
							className: "size-4"
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: toggleRef,
				className: "rp-map-toggle glass-pill rp-segmented",
				role: "group",
				"aria-label": "Map or list view",
				children: ["map", "list"].map((nextView) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-pressed": view === nextView,
					disabled: nextView === "map" && mapFailed,
					onClick: () => changeView(nextView),
					children: [nextView === "map" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { "aria-hidden": true }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { "aria-hidden": true }), nextView === "map" ? "Map" : "List"]
				}, nextView))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rp-map-layout",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rp-map-main",
				children: [
					view === "map" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "sr-only",
						children: "Live road map"
					}),
					mapFailed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rp-map-fallback-notice glass-strong",
						role: "status",
						children: "The map tiles could not be loaded. Showing the road list instead."
					}),
					status === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rp-map-state",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenLoading, {})
					}) : status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rp-map-state",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenError, { onRetry: retry })
					}) : !SEGMENTS.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rp-map-state",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenEmpty, {
							title: t("map.emptyTitle"),
							message: t("map.emptyBody")
						})
					}) : view === "map" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rp-map-canvas",
						"aria-label": "Live road map",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeafletSegmentMap, {
								segments: SEGMENTS,
								highlight: highlightedSegments,
								fitTo: SEGMENTS.map((segment) => segment.id),
								selectedSegmentId,
								onSelectSegment: selectSegment,
								onUnavailable: onMapUnavailable,
								label: "Interactive map of road segments",
								className: "rp-map-leaflet"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeafletMapLegend, { className: "rp-map-legend glass-strong" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SegmentDetail, {
								segmentId: selectedSegmentId,
								variant: "map",
								className: "rp-map-detail glass-strong",
								onClose: () => selectSegment(void 0)
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rp-map-list-view",
						"aria-label": "Road segment list",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rp-map-list",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rp-map-list-heading",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "rp-map-kicker",
									children: "Road conditions"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "rp-page-title",
									children: "Road segments"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [filteredSegments.length, " segments"] })]
							}), filteredSegments.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rp-map-list-cards",
								children: filteredSegments.map((segment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: cn("rp-map-list-card glass", segment.id === selectedSegmentId && "is-selected"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "rp-map-list-select glass",
										"aria-pressed": segment.id === selectedSegmentId,
										onClick: () => selectSegment(segment.id),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: segment.id === selectedSegmentId ? "Selected segment" : "Select segment" }), segment.id === selectedSegmentId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
											"aria-hidden": true,
											className: "size-4"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdvisoryCard, { segment })]
								}, segment.id))
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "rp-map-no-results",
								children: [
									"No road segments match “",
									query,
									"”."
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SegmentDetail, {
							segmentId: selectedSegmentId,
							variant: "map",
							className: "rp-map-list-detail glass-strong",
							onClose: () => selectSegment(void 0)
						})]
					})
				]
			})
		})]
	});
}
export { MapPage as component };
