import { useSolverStore } from '@/context/SolverContext'

export function useKktVerification() {
  const { kktVerification, auditData, solverMetrics } = useSolverStore()
  return { kktVerification, auditData, solverMetrics }
}
