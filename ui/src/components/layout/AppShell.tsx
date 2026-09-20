import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

const PAGE_META: Record<string, { title: string; description: string }> = {
  '/app/command-center': {
    title: 'Command Center',
    description: 'Industrial optimization control room',
  },
  '/app/gpu-compute': {
    title: 'GPU Compute',
    description: 'HPC monitoring console for MPIR execution',
  },
  '/app/milp-search': {
    title: 'MILP Search',
    description: 'Branch-and-bound search visualization',
  },
  '/app/optnet-lab': {
    title: 'OptNet AI Lab',
    description: 'Differentiable optimization research bench',
  },
  '/app/kkt-certification': {
    title: 'KKT Certification',
    description: 'Mathematical verification of the returned plan',
  },
}

export function AppShell() {
  const [navOpen, setNavOpen] = useState(false)
  const location = useLocation()
  const meta = PAGE_META[location.pathname] ?? {
    title: 'SANKHYA-OPT',
    description: 'Sovereign optimization engine',
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-canvas focus:px-3 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={meta.title}
          description={meta.description}
          onMenu={() => setNavOpen(true)}
        />
        <main id="main" className="flex-1 overflow-y-auto px-4 py-5 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
