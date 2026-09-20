import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { SolverProvider, useSolverStore } from '@/context/SolverContext'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { LoginPage } from '@/components/auth/LoginPage'
import { SignUpPage } from '@/components/auth/SignUpPage'
import 'reactflow/dist/style.css'

const Landing = lazy(() => import('@/pages/Landing'))
const CommandCenter = lazy(() => import('@/pages/CommandCenter'))
const GPUCompute = lazy(() => import('@/pages/GPUCompute'))
const MILPSearch = lazy(() => import('@/pages/MILPSearch'))
const OptNetLab = lazy(() => import('@/pages/OptNetLab'))
const KKTCertification = lazy(() => import('@/pages/KKTCertification'))
const EnterpriseInsights = lazy(() => import('@/pages/EnterpriseInsights'))
const ArchitectureDrawer = lazy(() =>
  import('@/components/architecture/ArchitectureDrawer').then((mod) => ({
    default: mod.ArchitectureDrawer,
  })),
)

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-ink-muted">
      Loading console…
    </div>
  )
}

function ArchitectureGate() {
  const { architectureOpen } = useSolverStore()
  if (!architectureOpen) return null
  return (
    <Suspense fallback={null}>
      <ArchitectureDrawer />
    </Suspense>
  )
}

function ProtectedConsole() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <AppShell />
}

export default function App() {
  return (
    <AuthProvider>
      <SolverProvider>
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/app" element={<ProtectedConsole />}>
              <Route index element={<Navigate to="command-center" replace />} />
              <Route path="command-center" element={<CommandCenter />} />
              <Route path="gpu-compute" element={<GPUCompute />} />
              <Route path="milp-search" element={<MILPSearch />} />
              <Route path="optnet-lab" element={<OptNetLab />} />
              <Route path="kkt-certification" element={<KKTCertification />} />
              <Route path="enterprise-insights" element={<EnterpriseInsights />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <ArchitectureGate />
        </BrowserRouter>
      </SolverProvider>
    </AuthProvider>
  )
}
