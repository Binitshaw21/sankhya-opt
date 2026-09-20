import type { DataSource } from '@/types/solver'

export const MILP_NODE_KINDS = [
  'root',
  'active',
  'pruned',
  'infeasible',
  'integer_feasible',
  'optimal',
  'relaxation',
] as const

export type MilpNodeKind = (typeof MILP_NODE_KINDS)[number]

export interface MilpNodeData {
  nodeId: string
  title: string
  objective: number | null
  bound: number | null
  status: string
  depth: number
  decisionVariable: string | null
  kind: MilpNodeKind
}

export interface MilpTree {
  nodes: Array<{
    id: string
    position: { x: number; y: number }
    data: MilpNodeData
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    label?: string
  }>
  selectedVariable: string
  heuristicScore: number
  fractionalValue: number
  source: DataSource
  note: string
}
