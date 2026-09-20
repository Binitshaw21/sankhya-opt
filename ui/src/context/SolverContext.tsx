import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { SolverApiError } from '@/api/client'
import { checkEngineHealth, translateAndSolve } from '@/api/solver'
import { buildAuditRecord, createRunId } from '@/lib/audit'
import { evaluateConstraints, deriveKktVerification } from '@/lib/constraints'
import { DEFAULT_PROMPT } from '@/lib/constants'
import { buildGpuTelemetry } from '@/lib/simulated/gpu'
import { buildMilpTree } from '@/lib/simulated/milp'
import { buildOptNetDemo, idleOptNet } from '@/lib/simulated/optnet'
import { mapSolverResultStatus } from '@/lib/status'
import type { MilpTree } from '@/types/milp'
import type {
  ApiError,
  AuditRecord,
  ConnectionStatus,
  ConstraintEvaluation,
  EngineHealth,
  NlpExtraction,
  SolverMetrics,
  SolverStatus,
} from '@/types/solver'
import type { GpuTelemetrySeries, KktVerification, OptNetDemoState } from '@/types/telemetry'

export interface SolverStore {
  currentPrompt: string
  setCurrentPrompt: (value: string) => void
  solverStatus: SolverStatus
  nlpExtraction: NlpExtraction | null
  solverMetrics: SolverMetrics | null
  solutionVector: number[] | null
  constraintStatus: ConstraintEvaluation[] | null
  gpuTelemetry: GpuTelemetrySeries | null
  milpTree: MilpTree | null
  kktVerification: KktVerification | null
  optnet: OptNetDemoState
  auditData: AuditRecord | null
  apiStatus: ConnectionStatus
  engineHealth: EngineHealth
  error: ApiError | null
  runId: string | null
  timestamp: string | null
  requestStartedAt: number | null
  architectureOpen: boolean
  setArchitectureOpen: (open: boolean) => void
  runOptimization: () => Promise<void>
  retry: () => Promise<void>
  runOptNetPhase: (phase: 'FORWARD' | 'BACKWARD') => void
  refreshHealth: () => Promise<void>
}

const SolverContext = createContext<SolverStore | null>(null)

const INITIAL_HEALTH: EngineHealth = {
  api: 'UNKNOWN',
  engine: 'UNKNOWN',
  lastCheckedAt: null,
  endpoint: '',
}

export function SolverProvider({ children }: { children: ReactNode }) {
  const [currentPrompt, setCurrentPrompt] = useState(DEFAULT_PROMPT)
  const [solverStatus, setSolverStatus] = useState<SolverStatus>('IDLE')
  const [nlpExtraction, setNlpExtraction] = useState<NlpExtraction | null>(null)
  const [solverMetrics, setSolverMetrics] = useState<SolverMetrics | null>(null)
  const [solutionVector, setSolutionVector] = useState<number[] | null>(null)
  const [constraintStatus, setConstraintStatus] = useState<ConstraintEvaluation[] | null>(null)
  const [gpuTelemetry, setGpuTelemetry] = useState<GpuTelemetrySeries | null>(null)
  const [milpTree, setMilpTree] = useState<MilpTree | null>(null)
  const [kktVerification, setKktVerification] = useState<KktVerification | null>(null)
  const [optnet, setOptnet] = useState<OptNetDemoState>(idleOptNet)
  const [auditData, setAuditData] = useState<AuditRecord | null>(null)
  const [engineHealth, setEngineHealth] = useState<EngineHealth>(INITIAL_HEALTH)
  const [error, setError] = useState<ApiError | null>(null)
  const [runId, setRunId] = useState<string | null>(null)
  const [timestamp, setTimestamp] = useState<string | null>(null)
  const [requestStartedAt, setRequestStartedAt] = useState<number | null>(null)
  const [architectureOpen, setArchitectureOpen] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const refreshHealth = useCallback(async () => {
    const health = await checkEngineHealth()
    setEngineHealth(health)
  }, [])

  useEffect(() => {
    let cancelled = false
    const poll = async () => {
      const health = await checkEngineHealth()
      if (!cancelled) setEngineHealth(health)
    }
    const timeout = window.setTimeout(() => {
      void poll()
    }, 0)
    const id = window.setInterval(() => {
      void poll()
    }, 15000)
    return () => {
      cancelled = true
      window.clearTimeout(timeout)
      window.clearInterval(id)
    }
  }, [])

  const runOptimization = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setError(null)
    setSolverStatus('TRANSLATING')
    setRequestStartedAt(Date.now())

    try {
      const response = await translateAndSolve(currentPrompt, controller.signal)
      const now = new Date().toISOString()
      const nextRunId = createRunId(now)
      const extraction = response.nlp_extraction
      const metrics = response.solver_metrics
      const constraints = evaluateConstraints(extraction, metrics.solution_vector)
      const kkt = deriveKktVerification(extraction, metrics)
      const nextStatus = mapSolverResultStatus(metrics.status)

      setNlpExtraction(extraction)
      setSolverMetrics(metrics)
      setSolutionVector(metrics.solution_vector)
      setConstraintStatus(constraints)
      setGpuTelemetry(buildGpuTelemetry(metrics))
      setMilpTree(buildMilpTree(metrics))
      setKktVerification(kkt)
      setOptnet(idleOptNet())
      setRunId(nextRunId)
      setTimestamp(now)
      setAuditData(
        buildAuditRecord({
          runId: nextRunId,
          timestamp: now,
          prompt: currentPrompt.trim(),
          extraction,
          metrics,
          kkt,
        }),
      )
      setSolverStatus(nextStatus)
      void refreshHealth()
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'AbortError') return
      const apiError: ApiError =
        cause instanceof SolverApiError
          ? cause.error
          : {
              kind: 'UNKNOWN',
              message: cause instanceof Error ? cause.message : 'Unexpected solver failure.',
              endpoint: '',
            }
      setError(apiError)
      setSolverStatus('ERROR')
    } finally {
      setRequestStartedAt(null)
    }
  }, [currentPrompt, refreshHealth])

  const retry = useCallback(async () => {
    await runOptimization()
  }, [runOptimization])

  const runOptNetPhase = useCallback(
    (phase: 'FORWARD' | 'BACKWARD') => {
      if (!solverMetrics) return
      setOptnet(buildOptNetDemo(solverMetrics, phase === 'FORWARD' ? 'FORWARD' : 'COMPLETE'))
    },
    [solverMetrics],
  )

  const value = useMemo<SolverStore>(
    () => ({
      currentPrompt,
      setCurrentPrompt,
      solverStatus,
      nlpExtraction,
      solverMetrics,
      solutionVector,
      constraintStatus,
      gpuTelemetry,
      milpTree,
      kktVerification,
      optnet,
      auditData,
      apiStatus: engineHealth.api,
      engineHealth,
      error,
      runId,
      timestamp,
      requestStartedAt,
      architectureOpen,
      setArchitectureOpen,
      runOptimization,
      retry,
      runOptNetPhase,
      refreshHealth,
    }),
    [
      architectureOpen,
      auditData,
      constraintStatus,
      currentPrompt,
      engineHealth,
      error,
      gpuTelemetry,
      kktVerification,
      milpTree,
      nlpExtraction,
      optnet,
      refreshHealth,
      requestStartedAt,
      retry,
      runId,
      runOptimization,
      runOptNetPhase,
      solutionVector,
      solverMetrics,
      solverStatus,
      timestamp,
    ],
  )

  return <SolverContext.Provider value={value}>{children}</SolverContext.Provider>
}

// Context modules export the hook alongside the provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useSolverStore(): SolverStore {
  const ctx = useContext(SolverContext)
  if (!ctx) {
    throw new Error('useSolverStore must be used within SolverProvider')
  }
  return ctx
}
