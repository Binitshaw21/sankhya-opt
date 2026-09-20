import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { ConvergenceChart } from '@/components/gpu-telemetry/ConvergenceChart'
import { DataSourceBadge } from '@/components/shared/DataSourceBadge'
import { MetricCard } from '@/components/shared/MetricCard'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { useTheme } from '@/context/useTheme'
import { chartColors, getChartBase } from '@/lib/theme'
import { formatNumber, formatScientific } from '@/lib/formatters'
import type { GpuTelemetrySeries } from '@/types/telemetry'

function lineChart(
  title: string,
  data: Array<{ index: number; value: number }>,
  color: string,
  theme: 'light' | 'dark',
  yMax?: number,
) {
  const base = getChartBase(theme)
  const colors = chartColors(theme)
  return {
    ...base,
    title: { text: title, left: 0, top: 0, textStyle: { fontSize: 11, color: colors.muted, fontWeight: 600 } },
    grid: { ...base.grid, top: 32 },
    xAxis: {
      type: 'category',
      data: data.map((point) => point.index),
      ...base.xAxis,
    },
    yAxis: {
      type: 'value',
      max: yMax,
      ...base.yAxis,
    },
    series: [
      {
        type: 'line',
        showSymbol: false,
        data: data.map((point) => Number(point.value.toFixed(2))),
        lineStyle: { width: 1.4, color },
        itemStyle: { color },
      },
    ],
  }
}

export function GPUTelemetry({ telemetry }: { telemetry: GpuTelemetrySeries }) {
  const { theme } = useTheme()
  const colors = chartColors(theme)
  const peak = (points: Array<{ value: number }>) =>
    points.reduce((max, point) => Math.max(max, point.value), 0)
  const lastGpu = peak(telemetry.gpuUtilization)
  const lastVram = peak(telemetry.vramUtilization)
  const lastTensor = peak(telemetry.tensorCoreUtilization)
  const lastResidual = telemetry.residual.at(-1)?.value ?? 0

  const gpuOpt = useMemo(
    () => lineChart('GPU utilization (%)', telemetry.gpuUtilization, colors.blue, theme, 100),
    [colors.blue, telemetry.gpuUtilization, theme],
  )
  const vramOpt = useMemo(
    () => lineChart('VRAM utilization (%)', telemetry.vramUtilization, colors.green, theme, 100),
    [colors.green, telemetry.vramUtilization, theme],
  )
  const tensorOpt = useMemo(
    () => lineChart('Tensor core utilization (%)', telemetry.tensorCoreUtilization, colors.orange, theme, 100),
    [colors.orange, telemetry.tensorCoreUtilization, theme],
  )
  const iterOpt = useMemo(
    () => lineChart('Solver iteration timeline', telemetry.iterations, colors.green, theme),
    [colors.green, telemetry.iterations, theme],
  )

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="HPC console"
        title="Compute telemetry"
        description="Series are reconstructed from the last live solve metrics. The engine does not currently stream GPU counters."
        actions={<DataSourceBadge source="SIMULATED" />}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Peak GPU utilization" value={`${formatNumber(lastGpu, 1)}%`} source="SIMULATED" />
        <MetricCard label="Peak VRAM usage" value={`${formatNumber(lastVram, 1)}%`} source="SIMULATED" />
        <MetricCard label="Peak tensor cores" value={`${formatNumber(lastTensor, 1)}%`} source="SIMULATED" />
        <MetricCard label="Residual" value={formatScientific(lastResidual)} source="SIMULATED" />
      </div>
      <p className="text-xs text-ink-muted">
        Seeded from device {telemetry.seededFrom.device}, {telemetry.seededFrom.innerIterations} inner iterations,{' '}
        {telemetry.seededFrom.solveTimeMs.toFixed(1)} ms solve time.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-4">
          <div className="h-[220px]" role="img" aria-label="GPU utilization over time">
            <ReactECharts key={`gpu-${theme}`} option={gpuOpt} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} notMerge />
          </div>
        </div>
        <div className="panel p-4">
          <div className="h-[220px]" role="img" aria-label="VRAM utilization over time">
            <ReactECharts key={`vram-${theme}`} option={vramOpt} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} notMerge />
          </div>
        </div>
        <div className="panel p-4">
          <div className="h-[220px]" role="img" aria-label="Tensor core utilization">
            <ReactECharts key={`tensor-${theme}`} option={tensorOpt} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} notMerge />
          </div>
        </div>
        <div className="panel p-4">
          <div className="h-[220px]" role="img" aria-label="Solver iteration timeline">
            <ReactECharts key={`iter-${theme}`} option={iterOpt} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} notMerge />
          </div>
        </div>
      </div>
      <div className="panel p-4">
        <p className="label-caps mb-2">Residual convergence</p>
        <p className="mb-3 text-xs text-ink-secondary">
          Iteration sample versus residual, decaying toward the live FP64 violation and the 1×10⁻⁶ tolerance.
        </p>
        <ConvergenceChart residual={telemetry.residual} />
      </div>
    </div>
  )
}
