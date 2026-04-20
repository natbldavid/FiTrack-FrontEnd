import { useState } from 'react'
import { deleteWorkoutSession } from '../../api/workoutSessionApi'

const formatSessionDate = (dateString) => {
  if (!dateString) {
    return 'Unknown date'
  }

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return dateString
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function CloseIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  )
}

function DeleteConfirmModal({
  isOpen,
  isDeleting,
  onCancel,
  onConfirm,
}) {
  if (!isOpen) {
    return null
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/40"
        onClick={isDeleting ? undefined : onCancel}
        aria-hidden="true"
      />

      <div className="fixed inset-x-4 top-1/2 z-[70] mx-auto w-full max-w-sm -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <h3 className="text-base font-semibold text-black">
          Delete loaded session
        </h3>

        <p className="mt-3 text-sm text-slate-600">
          Are you sure you want to delete this loaded data?
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? 'Deleting...' : 'Yes, delete'}
          </button>
        </div>
      </div>
    </>
  )
}

function GymLiveLoadSessionsModal({
  isOpen,
  isLoading,
  sessions,
  onClose,
  onSelectSession,
  onDeleteSession,
}) {
  const [sessionToDelete, setSessionToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isOpen) {
    return null
  }

  const openDeleteConfirm = (session) => {
    setSessionToDelete(session)
  }

  const closeDeleteConfirm = () => {
    if (isDeleting) {
      return
    }

    setSessionToDelete(null)
  }

  const handleDeleteConfirmed = async () => {
    if (!sessionToDelete) {
      return
    }

    try {
      setIsDeleting(true)
      await deleteWorkoutSession(sessionToDelete.id)

      if (onDeleteSession) {
        onDeleteSession(sessionToDelete.id)
      }

      setSessionToDelete(null)
    } catch (error) {
      console.error('Failed to delete workout session:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-x-4 top-1/2 z-50 mx-auto w-auto max-w-lg -translate-y-1/2 rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
          <h3 className="text-base font-semibold text-black">Load Session</h3>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center text-slate-700"
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-4 py-4">
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading sessions...</p>
          ) : sessions.length ? (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <button
                    type="button"
                    onClick={() => onSelectSession(session)}
                    className="flex min-w-0 flex-1 items-start text-left transition active:scale-[0.99]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-black">
                        {session.sessionName || 'Untitled Session'}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatSessionDate(session.sessionDate)}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {session.exerciseCount ?? 0} exercises
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => openDeleteConfirm(session)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete ${session.sessionName || 'session'}`}
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No incomplete sessions found.
            </p>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={Boolean(sessionToDelete)}
        isDeleting={isDeleting}
        onCancel={closeDeleteConfirm}
        onConfirm={handleDeleteConfirmed}
      />
    </>
  )
}

export default GymLiveLoadSessionsModal