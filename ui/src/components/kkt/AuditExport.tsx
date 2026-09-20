import { downloadAuditJson } from '@/lib/audit'
import type { AuditRecord } from '@/types/solver'

export function AuditExport({ record }: { record: AuditRecord }) {
  return (
    <button
      type="button"
      onClick={() => downloadAuditJson(record)}
      className="rounded-md border border-line bg-canvas px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink hover:bg-surface"
    >
      Export audit JSON
    </button>
  )
}
