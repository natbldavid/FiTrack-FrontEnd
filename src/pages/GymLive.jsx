import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createActivityLog } from '../api/activityLogApi'
import { getWorkoutDayById, getWorkoutDays } from '../api/workoutDaysApi'
import {
  completeWorkoutSession,
  getWorkoutSessionById,
  getWorkoutSessions,
  startWorkoutSession,
  updateWorkoutSessionSet,
} from '../api/workoutSessionApi'
import GymLiveHeaderSection from './gymlivesections/GymLiveHeaderSection'
import GymLiveWelcomeSection from './gymlivesections/GymLiveWelcomeSection'
import GymLiveWorkoutDaySelectionSection from './gymlivesections/GymLiveWorkoutDaySelectionSection'
import GymLiveExerciseLoggingSection from './gymlivesections/GymLiveExerciseLoggingSection'
import GymLiveDurationSection from './gymlivesections/GymLiveDurationSection'
import GymLiveLoadSessionsModal from './gymlivesections/GymLiveLoadSessionsModal'
import { ROUTES } from '../routes/routePaths'

const STEP_WELCOME = 'welcome'
const STEP_SELECT_DAY = 'select-day'
const STEP_LOG_EXERCISES = 'log-exercises'
const STEP_DURATION = 'duration'

// Replace this with the real activity type id from your database.
const GYM_ACTIVITY_TYPE_ID = 2

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

const toNullableNumber = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

function GymLive() {
  const navigate = useNavigate()

  const [step, setStep] = useState(STEP_WELCOME)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [workoutDays, setWorkoutDays] = useState([])
  const [workoutDaysLoading, setWorkoutDaysLoading] = useState(false)

  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState(null)
  const [startedSession, setStartedSession] = useState(null)

  const [sessionExerciseInputs, setSessionExerciseInputs] = useState([])
  const [durationMinutes, setDurationMinutes] = useState('')

  const [isSaving, setIsSaving] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false)
  const [loadableSessions, setLoadableSessions] = useState([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)

  const initializeSessionInputs = (sessionData, workoutDayData) => {
    const inputs = [...(sessionData?.exercises || [])]
      .sort((a, b) => (a?.exerciseOrder ?? 0) - (b?.exerciseOrder ?? 0))
      .map((exercise) => {
        const baseExercise = workoutDayData?.exercises?.find(
          (item) => String(item.exerciseId) === String(exercise.exerciseId)
        )

        const targetSets = exercise?.targetSets ?? baseExercise?.targetSets ?? 0

        const currentWorkingWeight =
          baseExercise?.currentWorkingWeight ??
          exercise.plannedWorkingWeight ??
          0

        return {
          workoutSessionExerciseId: exercise.id,
          workoutDayExerciseId: baseExercise?.id ?? null,
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseNameSnapshot,
          bodyPart: exercise.bodyPartSnapshot,
          exerciseType: exercise.exerciseTypeSnapshot,
          targetSets,
          targetRepsMin:
            exercise.targetRepsMin ?? baseExercise?.targetRepsMin ?? 0,
          targetRepsMax:
            exercise.targetRepsMax ?? baseExercise?.targetRepsMax ?? 0,
          plannedWorkingWeight:
            exercise.plannedWorkingWeight ??
            baseExercise?.currentWorkingWeight ??
            0,
          currentWorkingWeight,
          usesWeight: currentWorkingWeight > 0,
          sets: Array.from({ length: targetSets }, (_, index) => {
            const existingSet = exercise?.sets?.find(
              (item) => item.setNumber === index + 1
            )

            return {
              setNumber: index + 1,
              reps: existingSet?.reps ?? '',
              weight:
                currentWorkingWeight > 0
                  ? existingSet?.weight ?? ''
                  : 0,
              completed: existingSet?.completed ?? false,
            }
          }),
        }
      })

    setSessionExerciseInputs(inputs)
  }

  const handleBack = () => {
    setError('')
    setSuccessMessage('')

    if (step === STEP_WELCOME) {
      navigate(ROUTES.ACTIVITIES)
      return
    }

    if (step === STEP_SELECT_DAY) {
      setStep(STEP_WELCOME)
      return
    }

    if (step === STEP_LOG_EXERCISES) {
      setStep(STEP_SELECT_DAY)
      return
    }

    if (step === STEP_DURATION) {
      setStep(STEP_LOG_EXERCISES)
    }
  }

  const handleStartNewSession = async () => {
    setError('')
    setSuccessMessage('')
    setWorkoutDaysLoading(true)

    try {
      const data = await getWorkoutDays()
      const normalizedData = Array.isArray(data) ? data : []
      const sorted = [...normalizedData].sort(
        (a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0)
      )

      setWorkoutDays(sorted)
      setStep(STEP_SELECT_DAY)
    } catch (err) {
      console.error(err)
      setError('Could not load workout days.')
      setWorkoutDays([])
    } finally {
      setWorkoutDaysLoading(false)
    }
  }

  const handleOpenLoadModal = async () => {
    setError('')
    setSuccessMessage('')
    setIsLoadingSessions(true)
    setIsLoadModalOpen(true)

    try {
      const sessions = await getWorkoutSessions()
      const normalizedSessions = Array.isArray(sessions) ? sessions : []

      const incompleteSessions = normalizedSessions.filter((session) => {
        const isCompleted =
          session?.completedAt !== null &&
          session?.completedAt !== undefined

        return !isCompleted
      })

      const sortedSessions = [...incompleteSessions].sort(
        (a, b) => new Date(b.startedAt || b.sessionDate) - new Date(a.startedAt || a.sessionDate)
      )

      setLoadableSessions(sortedSessions)
    } catch (err) {
      console.error(err)
      setError('Could not load saved sessions.')
      setLoadableSessions([])
    } finally {
      setIsLoadingSessions(false)
    }
  }

  const handleCloseLoadModal = () => {
    setIsLoadModalOpen(false)
  }

  const handleLoadSession = async (sessionSummary) => {
    setError('')
    setSuccessMessage('')
    setIsSaving(true)

    try {
      const sessionDetail = await getWorkoutSessionById(sessionSummary.id)
      const detailedWorkoutDay = await getWorkoutDayById(sessionDetail.workoutDayId)

      setSelectedWorkoutDay(detailedWorkoutDay)
      setStartedSession(sessionDetail)
      initializeSessionInputs(sessionDetail, detailedWorkoutDay)
      setDurationMinutes('')
      setIsLoadModalOpen(false)
      setStep(STEP_LOG_EXERCISES)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Could not load saved session.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSelectWorkoutDay = async (workoutDay) => {
    setError('')
    setSuccessMessage('')
    setIsSaving(true)

    try {
      const detailedWorkoutDay = await getWorkoutDayById(workoutDay.id)

      const sessionData = await startWorkoutSession({
        workoutDayId: workoutDay.id,
      })

      setSelectedWorkoutDay(detailedWorkoutDay)
      setStartedSession(sessionData)
      initializeSessionInputs(sessionData, detailedWorkoutDay)
      setDurationMinutes('')
      setStep(STEP_LOG_EXERCISES)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Could not start gym session.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSetFieldChange = (exerciseIndex, setIndex, field, value) => {
    setSessionExerciseInputs((prev) => {
      const next = [...prev]
      const nextExercise = { ...next[exerciseIndex] }
      const nextSets = [...nextExercise.sets]

      nextSets[setIndex] = {
        ...nextSets[setIndex],
        [field]: value,
      }

      nextExercise.sets = nextSets
      next[exerciseIndex] = nextExercise
      return next
    })
  }

  const buildSetPayloads = () => {
    return sessionExerciseInputs.flatMap((exercise) =>
      exercise.sets
        .filter((set) => {
          const hasValidReps =
            set.reps !== '' && toNullableNumber(set.reps) !== null

          const hasValidWeight = exercise.usesWeight
            ? set.weight !== '' && toNullableNumber(set.weight) !== null
            : true

          return hasValidReps && hasValidWeight
        })
        .map((set) => ({
          workoutSessionExerciseId: exercise.workoutSessionExerciseId,
          setNumber: set.setNumber,
          reps: Number(set.reps),
          weight: exercise.usesWeight ? Number(set.weight) : 0,
          completed: true,
        }))
    )
  }

  const buildWorkingWeightUpdates = () => {
    return sessionExerciseInputs
      .map((exercise) => {
        if (!exercise.usesWeight) {
          return null
        }

        const enteredWeights = exercise.sets
          .map((set) => toNullableNumber(set.weight))
          .filter((weight) => weight !== null)

        const latestEnteredWeight =
          enteredWeights.length > 0
            ? enteredWeights[enteredWeights.length - 1]
            : null

        if (
          latestEnteredWeight === null ||
          exercise.workoutDayExerciseId === null ||
          latestEnteredWeight === exercise.currentWorkingWeight
        ) {
          return null
        }

        return {
          workoutDayExerciseId: exercise.workoutDayExerciseId,
          currentWorkingWeight: latestEnteredWeight,
        }
      })
      .filter(Boolean)
  }

  const handleSaveSets = async () => {
    if (!startedSession?.id) {
      setError('No active session found.')
      return
    }

    const payloads = buildSetPayloads()

    if (!payloads.length) {
      setError('Enter at least one completed set before saving.')
      return
    }

    setError('')
    setSuccessMessage('')
    setIsSaving(true)

    try {
      await Promise.all(
        payloads.map((payload) =>
          updateWorkoutSessionSet(startedSession.id, payload)
        )
      )

      setSuccessMessage('Workout progress saved.')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Could not save workout sets.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleNextFromExerciseLogging = () => {
    setError('')
    setSuccessMessage('')
    setStep(STEP_DURATION)
  }

  const handleCompleteSession = async () => {
    if (!startedSession?.id || !selectedWorkoutDay?.id) {
      setError('No active session found.')
      return
    }

    const parsedDuration = Number(durationMinutes)

    if (!parsedDuration || parsedDuration <= 0) {
      setError('Enter a valid workout duration.')
      return
    }

    setError('')
    setSuccessMessage('')
    setIsCompleting(true)

    try {
      const setPayloads = buildSetPayloads()

      if (setPayloads.length) {
        await Promise.all(
          setPayloads.map((payload) =>
            updateWorkoutSessionSet(startedSession.id, payload)
          )
        )
      }

      const workingWeightUpdates = buildWorkingWeightUpdates()

      await completeWorkoutSession(startedSession.id, {
        notes: `${selectedWorkoutDay.name} completed in Gym Live`,
        workingWeightUpdates,
      })

      await createActivityLog({
        activityTypeId: GYM_ACTIVITY_TYPE_ID,
        logDate: getTodayDateString(),
        durationMinutes: parsedDuration,
        distance: 0,
        caloriesBurned: 0,
        notes: `${selectedWorkoutDay.name} gym session`,
      })

      setSuccessMessage('Gym session completed.')
      navigate(ROUTES.WORKOUT_DASHBOARD)
    } catch (err) {
      console.error(err)
      setError(
        err.response?.data?.message || 'Could not complete gym live session.'
      )
    } finally {
      setIsCompleting(false)
    }
  }

  const getHeaderTitle = () => {
    if (step === STEP_WELCOME) return 'Gym Live'
    if (step === STEP_SELECT_DAY) return 'Select Workout Day'
    if (step === STEP_LOG_EXERCISES) return selectedWorkoutDay?.name || 'Gym Live'
    if (step === STEP_DURATION) return 'Complete Session'
    return 'Gym Live'
  }

  return (
    <div className="min-h-screen w-screen bg-slate-100">
      <div className="mx-auto w-full max-w-4xl px-4 py-4">
        <GymLiveHeaderSection title={getHeaderTitle()} onBack={handleBack} />

        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
        {successMessage ? (
          <p className="mb-4 text-sm text-green-600">{successMessage}</p>
        ) : null}

        {step === STEP_WELCOME ? (
          <GymLiveWelcomeSection
            onNew={handleStartNewSession}
            onLoad={handleOpenLoadModal}
          />
        ) : null}

        {step === STEP_SELECT_DAY ? (
          <GymLiveWorkoutDaySelectionSection
            workoutDays={workoutDays}
            isLoading={workoutDaysLoading}
            isSaving={isSaving}
            onSelectWorkoutDay={handleSelectWorkoutDay}
            onGoToWorkoutDashboard={() => navigate(ROUTES.WORKOUT_DASHBOARD)}
            onGoToAddWorkoutDay={() => navigate(ROUTES.ADD_WORKOUT_DAY)}
          />
        ) : null}

        {step === STEP_LOG_EXERCISES ? (
          <GymLiveExerciseLoggingSection
            sessionExerciseInputs={sessionExerciseInputs}
            isSaving={isSaving}
            onSetFieldChange={handleSetFieldChange}
            onSave={handleSaveSets}
            onNext={handleNextFromExerciseLogging}
          />
        ) : null}

        {step === STEP_DURATION ? (
          <GymLiveDurationSection
            durationMinutes={durationMinutes}
            isCompleting={isCompleting}
            onChangeDuration={setDurationMinutes}
            onComplete={handleCompleteSession}
          />
        ) : null}

        <GymLiveLoadSessionsModal
  isOpen={isLoadModalOpen}
  isLoading={isLoadingSessions}
  sessions={loadableSessions}
  onClose={handleCloseLoadModal}
  onSelectSession={handleLoadSession}
  onDeleteSession={(deletedSessionId) => {
    setLoadableSessions((prev) =>
      prev.filter((session) => session.id !== deletedSessionId)
    )
  }}
/>
      </div>
    </div>
  )
}

export default GymLive