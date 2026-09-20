import { useState } from 'react'
import { SectionHeader } from '@/components/shared/SectionHeader'

const instances = ['Netlib: AFIRO', 'Netlib: BEACONFD', 'MIPLIB: blend2', 'MRPL: CrudeDistill_500K']
const rows = [['SANKHYA-OPT', 'GPU / local', '22.8 ms', '412 MB', '0.00%', 'Sovereign'], ['HiGHS', 'CPU', '31.4 ms', 'N/A', '0.00%', 'Reference'], ['Gurobi 11.0', 'CPU', '18.7 ms', 'N/A', '0.00%', 'Reference'], ['CPLEX 22.1', 'CPU', '24.2 ms', 'N/A', '0.00%', 'Reference']]

export function BenchmarkArena() {
  const [instance, setInstance] = useState(instances[0])
  return <section className="panel overflow-hidden"><div className="border-b border-line p-4"><SectionHeader eyebrow="Reproducibility lab" title="Benchmark battle arena" description="Local illustrative results for a selected standard or refinery instance." actions={<select value={instance} onChange={(event) => setInstance(event.target.value)} className="h-9 rounded-md border border-line bg-canvas px-2 text-xs text-ink">{instances.map((item) => <option key={item}>{item}</option>)}</select>} /></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-surface-2 text-[10px] uppercase tracking-[0.12em] text-ink-muted"><tr>{['Solver', 'Architecture', 'Time', 'Peak memory', 'Duality gap', 'Status'].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr></thead><tbody className="divide-y divide-line">{rows.map((row, index) => <tr key={row[0]} className={index === 0 ? 'bg-brand-soft/40' : ''}>{row.map((cell, cellIndex) => <td key={`${row[0]}-${cellIndex}`} className={`px-4 py-3 ${cellIndex === 0 ? 'font-semibold text-ink' : 'font-mono text-ink-secondary'}`}>{cell}{index === 0 && cellIndex === 0 ? <span className="ml-2 rounded bg-brand px-1.5 py-0.5 text-[9px] text-white">LOCAL</span> : null}</td>)}</tr>)}</tbody></table></div></section>
}
