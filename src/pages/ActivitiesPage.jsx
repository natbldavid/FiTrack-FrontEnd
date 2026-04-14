import { useRef, useState } from 'react'
import ActivitiesTitleSection from './activitypagesections/ActivitiesTitleSection'
import DailyActivitySummarySection from './activitypagesections/DailyActivitySummarySection'
import QuickActionCardsSection from './activitypagesections/QuickActionCardsSection'
import NinetyDayActivityGraph from './activitypagesections/90DayActivityGraph'

const SWIPE_THRESHOLD = 50

const getTodayDate = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

const addDays = (date, days) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

function ActivitiesPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate())

  const touchStartXRef = useRef(null)
  const touchStartYRef = useRef(null)

  const handleTouchStart = (event) => {
    const touch = event.touches[0]
    touchStartXRef.current = touch.clientX
    touchStartYRef.current = touch.clientY
  }

  const handleTouchEnd = (event) => {
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
      <ActivitiesTitleSection
        selectedDate={selectedDate}
        onChangeDate={setSelectedDate}
      />

      <DailyActivitySummarySection selectedDate={selectedDate} />
      <QuickActionCardsSection />
      <NinetyDayActivityGraph selectedDate={selectedDate} />
    </div>
  )
}

export default ActivitiesPage