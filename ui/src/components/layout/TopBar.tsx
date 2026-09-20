import { Menu } from 'lucide-react'
import { SystemStatus } from '@/components/layout/SystemStatus'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { SolverStatus } from '@/components/shared/SolverStatus'
import { useSolverStore } from '@/context/SolverContext'
import { formatRunId, formatTimestamp } from '@/lib/formatters'

export function TopBar({
  title,
  description,
  onMenu,
}: {
  title: string
  description: string
  onMenu: () => void
}) {
  const { solverStatus, runId, timestamp } = useSolverStore()

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/95 backdrop-blur-sm">
      <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-start lg:justify-between lg:px-6">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="mt-1 rounded-md border border-line p-1.5 text-ink lg:hidden"
            onClick={onMenu}
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink lg:text-[32px]">
              {title}
            </h1>
            <p className="mt-1 text-sm text-ink-secondary">{description}</p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 lg:items-end">
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SystemStatus />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3 text-[11px] text-ink-muted">
            <span>
              Run ID <span className="font-mono text-ink">{formatRunId(runId)}</span>
            </span>
            <span>
              Time <span className="font-mono text-ink">{formatTimestamp(timestamp)}</span>
            </span>
            <SolverStatus status={solverStatus} compact />
          </div>
        </div>
      </div>
    </header>
  )
}
