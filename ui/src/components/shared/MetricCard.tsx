import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { DataSourceBadge } from '@/components/shared/DataSourceBadge'
import type { DataSource } from '@/types/solver'

export function MetricCard({
  label,
  value,
  hint,
  source,
  className,
  children,
}: {
  label: string
  value: ReactNode
  hint?: string
  source?: DataSource
  className?: string
  children?: ReactNode
}) {
  return (
    <div className={cn('panel p-4', className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="label-caps">{label}</p>
        {source ? <DataSourceBadge source={source} /> : null}
      </div>
      <div className="mt-2 font-mono text-2xl font-medium tabular-nums tracking-tight text-ink">{value}</div>
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
      {children}
    </div>
  )
}
