import { cn } from '@/lib/utils'
import type { DataSource } from '@/types/solver'

const COPY: Record<DataSource, { label: string; className: string }> = {
  LIVE: {
    label: 'LIVE',
    className: 'border-brand/30 bg-brand-soft text-brand',
  },
  DERIVED: {
    label: 'DERIVED',
    className: 'border-info/20 bg-info-soft text-info',
  },
  SIMULATED: {
    label: 'SIMULATED',
    className: 'border-warn/20 bg-warn-soft text-warn',
  },
}

export function DataSourceBadge({ source, className }: { source: DataSource; className?: string }) {
  const item = COPY[source]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]',
        item.className,
        className,
      )}
    >
      {item.label}
    </span>
  )
}
