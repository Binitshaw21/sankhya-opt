import { ConstraintSlackChart } from '@/components/command-center/ConstraintSlackChart'
import { DataSourceBadge } from '@/components/shared/DataSourceBadge'
import { StatusPill } from '@/components/shared/StatusPill'
import { formatNumber, formatScientific } from '@/lib/formatters'
import type { ConstraintEvaluation } from '@/types/solver'

function toneToPill(tone: ConstraintEvaluation['tone']): 'ok' | 'warn' | 'danger' {
  if (tone === 'violated') return 'danger'
  if (tone === 'near_limit') return 'warn'
  return 'ok'
}

export function ConstraintStatus({ constraints }: { constraints: ConstraintEvaluation[] }) {
  return (
    <section className="panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label-caps">Constraint status</p>
          <h2 className="mt-1 text-lg font-semibold text-ink">Slack against the published model</h2>
          <p className="mt-1 text-xs text-ink-secondary">
            Bars show utilization versus the extracted limits. Equalities use residual magnitude. Derived locally from the live solution — not a backend KKT payload.
          </p>
        </div>
        <DataSourceBadge source="DERIVED" />
      </div>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <ConstraintSlackChart constraints={constraints} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <caption className="sr-only">Constraint slack and satisfaction</caption>
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                <th className="py-2 font-medium">Constraint</th>
                <th className="py-2 font-medium">Current</th>
                <th className="py-2 font-medium">Limit</th>
                <th className="py-2 font-medium">Slack</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {constraints.map((row) => (
                <tr key={row.id} className="border-b border-line/80">
                  <td className="py-2.5 text-ink">{row.name}</td>
                  <td className="py-2.5 font-mono text-xs tabular-nums">
                    {Math.abs(row.current) < 1e-3 ? formatScientific(row.current) : formatNumber(row.current, 2)}
                  </td>
                  <td className="py-2.5 text-xs text-ink-secondary">
                    {row.limitLabel}: {formatNumber(row.limit, 2)}
                  </td>
                  <td className="py-2.5 font-mono text-xs tabular-nums">{formatNumber(row.slack, 3)}</td>
                  <td className="py-2.5">
                    <StatusPill
                      label={row.tone === 'satisfied' ? '✓ Satisfied' : row.tone === 'near_limit' ? 'Near limit' : '✕ Violated'}
                      tone={toneToPill(row.tone)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
