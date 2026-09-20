import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'ok' | 'warn' | 'danger' | 'info' | 'busy'

const TONES: Record<Tone, string> = {
  neutral: 'border-line bg-surface text-ink-secondary',
  ok: 'border-brand/30 bg-brand-soft text-brand',
  warn: 'border-warn/20 bg-warn-soft text-warn',
  danger: 'border-danger/20 bg-danger-soft text-danger',
  info: 'border-info/20 bg-info-soft text-info',
  busy: 'border-warn/20 bg-warn-soft text-warn',
}

export function StatusPill({
  label,
  tone = 'neutral',
  dot = true,
  className,
}: {
  label: string
  tone?: Tone
  dot?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]',
        TONES[tone],
        className,
      )}
    >
      {dot ? (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            tone === 'ok' && 'bg-brand',
            tone === 'warn' && 'bg-warn',
            tone === 'busy' && 'bg-warn',
            tone === 'danger' && 'bg-danger',
            tone === 'info' && 'bg-info',
            tone === 'neutral' && 'bg-ink-muted',
          )}
          aria-hidden="true"
        />
      ) : null}
      {label}
    </span>
  )
}
