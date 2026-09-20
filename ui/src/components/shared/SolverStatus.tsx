import { StatusPill } from '@/components/shared/StatusPill'
import { isBusyStatus, statusCopy } from '@/lib/status'
import type { SolverStatus as SolverStatusValue } from '@/types/solver'

export function SolverStatus({
  status,
  compact = false,
}: {
  status: SolverStatusValue
  compact?: boolean
}) {
  const copy = statusCopy(status)
  const tone = isBusyStatus(status)
    ? 'busy'
    : status === 'COMPLETED'
      ? 'ok'
      : status === 'ERROR' || status === 'INFEASIBLE'
        ? 'danger'
        : status === 'SUBOPTIMAL'
          ? 'warn'
          : 'neutral'

  return (
    <div className="flex flex-col items-end gap-1">
      <StatusPill label={copy.title} tone={tone} />
      {compact ? null : (
        <p className="hidden max-w-xs text-right text-[11px] text-ink-muted lg:block">{copy.detail}</p>
      )}
    </div>
  )
}
