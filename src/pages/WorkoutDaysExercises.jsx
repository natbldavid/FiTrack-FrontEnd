import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getWorkoutDayById } from '../api/workoutDaysApi'
import WorkoutDayExercisesTitleSection from './workoutdaysexercisessections/WorkoutDayExercisesTitleSection'
import WorkoutDayExercisesListSection from './workoutdaysexercisessections/WorkoutDayExercisesListSection'

function WorkoutDaysExercises() {
  const { workoutDayId } = useParams()

  const [workoutDay, setWorkoutDay] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadWorkoutDay = async () => {
      setIsLoading(true)
      setError('')

      try {
        const data = await getWorkoutDayById(workoutDayId)
        setWorkoutDay(data ?? null)
      } catch (err) {
        console.error(err)
        setError('Could not load workout day.')
        setWorkoutDay(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkoutDay()
  }, [workoutDayId])

  if (isLoading) {
    return <div className="px-4 py-4 text-sm text-slate-500">Loading...</div>
  }

  if (error) {
    return <div className="px-4 py-4 text-sm text-red-600">{error}</div>
  }

  return (
    <div className="min-h-screen w-screen bg-slate-100">
      <div className="mx-auto w-full max-w-4xl px-4 py-4">
        <WorkoutDayExercisesTitleSection title={workoutDay?.name || 'Workout Day'} />
        <WorkoutDayExercisesListSection workoutDay={workoutDay} />
      </div>
    </div>
  )
}

export default WorkoutDaysExercises