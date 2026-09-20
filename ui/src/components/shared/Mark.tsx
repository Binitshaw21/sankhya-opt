import { cn } from '@/lib/utils'

export function SankhyaMark({ className }: { className?: string }) {
  const cells = [
    [1, 0, 1],
    [0, 1, 0],
    [1, 0, 1],
  ]
  return (
    <svg viewBox="0 0 32 32" className={cn('text-brand', className)} aria-hidden="true" fill="none">
      <rect x="1.25" y="1.25" width="29.5" height="29.5" rx="3" stroke="currentColor" strokeWidth="1.5" />
      {cells.flatMap((row, y) =>
        row.map((on, x) => (
          <rect
            key={`${x}-${y}`}
            x={7 + x * 6.5}
            y={7 + y * 6.5}
            width="5"
            height="5"
            fill={on ? 'currentColor' : 'rgb(var(--line))'}
          />
        )),
      )}
    </svg>
  )
}
