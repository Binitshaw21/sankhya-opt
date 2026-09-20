export const SOLVER_STATUSES = [
  'IDLE',
  'TRANSLATING',
  'MODEL_READY',
  'SOLVING',
  'REFINING',
  'VERIFYING',
  'COMPLETED',
  'SUBOPTIMAL',
  'INFEASIBLE',
  'ERROR',
] as const

export type SolverStatus = (typeof SOLVER_STATUSES)[number]

export const CONNECTION_STATUSES = ['UNKNOWN', 'CONNECTED', 'DISCONNECTED'] as const
export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number]

export const DATA_SOURCES = ['LIVE', 'DERIVED', 'SIMULATED'] as const
export type DataSource = (typeof DATA_SOURCES)[number]

export interface NlpExtraction {
  max_sulfur_pool: number
  min_octane_target: number
  max_reforming_capacity: number
}

export interface SolverMetrics {
  status: string
  optimal_objective: number
  solution_vector: number[]
  outer_refinements: number
  total_inner_iterations: number
  final_violation_fp64: number
  solve_time_ms: number
  device: string
}

export interface TranslateAndSolveRequest {
  prompt: string
}

export interface TranslateAndSolveResponse {
  nlp_extraction: NlpExtraction
  solver_metrics: SolverMetrics
}

export interface ApiError {
  kind: 'NETWORK' | 'HTTP' | 'MALFORMED' | 'TIMEOUT' | 'INVALID_PROMPT' | 'UNKNOWN'
  message: string
  endpoint: string
  statusCode?: number
  detail?: string
}

export interface EngineHealth {
  api: ConnectionStatus
  engine: ConnectionStatus
  lastCheckedAt: string | null
  endpoint: string
  detail?: string
}

export interface DecisionVariable {
  index: number
  key: string
  name: string
  unit: string
  role: 'feed' | 'process' | 'mode'
  technicalName: string
}

export type ConstraintTone = 'satisfied' | 'near_limit' | 'violated'

export interface ConstraintEvaluation {
  id: string
  name: string
  kind: 'inequality' | 'equality' | 'bound' | 'exclusivity'
  current: number
  limit: number
  limitLabel: string
  slack: number
  unit: string
  tone: ConstraintTone
  statusLabel: string
  source: DataSource
}

export interface AuditRecord {
  runId: string
  timestamp: string
  inputPrompt: string
  extractedParameters: NlpExtraction
  solverStatus: string
  objective: number
  solutionVector: number[]
  solverMetrics: SolverMetrics
  verificationMetrics: {
    equalityResidual: number | null
    inequalityViolation: number | null
    boundViolation: number | null
    finalViolationFp64: number
    certified: boolean | null
    source: DataSource
  }
  device: string
  certificationStatus: string
}
