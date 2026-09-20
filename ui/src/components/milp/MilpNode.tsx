import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/formatters'
import type { MilpNodeData, MilpNodeKind } from '@/types/milp'

const KIND_STYLE: Record<MilpNodeKind, string> = {
  root: 'border-ink bg-canvas',
  active: 'border-warn bg-warn-soft',
  pruned: 'border-line bg-surface text-ink-muted',
  infeasible: 'border-danger bg-danger-soft',
  integer_feasible: 'border-brand/40 bg-brand-soft/40',
  optimal: 'border-brand bg-brand-soft',
  relaxation: 'border-line bg-canvas',
}

function MilpNodeInner({ data }: NodeProps<MilpNodeData>) {
  return (
    <div className={cn('w-[210px] rounded-md border px-3 py-2.5 shadow-panel', KIND_STYLE[data.kind])}>
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-ink-muted !border-line" />
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">{data.nodeId}</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em]">{data.status}</p>
      </div>
      <p className="mt-1 text-sm font-semibold leading-tight text-ink">{data.title}</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
        <dt className="text-ink-muted">Objective</dt>
        <dd className="font-mono text-ink">{data.objective == null ? '—' : formatNumber(data.objective, 2)}</dd>
        <dt className="text-ink-muted">Bound</dt>
        <dd className="font-mono text-ink">{data.bound == null ? '—' : formatNumber(data.bound, 2)}</dd>
        <dt className="text-ink-muted">Depth</dt>
        <dd className="font-mono text-ink">{data.depth}</dd>
        <dt className="text-ink-muted">Decision</dt>
        <dd className="truncate text-ink" title={data.decisionVariable ?? undefined}>
          {data.decisionVariable ?? '—'}
        </dd>
      </dl>
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-ink-muted !border-line" />
    </div>
  )
}

export const MilpNode = memo(MilpNodeInner)
