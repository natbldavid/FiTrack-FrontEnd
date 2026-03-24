function PlusIcon({ className = 'h-5 w-5' }) {
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
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

function ChevronRightIcon({ className = 'h-5 w-5' }) {
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
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {title ? (
        <div className="border-b border-slate-200 bg-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-black">{title}</h2>
        </div>
      ) : null}
      <div>{children}</div>
    </div>
  )
}

function GymLiveWorkoutDaySelectionSection({
  workoutDays,
  isLoading,
  isSaving,
  onSelectWorkoutDay,
  onGoToWorkoutDashboard,
  onGoToAddWorkoutDay,
}) {
  if (isLoading) {
    return <div className="px-4 py-4 text-sm text-slate-500">Loading...</div>
  }

  if (!workoutDays.length) {
    return (
      <div className="space-y-4">
        <SectionCard title="Workout Days">
          <div className="px-4 py-5">
            <p className="text-sm text-slate-500">
              You don't have any gym days. Please create some before continuing.
            </p>
          </div>
        </SectionCard>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onGoToWorkoutDashboard}
            className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-700"
          >
            Back
          </button>

          <button
            type="button"
            onClick={onGoToAddWorkoutDay}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-base font-semibold text-white"
            style={{ backgroundColor: '#23a802' }}
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create Workout Day</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Workout Days">
        <div className="space-y-3 px-4 py-4">
          {workoutDays.map((workoutDay) => (
            <button
              key={workoutDay.id}
              type="button"
              onClick={() => onSelectWorkoutDay(workoutDay)}
              disabled={isSaving}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition active:scale-[0.99]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-black">
                  {workoutDay.name}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {workoutDay.muscleFocus || 'No muscle focus set'}
                </p>
              </div>

              <ChevronRightIcon className="ml-3 h-5 w-5 shrink-0 text-slate-400" />
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

export default GymLiveWorkoutDaySelectionSection