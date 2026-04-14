import { useEffect, useMemo, useState } from 'react'
import { getWorkoutSessions, getWorkoutSessionById } from '../../api/workoutSessionApi'

const formatDisplayDate = (dateString) => {
  if (!dateString) {
    return '—'
  }

  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

const isCompletedSession = (session) => {
  return session?.completedAt !== null && session?.completedAt !== undefined
}

const roundToTwoDecimals = (value) => {
  return Math.round(value * 100) / 100
}

const formatScore = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—'
  }

  return roundToTwoDecimals(value).toFixed(2)
}

const formatPercentChange = (value) => {
  if (value == null || Number.isNaN(value)) {
    return '—'
  }

  const rounded = roundToTwoDecimals(value)
  const sign = rounded > 0 ? '+' : ''
  return `${sign}${rounded.toFixed(2)}%`
}

const getPercentChange = (currentScore, previousScore) => {
  if (
    typeof currentScore !== 'number' ||
    typeof previousScore !== 'number' ||
    Number.isNaN(currentScore) ||
    Number.isNaN(previousScore) ||
    previousScore <= 0
  ) {
    return null
  }

  return ((currentScore - previousScore) / previousScore) * 100
}

const getProgressiveOverloadEntry = (session, exerciseId) => {
  const matchingExercise = session?.exercises?.find(
    (item) => String(item.exerciseId) === String(exerciseId)
  )

  if (!matchingExercise || !session?.sessionDate) {
    return null
  }

  const completedSets = Array.isArray(matchingExercise.sets)
    ? matchingExercise.sets.filter(
        (set) =>
          set?.completed &&
          typeof set?.reps === 'number' &&
          set.reps > 0
      )
    : []

  const setsWithWeight = completedSets.filter(
    (set) => typeof set?.weight === 'number' && set.weight > 0
  )

  const maxWeightFromSets = setsWithWeight.length
    ? Math.max(...setsWithWeight.map((set) => set.weight))
    : null

  const fallbackWeight =
    typeof matchingExercise.actualWorkingWeight === 'number' &&
    matchingExercise.actualWorkingWeight > 0
      ? matchingExercise.actualWorkingWeight
      : typeof matchingExercise.plannedWorkingWeight === 'number' &&
          matchingExercise.plannedWorkingWeight > 0
        ? matchingExercise.plannedWorkingWeight
        : null

  const maxWeight = maxWeightFromSets ?? fallbackWeight

  const totalReps = completedSets.reduce((sum, set) => sum + set.reps, 0)
  const bestSetReps = completedSets.length
    ? Math.max(...completedSets.map((set) => set.reps))
    : 0

  if (!maxWeight || totalReps <= 0 || bestSetReps <= 0) {
    return null
  }

  const score = maxWeight * (1 + bestSetReps / 30)

  return {
    sessionId: session.id,
    sessionDate: session.sessionDate,
    maxWeight,
    totalReps,
    bestSetReps,
    score,
  }
}

function TrendIcon({ direction }) {
  if (direction === 'up') {
    return (
      <svg
        className="h-4 w-4 text-emerald-600"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 3a1 1 0 0 1 .707.293l5 5a1 1 0 1 1-1.414 1.414L11 6.414V16a1 1 0 1 1-2 0V6.414L5.707 9.707A1 1 0 0 1 4.293 8.293l5-5A1 1 0 0 1 10 3Z"
          clipRule="evenodd"
        />
      </svg>
    )
  }

  if (direction === 'down') {
    return (
      <svg
        className="h-4 w-4 text-rose-600"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 17a1 1 0 0 1-.707-.293l-5-5a1 1 0 0 1 1.414-1.414L9 13.586V4a1 1 0 1 1 2 0v9.586l3.293-3.293a1 1 0 0 1 1.414 1.414l-5 5A1 1 0 0 1 10 17Z"
          clipRule="evenodd"
        />
      </svg>
    )
  }

  return (
    <svg
      className="h-4 w-4 text-slate-400"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4 10a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Z" />
    </svg>
  )
}

function ExerciseWeightTrendSection({ workoutDayId, exerciseId, exerciseName }) {
  const [sessionEntries, setSessionEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProgressiveOverload = async () => {
      setIsLoading(true)

      try {
        const sessionSummaries = await getWorkoutSessions()

        const completedSessionIds = Array.isArray(sessionSummaries)
          ? sessionSummaries
              .filter(isCompletedSession)
              .map((session) => session.id)
          : []

        const sessionDetails = await Promise.all(
          completedSessionIds.map((id) => getWorkoutSessionById(id))
        )

        const matchingSessions = sessionDetails
          .filter(isCompletedSession)
          .filter(
            (session) => String(session?.workoutDayId) === String(workoutDayId)
          )
          .map((session) => getProgressiveOverloadEntry(session, exerciseId))
          .filter(Boolean)
          .sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate))

        setSessionEntries(matchingSessions)
      } catch (error) {
        console.error('Could not load progressive overload data.', error)
        setSessionEntries([])
      } finally {
        setIsLoading(false)
      }
    }

    loadProgressiveOverload()
  }, [exerciseId, workoutDayId])

  const tableRows = useMemo(() => {
    const lastTwelveAscending = sessionEntries.slice(-12)

    const withPercentChange = lastTwelveAscending.map((entry, index, entries) => {
      const previousEntry = index > 0 ? entries[index - 1] : null
      const percentChange = previousEntry
        ? getPercentChange(entry.score, previousEntry.score)
        : null

      let direction = 'level'
      if (percentChange != null) {
        if (percentChange > 0.01) {
          direction = 'up'
        } else if (percentChange < -0.01) {
          direction = 'down'
        }
      }

      return {
        ...entry,
        percentChange,
        direction,
      }
    })

    return [...withPercentChange].reverse()
  }, [sessionEntries])

  return (
    <section className="px-0 pt-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h3 className="text-base font-semibold text-black">
            Progressive Overload
          </h3>
          <p className="text-xs text-slate-500">Last 12 sessions</p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                  Date
                </th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                  W
                </th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                  R
                </th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                  Score
                </th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                  % Increased
                </th>
              </tr>
            </thead>

            <tbody>
              {!isLoading && tableRows.length ? (
                tableRows.map((entry) => (
                  <tr key={entry.sessionId} className="align-middle">
                    <td className="border-b border-slate-100 px-3 py-3 text-slate-700">
                      {formatDisplayDate(entry.sessionDate)}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-3 text-slate-700">
                      {entry.maxWeight}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-3 text-slate-700">
                      {entry.totalReps}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-3 text-slate-700">
                      {formatScore(entry.score)}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-3">
                      <div className="flex items-center gap-2">
                        <TrendIcon direction={entry.direction} />
                        <span
                          className={
                            entry.direction === 'up'
                              ? 'text-emerald-600'
                              : entry.direction === 'down'
                                ? 'text-rose-600'
                                : 'text-slate-500'
                          }
                        >
                          {formatPercentChange(entry.percentChange)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : null}
            </tbody>
          </table>
        </div>

        {!isLoading && !tableRows.length ? (
          <p className="mt-2 text-sm text-slate-500">
            No progressive overload history found for {exerciseName}.
          </p>
        ) : null}

        {isLoading ? (
          <p className="mt-2 text-sm text-slate-500">Loading history...</p>
        ) : null}
      </div>
    </section>
  )
}

export default ExerciseWeightTrendSection