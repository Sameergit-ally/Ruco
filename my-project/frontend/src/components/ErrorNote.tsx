import { ApiError } from '../api'

/**
 * A failure and, where the server offered one, the fix.
 *
 * Sits flat on paper with a brick-colored left rule and brick-wash fill.
 */
export function ErrorNote({
  error,
  onDismiss,
}: {
  error: Error
  onDismiss?: () => void
}) {
  const hint = error instanceof ApiError ? error.hint : ''

  return (
    <div className="rounded-control border-l-2 border-brick bg-brick-wash px-item py-tight">
      <div className="flex items-start justify-between gap-4">
        <p className="text-small font-medium text-brick">{error.message}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="btn btn-quiet btn-sm shrink-0 text-brick hover:bg-brick/10"
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>
      {hint && (
        <p className="mt-2 max-w-prose whitespace-pre-line text-small leading-relaxed text-graphite">
          {hint}
        </p>
      )}
    </div>
  )
}
