import { useMemo, useState } from 'react'
import FoodDatePickerSheet from './FoodDatePickerSheet'

function ChevronDownIcon({ className = 'h-5 w-5' }) {
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
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

const startOfDay = (date) => {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

const isSameDay = (a, b) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const formatHeaderDateLabel = (date) => {
  const normalizedDate = startOfDay(date)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (isSameDay(normalizedDate, today)) {
    return 'Today'
  }

  if (isSameDay(normalizedDate, yesterday)) {
    return 'Yesterday'
  }

  return normalizedDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function FoodTitleSection({ selectedDate, onChangeDate }) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const titleLabel = useMemo(
    () => formatHeaderDateLabel(selectedDate),
    [selectedDate]
  )

  return (
    <>
      <section className="px-4 pt-4">
        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className="inline-flex items-center gap-1 text-left text-xl font-bold text-black"
          aria-label="Open food date picker"
        >
          <span>{titleLabel}</span>
          <ChevronDownIcon className="mt-0.5 h-5 w-5 text-slate-700" />
        </button>
      </section>

      <FoodDatePickerSheet
        isOpen={isPickerOpen}
        selectedDate={selectedDate}
        onClose={() => setIsPickerOpen(false)}
        onConfirm={onChangeDate}
      />
    </>
  )
}

export default FoodTitleSection