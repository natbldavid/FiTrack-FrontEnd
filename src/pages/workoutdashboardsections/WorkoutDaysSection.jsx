import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWorkoutDays } from '../../api/workoutDaysApi'
import { ROUTES } from '../../routes/routePaths'

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

const formatLastCompletedDate = (dateString) => {
  if (!dateString) {
    return 'Not completed yet'
  }

  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  if (Number.isNaN(date.getTime())) {
    return 'Not completed yet'
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function WorkoutDaysSection() {
  const navigate = useNavigate()

  const [workoutDays, setWorkoutDays] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadWorkoutDays = async () => {
      setIsLoading(true)
      setError('')

      try {
        const data = await getWorkoutDays()
        const normalizedData = Array.isArray(data) ? data : []

        const sortedData = [...normalizedData].sort(
          (a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0)
        )

        setWorkoutDays(sortedData)
      } catch (err) {
        console.error(err)
        setError('Could not load workout days.')
        setWorkoutDays([])
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkoutDays()
  }, [])

  if (isLoading) {
    return <div className="px-4 py-4 text-sm text-slate-500">Loading...</div>
  }

  if (error) {
    return <div className="px-4 py-4 text-sm text-red-600">{error}</div>
  }

  return (
    <section className="pt-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-black">Workout Days</h3>
          </div>
        </div>

        {workoutDays.length ? (
          <div className="mt-4 space-y-3">
            {workoutDays.map((workoutDay) => (
              <button
                key={workoutDay.id}
                type="button"
                onClick={() =>
  navigate(
    ROUTES.WORKOUT_DAY_EXERCISES.replace(
      ':workoutDayId',
      String(workoutDay.id)
    )
  )
}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition active:scale-[0.99]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-black">
                    {workoutDay.name || 'Workout Day'}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {workoutDay.muscleFocus || 'No muscle focus set'}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Last completed: {formatLastCompletedDate(workoutDay.lastCompletedDate)}
                  </p>
                </div>

                <ChevronRightIcon className="ml-3 h-5 w-5 shrink-0 text-slate-400" />
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            No workout days. Add some below.
          </p>
        )}

        <button
          type="button"
          onClick={() => navigate(ROUTES.ADD_WORKOUT_DAY)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#23a802] px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.99]"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Workout Day</span>
        </button>
      </div>
    </section>
  )
}

export default WorkoutDaysSection