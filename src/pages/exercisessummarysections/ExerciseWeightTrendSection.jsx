import { useEffect, useMemo, useState } from 'react'
import { getWorkoutSessions, getWorkoutSessionById } from '../../api/workoutSessionApi'

const CHART_WIDTH = 320
const CHART_HEIGHT = 180
const LEFT_PADDING = 34
const RIGHT_PADDING = 12
const TOP_PADDING = 14
const BOTTOM_PADDING = 28

const formatDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatAxisDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}`
}

const getStartOfDay = (date = new Date()) => {
  const normalizedDate = new Date(date)
  normalizedDate.setHours(0, 0, 0, 0)
  return normalizedDate
}

const parseDateStringAsLocalDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const getLast90Days = (endDate) => {
  const dates = []
  const anchorDate = getStartOfDay(endDate)

  for (let i = 89; i >= 0; i -= 1) {
    const date = new Date(anchorDate)
    date.setDate(anchorDate.getDate() - i)
    dates.push(date)
  }

  return dates
}

const getXAxisDates = (endDate) => {
  const anchorDate = getStartOfDay(endDate)

  const minus28 = new Date(anchorDate)
  minus28.setDate(anchorDate.getDate() - 28)

  const minus56 = new Date(anchorDate)
  minus56.setDate(anchorDate.getDate() - 56)

  const minus84 = new Date(anchorDate)
  minus84.setDate(anchorDate.getDate() - 84)

  return [minus84, minus56, minus28, anchorDate]
}

const getNiceYAxisValues = (weights) => {
  if (!weights.length) {
    return [100, 75, 50, 25]
  }

  const minWeight = Math.min(...weights)
  const maxWeight = Math.max(...weights)

  if (minWeight === maxWeight) {
    const top = Math.ceil((maxWeight + 5) / 5) * 5
    const bottom = Math.max(0, Math.floor((minWeight - 5) / 5) * 5)
    const step = (top - bottom) / 3 || 1

    return [
      Math.round(top),
      Math.round(top - step),
      Math.round(top - step * 2),
      Math.round(bottom),
    ]
  }

  const range = maxWeight - minWeight
  const paddedMin = Math.max(0, minWeight - range * 0.15)
  const paddedMax = maxWeight + range * 0.15
  const step = (paddedMax - paddedMin) / 3

  return [
    Math.round(paddedMax),
    Math.round(paddedMax - step),
    Math.round(paddedMax - step * 2),
    Math.round(paddedMin),
  ]
}

const buildChartPoints = (entries, yAxisValues, endDate) => {
  const dates = getLast90Days(endDate)
  const chartInnerWidth = CHART_WIDTH - LEFT_PADDING - RIGHT_PADDING
  const chartInnerHeight = CHART_HEIGHT - TOP_PADDING - BOTTOM_PADDING

  const yMin = yAxisValues[3]
  const yMax = yAxisValues[0]
  const yRange = yMax - yMin || 1

  const entryMap = new Map(entries.map((entry) => [entry.logDate, entry.weight]))

  return dates
    .map((date, index) => {
      const key = formatDateKey(date)
      const weight = entryMap.get(key)

      if (weight == null) {
        return null
      }

      const x =
        LEFT_PADDING + (index / (dates.length - 1)) * chartInnerWidth

      const y =
        TOP_PADDING +
        ((yMax - weight) / yRange) * chartInnerHeight

      return {
        x,
        y,
        key,
        weight,
      }
    })
    .filter(Boolean)
}

const buildLinePath = (points) => {
  if (points.length < 2) {
    return ''
  }

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
}

const isCompletedSession = (session) => {
  return session?.completedAt !== null && session?.completedAt !== undefined
}

function ExerciseWeightTrendSection({ workoutDayId, exerciseId, exerciseName }) {
  const [weightEntries, setWeightEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadWeightTrend = async () => {
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

        const matchingEntries = sessionDetails
          .filter(isCompletedSession)
          .filter(
            (session) => String(session?.workoutDayId) === String(workoutDayId)
          )
          .flatMap((session) => {
            const matchingExercise = session?.exercises?.find(
              (item) => String(item.exerciseId) === String(exerciseId)
            )

            if (!matchingExercise) {
              return []
            }

            const weight =
              typeof matchingExercise.actualWorkingWeight === 'number' &&
              matchingExercise.actualWorkingWeight > 0
                ? matchingExercise.actualWorkingWeight
                : typeof matchingExercise.plannedWorkingWeight === 'number' &&
                    matchingExercise.plannedWorkingWeight > 0
                  ? matchingExercise.plannedWorkingWeight
                  : null

            if (!weight || !session?.sessionDate) {
              return []
            }

            return [
              {
                logDate: session.sessionDate,
                weight,
              },
            ]
          })
          .sort((a, b) => new Date(a.logDate) - new Date(b.logDate))

        setWeightEntries(matchingEntries)
      } catch (error) {
        console.error('Could not load exercise trend.', error)
        setWeightEntries([])
      } finally {
        setIsLoading(false)
      }
    }

    loadWeightTrend()
  }, [exerciseId, workoutDayId])

  const selectedDate = getStartOfDay(new Date())

  const filteredEntries = useMemo(() => {
    const anchorDate = getStartOfDay(selectedDate)
    const cutoff = new Date(anchorDate)
    cutoff.setDate(anchorDate.getDate() - 89)

    return weightEntries
      .filter(
        (entry) =>
          entry?.logDate &&
          typeof entry?.weight === 'number' &&
          entry.weight > 0
      )
      .filter((entry) => {
        const entryDate = parseDateStringAsLocalDate(entry.logDate)
        entryDate.setHours(0, 0, 0, 0)
        return entryDate >= cutoff && entryDate <= anchorDate
      })
  }, [selectedDate, weightEntries])

  const weights = filteredEntries.map((entry) => entry.weight)
  const yAxisValues = getNiceYAxisValues(weights)
  const points = buildChartPoints(filteredEntries, yAxisValues, selectedDate)
  const linePath = buildLinePath(points)
  const xAxisDates = getXAxisDates(selectedDate)

  const chartInnerHeight = CHART_HEIGHT - TOP_PADDING - BOTTOM_PADDING
  const chartInnerWidth = CHART_WIDTH - LEFT_PADDING - RIGHT_PADDING

  const gridYPositions = [0, 1, 2, 3].map(
    (index) => TOP_PADDING + (index / 3) * chartInnerHeight
  )

  const xLabelPositions = [0, 1, 2, 3].map(
    (index) => LEFT_PADDING + (index / 3) * chartInnerWidth
  )

  const fallbackDot = {
    x: LEFT_PADDING,
    y: TOP_PADDING + chartInnerHeight / 2,
  }

  return (
    <section className="px-0 pt-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h3 className="text-base font-semibold text-black">Weight Trend</h3>
          <p className="text-xs text-slate-500">Last 90 days</p>
        </div>

        <div className="mt-4 w-full">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="h-52 w-full"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {gridYPositions.map((y, index) => (
              <g key={index}>
                <text
                  x={LEFT_PADDING - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#94a3b8"
                >
                  {yAxisValues[index]}
                </text>

                <line
                  x1={LEFT_PADDING}
                  y1={y}
                  x2={CHART_WIDTH - RIGHT_PADDING}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              </g>
            ))}

            {linePath ? (
              <path
                d={linePath}
                fill="none"
                stroke="#23a802"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ) : null}

            {points.length ? (
              points.map((point) => (
                <circle
                  key={point.key}
                  cx={point.x}
                  cy={point.y}
                  r="3"
                  fill="#23a802"
                />
              ))
            ) : !isLoading ? (
              <circle
                cx={fallbackDot.x}
                cy={fallbackDot.y}
                r="3"
                fill="#23a802"
              />
            ) : null}

            {xLabelPositions.map((x, index) => (
              <text
                key={index}
                x={x}
                y={CHART_HEIGHT - 6}
                textAnchor={
                  index === 0 ? 'start' : index === 3 ? 'end' : 'middle'
                }
                fontSize="11"
                fill="#94a3b8"
              >
                {formatAxisDate(xAxisDates[index])}
              </text>
            ))}
          </svg>
        </div>

        {!isLoading && !filteredEntries.length ? (
          <p className="mt-2 text-sm text-slate-500">
            No weight history found for {exerciseName}.
          </p>
        ) : null}
      </div>
    </section>
  )
}

export default ExerciseWeightTrendSection