export function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export function formatCurrencyINR(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return `₹${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatScientific(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return '—'
  if (value === 0) return '0'
  const [coeff, exp] = value.toExponential(digits).split('e')
  const exponent = Number(exp)
  const superscript = exponent.toString()
  return `${coeff} × 10${formatExponent(superscript)}`
}

function formatExponent(exp: string): string {
  const map: Record<string, string> = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
    '+': '',
    '-': '⁻',
  }
  return exp
    .split('')
    .map((ch) => map[ch] ?? ch)
    .join('')
}

export function formatMs(value: number): string {
  if (!Number.isFinite(value)) return '—'
  if (value < 1) return `${value.toFixed(3)} ms`
  if (value < 1000) return `${value.toFixed(1)} ms`
  return `${(value / 1000).toFixed(2)} s`
}

export function formatTimestamp(iso: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-GB', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatRunId(runId: string | null): string {
  if (!runId) return '—'
  return runId
}

export function isActiveFlag(value: number): boolean {
  return value >= 0.5
}
