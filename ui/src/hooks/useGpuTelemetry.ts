import { useSolverStore } from '@/context/SolverContext'

export function useGpuTelemetry() {
  const { gpuTelemetry, solverMetrics, solverStatus } = useSolverStore()
  return { gpuTelemetry, device: solverMetrics?.device ?? null, solverStatus }
}
