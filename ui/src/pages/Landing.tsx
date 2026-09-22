import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Cpu,
  Factory,
  FileCheck2,
  Fuel,
  GitBranch,
  Landmark,
  LayoutDashboard,
  MessageSquareText,
  Network,
  Shield,
  Zap,
} from 'lucide-react'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { FlipText } from '@/components/ui/flip-text'
import { SankhyaMark } from '@/components/shared/Mark'
import { useSolverStore } from '@/context/SolverContext'
import { APP_MARK, APP_NAME, APP_VERSION, DEFAULT_PROMPT, PIPELINE_STAGES } from '@/lib/constants'

const PIPELINE_COPY: Record<(typeof PIPELINE_STAGES)[number]['id'], string> = {
  input: 'Natural-language constraints from the planner.',
  translation: 'Local SLM extracts variables, bounds, and the objective.',
  optimization: 'Presolve conditions the sparse system for PDHG.',
  computation: 'MPIR runs FP32 kernels with FP64 residual correction.',
  verification: 'KKT residuals certify primal, dual, and bound slack.',
  decision: 'Certified plan, decision vector, and audit export.',
}

const ENGINES = [
  {
    index: '01',
    icon: MessageSquareText,
    title: 'LocalRefinerySLM',
    purpose: 'Natural language → model',
    body: 'A local translator turns planner language into a structured program: objective, inequality system, bounds, and named decision variables. No remote model call is required.',
  },
  {
    index: '02',
    icon: Cpu,
    title: 'MPIR engine',
    purpose: 'Mixed-precision LP',
    body: 'Inner projection kernels run in FP32. Residuals accumulate and correction steps apply in FP64. CUDA is used when the host reports it; otherwise the same path runs on CPU.',
  },
  {
    index: '03',
    icon: GitBranch,
    title: 'MILP engine',
    purpose: 'Branch-and-bound',
    body: 'Integer decisions such as CDU mode are searched with a GNN-guided branching prototype. The console reconstructs the tree from the live objective when the API does not stream nodes.',
  },
  {
    index: '04',
    icon: FileCheck2,
    title: 'KKT verifier',
    purpose: 'Constraint certification',
    body: 'Equality, inequality, and bound residuals are checked against a 1e-6 tolerance. The returned plan is labeled complete only after the residual audit passes.',
  },
]

const DOMAINS = [
  {
    icon: Factory,
    title: 'Industrial planning',
    body: 'Multi-constraint production programs with named capacities and quality limits.',
  },
  {
    icon: Fuel,
    title: 'Refinery scheduling',
    body: 'Crude slate, sulfur, octane, and unit-mode decisions on a local runtime.',
  },
  {
    icon: Zap,
    title: 'Energy systems',
    body: 'Dispatch-style linear and mixed-integer programs with residual certification.',
  },
  {
    icon: Landmark,
    title: 'Critical infrastructure',
    body: 'Air-gapped execution so plans stay on the configured host.',
  },
]

const CONSOLES = [
  {
    to: '/app/command-center',
    index: '01',
    icon: LayoutDashboard,
    title: 'Command Center',
    body: 'Prompt, extracted parameters, solution vector, and constraint slack in one control room.',
  },
  {
    to: '/app/gpu-compute',
    index: '02',
    icon: Cpu,
    title: 'GPU Compute',
    body: 'Convergence series and device telemetry reconstructed from the live solve.',
  },
  {
    to: '/app/milp-search',
    index: '03',
    icon: GitBranch,
    title: 'MILP Search',
    body: 'Branch-and-bound tree and GNN branching view for integer decisions.',
  },
  {
    to: '/app/optnet-lab',
    index: '04',
    icon: Network,
    title: 'OptNet AI Lab',
    body: 'Differentiable optimization bench for forward and backward research passes.',
  },
  {
    to: '/app/kkt-certification',
    index: '05',
    icon: FileCheck2,
    title: 'KKT Certification',
    body: 'Residual audit, feasibility labels, and exportable certification record.',
  },
]

const RUNTIME = [
  ['Air-gapped mode', 'The translator and solver execute on the local runtime. Prompts do not leave the host.'],
  ['Local computation', 'No cloud solver, no remote weights. CUDA is optional and reported by the machine.'],
  ['CUDA engine', 'Tensor-core MPIR uses the GPU when PyTorch reports CUDA; otherwise the CPU path is identical.'],
  ['Local API', 'FastAPI serves POST /api/slm/translate-and-solve on the configured host.'],
]

function scrollToSection(event: MouseEvent<HTMLAnchorElement>, id: string) {
  event.preventDefault()
  const target = document.getElementById(id)
  if (!target) return
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  window.history.replaceState(null, '', `#${id}`)
}

function MatrixHero() {
  return (
    <svg viewBox="0 0 640 360" className="h-full w-full text-brand" role="img" aria-label="Abstract sparse-matrix to certified-plan diagram">
      <rect width="640" height="360" fill="rgb(var(--canvas))" />
      {Array.from({ length: 12 }, (_, row) =>
        Array.from({ length: 18 }, (_, col) => {
          const on = (row * 3 + col * 7) % 5 === 0 || (row + col) % 9 === 0
          return (
            <rect
              key={`${row}-${col}`}
              x={24 + col * 18}
              y={36 + row * 18}
              width="10"
              height="10"
              className={on ? 'landing-matrix-on' : undefined}
              fill={on ? 'currentColor' : 'rgb(var(--surface-3))'}
              style={on ? { animationDelay: `${((row * 3 + col) % 10) * 0.16}s` } : undefined}
            />
          )
        }),
      )}
      <path d="M360 180h48" stroke="currentColor" strokeWidth="1.25" />
      <path d="M400 174l12 6-12 6" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <rect x="420" y="92" width="188" height="176" fill="rgb(var(--canvas))" stroke="rgb(var(--line))" />
      <path d="M444 128h140M444 148h118M444 168h96M444 188h128M444 208h84" stroke="currentColor" strokeWidth="1.2" />
      <text x="444" y="250" fill="rgb(var(--ink-muted))" fontSize="10" fontFamily="IBM Plex Sans">
        Sparse system → certified plan
      </text>
    </svg>
  )
}

export default function Landing() {
  const { setArchitectureOpen } = useSolverStore()

  return (
    <div className="landing min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-2">
            <SankhyaMark className="h-8 w-8" />
            <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
          </div>
          <nav className="hidden items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted md:flex" aria-label="Page">
            <a href="#pipeline" className="transition-colors duration-200 hover:text-ink" onClick={(event) => scrollToSection(event, 'pipeline')}>
              Pipeline
            </a>
            <a href="#engines" className="transition-colors duration-200 hover:text-ink" onClick={(event) => scrollToSection(event, 'engines')}>
              Engines
            </a>
            <a href="#console" className="transition-colors duration-200 hover:text-ink" onClick={(event) => scrollToSection(event, 'console')}>
              Console
            </a>
          </nav>
          <div className="flex min-w-0 items-center gap-2">
            <ThemeToggle className="landing-btn landing-btn-ghost" />
            <Link
              to="/login"
              className="landing-btn landing-btn-fill inline-flex h-9 shrink-0 items-center rounded-md bg-brand-fill px-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white sm:px-3.5"
            >
              <span className="hidden sm:inline">Open command center</span>
              <ArrowRight className="h-4 w-4 sm:hidden" aria-label="Open command center" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="landing-hero-section mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-14">
          <div>
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-brand/20 bg-brand-soft/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
              Local optimization runtime online
            </div>
            <p className="label-caps">Sovereign GPU-accelerated mathematical optimization</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-ink lg:text-[48px] lg:leading-[1.02]">
              <span className="sr-only">{APP_NAME}</span>
              <span aria-hidden="true">
                <FlipText duration={2.6} delay={0.08}>
                  {APP_NAME}
                </FlipText>
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-ink-secondary">
              A high-performance optimization engine for industrial planning, refinery scheduling, energy systems, and
              critical infrastructure. Prompts become certified plans on the local host.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="landing-btn landing-btn-fill inline-flex h-11 items-center rounded-md bg-brand-fill px-5 text-sm font-semibold tracking-[0.08em] text-white"
              >
                Open command center
              </Link>
              <button
                type="button"
                onClick={() => setArchitectureOpen(true)}
                className="landing-btn landing-btn-ghost inline-flex h-11 items-center rounded-md border border-line px-5 text-sm font-semibold tracking-[0.08em] text-ink"
              >
                View architecture
              </button>
            </div>
            <dl className="mt-10 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
              {[
                ['Air-gapped', 'Local runtime'],
                ['Local compute', 'No cloud dependency'],
                ['CUDA engine', 'When the host reports it'],
                ['Local API', 'FastAPI on the configured host'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="label-caps">{label}</dt>
                  <dd className="mt-1 text-ink-secondary">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="landing-hero panel overflow-hidden border-brand/15 bg-canvas/90 shadow-[0_24px_80px_rgb(var(--ink)/0.08)]">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <p className="label-caps flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand" /> Constraint matrix</p>
              <p className="label-caps">Certified plan</p>
            </div>
            <MatrixHero />
            <div className="grid grid-cols-3 border-t border-line bg-surface/70">
              {[
                ['MODE', 'AIR-GAPPED'],
                ['DEVICE', 'CUDA / CPU'],
                ['STATUS', 'KKT READY'],
              ].map(([label, value]) => (
                <div key={label} className="border-r border-line px-3 py-3 last:border-r-0">
                  <p className="font-mono text-[9px] tracking-[0.16em] text-ink-muted">{label}</p>
                  <p className="mt-1 text-[10px] font-semibold tracking-[0.08em] text-brand">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="label-caps">Example constraint</p>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-ink">
                  “{DEFAULT_PROMPT}”
                </p>
              </div>
              <Link
                to="/login"
                className="landing-link inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand"
              >
                Run in command center
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section id="pipeline">
          <div className="mx-auto max-w-6xl px-6 pb-16 pt-12">
            <p className="label-caps">Computational pipeline</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">From planner language to a certified plan</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-secondary">
              Translation and solve execute as a single local request. Intermediate GPU ticks are not streamed; the
              console reports the live result once the engine returns.
            </p>
            <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              {PIPELINE_STAGES.map((stage, index) => (
                <li key={stage.id} className="panel p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-ink">{stage.label}</p>
                  <p className="mt-1 text-[12px] leading-5 text-ink-secondary">{PIPELINE_COPY[stage.id]}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="engines" className="border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <p className="label-caps">Solver stack</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Four engines, one local runtime</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-secondary">
              Each stage is a concrete module in the Python stack. The UI surfaces their outputs; it does not replace
              them.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {ENGINES.map((engine) => (
                <article key={engine.title} className="panel group p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="icon-chip flex h-8 w-8 items-center justify-center rounded-md border border-line bg-canvas text-brand">
                        <engine.icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink">{engine.title}</p>
                        <p className="text-[11px] text-ink-muted">{engine.purpose}</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">{engine.index}</span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-ink-secondary">{engine.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <p className="label-caps">Operating domains</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Built for constrained industrial programs</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {DOMAINS.map((domain) => (
                <article key={domain.title} className="panel group p-5">
                  <domain.icon className="icon-chip h-4 w-4 text-brand" aria-hidden="true" />
                  <h3 className="mt-3 text-sm font-semibold text-ink">{domain.title}</h3>
                  <p className="mt-1 text-[12px] leading-5 text-ink-secondary">{domain.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="console" className="border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <p className="label-caps">Operator console</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Five surfaces over the same solve</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-secondary">
              Every console reads the live run. Empty panels stay empty until the engine returns a result — no
              decorative placeholders.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CONSOLES.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="panel group flex flex-col p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">{item.index}</span>
                    <item.icon className="h-4 w-4 text-brand" aria-hidden="true" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1 flex-1 text-[12px] leading-5 text-ink-secondary">{item.body}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">
                    Open
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              ))}
              <article className="panel flex flex-col justify-between p-5 sm:col-span-2 lg:col-span-1">
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-brand" aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-ink">Runtime posture</h3>
                  </div>
                  <p className="mt-2 text-[12px] leading-5 text-ink-secondary">
                    Air-gapped by default. The gateway, translator, and solver stay on the configured host.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setArchitectureOpen(true)}
                  className="landing-link mt-4 inline-flex items-center gap-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-brand"
                >
                  View pipeline
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </article>
            </div>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <p className="label-caps">Deployment</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Nothing leaves the host unless you wire it that way</h2>
            <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {RUNTIME.map(([label, value]) => (
                <div key={label} className="panel p-5">
                  <dt className="label-caps">{label}</dt>
                  <dd className="mt-2 text-sm leading-6 text-ink-secondary">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <SankhyaMark className="h-6 w-6" />
            <div>
              <p className="text-sm font-semibold tracking-tight text-ink">{APP_NAME}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                {APP_MARK} · v{APP_VERSION}
              </p>
            </div>
          </div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">
            Air-gapped · Local API · No cloud dependency
          </p>
        </div>
      </footer>
    </div>
  )
}
