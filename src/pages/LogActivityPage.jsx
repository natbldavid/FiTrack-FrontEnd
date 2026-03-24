import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createActivityLog } from '../api/activityLogApi'
import { getActivityTypes } from '../api/activityTypesApi'
import LogActivityHeaderSection from './logactivitypagesections/LogActivityHeaderSection'
import LogActivityProgressSection from './logactivitypagesections/LogActivityProgressSection'
import LogActivityTypeSelectionSection from './logactivitypagesections/LogActivityTypeSelectionSection'
import LogActivityDetailsSection from './logactivitypagesections/LogActivityDetailsSection'
import { ROUTES } from '../routes/routePaths'

const STEP_SELECT_ACTIVITY = 1
const STEP_ENTER_DETAILS = 2

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

function LogActivityPage() {
  const navigate = useNavigate()

  const [step, setStep] = useState(STEP_SELECT_ACTIVITY)
  const [activityTypes, setActivityTypes] = useState([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [selectedActivityTypeId, setSelectedActivityTypeId] = useState(null)
  const [logDate, setLogDate] = useState(getTodayDateString())
  const [durationMinutes, setDurationMinutes] = useState('')

  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const loadActivityTypes = async () => {
      setIsLoadingActivities(true)
      setError('')

      try {
        const data = await getActivityTypes()
        setActivityTypes(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        setError('Could not load activity types.')
        setActivityTypes([])
      } finally {
        setIsLoadingActivities(false)
      }
    }

    loadActivityTypes()
  }, [])

  const selectedActivityType = useMemo(() => {
    return (
      activityTypes.find(
        (activityType) =>
          String(activityType.id) === String(selectedActivityTypeId)
      ) || null
    )
  }, [activityTypes, selectedActivityTypeId])

  const handleBack = () => {
    setError('')
    setSuccessMessage('')

    if (step === STEP_SELECT_ACTIVITY) {
      navigate(ROUTES.ACTIVITIES)
      return
    }

    if (step === STEP_ENTER_DETAILS) {
      setStep(STEP_SELECT_ACTIVITY)
    }
  }

  const handleSelectActivityType = (activityType) => {
    setError('')
    setSuccessMessage('')
    setSelectedActivityTypeId(activityType.id)
  }

  const handleNext = () => {
    if (!selectedActivityTypeId) {
      setError('Select an activity to continue.')
      return
    }

    setError('')
    setSuccessMessage('')
    setStep(STEP_ENTER_DETAILS)
  }

  const handleSubmit = async () => {
    const parsedDuration = Number(durationMinutes)

    if (!selectedActivityTypeId) {
      setError('Select an activity type.')
      return
    }

    if (!logDate) {
      setError('Select a date.')
      return
    }

    if (!parsedDuration || parsedDuration <= 0) {
      setError('Enter a valid number of activity minutes.')
      return
    }

    setError('')
    setSuccessMessage('')
    setIsSaving(true)

    try {
      await createActivityLog({
        activityTypeId: Number(selectedActivityTypeId),
        logDate,
        durationMinutes: parsedDuration,
        distance: 0,
        caloriesBurned: 0,
        notes: `${selectedActivityType?.name || 'Activity'} logged from FiTrack`,
      })

      setSuccessMessage('Activity logged successfully.')
      navigate(ROUTES.ACTIVITIES)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Could not save activity log.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen w-screen bg-slate-100">
      <div className="mx-auto w-full max-w-3xl px-4 py-4">
        <LogActivityHeaderSection title="Log Activity" onBack={handleBack} />

        <LogActivityProgressSection currentStep={step} totalSteps={2} />

        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
        {successMessage ? (
          <p className="mb-4 text-sm text-green-600">{successMessage}</p>
        ) : null}

        {step === STEP_SELECT_ACTIVITY ? (
          <LogActivityTypeSelectionSection
            activityTypes={activityTypes}
            selectedActivityTypeId={selectedActivityTypeId}
            isLoading={isLoadingActivities}
            onSelectActivityType={handleSelectActivityType}
            onNext={handleNext}
          />
        ) : null}

        {step === STEP_ENTER_DETAILS ? (
          <LogActivityDetailsSection
            selectedActivityType={selectedActivityType}
            logDate={logDate}
            durationMinutes={durationMinutes}
            isSaving={isSaving}
            onChangeLogDate={setLogDate}
            onChangeDurationMinutes={setDurationMinutes}
            onSubmit={handleSubmit}
          />
        ) : null}
      </div>
    </div>
  )
}

export default LogActivityPage