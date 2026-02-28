import { ReactNode } from 'react'

/** Simple confirm modal. Call onConfirm() or onCancel() to close. */
export function ModalConfirm({
  title,
  children,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}: {
  title: string
  children: ReactNode
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="w-full max-w-md rounded-xl bg-secondary p-6 shadow-xl">
        <h2 id="modal-title" className="text-lg font-semibold text-primary">{title}</h2>
        <div className="mt-3 text-text-muted">{children}</div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-500 px-4 py-2 text-primary hover:bg-slate-700"
            aria-label={cancelLabel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-accent px-4 py-2 text-primary hover:bg-accent-hover"
            aria-label={confirmLabel}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
