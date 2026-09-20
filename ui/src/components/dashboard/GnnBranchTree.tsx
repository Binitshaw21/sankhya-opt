import { MILPSearchTree } from '@/components/milp/MILPSearchTree'
import type { MilpTree } from '@/types/milp'

export function GnnBranchTree({ tree }: { tree: MilpTree }) {
  return <div className="space-y-3"><div className="panel flex flex-wrap items-center justify-between gap-3 px-4 py-3"><div><p className="label-caps">ML4CO branch policy</p><p className="mt-1 text-sm font-semibold text-ink">x₄ (CDU_Mode_A) · confidence 98.4%</p></div><p className="font-mono text-xs text-ink-secondary">RL4Cut filter ratio 89.4%</p></div><MILPSearchTree tree={tree} /></div>
}
