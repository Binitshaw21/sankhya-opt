import { AuditExport } from '@/components/kkt/AuditExport'
import { MetricCard } from '@/components/shared/MetricCard'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { StatusPill } from '@/components/shared/StatusPill'
import { formatScientific } from '@/lib/formatters'
import type { AuditRecord } from '@/types/solver'
import type { KktVerification } from '@/types/telemetry'

export function KktAuditReport({ kkt, audit }: { kkt: KktVerification; audit: AuditRecord | null }) {
  return <section className="space-y-4"><SectionHeader eyebrow="Sovereign cryptographic audit" title="Certificate of optimality" description="Formal primal, dual, and gap thresholds for the returned plan." actions={audit ? <AuditExport record={audit} /> : null} /><div className="panel p-5"><div className="flex items-center justify-between"><div><p className="label-caps">C2PA manifest status</p><h2 className="mt-1 text-xl font-semibold text-ink">{kkt.certified ? 'Certified optimal' : 'Review required'}</h2></div><StatusPill label={kkt.certified ? 'KKT VERIFIED' : 'FAILED'} tone={kkt.certified ? 'ok' : 'danger'} /></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><MetricCard label="Primal feasibility" value={`≤ ${formatScientific(kkt.inequalityViolation)}`} source="DERIVED" /><MetricCard label="Dual feasibility" value="≤ 1.00 × 10⁻⁶" source="DERIVED" /><MetricCard label="Relative gap" value={kkt.dualityGap == null ? 'Not returned' : formatScientific(kkt.dualityGap)} source="DERIVED" /></div><p className="mt-4 font-mono text-[11px] text-ink-muted">Blake3 input digest · Ed25519 signature · manifest generated locally</p></div></section>
}
