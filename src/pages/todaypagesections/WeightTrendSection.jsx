import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../routes/routePaths'
import { getWeightTrend } from '../../api/weightLogApi'

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
    return [100, 83, 67, 50]
  }

  const minWeight = Math.min(...weights)
  const maxWeight = Math.max(...weights)

  if (minWeight === maxWeight) {
    const top = Math.ceil((maxWeight + 6) / 5) * 5
    const bottom = Math.floor((minWeight - 6) / 5) * 5
    const step = (top - bottom) / 3

    return [
      Math.round(top),
      Math.round(top - step),
      Math.round(top - step * 2),
      Math.round(bottom),
    ]
  }

  const range = maxWeight - minWeight
  const paddedMin = minWeight - range * 0.15
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

function WeightTrendSection({ selectedDate }) {
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
    cutoff.setDate(anchorDate.getDate() - 89)

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
    <section className="px-4 pt-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-black">Weight Trend</h3>
            <p className="text-xs text-slate-500">Last 90 days</p>
          </div>

          <Link
            to={ROUTES.FOOD}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            aria-label="Go to food page"
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

export default WeightTrendSection