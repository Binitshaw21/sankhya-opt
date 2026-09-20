import { AuditExport } from '@/components/kkt/AuditExport'
import { DataSourceBadge } from '@/components/shared/DataSourceBadge'
import { MetricCard } from '@/components/shared/MetricCard'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { StatusPill } from '@/components/shared/StatusPill'
import { formatScientific } from '@/lib/formatters'
import type { AuditRecord } from '@/types/solver'
import type { KktVerification } from '@/types/telemetry'

export function KKTCertificationView({
  kkt,
  audit,
}: {
  kkt: KktVerification
  audit: AuditRecord | null
}) {
  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Verification"
        title="Certification status"
        description="Equality residual, inequality violation, and bound violation are derived from the live solution and the published model. Final FP64 violation is live from the solver."
        actions={
          <div className="flex items-center gap-2">
            <DataSourceBadge source="DERIVED" />
            {audit ? <AuditExport record={audit} /> : null}
          </div>
        }
      />
      <div className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="label-caps">KKT / residual audit</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
              {kkt.certified ? '✓ Certified' : '✕ Verification failed'}
            </h2>
          </div>
          <StatusPill
            label={kkt.certified ? 'Pass' : 'Fail'}
            tone={kkt.certified ? 'ok' : 'danger'}
            className="px-3 py-1 text-xs"
          />
        </div>
        <p className="mt-2 text-sm text-ink-secondary">
          Tolerance {formatScientific(kkt.tolerance)}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Equality residual"
          value={formatScientific(kkt.equalityResidual)}
          hint="max |A_eq x − b_eq|"
          source="DERIVED"
        />
        <MetricCard
          label="Inequality violation"
          value={formatScientific(kkt.inequalityViolation)}
          hint="max(0, A_ub x − b_ub)"
          source="DERIVED"
        />
        <MetricCard
          label="Bound violation"
          value={formatScientific(kkt.boundViolation)}
          hint="max bound residual"
          source="DERIVED"
        />
        <MetricCard
          label="Final violation FP64"
          value={formatScientific(kkt.finalViolationFp64)}
          hint="Live solver_metrics.final_violation_fp64"
          source="LIVE"
        />
      </div>
      <div className="panel p-4 text-sm text-ink-secondary">
        Duality gap is not returned by the current API and is therefore omitted rather than invented.
      </div>
    </div>
  )
}
