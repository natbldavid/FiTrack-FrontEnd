import { useEffect, useMemo, useState } from 'react'
import { getActivityLogs } from '../../api/activityLogApi'
import { getUserProfile } from '../../api/userApi'

const getStartOfDay = (date) => {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

const parseDateStringAsLocalDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const getStartOfWeek = (date) => {
  const normalizedDate = getStartOfDay(date)
  const dayOfWeek = normalizedDate.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const startOfWeek = new Date(normalizedDate)
  startOfWeek.setDate(normalizedDate.getDate() + mondayOffset)
  startOfWeek.setHours(0, 0, 0, 0)

  return startOfWeek
}

const getEndOfWeek = (date) => {
  const startOfWeek = getStartOfWeek(date)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  return endOfWeek
}

const isSameMonth = (date, referenceDate) => {
  return (
    date.getFullYear() === referenceDate.getFullYear() &&
    date.getMonth() === referenceDate.getMonth()
  )
}

const isSameYear = (date, referenceDate) => {
  return date.getFullYear() === referenceDate.getFullYear()
}

const isGymActivityLog = (log) => {
  const activityTypeName = log?.activityTypeName?.trim()?.toLowerCase() || ''
  return activityTypeName === 'gym' || activityTypeName.includes('gym')
}

function ActivityDonut({
  title,
  completed = 0,
  goal = 0,
  color = '#3b82f6',
}) {
  const safeGoal = goal > 0 ? goal : 1
  const remaining = Math.max(goal - completed, 0)
  const progress = Math.min(completed / safeGoal, 1)

  const radius = 32
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="flex min-w-0 w-full flex-col items-center gap-0">
      <h4
        className="text-center text-sm font-semibold leading-none -mb-4"
        style={{ color }}
      >
        {title}
      </h4>

      <div className="relative flex aspect-square w-full max-w-[140px] items-center justify-center">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-lg font-bold leading-none"
            style={{ color }}
          >
            {completed}
          </span>
          <span className="mt-0 text-xs text-slate-500">/{goal}</span>
        </div>
      </div>

      <span className="text-center text-xs leading-none -mt-4 text-slate-500">
        {remaining} left
      </span>
    </div>
  )
}

function WorkoutStatsSection() {
  const [activityLogs, setActivityLogs] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadWorkoutStats = async () => {
      setIsLoading(true)
      setError('')

      try {
        const [activityLogData, profileData] = await Promise.all([
          getActivityLogs(),
          getUserProfile(),
        ])

        setActivityLogs(Array.isArray(activityLogData) ? activityLogData : [])
        setUserProfile(profileData ?? null)
      } catch (err) {
        console.error(err)
        setError('Could not load workout stats.')
        setActivityLogs([])
        setUserProfile(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkoutStats()
  }, [])

  const stats = useMemo(() => {
    const today = getStartOfDay(new Date())
    const startOfWeek = getStartOfWeek(today)
    const endOfWeek = getEndOfWeek(today)

    const validGymDates = activityLogs
      .filter(isGymActivityLog)
      .filter((log) => typeof log?.logDate === 'string')
      .map((log) => parseDateStringAsLocalDate(log.logDate))
      .filter((date) => !Number.isNaN(date.getTime()))

    const thisWeek = validGymDates.filter(
      (date) => date >= startOfWeek && date <= endOfWeek
    ).length

    const thisMonth = validGymDates.filter((date) =>
      isSameMonth(date, today)
    ).length

    const thisYear = validGymDates.filter((date) =>
      isSameYear(date, today)
    ).length

    const weeklyGymGoal = Math.max(userProfile?.weeklyGymGoal ?? 0, 0)

    return {
      thisWeek,
      thisMonth,
      thisYear,
      weekGoal: weeklyGymGoal,
      monthGoal: weeklyGymGoal * 4,
      yearGoal: weeklyGymGoal * 52,
    }
  }, [activityLogs, userProfile])

  if (isLoading) {
    return <div className="px-4 py-4 text-sm text-slate-500">Loading...</div>
  }

  if (error) {
    return <div className="px-4 py-4 text-sm text-red-600">{error}</div>
  }

  return (
    <section className="w-full pt-4">
      <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-black">Your Activity</h3>

        <div className="mt-4 grid w-full grid-cols-3 gap-2">
          <ActivityDonut
            title="This Week"
            completed={stats.thisWeek}
            goal={stats.weekGoal}
            color="#2bb8b3"
          />

          <ActivityDonut
            title="This Month"
            completed={stats.thisMonth}
            goal={stats.monthGoal}
            color="#7e22ce"
          />

          <ActivityDonut
            title="This Year"
            completed={stats.thisYear}
            goal={stats.yearGoal}
            color="#f5a623"
          />
        </div>
      </div>
    </section>
  )
}

export default WorkoutStatsSection