import { __toESM } from "../_runtime.mjs";
import { cn, getAdvisorySourceTimestamp, useAppStore, usePrefs } from "./preferences-BoWpYuS4.mjs";
import { require_react } from "../_libs/react.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { useNavigate } from "../_libs/@tanstack/react-router+[4...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { ArrowLeft, CircleQuestionMark, Info, Map, TriangleAlert } from "../_libs/lucide-react3.mjs";
import { ArrowUpRight, ImageOff, Shield } from "../_libs/lucide-react5.mjs";
import { Camera } from "../_libs/lucide-react7.mjs";
import { Clock3 } from "../_libs/lucide-react14.mjs";
import { FileText } from "../_libs/lucide-react18.mjs";
import { Link2 } from "../_libs/lucide-react22.mjs";
import { List } from "../_libs/lucide-react23.mjs";
import { MapPin } from "../_libs/lucide-react28.mjs";
import { Route } from "../_libs/lucide-react31.mjs";
import { UsersRound } from "../_libs/lucide-react32.mjs";
import { Button } from "./button-BwhNanlJ.mjs";
import { ActionBadge, FreshnessChip, Route$13, useSlidingHighlight } from "./router-ip9NLZv6.mjs";
import { AdvisoryCard } from "./advisory-card-BwZ-GS4_.mjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs-CXsxBRtY.mjs";
import { LeafletMapLegend, LeafletSegmentMap } from "./leaflet-segment-map-CSIxfagM.mjs";
import { SegmentDetail, StatusTimeline } from "./segment-detail-De74_zTW.mjs";
// node_modules/.nitro/vite/services/ssr/assets/advisories._segmentId-DTaY8_-S.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SegmentPage() {
	const data = Route$13.useLoaderData();
	if (data.kind === "report") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HazardDetail, {
		report: data.report,
		segment: data.segment
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SegmentOverview, { segment: data.segment });
}
function Banner({ segment, title, reportRef }) {
	const { place } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "photo-surface relative isolate overflow-hidden border-b border-border text-foreground",
		style: {
			backgroundImage: "linear-gradient(90deg, var(--photo-scrim-a), var(--photo-scrim-b) 60%, var(--photo-scrim-c)), url('/img/banner-strip.png')",
			backgroundPosition: "center",
			backgroundSize: "cover"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rp-container py-4 sm:py-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/advisories",
					className: "mb-2 inline-flex min-h-11 w-fit items-center gap-2 text-sm text-link hover:text-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring sm:mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
						"aria-hidden": true,
						className: "size-4"
					}), "Back to search"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-1 flex items-center gap-2 text-sm font-semibold text-link",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
							"aria-hidden": true,
							className: "size-4"
						}),
						"Mountain road",
						reportRef && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono tracking-normal",
							children: ["· ", reportRef]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "rp-page-title rp-wrap-anywhere max-w-4xl",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted-foreground sm:text-base",
					children: [
						place(segment.from),
						" → ",
						place(segment.to)
					]
				}),
				!reportRef && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouteSummary, { segment })
			]
		})
	});
}
function RouteSummary({ segment }) {
	const { duration } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
		className: "mt-4 grid grid-cols-1 gap-y-2 border-t border-border pt-3 text-xs sm:grid-cols-3 sm:text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryItem, {
				icon: Route,
				label: `${segment.distanceKm} km`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryItem, {
				icon: Clock3,
				label: `~ ${duration(segment.typicalMinutes)}`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryItem, {
				icon: MapPin,
				label: "Elevation unavailable"
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "basis-full text-xs text-muted-foreground",
		children: "All route estimates are illustrative."
	})] });
}
function SummaryItem({ icon: Icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 items-center gap-2 sm:border-r sm:border-border sm:px-3 sm:first:pl-0 sm:last:border-0 sm:last:pr-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				"aria-hidden": true,
				className: "size-4 shrink-0 text-link"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: "sr-only",
				children: "Illustrative route estimate"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
				label,
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: "(illustrative)"
				})
			] })
		]
	});
}
function SegmentOverview({ segment }) {
	const { place, stamp } = usePrefs();
	const { reports, advisories } = useAppStore();
	const [tab, setTab] = (0, import_react.useState)("overview");
	const advisory = advisories.get(segment.id);
	if (!advisory) throw new Error(`Missing advisory for segment "${segment.id}"`);
	const reports_for_segment = reports.filter((report) => report.segmentId === segment.id && report.status !== "duplicate" && report.status !== "rejected");
	const hazards = reports_for_segment.filter((report) => report.kind === "hazard");
	const sourceTimestamp = getAdvisorySourceTimestamp(advisory);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "advisory-detail-page pb-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banner, {
			segment,
			title: `${segment.code.split(" · ")[0]}: ${place(segment.from)} to ${place(segment.to)}`
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rp-container grid gap-5 py-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(19rem,0.8fr)] lg:py-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-w-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
					value: tab,
					onValueChange: setTab,
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto border-b border-border",
							tabIndex: 0,
							"aria-label": "Scrollable road information tabs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
								"aria-label": "Road information",
								variant: "line",
								className: "min-w-max gap-2 rounded-none p-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "overview",
										className: "min-w-28 rounded-none px-4 data-[state=active]:text-blue-on-dark",
										children: "Overview"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "hazards",
										className: "min-w-28 rounded-none px-4 data-[state=active]:text-blue-on-dark",
										children: "Hazards"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "conditions",
										className: "min-w-28 rounded-none px-4 data-[state=active]:text-blue-on-dark",
										children: "Conditions"
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "overview",
							className: "pt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SegmentDetail, {
										segmentId: segment.id,
										variant: "overview",
										className: "glass-strong sm:col-span-3"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InfoCard, {
										title: "Information freshness",
										icon: Clock3,
										className: "sm:col-span-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreshnessChip, { observationTimestamp: advisory.latestObservationAt }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
											className: "mt-3 space-y-2 text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
												label: "Last updated",
												value: sourceTimestamp ? stamp(sourceTimestamp) : "Unknown",
												icon: Link2
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
												label: "Source",
												value: "Community reports and official sources",
												icon: UsersRound
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
										title: "Available community reports",
										icon: UsersRound,
										className: "sm:col-span-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid gap-2 min-[430px]:grid-cols-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountLink, {
												count: hazards.length,
												label: "Hazards reported",
												icon: TriangleAlert,
												onClick: () => setTab("hazards")
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountLink, {
												count: reports_for_segment.length,
												label: "Total reports",
												icon: FileText,
												onClick: () => setTab("hazards")
											})]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfficialRestrictionCard, {
										segmentId: segment.id,
										className: "sm:col-span-2"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
										title: "Source information",
										icon: Link2,
										className: "sm:col-span-5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
											className: "grid gap-3 text-xs sm:grid-cols-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
													label: "Source",
													value: "Submitted by community contributors",
													icon: UsersRound
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
													label: "Last updated",
													value: sourceTimestamp ? stamp(sourceTimestamp) : "Unknown",
													icon: Clock3
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
													label: "Information note",
													value: "Community reports are not official restrictions.",
													icon: Info
												})
											]
										})
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									className: "bg-primary text-primary-foreground hover:bg-primary/90",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/map",
										search: { seg: segment.id },
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { "aria-hidden": true }),
											"View on map",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { "aria-hidden": true })
										]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									className: "bg-brand-orange text-report-foreground hover:bg-brand-orange/90",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/report",
										search: { segment: segment.id },
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { "aria-hidden": true }), "Report a hazard"]
									})
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "hazards",
							className: "space-y-3 pt-4",
							children: hazards.length ? hazards.map((report) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdvisoryCard, {
								segment,
								communityReport: report,
								variant: "community-report",
								className: "glass"
							}, report.ref)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
								title: "No community hazard reports",
								message: "This means no report is available here; it does not establish road conditions."
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "conditions",
							className: "space-y-3 pt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InfoCard, {
									title: "Information freshness",
									icon: Clock3,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreshnessChip, { observationTimestamp: advisory.latestObservationAt }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-sm text-muted-foreground",
										children: "Freshness reflects the age of the most recent available source timestamp, not a road-safety assessment."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfficialRestrictionCard, { segmentId: segment.id }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
									title: "Community information",
									icon: UsersRound,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm",
										children: "Submitted by community contributors. Community reports do not establish an official restriction."
									})
								})
							]
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TerrainPanel, {
				segment,
				reports: hazards
			})]
		})]
	});
}
function InfoCard({ title, icon: Icon, className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("glass rounded-xl border border-border p-3 sm:p-4", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "mb-3 flex items-center gap-2 text-sm font-semibold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				"aria-hidden": true,
				className: "size-5 shrink-0 text-blue-on-dark"
			}), title]
		}), children]
	});
}
function Fact({ label, value, icon: Icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-w-0 grid-cols-[auto_1fr] items-start gap-x-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				"aria-hidden": true,
				className: "row-span-2 mt-0.5 size-4 shrink-0 text-muted-foreground"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: "text-xs text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
				className: "rp-wrap-anywhere text-xs font-medium",
				children: value
			})
		]
	});
}
function CountLink({ count, label, icon: Icon, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "glass flex min-h-16 items-center gap-3 rounded-lg border border-border px-3 text-left hover:border-blue-on-dark/60 focus-visible:outline-2 focus-visible:outline-ring",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				"aria-hidden": true,
				className: "size-5 shrink-0 text-orange-on-dark"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-lg font-semibold tabular-nums",
				children: count
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, {
				"aria-hidden": true,
				className: "ml-auto size-4 text-muted-foreground"
			})
		]
	});
}
function OfficialRestrictionCard({ segmentId, className }) {
	const { advisories } = useAppStore();
	const advisory = advisories.get(segmentId);
	if (!advisory) throw new Error(`Missing advisory for segment "${segmentId}"`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("glass rounded-xl border border-border p-3 sm:p-4", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "mb-3 flex items-center gap-2 text-sm font-semibold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
				"aria-hidden": true,
				className: "size-5 text-status-official"
			}), "Official restrictions"]
		}), advisory.restriction ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-md border border-status-official/50 bg-status-official/10 p-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-semibold",
				children: advisory.restriction.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: advisory.restriction.issuingAuthority
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "flex items-center gap-2 rounded-md border border-status-unknown/40 bg-status-unknown/10 p-3 text-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, {
					"aria-hidden": true,
					className: "size-4 shrink-0 text-status-unknown"
				}),
				"No current official information",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-auto text-xs text-status-unknown",
					children: "UNKNOWN"
				})
			]
		})]
	});
}
function TerrainPanel({ segment, reports }) {
	const { t, place } = usePrefs();
	const { segments } = useAppStore();
	const navigate = useNavigate();
	const [view, setView] = (0, import_react.useState)("map");
	const toggleRef = useSlidingHighlight(view);
	const [mapUnavailable, setMapUnavailable] = (0, import_react.useState)(false);
	const corridorSegments = segments.filter((s) => s.corridorId === segment.corridorId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "min-w-0 lg:sticky lg:top-[calc(var(--shell-bar-height)+1rem)] lg:self-start",
		"aria-label": "Route map and community reports",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "advisory-terrain-map relative min-h-[360px] overflow-hidden rounded-xl border border-border bg-card sm:min-h-[440px] lg:min-h-[510px]",
			children: [view === "map" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeafletSegmentMap, {
				segments: corridorSegments,
				highlight: [segment.id],
				fitTo: [segment.id],
				selectedSegmentId: segment.id,
				onSelectSegment: (id) => {
					if (id !== segment.id) navigate({
						to: "/advisories/$segmentId",
						params: { segmentId: id }
					});
				},
				onUnavailable: () => {
					setMapUnavailable(true);
					setView("list");
				},
				label: `Interactive map of ${place(segment.from)} – ${place(segment.to)}`,
				showRibbon: false,
				className: "rp-lmap-fill"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass-strong relative z-10 h-full min-h-[360px] overflow-y-auto p-4 pt-14 sm:min-h-[440px] lg:min-h-[510px]",
				children: [
					mapUnavailable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						className: "mb-3 rounded-lg border border-status-caution/60 bg-status-caution/10 p-2 text-xs",
						children: "The map tiles could not be loaded. Showing the community reports list instead."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 font-semibold",
						children: "Community hazard reports"
					}),
					reports.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: reports.map((report) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/advisories/$segmentId",
							params: { segmentId: report.ref },
							className: "glass block rounded-lg border border-border p-3 hover:border-blue-on-dark/60 focus-visible:outline-2 focus-visible:outline-ring",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2 text-sm font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
									"aria-hidden": true,
									className: "size-4 text-orange-on-dark"
								}), t(`hazard.${report.hazardType}`)]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-1 block text-xs text-muted-foreground",
								children: [
									report.landmark,
									" · ",
									place(segment.from),
									"–",
									place(segment.to)
								]
							})]
						}) }, report.ref))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No community hazard reports are available."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: toggleRef,
				className: "rp-segmented glass-strong absolute top-3 left-3 z-(--z-map-controls) inline-flex rounded-lg border border-border p-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-pressed": view === "map",
					disabled: mapUnavailable,
					onClick: () => setView("map"),
					className: cn("inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 text-xs disabled:opacity-50", view === "map" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, {
						"aria-hidden": true,
						className: "size-3.5"
					}), " Map"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-pressed": view === "list",
					onClick: () => setView("list"),
					className: cn("inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 text-xs", view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
						"aria-hidden": true,
						className: "size-3.5"
					}), " List"]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeafletMapLegend, { className: "mt-3 glass-strong" })]
	});
}
function HazardDetail({ report, segment }) {
	const { t, place, stamp, ago } = usePrefs();
	const level = report.severity === "high" ? "avoid" : "caution";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "advisory-detail-page pb-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banner, {
			segment,
			title: `${t(`hazard.${report.hazardType}`)} report`,
			reportRef: report.ref
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rp-container grid gap-5 py-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:py-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "glass-accent rounded-xl border border-border p-4 sm:p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold text-muted-foreground",
										children: "Community report, not an official closure"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-1",
										children: t(`hazard.${report.hazardType}`)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-muted-foreground",
										children: report.description
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBadge, {
									level,
									size: "lg"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportGallery, { report }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mb-2 mt-4 text-sm font-semibold",
								children: "Report facts"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "grid gap-x-5 gap-y-3 text-sm sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
										label: "Hazard type",
										value: t(`hazard.${report.hazardType}`),
										icon: TriangleAlert
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
										label: "Road segment",
										value: `${segment.code} · ${place(segment.from)} to ${place(segment.to)}`,
										icon: Route
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
										label: t("segment.observationTime"),
										value: `${ago(report.observedAt)} · ${stamp(report.observedAt)}`,
										icon: Clock3
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
										label: "Report submission time",
										value: `${ago(report.receivedAt)} · ${stamp(report.receivedAt)}`,
										icon: FileText
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
										label: "Source",
										value: "Submitted by community contributors",
										icon: UsersRound
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
										label: "Location accuracy",
										value: `${report.locationConfidence} confidence`,
										icon: MapPin
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "sm:col-span-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "mb-1 text-xs text-muted-foreground",
											children: "Information freshness"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreshnessChip, { observationTimestamp: report.observedAt }) })]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusTimeline, {
						report,
						level
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "bg-primary text-primary-foreground hover:bg-primary/90",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/map",
								search: { seg: segment.id },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { "aria-hidden": true }), " View on map"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "bg-brand-orange text-report-foreground hover:bg-brand-orange/90",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/report",
								search: { segment: segment.id },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { "aria-hidden": true }), " Report an update"]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "border-t border-border pt-3 text-xs text-muted-foreground",
						children: "This is a community-reported hazard and has not been independently confirmed."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 lg:sticky lg:top-[calc(var(--shell-bar-height)+1rem)] lg:self-start",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfficialRestrictionCard, { segmentId: segment.id }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "glass rounded-xl border border-border p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "mb-3 flex items-center gap-2 text-sm font-semibold",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
										"aria-hidden": true,
										className: "size-5 text-blue-on-dark"
									}),
									" ",
									"Location"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: report.landmark
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: [
									place(segment.from),
									" to ",
									place(segment.to)
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: [
									"Location accuracy: ",
									report.locationConfidence,
									" confidence"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportLocationMap, { segment })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "rounded-lg border border-status-unknown/40 bg-status-unknown/10 p-3 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
							"aria-hidden": true,
							className: "mr-1 inline size-4 align-text-bottom"
						}), "The community report and any official restriction are shown as separate information."]
					})
				]
			})]
		})]
	});
}
function ReportGallery({ report }) {
	const imageCount = Math.min(report.photoCount, 4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		"aria-label": "Community report image gallery",
		className: "mt-4",
		children: imageCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
			children: Array.from({ length: imageCount }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "glass grid min-h-24 place-items-center rounded-lg border border-dashed border-border p-3 text-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageOff, {
					"aria-hidden": true,
					className: "mx-auto size-5 text-muted-foreground"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: "Community image unavailable in demo"
				})] })
			}, index))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {
				"aria-hidden": true,
				className: "mr-1 inline size-4 align-text-bottom"
			}), "No images were submitted with this report."]
		})
	});
}
function EmptyPanel({ title, message }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-dashed border-border p-5 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, {
				"aria-hidden": true,
				className: "mx-auto size-6 text-status-unknown"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: message
			})
		]
	});
}
/** Report location: exact report coordinates are not shared, so the whole road section is shown. */
function ReportLocationMap({ segment }) {
	const { place } = usePrefs();
	const [unavailable, setUnavailable] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative h-56 overflow-hidden rounded-lg border border-border",
			children: unavailable ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "status",
				className: "grid h-full place-items-center p-4 text-center text-xs text-muted-foreground",
				children: [
					"The map tiles could not be loaded. The report is on ",
					segment.code,
					",",
					" ",
					place(segment.from),
					" to ",
					place(segment.to),
					"."
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeafletSegmentMap, {
				segments: [segment],
				highlight: [segment.id],
				fitTo: [segment.id],
				selectedSegmentId: segment.id,
				onUnavailable: () => setUnavailable(true),
				label: `Map of the reported road section, ${place(segment.from)} – ${place(segment.to)}`,
				className: "rp-lmap-fill",
				showRibbon: false
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-muted-foreground",
			children: "Exact report coordinates are not shared. The highlighted line is the whole road section (approximate, synthetic data)."
		})]
	});
}
export { Banner, SegmentPage as component };
