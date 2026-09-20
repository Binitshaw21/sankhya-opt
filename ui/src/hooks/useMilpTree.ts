import { useSolverStore } from '@/context/SolverContext'

export function useMilpTree() {
  const { milpTree, solverMetrics } = useSolverStore()
  return { milpTree, solverMetrics }
}
