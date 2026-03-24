function LogActivityDetailsSection({
  selectedActivityType,
  logDate,
  durationMinutes,
  isSaving,
  onChangeLogDate,
  onChangeDurationMinutes,
  onSubmit,
}) {
  const isSubmitDisabled =
    !logDate || !durationMinutes || Number(durationMinutes) <= 0 || isSaving

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Enter activity details
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Add the date and total minutes for your activity.
        </p>
      </div>

      {selectedActivityType ? (
        <div
          className="mb-4 rounded-3xl border p-4"
          style={{
            borderColor: '#a7f3d0',
            backgroundColor: '#ecfdf5',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
              style={{ backgroundColor: '#d1fae5' }}
            >
              <span aria-hidden="true">{selectedActivityType.icon || '🏃'}</span>
            </div>

            <div>
              <p
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: '#047857' }}
              >
                Selected activity
              </p>
              <p className="text-base font-semibold text-slate-900">
                {selectedActivityType.name}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div>
          <label
            htmlFor="logDate"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Date
          </label>
          <input
            id="logDate"
            type="date"
            value={logDate}
            onChange={(event) => onChangeLogDate(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="durationMinutes"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Total activity minutes
          </label>
          <input
            id="durationMinutes"
            type="number"
            min="1"
            inputMode="numeric"
            placeholder="Enter total minutes"
            value={durationMinutes}
            onChange={(event) => onChangeDurationMinutes(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:ring-2"
          />
        </div>
      </div>

      <div style={{ marginTop: '24px', paddingBottom: '12px' }}>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            isSubmitDisabled
              ? 'cursor-not-allowed bg-slate-200 text-slate-500'
              : 'text-white shadow-sm active:scale-[0.99]'
          }`}
          style={
            isSubmitDisabled
              ? undefined
              : { backgroundColor: '#10b981' }
          }
        >
          {isSaving ? 'Saving...' : 'Save Activity'}
        </button>
      </div>
    </section>
  )
}

export default LogActivityDetailsSection