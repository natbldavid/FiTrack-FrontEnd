import { useEffect, useMemo, useState } from 'react'
import { getWeightTrend } from '../../api/weightLogApi'

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

const getLast28Days = (endDate) => {
  const dates = []
  const anchorDate = getStartOfDay(endDate)

  for (let i = 27; i >= 0; i -= 1) {
    const date = new Date(anchorDate)
    date.setDate(anchorDate.getDate() - i)
    dates.push(date)
  }

  return dates
}

const getXAxisDates = (endDate) => {
  const anchorDate = getStartOfDay(endDate)

  const minus9 = new Date(anchorDate)
  minus9.setDate(anchorDate.getDate() - 9)

  const minus18 = new Date(anchorDate)
  minus18.setDate(anchorDate.getDate() - 18)

  const minus27 = new Date(anchorDate)
  minus27.setDate(anchorDate.getDate() - 27)

  return [minus27, minus18, minus9, anchorDate]
}

const getNiceYAxisValues = (mostRecentWeight) => {
  if (typeof mostRecentWeight !== 'number' || mostRecentWeight <= 0) {
    return [88, 86, 84, 82]
  }

  const anchor = Math.floor(mostRecentWeight)

  return [anchor + 3, anchor + 1, anchor - 1, anchor - 3]
}

const buildChartPoints = (entries, yAxisValues, endDate) => {
  const dates = getLast28Days(endDate)
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

      const x = LEFT_PADDING + (index / (dates.length - 1)) * chartInnerWidth
      const y =
        TOP_PADDING + ((yMax - weight) / yRange) * chartInnerHeight

      return {
        x,
        y,
        key,
        weight,
      }
    })
    .filter(Boolean)
}

const buildSmoothLinePath = (points) => {
  if (points.length === 0) {
    return ''
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`
  }

  let path = `M ${points[0].x} ${points[0].y}`

  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i]
    const next = points[i + 1]
    const controlX = (current.x + next.x) / 2

    path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`
  }

  return path
}

const buildAreaPath = (points) => {
  if (points.length === 0) {
    return ''
  }

  const linePath = buildSmoothLinePath(points)
  const bottomY = CHART_HEIGHT - BOTTOM_PADDING
  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]

  return `${linePath} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z`
}

function WeightLogTrendGraphSection({ selectedDate }) {
  const [weightEntries, setWeightEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadWeightTrend = async () => {
      setIsLoading(true)

      try {
        const trendData = await getWeightTrend()
        setWeightEntries(Array.isArray(trendData) ? trendData : [])
      } catch (error) {
        console.error('Could not load weight trend.', error)
        setWeightEntries([])
      } finally {
        setIsLoading(false)
      }
    }

    loadWeightTrend()
  }, [])

  const filteredEntries = useMemo(() => {
    const anchorDate = getStartOfDay(selectedDate)
    const cutoff = new Date(anchorDate)
    cutoff.setDate(anchorDate.getDate() - 27)

    return weightEntries
      .filter(
        (entry) =>
          entry?.logDate &&
          typeof entry?.weight === 'number' &&
          entry.weight > 0
      )
      .filter((entry) => {
        const entryDate = new Date(entry.logDate)
        entryDate.setHours(0, 0, 0, 0)
        return entryDate >= cutoff && entryDate <= anchorDate
      })
      .sort((a, b) => new Date(a.logDate) - new Date(b.logDate))
  }, [weightEntries, selectedDate])

  const mostRecentWeight =
    filteredEntries.length > 0
      ? filteredEntries[filteredEntries.length - 1].weight
      : null

  const yAxisValues = getNiceYAxisValues(mostRecentWeight)
  const points = buildChartPoints(filteredEntries, yAxisValues, selectedDate)
  const linePath = buildSmoothLinePath(points)
  const areaPath = buildAreaPath(points)
  const xAxisDates = getXAxisDates(selectedDate)

  const chartInnerHeight = CHART_HEIGHT - TOP_PADDING - BOTTOM_PADDING
  const chartInnerWidth = CHART_WIDTH - LEFT_PADDING - RIGHT_PADDING

  const gridYPositions = [0, 1, 2, 3].map(
    (index) => TOP_PADDING + (index / 3) * chartInnerHeight
  )

  const xLabelPositions = [0, 1, 2, 3].map(
    (index) => LEFT_PADDING + (index / 3) * chartInnerWidth
  )

  return (
    <section className="px-1 pt-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-black">Weight Trend</h3>
            <p className="text-xs text-slate-500">Last 28 days</p>
          </div>
        </div>

        <div className="mt-4 w-full">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="h-52 w-full"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="weightTrendAreaGradient"
                x1="0"
                y1={TOP_PADDING}
                x2="0"
                y2={CHART_HEIGHT - BOTTOM_PADDING}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
                <stop offset="55%" stopColor="#22c55e" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
              </linearGradient>
            </defs>

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

            {areaPath ? (
              <path d={areaPath} fill="url(#weightTrendAreaGradient)" />
            ) : null}

            {linePath ? (
              <path
                d={linePath}
                fill="none"
                stroke="#22c55e"
                strokeWidth="2.75"
                strokeLinejoin="round"
                strokeLinecap="round"
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

          {!isLoading && points.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No weight logs yet.</p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default WeightLogTrendGraphSection