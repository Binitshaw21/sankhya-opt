import { PIPELINE_STAGES } from '@/lib/constants'
import { isBusyStatus } from '@/lib/status'
import type { SolverStatus } from '@/types/solver'

const STAGE_BY_STATUS: Record<SolverStatus, string[]> = {
  IDLE: [],
  TRANSLATING: ['input', 'translation', 'optimization', 'computation'],
  MODEL_READY: ['input', 'translation'],
  SOLVING: ['input', 'translation', 'optimization', 'computation'],
  REFINING: ['input', 'translation', 'optimization', 'computation'],
  VERIFYING: ['input', 'translation', 'optimization', 'computation', 'verification'],
  COMPLETED: ['input', 'translation', 'optimization', 'computation', 'verification', 'decision'],
  SUBOPTIMAL: ['input', 'translation', 'optimization', 'computation', 'verification', 'decision'],
  INFEASIBLE: ['input', 'translation', 'optimization', 'computation', 'verification'],
  ERROR: ['input'],
}

export function LoadingState({
  status,
  elapsedLabel,
}: {
  status: SolverStatus
  elapsedLabel?: string
}) {
  const active = STAGE_BY_STATUS[status]
  const busy = isBusyStatus(status)

  return (
    <div className="panel p-5" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label-caps">{busy ? 'Live request in flight' : 'Pipeline'}</p>
          <h3 className="mt-1 text-sm font-semibold text-ink">
            POST /api/slm/translate-and-solve
          </h3>
          <p className="mt-1 text-xs text-ink-secondary">
            Translation and solve execute as a single REST call. Intermediate GPU ticks are not streamed yet.
          </p>
        </div>
        {elapsedLabel ? <span className="font-mono text-xs text-ink-muted">{elapsedLabel}</span> : null}
      </div>
      <ol className="mt-4 grid gap-2 sm:grid-cols-6">
        {PIPELINE_STAGES.map((stage) => {
          const on = active.includes(stage.id)
          return (
            <li
              key={stage.id}
              className={`rounded-md border px-2 py-2 ${
                on ? 'border-brand/30 bg-brand-soft/60' : 'border-line bg-surface'
              }`}
            >
              <p className="label-caps">{stage.label}</p>
              <p className="mt-1 text-[11px] font-medium text-ink">
                {on ? (busy ? 'In request' : 'Complete') : 'Pending'}
              </p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
