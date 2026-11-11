import { forwardRef } from 'react'
import type { ComponentProps } from 'react'
import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PreferencesProvider } from '@/i18n/preferences'
import { computeSegmentAdvisory, getAdvisorySourceTimestamp } from '@/lib/advisory'
import { AppStoreProvider } from '@/lib/app-store'
import { AdvisoryCard } from '@/components/advisory-card'
import { SegmentDetail, StatusTimeline } from '@/features/routes/segment-detail'
import { DEMO_NOW } from '@/data/fixtures'
import { SH15_SCENARIO_LIST } from './fixtures/sh-15-advisories'

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  const MockLink = forwardRef<
    HTMLAnchorElement,
    ComponentProps<'a'> & {
      to?: string
      params?: Record<string, string>
      search?: Record<string, unknown>
    }
  >((props, ref) => {
    const { to = '#', params, search, ...anchorProps } = props
    void params
    void search
    return <a ref={ref} href={to} {...anchorProps} />
  })
  MockLink.displayName = 'MockLink'
  return { ...actual, Link: MockLink }
})

// Synthetic scenarios are injected through the shared app store's seed, the
// same seam real persistence will use. Advisories are taken as given so the
// UI is tested against each exact scenario.
const SH15_SEED = {
  segments: SH15_SCENARIO_LIST.map((item) => item.segment),
  advisories: new Map(SH15_SCENARIO_LIST.map((item) => [item.segment.id, item.advisory])),
  now: DEMO_NOW,
}

function renderWithPreferences(ui: React.ReactNode) {
  return render(
    <AppStoreProvider seed={SH15_SEED}>
      <PreferencesProvider>{ui}</PreferencesProvider>
    </AppStoreProvider>,
  )
}

function mockScenarioAdvisory(scenario: (typeof SH15_SCENARIO_LIST)[number]) {
  return scenario
}

function expectedAge(timestamp: number) {
  const minutes = Math.max(0, Math.round((DEMO_NOW - timestamp) / 60_000))
  if (minutes < 5) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  return hours < 48 ? `${hours} h ago` : `${Math.round(hours / 24)} d ago`
}

describe.each(SH15_SCENARIO_LIST)('$label', (scenario) => {
  beforeEach(() => {
    mockScenarioAdvisory(scenario)
  })

  it('renders the source age and a separate fixed cache timestamp on the advisory card', () => {
    const sourceTimestamp = getAdvisorySourceTimestamp(scenario.advisory)
    renderWithPreferences(<AdvisoryCard segment={scenario.segment} />)

    const freshness = screen.getByTestId('freshness-chip')
    if (sourceTimestamp === undefined) {
      expect(freshness).toHaveTextContent('Freshness unknown')
    } else {
      expect(freshness).toHaveTextContent(expectedAge(sourceTimestamp))
    }
    expect(screen.getByTestId('cache-time')).toHaveTextContent('Cached:')
    expect(screen.getByTestId('cache-time').querySelector('time')).toHaveAttribute(
      'datetime',
      new Date(DEMO_NOW).toISOString(),
    )
  })

  it('renders the same advisory details and keeps cache time distinct from source age', () => {
    const sourceTimestamp = getAdvisorySourceTimestamp(scenario.advisory)
    renderWithPreferences(<SegmentDetail segment={scenario.segment} />)

    const detail = screen.getByRole('region', { name: /dehradun/i })
    const freshness = within(detail).getByTestId('freshness-chip')
    if (sourceTimestamp === undefined) {
      expect(freshness).toHaveTextContent('Freshness unknown')
    } else {
      expect(freshness).toHaveTextContent(expectedAge(sourceTimestamp))
    }
    expect(within(detail).getByTestId('cache-time')).toHaveTextContent('Cached:')
    expect(within(detail).getByTestId('cache-time').querySelector('time')).toHaveAttribute(
      'datetime',
      new Date(DEMO_NOW).toISOString(),
    )
  })
})

describe('SH-15 status safety', () => {
  it.each(['unknown', 'stale'] as const)('%s never has a positive tone or says Safe', (key) => {
    const scenario = SH15_SCENARIO_LIST.find((item) => item.key === key)
    if (!scenario) throw new Error(`Missing SH-15 ${key} fixture`)
    mockScenarioAdvisory(scenario)
    const { container } = renderWithPreferences(
      <>
        <AdvisoryCard segment={scenario.segment} />
        <SegmentDetail segment={scenario.segment} />
      </>,
    )

    expect(container).not.toHaveTextContent(/\bsafe\b/i)
    expect(container.querySelector('.bg-status-clear, .text-status-clear')).toBeNull()
    expect(container).toHaveTextContent('Unknown')
  })

  it.each(['official-closed', 'official-closed-awaiting-clearance'] as const)(
    '%s closure remains visible in cards and details without a disclosure control',
    (key) => {
      const scenario = SH15_SCENARIO_LIST.find((item) => item.key === key)
      if (!scenario) throw new Error(`Missing SH-15 ${key} fixture`)
      mockScenarioAdvisory(scenario)
      const { container } = renderWithPreferences(
        <>
          <AdvisoryCard segment={scenario.segment} />
          <SegmentDetail segment={scenario.segment} />
        </>,
      )

      expect(container).toHaveTextContent('Synthetic SH-15 closure for clearance work')
      expect(container.querySelector('details')).toBeNull()
      if (key === 'official-closed-awaiting-clearance') {
        expect(container).toHaveTextContent('Awaiting clearance verification')
      }
    },
  )

  it('does not turn a community clear, score, reputation, or AI output into a clearance or closure', () => {
    const scenario = SH15_SCENARIO_LIST.find((item) => item.key === 'community-only')
    if (!scenario?.advisory.evidence[0]) {
      throw new Error('Missing SH-15 community-only fixture')
    }
    const report = scenario.advisory.evidence[0]
    mockScenarioAdvisory(scenario)
    const { container } = renderWithPreferences(
      <>
        <AdvisoryCard segment={scenario.segment} />
        <SegmentDetail segment={scenario.segment} />
        <StatusTimeline report={report} level="clear" />
      </>,
    )
    const result = computeSegmentAdvisory(scenario.segment.id, [report], [], scenario.now)

    expect(result.level).toBe('unknown')
    expect(result.restriction).toBeUndefined()
    expect(container).not.toHaveTextContent(/\bcleared\b|\bverified\b|official restriction in force/i)
    expect(container).toHaveTextContent('No current official information')
    expect(container).toHaveTextContent('Reported')
    const statusHistory = screen.getByText('Status history').closest('section')
    if (!statusHistory) throw new Error('Missing community status history section')
    expect(within(statusHistory).getByText('Unknown')).toBeInTheDocument()
    expect(scenario.untrustedSignals).toMatchObject({
      score: 100,
      reputation: expect.any(String),
      aiOutput: 'Cleared and verified',
    })
  })
})
