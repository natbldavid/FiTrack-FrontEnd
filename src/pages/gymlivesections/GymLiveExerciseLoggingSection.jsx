import { useEffect, useState } from 'react'

function hasValue(value) {
  return value !== '' && value !== null && value !== undefined
}

function getExerciseStatus(exercise) {
  const fields = exercise.sets.flatMap((set) =>
    exercise.usesWeight ? [set.weight, set.reps] : [set.reps]
  )

  const totalFields = fields.length
  const filledFields = fields.filter(hasValue).length

  if (filledFields === 0) {
    return 'pending'
  }

  if (filledFields === totalFields) {
    return 'complete'
  }

  return 'in progress'
}

function getStatusStyles(status) {
  switch (status) {
    case 'complete':
      return {
        headerBg: 'bg-[#2f9914]',
        headerText: 'text-white',
        statusText: 'text-white',
      }
    case 'in progress':
      return {
        headerBg: 'bg-[#accef2]',
        headerText: 'text-[#0256b0]',
        statusText: 'text-[#0256b0]',
      }
    case 'pending':
    default:
      return {
        headerBg: 'bg-[#fff6de]',
        headerText: 'text-[#a87b03]',
        statusText: 'text-[#a87b03]',
      }
  }
}

function SectionCard({ title, status, isOpen, onToggle, children }) {
  const styles = getStatusStyles(status)

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center justify-between px-4 py-3 text-left transition ${styles.headerBg}`}
      >
        <h2 className={`text-sm font-semibold ${styles.headerText}`}>{title}</h2>

        <div className="ml-4 flex items-center gap-3">
          <span className={`text-xs italic ${styles.statusText}`}>{status}</span>

         <span
  className={`flex items-center transition-transform duration-200 ${
    isOpen ? 'rotate-180' : 'rotate-0'
  }`}
  aria-hidden="true"
>
  <svg
    viewBox="0 -6 524 524"
    className={`h-4 w-4 ${styles.headerText}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M64 191L98 157 262 320 426 157 460 191 262 387 64 191Z" />
  </svg>
</span>
        </div>
      </button>

      {isOpen ? <div>{children}</div> : null}
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
  const [openExercises, setOpenExercises] = useState({})

  useEffect(() => {
    setOpenExercises((current) => {
      const next = {}

      sessionExerciseInputs.forEach((exercise) => {
        next[exercise.workoutSessionExerciseId] =
          current[exercise.workoutSessionExerciseId] ?? false
      })

      return next
    })
  }, [sessionExerciseInputs])

  function toggleExercise(exerciseId) {
    setOpenExercises((current) => ({
      ...current,
      [exerciseId]: !current[exerciseId],
    }))
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {sessionExerciseInputs.map((exercise, exerciseIndex) => {
          const status = getExerciseStatus(exercise)
          const isOpen = openExercises[exercise.workoutSessionExerciseId] ?? false

          return (
            <SectionCard
              key={exercise.workoutSessionExerciseId}
              title={exercise.exerciseName}
              status={status}
              isOpen={isOpen}
              onToggle={() => toggleExercise(exercise.workoutSessionExerciseId)}
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
          )
        })}
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