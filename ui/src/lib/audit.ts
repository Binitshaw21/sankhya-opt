import type { AuditRecord, NlpExtraction, SolverMetrics } from '@/types/solver'
import type { KktVerification } from '@/types/telemetry'

export function buildAuditRecord(input: {
  runId: string
  timestamp: string
  prompt: string
  extraction: NlpExtraction
  metrics: SolverMetrics
  kkt: KktVerification | null
}): AuditRecord {
  const { runId, timestamp, prompt, extraction, metrics, kkt } = input
  return {
    runId,
    timestamp,
    inputPrompt: prompt,
    extractedParameters: extraction,
    solverStatus: metrics.status,
    objective: metrics.optimal_objective,
    solutionVector: metrics.solution_vector,
    solverMetrics: metrics,
    verificationMetrics: {
      equalityResidual: kkt?.equalityResidual ?? null,
      inequalityViolation: kkt?.inequalityViolation ?? null,
      boundViolation: kkt?.boundViolation ?? null,
      finalViolationFp64: metrics.final_violation_fp64,
      certified: kkt?.certified ?? null,
      source: kkt ? 'DERIVED' : 'LIVE',
    },
    device: metrics.device,
    certificationStatus: kkt
      ? kkt.certified
        ? 'CERTIFIED'
        : 'VERIFICATION_FAILED'
      : 'UNAVAILABLE',
  }
}

export function downloadAuditJson(record: AuditRecord): void {
  const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `sankhya-opt-audit-${record.runId}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export async function downloadSignedManifest(record: AuditRecord): Promise<void> {
  const canonical = JSON.stringify(record)
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical))
  const digestHex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
  const manifest = {
    manifestType: 'C2PA-SIMULATED-LOCAL',
    digestAlgorithm: 'BLAKE3-SIMULATED-SHA256-FALLBACK',
    inputDigest: digestHex,
    signatureAlgorithm: 'Ed25519-SIMULATED-LOCAL-KEY',
    signature: `local:${digestHex.slice(0, 32)}`,
    record,
  }
  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `sankhya-opt-c2pa-manifest-${record.runId}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function createRunId(timestamp: string): string {
  const token = timestamp.replaceAll('-', '').replaceAll(':', '').replaceAll('.', '').replaceAll('T', '').replaceAll('Z', '').slice(0, 14)
  return `SO-${token}`
}
