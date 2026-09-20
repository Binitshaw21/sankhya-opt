import type { SolverMetrics } from '@/types/solver'
import type { GpuTelemetrySeries, TelemetryPoint } from '@/types/telemetry'

function series(length: number, fn: (i: number, t: number) => number): TelemetryPoint[] {
  return Array.from({ length }, (_, i) => {
    const t = length === 1 ? 1 : i / (length - 1)
    return { index: i, value: fn(i, t) }
  })
}

/**
 * Reconstructs a plausible telemetry window from live solve metrics.
 * Not hardware telemetry — labeled SIMULATED and seeded from the last REST result.
 */
export function buildGpuTelemetry(metrics: SolverMetrics): GpuTelemetrySeries {
  const n = Math.min(72, Math.max(24, Math.round(metrics.total_inner_iterations / 40)))
  const finalResidual = Math.max(metrics.final_violation_fp64, 1e-12)
  const startResidual = Math.max(finalResidual * 1e5, 1e-2)

  return {
    gpuUtilization: series(n, (_i, t) => {
      const ramp = Math.min(1, t / 0.12)
      const hold = t < 0.82 ? 1 : 1 - (t - 0.82) / 0.18
      const plateau = metrics.device.toUpperCase().includes('CUDA') ? 78 : 42
      return Math.max(4, plateau * ramp * hold)
    }),
    vramUtilization: series(n, (_i, t) => {
      const ramp = Math.min(1, t / 0.08)
      const plateau = metrics.device.toUpperCase().includes('CUDA') ? 61 : 18
      return Math.max(3, plateau * ramp)
    }),
    tensorCoreUtilization: series(n, (_i, t) => {
      const innerPulse = 0.55 + 0.45 * Math.sin(t * Math.PI * 6)
      const cuda = metrics.device.toUpperCase().includes('CUDA')
      return cuda ? Math.max(8, 70 * innerPulse * (t < 0.9 ? 1 : 0.3)) : 0
    }),
    residual: series(n, (_i, t) => startResidual * Math.pow(finalResidual / startResidual, t)),
    iterations: series(n, (i) => (i + 1) * (metrics.total_inner_iterations / n)),
    source: 'SIMULATED',
    seededFrom: {
      device: metrics.device,
      solveTimeMs: metrics.solve_time_ms,
      innerIterations: metrics.total_inner_iterations,
      finalViolation: metrics.final_violation_fp64,
    },
  }
}
