import { useState } from 'react'
import ActivitiesTitleSection from './activitypagesections/ActivitiesTitleSection'
import DailyActivitySummarySection from './activitypagesections/DailyActivitySummarySection'
import QuickActionCardsSection from './activitypagesections/QuickActionCardsSection'
import NinetyDayActivityGraph from './activitypagesections/90DayActivityGraph'

const getTodayDate = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function ActivitiesPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate())

  return (
    <div className="pb-4">
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