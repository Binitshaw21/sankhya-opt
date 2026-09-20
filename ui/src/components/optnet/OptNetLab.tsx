import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { DataSourceBadge } from '@/components/shared/DataSourceBadge'
import { MetricCard } from '@/components/shared/MetricCard'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { TechnicalLog } from '@/components/shared/TechnicalLog'
import { useTheme } from '@/context/useTheme'
import { DECISION_VARIABLES } from '@/lib/model'
import { chartColors, getChartBase } from '@/lib/theme'
import { formatNumber } from '@/lib/formatters'
import type { OptNetDemoState } from '@/types/telemetry'

export function OptNetLabView({
  state,
  canRun,
  onForward,
  onBackward,
}: {
  state: OptNetDemoState
  canRun: boolean
  onForward: () => void
  onBackward: () => void
}) {
  const { theme } = useTheme()
  const heatmap = useMemo(() => {
    const data: Array<[number, number, number]> = []
    const base = getChartBase(theme)
    const colors = chartColors(theme)
    state.dL_dA.forEach((row, y) => {
      row.forEach((value, x) => data.push([x, y, value]))
    })
    return {
      ...base,
      tooltip: { position: 'top' as const },
      grid: { top: 20, right: 16, bottom: 40, left: 48 },
      xAxis: {
        type: 'category',
        data: DECISION_VARIABLES.map((variable) => variable.name.split(' ')[0]),
        axisLabel: { fontSize: 9, color: colors.muted },
      },
      yAxis: {
        type: 'category',
        data: ['sulfur', 'octane', 'cdu'],
        axisLabel: { fontSize: 10, color: colors.muted },
      },
      visualMap: {
        min: -0.2,
        max: 0.2,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
        inRange: { color: [colors.danger, colors.canvas, colors.green] },
        textStyle: { fontSize: 10, color: colors.muted },
      },
      series: [{ type: 'heatmap', data, label: { show: true, fontSize: 9 } }],
    }
  }, [state.dL_dA, theme])

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Research laboratory"
        title="Differentiable optimization"
        description="Market signal → cost prediction → implicit KKT differentiation. Demonstration only."
        actions={<DataSourceBadge source="SIMULATED" />}
      />
      <ol className="grid gap-2 text-xs sm:grid-cols-5">
        {['Market signals', 'Cost prediction', 'Differentiable optimization', 'Optimal plan', 'Gradient backprop'].map(
          (step, index) => (
            <li key={step} className="rounded-md border border-line bg-surface px-3 py-2">
              <span className="font-mono text-[10px] text-ink-muted">0{index + 1}</span>
              <p className="mt-1 font-medium text-ink">{step}</p>
            </li>
          ),
        )}
      </ol>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Gradient norm" value={state.gradientNorm == null ? '—' : formatNumber(state.gradientNorm, 4)} source="SIMULATED" />
        <MetricCard label="Jacobian peak" value={state.jacobianPeak == null ? '—' : formatNumber(state.jacobianPeak, 4)} source="SIMULATED" />
        <MetricCard label="dL/db[0]" value={state.dL_db[0] == null ? '—' : formatNumber(state.dL_db[0], 4)} source="SIMULATED" />
        <MetricCard label="dL/dc[0]" value={state.dL_dc[0] == null ? '—' : formatNumber(state.dL_dc[0], 4)} source="SIMULATED" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-4">
          <p className="label-caps mb-2">Jacobian heatmap dL/dA</p>
          <div className="h-[280px]" role="img" aria-label="Jacobian heatmap of dL/dA">
            {state.dL_dA.length > 0 ? (
              <ReactECharts key={theme} option={heatmap} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} notMerge />
            ) : (
              <div className="flex h-full items-center text-sm text-ink-muted">Run a forward/backward demonstration after a live solve.</div>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <TechnicalLog title="Execution log">
{`FORWARD PASS
${state.status === 'IDLE' ? 'Waiting for demonstration' : 'Optimization solved (local demo)'}

BACKWARD PASS
${state.status === 'COMPLETE' ? 'Computing implicit gradients' : 'Idle'}

KKT SYSTEM
${state.status === 'COMPLETE' ? 'Differentiation complete' : 'Not executed'}

NOTE
${state.note}`}
          </TechnicalLog>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!canRun}
              onClick={onForward}
              className="rounded-md border border-line bg-canvas px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink disabled:opacity-40"
            >
              Forward pass
            </button>
            <button
              type="button"
              disabled={!canRun}
              onClick={onBackward}
              className="rounded-md border border-line bg-canvas px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink disabled:opacity-40"
            >
              Backward pass
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
