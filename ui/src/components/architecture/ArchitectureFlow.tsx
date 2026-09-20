import { useMemo } from 'react'
import ReactFlow, { Background, Handle, MarkerType, Position, type Edge, type Node } from 'reactflow'
import { useSolverStore } from '@/context/SolverContext'
import { useTheme } from '@/context/useTheme'
import { getFlowChrome } from '@/lib/theme'
import { isBusyStatus } from '@/lib/status'

type ArchStatus = 'idle' | 'active' | 'complete' | 'error'

function ArchNode({ data }: { data: { title: string; purpose: string; status: ArchStatus } }) {
  const tone =
    data.status === 'active'
      ? 'border-warn bg-warn-soft'
      : data.status === 'complete'
        ? 'border-brand/40 bg-brand-soft/50'
        : data.status === 'error'
          ? 'border-danger bg-danger-soft'
          : 'border-line bg-canvas'
  return (
    <div className={`w-[220px] rounded-md border px-3 py-2.5 ${tone}`}>
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-line !bg-ink-muted" />
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">{data.status}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{data.title}</p>
      <p className="mt-1 text-[11px] leading-4 text-ink-secondary">{data.purpose}</p>
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-line !bg-ink-muted" />
    </div>
  )
}

const nodeTypes = { arch: ArchNode }

export function ArchitectureFlow() {
  const { solverStatus } = useSolverStore()
  const { theme } = useTheme()
  const chrome = getFlowChrome(theme)
  const busy = isBusyStatus(solverStatus)

  const statuses = useMemo(() => {
    const done = solverStatus === 'COMPLETED' || solverStatus === 'SUBOPTIMAL'
    const failed = solverStatus === 'ERROR' || solverStatus === 'INFEASIBLE'
    const mark = (completeWhen: boolean, activeWhen: boolean): ArchStatus => {
      if (failed && activeWhen) return 'error'
      if (completeWhen) return 'complete'
      if (activeWhen) return 'active'
      return 'idle'
    }
    return {
      user: 'complete' as ArchStatus,
      command: busy || done || failed ? 'complete' : 'idle',
      slm: mark(done || failed, busy),
      model: mark(done, busy),
      presolve: mark(done, busy),
      mpir: mark(done, busy),
      milp: mark(done, false),
      kkt: mark(done, false),
      plan: mark(done && solverStatus === 'COMPLETED', false),
    }
  }, [busy, solverStatus])

  const nodes = useMemo<Node[]>(
    () => [
      { id: 'user', position: { x: 180, y: 0 }, type: 'arch', data: { title: 'User', purpose: 'Refinery planner', status: statuses.user }, draggable: false },
      { id: 'cmd', position: { x: 180, y: 90 }, type: 'arch', data: { title: 'Natural language command', purpose: 'Constraint prompt', status: statuses.command }, draggable: false },
      { id: 'slm', position: { x: 180, y: 180 }, type: 'arch', data: { title: 'LocalRefinerySLM', purpose: 'Natural language → optimization constraints', status: statuses.slm }, draggable: false },
      { id: 'model', position: { x: 180, y: 270 }, type: 'arch', data: { title: 'Mathematical model', purpose: 'c, A, b, bounds', status: statuses.model }, draggable: false },
      { id: 'pre', position: { x: 180, y: 360 }, type: 'arch', data: { title: 'Presolve / conditioning', purpose: 'Matrix scaling before PDHG', status: statuses.presolve }, draggable: false },
      { id: 'mpir', position: { x: 180, y: 450 }, type: 'arch', data: { title: 'MPIR engine', purpose: 'FP32 PDHG + FP64 refinement', status: statuses.mpir }, draggable: false },
      { id: 'milp', position: { x: 180, y: 540 }, type: 'arch', data: { title: 'MILP engine', purpose: 'Branch-and-bound (prototype)', status: statuses.milp }, draggable: false },
      { id: 'kkt', position: { x: 180, y: 630 }, type: 'arch', data: { title: 'KKT verifier', purpose: 'Constraint certification', status: statuses.kkt }, draggable: false },
      { id: 'plan', position: { x: 180, y: 720 }, type: 'arch', data: { title: 'Certified optimal plan', purpose: 'Decision vector + audit', status: statuses.plan }, draggable: false },
    ],
    [statuses],
  )

  const edges = useMemo<Edge[]>(
    () =>
      [
        ['user', 'cmd'],
        ['cmd', 'slm'],
        ['slm', 'model'],
        ['model', 'pre'],
        ['pre', 'mpir'],
        ['mpir', 'milp'],
        ['milp', 'kkt'],
        ['kkt', 'plan'],
      ].map(([source, target]) => ({
        id: `${source}-${target}`,
        source,
        target,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, color: chrome.edge, width: 14, height: 14 },
        style: { stroke: chrome.edge, strokeWidth: 1.2 },
      })),
    [chrome.edge],
  )

  return (
    <div className="h-full min-h-[640px] rounded-md border border-line">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
        key={theme}
      >
        <Background color={chrome.background} gap={18} />
      </ReactFlow>
    </div>
  )
}
