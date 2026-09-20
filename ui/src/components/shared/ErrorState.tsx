import { getApiBaseUrl } from '@/api/client'
import type { ApiError } from '@/types/solver'

export function ErrorState({
  error,
  onRetry,
}: {
  error: ApiError
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      className="panel border-danger/30 bg-danger-soft/40 p-5"
    >
      <p className="label-caps text-danger">Solver unavailable</p>
      <h3 className="mt-2 text-base font-semibold text-ink">{error.message}</h3>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="label-caps">API</dt>
          <dd className="mt-1 font-mono text-xs text-ink">{error.endpoint || getApiBaseUrl()}</dd>
        </div>
        <div>
          <dt className="label-caps">Status</dt>
          <dd className="mt-1 font-mono text-xs text-ink">
            {error.statusCode ?? error.kind}
          </dd>
        </div>
        {error.detail ? (
          <div className="sm:col-span-2">
            <dt className="label-caps">Detail</dt>
            <dd className="mt-1 font-mono text-xs text-ink-secondary">{error.detail}</dd>
          </div>
        ) : null}
      </dl>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md border border-line bg-canvas px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink hover:bg-surface"
        >
          Retry
        </button>
      ) : null}
    </div>
  )
}
