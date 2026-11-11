import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ReportStepPage } from '@/features/reports/report-step-page'
import type { ReportPath } from '@/features/reports/report-step-page'

export const Route = createFileRoute('/report/')({
  component: ReportObservationPage,
})

function ReportObservationPage() {
  const navigate = useNavigate()
  const { segment } = Route.useSearch()
  const go = (path: ReportPath) => {
    if (path === '/') void navigate({ to: path })
    else void navigate({ to: path, search: { segment: undefined } })
  }
  return <ReportStepPage step="observation" navigate={go} prefillSegmentId={segment} />
}
