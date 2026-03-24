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

function GymLiveDurationSection({
  durationMinutes,
  isCompleting,
  onChangeDuration,
  onComplete,
}) {
  return (
    <div className="space-y-5">
      <SectionCard title="Workout Duration">
        <div className="px-4 py-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Minutes
          </label>
          <input
            type="number"
            min="1"
            value={durationMinutes}
            onChange={(event) => onChangeDuration(event.target.value)}
            placeholder="Enter workout minutes"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-slate-400"
          />
        </div>
      </SectionCard>

      <button
        type="button"
        onClick={onComplete}
        disabled={!durationMinutes || isCompleting}
        className="w-full rounded-full px-4 py-3 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        style={{
          backgroundColor:
            !durationMinutes || isCompleting ? undefined : '#23a802',
        }}
      >
        {isCompleting ? 'Completing...' : 'Complete'}
      </button>
    </div>
  )
}

export default GymLiveDurationSection