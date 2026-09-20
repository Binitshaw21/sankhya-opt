import { MpirTelemetry } from '@/components/dashboard/MpirTelemetry'
import { EmptyState } from '@/components/shared/EmptyState'
import { useGpuTelemetry } from '@/hooks/useGpuTelemetry'

export default function GPUCompute() {
  const { gpuTelemetry } = useGpuTelemetry()

  if (!gpuTelemetry) {
    return (
      <EmptyState
        title="Waiting for solver telemetry."
        description="Run an optimization in Command Center. GPU series will be reconstructed from the live solve metrics and labeled SIMULATED until the engine streams counters."
      />
    )
  }

  return <MpirTelemetry telemetry={gpuTelemetry} />
}
