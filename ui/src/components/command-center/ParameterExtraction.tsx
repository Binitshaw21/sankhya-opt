import { DataSourceBadge } from '@/components/shared/DataSourceBadge'
import { StatusPill } from '@/components/shared/StatusPill'
import { formatNumber } from '@/lib/formatters'
import type { NlpExtraction } from '@/types/solver'

export function ParameterExtraction({ extraction }: { extraction: NlpExtraction }) {
  const items = [
    { label: 'Max sulfur pool', value: formatNumber(extraction.max_sulfur_pool, 2), unit: 'constraint units' },
    { label: 'Min octane target', value: formatNumber(extraction.min_octane_target, 0), unit: 'octane-bbl' },
    { label: 'Max reforming capacity', value: formatNumber(extraction.max_reforming_capacity, 0), unit: 'bbl/day' },
  ]

  return (
    <section className="panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label-caps">Model translation</p>
          <h2 className="mt-1 text-lg font-semibold text-ink">Constraint extraction</h2>
        </div>
        <div className="flex items-center gap-2">
          <DataSourceBadge source="LIVE" />
          <StatusPill label="Translation complete" tone="ok" />
        </div>
      </div>
      <ol className="mt-4 grid gap-3 text-xs text-ink-secondary sm:grid-cols-3">
        <li className="rounded-md border border-line bg-surface p-3">Natural language</li>
        <li className="rounded-md border border-line bg-surface p-3">Constraint extraction</li>
        <li className="rounded-md border border-brand/20 bg-brand-soft/50 p-3 text-brand">Mathematical model</li>
      </ol>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-md border border-line p-4">
            <p className="label-caps">{item.label}</p>
            <p className="mt-2 font-mono text-2xl font-medium text-ink">{item.value}</p>
            <p className="mt-1 text-xs text-ink-muted">{item.unit}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
