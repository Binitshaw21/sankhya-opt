import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Gauge, ShieldCheck, TrendingUp } from 'lucide-react'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { StatusPill } from '@/components/shared/StatusPill'
import { useSolverStore } from '@/context/SolverContext'
import { formatNumber } from '@/lib/formatters'

const roles = ['Plant Operator', 'Optimization Scientist', 'Chief Refinery Economist', 'Auditor / PSU Inspector']

const shadowPrices = [
  { constraint: 'Sulfur pool', value: 18.42, unit: '₹k / 1% relaxation', tone: 'text-amber-700' },
  { constraint: 'Octane target', value: 7.84, unit: '₹k / point relaxation', tone: 'text-sky-700' },
  { constraint: 'Reforming capacity', value: 42.15, unit: '₹k / 1,000 bbl/day', tone: 'text-emerald-700' },
  { constraint: 'CDU mode exclusivity', value: 0, unit: 'binding value', tone: 'text-slate-500' },
]

const benchmarks = [
  { name: 'SANKHYA-OPT', time: 22.8, residual: '0.00e+00', gap: '0.00%', vram: '412 MB', primary: true },
  { name: 'HiGHS', time: 31.4, residual: '2.10e-08', gap: '0.00%', vram: 'N/A', primary: false },
  { name: 'Gurobi*', time: 18.7, residual: '1.40e-09', gap: '0.00%', vram: 'N/A', primary: false },
  { name: 'CPLEX*', time: 24.2, residual: '3.80e-09', gap: '0.00%', vram: 'N/A', primary: false },
]

function FeasibleRegion({ period }: { period: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#f8fafc')
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(4.8, 3.8, 6.8)
    camera.lookAt(0, 0, 0)
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    const material = new THREE.MeshBasicMaterial({ color: '#0ea5e9', transparent: true, opacity: 0.12, side: THREE.DoubleSide })
    const edges = new THREE.LineBasicMaterial({ color: '#0284c7', transparent: true, opacity: 0.7 })
    const geometry = new THREE.IcosahedronGeometry(2, 1)
    const region = new THREE.Mesh(geometry, material)
    const wire = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), edges)
    scene.add(region, wire)

    const trajectoryPoints = Array.from({ length: 18 }, (_, index) => {
      const progress = index / 17
      return new THREE.Vector3(-1.9 + progress * 1.8, 1.5 - progress * 1.35, -1.4 + progress * 1.3)
    })
    const trajectory = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(trajectoryPoints),
      new THREE.LineBasicMaterial({ color: '#059669', linewidth: 2 }),
    )
    scene.add(trajectory)
    const vertex = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), new THREE.MeshBasicMaterial({ color: '#059669' }))
    vertex.position.set(0, 0.15, 0.1)
    scene.add(vertex)

    const resize = () => {
      const width = canvas.clientWidth || 640
      const height = canvas.clientHeight || 330
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    let frame = 0
    const animate = () => {
      frame = requestAnimationFrame(animate)
      const phase = performance.now() * 0.00035
      region.rotation.y = phase + period * 0.04
      wire.rotation.y = region.rotation.y
      region.rotation.x = Math.sin(phase * 0.7) * 0.12
      wire.rotation.x = region.rotation.x
      renderer.render(scene, camera)
    }
    animate()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      geometry.dispose()
      material.dispose()
      edges.dispose()
      renderer.dispose()
    }
  }, [period])

  return <canvas ref={canvasRef} className="h-full min-h-[300px] w-full" aria-label="Interactive feasible region visualizer" />
}

export default function EnterpriseInsights() {
  const { solverMetrics } = useSolverStore()
  const [period, setPeriod] = useState(4)
  const objective = solverMetrics?.optimal_objective ?? 36860.91

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      <SectionHeader
        eyebrow="Enterprise analytics / local only"
        title="Decision intelligence"
        description="Inspect feasible geometry, marginal constraint value, and reproducible solver benchmarks from one air-gapped surface."
        actions={<StatusPill label="NO NETWORK EGRESS" tone="ok" />}
      />

      <div className="flex flex-wrap gap-2 rounded-md border border-line bg-canvas p-3">
        <span className="label-caps mr-2 self-center">Role scopes</span>
        {roles.map((role, index) => <span key={role} className={index === 0 ? 'rounded border border-brand/30 bg-brand-soft px-2 py-1 text-[11px] font-semibold text-brand' : 'rounded border border-line px-2 py-1 text-[11px] text-ink-secondary'}>{role}</span>)}
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div>
              <p className="label-caps">Primal-dual geometry</p>
              <h2 className="mt-1 text-sm font-semibold text-ink">Feasible region / PDHG trajectory</h2>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-ink-muted"><Gauge className="h-3.5 w-3.5 text-info" /> Basis crossover ready</div>
          </div>
          <div className="relative h-[330px] bg-surface-2"><FeasibleRegion period={period} /><div className="pointer-events-none absolute bottom-3 left-4 flex gap-3 rounded border border-line bg-canvas/90 px-3 py-2 text-[10px] text-ink-muted"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-info" />Feasible polytope</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-brand" />Interior trajectory</span></div></div>
          <div className="border-t border-line px-4 py-3"><div className="flex items-center justify-between gap-4"><label className="label-caps" htmlFor="time-horizon">Time horizon <span className="font-mono text-ink">t{period}</span></label><span className="font-mono text-xs text-ink-muted">t1 — t8</span></div><input id="time-horizon" type="range" min="1" max="8" value={period} onChange={(event) => setPeriod(Number(event.target.value))} className="mt-3 w-full accent-sky-600" /></div>
        </div>

        <div className="panel p-4">
          <div className="flex items-center justify-between"><div><p className="label-caps">Economist view</p><h2 className="mt-1 text-sm font-semibold text-ink">Dual sensitivity</h2></div><TrendingUp className="h-4 w-4 text-brand" /></div>
          <p className="mt-2 text-xs leading-5 text-ink-secondary">Marginal value of relaxing each active constraint by one operational unit.</p>
          <div className="mt-5 space-y-4">{shadowPrices.map((item) => <div key={item.constraint}><div className="flex items-center justify-between gap-3 text-xs"><span className="font-medium text-ink">{item.constraint}</span><span className={`font-mono font-semibold ${item.tone}`}>₹ {item.value.toFixed(2)}k</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3"><div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(item.value * 1.8, 100)}%` }} /></div><p className="mt-1 text-[10px] text-ink-muted">{item.unit}</p></div>)}</div>
          <div className="mt-6 flex items-center justify-between border-t border-line pt-4"><span className="text-xs text-ink-secondary">Current objective</span><span className="font-mono text-sm font-semibold text-ink">₹ {formatNumber(objective)}</span></div>
        </div>
      </section>

      <section className="panel overflow-hidden"><div className="flex items-center justify-between border-b border-line px-4 py-3"><div><p className="label-caps">Reproducibility lab</p><h2 className="mt-1 text-sm font-semibold text-ink">Benchmark battle arena</h2></div><span className="text-[11px] text-ink-muted">Illustrative local comparison</span></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead className="bg-surface-2 text-[10px] uppercase tracking-[0.12em] text-ink-muted"><tr><th className="px-4 py-3 font-semibold">Engine</th><th className="px-4 py-3 font-semibold">Solve time</th><th className="px-4 py-3 font-semibold">Peak VRAM</th><th className="px-4 py-3 font-semibold">Primal residual</th><th className="px-4 py-3 font-semibold">Duality gap</th><th className="px-4 py-3 font-semibold">Result</th></tr></thead><tbody className="divide-y divide-line">{benchmarks.map((benchmark) => <tr key={benchmark.name} className={benchmark.primary ? 'bg-brand-soft/40' : ''}><td className="px-4 py-3 font-semibold text-ink">{benchmark.name}{benchmark.primary ? <span className="ml-2 rounded bg-brand px-1.5 py-0.5 text-[9px] text-white">LOCAL</span> : null}</td><td className="px-4 py-3 font-mono text-ink-secondary">{benchmark.time.toFixed(1)} ms</td><td className="px-4 py-3 font-mono text-ink-secondary">{benchmark.vram}</td><td className="px-4 py-3 font-mono text-emerald-700">{benchmark.residual}</td><td className="px-4 py-3 font-mono text-ink-secondary">{benchmark.gap}</td><td className="px-4 py-3"><span className="inline-flex items-center gap-1 text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" /> Feasible</span></td></tr>)}</tbody></table></div></section>
    </div>
  )
}
