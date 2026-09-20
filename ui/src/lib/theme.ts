export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'sankhya-theme'

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
}

export function readDomTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* storage unavailable */
  }
  return null
}

export function persistTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    /* storage unavailable */
  }
}

export function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolveInitialTheme(): Theme {
  return readStoredTheme() ?? systemTheme()
}

export function chartColors(theme: Theme) {
  return {
    green: theme === 'dark' ? '#4ADE80' : '#166534',
    slate: theme === 'dark' ? '#CBD5E1' : '#475569',
    orange: theme === 'dark' ? '#FB923C' : '#EA580C',
    blue: theme === 'dark' ? '#60A5FA' : '#1D4ED8',
    muted: theme === 'dark' ? '#94A3B8' : '#64748B',
    canvas: theme === 'dark' ? '#000000' : '#FFFFFF',
    line: theme === 'dark' ? '#334155' : '#E2E8F0',
    ink: theme === 'dark' ? '#F1F5F9' : '#0F172A',
    surface: theme === 'dark' ? '#1E293B' : '#F1F5F9',
    danger: theme === 'dark' ? '#F87171' : '#B91C1C',
  }
}

export function getChartBase(theme: Theme) {
  const colors = chartColors(theme)
  return {
    backgroundColor: 'transparent',
    textStyle: {
      fontFamily: 'IBM Plex Sans, system-ui, sans-serif',
      color: colors.slate,
      fontSize: 11,
    },
    grid: {
      top: 28,
      right: 16,
      bottom: 28,
      left: 48,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: colors.canvas,
      borderColor: colors.line,
      textStyle: { color: colors.ink, fontSize: 12 },
    },
    xAxis: {
      axisLine: { lineStyle: { color: colors.line } },
      axisTick: { show: false },
      axisLabel: { color: colors.muted, fontSize: 10, fontFamily: 'IBM Plex Mono, monospace' },
      splitLine: { show: false },
    },
    yAxis: {
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: colors.muted, fontSize: 10, fontFamily: 'IBM Plex Mono, monospace' },
      splitLine: { lineStyle: { color: colors.surface, width: 1 } },
    },
  }
}

export function getFlowChrome(theme: Theme) {
  const colors = chartColors(theme)
  return {
    edge: colors.muted,
    edgeLabel: colors.muted,
    background: colors.line,
  }
}
