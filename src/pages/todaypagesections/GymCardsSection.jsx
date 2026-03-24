import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../routes/routePaths'
import { getWeeklyActivitySummary } from '../../api/activityLogApi'
import { getWorkoutSessions } from '../../api/workoutSessionApi'

const formatDateString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getStartOfWeekMonday = (date = new Date()) => {
  const result = new Date(date)
  const day = result.getDay()
  const diff = day === 0 ? -6 : 1 - day
  result.setDate(result.getDate() + diff)
  result.setHours(0, 0, 0, 0)
  return result
}

const getEndOfWeekSunday = (date = new Date()) => {
  const start = getStartOfWeekMonday(date)
  const result = new Date(start)
  result.setDate(start.getDate() + 6)
  result.setHours(23, 59, 59, 999)
  return result
}

const getStartOfMonth = (date = new Date()) => {
  const result = new Date(date.getFullYear(), date.getMonth(), 1)
  result.setHours(0, 0, 0, 0)
  return result
}

const getEndOfMonth = (date = new Date()) => {
  const result = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  result.setHours(23, 59, 59, 999)
  return result
}

const isDateWithinRange = (dateString, startDate, endDate) => {
  const date = new Date(dateString)
  date.setHours(12, 0, 0, 0)
  return date >= startDate && date <= endDate
}

const isCompletedWorkout = (session) => {
  if (!session) return false

  const status = String(session.status ?? '').toLowerCase()
  return status === 'completed' || Boolean(session.completedAt)
}

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

function ShoeIcon({ className = 'h-6 w-6 text-red-500' }) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <g>
        <path d="M264.141,416.896L14.646,205.121L0,222.387l249.53,211.791l0.036,0.032c28.359,23.865,64.362,37,101.444,37.008h159.915v-22.639H351.01C319.297,448.578,288.402,437.326,264.141,416.896z" />
        <path d="M351.01,425.948c0,0,63.721,0,120.309,0c56.587,0,48.101-56.591,11.318-65.074c-24.818-5.728-56.682-18.895-56.682-18.895c-12.577-4.194-22.875-13.389-28.442-25.4c0,0-1.377-2.92-3.688-7.834l-46.194,13.966c-5.048,1.528-10.381-1.322-11.908-6.369c-1.519-5.048,1.326-10.382,6.374-11.901l43.528-13.167c-3.743-7.975-8.083-17.241-12.656-27.021l-43.171,13.064c-5.049,1.528-10.382-1.345-11.909-6.377c-1.531-5.049,1.338-10.382,6.373-11.908l40.529-12.257c-4.312-9.258-8.601-18.476-12.574-27.046l-40.255,12.185c-5.049,1.52-10.382-1.33-11.912-6.377c-1.515-5.049,1.329-10.382,6.378-11.901l37.708-11.41c-5.405-11.766-9.326-20.486-10.37-23.192c-4.538-11.798-14.504-44.525-37.245-26.334c-37.391,29.934-105.602,21.158-123.212-11.56c-13.202-24.522-5.654-50.926,0-71.674c4.526-16.584-18.868-42.443-35.837-19.805C125.464,65.66,24.296,185.458,24.296,185.458L278.72,399.575C298.961,416.611,324.559,425.948,351.01,425.948z" />
      </g>
    </svg>
  )
}

function DumbbellIcon({ className = 'h-6 w-6 text-blue-500' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 10v4" />
      <path d="M5 8v8" />
      <path d="M19 8v8" />
      <path d="M22 10v4" />
      <path d="M7 12h10" />
    </svg>
  )
}

function CalendarGymIcon({ className = 'h-6 w-6 text-violet-500' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="M3 9h18" />
      <path d="M9 15h6" />
      <path d="M12 12v6" />
    </svg>
  )
}

function ActivityCard({ totalMinutes, weeklyGoalMinutes, subtitle }) {
  const progressPercent =
    weeklyGoalMinutes > 0
      ? Math.min((totalMinutes / weeklyGoalMinutes) * 100, 100)
      : 0

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-black">Activity</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>

        <Link
          to={ROUTES.LOG_ACTIVITY}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          aria-label="Go to activities"
        >
          <PlusIcon />
        </Link>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <ShoeIcon className="h-7 w-7 text-red-500" />
        <span className="text-3xl font-bold leading-none text-black">
          {totalMinutes}
        </span>
      </div>

      <p className="mt-5 text-xs text-slate-500">
        Goal: {totalMinutes}/{weeklyGoalMinutes} minutes
      </p>

      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-red-500 transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}

function GymSessionsCard({ weekCount, monthCount, weekSubtitle, monthSubtitle }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-base font-semibold text-black">Gym Sessions</h3>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <DumbbellIcon className="h-7 w-7 text-blue-500" />

        <div className="min-w-0">
          <p className="text-xs text-slate-500">{weekSubtitle}</p>
          <p className="text-2xl font-bold leading-none text-black">
            {weekCount}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <CalendarGymIcon className="h-7 w-7 text-violet-500" />

        <div className="min-w-0">
          <p className="text-xs text-slate-500">{monthSubtitle}</p>
          <p className="text-2xl font-bold leading-none text-black">
            {monthCount}
          </p>
        </div>
      </div>
    </div>
  )
}

function GymCardsSection({ selectedDate, weeklyExerciseGoal = 0 }) {
  const [weeklyActivity, setWeeklyActivity] = useState({
    totalMinutes: 0,
  })
  const [gymCounts, setGymCounts] = useState({
    weekCount: 0,
    monthCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const dateRanges = useMemo(() => {
    const anchorDate = new Date(selectedDate)
    anchorDate.setHours(0, 0, 0, 0)

    const weekStart = getStartOfWeekMonday(anchorDate)
    const weekEnd = getEndOfWeekSunday(anchorDate)
    const monthStart = getStartOfMonth(anchorDate)
    const monthEnd = getEndOfMonth(anchorDate)

    return {
      weekStart,
      weekEnd,
      monthStart,
      monthEnd,
      weekStartString: formatDateString(weekStart),
    }
  }, [selectedDate])

  useEffect(() => {
    const loadSectionData = async () => {
      setIsLoading(true)

      try {
        const [activitySummary, workoutSessions] = await Promise.all([
          getWeeklyActivitySummary(dateRanges.weekStartString),
          getWorkoutSessions(),
        ])

        setWeeklyActivity({
          totalMinutes: activitySummary?.totalMinutes ?? 0,
        })

        const completedSessions = Array.isArray(workoutSessions)
          ? workoutSessions.filter(isCompletedWorkout)
          : []

        const weekCount = completedSessions.filter((session) =>
          isDateWithinRange(
            session.sessionDate,
            dateRanges.weekStart,
            dateRanges.weekEnd
          )
        ).length

        const monthCount = completedSessions.filter((session) =>
          isDateWithinRange(
            session.sessionDate,
            dateRanges.monthStart,
            dateRanges.monthEnd
          )
        ).length

        setGymCounts({
          weekCount,
          monthCount,
        })
      } catch (error) {
        console.error('Could not load gym cards section.', error)
        setWeeklyActivity({
          totalMinutes: 0,
        })
        setGymCounts({
          weekCount: 0,
          monthCount: 0,
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSectionData()
  }, [dateRanges])

  return (
    <section className="px-4 pt-4">
      <div className="grid grid-cols-2 gap-3">
        <ActivityCard
          totalMinutes={isLoading ? 0 : weeklyActivity.totalMinutes}
          weeklyGoalMinutes={isLoading ? 0 : weeklyExerciseGoal}
          subtitle="Selected Date Week"
        />

        <GymSessionsCard
          weekCount={isLoading ? 0 : gymCounts.weekCount}
          monthCount={isLoading ? 0 : gymCounts.monthCount}
          weekSubtitle="Selected Date Week"
          monthSubtitle="Selected Date Month"
        />
      </div>
    </section>
  )
}

export default GymCardsSection