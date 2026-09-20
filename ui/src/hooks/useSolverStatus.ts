import { useSolverStore } from '@/context/SolverContext'
import { isBusyStatus, statusCopy } from '@/lib/status'

export function useSolverStatus() {
  const { solverStatus, requestStartedAt } = useSolverStore()
  return {
    solverStatus,
    busy: isBusyStatus(solverStatus),
    copy: statusCopy(solverStatus),
    requestStartedAt,
  }
}
