import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import WorkoutSessionsHeaderSection from './workoutsessionsections/WorkoutSessionsHeaderSection'
import { ROUTES } from '../routes/routePaths'
import { getWorkoutSessionById } from '../api/workoutSessionApi'
import { getActivityLogs } from '../api/activityLogApi'

const formatMinutesLabel = (minutes) => {
  const safeMinutes = Number(minutes) || 0
  return `${safeMinutes} min`
}

const formatWeight = (weight) => {
  const safeWeight = Number(weight) || 0
  return `${safeWeight} kg`
}

function ChevronIcon({ isOpen }) {
  return (
    <span
      className={`flex items-center transition-transform duration-200 ${
        isOpen ? 'rotate-180' : 'rotate-0'
      }`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 -6 524 524"
        className="h-4 w-4 text-slate-700"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M64 191L98 157 262 320 426 157 460 191 262 387 64 191Z" />
      </svg>
    </span>
  )
}

function SectionCard({ title, isOpen, onToggle, children }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-slate-50"
      >
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>

        <div className="ml-4 flex items-center">
          <ChevronIcon isOpen={isOpen} />
        </div>
      </button>

      {isOpen ? <div className="px-5 pb-5">{children}</div> : null}
    </div>
  )
}

function WorkoutSessionsPage() {
  const navigate = useNavigate()
  const { sessionId } = useParams()

  const [session, setSession] = useState(null)
  const [activityMinutes, setActivityMinutes] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [openExercises, setOpenExercises] = useState({})

  useEffect(() => {
    const loadWorkoutSession = async () => {
      if (!sessionId) {
        setError('No session id provided.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const [sessionData, activityLogsData] = await Promise.all([
          getWorkoutSessionById(sessionId),
          getActivityLogs(),
        ])

        const normalizedActivityLogs = Array.isArray(activityLogsData)
          ? activityLogsData
          : []

        const sessionDate = sessionData?.sessionDate

        const totalMinutesForDate = normalizedActivityLogs
          .filter((log) => log?.logDate === sessionDate)
          .reduce((sum, log) => sum + (Number(log?.durationMinutes) || 0), 0)

        setSession(sessionData)
        setActivityMinutes(totalMinutesForDate)
      } catch (err) {
        console.error(err)
        setError('Could not load workout session details.')
        setSession(null)
        setActivityMinutes(0)
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkoutSession()
  }, [sessionId])

  const exercises = useMemo(() => {
    return Array.isArray(session?.exercises) ? session.exercises : []
  }, [session])

  useEffect(() => {
    setOpenExercises((current) => {
      const next = {}

      exercises.forEach((exercise) => {
        next[exercise.id] = current[exercise.id] ?? false
      })

      return next
    })
  }, [exercises])

  function toggleExercise(exerciseId) {
    setOpenExercises((current) => ({
      ...current,
      [exerciseId]: !current[exerciseId],
    }))
  }

  return (
    <div className="min-h-screen w-screen bg-slate-100">
      <div className="mx-auto w-full max-w-4xl px-4 py-4">
        <WorkoutSessionsHeaderSection
          title="Workout Session"
          onBack={() => navigate(ROUTES.GYM_DIARY)}
        />

        {isLoading ? (
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm text-slate-600">Loading workout session...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : !session ? (
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm text-slate-600">Workout session not found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <h1 className="text-xl font-bold text-slate-900">
                {session.sessionName}
              </h1>

              <p className="mt-2 text-sm text-slate-600">
                Exercise length: {formatMinutesLabel(activityMinutes)}
              </p>
            </div>

            {exercises.length === 0 ? (
              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <p className="text-sm text-slate-600">
                  No exercises found for this session.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {exercises.map((exercise) => {
                  const sets = Array.isArray(exercise?.sets) ? exercise.sets : []
                  const isOpen = openExercises[exercise.id] ?? false

                  return (
                    <SectionCard
                      key={exercise.id}
                      title={exercise.exerciseNameSnapshot}
                      isOpen={isOpen}
                      onToggle={() => toggleExercise(exercise.id)}
                    >
                      <div className="space-y-4">
                        <div className="rounded-2xl bg-slate-50 px-4 py-3">
                          <p className="text-sm font-medium text-slate-700">
                            Planned weight:{' '}
                            {formatWeight(exercise.plannedWorkingWeight)}
                          </p>
                        </div>

                        {sets.length === 0 ? (
                          <p className="text-sm text-slate-600">
                            No sets recorded for this exercise.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {sets.map((set) => (
                              <div
                                key={set.id}
                                className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                              >
                                <p className="text-sm font-semibold text-slate-900">
                                  Set {set.setNumber}
                                </p>

                                <div className="mt-3 grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs font-medium text-slate-500">
                                      Reps
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-slate-700">
                                      {set.reps}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs font-medium text-slate-500">
                                      Weight
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-slate-700">
                                      {formatWeight(set.weight)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </SectionCard>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkoutSessionsPage