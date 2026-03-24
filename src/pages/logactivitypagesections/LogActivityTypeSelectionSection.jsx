function LogActivityTypeSelectionSection({
  activityTypes,
  selectedActivityTypeId,
  isLoading,
  onSelectActivityType,
  onNext,
}) {
  const isNextDisabled = !selectedActivityTypeId

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Choose an activity
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Select one activity type to continue.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <p className="text-sm text-slate-600">Loading activities...</p>
        </div>
      ) : activityTypes.length === 0 ? (
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <p className="text-sm text-slate-600">No activity types found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {activityTypes.map((activityType) => {
            const isSelected =
              String(selectedActivityTypeId) === String(activityType.id)

            return (
              <button
                key={activityType.id}
                type="button"
                onClick={() => onSelectActivityType(activityType)}
                className={`rounded-3xl p-4 text-left transition active:scale-[0.99] ${
  isSelected
    ? 'shadow-sm'
    : 'bg-white shadow-sm'
}`}
style={
  isSelected
    ? { backgroundColor: '#dbf2d5' }
    : { border: '1px solid #e2e8f0' }
}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-2xl"
style={{
  backgroundColor: isSelected ? '#ffffff' : '#f1f5f9',
}}
                  >
                    <span aria-hidden="true">{activityType.icon || '🏃'}</span>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      {activityType.name}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      <div style={{ marginTop: '24px', paddingBottom: '12px' }}>
        <button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled}
          className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
  isNextDisabled
    ? 'cursor-not-allowed bg-slate-200 text-slate-500'
    : 'text-slate-500 shadow-sm active:scale-[0.99]'
}`}
style={
  isNextDisabled
    ? undefined
    : { backgroundColor: '#c8fcbb' }
}
        >
          Next
        </button>
      </div>
    </section>
  )
}

export default LogActivityTypeSelectionSection