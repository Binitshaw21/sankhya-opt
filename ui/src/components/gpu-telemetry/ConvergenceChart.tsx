import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useTheme } from '@/context/useTheme'
import { KKT_TOLERANCE } from '@/lib/constants'
import { chartColors, getChartBase } from '@/lib/theme'
import type { TelemetryPoint } from '@/types/telemetry'

export function ConvergenceChart({ residual }: { residual: TelemetryPoint[] }) {
  const { theme } = useTheme()
  const option = useMemo(() => {
    const base = getChartBase(theme)
    const colors = chartColors(theme)
    return {
      ...base,
      tooltip: {
        ...base.tooltip,
        valueFormatter: (value: number) => value.toExponential(3),
      },
      xAxis: {
        type: 'category',
        data: residual.map((point) => point.index),
        name: 'Iteration sample',
        ...base.xAxis,
      },
      yAxis: {
        type: 'log',
        name: 'Residual',
        ...base.yAxis,
        axisLabel: {
          ...base.yAxis.axisLabel,
          formatter: (value: number) => value.toExponential(0),
        },
      },
      series: [
        {
          name: 'Residual',
          type: 'line',
          showSymbol: false,
          data: residual.map((point) => point.value),
          lineStyle: { width: 1.5, color: colors.green },
          itemStyle: { color: colors.green },
          markLine: {
            symbol: 'none',
            data: [{ yAxis: KKT_TOLERANCE, name: 'Tolerance' }],
            lineStyle: { color: colors.orange, type: 'dashed', width: 1 },
            label: { formatter: 'tol 1e-6', color: colors.orange, fontSize: 10 },
          },
        },
      ],
    }
  }, [residual, theme])

  return (
    <div className="h-[280px]" role="img" aria-label="Residual convergence toward solver tolerance">
      <ReactECharts
        key={theme}
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'svg' }}
        notMerge
      />
    </div>
  )
}
