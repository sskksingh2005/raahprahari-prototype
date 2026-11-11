# Change Order: wording, freshness and labelling conflicts

Prototype mockup, synthetic data. This file records the nine conflicts raised after final verification, what the code did when checked, and the evidence for the current state. Tests are in `src/test/fix-round.test.tsx`.

## The nine conflicts

| # | Conflict | Required |
| - | -------- | -------- |
| 1 | Legend/filter says "Cleared / Safe" in green | "Cleared (verified by approved process)". Never "Safe", never a green all-clear. Unresolved clearance reads "Awaiting clearance verification". |
| 2 | Green "Recent" chip | Freshness comes only from `getFreshnessState(sourceTimestamp)`. Unknown or stale is never green. |
| 3 | "Verified by community contributors" | "Submitted by community contributors" |
| 4 | "Currently marked as avoid, AI assessment" | "AI-assisted indication, not an official closure" |
| 5 | Hard-coded "2 days ago", dates, "Freshness: 3 days" | Ages derived from source timestamps with an injected clock. Fixtures use a fixed 2026 "now". |
| 6 | Search result rows missing parts | Every row shows ActionBadge + FreshnessChip + source. |
| 7 | Compare routes ranks a "safer" route | Never rank a safer route. Keep "Not enough current information to recommend a safer route". |
| 8 | Inconsistent marker shapes | Reported hazard = triangle, official restriction = shield, unknown = question mark, on every legend and map. |
| 9 | Profile activity numbers and "Offline-Aware Access" read as real | Label them synthetic or planned. |

## Verification result

"Fixed" is the state after this round. "Found" says what was wrong when checked.

| # | Fixed | Found | Evidence |
| - | ----- | ----- | -------- |
| 1 | Yes | English label already correct. Hindi label read "verified: road open". Aligned it. The clear token is blue in both themes, not green. | `dictionary.ts` `level.clear`, `copy.awaitingClearance`; `styles.css` `--status-clear`; test "change order 1" |
| 2 | Yes | `FreshnessChip` already uses `getFreshnessState`. Fresh is blue, stale and unknown are grey. No "Recent" chip exists. | `components/advisory.tsx`; test "change order 2 and 5" |
| 3 | Yes | `source.community` is already "Submitted by community contributors" in EN and HI. | `dictionary.ts`; test "change order 3, 4 and 7" |
| 4 | Yes (was Partial) | Wording was right but typed inline in English in `segment-detail.tsx`. Moved to `segment.aiIndication` (EN + HI). | `segment-detail.tsx`, `dictionary.ts`; same test |
| 5 | Yes (was Partial) | No literal ages found. But `ago()` read `DEMO_NOW` directly instead of the store clock, so the clock could not be injected. It now uses the store `now`. | `i18n/preferences.tsx`; tests "ages follow the injected clock", "no hard-coded relative ages" |
| 6 | Yes | `ResultRow`, `RouteCard` and `AdvisoryCard` all render the badge, chip and source. A section with no evidence shows Unknown, "Freshness unknown" and "No reported source". | `traveller.tsx`, `route-card.tsx`, `advisory-card.tsx`; test "change order 6" |
| 7 | Yes | Route cards show the "not enough information" line. Sorting is by time, distance or information age only. No route is labelled safer, safest or recommended. | `route-card.tsx`, `check.tsx`; test "a route card keeps the ... line" |
| 8 | Yes | Both legends use a triangle, a shield and a question mark. The Leaflet legend and markers share one glyph set. The route-check legend uses lucide icons with the question mark on the unknown level. | `map-style.ts`, `leaflet-segment-map.tsx`, `schematic-map.tsx`; test "change order 8" |
| 9 | Yes (was Partial) | There is no profile screen, so no activity numbers exist. The Home "Offline-Aware Access" card said "Stay informed, even off the network." It is now labelled Planned. | `routes/index.tsx`, `dictionary.ts` `home.featOffline*`; test "change order 9" |

## Follow-up items done in the same round

- One shared `PrototypeRibbon` (`components/prototype-ribbon.tsx`), text "Prototype mockup, synthetic data", no props and no variants. It replaces `DemoBadge`, the Home and Traveller custom labels, and the raw text on report pages.
- `/map` and `/advisories` have loading skeleton (`role="status"`), empty (`role="status"`) and error (`role="alert"`, with retry) states. Shared pieces: `components/screen-states.tsx`, `lib/use-screen-state.ts`.
- Strings moved to the dictionary for English and Hindi: Reported, Observation time, Source time, View details, Searching, Report this road, Cached.
- `traveller.css` and `home.css` no longer contain hex colours. They use `--tone-*` tokens defined in `styles.css`, or existing brand tokens.

## Loading state behaviour

All data is local and synchronous, so the first render is never a skeleton. That would only hide server-rendered content. The skeleton shows while a retry runs. The error state shows if any section has no advisory.

## Web app manifest and offline status

`public/manifest.webmanifest` sets name, standalone display, the existing favicon as the icon, and the dark `--background` colour for theme and background. It is linked in `routes/__root.tsx`.

There is no service worker. Offline caching is NOT implemented. Installing the app only adds a shortcut. Without a connection the map tiles and pages do not load. The offline banner reports connection status only. The "Using the map offline" help topic and the Home card are marked Planned.

The icon is the existing 48 px favicon. Some browsers require 192 px and 512 px PNG icons before they offer an install prompt. Those were not created because no source artwork was provided.
