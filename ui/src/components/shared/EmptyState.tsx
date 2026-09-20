export function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="panel flex min-h-[180px] flex-col items-start justify-center p-6">
      <p className="label-caps">No data</p>
      <h3 className="mt-2 text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-lg text-sm text-ink-secondary">{description}</p>
    </div>
  )
}
