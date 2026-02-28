/** Full-page or inline loading spinner with optional label */
export function LoadingSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12" role="status" aria-label={label}>
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      <span className="text-text-muted text-sm">{label}</span>
    </div>
  )
}
