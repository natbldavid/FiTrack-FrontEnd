import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../routes/routePaths'

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

function WorkoutDayExercisesListSection({ workoutDay }) {
  const navigate = useNavigate()

  const exercises = [...(workoutDay?.exercises || [])].sort(
    (a, b) => (a?.exerciseOrder ?? 0) - (b?.exerciseOrder ?? 0)
  )

  return (
    <section className="pt-2">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-black">Exercises</h3>

        {exercises.length ? (
          <div className="mt-4 space-y-3">
            {exercises.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() =>
                  navigate(
                    ROUTES.EXERCISE_SUMMARY.replace(
                      ':workoutDayId',
                      String(workoutDay.id)
                    ).replace(':exerciseId', String(exercise.exerciseId)),
                    {
                      state: {
                        workoutDayName: workoutDay.name,
                        exercise,
                      },
                    }
                  )
                }
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition active:scale-[0.99]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-black">
                    {exercise.exerciseName}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {exercise.bodyPart}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {exercise.currentWorkingWeight ?? 0} kg • {exercise.targetSets} sets
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {exercise.targetRepsMin}-{exercise.targetRepsMax} reps
                  </p>
                </div>

                <ChevronRightIcon className="ml-3 h-5 w-5 shrink-0 text-slate-400" />
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No exercises found.</p>
        )}
      </div>
    </section>
  )
}

export default WorkoutDayExercisesListSection