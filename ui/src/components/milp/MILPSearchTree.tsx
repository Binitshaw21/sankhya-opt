import { useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  type Edge,
  type Node,
} from 'reactflow'
import { GNNBranchingPanel } from '@/components/milp/GNNBranchingPanel'
import { MilpNode } from '@/components/milp/MilpNode'
import { DataSourceBadge } from '@/components/shared/DataSourceBadge'
import { useTheme } from '@/context/useTheme'
import { getFlowChrome } from '@/lib/theme'
import type { MilpTree } from '@/types/milp'

const nodeTypes = { milp: MilpNode }

export function MILPSearchTree({ tree }: { tree: MilpTree }) {
  const { theme } = useTheme()
  const chrome = getFlowChrome(theme)
  const nodes = useMemo<Node[]>(
    () =>
      tree.nodes.map((node) => ({
        id: node.id,
        position: node.position,
        data: node.data,
        type: 'milp',
        draggable: false,
      })),
    [tree.nodes],
  )

  const edges = useMemo<Edge[]>(
    () =>
      tree.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, color: chrome.edge, width: 16, height: 16 },
        style: { stroke: chrome.edge, strokeWidth: 1.25 },
        labelStyle: { fontSize: 10, fill: chrome.edgeLabel },
      })),
    [chrome.edge, chrome.edgeLabel, tree.edges],
  )

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
      <section className="panel relative h-[680px] overflow-hidden">
        <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-md border border-line bg-canvas/95 px-3 py-2">
          <p className="text-xs font-semibold text-ink">Branch-and-bound session</p>
          <DataSourceBadge source="SIMULATED" />
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.4}
          maxZoom={1.4}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
          key={theme}
        >
          <Background color={chrome.background} gap={18} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </section>
      <GNNBranchingPanel tree={tree} />
    </div>
  )
}
