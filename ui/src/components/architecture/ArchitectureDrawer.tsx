import { ArchitectureFlow } from '@/components/architecture/ArchitectureFlow'
import { useSolverStore } from '@/context/SolverContext'

export function ArchitectureDrawer() {
  const { architectureOpen, setArchitectureOpen } = useSolverStore()
  if (!architectureOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40">
      <button
        type="button"
        className="h-full flex-1 cursor-default"
        aria-label="Close architecture drawer"
        onClick={() => setArchitectureOpen(false)}
      />
      <div className="flex h-full w-full max-w-3xl flex-col border-l border-line bg-canvas">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="label-caps">System architecture</p>
            <h2 className="text-lg font-semibold text-ink">Computational pipeline</h2>
          </div>
          <button
            type="button"
            className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em]"
            onClick={() => setArchitectureOpen(false)}
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 p-4">
          <ArchitectureFlow />
        </div>
      </div>
    </div>
  )
}
