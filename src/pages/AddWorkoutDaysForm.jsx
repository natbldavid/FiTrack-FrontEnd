import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getExercises } from '../api/exerciseApi'
import { createWorkoutDay } from '../api/workoutDaysApi'
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

function BackIcon({ className = 'h-6 w-6' }) {
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
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function PlusIcon({ className = 'h-5 w-5' }) {
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
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-black">{title}</h2>
      </div>
      <div>{children}</div>
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

function AddWorkoutDaysForm() {
  const navigate = useNavigate()

  const [exerciseCatalog, setExerciseCatalog] = useState([])
  const [exerciseLoading, setExerciseLoading] = useState(true)
  const [exerciseError, setExerciseError] = useState('')

  const [workoutDayForm, setWorkoutDayForm] = useState(emptyWorkoutDay)
  const [createdWorkoutDays, setCreatedWorkoutDays] = useState([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const loadExercises = async () => {
      setExerciseLoading(true)
      setExerciseError('')

      try {
        const data = await getExercises()
        setExerciseCatalog(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        setExerciseError(
          err.response?.data?.message || 'Could not load exercises.'
        )
      } finally {
        setExerciseLoading(false)
      }
    }

    loadExercises()
  }, [])

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
    setSuccessMessage('')

    if (!workoutDayForm.name.trim()) {
      setError('Workout day name is required.')
      return
    }

    if (
      workoutDayForm.exercises.some(
        (exercise) =>
          !exercise.exerciseId ||
          exercise.targetSets === '' ||
          exercise.targetRepsMin === '' ||
          exercise.targetRepsMax === ''
      )
    ) {
      setError(
        'Please select an exercise and enter sets and rep ranges for every row.'
      )
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        name: workoutDayForm.name.trim(),
        muscleFocus: workoutDayForm.muscleFocus.trim() || null,
        sortOrder: toNullableNumber(workoutDayForm.sortOrder),
        exercises: workoutDayForm.exercises.map((exercise, index) => ({
          exerciseId: Number(exercise.exerciseId),
          exerciseOrder: index + 1,
          targetSets: Number(exercise.targetSets),
          targetRepsMin: Number(exercise.targetRepsMin),
          targetRepsMax: Number(exercise.targetRepsMax),
          initialWeight: toNullableNumber(exercise.currentWorkingWeight),
          currentWorkingWeight: toNullableNumber(exercise.currentWorkingWeight),
          notes: exercise.notes?.trim() || null,
        })),
      }

      const createdWorkoutDay = await createWorkoutDay(payload)

      setCreatedWorkoutDays((prev) => [...prev, createdWorkoutDay])
      setWorkoutDayForm(emptyWorkoutDay)
      setSuccessMessage('Workout day created successfully.')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Could not create workout day.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-screen bg-slate-100">
      <div className="mx-auto w-full max-w-4xl px-4 py-4">
        <section className="pb-4">
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              onClick={() => navigate(ROUTES.WORKOUT_DASHBOARD)}
              className="absolute left-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
              aria-label="Go back"
            >
              <BackIcon />
            </button>

            <h1 className="text-lg font-semibold text-black">
              Add Workout Day
            </h1>
          </div>
        </section>

        <div className="space-y-5">
          <div>
            <p className="text-sm text-slate-500">
              Build your workout day and attach the exercises you want to track.
            </p>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {successMessage ? (
            <p className="text-sm text-green-600">{successMessage}</p>
          ) : null}
          {exerciseLoading ? (
            <p className="text-sm text-slate-500">Loading exercises...</p>
          ) : null}
          {exerciseError ? (
            <p className="text-sm text-red-600">{exerciseError}</p>
          ) : null}

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
                          handleExerciseRowChange(
                            index,
                            'exerciseId',
                            e.target.value
                          )
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
                            handleExerciseRowChange(
                              index,
                              'targetSets',
                              e.target.value
                            )
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
                            handleExerciseRowChange(
                              index,
                              'targetRepsMin',
                              e.target.value
                            )
                          }
                          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-slate-400"
                        />
                      </ExerciseField>

                      <ExerciseField label="Target Reps Max">
                        <input
                          type="number"
                          value={exercise.targetRepsMax}
                          onChange={(e) =>
                            handleExerciseRowChange(
                              index,
                              'targetRepsMax',
                              e.target.value
                            )
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

                    {workoutDayForm.exercises.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeExerciseRow(index)}
                        className="w-full rounded-full border border-red-200 px-4 py-3 text-sm font-semibold text-red-600"
                      >
                        Remove Exercise
                      </button>
                    ) : null}
                  </div>
                </SectionCard>
              ))}
            </div>

            <button
              type="button"
              onClick={addExerciseRow}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-700"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Another Exercise</span>
            </button>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isSubmitting || exerciseLoading}
                className="w-full rounded-full px-4 py-3 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
                style={{ backgroundColor: isSubmitting ? undefined : '#23a802' }}
              >
                {isSubmitting ? 'Saving...' : 'Save Workout Day'}
              </button>

              <button
                type="button"
                onClick={() => navigate(ROUTES.WORKOUT_DASHBOARD)}
                className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-700"
              >
                Back to Dashboard
              </button>
            </div>
          </form>

          {createdWorkoutDays.length > 0 ? (
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
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default AddWorkoutDaysForm