import { useEffect, useState } from 'react'
import { getDailyFoodSummary } from '../api/foodLogApi'
import { getUserGoalsHistory } from '../api/userApi'
import CalorieCountCard from './foodpagesections/CalorieCountCard'
import FoodTitleSection from './foodpagesections/FoodTitleSection'
import FoodLogging from './foodpagesections/FoodLogging'

const startOfDay = (date) => {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

const formatLogDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const findGoalsHistoryForDate = (historyRows, targetDate) => {
  if (!Array.isArray(historyRows) || historyRows.length === 0) {
    return null
  }

  const target = startOfDay(targetDate)

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

function FoodPage() {
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()))
  const [dailySummary, setDailySummary] = useState(null)
  const [selectedGoals, setSelectedGoals] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadFoodPageData = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const logDate = formatLogDate(selectedDate)

        const [summary, goalsHistory] = await Promise.all([
          getDailyFoodSummary(logDate),
          getUserGoalsHistory(),
        ])

        if (!isMounted) return

        const applicableGoals = findGoalsHistoryForDate(goalsHistory, selectedDate)

        setDailySummary(summary)
        setSelectedGoals(applicableGoals)
      } catch {
        if (!isMounted) return
        setErrorMessage('Unable to load food data.')
        setDailySummary(null)
        setSelectedGoals(null)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadFoodPageData()

    return () => {
      isMounted = false
    }
  }, [selectedDate])

  return (
    <div className="pb-4">
      <FoodTitleSection
        selectedDate={selectedDate}
        onChangeDate={setSelectedDate}
      />

      {isLoading ? (
        <div className="px-4 pt-4 text-sm text-slate-500">Loading...</div>
      ) : errorMessage ? (
        <div className="px-4 pt-4 text-sm text-red-500">{errorMessage}</div>
      ) : (
        <>
          <CalorieCountCard
            dailySummary={dailySummary}
            selectedGoals={selectedGoals}
          />
          <FoodLogging
            dailySummary={dailySummary}
            selectedDate={selectedDate}
          />
        </>
      )}
    </div>
  )
}

export default FoodPage