import type { ConstraintEvaluation } from '@/types/solver'

function utilization(item: ConstraintEvaluation): number {
  if (item.kind === 'equality') {
    return Math.abs(item.current) <= 1e-6 ? 0 : 120
  }
  if (item.limit === 0) return 0
  return (Math.abs(item.current) / Math.abs(item.limit)) * 100
}

function barColor(item: ConstraintEvaluation): string {
  if (item.tone === 'violated') return 'bg-danger'
  if (item.tone === 'near_limit') return 'bg-warn'
  return 'bg-brand'
}

export function ConstraintSlackChart({ constraints }: { constraints: ConstraintEvaluation[] }) {
  return (
    <div className="space-y-3" role="img" aria-label="Constraint utilization versus published limits">
      {constraints.map((item) => {
        const pct = Math.min(100, utilization(item))
        return (
          <div key={item.id}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <p className="text-sm text-ink">{item.name}</p>
              <p className="font-mono text-[11px] text-ink-muted">{utilization(item).toFixed(1)}%</p>
            </div>
            <div className="h-2 rounded-sm bg-surface-3">
              <div className={`h-2 rounded-sm ${barColor(item)}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
      <p className="text-[11px] text-ink-muted">
        Bar length is utilization versus the extracted limit, capped at 100% of the track. Equalities show 0% if residual is within tolerance.
      </p>
    </div>
  )
}
