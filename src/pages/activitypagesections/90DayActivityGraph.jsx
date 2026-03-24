import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../routes/routePaths'
import { getDailyActivityMinutesTrend } from '../../api/activityLogApi'

const CHART_WIDTH = 320
const CHART_HEIGHT = 180
const LEFT_PADDING = 34
const RIGHT_PADDING = 12
const TOP_PADDING = 14
const BOTTOM_PADDING = 28

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
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

const getLast14Days = (endDate) => {
  const dates = []
  const anchorDate = getStartOfDay(endDate)

  for (let i = 13; i >= 0; i -= 1) {
    const date = new Date(anchorDate)
    date.setDate(anchorDate.getDate() - i)
    dates.push(date)
  }

  return dates
}

const getXAxisDates = (endDate) => {
  const anchorDate = getStartOfDay(endDate)

  const minus13 = new Date(anchorDate)
  minus13.setDate(anchorDate.getDate() - 13)

  const minus9 = new Date(anchorDate)
  minus9.setDate(anchorDate.getDate() - 9)

  const minus4 = new Date(anchorDate)
  minus4.setDate(anchorDate.getDate() - 4)

  return [minus13, minus9, minus4, anchorDate]
}

const getNiceYAxisValues = (minutes) => {
  if (!minutes.length) {
    return [120, 80, 40, 0]
  }

  const maxMinutes = Math.max(...minutes)

  if (maxMinutes <= 0) {
    return [120, 80, 40, 0]
  }

  const roundedTop = Math.ceil(maxMinutes / 10) * 10
  const paddedTop = Math.max(roundedTop, 40)

  return [
    paddedTop,
    Math.round((paddedTop * 2) / 3),
    Math.round(paddedTop / 3),
    0,
  ]
}

const buildChartPoints = (entries, yAxisValues, endDate) => {
  const dates = getLast14Days(endDate)
  const chartInnerWidth = CHART_WIDTH - LEFT_PADDING - RIGHT_PADDING
  const chartInnerHeight = CHART_HEIGHT - TOP_PADDING - BOTTOM_PADDING

  const yMin = yAxisValues[3]
  const yMax = yAxisValues[0]
  const yRange = yMax - yMin || 1

  const entryMap = new Map(
    entries.map((entry) => [entry.logDate, entry.totalMinutes])
  )

  return dates.map((date, index) => {
    const key = formatDateKey(date)
    const totalMinutes = entryMap.get(key) ?? 0

    const x = LEFT_PADDING + (index / (dates.length - 1)) * chartInnerWidth

    const y =
      TOP_PADDING + ((yMax - totalMinutes) / yRange) * chartInnerHeight

    return {
      x,
      y,
      key,
      totalMinutes,
    }
  })
}

const buildLinePath = (points) => {
  if (points.length < 2) {
    return ''
  }

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
}

const buildDailyTotals = (logs) => {
  const totalsMap = new Map()

  logs.forEach((log) => {
    if (!log?.logDate) return
    if (typeof log?.durationMinutes !== 'number') return
    if (log.durationMinutes < 0) return

    const currentTotal = totalsMap.get(log.logDate) ?? 0
    totalsMap.set(log.logDate, currentTotal + log.durationMinutes)
  })

  return Array.from(totalsMap.entries())
    .map(([logDate, totalMinutes]) => ({
      logDate,
      totalMinutes,
    }))
    .sort((a, b) => new Date(a.logDate) - new Date(b.logDate))
}

function NinetyDayActivityGraph({ selectedDate }) {
  const [activityLogs, setActivityLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadActivityTrend = async () => {
      setIsLoading(true)

      try {
        const trendData = await getDailyActivityMinutesTrend()
        setActivityLogs(Array.isArray(trendData) ? trendData : [])
      } catch (error) {
        console.error('Could not load activity trend.', error)
        setActivityLogs([])
      } finally {
        setIsLoading(false)
      }
    }

    loadActivityTrend()
  }, [])

  const anchorDate = useMemo(() => {
    const today = getStartOfDay(new Date())
    const selectedAnchor = getStartOfDay(selectedDate)
    return selectedAnchor > today ? today : selectedAnchor
  }, [selectedDate])

  const filteredEntries = useMemo(() => {
    const dailyTotals = buildDailyTotals(activityLogs)
    const totalsMap = new Map(
      dailyTotals.map((entry) => [entry.logDate, entry.totalMinutes])
    )

    return getLast14Days(anchorDate).map((date) => {
      const key = formatDateKey(date)

      return {
        logDate: key,
        totalMinutes: totalsMap.get(key) ?? 0,
      }
    })
  }, [activityLogs, anchorDate])

  const minuteValues = filteredEntries.map((entry) => entry.totalMinutes)
  const yAxisValues = getNiceYAxisValues(minuteValues)
  const points = buildChartPoints(filteredEntries, yAxisValues, anchorDate)
  const linePath = buildLinePath(points)
  const xAxisDates = getXAxisDates(anchorDate)

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
    y: TOP_PADDING + chartInnerHeight,
  }

  return (
    <section className="px-4 pt-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-black">
              Daily Activity Summary
            </h3>
            <p className="text-xs text-slate-500">Last 14 days</p>
          </div>

          <Link
            to={ROUTES.LOG_ACTIVITY}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            aria-label="Go to today page"
          >
            <PlusIcon />
          </Link>
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
                stroke="#22c55e"
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
                  fill="#22c55e"
                />
              ))
            ) : !isLoading ? (
              <circle
                cx={fallbackDot.x}
                cy={fallbackDot.y}
                r="3"
                fill="#22c55e"
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
      </div>
    </section>
  )
}

export default NinetyDayActivityGraph