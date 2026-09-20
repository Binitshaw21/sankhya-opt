import type { SolverStatus } from '@/types/solver'

export function isBusyStatus(status: SolverStatus): boolean {
  return (
    status === 'TRANSLATING' ||
    status === 'MODEL_READY' ||
    status === 'SOLVING' ||
    status === 'REFINING' ||
    status === 'VERIFYING'
  )
}

export function statusCopy(status: SolverStatus): { title: string; detail: string } {
  switch (status) {
    case 'IDLE':
      return {
        title: 'IDLE',
        detail: 'Waiting for a refinery command.',
      }
    case 'TRANSLATING':
      return {
        title: 'TRANSLATING',
        detail: 'Parsing refinery command and running the MPIR solve as one request.',
      }
    case 'MODEL_READY':
      return {
        title: 'MODEL READY',
        detail: 'Constraint extraction complete.',
      }
    case 'SOLVING':
      return {
        title: 'SOLVING',
        detail: 'Running GPU/CPU optimization.',
      }
    case 'REFINING':
      return {
        title: 'REFINING',
        detail: 'Mixed-precision iterative refinement.',
      }
    case 'VERIFYING':
      return {
        title: 'VERIFYING',
        detail: 'Checking constraint residuals.',
      }
    case 'COMPLETED':
      return {
        title: 'COMPLETED',
        detail: 'Solver returned a converged plan. Review constraints and KKT.',
      }
    case 'SUBOPTIMAL':
      return {
        title: 'SUBOPTIMAL',
        detail: 'Solver returned a feasible but unconverged plan.',
      }
    case 'INFEASIBLE':
      return {
        title: 'INFEASIBLE',
        detail: 'No feasible plan for the stated constraints.',
      }
    case 'ERROR':
      return {
        title: 'ERROR',
        detail: 'The engine request failed.',
      }
  }
}

export function mapSolverResultStatus(status: string): SolverStatus {
  const normalized = status.toUpperCase()
  if (normalized.includes('INFEAS')) return 'INFEASIBLE'
  if (normalized.includes('SUBOPT')) return 'SUBOPTIMAL'
  if (normalized.includes('OPTIMAL') || normalized.includes('CONVERGED')) return 'COMPLETED'
  return 'COMPLETED'
}

export function buttonLabel(status: SolverStatus): string {
  if (isBusyStatus(status)) return 'RUNNING OPTIMIZATION...'
  if (status === 'COMPLETED') return 'RUN SANKHYA-OPT'
  if (status === 'SUBOPTIMAL') return 'RE-SOLVE'
  if (status === 'INFEASIBLE') return 'REVISE AND SOLVE'
  if (status === 'ERROR') return 'RETRY SOLVE'
  return 'RUN SANKHYA-OPT'
}
