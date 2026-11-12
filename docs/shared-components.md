# Shared Components and Primitives (SH-05)

This guide documents the reusable UI contracts currently implemented under
`src/components/` and `src/features/routes/`. A few requested names describe
parts of a shared composition rather than separately exported components; those
are mapped to the implementation below instead of inventing a second API.

## Primitives

### Button

- **Purpose:** Consistent action, link, and icon-button styling.
- **Props:** Native button props; `variant`: `default` | `destructive` |
  `outline` | `secondary` | `ghost` | `link`; `size`: `default` | `xs` | `sm`
  | `lg` | `icon` | `icon-xs` | `icon-sm` | `icon-lg`; `asChild?: boolean`.
  Icon sizes require an `aria-label`. `IconButton` accepts `label`, `icon`,
  optional icon `size`, and button props.
- **Variants:** The `variant` and `size` values above; all retain a minimum
  44px target.
- **Accessibility:** Use a visible label for text actions; provide an
  accessible name for icon-only buttons. Native disabled and focus-visible
  behavior is preserved.
- **Example:** `<Button variant="outline" onClick={reload}>Reload</Button>`
- **Safety:** Do keep action names factual and specific; don't label a route or
  action “Safe” or imply a guarantee.

### Input

- **Purpose:** Styled native single-line input.
- **Props:** All native `input` props, including `type`, `id`, `name`,
  `autoComplete`, `required`, `aria-describedby`, and `aria-invalid`; plus
  `className`.
- **Variants:** Native input types; no component-specific visual variants.
- **Accessibility:** Pair with `Field` or an explicit visible `<label>`.
  `Field` connects helper/error descriptions and sets invalid state.
- **Example:** `<Field label="Email"><Input name="email" type="email" /></Field>`
- **Safety:** Do validate and describe required evidence/source fields; don't
  imply user input has been verified merely because it was submitted.

### Select

- **Purpose:** Accessible select menu implemented with Radix Select.
- **Props:** `Select` accepts Radix Root props such as `value`,
  `defaultValue`, `onValueChange`, and `disabled`. Compose with `SelectTrigger`
  (native trigger props plus `size?: "sm" | "default"`), `SelectValue`,
  `SelectContent` (Radix content props, `position`, `align`), and the exported
  group, label, item, separator, and scroll-button parts.
- **Variants:** Trigger size `sm` | `default`; content position follows Radix.
- **Accessibility:** Use a visible label; preserve Radix keyboard navigation,
  focus, and selection semantics. The `Field` helper associates validation
  descriptions with `SelectTrigger`.
- **Example:** `<Select value={value} onValueChange={setValue}><SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger><SelectContent><SelectItem value="north">North</SelectItem></SelectContent></Select>`
- **Safety:** Do distinguish unknown from a positive status in options; don't
  encode unknown or stale information as green.

### Textarea

- **Purpose:** Styled native multi-line text entry.
- **Props:** All native `textarea` props, including `rows`, `maxLength`,
  `required`, `aria-describedby`, and `aria-invalid`; plus `className`.
- **Variants:** No component-specific visual variants.
- **Accessibility:** Pair with a visible label; associate help/error messages
  with `aria-describedby` and set `aria-invalid` for invalid values.
- **Example:** `<Field label="Observation"><Textarea name="observation" /></Field>`
- **Safety:** Do warn users not to submit emergency or sensitive information
  where applicable; don't treat a description as verified evidence.

### Tabs

- **Purpose:** Keyboard-accessible tab selection and associated panels.
- **Props:** `Tabs` accepts Radix Root props including `value`,
  `defaultValue`, `onValueChange`, and `orientation`. `TabsList` accepts
  Radix List props and `variant?: "default" | "line"`; `TabsTrigger` and
  `TabsContent` accept their respective Radix props.
- **Variants:** List `default` | `line`; horizontal or vertical orientation.
- **Accessibility:** Each trigger needs a matching content `value`; include a
  useful label for the tab list and preserve Radix keyboard behavior.
- **Example:** `<Tabs defaultValue="list"><TabsList aria-label="View"><TabsTrigger value="list">List</TabsTrigger></TabsList><TabsContent value="list">Advisories</TabsContent></Tabs>`
- **Safety:** Do use neutral names for status and evidence tabs; don't call a
  tab “Safe” or imply the tab selection verifies information.

### Dialog

- **Purpose:** Modal dialog composition with focus handling and dismissal.
- **Props:** `Dialog` accepts Radix Root props (`open`, `defaultOpen`,
  `onOpenChange`). Compose `DialogTrigger`, `DialogPortal`, `DialogOverlay`,
  `DialogContent` (Radix Content props plus `showCloseButton?: boolean`),
  `DialogHeader`, `DialogFooter` (div props plus `showCloseButton?: boolean`),
  `DialogTitle`, `DialogDescription`, and `DialogClose`.
- **Variants:** Optional close control on content; optional footer close action.
- **Accessibility:** Every content panel must include a visible
  `DialogTitle`; provide a concise description when useful. Radix supplies
  focus management, Escape dismissal, and focus return.
- **Example:** `<Dialog><DialogTrigger asChild><Button>Details</Button></DialogTrigger><DialogContent><DialogTitle>Road details</DialogTitle><DialogDescription>Evidence and source times.</DialogDescription></DialogContent></Dialog>`
- **Safety:** Do state when a report is only received or under review; don't
  describe receipt as verification or a dialog as official confirmation.

### LoadingState

- **Purpose:** Reserved-space loading feedback.
- **Props:** `label?: string` (default `"Loading"`), `className?: string`.
- **Variants:** Custom message and layout class.
- **Accessibility:** Announces politely with `role="status"`, `aria-live`,
  and `aria-busy`.
- **Example:** `<LoadingState label="Loading advisories" />`
- **Safety:** Do keep unavailable data visibly loading or unknown; don't
  replace it with a positive/green status.

### ErrorState

- **Purpose:** Communicates an unsuccessful data load and optional retry.
- **Props:** `message: string`; optional `title`, `retryLabel`, `onRetry`,
  `className`.
- **Variants:** Retry action is shown only when `onRetry` is provided.
- **Accessibility:** Uses `role="alert"` and a heading; the retry control is a
  native button.
- **Example:** `<ErrorState message="Advisories could not be loaded." onRetry={reload} />`
- **Safety:** Do show the failure instead of implying a clear road; don't turn
  a failed request into a “Safe” result.

### EmptyState

- **Purpose:** Explains a successful query with no matching content.
- **Props:** `title: string`, `message: string`; optional `action: ReactNode`
  and `className`.
- **Variants:** Optional next-step action.
- **Accessibility:** Uses a section and heading with explanatory text.
- **Example:** `<EmptyState title="No saved roads" message="Search for a route." />`
- **Safety:** Do explain that no result means no available information; don't
  imply no match means the road is safe.

## Shared layouts and information components

### AppShell

- **Purpose:** The root route's `RootDocument` composition provides document
  metadata, providers, skip link, header, main region, footer, and toast layer.
- **Props:** `RootDocument` receives `children: React.ReactNode`; it is an
  internal shell component, not a public layout API.
- **Variants:** Header/footer visibility is selected by route; the map, home,
  traveller, and help pages have their existing layout exceptions.
- **Accessibility:** Includes a skip link to `#main`, one main landmark, and
  shared navigation/footer landmarks.
- **Example:** Routes render inside the root shell: `<main id="main">{children}</main>`.
- **Safety:** Do preserve route-specific caveats and the prototype label; don't
  remove uncertainty or source attribution when composing pages.

### Header

- **Purpose:** `SiteHeader` supplies primary navigation, language/theme
  controls, login dialog, offline notice, and mobile navigation entry.
- **Props:** No public component props; route and preference context determine
  active links and available controls.
- **Variants:** Home/traveller styling; desktop primary nav and mobile menu.
- **Accessibility:** Uses a labelled navigation landmark, current-page state,
  named icon controls, and a labelled mobile menu trigger.
- **Example:** `<SiteHeader />`
- **Safety:** Do keep navigation actions distinct from official emergency
  services; don't imply the prototype submits or verifies reports.

### MobileMenu

- **Purpose:** The mobile `Sheet` composition inside `SiteHeader` exposes
  navigation and preference controls on small screens; it is not separately
  exported.
- **Props:** No public props; internal open state is managed by `SiteHeader`.
- **Variants:** Right-side sheet; the mobile bottom navigation is a separate
  part of the header composition.
- **Accessibility:** Uses Radix Sheet dialog semantics, title/description,
  focus handling, and a named menu button.
- **Example:** `<SiteHeader />` includes the mobile menu automatically.
- **Safety:** Do retain access to reporting and advisories without claiming
  reports are verified; don't use status color alone as navigation meaning.

### PageBanner

- **Purpose:** Consistent informational-page title and description banner.
- **Props:** `eyebrow: string`, `title: string`, optional `description: string`.
- **Variants:** Description is optional; styling is shared.
- **Accessibility:** Renders a header, eyebrow, and page-level heading.
- **Example:** `<PageBanner eyebrow="CONTACT" title="Contact" description="How to reach us." />`
- **Safety:** Do label prototype limitations plainly; don't state a road is
  “Safe” or imply certainty.

### ActionBadge

- **Purpose:** Displays the advisory level with an icon and localized label
  (implemented by `AdvisoryBadge`).
- **Props:** `level: AdvisoryLevel`; optional `size: "sm" | "lg"` and
  `className`.
- **Variants:** `sm` | `lg`; status styling follows the semantic level.
- **Accessibility:** Pairs text with a decorative icon; color is not the only
  carrier of status.
- **Example:** `<ActionBadge level={advisory.level} />`
- **Safety:** Do keep unknown and stale neutral, never green; don't render a
  generic “Safe” badge.

### FreshnessChip

- **Purpose:** Shows source-data freshness and age.
- **Props:** Optional `sourceTimestamp?: number` (Unix milliseconds) and
  `className`.
- **Variants:** `fresh`, `stale`, or `unknown` is derived from the source
  timestamp and current preference clock.
- **Accessibility:** Includes a status label and decorative icon; age is text.
- **Example:** `<FreshnessChip sourceTimestamp={sourceTimestamp} />`
- **Safety:** Do calculate age from the source timestamp; unknown or stale is
  never green. Don't use render time or a hard-coded age.

### EvidenceLabel

- **Purpose:** Evidence/source labels currently appear in report and segment
  detail compositions; there is no separately exported `EvidenceLabel`
  component yet.
- **Props:** No standalone props. The current evidence contract is report/source
  data passed to `ReportCard` and segment detail.
- **Variants:** Community source, official restriction, and review/status
  details are rendered as distinct labels.
- **Accessibility:** Keep source, observation time, and review state available
  as readable text, not color-only signals.
- **Example:** `<ReportCard report={report} />`
- **Safety:** Do distinguish reported, received, reviewed, and verified states;
  “Received” is not “Verified.” Don't describe community reports as official
  closures.

### AdvisoryCard

- **Purpose:** Linked road-segment advisory summary with evidence/source
  freshness.
- **Props:** `segment: Segment`; optional `className`, `variant:
"default" | "home-featured" | "community-report"`, `communityReport`, and
  `showRestrictionDetail?: boolean`. `communityReport` is required when the
  `community-report` variant is used.
- **Variants:** Default summary, home featured, and community report.
- **Accessibility:** Uses an article containing a keyboard-focusable link;
  status is conveyed with text and icon.
- **Example:** `<AdvisoryCard segment={segment} showRestrictionDetail />`
- **Safety:** Do display source and timestamp-derived freshness; don't imply a
  community report is an official restriction or mark unknown/stale green.

### SegmentSearch

- **Purpose:** Route search and quick-pick interface, implemented by
  `RouteSearchCard`.
- **Props:** Optional `initialFrom`, `initialTo` (string or null),
  `layout: "stacked" | "inline"`, `destination: "check" | "traveller"`, and
  `className`.
- **Variants:** Stacked or inline; navigation destination is selectable.
- **Accessibility:** Uses labelled place inputs, labelled swap/location
  controls, a named form, and pressed state on quick picks.
- **Example:** `<RouteSearchCard layout="stacked" destination="check" />`
- **Safety:** Do communicate route-data coverage and missing evidence; don't
  rank a route as safer based on incomplete information.

### SegmentMap

- **Purpose:** Schematic segment map, implemented by `SchematicMap` and
  re-exported as `SegmentMap`.
- **Props:** Optional `highlight`, `endpoints`, `labelPlaces`,
  `selectedSegmentId`, `onSelectSegment`, `onPickPoint`, `pin`, `terrain`, and
  `className`.
- **Variants:** Terrain background or standard card map; optional selection,
  highlighting, and point-picking behavior.
- **Accessibility:** SVG has a labelled group; interactive segments expose
  button role, keyboard activation, name, and pressed state.
- **Example:** `<SegmentMap selectedSegmentId={id} onSelectSegment={select} />`
- **Safety:** Do label it schematic/illustrative and preserve unknown states;
  don't present synthetic geometry as live navigation or unknown as safe.

### SegmentDetail

- **Purpose:** Presents an advisory's evidence, source, restriction, and
  observation details.
- **Props:** Optional `segmentId`, `onClose`, `className`, and
  `variant: "default" | "map" | "overview"`.
- **Variants:** Standard detail, map panel, and overview.
- **Accessibility:** Uses labelled sections and named close actions; timestamps
  and source/status details remain text.
- **Example:** `<SegmentDetail segmentId={segment.id} variant="map" onClose={close} />`
- **Safety:** Do state that a report being received/reviewed is not verified;
  keep source times, uncertainty, and official restrictions distinct. Don't
  call unknown or stale conditions safe.

### PrototypeRibbon

- **Purpose:** Prototype/synthetic-data disclosure, implemented by `DemoBadge`;
  it is a compact badge rather than a separate ribbon component.
- **Props:** Optional `className`; text is localized by the preferences
  dictionary.
- **Variants:** Shared inline badge styling; placement is controlled by the
  containing page.
- **Accessibility:** Visible text identifies prototype mockup and synthetic
  data; the icon is decorative.
- **Example:** `<DemoBadge />`
- **Safety:** Do keep the disclosure visible near synthetic content; don't
  present generated assets or fixtures as real people, logos, or live reports.

## Motion system

All motion tokens live in `src/styles.css` (`:root`, with dark shadow and hover
overrides under `.dark`). Pages never copy them. Shared components use the
classes below; behaviour helpers are in `src/components/motion.tsx`.

### Tokens

| Token | Value | Use |
|---|---|---|
| `--motion-fast` / `-base` / `-slow` | 120 / 200 / 350ms | press, hover and colour, entrances |
| `--motion-max` | 480ms | ceiling for any one-shot animation |
| `--motion-hero` | 14s | home hero zoom only (runs once, max 3%) |
| `--ease-standard` / `-out` / `-in` / `-spring` | cubic-bezier curves | general, entrances, exits, pops |
| `--scale-hover` 1.08, `--scale-press` 0.97, `--scale-press-card` 0.985, `--scale-press-gentle` 0.94 | scale | icon hover, button, card, raised Report |
| `--lift-hover` -1px, `--lift-card` -2px | translate | buttons, cards |
| `--stagger-step` | 40ms | list stagger (max 8 items) |
| `--shadow-1` / `-2` / `-3` / `--shadow-header` | shadows | rest, button hover, card hover, scrolled header |
| `--primary-hover`, `--secondary-hover`, `--report`, `--report-hover` | colours | each button role has its own hover colour |

### Classes and components

- `Button` (`rp-interactive`): hover lift and shadow on hover-capable pointers
  only, press scale 0.97, `not-allowed` cursor when disabled, and `loading`
  (spinner inside, label kept invisible so width is stable). Variants:
  `default` (blue), `report` (orange), `secondary`, and the rest. The focus
  ring classes stay on every variant.
- `rp-press` and `rp-press-gentle`: press-only scale (tabs, nav, pills). `rp-ripple`: CSS ripple on the raised Report button.
- `rp-underline`: nav underline that slides in on hover and stays on the current page.
- `rp-card`, `rp-arrow`: card lift, stronger border and shadow, and arrow nudge. Add `is-selected` to keep a selection ring.
- `rp-enter`: fade-and-rise with a 40ms stagger by sibling index; items 9 and later are not animated.
- `rp-fade-in`, `rp-fade-rise`, `rp-slide-down`, `rp-pop`: badges, empty/error states, validation messages, success icons.
- `rp-attn`: one attention pulse on AVOID, official closure and official badges.
- `rp-pulse-once`, `rp-fade-pulse-once`: selected map marker and segment.
- `rp-segmented` with `useSlidingHighlight`: sliding highlight for the Map/List toggle.
- `rp-field`: animated border and glow on inputs, selects, checkboxes. `CharCounter` changes colour at 90% and 100%.
- `Skeleton`, `SkeletonCard`, `SkeletonList`, and `LoadingState variant="cards"`: shimmer placeholders.
- `PageTransition`, `RevealObserver`, `BackToTop`, `useExitGhosts`, `useFlash`, `crossFadeTheme` in `motion.tsx`.
- Toasts: top-right, 4s, announced through Sonner's polite live region.

### Rules

- Animate `translate`, `scale`, `rotate` and `opacity` only. Hover effects sit inside `@media (hover: hover) and (pointer: fine)`.
- The only infinite animations are the skeleton shimmer and spinners. The hero zoom is the only animation over 500ms and runs once.
- The final `prefers-reduced-motion: reduce` block removes animations, transforms, zoom, stagger, pulses and reveal hiding. Colour changes remain instant.
- Status colour never changes on hover or animation: unknown and stale stay grey, and nothing turns green.
- Tests: `src/test/motion.test.tsx`. Overflow checks there are structural; jsdom has no layout, so real widths (360, 390, 768, 1440) still need a browser check.
