import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWorkoutDays } from '../api/workoutDaysApi'
import { getWorkoutSessions } from '../api/workoutSessionApi'
import { getActivityLogs } from '../api/activityLogApi'
import GymDiaryHeaderSection from './gymdiarysections/GymDiaryHeaderSection'
import GymDiaryCalendarSection from './gymdiarysections/GymDiaryCalendarSection'
import GymDiaryPopUpCalendarSection from './gymdiarysections/GymDiaryPopUpCalendarSection'
import GymDiarySessionCardsSection from './gymdiarysections/GymDiarySessionCardsSection'
import { ROUTES } from '../routes/routePaths'

const formatDateString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getTodayDateString = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return formatDateString(today)
}

function GymDiaryPage() {
  const navigate = useNavigate()

  const [selectedDate, setSelectedDate] = useState(getTodayDateString())
  const [sessions, setSessions] = useState([])
  const [workoutDaysById, setWorkoutDaysById] = useState({})
  const [minutesByDate, setMinutesByDate] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  useEffect(() => {
    const loadGymDiaryData = async () => {
      setIsLoading(true)
      setError('')

      try {
        const [sessionsData, workoutDaysData, activityLogsData] = await Promise.all([
          getWorkoutSessions(),
          getWorkoutDays(),
          getActivityLogs(),
        ])

        const normalizedSessions = Array.isArray(sessionsData) ? sessionsData : []
        const normalizedWorkoutDays = Array.isArray(workoutDaysData)
          ? workoutDaysData
          : []
        const normalizedActivityLogs = Array.isArray(activityLogsData)
          ? activityLogsData
          : []

        const workoutDayMap = normalizedWorkoutDays.reduce((acc, workoutDay) => {
          acc[workoutDay.id] = workoutDay
          return acc
        }, {})

        const activityMinutesMap = normalizedActivityLogs.reduce((acc, log) => {
          if (!log?.logDate) return acc

          const duration = Number(log.durationMinutes) || 0
          acc[log.logDate] = (acc[log.logDate] || 0) + duration
          return acc
        }, {})

        setSessions(normalizedSessions)
        setWorkoutDaysById(workoutDayMap)
        setMinutesByDate(activityMinutesMap)
      } catch (err) {
        console.error(err)
        setError('Could not load gym diary.')
        setSessions([])
        setWorkoutDaysById({})
        setMinutesByDate({})
      } finally {
        setIsLoading(false)
      }
    }

    loadGymDiaryData()
  }, [])

  const completedSessions = useMemo(() => {
    return sessions.filter((session) => Boolean(session?.completedAt))
  }, [sessions])

  const completedWorkoutDateSet = useMemo(() => {
    return new Set(
      completedSessions
        .map((session) => session?.sessionDate)
        .filter(Boolean)
    )
  }, [completedSessions])

  const sessionsForSelectedDate = useMemo(() => {
    return completedSessions
      .filter((session) => session?.sessionDate === selectedDate)
      .sort(
        (a, b) =>
          new Date(b.completedAt || b.startedAt || b.sessionDate) -
          new Date(a.completedAt || a.startedAt || a.sessionDate)
      )
      .map((session) => {
        const totalMinutesForDate = minutesByDate[session.sessionDate] || 0

        return {
          ...session,
          muscleFocus:
            totalMinutesForDate > 0
              ? `${totalMinutesForDate} min`
              : '0 min',
          workoutDayName:
            workoutDaysById[session.workoutDayId]?.muscleFocus || '',
        }
      })
  }, [completedSessions, selectedDate, workoutDaysById, minutesByDate])

  const handleBack = () => {
    navigate(ROUTES.ACTIVITIES)
  }

  const handleOpenCalendar = () => {
    setIsCalendarOpen(true)
  }

  const handleCloseCalendar = () => {
    setIsCalendarOpen(false)
  }

  const handleSelectDate = (dateString) => {
    setSelectedDate(dateString)
  }

 const handleOpenSession = (session) => {
  if (!session?.id) return

  navigate(`/workout-sessions/${session.id}`)
}

  return (
    <div className="min-h-screen w-screen bg-slate-100">
      <div
        className="w-full rounded-b-4xl"
        style={{
          background: 'linear-gradient(180deg, #CFE8D6 0%, #8FD19E 100%)',
        }}
      >
        <div className="mx-auto w-full max-w-4xl px-4 pb-6 pt-4">
          <GymDiaryHeaderSection title="Gym Diary" onBack={handleBack} />

          <GymDiaryCalendarSection
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            onOpenCalendar={handleOpenCalendar}
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 py-4">
        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        <GymDiarySessionCardsSection
          sessions={sessionsForSelectedDate}
          isLoading={isLoading}
          onSelectSession={handleOpenSession}
        />
      </div>

      <GymDiaryPopUpCalendarSection
        isOpen={isCalendarOpen}
        selectedDate={selectedDate}
        onClose={handleCloseCalendar}
        onSelectDate={handleSelectDate}
        completedWorkoutDateSet={completedWorkoutDateSet}
      />
    </div>
  )
}

export default GymDiaryPage