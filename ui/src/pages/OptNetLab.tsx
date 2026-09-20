import { OptNetLabView } from '@/components/optnet/OptNetLab'
import { EmptyState } from '@/components/shared/EmptyState'
import { useSolverStore } from '@/context/SolverContext'

export default function OptNetLab() {
  const { optnet, solverMetrics, runOptNetPhase } = useSolverStore()

  if (!solverMetrics) {
    return (
      <EmptyState
        title="No differentiable session yet."
        description="Solve a plan first. OptNet gradients are a local research demonstration and are not returned by the live API."
      />
    )
  }

  return (
    <OptNetLabView
      state={optnet}
      canRun
      onForward={() => runOptNetPhase('FORWARD')}
      onBackward={() => runOptNetPhase('BACKWARD')}
    />
  )
}
