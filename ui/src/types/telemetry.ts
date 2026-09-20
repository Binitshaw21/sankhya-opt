import type { DataSource } from '@/types/solver'

export interface TelemetryPoint {
  index: number
  value: number
}

export interface GpuTelemetrySeries {
  gpuUtilization: TelemetryPoint[]
  vramUtilization: TelemetryPoint[]
  tensorCoreUtilization: TelemetryPoint[]
  residual: TelemetryPoint[]
  iterations: TelemetryPoint[]
  source: DataSource
  seededFrom: {
    device: string
    solveTimeMs: number
    innerIterations: number
    finalViolation: number
  }
}

export interface KktVerification {
  equalityResidual: number
  inequalityViolation: number
  boundViolation: number
  dualityGap: number | null
  finalViolationFp64: number
  tolerance: number
  certified: boolean
  liveFields: Array<'finalViolationFp64'>
  derivedFields: Array<'equalityResidual' | 'inequalityViolation' | 'boundViolation'>
  source: DataSource
}

export interface OptNetDemoState {
  status: 'IDLE' | 'FORWARD' | 'BACKWARD' | 'COMPLETE'
  gradientNorm: number | null
  jacobianPeak: number | null
  dL_dA: number[][]
  dL_db: number[]
  dL_dc: number[]
  source: DataSource
  note: string
}
