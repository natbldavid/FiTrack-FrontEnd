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

function GymLiveLoadSessionsModal({
  isOpen,
  isLoading,
  sessions,
  onClose,
  onSelectSession,
}) {
  if (!isOpen) {
    return null
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
                <button
                  key={session.id}
                  type="button"
                  onClick={() => onSelectSession(session)}
                  className="flex w-full items-start justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition active:scale-[0.99]"
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
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No incomplete sessions found.
            </p>
          )}
        </div>
      </div>
    </>
  )
}

export default GymLiveLoadSessionsModal