function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-4 last:border-b-0">
      <p className="text-sm font-medium text-black">{label}</p>
      <p className="text-sm font-semibold text-slate-600">{value}</p>
    </div>
  )
}

function ExerciseSummaryInfoSection({ exercise }) {
  return (
    <section className="pt-2">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-black">Exercise Summary</h3>
        </div>

        <div>
          <InfoRow label="Exercise Name" value={exercise?.exerciseName || '-'} />
          <InfoRow label="Body Part" value={exercise?.bodyPart || '-'} />
          <InfoRow label="Exercise Type" value={exercise?.exerciseType || '-'} />
          <InfoRow label="Target Sets" value={exercise?.targetSets ?? 0} />
          <InfoRow
            label="Target Reps"
            value={`${exercise?.targetRepsMin ?? 0} - ${exercise?.targetRepsMax ?? 0}`}
          />
          <InfoRow
            label="Initial Weight"
            value={`${exercise?.initialWeight ?? 0} kg`}
          />
          <InfoRow
            label="Current Working Weight"
            value={`${exercise?.currentWorkingWeight ?? 0} kg`}
          />
        </div>
      </div>
    </section>
  )
}

export default ExerciseSummaryInfoSection