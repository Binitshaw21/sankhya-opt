import { DataSourceBadge } from '@/components/shared/DataSourceBadge'
import { StatusPill } from '@/components/shared/StatusPill'
import { formatNumber, isActiveFlag } from '@/lib/formatters'
import { DECISION_VARIABLES } from '@/lib/model'

export function SolutionVector({ values }: { values: number[] }) {
  const rows = DECISION_VARIABLES.map((variable) => ({
    ...variable,
    value: values[variable.index] ?? 0,
  }))
  const maxValue = Math.max(1, ...rows.map((row) => row.value))

  return (
    <section className="panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label-caps">Solution vector</p>
          <h2 className="mt-1 text-lg font-semibold text-ink">Optimized plan</h2>
        </div>
        <DataSourceBadge source="LIVE" />
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Optimized decision variables</caption>
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              <th className="py-2 font-medium">Variable</th>
              <th className="py-2 font-medium">Optimized value</th>
              <th className="w-[40%] py-2 font-medium">Magnitude</th>
              <th className="py-2 font-medium">Unit</th>
              <th className="py-2 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-line/80" title={row.technicalName}>
                <td className="py-2.5 text-ink">{row.name}</td>
                <td className="py-2.5 font-mono tabular-nums text-ink">{formatNumber(row.value, 2)}</td>
                <td className="py-2.5 pr-4">
                  <div className="h-1.5 w-full rounded-sm bg-surface-3" aria-hidden="true">
                    <div
                      className="h-1.5 rounded-sm bg-brand"
                      style={{ width: `${Math.max(0, (row.value / maxValue) * 100)}%` }}
                    />
                  </div>
                </td>
                <td className="py-2.5 text-ink-secondary">{row.unit}</td>
                <td className="py-2.5">
                  {row.role === 'mode' ? (
                    <StatusPill
                      label={isActiveFlag(row.value) ? 'Active' : 'Inactive'}
                      tone={isActiveFlag(row.value) ? 'ok' : 'neutral'}
                    />
                  ) : (
                    <span className="text-ink-secondary">{row.role}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
