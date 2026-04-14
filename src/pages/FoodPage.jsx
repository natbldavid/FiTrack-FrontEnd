import { useEffect, useRef, useState } from 'react'
import { deleteFoodLog, getDailyFoodSummary } from '../api/foodLogApi'
import { getUserGoalsHistory } from '../api/userApi'
import CalorieCountCard from './foodpagesections/CalorieCountCard'
import FoodTitleSection from './foodpagesections/FoodTitleSection'
import FoodLogging from './foodpagesections/FoodLogging'

const SWIPE_THRESHOLD = 50

const startOfDay = (date) => {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

const addDays = (date, days) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
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
  const [goalsHistory, setGoalsHistory] = useState(null)
  const [selectedGoals, setSelectedGoals] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const touchStartXRef = useRef(null)
  const touchStartYRef = useRef(null)
  const isRowSwipeLockedRef = useRef(false)

  useEffect(() => {
    let isMounted = true

    const loadFoodPageData = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const logDate = formatLogDate(selectedDate)

        const summaryPromise = getDailyFoodSummary(logDate)
        const goalsPromise = goalsHistory
          ? Promise.resolve(goalsHistory)
          : getUserGoalsHistory()

        const [summary, history] = await Promise.all([summaryPromise, goalsPromise])

        if (!isMounted) return

        setDailySummary(summary)
        setGoalsHistory(history)
        setSelectedGoals(findGoalsHistoryForDate(history, selectedDate))
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

  const refreshDailySummary = async () => {
    try {
      const logDate = formatLogDate(selectedDate)
      const summary = await getDailyFoodSummary(logDate)
      setDailySummary(summary)

      if (goalsHistory) {
        setSelectedGoals(findGoalsHistoryForDate(goalsHistory, selectedDate))
      }
    } catch {
      setErrorMessage('Unable to load food data.')
    }
  }

  const handleDeleteFoodLog = async (foodLogId) => {
    await deleteFoodLog(foodLogId)
    await refreshDailySummary()
  }

  const lockPageSwipe = () => {
    isRowSwipeLockedRef.current = true
  }

  const unlockPageSwipe = () => {
    isRowSwipeLockedRef.current = false
    touchStartXRef.current = null
    touchStartYRef.current = null
  }

  const handleTouchStart = (event) => {
    if (isRowSwipeLockedRef.current) {
      return
    }

    const touch = event.touches[0]
    touchStartXRef.current = touch.clientX
    touchStartYRef.current = touch.clientY
  }

  const handleTouchEnd = (event) => {
    if (isRowSwipeLockedRef.current) {
      return
    }

    if (touchStartXRef.current === null || touchStartYRef.current === null) {
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

  return (
    <div
      className="pb-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
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
            onDeleteFoodLog={handleDeleteFoodLog}
            onRowSwipeStart={lockPageSwipe}
            onRowSwipeEnd={unlockPageSwipe}
          />
        </>
      )}
    </div>
  )
}

export default FoodPage