import { useSolverStore } from '@/context/SolverContext'

export function useSolver() {
  const store = useSolverStore()
  return {
    currentPrompt: store.currentPrompt,
    setCurrentPrompt: store.setCurrentPrompt,
    solverStatus: store.solverStatus,
    nlpExtraction: store.nlpExtraction,
    solverMetrics: store.solverMetrics,
    solutionVector: store.solutionVector,
    constraintStatus: store.constraintStatus,
    error: store.error,
    runId: store.runId,
    timestamp: store.timestamp,
    requestStartedAt: store.requestStartedAt,
    runOptimization: store.runOptimization,
    retry: store.retry,
  }
}
