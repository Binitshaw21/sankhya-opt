import type { DecisionVariable } from '@/types/solver'

/**
 * Decision-variable mapping published by LocalRefinerySLM.
 * Matches api/slm_translator.py: [Arab Light, Brent, Maya, Reforming Naphtha, Mode A, Mode B]
 */
export const DECISION_VARIABLES: DecisionVariable[] = [
  {
    index: 0,
    key: 'arab_light',
    name: 'Arab Light Crude',
    unit: 'bbl/day',
    role: 'feed',
    technicalName: 'x0',
  },
  {
    index: 1,
    key: 'brent_blend',
    name: 'Brent Blend',
    unit: 'bbl/day',
    role: 'feed',
    technicalName: 'x1',
  },
  {
    index: 2,
    key: 'maya_heavy',
    name: 'Maya Heavy Crude',
    unit: 'bbl/day',
    role: 'feed',
    technicalName: 'x2',
  },
  {
    index: 3,
    key: 'reformer',
    name: 'Catalytic Reformer Throughput',
    unit: 'bbl/day',
    role: 'process',
    technicalName: 'x3',
  },
  {
    index: 4,
    key: 'cdu_mode_a',
    name: 'CDU Mode A',
    unit: 'binary',
    role: 'mode',
    technicalName: 'x4',
  },
  {
    index: 5,
    key: 'cdu_mode_b',
    name: 'CDU Mode B',
    unit: 'binary',
    role: 'mode',
    technicalName: 'x5',
  },
]

/**
 * Inequality and equality coefficients from LocalRefinerySLM.
 * Used only to derive constraint slack from a live solution vector.
 */
export const MODEL_COEFFICIENTS = {
  sulfur: [0.03, 0.01, 0.05, 0.0, 0.0, 0.0],
  octane: [85.0, 95.0, 70.0, 100.0, 0.0, 0.0],
  cduExclusivity: [0.0, 0.0, 0.0, 0.0, 1.0, 1.0],
  massBalance: [1.0, 1.0, 1.0, 0.0, -500.0, -800.0],
  reformingYield: [0.25, 0.3, 0.15, -1.0, 0.0, 0.0],
  lowerBounds: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  feedUpper: 1000.0,
  modeUpper: 1.0,
} as const

export function dot(coeffs: readonly number[], x: number[]): number {
  const n = Math.min(coeffs.length, x.length)
  let sum = 0
  for (let i = 0; i < n; i += 1) {
    sum += coeffs[i] * x[i]
  }
  return sum
}
