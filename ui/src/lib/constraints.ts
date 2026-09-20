import { KKT_TOLERANCE } from '@/lib/constants'
import { dot, MODEL_COEFFICIENTS } from '@/lib/model'
import type {
  ConstraintEvaluation,
  ConstraintTone,
  NlpExtraction,
  SolverMetrics,
} from '@/types/solver'
import type { KktVerification } from '@/types/telemetry'

function toneForInequality(current: number, limit: number, sense: 'max' | 'min'): ConstraintTone {
  const slack = sense === 'max' ? limit - current : current - limit
  if (slack < -KKT_TOLERANCE) return 'violated'
  const span = Math.max(Math.abs(limit), 1)
  if (slack / span < 0.05) return 'near_limit'
  return 'satisfied'
}

function toneForEquality(residual: number): ConstraintTone {
  const abs = Math.abs(residual)
  if (abs > KKT_TOLERANCE) return 'violated'
  if (abs > KKT_TOLERANCE * 0.1) return 'near_limit'
  return 'satisfied'
}

function labelFor(tone: ConstraintTone): string {
  if (tone === 'violated') return 'VIOLATED'
  if (tone === 'near_limit') return 'NEAR LIMIT'
  return 'SATISFIED'
}

export function evaluateConstraints(
  extraction: NlpExtraction,
  x: number[],
): ConstraintEvaluation[] {
  const sulfur = dot(MODEL_COEFFICIENTS.sulfur, x)
  const octane = dot(MODEL_COEFFICIENTS.octane, x)
  const cdu = dot(MODEL_COEFFICIENTS.cduExclusivity, x)
  const mass = dot(MODEL_COEFFICIENTS.massBalance, x)
  const reforming = dot(MODEL_COEFFICIENTS.reformingYield, x)

  const sulfurTone = toneForInequality(sulfur, extraction.max_sulfur_pool, 'max')
  const octaneTone = toneForInequality(octane, extraction.min_octane_target, 'min')
  const cduTone = toneForInequality(cdu, 1, 'max')
  const massTone = toneForEquality(mass)
  const reformingTone = toneForEquality(reforming)

  return [
    {
      id: 'sulfur',
      name: 'Sulfur Pool',
      kind: 'inequality',
      current: sulfur,
      limit: extraction.max_sulfur_pool,
      limitLabel: 'Maximum allowed',
      slack: extraction.max_sulfur_pool - sulfur,
      unit: 'wt constraint',
      tone: sulfurTone,
      statusLabel: labelFor(sulfurTone),
      source: 'DERIVED',
    },
    {
      id: 'octane',
      name: 'Octane',
      kind: 'inequality',
      current: octane,
      limit: extraction.min_octane_target,
      limitLabel: 'Minimum required',
      slack: octane - extraction.min_octane_target,
      unit: 'octane-bbl',
      tone: octaneTone,
      statusLabel: labelFor(octaneTone),
      source: 'DERIVED',
    },
    {
      id: 'cdu',
      name: 'CDU Exclusivity',
      kind: 'exclusivity',
      current: cdu,
      limit: 1,
      limitLabel: 'Allowed state ≤ 1',
      slack: 1 - cdu,
      unit: 'mode sum',
      tone: cduTone,
      statusLabel: labelFor(cduTone),
      source: 'DERIVED',
    },
    {
      id: 'mass',
      name: 'Mass Balance',
      kind: 'equality',
      current: mass,
      limit: 0,
      limitLabel: 'Residual vs 0',
      slack: -Math.abs(mass),
      unit: 'bbl/day residual',
      tone: massTone,
      statusLabel: labelFor(massTone),
      source: 'DERIVED',
    },
    {
      id: 'reforming',
      name: 'Reforming Yield',
      kind: 'equality',
      current: reforming,
      limit: 0,
      limitLabel: 'Residual vs 0',
      slack: -Math.abs(reforming),
      unit: 'bbl/day residual',
      tone: reformingTone,
      statusLabel: labelFor(reformingTone),
      source: 'DERIVED',
    },
  ]
}

export function deriveKktVerification(
  extraction: NlpExtraction,
  metrics: SolverMetrics,
): KktVerification {
  const x = metrics.solution_vector
  const constraints = evaluateConstraints(extraction, x)

  const sulfur = constraints.find((c) => c.id === 'sulfur')
  const octane = constraints.find((c) => c.id === 'octane')
  const cdu = constraints.find((c) => c.id === 'cdu')
  const mass = constraints.find((c) => c.id === 'mass')
  const reforming = constraints.find((c) => c.id === 'reforming')

  const inequalityViolation = Math.max(
    0,
    -(sulfur?.slack ?? 0),
    -(octane?.slack ?? 0),
    -(cdu?.slack ?? 0),
  )
  const equalityResidual = Math.max(
    Math.abs(mass?.current ?? 0),
    Math.abs(reforming?.current ?? 0),
  )

  const lowerViol = Math.max(
    0,
    ...x.map((value, i) => MODEL_COEFFICIENTS.lowerBounds[i] - value),
  )
  const upperViol = Math.max(
    0,
    ...x.map((value, i) => {
      const upper = i === 3 ? extraction.max_reforming_capacity : i >= 4 ? 1 : MODEL_COEFFICIENTS.feedUpper
      return value - upper
    }),
  )
  const boundViolation = Math.max(lowerViol, upperViol)

  const liveViolation = metrics.final_violation_fp64
  const derivedMax = Math.max(equalityResidual, inequalityViolation, boundViolation)
  const certified =
    liveViolation <= KKT_TOLERANCE && derivedMax <= KKT_TOLERANCE

  return {
    equalityResidual,
    inequalityViolation,
    boundViolation,
    dualityGap: null,
    finalViolationFp64: liveViolation,
    tolerance: KKT_TOLERANCE,
    certified,
    liveFields: ['finalViolationFp64'],
    derivedFields: ['equalityResidual', 'inequalityViolation', 'boundViolation'],
    source: 'DERIVED',
  }
}
