import { cn, getFreshnessState, useAppStore, usePrefs } from "./preferences-BoWpYuS4.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { ArrowRight, CircleQuestionMark, ShieldCheck, TriangleAlert, X } from "../_libs/lucide-react3.mjs";
import { Camera } from "../_libs/lucide-react7.mjs";
import { Clock3 } from "../_libs/lucide-react14.mjs";
import { Copy } from "../_libs/lucide-react16.mjs";
import { GitCompare } from "../_libs/lucide-react19.mjs";
import { MapPin } from "../_libs/lucide-react28.mjs";
import { Mountain } from "../_libs/lucide-react29.mjs";
import { Route } from "../_libs/lucide-react31.mjs";
import { Button } from "./button-BwhNanlJ.mjs";
import { ActionBadge, AdvisoryBadge, CacheTimeLabel, FreshnessChip, OfficialBadge, RoadCode } from "./router-ip9NLZv6.mjs";
// node_modules/.nitro/vite/services/ssr/assets/segment-detail-De74_zTW.js
var import_jsx_runtime = require_jsx_runtime();
function Block({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-t border-border py-3.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
			className: "mb-1.5 text-xs font-semibold text-muted-foreground",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-1.5 text-sm",
			children
		})]
	});
}
function ReportCard({ report }) {
	const { t, ago, stamp } = usePrefs();
	const isHazard = report.kind === "hazard";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "glass rounded-xl p-3.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2 font-semibold",
					children: [isHazard ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
						"aria-hidden": true,
						className: "size-4 text-status-caution"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
						"aria-hidden": true,
						className: "size-4 text-muted-foreground"
					}), isHazard ? `${t(`hazard.${report.hazardType}`)} · ${t(`sev.${report.severity}`)}` : t("kind.clear")]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoadCode, { children: report.ref })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 text-sm text-muted-foreground",
				children: report.description
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: t("segment.observedAgo")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						title: stamp(report.observedAt),
						children: ago(report.observedAt)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: t("segment.status")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: t(`status.${report.status}`) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: t("segment.source")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: t("source.community") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: t("segment.locConf")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: t(`conf.${report.locationConfidence}`) })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2.5 flex flex-wrap gap-1.5 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full border border-border px-2 py-0.5",
						children: t("copy.notOfficial")
					}),
					report.landmark && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-accent px-2 py-0.5",
						children: report.landmark
					}),
					report.photoCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {
								"aria-hidden": true,
								className: "size-3"
							}),
							" ",
							report.photoCount,
							" ",
							t("segment.photos")
						]
					}),
					report.conflictsWith && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1 rounded-full border border-status-caution/70 px-2 py-0.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitCompare, {
								"aria-hidden": true,
								className: "size-3"
							}),
							" ",
							t("segment.conflict"),
							" ",
							report.conflictsWith
						]
					}),
					report.duplicateOf && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
								"aria-hidden": true,
								className: "size-3"
							}),
							" ",
							t("segment.duplicate"),
							" ",
							report.duplicateOf
						]
					})
				]
			})
		]
	});
}
function SegmentDetail({ segmentId, segment, onClose, className, variant = "default" }) {
	const { t, ago, stamp, place } = usePrefs();
	const { segments, corridors, advisories, advisoryCacheTimestamp } = useAppStore();
	const seg = segment ?? (segmentId ? segments.find((s) => s.id === segmentId) : void 0);
	const adv = seg ? advisories.get(seg.id) : void 0;
	if (!seg || !adv) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
			"aria-hidden": true,
			className: "mb-2 size-6 text-muted-foreground"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: t("segment.select")
		})]
	});
	const corridor = corridors.find((c) => c.id === seg.corridorId);
	const latestHazard = adv.evidence.filter((r) => r.kind === "hazard")[0];
	const unverified = adv.evidence.some((r) => r.kind === "hazard" && r.status !== "verified");
	const sources = new Set(adv.evidence.map((r) => r.source));
	const r = adv.restriction;
	const cacheTimestamp = advisoryCacheTimestamp;
	if (variant === "map") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapSegmentDetail, {
		segment: seg,
		advisory: adv,
		corridorName: corridor?.name,
		onClose,
		className
	});
	if (variant === "overview") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverviewSegmentDetail, {
		segment: seg,
		className
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "seg-title",
		className: cn("glass-strong rounded-2xl p-5", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RoadCode, { children: [
							seg.code,
							" · km ",
							seg.kmStart,
							"–",
							seg.kmEnd
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							id: "seg-title",
							className: "rp-wrap-anywhere mt-1 font-display text-xl font-semibold",
							children: [
								place(seg.from),
								" – ",
								place(seg.to)
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: corridor?.name
						})
					]
				}), onClose && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-lg",
					className: "-mt-1 -mr-2 rounded-md",
					onClick: onClose,
					"aria-label": t("segment.close"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdvisoryBadge, {
						level: adv.level,
						size: "lg"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreshnessChip, { observationTimestamp: adv.latestObservationAt }),
					r && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfficialBadge, { label: t(`restriction.${r.type}`) }),
					adv.awaitingClearance && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full border border-dashed border-status-official px-2.5 py-0.5 text-xs font-medium",
						children: t("copy.awaitingClearance")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs font-medium text-muted-foreground",
				children: t("copy.estimate")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
						title: t("segment.observed"),
						children: latestHazard ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							t(`hazard.${latestHazard.hazardType}`),
							" ·",
							" ",
							t(`sev.${latestHazard.severity}`),
							": ",
							latestHazard.description
						] }) : adv.basis === "community_clear" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("basis.community_clear") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("copy.noRecent") })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
						title: t("segment.action"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: t(`action.${adv.level}`)
						}), (adv.level === "unknown" || adv.level === "clear") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground",
							children: t("copy.noReportNotSafe")
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
						title: t("segment.official"),
						children: r ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-status-official/50 bg-status-official/10 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-2 font-semibold",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
											"aria-hidden": true,
											className: "size-4 text-status-official"
										}),
										t(`restriction.${r.type}`),
										": ",
										r.title
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-muted-foreground",
											children: t("segment.issuedBy")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: r.issuingAuthority }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-muted-foreground",
											children: t("segment.published")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: stamp(r.publishedAt) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-muted-foreground",
											children: t("segment.effective")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: stamp(r.effectiveFrom) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-muted-foreground",
											children: t("segment.reviewBy")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: stamp(r.reviewBy) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-muted-foreground",
											children: t("segment.status")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "font-semibold",
											children: t("segment.inForce")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-muted-foreground",
											children: t("segment.ref")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "font-mono",
											children: r.supportingReference
										})
									]
								}),
								adv.restrictionPastReview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs font-medium",
									children: t("copy.pastReview")
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("copy.noOfficial") })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
						title: t("segment.source"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								t("segment.source"),
								":",
								" ",
								r ? t("source.official") : adv.evidence.length > 0 ? t("source.community") : t("source.unknown")
							] }),
							adv.latestObservationAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								t("results.latest"),
								":",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: ago(adv.latestObservationAt)
								}),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: [
										"(",
										stamp(adv.latestObservationAt),
										")"
									]
								})
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("copy.noRecent") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheTimeLabel, { timestamp: cacheTimestamp }),
							sources.size > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-muted-foreground",
								children: [
									[...sources].map((s) => t(`source.${s}`)).join(" · "),
									".",
									" ",
									adv.evidence.length,
									" ",
									t("segment.reportsCount")
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
						title: t("segment.uncertainty"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t(`basis.${adv.basis}`) }),
							adv.evidence.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-muted-foreground",
								children: [
									adv.reviewedCount,
									" ",
									t("segment.reviewed"),
									" /",
									" ",
									adv.evidence.length
								]
							}),
							unverified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted-foreground",
								children: t("copy.communityUnverified")
							})
						]
					})
				]
			}),
			adv.evidence.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-border pt-3.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-2 flex flex-wrap items-center justify-between gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "text-xs font-semibold text-muted-foreground",
						children: t("segment.reports")
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: adv.evidence.slice(0, 3).map((rep) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportCard, { report: rep }, rep.ref))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "outline",
				className: "mt-4 h-11 w-full rounded-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/report",
					search: { segment: seg.id },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {}), t("results.reportHere")]
				})
			})
		]
	});
}
function OverviewSegmentDetail({ segment, className }) {
	const { place, duration } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("glass rounded-xl p-3 sm:p-4", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "mb-3 flex items-center gap-2 text-sm font-semibold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
				"aria-hidden": true,
				className: "size-5 shrink-0 text-blue-on-dark"
			}), "Route details"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "grid gap-x-5 gap-y-3 sm:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid min-w-0 grid-cols-[auto_1fr] items-start gap-x-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
							"aria-hidden": true,
							className: "row-span-2 mt-0.5 size-4 shrink-0 text-muted-foreground"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-xs text-muted-foreground",
							children: "Starting point"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "rp-wrap-anywhere text-xs font-medium",
							children: place(segment.from)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid min-w-0 grid-cols-[auto_1fr] items-start gap-x-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
							"aria-hidden": true,
							className: "row-span-2 mt-0.5 size-4 shrink-0 text-muted-foreground"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-xs text-muted-foreground",
							children: "Total distance"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
							className: "rp-wrap-anywhere text-xs font-medium",
							children: [segment.distanceKm, " km (illustrative)"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid min-w-0 grid-cols-[auto_1fr] items-start gap-x-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
							"aria-hidden": true,
							className: "row-span-2 mt-0.5 size-4 shrink-0 text-muted-foreground"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-xs text-muted-foreground",
							children: "End point"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "rp-wrap-anywhere text-xs font-medium",
							children: place(segment.to)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid min-w-0 grid-cols-[auto_1fr] items-start gap-x-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, {
							"aria-hidden": true,
							className: "row-span-2 mt-0.5 size-4 shrink-0 text-muted-foreground"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-xs text-muted-foreground",
							children: "Estimated time"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
							className: "rp-wrap-anywhere text-xs font-medium",
							children: [duration(segment.typicalMinutes), " (illustrative)"]
						})
					]
				})
			]
		})]
	});
}
function StatusTimeline({ report, level }) {
	const { t, ago, stamp } = usePrefs();
	const communityLevel = level === "clear" || level === "do_not_travel" ? "unknown" : level;
	const statusLabel = report.status === "under_review" ? "Under review" : report.status === "needs_info" ? "More information requested" : report.status === "conflicting" ? "Conflicting information noted" : "Community review status updated";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "glass rounded-xl p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-4 text-sm font-semibold",
			children: "Status history"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
			className: "space-y-4 border-l border-border pl-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "relative",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1 -left-[1.32rem] size-2.5 rounded-full bg-blue-on-dark" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: t("segment.timelineReported")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								ago(report.receivedAt),
								" · ",
								stamp(report.receivedAt)
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "relative",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1 -left-[1.32rem] size-2.5 rounded-full border-2 border-status-unknown bg-background" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: statusLabel
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Community review status"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "relative",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1 -left-[1.32rem] size-2.5 rounded-full border-2 border-status-unknown bg-background" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: t("segment.aiIndication")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBadge, {
							level: communityLevel,
							className: "mt-2"
						})
					]
				})
			]
		})]
	});
}
function MapSegmentDetail({ segment, advisory, corridorName, onClose, className }) {
	const { t, ago, stamp, place } = usePrefs();
	const { advisoryCacheTimestamp: cacheTimestamp } = useAppStore();
	const sourceTimestamp = advisory.latestObservationAt;
	const condition = advisory.evidence.find((report) => report.kind === "hazard") ?? advisory.evidence[0];
	const source = advisory.evidence.length ? t("source.community") : advisory.restriction ? t("source.official") : t("source.unknown");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-level": advisory.level,
		className: cn("rp-map-detail-panel", className),
		"aria-labelledby": "rp-map-segment-title",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rp-map-detail-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rp-map-detail-heading-label",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mountain, {
						"aria-hidden": true,
						className: "size-4"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Selected road segment" })]
				}), onClose && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rp-map-detail-close",
					onClick: onClose,
					"aria-label": "Close selected segment",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { "aria-hidden": true })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rp-map-segment-title-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					id: "rp-map-segment-title",
					className: "rp-wrap-anywhere",
					children: [
						place(segment.from),
						" – ",
						place(segment.to)
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBadge, {
					level: advisory.level,
					size: "lg"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "rp-map-segment-meta",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoadCode, { children: segment.code }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						children: "·"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [segment.distanceKm, " km"] }),
					corridorName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						children: "·"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: corridorName })] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreshnessChip, {
				observationTimestamp: sourceTimestamp,
				className: "rp-map-freshness"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheTimeLabel, { timestamp: cacheTimestamp }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rp-map-condition",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { "aria-hidden": true }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: condition ? t(`hazard.${condition.hazardType}`) : "No recent observation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: condition?.description ?? t("copy.noRecent") })] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "rp-map-observation-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: t("segment.observationTime") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [advisory.latestObservationAt ? ago(advisory.latestObservationAt) : t("common.unknown"), advisory.latestObservationAt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: stamp(advisory.latestObservationAt) })] })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Source" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [source, advisory.evidence.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [advisory.evidence.length, " reports"] })] })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: t("segment.sourceTime") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [sourceTimestamp ? ago(sourceTimestamp) : t("common.unknown"), sourceTimestamp && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: stamp(sourceTimestamp) })] })] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rp-map-official-info",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rp-map-official-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { "aria-hidden": true }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Official restriction" })]
				}), advisory.restriction ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rp-map-restriction",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfficialBadge, { label: t(`restriction.${advisory.restriction.type}`) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: advisory.restriction.title }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: advisory.restriction.issuingAuthority })
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rp-map-no-official",
					children: "No current official information"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/advisories/$segmentId",
				params: { segmentId: segment.id },
				className: "rp-map-details-link glass-btn-frost",
				children: [
					t("common.viewDetails"),
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { "aria-hidden": true })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rp-map-reports",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [
					"Available reports (",
					advisory.evidence.length,
					")"
				] }), advisory.evidence.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: advisory.evidence.slice(0, 3).map((report) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapReportRow, {
					report,
					segmentLevel: advisory.level
				}, report.ref)) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rp-map-no-official",
					children: "No community reports are available for this segment."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rp-map-detail-footer",
				children: "Prototype visualization · Synthetic data"
			})
		]
	});
}
function MapReportRow({ report, segmentLevel }) {
	const { t, ago, now } = usePrefs();
	const level = getFreshnessState(report.observedAt, now) === "stale" || report.kind === "clear" ? "unknown" : segmentLevel === "avoid" ? "avoid" : "caution";
	const title = report.kind === "hazard" ? `${t(`hazard.${report.hazardType}`)} reported` : "Community condition report";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rp-map-report-row glass",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rp-map-report-icon",
			children: level === "unknown" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { "aria-hidden": true }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { "aria-hidden": true })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rp-map-report-copy",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rp-map-report-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBadge, { level })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: report.description }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
					t("source.community"),
					" · ",
					t(`source.${report.source}`),
					" ·",
					" ",
					ago(report.observedAt)
				] })
			]
		})]
	});
}
export { SegmentDetail, StatusTimeline };
