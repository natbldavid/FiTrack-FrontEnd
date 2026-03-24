import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getExercises } from '../api/exerciseApi'
import { loginUser, registerUser } from '../api/authApi'
import { createWorkoutDay } from '../api/workoutDaysApi'
import { createUserGoalsHistory } from '../api/userGoalsHistoryApi'
import Modal from '../components/common/Modal'
import useAuth from '../hooks/useAuth'
import { ROUTES } from '../routes/routePaths'

const emptyWorkoutDay = {
  name: '',
  muscleFocus: '',
  sortOrder: '',
  exercises: [
    {
      exerciseId: '',
      targetSets: '',
      targetRepsMin: '',
      targetRepsMax: '',
      currentWorkingWeight: '',
      notes: '',
    },
  ],
}

const toNullableNumber = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

function SectionCard({ title, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-black">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  )
}

function GoalRow({
  label,
  metric,
  name,
  value,
  onChange,
  type = 'number',
  step,
  placeholder,
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-black">{label}</p>
        {metric && <p className="mt-1 text-xs text-slate-500">{metric}</p>}
      </div>

      <div className="w-28 shrink-0">
        <input
          name={name}
          type={type}
          step={step}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full border-0 bg-transparent p-0 text-right text-base font-semibold outline-none"
          style={{ color: '#23a802' }}
        />
      </div>
    </div>
  )
}

function ExerciseField({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  )
}

function CreateAccountPage() {
  const navigate = useNavigate()
  const { login, logout, isAuthenticated } = useAuth()

  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [accountData, setAccountData] = useState({
    username: '',
    passcode: '',
    confirmPasscode: '',
  })

  const [profileData, setProfileData] = useState({
    currentWeight: '',
    dailyCalorieGoal: '',
    dailyProteinGoal: '',
    dailyCarbGoal: '',
    dailyFatGoal: '',
    weightGoal: '',
    weeklyExerciseGoal: '',
    weeklyGymGoal: '',
  })

  const [exerciseCatalog, setExerciseCatalog] = useState([])
  const [exerciseLoading, setExerciseLoading] = useState(false)
  const [exerciseError, setExerciseError] = useState('')
  const [createdWorkoutDays, setCreatedWorkoutDays] = useState([])
  const [workoutDayForm, setWorkoutDayForm] = useState(emptyWorkoutDay)

  const [showPasscode, setShowPasscode] = useState(false)
  const [showConfirmPasscode, setShowConfirmPasscode] = useState(false)

  const canGoToStepTwo = useMemo(() => {
    return (
      accountData.username.trim().length >= 3 &&
      accountData.passcode.length >= 6 &&
      accountData.passcode === accountData.confirmPasscode
    )
  }, [accountData])

  useEffect(() => {
    if (step !== 4 || !isAuthenticated) {
      return
    }

    const loadExercises = async () => {
      setExerciseLoading(true)
      setExerciseError('')

      try {
        const data = await getExercises()
        setExerciseCatalog(data)
      } catch (err) {
        setExerciseError(
          err.response?.data?.message || 'Could not load exercises.'
        )
      } finally {
        setExerciseLoading(false)
      }
    }

    loadExercises()
  }, [step, isAuthenticated])

  const handleAccountChange = (event) => {
    const { name, value } = event.target
    setAccountData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileChange = (event) => {
    const { name, value } = event.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNextFromAccount = () => {
    setError('')

    if (accountData.username.trim().length < 3) {
      setError('Username must be at least 3 characters long.')
      return
    }

    if (accountData.passcode.length < 6) {
      setError('Passcode must be at least 6 characters long.')
      return
    }

    if (accountData.passcode !== accountData.confirmPasscode) {
      setError('Passcodes do not match.')
      return
    }

    setStep(2)
  }

const handleRegister = async (event) => {
  event.preventDefault()
  setError('')
  setIsSubmitting(true)

  const registerPayload = {
    username: accountData.username.trim(),
    passcode: accountData.passcode,
    currentWeight: toNullableNumber(profileData.currentWeight),
    dailyCalorieGoal: toNullableNumber(profileData.dailyCalorieGoal),
    dailyProteinGoal: toNullableNumber(profileData.dailyProteinGoal),
    dailyCarbGoal: toNullableNumber(profileData.dailyCarbGoal),
    dailyFatGoal: toNullableNumber(profileData.dailyFatGoal),
    weightGoal: toNullableNumber(profileData.weightGoal),
    weeklyExerciseGoal: toNullableNumber(profileData.weeklyExerciseGoal),
    weeklyGymGoal: toNullableNumber(profileData.weeklyGymGoal),
  }

  const goalsHistoryPayload = {
    dailyCalorieGoal: toNullableNumber(profileData.dailyCalorieGoal),
    dailyProteinGoal: toNullableNumber(profileData.dailyProteinGoal),
    dailyCarbGoal: toNullableNumber(profileData.dailyCarbGoal),
    dailyFatGoal: toNullableNumber(profileData.dailyFatGoal),
    weightGoal: toNullableNumber(profileData.weightGoal),
    weeklyExerciseGoal: toNullableNumber(profileData.weeklyExerciseGoal),
  }

  try {
    await registerUser(registerPayload)

    const authResponse = await loginUser({
      username: accountData.username.trim(),
      passcode: accountData.passcode,
    })

    login(authResponse)

    const hasAnyGoalsHistoryData =
      goalsHistoryPayload.dailyCalorieGoal !== null ||
      goalsHistoryPayload.dailyProteinGoal !== null ||
      goalsHistoryPayload.dailyCarbGoal !== null ||
      goalsHistoryPayload.dailyFatGoal !== null ||
      goalsHistoryPayload.weightGoal !== null ||
      goalsHistoryPayload.weeklyExerciseGoal !== null

    if (hasAnyGoalsHistoryData) {
      await createUserGoalsHistory(goalsHistoryPayload)
    }

    setSuccessModalOpen(true)
  } catch (err) {
    setError(
      err.response?.data?.message || 'Registration failed. Please try again.'
    )
  } finally {
    setIsSubmitting(false)
  }
}
  const handleWorkoutDayFieldChange = (event) => {
    const { name, value } = event.target
    setWorkoutDayForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleExerciseRowChange = (index, field, value) => {
    setWorkoutDayForm((prev) => {
      const updatedExercises = [...prev.exercises]
      updatedExercises[index] = {
        ...updatedExercises[index],
        [field]: value,
      }

      return {
        ...prev,
        exercises: updatedExercises,
      }
    })
  }

  const addExerciseRow = () => {
    setWorkoutDayForm((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          exerciseId: '',
          targetSets: '',
          targetRepsMin: '',
          targetRepsMax: '',
          currentWorkingWeight: '',
          notes: '',
        },
      ],
    }))
  }

  const removeExerciseRow = (index) => {
    setWorkoutDayForm((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, rowIndex) => rowIndex !== index),
    }))
  }

  const handleCreateWorkoutDay = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const payload = {
        name: workoutDayForm.name,
        muscleFocus: workoutDayForm.muscleFocus || null,
        sortOrder: toNullableNumber(workoutDayForm.sortOrder),
        exercises: workoutDayForm.exercises.map((exercise, index) => ({
          exerciseId: Number(exercise.exerciseId),
          exerciseOrder: index + 1,
          targetSets: Number(exercise.targetSets),
          targetRepsMin: Number(exercise.targetRepsMin),
          targetRepsMax: Number(exercise.targetRepsMax),
          initialWeight: toNullableNumber(exercise.currentWorkingWeight),
          currentWorkingWeight: toNullableNumber(exercise.currentWorkingWeight),
          notes: exercise.notes || null,
        })),
      }

      const createdWorkoutDay = await createWorkoutDay(payload)

      setCreatedWorkoutDays((prev) => [...prev, createdWorkoutDay])
      setWorkoutDayForm(emptyWorkoutDay)
    } catch (err) {
      setError(
        err.response?.data?.message || 'Could not create workout day.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFinishRegistration = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <div className="min-h-screen bg-white px-6 py-6">
      <div className="mx-auto max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(ROUTES.LOGIN)}
            className="text-sm font-semibold"
            style={{ color: '#23a802' }}
          >
            Back to Login
          </button>

          <p className="text-sm text-slate-500">Step {step} of 4</p>
        </div>

        {step === 1 && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black">Create your account</h1>
              <p className="mt-2 text-sm text-slate-500">
                Start with your basic details to join FiTrack.
              </p>
            </div>

            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  value={accountData.username}
                  onChange={handleAccountChange}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="passcode"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="passcode"
                    name="passcode"
                    type={showPasscode ? 'text' : 'password'}
                    value={accountData.passcode}
                    onChange={handleAccountChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 pr-12 text-base outline-none transition focus:border-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPasscode((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500"
                aria-label={showPasscode ? 'Hide password' : 'Show password'}
              >
                {showPasscode ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l18 18"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.58 10.58A2 2 0 0013.42 13.42"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.88 5.09A9.77 9.77 0 0112 4.8c5.25 0 8.78 4.37 9.69 5.63a.91.91 0 010 1.14 17.59 17.59 0 01-4.11 4.22"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.61 6.61A17.34 17.34 0 002.31 10.43a.91.91 0 000 1.14C3.22 12.83 6.75 17.2 12 17.2c1.49 0 2.85-.27 4.08-.73"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.46 12.31C3.73 10.19 7.01 5.8 12 5.8c4.99 0 8.27 4.39 9.54 6.51.13.22.13.48 0 .7C20.27 15.13 16.99 19.2 12 19.2c-4.99 0-8.27-4.07-9.54-6.19a.67.67 0 010-.7z"
                    />
                    <circle cx="12" cy="12.5" r="3" />
                  </svg>
                )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPasscode"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <input
                    id="confirmPasscode"
                    name="confirmPasscode"
                    type={showConfirmPasscode ? 'text' : 'password'}
                    value={accountData.confirmPasscode}
                    onChange={handleAccountChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 pr-12 text-base outline-none transition focus:border-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPasscode((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500"
             aria-label={showPasscode ? 'Hide password' : 'Show password'}
              >
                {showPasscode ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l18 18"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.58 10.58A2 2 0 0013.42 13.42"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.88 5.09A9.77 9.77 0 0112 4.8c5.25 0 8.78 4.37 9.69 5.63a.91.91 0 010 1.14 17.59 17.59 0 01-4.11 4.22"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.61 6.61A17.34 17.34 0 002.31 10.43a.91.91 0 000 1.14C3.22 12.83 6.75 17.2 12 17.2c1.49 0 2.85-.27 4.08-.73"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.46 12.31C3.73 10.19 7.01 5.8 12 5.8c4.99 0 8.27 4.39 9.54 6.51.13.22.13.48 0 .7C20.27 15.13 16.99 19.2 12 19.2c-4.99 0-8.27-4.07-9.54-6.19a.67.67 0 010-.7z"
                    />
                    <circle cx="12" cy="12.5" r="3" />
                  </svg>
                )}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextFromAccount}
                disabled={!canGoToStepTwo}
                className="w-full rounded-full px-4 py-3 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
                style={{
                  backgroundColor: canGoToStepTwo ? '#23a802' : undefined,
                }}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="mb-2">
              <h1 className="text-3xl font-bold text-black">Enter gym goals</h1>
              <p className="mt-2 text-sm text-slate-500">
                Add your health, nutrition and fitness goals.
              </p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <SectionCard title="Health Goals">
              <GoalRow
                label="Current Weight"
                metric="kg"
                name="currentWeight"
                value={profileData.currentWeight}
                onChange={handleProfileChange}
                step="0.1"
                placeholder="0"
              />
              <GoalRow
                label="Weight Goal"
                metric="kg"
                name="weightGoal"
                value={profileData.weightGoal}
                onChange={handleProfileChange}
                step="0.1"
                placeholder="0"
              />
            </SectionCard>

            <SectionCard title="Nutrition Goals">
              <GoalRow
                label="Daily Calories Goal"
                metric="kcal"
                name="dailyCalorieGoal"
                value={profileData.dailyCalorieGoal}
                onChange={handleProfileChange}
                placeholder="0"
              />
              <GoalRow
                label="Daily Protein Goal"
                metric="g"
                name="dailyProteinGoal"
                value={profileData.dailyProteinGoal}
                onChange={handleProfileChange}
                placeholder="0"
              />
              <GoalRow
                label="Daily Carbs Goal"
                metric="g"
                name="dailyCarbGoal"
                value={profileData.dailyCarbGoal}
                onChange={handleProfileChange}
                placeholder="0"
              />
              <GoalRow
                label="Daily Fat Goal"
                metric="g"
                name="dailyFatGoal"
                value={profileData.dailyFatGoal}
                onChange={handleProfileChange}
                placeholder="0"
              />
            </SectionCard>

            <SectionCard title="Fitness Goals">
              <GoalRow
                label="Weekly Exercise Goal"
                metric="mins"
                name="weeklyExerciseGoal"
                value={profileData.weeklyExerciseGoal}
                onChange={handleProfileChange}
                placeholder="0"
              />
              <GoalRow
    label="Weekly Gym Goal"
    metric="days"
    name="weeklyGymGoal"
    value={profileData.weeklyGymGoal}
    onChange={handleProfileChange}
    placeholder="0"
  />
            </SectionCard>

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full px-4 py-3 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
                style={{ backgroundColor: isSubmitting ? undefined : '#23a802' }}
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError('')
                  setStep(1)
                }}
                className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-700"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-3xl font-bold text-black">Add gym days</h1>
              <p className="mt-2 text-sm text-slate-500">
                Would you like to set up your workout day structure now?
              </p>
            </div>

            <SectionCard title="Gym Setup">
              <div className="px-4 py-5">
                <p className="text-sm leading-6 text-slate-600">
                  You can add named gym days like Push, Pull, Legs or Upper/Lower,
                  then attach exercises to each day.
                </p>
              </div>
            </SectionCard>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setError('')
                  setStep(4)
                }}
                className="w-full rounded-full px-4 py-3 text-base font-semibold text-white"
                style={{ backgroundColor: '#23a802' }}
              >
                Yes, add gym days
              </button>

              <button
                type="button"
                onClick={handleFinishRegistration}
                className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-700"
              >
                Not now
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-3xl font-bold text-black">
                Add gym days & exercises
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Build your workout days and save the exercises you want to track.
              </p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {exerciseLoading && <p className="text-sm text-slate-500">Loading exercises...</p>}
            {exerciseError && <p className="text-sm text-red-600">{exerciseError}</p>}

            <form onSubmit={handleCreateWorkoutDay} className="space-y-5">
              <SectionCard title="Workout Day Details">
                <div className="space-y-4 px-4 py-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Day Name
                    </label>
                    <input
                      name="name"
                      value={workoutDayForm.name}
                      onChange={handleWorkoutDayFieldChange}
                      placeholder="Push Day"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Muscle Focus
                    </label>
                    <input
                      name="muscleFocus"
                      value={workoutDayForm.muscleFocus}
                      onChange={handleWorkoutDayFieldChange}
                      placeholder="Chest / Shoulders / Triceps"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Sort Order
                    </label>
                    <input
                      name="sortOrder"
                      type="number"
                      value={workoutDayForm.sortOrder}
                      onChange={handleWorkoutDayFieldChange}
                      placeholder="1"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-slate-400"
                    />
                  </div>
                </div>
              </SectionCard>

              <div className="space-y-4">
                {workoutDayForm.exercises.map((exercise, index) => (
                  <SectionCard key={index} title={`Exercise ${index + 1}`}>
                    <div className="space-y-4 px-4 py-4">
                      <ExerciseField label="Exercise">
                        <select
                          value={exercise.exerciseId}
                          onChange={(e) =>
                            handleExerciseRowChange(index, 'exerciseId', e.target.value)
                          }
                          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-slate-400"
                        >
                          <option value="">Select an exercise</option>
                          {exerciseCatalog.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} - {item.bodyPart} - {item.exerciseType}
                            </option>
                          ))}
                        </select>
                      </ExerciseField>

                      <div className="grid grid-cols-2 gap-4">
                        <ExerciseField label="Target Sets">
                          <input
                            type="number"
                            value={exercise.targetSets}
                            onChange={(e) =>
                              handleExerciseRowChange(index, 'targetSets', e.target.value)
                            }
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-slate-400"
                          />
                        </ExerciseField>

                        <ExerciseField label="Current Weight (kg)">
                          <input
                            type="number"
                            step="0.1"
                            value={exercise.currentWorkingWeight}
                            onChange={(e) =>
                              handleExerciseRowChange(
                                index,
                                'currentWorkingWeight',
                                e.target.value
                              )
                            }
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-slate-400"
                          />
                        </ExerciseField>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <ExerciseField label="Target Reps Min">
                          <input
                            type="number"
                            value={exercise.targetRepsMin}
                            onChange={(e) =>
                              handleExerciseRowChange(index, 'targetRepsMin', e.target.value)
                            }
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-slate-400"
                          />
                        </ExerciseField>

                        <ExerciseField label="Target Reps Max">
                          <input
                            type="number"
                            value={exercise.targetRepsMax}
                            onChange={(e) =>
                              handleExerciseRowChange(index, 'targetRepsMax', e.target.value)
                            }
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-slate-400"
                          />
                        </ExerciseField>
                      </div>

                      <ExerciseField label="Notes">
                        <textarea
                          value={exercise.notes}
                          onChange={(e) =>
                            handleExerciseRowChange(index, 'notes', e.target.value)
                          }
                          rows={3}
                          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-slate-400"
                        />
                      </ExerciseField>

                      {workoutDayForm.exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExerciseRow(index)}
                          className="w-full rounded-full border border-red-200 px-4 py-3 text-sm font-semibold text-red-600"
                        >
                          Remove Exercise
                        </button>
                      )}
                    </div>
                  </SectionCard>
                ))}
              </div>

              <button
                type="button"
                onClick={addExerciseRow}
                className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-700"
              >
                Add Another Exercise
              </button>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full px-4 py-3 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
                  style={{ backgroundColor: isSubmitting ? undefined : '#23a802' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Workout Day'}
                </button>

                <button
                  type="button"
                  onClick={handleFinishRegistration}
                  className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-700"
                >
                  Finish
                </button>
              </div>
            </form>

            {createdWorkoutDays.length > 0 && (
              <SectionCard title="Saved Workout Days">
                <div className="px-4 py-4">
                  <ul className="space-y-2 text-sm text-slate-700">
                    {createdWorkoutDays.map((day) => (
                      <li
                        key={day.id}
                        className="rounded-xl bg-slate-50 px-3 py-3 font-medium"
                      >
                        {day.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </SectionCard>
            )}
          </div>
        )}

        <Modal
          isOpen={successModalOpen}
          title="Yay, you're in!"
          confirmText="Next"
          onConfirm={() => {
            setSuccessModalOpen(false)
            setStep(3)
          }}
          confirmButtonClassName="bg-[#23a802] text-white"
        >
          Welcome to FiTrack.
        </Modal>
      </div>
    </div>
  )
}

export default CreateAccountPage