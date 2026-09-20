import { API_BASE_URL } from '@/lib/constants'
import type { ApiError } from '@/types/solver'

export function getApiBaseUrl(): string {
  return API_BASE_URL
}

export class SolverApiError extends Error {
  readonly error: ApiError

  constructor(error: ApiError) {
    super(error.message)
    this.name = 'SolverApiError'
    this.error = error
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit,
  guard: (value: unknown) => value is T,
): Promise<T> {
  const endpoint = `${API_BASE_URL}${path}`
  let response: Response

  try {
    response = await fetch(endpoint, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    })
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : 'Network request failed'
    throw new SolverApiError({
      kind: 'NETWORK',
      message: 'The optimization engine could not be reached.',
      endpoint,
      detail,
    })
  }

  if (!response.ok) {
    let detail: string | undefined
    try {
      const body = await response.text()
      detail = body.slice(0, 500)
    } catch {
      detail = undefined
    }
    throw new SolverApiError({
      kind: 'HTTP',
      message: `Engine returned HTTP ${response.status}.`,
      endpoint,
      statusCode: response.status,
      detail,
    })
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new SolverApiError({
      kind: 'MALFORMED',
      message: 'Engine returned a non-JSON response.',
      endpoint,
      statusCode: response.status,
    })
  }

  if (!guard(payload)) {
    throw new SolverApiError({
      kind: 'MALFORMED',
      message: 'Engine response did not match the expected solve schema.',
      endpoint,
      statusCode: response.status,
    })
  }

  return payload
}
