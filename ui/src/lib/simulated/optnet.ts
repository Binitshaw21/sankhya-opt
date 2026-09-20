import type { SolverMetrics } from '@/types/solver'
import type { OptNetDemoState } from '@/types/telemetry'

export const OPTNET_NOTE =
  'OptNet gradients are a local research demonstration. The current backend does not expose dL/dA, dL/db, or dL/dc.'

export function idleOptNet(): OptNetDemoState {
  return {
    status: 'IDLE',
    gradientNorm: null,
    jacobianPeak: null,
    dL_dA: [],
    dL_db: [],
    dL_dc: [],
    source: 'SIMULATED',
    note: OPTNET_NOTE,
  }
}

export function buildOptNetDemo(metrics: SolverMetrics, phase: 'FORWARD' | 'BACKWARD' | 'COMPLETE'): OptNetDemoState {
  const x = metrics.solution_vector
  const scale = Math.max(Math.abs(metrics.optimal_objective), 1) / 5000
  const dL_dc = x.map((value, i) => Number(((-value / 1000) * (i + 1) * 0.02 * scale).toFixed(4)))
  const dL_db = [
    Number((-0.12 * scale).toFixed(4)),
    Number((0.08 * scale).toFixed(4)),
    Number((-0.03 * scale).toFixed(4)),
  ]
  const dL_dA = dL_db.map((row) => x.slice(0, 6).map((value) => Number((row * (value / 400) * 0.1).toFixed(3))))
  const gradientNorm = Math.sqrt(dL_dc.reduce((acc, v) => acc + v * v, 0) + dL_db.reduce((acc, v) => acc + v * v, 0))

  let peak = 0
  for (const row of dL_dA) {
    for (const cell of row) peak = Math.max(peak, Math.abs(cell))
  }

  return {
    status: phase,
    gradientNorm: Number(gradientNorm.toFixed(4)),
    jacobianPeak: Number(peak.toFixed(4)),
    dL_dA,
    dL_db,
    dL_dc,
    source: 'SIMULATED',
    note: OPTNET_NOTE,
  }
}
