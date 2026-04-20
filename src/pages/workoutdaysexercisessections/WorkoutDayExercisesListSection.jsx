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

function ExerciseGif({ src, alt }) {
  if (!src) {
    return (
      <div className="h-full aspect-square shrink-0 overflow-hidden rounded-l-2xl rounded-r-2xl bg-slate-200" />
    )
  }

  return (
    <div className="h-full aspect-square shrink-0 overflow-hidden rounded-l-2xl rounded-r-2xl bg-slate-100">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  )
}

function WorkoutDayExercisesListSection({ workoutDay }) {
  const navigate = useNavigate()

  const exercises = [...(workoutDay?.exercises || [])].sort(
    (a, b) => (a?.exerciseOrder ?? 0) - (b?.exerciseOrder ?? 0)
  )

  const handleExerciseClick = (exercise) => {
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

  return (
    <section className="pt-2">
      {exercises.length ? (
        <div className="space-y-4">
          {exercises.map((exercise) => {
            const sets = exercise.targetSets ?? 0
            const repsMin = exercise.targetRepsMin ?? 0
            const repsMax = exercise.targetRepsMax ?? 0
            const weight = exercise.currentWorkingWeight ?? 0

            return (
              <button
                key={exercise.id}
                type="button"
                onClick={() => handleExerciseClick(exercise)}
                className="flex h-28 w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm transition active:scale-[0.99]"
              >
                <ExerciseGif
                  src={exercise.exerciseDemoGif}
                  alt={exercise.exerciseName || 'Exercise demo'}
                />

                <div className="flex min-w-0 flex-1 items-stretch justify-between px-4 py-3">
                  <div className="flex min-w-0 flex-col justify-center">
                    <p className="text-base font-bold text-slate-900 break-words">
                      {exercise.exerciseName}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {sets}x{repsMin}-{repsMax}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[#23a802]">
                      {weight}kg
                    </p>
                  </div>

                  <div className="ml-3 flex items-end">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
                      <ChevronRightIcon className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">No exercises found.</p>
      )}
    </section>
  )
}

export default WorkoutDayExercisesListSection