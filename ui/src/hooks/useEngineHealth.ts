import { useSolverStore } from '@/context/SolverContext'

export function useEngineHealth() {
  const { engineHealth, apiStatus, solverMetrics, refreshHealth } = useSolverStore()
  const device = solverMetrics?.device ?? null
  return { engineHealth, apiStatus, device, refreshHealth }
}
