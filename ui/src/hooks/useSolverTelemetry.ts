import { useGpuTelemetry } from '@/hooks/useGpuTelemetry'
import { useSolverStatus } from '@/hooks/useSolverStatus'

export function useSolverTelemetry() {
  const gpu = useGpuTelemetry()
  const status = useSolverStatus()
  return { ...gpu, ...status }
}
