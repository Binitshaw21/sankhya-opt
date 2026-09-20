import { DataSourceBadge } from '@/components/shared/DataSourceBadge'
import { MetricCard } from '@/components/shared/MetricCard'
import { formatCurrencyINR, formatMs, formatScientific } from '@/lib/formatters'
import type { SolverMetrics } from '@/types/solver'

export function SolverMetricsPanel({ metrics }: { metrics: SolverMetrics }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">Optimization result</h2>
        <DataSourceBadge source="LIVE" />
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <MetricCard
          label="Optimal objective"
          value={formatCurrencyINR(metrics.optimal_objective)}
          hint="Returned by MPIR as optimal_objective"
          source="LIVE"
          className="lg:col-span-1"
        />
        <MetricCard label="Status" value={metrics.status} source="LIVE" />
        <MetricCard label="Solve time" value={formatMs(metrics.solve_time_ms)} source="LIVE" />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Device" value={metrics.device} source="LIVE" />
        <MetricCard label="Outer refinements" value={metrics.outer_refinements} source="LIVE" />
        <MetricCard label="Inner iterations" value={metrics.total_inner_iterations} source="LIVE" />
        <MetricCard
          label="Final violation"
          value={formatScientific(metrics.final_violation_fp64)}
          hint="FP64 residual from solver_metrics"
          source="LIVE"
        />
      </div>
    </section>
  )
}
