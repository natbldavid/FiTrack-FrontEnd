function Modal({ isOpen, title, children, onClose, onConfirm, confirmText = 'OK' }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-3 text-xl font-semibold">{title}</h2>

        <div className="mb-5 text-sm text-slate-700">{children}</div>

        <div className="flex justify-end gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-4 py-2"
            >
              Close
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-slate-900 px-4 py-2 text-white"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal