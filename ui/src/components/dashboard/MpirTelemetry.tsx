import ReactECharts from 'echarts-for-react'
import { MetricCard } from '@/components/shared/MetricCard'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { formatScientific } from '@/lib/formatters'
import type { GpuTelemetrySeries } from '@/types/telemetry'

export function MpirTelemetry({ telemetry }: { telemetry: GpuTelemetrySeries }) {
  const residual = telemetry.residual.map((point) => point.value)
  const inner = telemetry.iterations.map((point) => Math.max(point.value, 1e-8))
  const option = { animation: false, grid: { top: 24, right: 20, bottom: 28, left: 52 }, tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: telemetry.residual.map((point) => point.index), show: false }, yAxis: { type: 'log', name: 'residual', splitLine: { lineStyle: { color: '#e2e8f0' } } }, series: [{ name: 'FP32 inner', type: 'line', data: inner, showSymbol: false, lineStyle: { color: '#0284c7' } }, { name: 'FP64 outer residual', type: 'line', data: residual, showSymbol: false, step: 'middle', lineStyle: { color: '#059669' } }] }
  return <section className="space-y-4"><SectionHeader eyebrow="MPIR tensor-core telemetry" title="Mixed-precision convergence" description="FP32 inner projections converge under FP64 residual correction." /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><MetricCard label="Ruiz condition" value="κ(A) → 1.02" source="SIMULATED" /><MetricCard label="VRAM bandwidth" value="742 GB/s" source="SIMULATED" /><MetricCard label="Operator norm" value="0.984" source="SIMULATED" /><MetricCard label="Primal step τ" value="0.125" source="SIMULATED" /></div><div className="panel h-[320px] p-4"><ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} /></div><p className="font-mono text-xs text-ink-muted">Final FP64 residual: {formatScientific(telemetry.seededFrom.finalViolation)}</p></section>
}
