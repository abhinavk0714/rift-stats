/** Displays an error message with optional retry. */
export function ErrorMessage({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="rounded-xl bg-secondary p-6 text-center shadow-lg">
      <p className="text-red-400">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg bg-accent px-4 py-2 text-primary hover:bg-accent-hover"
          aria-label="Retry"
        >
          Retry
        </button>
      )}
    </div>
  )
}
