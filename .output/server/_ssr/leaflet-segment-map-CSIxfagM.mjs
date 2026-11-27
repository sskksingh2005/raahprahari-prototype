import { __toESM } from "../_runtime.mjs";
import { SEGMENT_GEOMETRY_NOTE, cn, getAdvisorySourceTimestamp, getFreshnessState, useAppStore, usePrefs } from "./preferences-BoWpYuS4.mjs";
import { require_react } from "../_libs/react.mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { Plus } from "../_libs/lucide-react3.mjs";
import { Crosshair, Minus } from "../_libs/lucide-react17.mjs";
import { LocateFixed } from "../_libs/lucide-react25.mjs";
import { PrototypeRibbon } from "./router-ip9NLZv6.mjs";
import { getCurrentPosition, inCoverage } from "./geo-Bmmso9Kl.mjs";
// node_modules/.nitro/vite/services/ssr/assets/leaflet-segment-map-CSIxfagM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MARKER_LABEL = {
	hazard: "Reported hazard",
	restriction: "Official restriction",
	unknown: "Unknown information"
};
/** SVG content (24×24 viewBox) shared by map markers and the legend. */
var MARKER_GLYPH = {
	hazard: "<path d=\"M12 3 2 20.5h20L12 3z\" fill=\"currentColor\"/><path d=\"M12 9.5v5\" stroke=\"var(--report-foreground)\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><circle cx=\"12\" cy=\"17.6\" r=\"1.2\" fill=\"var(--report-foreground)\"/>",
	restriction: "<path d=\"M12 2.5 4.5 5.4v5.8c0 4.8 3.2 8.6 7.5 10.3 4.3-1.7 7.5-5.5 7.5-10.3V5.4L12 2.5z\" fill=\"currentColor\"/><path d=\"m8.6 12 2.4 2.4 4.6-4.8\" fill=\"none\" stroke=\"var(--primary-foreground)\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>",
	unknown: "<circle cx=\"12\" cy=\"12\" r=\"9.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\"/><path d=\"M9.3 9.4a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.3-2.7 4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><circle cx=\"12\" cy=\"17.4\" r=\"1.25\" fill=\"currentColor\"/>"
};
function segmentMapStyle(advisory, now) {
	if (!advisory) return {
		level: "unknown",
		dashed: true,
		markers: ["unknown"],
		alwaysVisible: false
	};
	const restriction = advisory.restriction;
	const fresh = getFreshnessState(getAdvisorySourceTimestamp(advisory), now) === "fresh";
	let level;
	if (restriction) level = advisory.level === "clear" ? "unknown" : advisory.level;
	else if (advisory.stale || !fresh || advisory.level === "clear") level = "unknown";
	else level = advisory.level;
	const markers = [];
	if (restriction) markers.push("restriction");
	if (fresh && !advisory.stale && advisory.evidence.some((report) => report.kind === "hazard")) markers.push("hazard");
	if (level === "unknown" && !restriction) markers.push("unknown");
	if (!markers.length) markers.push("unknown");
	return {
		level,
		dashed: level === "unknown",
		markers,
		alwaysVisible: restriction?.type === "road_closed"
	};
}
var OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
var OSM_ATTRIBUTION = "© <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors";
var UTTARAKHAND_CENTER = [30.07, 79.2];
/** Separated so tests and callers share one loader. */
var loadLeaflet = () => import("../_libs/leaflet.mjs").then((n) => /* @__PURE__ */ __toESM(n.require_leaflet_src())).then((mod) => mod.default ?? mod);
var markerHtml = (kind, extra) => `<span class="rp-lmap-marker kind-${kind} ${extra}"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${MARKER_GLYPH[kind]}</svg></span>`;
function LeafletSegmentMap({ segments, highlight, selectedSegmentId, onSelectSegment, fitTo, onUnavailable, label, className, showRibbon = true }) {
	const { t, place } = usePrefs();
	const { segments: allSegments, advisories, now } = useAppStore();
	const helpId = (0, import_react.useId)();
	const containerRef = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [zoomStatus, setZoomStatus] = (0, import_react.useState)("");
	const [locateStatus, setLocateStatus] = (0, import_react.useState)("");
	const [locating, setLocating] = (0, import_react.useState)(false);
	const onSelectRef = (0, import_react.useRef)(onSelectSegment);
	const onUnavailableRef = (0, import_react.useRef)(onUnavailable);
	(0, import_react.useEffect)(() => {
		onSelectRef.current = onSelectSegment;
		onUnavailableRef.current = onUnavailable;
	});
	const closures = allSegments.filter((s) => advisories.get(s.id)?.restriction?.type === "road_closed");
	const drawn = [...new Map([...segments, ...closures].map((s) => [s.id, s])).values()];
	const drawnKey = drawn.map((s) => s.id).join(",");
	const highlightKey = highlight?.join(",") ?? "";
	const fitIds = fitTo ?? (highlight?.length ? highlight : drawn.map((s) => s.id));
	const fitKey = fitIds.join(",");
	const segmentName = (0, import_react.useCallback)((s) => `${s.code}, ${place(s.from)} – ${place(s.to)}`, [place]);
	const frame = (0, import_react.useCallback)((ids) => {
		const current = mapRef.current;
		if (!current) return;
		const points = allSegments.filter((s) => ids.includes(s.id)).flatMap((s) => s.path);
		const size = current.map.getSize();
		if (!points.length || !size.x || !size.y) {
			current.map.setView(points.length ? current.L.latLngBounds(points).getCenter() : UTTARAKHAND_CENTER, 8);
			return;
		}
		current.map.fitBounds(current.L.latLngBounds(points), {
			padding: [28, 28],
			maxZoom: 11
		});
	}, [allSegments]);
	(0, import_react.useEffect)(() => {
		const container = containerRef.current;
		if (!container) return;
		if (typeof navigator !== "undefined" && navigator.onLine === false) {
			onUnavailableRef.current?.("offline");
			return;
		}
		let cancelled = false;
		let cleanup = () => {};
		loadLeaflet().then((L) => {
			if (cancelled || !containerRef.current) return;
			const map = L.map(container, {
				zoomControl: false,
				attributionControl: false,
				keyboard: true,
				minZoom: 6,
				maxZoom: 16,
				maxBounds: L.latLngBounds([27.8, 76.8], [32.2, 81.8])
			});
			L.control.attribution({
				prefix: "<a href=\"https://leafletjs.com\">Leaflet</a>",
				position: "bottomleft"
			}).addAttribution(OSM_ATTRIBUTION).addTo(map);
			L.control.scale({
				imperial: false,
				position: "bottomright"
			}).addTo(map);
			let loaded = 0;
			let errors = 0;
			let reported = false;
			L.tileLayer(OSM_TILE_URL, {
				maxZoom: 19,
				crossOrigin: true
			}).on("tileload", () => {
				loaded++;
			}).on("tileerror", () => {
				errors++;
				if (!reported && loaded === 0 && errors >= 4) {
					reported = true;
					onUnavailableRef.current?.("tiles");
				}
			}).addTo(map);
			const layers = L.layerGroup().addTo(map);
			mapRef.current = {
				L,
				map,
				layers
			};
			const announceZoom = () => setZoomStatus(`Zoom level ${map.getZoom()}`);
			map.on("zoomend", announceZoom);
			const onOffline = () => onUnavailableRef.current?.("offline");
			window.addEventListener("offline", onOffline);
			let observer;
			if (typeof ResizeObserver !== "undefined") {
				observer = new ResizeObserver(() => map.invalidateSize());
				observer.observe(container);
			}
			cleanup = () => {
				window.removeEventListener("offline", onOffline);
				observer?.disconnect();
				map.remove();
				mapRef.current = null;
			};
			setReady(true);
		}).catch((error) => {
			console.error("Could not load the map library", error);
			if (!cancelled) onUnavailableRef.current?.("library");
		});
		return () => {
			cancelled = true;
			cleanup();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (ready) frame(fitIds);
	}, [
		ready,
		fitKey,
		frame
	]);
	(0, import_react.useEffect)(() => {
		const current = mapRef.current;
		if (!ready || !current) return;
		const { L, layers } = current;
		layers.clearLayers();
		const highlightSet = new Set(highlight ?? []);
		const ordered = [...drawn].sort((a, b) => {
			const rank = (s) => (s.id === selectedSegmentId ? 2 : 0) + (segmentMapStyle(advisories.get(s.id), now).alwaysVisible ? 1 : 0);
			return rank(a) - rank(b);
		});
		for (const segment of ordered) {
			const style = segmentMapStyle(advisories.get(segment.id), now);
			const selected = segment.id === selectedSegmentId;
			const dim = highlightSet.size > 0 && !highlightSet.has(segment.id) && !style.alwaysVisible && !selected;
			const name = segmentName(segment);
			const levelText = t(`level.${style.level}`);
			const select = () => onSelectRef.current?.(segment.id);
			L.polyline(segment.path, {
				className: cn("rp-lmap-line", `level-${style.level}`, style.dashed && "is-dashed", style.alwaysVisible && "is-closure", dim && "is-dim", selected && "is-selected rp-fade-pulse-once"),
				weight: selected ? 9 : highlightSet.has(segment.id) ? 7 : 5,
				dashArray: style.dashed ? "6 10" : void 0,
				lineCap: "round",
				interactive: !!onSelectRef.current,
				bubblingMouseEvents: false
			}).bindTooltip(`${name}: ${levelText}`, { sticky: true }).on("click", select).addTo(layers);
			const mid = segment.path[Math.floor(segment.path.length / 2)];
			style.markers.forEach((kind, index) => {
				const offset = index * 30 - (style.markers.length - 1) * 30 / 2;
				const markerName = `${MARKER_LABEL[kind]}: ${name}. ${levelText}${style.alwaysVisible && kind === "restriction" ? ". Official closure" : ""}`;
				const marker = L.marker(mid, {
					icon: L.divIcon({
						className: "rp-lmap-marker-wrap",
						html: markerHtml(kind, cn(selected && "is-selected rp-pulse-once", dim && "is-dim", style.alwaysVisible && "is-closure")),
						iconSize: [28, 28],
						iconAnchor: [14 - offset, 14]
					}),
					title: markerName,
					alt: markerName,
					keyboard: true,
					riseOnHover: true,
					zIndexOffset: (style.alwaysVisible ? 1e3 : 0) + (selected ? 2e3 : 0)
				});
				marker.on("click", select);
				marker.on("add", () => {
					const el = marker.getElement();
					if (!el) return;
					el.setAttribute("role", "button");
					el.setAttribute("aria-label", markerName);
					el.setAttribute("aria-pressed", String(selected));
					el.dataset.segmentId = segment.id;
					el.dataset.markerKind = kind;
					el.addEventListener("keydown", (event) => {
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							select();
						}
					});
				});
				marker.addTo(layers);
			});
		}
	}, [
		ready,
		drawnKey,
		highlightKey,
		selectedSegmentId,
		advisories,
		now,
		segmentName,
		t
	]);
	const lastSelected = (0, import_react.useRef)(void 0);
	(0, import_react.useEffect)(() => {
		const current = mapRef.current;
		if (!ready || !current || !selectedSegmentId || selectedSegmentId === lastSelected.current) return;
		lastSelected.current = selectedSegmentId;
		const segment = allSegments.find((s) => s.id === selectedSegmentId);
		if (!segment) return;
		const bounds = current.L.latLngBounds(segment.path);
		if (!current.map.getBounds().contains(bounds)) {
			const size = current.map.getSize();
			if (size.x && size.y) current.map.fitBounds(bounds, {
				padding: [40, 40],
				maxZoom: 11
			});
			else current.map.setView(bounds.getCenter(), current.map.getZoom());
		}
	}, [
		ready,
		selectedSegmentId,
		allSegments
	]);
	const zoomBy = (delta) => {
		const map = mapRef.current?.map;
		if (!map) return;
		if (delta > 0) map.zoomIn();
		else map.zoomOut();
		setZoomStatus(`Zoom level ${map.getZoom()}`);
	};
	const locate = async () => {
		const current = mapRef.current;
		if (!current) return;
		setLocating(true);
		setLocateStatus("Asking your browser for your location…");
		const result = await getCurrentPosition();
		setLocating(false);
		if (!result.ok) {
			setLocateStatus(result.reason === "denied" ? "Location permission denied. The map is unchanged." : "Location is unavailable. The map is unchanged.");
			return;
		}
		if (!inCoverage(result.lat, result.lon)) {
			setLocateStatus("Your location is outside the coverage area. The map is unchanged.");
			return;
		}
		current.you?.remove();
		current.you = current.L.circleMarker([result.lat, result.lon], {
			radius: 8,
			className: "rp-lmap-you",
			interactive: false
		}).addTo(current.map);
		current.map.setView([result.lat, result.lon], Math.max(current.map.getZoom(), 11));
		setLocateStatus(`Showing your approximate location (accurate to about ${Math.round(result.accuracyM)} m).`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rp-lmap", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: containerRef,
				className: "rp-lmap-canvas",
				role: "region",
				"aria-label": label,
				"aria-describedby": helpId,
				"data-testid": "leaflet-map"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				id: helpId,
				className: "sr-only",
				children: "Focus the map and use the arrow keys to pan and the plus and minus keys to zoom. Press Tab to move between markers and Enter to select a road section."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rp-lmap-tools",
				role: "group",
				"aria-label": "Map controls",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "glass-strong",
						onClick: () => zoomBy(1),
						"aria-label": "Zoom in",
						disabled: !ready,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { "aria-hidden": true })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "glass-strong",
						onClick: () => zoomBy(-1),
						"aria-label": "Zoom out",
						disabled: !ready,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { "aria-hidden": true })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "glass-strong",
						onClick: () => frame(fitIds),
						"aria-label": "Reset map view",
						disabled: !ready,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, { "aria-hidden": true })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "glass-strong",
						onClick: () => void locate(),
						"aria-label": locating ? "Locating…" : "Show my location",
						disabled: !ready || locating,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, { "aria-hidden": true })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sr-only",
				"aria-live": "polite",
				children: zoomStatus
			}),
			locateStatus && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rp-lmap-status glass-strong",
				role: "status",
				children: locateStatus
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rp-lmap-labels",
				children: [showRibbon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrototypeRibbon, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rp-lmap-note glass-strong",
					children: SEGMENT_GEOMETRY_NOTE
				})]
			})
		]
	});
}
/** Icon and text legend for the interactive map. */
function LeafletMapLegend({ className }) {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("rp-lmap-legend", className),
		"aria-label": "Map legend",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Map legend" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [[
			"hazard",
			"restriction",
			"unknown"
		].map((kind) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `rp-lmap-marker kind-${kind} is-legend`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 24 24",
				"aria-hidden": "true",
				dangerouslySetInnerHTML: { __html: MARKER_GLYPH[kind] }
			})
		}), MARKER_LABEL[kind]] }, kind)), [
			"caution",
			"avoid",
			"do_not_travel",
			"unknown"
		].map((level) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 28 8",
				"aria-hidden": "true",
				className: `rp-lmap-legend-line level-${level}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "3",
					y1: "4",
					x2: "25",
					y2: "4",
					strokeDasharray: level === "unknown" ? "3 4" : void 0
				})
			}),
			t(`level.${level}`),
			level === "unknown" ? " (dashed)" : ""
		] }, level))] })]
	});
}
export { LeafletMapLegend, LeafletSegmentMap, OSM_ATTRIBUTION, OSM_TILE_URL, loadLeaflet };
