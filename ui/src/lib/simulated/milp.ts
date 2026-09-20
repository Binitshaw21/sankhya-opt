import { DECISION_VARIABLES } from '@/lib/model'
import type { MilpTree } from '@/types/milp'
import type { SolverMetrics } from '@/types/solver'

/**
 * Illustrative branch-and-bound tree seeded from the live objective and CDU modes.
 * The REST API does not currently return a search tree.
 */
export function buildMilpTree(metrics: SolverMetrics): MilpTree {
  const objective = metrics.optimal_objective
  const x = metrics.solution_vector
  const modeA = x[4] ?? 0
  const modeB = x[5] ?? 0
  const branched = modeA >= modeB ? DECISION_VARIABLES[4] : DECISION_VARIABLES[5]
  const fractional = modeA >= modeB ? modeA : modeB

  const rootObj = objective * 0.92
  const downObj = objective * 1.18
  const upObj = objective * 0.97
  const integerObj = objective

  return {
    nodes: [
      {
        id: 'root',
        position: { x: 360, y: 8 },
        data: {
          nodeId: 'N00',
          title: 'Root LP Relaxation',
          objective: rootObj,
          bound: rootObj,
          status: 'FRACTIONAL',
          depth: 0,
          decisionVariable: null,
          kind: 'root',
        },
      },
      {
        id: 'frac',
        position: { x: 360, y: 200 },
        data: {
          nodeId: 'N01',
          title: 'Fractional Solution',
          objective: rootObj,
          bound: rootObj,
          status: 'FRACTIONAL',
          depth: 1,
          decisionVariable: branched.name,
          kind: 'relaxation',
        },
      },
      {
        id: 'branch',
        position: { x: 360, y: 392 },
        data: {
          nodeId: 'N02',
          title: 'GNN-Guided Branch',
          objective: null,
          bound: rootObj,
          status: 'BRANCHING',
          depth: 2,
          decisionVariable: branched.name,
          kind: 'active',
        },
      },
      {
        id: 'down',
        position: { x: 80, y: 600 },
        data: {
          nodeId: 'N03',
          title: `${branched.name} = 0`,
          objective: downObj,
          bound: downObj,
          status: 'PRUNED',
          depth: 3,
          decisionVariable: `${branched.technicalName} = 0`,
          kind: 'pruned',
        },
      },
      {
        id: 'up',
        position: { x: 640, y: 600 },
        data: {
          nodeId: 'N04',
          title: `${branched.name} = 1`,
          objective: upObj,
          bound: upObj,
          status: 'RELAXATION',
          depth: 3,
          decisionVariable: `${branched.technicalName} = 1`,
          kind: 'relaxation',
        },
      },
      {
        id: 'integer',
        position: { x: 640, y: 792 },
        data: {
          nodeId: 'N05',
          title: 'Integer Solution',
          objective: integerObj,
          bound: integerObj,
          status: 'INTEGER FEASIBLE',
          depth: 4,
          decisionVariable: branched.name,
          kind: 'integer_feasible',
        },
      },
      {
        id: 'opt',
        position: { x: 640, y: 984 },
        data: {
          nodeId: 'N06',
          title: 'Optimal Integer Plan',
          objective: integerObj,
          bound: integerObj,
          status: 'OPTIMAL',
          depth: 5,
          decisionVariable: branched.name,
          kind: 'optimal',
        },
      },
    ],
    edges: [
      { id: 'e-root-frac', source: 'root', target: 'frac' },
      { id: 'e-frac-branch', source: 'frac', target: 'branch', label: 'heuristic' },
      { id: 'e-branch-down', source: 'branch', target: 'down', label: 'down' },
      { id: 'e-branch-up', source: 'branch', target: 'up', label: 'up' },
      { id: 'e-up-int', source: 'up', target: 'integer' },
      { id: 'e-int-opt', source: 'integer', target: 'opt' },
    ],
    selectedVariable: branched.name,
    heuristicScore: Number((0.42 + (fractional % 1) * 0.21).toFixed(3)),
    fractionalValue: fractional,
    source: 'SIMULATED',
    note: 'GNN prototype uses random weights and behaves approximately like random branching. Scores are heuristic, not trained confidence.',
  }
}
