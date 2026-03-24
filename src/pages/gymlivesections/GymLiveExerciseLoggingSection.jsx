function SectionCard({ title, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {title ? (
        <div className="border-b border-slate-200 bg-[#c8fcbb] px-4 py-3">
          <h2 className="text-sm font-semibold text-black">{title}</h2>
        </div>
      ) : null}
      <div>{children}</div>
    </div>
  )
}

function GymLiveExerciseLoggingSection({
  sessionExerciseInputs,
  isSaving,
  onSetFieldChange,
  onSave,
  onNext,
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {sessionExerciseInputs.map((exercise, exerciseIndex) => (
          <SectionCard
            key={exercise.workoutSessionExerciseId}
            title={exercise.exerciseName}
          >
            <div className="space-y-4 px-4 py-4">
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-sm font-medium text-slate-700">
                  {exercise.usesWeight
                    ? `Expected weight: ${exercise.currentWorkingWeight ?? 0} kg`
                    : 'Bodyweight exercise'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {exercise.targetSets} sets • {exercise.targetRepsMin}-
                  {exercise.targetRepsMax} reps
                </p>
              </div>

              <div className="space-y-3">
                {exercise.sets.map((set, setIndex) => (
                  <div
                    key={set.setNumber}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-4"
                  >
                    <p className="mb-3 text-sm font-semibold text-black">
                      Set {set.setNumber}
                    </p>

                    <div
                      className={`grid gap-4 ${
                        exercise.usesWeight ? 'grid-cols-2' : 'grid-cols-1'
                      }`}
                    >
                      {exercise.usesWeight ? (
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">
                            Weight
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={set.weight}
                            onChange={(event) =>
                              onSetFieldChange(
                                exerciseIndex,
                                setIndex,
                                'weight',
                                event.target.value
                              )
                            }
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-slate-400"
                          />
                        </div>
                      ) : null}

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Reps
                        </label>
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(event) =>
                            onSetFieldChange(
                              exerciseIndex,
                              setIndex,
                              'reps',
                              event.target.value
                            )
                          }
                          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        ))}
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="w-full rounded-full border border-[#23a802] bg-white px-4 py-3 text-base font-semibold text-[#23a802] disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>

        <button
          type="button"
          onClick={onNext}
          className="w-full rounded-full px-4 py-3 text-base font-semibold text-white"
          style={{ backgroundColor: '#23a802' }}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default GymLiveExerciseLoggingSection