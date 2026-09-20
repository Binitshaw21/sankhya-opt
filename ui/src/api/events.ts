/**
 * Future streaming contract.
 *
 * The current backend exposes a single REST call:
 *   POST /api/slm/translate-and-solve
 *
 * This module documents the event names the UI can subscribe to once
 * WebSocket or SSE is available. Do not open a socket until the engine
 * actually publishes these events.
 */

export const SOLVER_STREAM_EVENTS = [
  'solver.started',
  'translation.completed',
  'solver.iteration',
  'solver.refinement',
  'gpu.telemetry',
  'milp.node_created',
  'milp.node_pruned',
  'solver.verification_started',
  'solver.completed',
  'solver.failed',
  'kkt.completed',
] as const

export type SolverStreamEventName = (typeof SOLVER_STREAM_EVENTS)[number]

export interface SolverStreamEvent<T = unknown> {
  type: SolverStreamEventName
  timestamp: string
  runId: string
  payload: T
}

export type StreamListener = (event: SolverStreamEvent) => void

/**
 * Placeholder transport. Returns a no-op unsubscribe until a real
 * EventSource / WebSocket endpoint exists.
 */
export function subscribeSolverStream(
  url: string | null,
  listener: StreamListener,
): () => void {
  void url
  void listener
  return () => {
    /* no connection in the current REST-only architecture */
  }
}
