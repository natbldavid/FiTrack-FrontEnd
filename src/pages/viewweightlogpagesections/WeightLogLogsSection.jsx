import { useEffect, useMemo, useState } from 'react'
import { getWeightTrend } from '../../api/weightLogApi'

function TrendUpIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M21,6H17a1,1,0,0,0,0,2h1.59L13.5,13.09,10.91,10.5a2,2,0,0,0-2.82,0l-5.8,5.79a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l5.79-5.8,2.59,2.59a2,2,0,0,0,2.82,0L20,9.41V11a1,1,0,0,0,2,0V7A1,1,0,0,0,21,6Z" />
    </svg>
  )
}

function TrendDownIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M21,13a1,1,0,0,0-1,1v1.59l-5.29-5.3a1,1,0,0,0-1.42,0L11,12.59,3.71,5.29A1,1,0,0,0,2.29,6.71l8,8a1,1,0,0,0,1.42,0L14,12.41,18.59,17H17a1,1,0,0,0,0,2h4a1,1,0,0,0,1-1V14A1,1,0,0,0,21,13Z" />
    </svg>
  )
}

function TrendFlatIcon({ className = 'h-4 w-4' }) {
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
      <path d="M5 12h14" />
    </svg>
  )
}

const FILTER_OPTIONS = ['7D', '28D', '3M', 'All']

function FilterTab({ label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        isActive
          ? 'border-[#23a802] bg-[#23a802] text-white'
          : 'border-slate-200 bg-white text-slate-600'
      }`}
    >
      {label}
    </button>
  )
}

function ChangeBadge({ trend, changeLabel }) {
  const config =
    trend === 'up'
      ? {
          icon: TrendUpIcon,
          className: 'bg-amber-50 text-amber-600',
        }
      : trend === 'down'
      ? {
          icon: TrendDownIcon,
          className: 'bg-blue-50 text-blue-600',
        }
      : {
          icon: TrendFlatIcon,
          className: 'bg-slate-100 text-slate-600',
        }

  const Icon = config.icon

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{changeLabel}</span>
    </div>
  )
}

function WeightLogCard({ dateLabel, weightLabel, trend, changeLabel }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{dateLabel}</p>
          <p className="mt-1 text-lg font-bold text-black">{weightLabel}</p>
        </div>

        <div className="shrink-0">
          <ChangeBadge trend={trend} changeLabel={changeLabel} />
        </div>
      </div>
    </div>
  )
}

function EmptyStateCard({
  title = 'No weight logs in this range',
  description = 'Try another filter or add a new log.',
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  )
}

const formatDateLabel = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const isToday = date.toDateString() === today.toDateString()
  const isYesterday = date.toDateString() === yesterday.toDateString()

  const formatted = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  if (isToday) return `Today · ${formatted}`
  if (isYesterday) return `Yesterday · ${formatted}`

  return formatted
}

const formatWeight = (weight) => `${Number(weight).toFixed(1)} kg`

const formatChange = (diff) => {
  if (diff === 0) {
    return '0.0kg'
  }

  return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}kg`
}

const getStartOfDay = (date = new Date()) => {
  const normalizedDate = new Date(date)
  normalizedDate.setHours(0, 0, 0, 0)
  return normalizedDate
}

const getCutoffDateForFilter = (filter) => {
  const today = getStartOfDay()

  if (filter === '7D') {
    const cutoff = new Date(today)
    cutoff.setDate(today.getDate() - 6)
    return cutoff
  }

  if (filter === '28D') {
    const cutoff = new Date(today)
    cutoff.setDate(today.getDate() - 27)
    return cutoff
  }

  if (filter === '3M') {
    const cutoff = new Date(today)
    cutoff.setMonth(today.getMonth() - 3)
    return cutoff
  }

  return null
}

function WeightLogLogsSection() {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('28D')

  useEffect(() => {
    const loadLogs = async () => {
      setIsLoading(true)

      try {
        const data = await getWeightTrend()
        setLogs(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Could not load weight logs.', error)
        setLogs([])
      } finally {
        setIsLoading(false)
      }
    }

    loadLogs()
  }, [])

  const processedLogs = useMemo(() => {
    const sorted = [...logs]
      .filter(
        (log) =>
          log?.logDate &&
          typeof log?.weight === 'number' &&
          log.weight > 0
      )
      .sort((a, b) => new Date(b.logDate) - new Date(a.logDate))

    return sorted.map((log, index) => {
      const previousLog = sorted[index + 1]

      const diff =
        previousLog && typeof previousLog.weight === 'number'
          ? log.weight - previousLog.weight
          : 0

      let trend = 'flat'
      if (diff > 0) trend = 'up'
      if (diff < 0) trend = 'down'

      return {
        id: log.logDate,
        logDate: log.logDate,
        dateLabel: formatDateLabel(log.logDate),
        weightLabel: formatWeight(log.weight),
        changeLabel: formatChange(diff),
        trend,
      }
    })
  }, [logs])

  const filteredLogs = useMemo(() => {
    const cutoffDate = getCutoffDateForFilter(activeFilter)

    if (!cutoffDate) {
      return processedLogs
    }

    return processedLogs.filter((log) => {
      const logDate = new Date(log.logDate)
      logDate.setHours(0, 0, 0, 0)
      return logDate >= cutoffDate
    })
  }, [processedLogs, activeFilter])

  const hasAnyLogs = processedLogs.length > 0

  return (
    <section className="px-1 pt-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h3 className="text-base font-semibold text-black">Weight Logs</h3>
          <p className="text-xs text-slate-500">
            Browse daily weight entries
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <FilterTab
              key={option}
              label={option}
              isActive={option === activeFilter}
              onClick={() => setActiveFilter(option)}
            />
          ))}
        </div>

        {isLoading ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm text-slate-500">Loading weight logs...</p>
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="mt-4 space-y-3">
            {filteredLogs.map((log) => (
              <WeightLogCard
                key={log.id}
                dateLabel={log.dateLabel}
                weightLabel={log.weightLabel}
                trend={log.trend}
                changeLabel={log.changeLabel}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyStateCard
              title={
                hasAnyLogs
                  ? 'No weight logs in this range'
                  : 'No weight logs yet'
              }
              description={
                hasAnyLogs
                  ? 'Try another filter or add a new log.'
                  : 'Add your first log to start tracking progress.'
              }
            />
          </div>
        )}
      </div>
    </section>
  )
}

export default WeightLogLogsSection