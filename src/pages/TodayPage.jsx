import { useEffect, useRef, useState } from 'react'
import { getDailyFoodSummary } from '../api/foodLogApi'
import { getUserGoalsHistory } from '../api/userApi'
import TodayTitleSection from './todaypagesections/TodayTitleSection'
import CaloriesCardSection from './todaypagesections/CaloriesCardSection'
import MacrosCardSection from './todaypagesections/MacrosCardSection'
import GymCardsSection from './todaypagesections/GymCardsSection'
import WeightTrendSection from './todaypagesections/WeightTrendSection'

const SWIPE_THRESHOLD = 50

const formatDateString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getTodayDate = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

const getStartOfDay = (date) => {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

const addDays = (date, days) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

const findGoalsHistoryForDate = (historyRows, targetDate) => {
  if (!Array.isArray(historyRows) || historyRows.length === 0) {
    return null
  }

  const target = getStartOfDay(targetDate)

  return (
    historyRows.find((row) => {
      if (!row?.effectiveFrom) {
        return false
      }

      const effectiveFrom = new Date(row.effectiveFrom)
      const effectiveTo = row.effectiveTo ? new Date(row.effectiveTo) : null

      return effectiveFrom <= target && (!effectiveTo || effectiveTo >= target)
    }) ?? null
  )
}

function TodayPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate())
  const [foodSummary, setFoodSummary] = useState(null)
  const [goalsHistory, setGoalsHistory] = useState([])
  const [selectedGoals, setSelectedGoals] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const touchStartXRef = useRef(null)
  const touchStartYRef = useRef(null)

  useEffect(() => {
    const loadTodayData = async () => {
      setIsLoading(true)
      setError('')

      try {
        const selectedDateString = formatDateString(selectedDate)

        const [foodData, goalsHistoryData] = await Promise.all([
          getDailyFoodSummary(selectedDateString),
          getUserGoalsHistory(),
        ])

        setFoodSummary(foodData)
        setGoalsHistory(goalsHistoryData)

        const applicableGoals = findGoalsHistoryForDate(
          goalsHistoryData,
          selectedDate
        )

        setSelectedGoals(applicableGoals)
      } catch (err) {
        console.error(err)
        setError('Could not load selected day data.')
      } finally {
        setIsLoading(false)
      }
    }

    loadTodayData()
  }, [selectedDate])

  const handleTouchStart = (event) => {
    const touch = event.touches[0]
    touchStartXRef.current = touch.clientX
    touchStartYRef.current = touch.clientY
  }

  const handleTouchEnd = (event) => {
    if (
      touchStartXRef.current === null ||
      touchStartYRef.current === null
    ) {
      return
    }

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - touchStartXRef.current
    const deltaY = touch.clientY - touchStartYRef.current

    touchStartXRef.current = null
    touchStartYRef.current = null

    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY)
    const passedThreshold = Math.abs(deltaX) > SWIPE_THRESHOLD

    if (!isHorizontalSwipe || !passedThreshold) {
      return
    }

    if (deltaX < 0) {
      setSelectedDate((current) => addDays(current, 1))
      return
    }

    setSelectedDate((current) => addDays(current, -1))
  }

  if (isLoading) {
    return <div className="px-4 py-4 text-sm text-slate-500">Loading...</div>
  }

  if (error) {
    return <div className="px-4 py-4 text-sm text-red-600">{error}</div>
  }

  return (
    <div
      className="pb-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <TodayTitleSection
        selectedDate={selectedDate}
        onChangeDate={setSelectedDate}
      />

      <CaloriesCardSection
        calorieGoal={selectedGoals?.dailyCalorieGoal ?? 0}
        foodCalories={foodSummary?.totalCalories ?? 0}
      />

      <MacrosCardSection
        carbGoal={selectedGoals?.dailyCarbGoal ?? 0}
        fatGoal={selectedGoals?.dailyFatGoal ?? 0}
        proteinGoal={selectedGoals?.dailyProteinGoal ?? 0}
        carbsConsumed={foodSummary?.totalCarbs ?? 0}
        fatConsumed={foodSummary?.totalFat ?? 0}
        proteinConsumed={foodSummary?.totalProtein ?? 0}
      />

      <GymCardsSection
        selectedDate={selectedDate}
        weeklyExerciseGoal={selectedGoals?.weeklyExerciseGoal ?? 0}
      />

      <WeightTrendSection selectedDate={selectedDate} />
    </div>
  )
}

export default TodayPage