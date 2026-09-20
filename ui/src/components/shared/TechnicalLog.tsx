import type { ReactNode } from 'react'

export function TechnicalLog({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-md border border-line bg-log text-log-fg">
      <header className="border-b border-white/10 px-4 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">{title}</p>
      </header>
      <pre className="max-h-64 overflow-auto px-4 py-3 font-mono text-xs leading-6">{children}</pre>
    </section>
  )
}
