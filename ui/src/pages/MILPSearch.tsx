import { MILPSearchTree } from '@/components/milp/MILPSearchTree'
import { EmptyState } from '@/components/shared/EmptyState'
import { useMilpTree } from '@/hooks/useMilpTree'

export default function MILPSearch() {
  const { milpTree } = useMilpTree()

  if (!milpTree) {
    return (
      <EmptyState
        title="No branch-and-bound session active."
        description="The REST API does not return a search tree. After a live solve, this console shows a simulated tree seeded from the returned objective and CDU modes."
      />
    )
  }

  return <MILPSearchTree tree={milpTree} />
}
