import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { getExercises } from '../api/exerciseApi'
import { getWorkoutDayById } from '../api/workoutDaysApi'
import ExerciseSummaryTitleSection from './exercisessummarysections/ExerciseSummaryTitleSection'
import ExerciseSummaryGifDemoSection from './exercisessummarysections/ExerciseSummaryGifDemoSection'
import ExerciseSummaryInfoSection from './exercisessummarysections/ExerciseSummaryInfoSection'
import ExerciseWeightTrendSection from './exercisessummarysections/ExerciseWeightTrendSection'

function ExercisesSummary() {
  const { workoutDayId, exerciseId } = useParams()
  const location = useLocation()

  const [exercise, setExercise] = useState(location.state?.exercise ?? null)
  const [workoutDayName, setWorkoutDayName] = useState(
    location.state?.workoutDayName ?? 'Exercise'
  )
  const [exerciseDemoGif, setExerciseDemoGif] = useState('')
  const [isLoading, setIsLoading] = useState(!location.state?.exercise)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadExerciseSummary = async () => {
      setIsLoading(true)
      setError('')

      try {
        let resolvedExercise = location.state?.exercise ?? null
        let resolvedWorkoutDayName = location.state?.workoutDayName ?? 'Exercise'

        if (!resolvedExercise) {
          const workoutDay = await getWorkoutDayById(workoutDayId)
          const matchedExercise = workoutDay?.exercises?.find(
            (item) => String(item.exerciseId) === String(exerciseId)
          )

          resolvedWorkoutDayName = workoutDay?.name || 'Exercise'
          resolvedExercise = matchedExercise ?? null

          setWorkoutDayName(resolvedWorkoutDayName)
          setExercise(resolvedExercise)

          if (!matchedExercise) {
            setError('Could not find exercise.')
          }
        } else {
          setWorkoutDayName(resolvedWorkoutDayName)
          setExercise(resolvedExercise)
        }

        const exerciseCatalog = await getExercises()
        const normalizedCatalog = Array.isArray(exerciseCatalog)
          ? exerciseCatalog
          : []

        const matchedCatalogExercise = normalizedCatalog.find(
          (item) => String(item.id) === String(exerciseId)
        )

        setExerciseDemoGif(matchedCatalogExercise?.exerciseDemoGif || '')
      } catch (err) {
        console.error(err)
        setError('Could not load exercise summary.')
      } finally {
        setIsLoading(false)
      }
    }

    loadExerciseSummary()
  }, [exerciseId, location.state, workoutDayId])

  if (isLoading) {
    return <div className="px-4 py-4 text-sm text-slate-500">Loading...</div>
  }

  if (error) {
    return <div className="px-4 py-4 text-sm text-red-600">{error}</div>
  }

  return (
    <div className="min-h-screen w-screen bg-slate-100">
      <div className="mx-auto w-full max-w-4xl px-4 py-4">
        <ExerciseSummaryTitleSection
          title={exercise?.exerciseName || workoutDayName}
          workoutDayId={workoutDayId}
        />

        <ExerciseSummaryGifDemoSection
          exerciseName={exercise?.exerciseName || 'Exercise'}
          gifUrl={exerciseDemoGif}
        />

        <ExerciseSummaryInfoSection exercise={exercise} />

        <ExerciseWeightTrendSection
          workoutDayId={workoutDayId}
          exerciseId={exerciseId}
          exerciseName={exercise?.exerciseName || 'Exercise'}
        />
      </div>
    </div>
  )
}

export default ExercisesSummary