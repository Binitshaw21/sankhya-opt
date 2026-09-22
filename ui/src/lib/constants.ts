export const APP_NAME = 'SANKHYA-OPT'
export const APP_VERSION = '0.2.0'
export const APP_MARK = 'CYPHER'

export const DEFAULT_PROMPT =
  'Keep sulfur below 18.5, maintain octane above 46000, and limit reforming capacity to 500 barrels/day.'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || ''

export const TRANSLATE_AND_SOLVE_PATH = '/api/slm/translate-and-solve'
export const HEALTH_PATH = '/api/system/status'

export const KKT_TOLERANCE = 1e-6

export const PIPELINE_STAGES = [
  { id: 'input', label: 'Input' },
  { id: 'translation', label: 'Translation' },
  { id: 'optimization', label: 'Optimization' },
  { id: 'computation', label: 'Computation' },
  { id: 'verification', label: 'Verification' },
  { id: 'decision', label: 'Decision' },
] as const
