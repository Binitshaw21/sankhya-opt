import { HEALTH_PATH, TRANSLATE_AND_SOLVE_PATH } from '@/lib/constants'
import { apiRequest, getApiBaseUrl, SolverApiError } from '@/api/client'
import type {
  EngineHealth,
  NlpExtraction,
  SolverMetrics,
  TranslateAndSolveResponse,
} from '@/types/solver'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'number' && Number.isFinite(item))
}

function isNlpExtraction(value: unknown): value is NlpExtraction {
  if (!isRecord(value)) return false
  return (
    typeof value.max_sulfur_pool === 'number' &&
    typeof value.min_octane_target === 'number' &&
    typeof value.max_reforming_capacity === 'number'
  )
}

function isSolverMetrics(value: unknown): value is SolverMetrics {
  if (!isRecord(value)) return false
  return (
    typeof value.status === 'string' &&
    typeof value.optimal_objective === 'number' &&
    isNumberArray(value.solution_vector) &&
    typeof value.outer_refinements === 'number' &&
    typeof value.total_inner_iterations === 'number' &&
    typeof value.final_violation_fp64 === 'number' &&
    typeof value.solve_time_ms === 'number' &&
    typeof value.device === 'string'
  )
}

export function isTranslateAndSolveResponse(
  value: unknown,
): value is TranslateAndSolveResponse {
  if (!isRecord(value)) return false
  return isNlpExtraction(value.nlp_extraction) && isSolverMetrics(value.solver_metrics)
}

export async function translateAndSolve(
  prompt: string,
  signal?: AbortSignal,
): Promise<TranslateAndSolveResponse> {
  const trimmed = prompt.trim()
  if (!trimmed) {
    throw new SolverApiError({
      kind: 'INVALID_PROMPT',
      message: 'A natural-language constraint command is required.',
      endpoint: `${getApiBaseUrl()}${TRANSLATE_AND_SOLVE_PATH}`,
    })
  }

  return apiRequest(
    TRANSLATE_AND_SOLVE_PATH,
    {
      method: 'POST',
      body: JSON.stringify({ prompt: trimmed }),
      signal,
    },
    isTranslateAndSolveResponse,
  )
}

export async function checkEngineHealth(signal?: AbortSignal): Promise<EngineHealth> {
  const endpoint = `${getApiBaseUrl()}${HEALTH_PATH}`
  const timestamp = new Date().toISOString()

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      signal,
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) {
      return {
        api: 'DISCONNECTED',
        engine: 'DISCONNECTED',
        device: null,
        lastCheckedAt: timestamp,
        endpoint,
        detail: `HTTP ${response.status}`,
      }
    }
    const payload = (await response.json()) as { device?: unknown }
    return {
      api: 'CONNECTED',
      engine: 'CONNECTED',
      device: typeof payload.device === 'string' ? payload.device : null,
      lastCheckedAt: timestamp,
      endpoint,
    }
  } catch (cause) {
    return {
      api: 'DISCONNECTED',
      engine: 'DISCONNECTED',
      device: null,
      lastCheckedAt: timestamp,
      endpoint,
      detail: cause instanceof Error ? cause.message : 'CONNECTION_REFUSED',
    }
  }
}
