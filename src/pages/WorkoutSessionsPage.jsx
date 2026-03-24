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

function WorkoutSessionsPage() {
  const navigate = useNavigate()
  const { sessionId } = useParams()

  const [session, setSession] = useState(null)
  const [activityMinutes, setActivityMinutes] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

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

                  return (
                    <div
                      key={exercise.id}
                      className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
                    >
                      <div className="mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">
                          {exercise.exerciseNameSnapshot}
                        </h2>

                        <p className="mt-1 text-sm text-slate-600">
                          Planned weight: {formatWeight(exercise.plannedWorkingWeight)}
                        </p>
                      </div>

                      {sets.length === 0 ? (
                        <p className="text-sm text-slate-600">
                          No sets recorded for this exercise.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {sets.map((set) => (
                            <div
                              key={set.id}
                              className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"
                            >
                              <p className="text-sm font-semibold text-slate-900">
                                Set {set.setNumber}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                Reps: {set.reps}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                Weight: {formatWeight(set.weight)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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