import { DataSourceBadge } from '@/components/shared/DataSourceBadge'
import { formatNumber } from '@/lib/formatters'
import type { MilpTree } from '@/types/milp'

export function GNNBranchingPanel({ tree }: { tree: MilpTree }) {
  return (
    <aside className="panel p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="label-caps">GNN-guided branching</p>
          <h3 className="mt-1 text-base font-semibold text-ink">Heuristic branch score</h3>
        </div>
        <DataSourceBadge source="SIMULATED" />
      </div>
      <ol className="mt-4 space-y-1 text-xs text-ink-secondary">
        <li>Variables</li>
        <li className="text-ink-muted">↓</li>
        <li>Constraint graph</li>
        <li className="text-ink-muted">↓</li>
        <li>Message passing</li>
        <li className="text-ink-muted">↓</li>
        <li>Variable scores</li>
        <li className="text-ink-muted">↓</li>
        <li className="font-semibold text-brand">Branch selection</li>
      </ol>
      <dl className="mt-5 space-y-3 text-sm">
        <div>
          <dt className="label-caps">Selected variable</dt>
          <dd className="mt-1 text-ink">{tree.selectedVariable}</dd>
        </div>
        <div>
          <dt className="label-caps">Heuristic branch score</dt>
          <dd className="mt-1 font-mono text-ink">{formatNumber(tree.heuristicScore, 3)}</dd>
        </div>
        <div>
          <dt className="label-caps">Current fractional value</dt>
          <dd className="mt-1 font-mono text-ink">{formatNumber(tree.fractionalValue, 3)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs leading-5 text-ink-muted">{tree.note}</p>
    </aside>
  )
}
