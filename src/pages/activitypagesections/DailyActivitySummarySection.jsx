import { useEffect, useMemo, useState } from 'react'
import { getActivityLogsByDate } from '../../api/activityLogApi'

const formatDateString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const ACTIVITY_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#06B6D4', // cyan
  '#F97316', // orange
  '#EC4899', // pink
]

const FALLBACK_RING_COLOR = '#E2E8F0'

const buildActivityBreakdown = (logs) => {
  const groupedMap = new Map()

  logs.forEach((log) => {
    const activityName = log.activityTypeName?.trim() || 'Activity'
    const currentMinutes = groupedMap.get(activityName) ?? 0
    groupedMap.set(activityName, currentMinutes + (log.durationMinutes ?? 0))
  })

  return Array.from(groupedMap.entries()).map(([name, minutes], index) => ({
    name,
    minutes,
    color: ACTIVITY_COLORS[index % ACTIVITY_COLORS.length],
  }))
}

const buildDonutSegments = (items, totalMinutes) => {
  if (!totalMinutes) return []

  let accumulatedPercent = 0

  return items.map((item, index) => {
    const rawPercent = (item.minutes / totalMinutes) * 100
    const percent =
      index === items.length - 1 ? 100 - accumulatedPercent : rawPercent

    const segment = {
      ...item,
      percent,
      dashArray: `${percent} ${100 - percent}`,
      dashOffset: -accumulatedPercent,
    }

    accumulatedPercent += percent
    return segment
  })
}

function DailyActivitySummarySection({ selectedDate }) {
  const [activityLogs, setActivityLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDailyActivityData = async () => {
      setIsLoading(true)
      setError('')

      try {
        const selectedDateString = formatDateString(selectedDate)
        const logs = await getActivityLogsByDate(selectedDateString)
        setActivityLogs(logs)
      } catch (err) {
        console.error(err)
        setError('Could not load activity data.')
      } finally {
        setIsLoading(false)
      }
    }

    loadDailyActivityData()
  }, [selectedDate])

  const activityBreakdown = useMemo(
    () => buildActivityBreakdown(activityLogs),
    [activityLogs]
  )

  const totalMinutes = useMemo(
    () =>
      activityBreakdown.reduce((total, activity) => total + activity.minutes, 0),
    [activityBreakdown]
  )

  const donutSegments = useMemo(
    () => buildDonutSegments(activityBreakdown, totalMinutes),
    [activityBreakdown, totalMinutes]
  )

  if (isLoading) {
    return <div className="px-4 py-4 text-sm text-slate-500">Loading...</div>
  }

  if (error) {
    return <div className="px-4 py-4 text-sm text-red-600">{error}</div>
  }

  return (
    <section className="px-4 pt-4">
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex h-40 w-40 shrink-0 items-center justify-center">
            <svg
              viewBox="0 0 120 120"
              className="-rotate-90 h-full w-full"
              aria-hidden="true"
            >
              <circle
                cx="60"
                cy="60"
                r="42"
                fill="none"
                stroke={FALLBACK_RING_COLOR}
                strokeWidth="6"
              />

              {donutSegments.map((segment) => (
                <circle
                  key={segment.name}
                  cx="60"
                  cy="60"
                  r="42"
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  pathLength="100"
                  strokeDasharray={segment.dashArray}
                  strokeDashoffset={segment.dashOffset}
                />
              ))}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold tracking-tight text-black">
                {totalMinutes}
              </span>
              <span className="mt-1 text-xs font-medium text-slate-500">
                Minutes
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            {activityBreakdown.length > 0 ? (
              <div className="space-y-3">
                {activityBreakdown.map((activity) => (
                  <div
                    key={activity.name}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: activity.color }}
                        aria-hidden="true"
                      />
                      <span className="truncate text-sm font-medium text-slate-700">
                        {activity.name}
                      </span>
                    </div>

                    <span className="shrink-0 text-sm font-semibold text-slate-900">
                      {activity.minutes} min
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center">
                <p className="text-sm text-slate-500">No activity logged.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default DailyActivitySummarySection