import { useEffect, useState } from 'react'
import AnimatedButton from '@/components/ui/animated-button'
import { useSolver } from '@/hooks/useSolver'
import { buttonLabel, isBusyStatus } from '@/lib/status'

export function OptimizationInput() {
  const { currentPrompt, setCurrentPrompt, solverStatus, runOptimization, requestStartedAt } = useSolver()
  const [now, setNow] = useState(() => Date.now())
  const busy = isBusyStatus(solverStatus)
  const elapsed = requestStartedAt == null ? null : Math.max(0, now - requestStartedAt)

  useEffect(() => {
    if (requestStartedAt == null) return
    const id = window.setInterval(() => setNow(Date.now()), 100)
    return () => window.clearInterval(id)
  }, [requestStartedAt])

  return (
    <section className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label-caps">Natural language optimization command</p>
          <h2 className="mt-1 text-lg font-semibold text-ink">Refinery constraints</h2>
        </div>
        <p className="text-xs text-ink-muted">Ctrl/⌘ + Enter to solve</p>
      </div>
      <label htmlFor="optimization-command" className="sr-only">
        Describe refinery constraints
      </label>
      <textarea
        id="optimization-command"
        value={currentPrompt}
        onChange={(event) => setCurrentPrompt(event.target.value)}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && !busy) {
            event.preventDefault()
            void runOptimization()
          }
        }}
        placeholder="Describe your refinery constraints..."
        rows={5}
        className="mt-4 w-full resize-y rounded-md border border-line bg-surface px-3 py-3 text-sm leading-6 text-ink placeholder:text-ink-muted focus:border-brand"
        disabled={busy}
      />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-xs text-ink-secondary">
          Example: Keep sulfur below 18.5, maintain octane above 46000, and limit reforming capacity to 500 barrels/day.
        </p>
        <AnimatedButton
          type="button"
          onClick={() => void runOptimization()}
          disabled={busy || currentPrompt.trim().length === 0}
          aria-label={buttonLabel(solverStatus)}
          className="h-11 min-w-[220px] border-brand-fill bg-brand-fill px-6 text-sm font-semibold tracking-[0.08em] text-white"
        >
          {buttonLabel(solverStatus)}
          {elapsed != null ? (
            <span className="ml-2 font-mono text-[11px] opacity-80">{(elapsed / 1000).toFixed(1)}s</span>
          ) : null}
        </AnimatedButton>
      </div>
    </section>
  )
}
