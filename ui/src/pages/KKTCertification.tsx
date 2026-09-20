import { KktAuditReport } from '@/components/dashboard/KktAuditReport'
import { EmptyState } from '@/components/shared/EmptyState'
import { useKktVerification } from '@/hooks/useKktVerification'

export default function KKTCertification() {
  const { kktVerification, auditData } = useKktVerification()

  if (!kktVerification) {
    return (
      <EmptyState
        title="No certification available."
        description="Run an optimization to derive equality, inequality, and bound residuals from the live solution vector."
      />
    )
  }

  return <KktAuditReport kkt={kktVerification} audit={auditData} />
}
