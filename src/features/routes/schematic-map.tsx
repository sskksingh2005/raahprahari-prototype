import { useMemo } from 'react'
import { CircleQuestionMark, ShieldCheck, TriangleAlert } from 'lucide-react'
import { QUICK_PICKS, placeById } from '@/data/fixtures'
import { LEVEL_META } from '@/components/advisory'
import { useAppStore } from '@/lib/app-store'
import { usePrefs } from '@/i18n/preferences'
import type { AdvisoryLevel } from '@/lib/advisory'
import { cn } from '@/lib/utils'

// Simple equirectangular projection of the populated part of the coverage box.
const VIEW = { minLon: 77.75, maxLon: 80.55, minLat: 28.85, maxLat: 31.2 }
const W = 1000
const H = 970
export const project = (lat: number, lon: number) => ({
  x: ((lon - VIEW.minLon) / (VIEW.maxLon - VIEW.minLon)) * W,
  y: ((VIEW.maxLat - lat) / (VIEW.maxLat - VIEW.minLat)) * H,
})
const unproject = (x: number, y: number) => ({
  lon: VIEW.minLon + (x / W) * (VIEW.maxLon - VIEW.minLon),
  lat: VIEW.maxLat - (y / H) * (VIEW.maxLat - VIEW.minLat),
})

export function SchematicMap({
  highlight,
  endpoints,
  labelPlaces,
  selectedSegmentId,
  onSelectSegment,
  onPickPoint,
  pin,
  terrain = false,
  className,
}: {
  highlight?: string[]
  endpoints?: string[]
  labelPlaces?: string[]
  selectedSegmentId?: string
  onSelectSegment?: (id: string) => void
  onPickPoint?: (lat: number, lon: number) => void
  pin?: { lat: number; lon: number }
  terrain?: boolean
  className?: string
}) {
  const { t, place } = usePrefs()
  const { advisories, segments: SEGMENTS, places: PLACES } = useAppStore()
  const highlightSet = useMemo(() => new Set(highlight ?? []), [highlight])
  const hasHighlight = highlightSet.size > 0

  const labelIds = new Set(labelPlaces ?? [...QUICK_PICKS, ...(endpoints ?? [])])
  const stopIds = new Set(SEGMENTS.flatMap((s) => [s.from, s.to]))

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onPickPoint) return
    const svg = e.currentTarget
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return
    const p = pt.matrixTransform(ctm.inverse())
    const { lat, lon } = unproject(p.x, p.y)
    onPickPoint(lat, lon)
  }

  return (
    <div
      className={cn(
        terrain
          ? 'relative h-full w-full overflow-hidden bg-transparent'
          : 'relative overflow-hidden rounded-2xl border border-border bg-card rp-grid-bg',
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={cn(terrain ? 'block h-full w-full' : 'block h-auto w-full', onPickPoint && 'cursor-crosshair')}
        role="group"
        aria-label={t('map.schematic')}
        onClick={handleSvgClick}
      >
        {/* Segments */}
        {SEGMENTS.map((s) => {
          const a = placeById(s.from)!
          const b = placeById(s.to)!
          const pa = project(a.lat, a.lon)
          const pb = project(b.lat, b.lon)
          const adv = advisories.get(s.id)
          const level: AdvisoryLevel = adv?.level ?? 'unknown'
          const inRoute = highlightSet.has(s.id)
          const dim = hasHighlight && !inRoute
          const selected = s.id === selectedSegmentId
          const dashed = level === 'unknown'
          const label = `${s.code}, ${place(s.from)} – ${place(s.to)}: ${t(`level.${level}`)}${adv?.stale ? `, ${t('level.stale')}` : ''}`
          const interactive = !!onSelectSegment
          return (
            <g
              key={s.id}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={interactive ? label : undefined}
              aria-pressed={interactive ? selected : undefined}
              onClick={(e) => {
                if (!interactive) return
                e.stopPropagation()
                onSelectSegment(s.id)
              }}
              onKeyDown={(e) => {
                if (interactive && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  onSelectSegment(s.id)
                }
              }}
              className={cn(interactive && 'cursor-pointer outline-none [&:focus-visible>line.focus]:opacity-100')}
              opacity={dim ? 0.28 : 1}
            >
              <title>{label}</title>
              <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="transparent" strokeWidth={30} />
              <line
                className="focus opacity-0"
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke="var(--ring)"
                strokeWidth={22}
                strokeLinecap="round"
              />
              {selected && (
                <line className="rp-fade-pulse-once" x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="var(--foreground)" strokeWidth={18} strokeLinecap="round" opacity={0.9} />
              )}
              <line
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke={terrain ? '#149bff' : LEVEL_META[level].color}
                strokeWidth={inRoute || selected ? 11 : 7}
                strokeLinecap="round"
                strokeDasharray={dashed ? '4 14' : undefined}
              />
            </g>
          )
        })}

        {/* Markers */}
        {SEGMENTS.map((s) => {
          const adv = advisories.get(s.id)
          if (!adv) return null
          const a = placeById(s.from)!
          const b = placeById(s.to)!
          const pa = project(a.lat, a.lon)
          const pb = project(b.lat, b.lon)
          const mx = (pa.x + pb.x) / 2
          const my = (pa.y + pb.y) / 2
          const hazards = adv.evidence.filter((r) => r.kind === 'hazard').length
          const unknown = adv.level === 'unknown'
          const dim = hasHighlight && !highlightSet.has(s.id)
          return (
            <g key={`m-${s.id}`} pointerEvents="none" opacity={dim ? 0.3 : 1}>
              {hazards > 0 && (
                <g transform={`translate(${mx + (adv.restriction ? 22 : unknown ? 16 : 0)}, ${my - 4})`}>
                  <circle r={17} fill="var(--card)" stroke={LEVEL_META[adv.level].color} strokeWidth={3} />
                  <TriangleAlert x={-10} y={-11} width={20} height={20} color="var(--foreground)" />
                </g>
              )}
              {adv.restriction && (
                <g transform={`translate(${mx - (hazards ? 22 : unknown ? 16 : 0)}, ${my - 4})`}>
                  <circle r={17} fill="var(--status-official)" stroke="var(--card)" strokeWidth={3} />
                  <ShieldCheck x={-10} y={-10} width={20} height={20} color="#ffffff" />
                </g>
              )}
              {unknown && (
                <g transform={`translate(${mx - (hazards || adv.restriction ? 16 : 0)}, ${my - 4})`}>
                  <circle r={17} fill="var(--card)" stroke={LEVEL_META.unknown.color} strokeWidth={3} />
                  <CircleQuestionMark x={-10} y={-10} width={20} height={20} color={LEVEL_META.unknown.color} />
                </g>
              )}
            </g>
          )
        })}

        {/* Places */}
        {PLACES.filter((p) => stopIds.has(p.id)).map((p) => {
          const { x, y } = project(p.lat, p.lon)
          const isEnd = endpoints?.includes(p.id)
          const showLabel = labelIds.has(p.id)
          return (
            <g key={p.id} pointerEvents="none">
              <circle
                cx={x}
                cy={y}
                r={isEnd ? 11 : showLabel ? 7 : 4.5}
                fill={isEnd ? 'var(--brand-orange)' : 'var(--foreground)'}
                stroke="var(--card)"
                strokeWidth={3}
              />
              {showLabel && (
                <text
                  x={x + 14}
                  y={y + 8}
                  fontSize={isEnd ? 28 : 24}
                  fontWeight={isEnd ? 700 : 500}
                  fill="var(--foreground)"
                  stroke="var(--card)"
                  strokeWidth={6}
                  paintOrder="stroke"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {place(p.id)}
                </text>
              )}
            </g>
          )
        })}

        {pin && (
          <g transform={`translate(${project(pin.lat, pin.lon).x}, ${project(pin.lat, pin.lon).y})`} pointerEvents="none">
            <circle r={22} fill="var(--brand-orange)" opacity={0.25} />
            <circle r={9} fill="var(--brand-orange)" stroke="#111719" strokeWidth={3} />
          </g>
        )}
      </svg>
      {!terrain && (
        <p className="pointer-events-none absolute right-3 bottom-2 font-mono text-[10px] text-muted-foreground">
          {t('map.schematic')}
        </p>
      )}
    </div>
  )
}

export function MapLegend({ className }: { className?: string }) {
  const { t } = usePrefs()
  const levels: AdvisoryLevel[] = ['clear', 'caution', 'avoid', 'do_not_travel', 'unknown']
  return (
    <div className={cn('rounded-2xl border border-border bg-card p-4', className)}>
      <p className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">{t('map.legend')}</p>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3 xl:grid-cols-2">
        {levels.map((l) => {
          const Icon = LEVEL_META[l].icon
          return (
            <li key={l} className="flex items-center gap-2">
              <svg width="28" height="8" aria-hidden>
                <line x1="4" y1="4" x2="24" y2="4" stroke={LEVEL_META[l].color} strokeWidth="5" strokeLinecap="round" strokeDasharray={l === 'unknown' ? '2 5' : undefined} />
              </svg>
              <Icon aria-hidden className="size-3.5" style={{ color: LEVEL_META[l].color }} />
              {t(`level.${l}`)}
            </li>
          )
        })}
        <li className="flex items-center gap-2">
          <span aria-hidden className="inline-flex size-5 items-center justify-center rounded-full border-2 border-status-caution bg-card">
            <TriangleAlert className="size-3" />
          </span>
          {t('map.hazard')}
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="inline-flex size-5 items-center justify-center rounded-full bg-status-official">
            <ShieldCheck className="size-3 text-primary-foreground" />
          </span>
          {t('map.restriction')}
        </li>
      </ul>
      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">{t('map.layers')}</p>
    </div>
  )
}

export const SegmentMap = SchematicMap
