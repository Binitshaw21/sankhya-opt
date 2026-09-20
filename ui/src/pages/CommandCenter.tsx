import { ConstraintStatus } from '@/components/command-center/ConstraintStatus'
import { OptimizationInput } from '@/components/command-center/OptimizationInput'
import { ParameterExtraction } from '@/components/command-center/ParameterExtraction'
import { SolutionVector } from '@/components/command-center/SolutionVector'
import { SolverMetricsPanel } from '@/components/command-center/SolverMetricsPanel'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { useSolver } from '@/hooks/useSolver'
import { isBusyStatus } from '@/lib/status'

export default function CommandCenter() {
  const {
    solverStatus,
    nlpExtraction,
    solverMetrics,
    solutionVector,
    constraintStatus,
    error,
    retry,
  } = useSolver()
  const busy = isBusyStatus(solverStatus)
  const hasRun = solverMetrics != null

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      <OptimizationInput />
      {busy ? <LoadingState status={solverStatus} /> : null}
      {error ? <ErrorState error={error} onRetry={() => void retry()} /> : null}
      {!hasRun && !busy && !error ? (
        <EmptyState
          title="No optimization run yet."
          description="Enter refinery constraints above to begin. Metrics stay empty until the engine returns a live result."
        />
      ) : null}
      {nlpExtraction ? <ParameterExtraction extraction={nlpExtraction} /> : null}
      {solverMetrics ? <SolverMetricsPanel metrics={solverMetrics} /> : null}
      {solutionVector ? <SolutionVector values={solutionVector} /> : null}
      {constraintStatus ? <ConstraintStatus constraints={constraintStatus} /> : null}
    </div>
  )
}
