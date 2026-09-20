import { NavLink } from 'react-router-dom'
import {
  Cpu,
  FileCheck2,
  GitBranch,
  LayoutDashboard,
  Network,
  X,
} from 'lucide-react'
import { SystemStatus } from '@/components/layout/SystemStatus'
import { SankhyaMark } from '@/components/shared/Mark'
import { useSolverStore } from '@/context/SolverContext'
import { APP_MARK, APP_NAME, APP_VERSION } from '@/lib/constants'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/app/command-center', index: '01', label: 'Command Center', icon: LayoutDashboard },
  { to: '/app/gpu-compute', index: '02', label: 'GPU Compute', icon: Cpu },
  { to: '/app/milp-search', index: '03', label: 'MILP Search', icon: GitBranch },
  { to: '/app/optnet-lab', index: '04', label: 'OptNet AI Lab', icon: Network },
  { to: '/app/kkt-certification', index: '05', label: 'KKT Certification', icon: FileCheck2 },
]

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { setArchitectureOpen } = useSolverStore()

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/40 lg:hidden',
          open ? 'block' : 'hidden',
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[232px] flex-col border-r border-line bg-canvas lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-4">
          <NavLink to="/" className="flex items-center gap-2" onClick={onClose}>
            <SankhyaMark className="h-8 w-8" />
            <div>
              <p className="text-sm font-semibold tracking-tight text-ink">{APP_NAME}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">Optimization engine</p>
            </div>
          </NavLink>
          <button
            type="button"
            className="rounded-md p-1 text-ink-muted lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary">
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-md px-2 py-2 text-[13px] transition-colors',
                      isActive
                        ? 'bg-brand-soft text-brand font-semibold'
                        : 'text-ink-secondary hover:bg-surface hover:text-ink',
                    )
                  }
                >
                  <span className="w-5 font-mono text-[10px] text-ink-muted">{item.index}</span>
                  <item.icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-8 px-2">
            <p className="label-caps mb-3">System</p>
            <SystemStatus compact />
            <button
              type="button"
              onClick={() => {
                setArchitectureOpen(true)
                onClose()
              }}
              className="mt-4 w-full rounded-md border border-line px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-secondary hover:bg-surface"
            >
              View pipeline
            </button>
          </div>
        </nav>

        <div className="border-t border-line px-4 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">{APP_MARK}</p>
          <p className="mt-1 text-xs font-semibold text-ink">{APP_NAME}</p>
          <p className="font-mono text-[11px] text-ink-muted">v{APP_VERSION}</p>
          <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-ink-muted">
            Air-gapped · Local API · No cloud dependency
          </p>
        </div>
      </aside>
    </>
  )
}
