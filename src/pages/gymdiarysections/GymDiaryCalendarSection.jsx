import { useEffect, useRef, useState } from 'react'

const DAY_SHORT_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const parseDateString = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const formatDateString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const addDays = (date, days) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const buildDateRange = (centerDateString, daysBefore = 120, daysAfter = 120) => {
  const centerDate = parseDateString(centerDateString)
  const dates = []

  for (let i = -daysBefore; i <= daysAfter; i += 1) {
    dates.push(formatDateString(addDays(centerDate, i)))
  }

  return dates
}

const formatMonthYear = (dateString) => {
  const date = parseDateString(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

function GymDiaryCalendarSection({
  selectedDate,
  onSelectDate,
  onOpenCalendar,
}) {
  const scrollRef = useRef(null)
  const hasCenteredInitiallyRef = useRef(false)

  const [dates, setDates] = useState(() => buildDateRange(selectedDate, 120, 120))
  const [visibleMonthYear, setVisibleMonthYear] = useState(() =>
    formatMonthYear(selectedDate)
  )

  useEffect(() => {
    if (!dates.includes(selectedDate)) {
      setDates(buildDateRange(selectedDate, 120, 120))
      hasCenteredInitiallyRef.current = false
    }
  }, [selectedDate, dates])

  const updateVisibleMonthFromScroll = () => {
    const container = scrollRef.current
    if (!container) return

    const items = Array.from(container.querySelectorAll('[data-date]'))
    if (!items.length) return

    const containerCenter = container.scrollLeft + container.clientWidth / 2

    let closestEl = null
    let closestDistance = Infinity

    for (const item of items) {
      const itemCenter = item.offsetLeft + item.offsetWidth / 2
      const distance = Math.abs(itemCenter - containerCenter)

      if (distance < closestDistance) {
        closestDistance = distance
        closestEl = item
      }
    }

    if (closestEl) {
      const centeredDate = closestEl.getAttribute('data-date')
      if (centeredDate) {
        setVisibleMonthYear(formatMonthYear(centeredDate))
      }
    }
  }

  useEffect(() => {
  if (!scrollRef.current) return
  if (!dates.length) return

  const selectedIndex = dates.indexOf(selectedDate)
  if (selectedIndex === -1) return

  const container = scrollRef.current
  const selectedEl = container.querySelector(`[data-date="${selectedDate}"]`)

  if (!selectedEl) return

  selectedEl.scrollIntoView({
    behavior: hasCenteredInitiallyRef.current ? 'smooth' : 'auto',
    inline: 'center',
    block: 'nearest',
  })

  hasCenteredInitiallyRef.current = true

  requestAnimationFrame(() => {
    updateVisibleMonthFromScroll()
  })
}, [dates, selectedDate])

  useEffect(() => {
    setVisibleMonthYear(formatMonthYear(selectedDate))
  }, [selectedDate])

  const handleScroll = () => {
    const container = scrollRef.current
    if (!container) return

    updateVisibleMonthFromScroll()

    const threshold = 300
    const nearLeftEdge = container.scrollLeft < threshold
    const nearRightEdge =
      container.scrollWidth - container.scrollLeft - container.clientWidth < threshold

    if (nearLeftEdge) {
      const firstDate = parseDateString(dates[0])
      const newDates = []

      for (let i = 120; i >= 1; i -= 1) {
        newDates.push(formatDateString(addDays(firstDate, -i)))
      }

      const previousWidth = container.scrollWidth
      setDates((prev) => [...newDates, ...prev])

      requestAnimationFrame(() => {
        const newWidth = container.scrollWidth
        container.scrollLeft += newWidth - previousWidth
        updateVisibleMonthFromScroll()
      })
    }

    if (nearRightEdge) {
      const lastDate = parseDateString(dates[dates.length - 1])
      const newDates = []

      for (let i = 1; i <= 120; i += 1) {
        newDates.push(formatDateString(addDays(lastDate, i)))
      }

      setDates((prev) => [...prev, ...newDates])

      requestAnimationFrame(() => {
        updateVisibleMonthFromScroll()
      })
    }
  }

  return (
    <section className="rounded-[2rem]">
      <div className="pt-4 pr-4 pl-2">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#4F6F5D]">
            {visibleMonthYear}
          </h2>

          <button
            type="button"
            onClick={onOpenCalendar}
            aria-label="Open calendar"
            className="flex h-11 w-11 items-center justify-center rounded-full text-slate-900 transition hover:bg-slate-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 15 15"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.5 1C4.77614 1 5 1.22386 5 1.5V2H10V1.5C10 1.22386 10.2239 1 10.5 1C10.7761 1 11 1.22386 11 1.5V2H12.5C13.3284 2 14 2.67157 14 3.5V12.5C14 13.3284 13.3284 14 12.5 14H2.5C1.67157 14 1 13.3284 1 12.5V3.5C1 2.67157 1.67157 2 2.5 2H4V1.5C4 1.22386 4.22386 1 4.5 1ZM10 3V3.5C10 3.77614 10.2239 4 10.5 4C10.7761 4 11 3.77614 11 3.5V3H12.5C12.7761 3 13 3.22386 13 3.5V5H2V3.5C2 3.22386 2.22386 3 2.5 3H4V3.5C4 3.77614 4.22386 4 4.5 4C4.77614 4 5 3.77614 5 3.5V3H10ZM2 6V12.5C2 12.7761 2.22386 13 2.5 13H12.5C12.7761 13 13 12.7761 13 12.5V6H2ZM7 7.5C7 7.22386 7.22386 7 7.5 7C7.77614 7 8 7.22386 8 7.5C8 7.77614 7.77614 8 7.5 8C7.22386 8 7 7.77614 7 7.5ZM9.5 7C9.22386 7 9 7.22386 9 7.5C9 7.77614 9.22386 8 9.5 8C9.77614 8 10 7.77614 10 7.5C10 7.22386 9.77614 7 9.5 7ZM11 7.5C11 7.22386 11.2239 7 11.5 7C11.7761 7 12 7.22386 12 7.5C12 7.77614 11.7761 8 11.5 8C11.2239 8 11 7.77614 11 7.5ZM11.5 9C11.2239 9 11 9.22386 11 9.5C11 9.77614 11.2239 10 11.5 10C11.7761 10 12 9.77614 12 9.5C12 9.22386 11.7761 9 11.5 9ZM9 9.5C9 9.22386 9.22386 9 9.5 9C9.77614 9 10 9.22386 10 9.5C10 9.77614 9.77614 10 9.5 10C9.22386 10 9 9.77614 9 9.5ZM7.5 9C7.22386 9 7 9.22386 7 9.5C7 9.77614 7.22386 10 7.5 10C7.77614 10 8 9.77614 8 9.5C8 9.22386 7.77614 9 7.5 9ZM5 9.5C5 9.22386 5.22386 9 5.5 9C5.77614 9 6 9.22386 6 9.5C6 9.77614 5.77614 10 5.5 10C5.22386 10 5 9.77614 5 9.5ZM3.5 9C3.22386 9 3 9.22386 3 9.5C3 9.77614 3.22386 10 3.5 10C3.77614 10 4 9.77614 4 9.5C4 9.22386 3.77614 9 3.5 9ZM3 11.5C3 11.2239 3.22386 11 3.5 11C3.77614 11 4 11.2239 4 11.5C4 11.7761 3.77614 12 3.5 12C3.22386 12 3 11.7761 3 11.5ZM5.5 11C5.22386 11 5 11.2239 5 11.5C5 11.7761 5.22386 12 5.5 12C5.77614 12 6 11.7761 6 11.5C6 11.2239 5.77614 11 5.5 11ZM7 11.5C7 11.2239 7.22386 11 7.5 11C7.77614 11 8 11.2239 8 11.5C8 11.7761 7.77614 12 7.5 12C7.22386 12 7 11.7761 7 11.5ZM9.5 11C9.22386 11 9 11.2239 9 11.5C9 11.7761 9.22386 12 9.5 12C9.77614 12 10 11.7761 10 11.5C10 11.2239 9.77614 11 9.5 11Z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="
          relative left-1/2 flex w-screen -translate-x-1/2 gap-3 overflow-x-auto pb-4 snap-x snap-mandatory
          [scrollbar-width:none] [-ms-overflow-style:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {dates.map((dateString) => {
          const date = parseDateString(dateString)
          const isSelected = dateString === selectedDate
          const dayShort = DAY_SHORT_LABELS[date.getDay()]
          const dayNumber = date.getDate()

          return (
            <button
              key={dateString}
              data-date={dateString}
              type="button"
              onClick={() => onSelectDate(dateString)}
              className={`snap-center flex h-[58px] min-w-[58px] flex-col items-center justify-center rounded-2xl px-3 py-2 text-center shadow-sm transition ${
                isSelected
                  ? 'bg-[#2F7D57] text-white'
                  : 'bg-[#DFF3E6] text-slate-900'
              }`}
            >
              <span
                className={`text-xs font-semibold tracking-[0.12em] leading-none ${
                  isSelected ? 'text-white/80' : 'text-[#7A9B88]'
                }`}
              >
                {dayShort}
              </span>

              <span
                className={`mt-1 text-md font-bold leading-none ${
                  isSelected ? 'text-white/80' : 'text-[#2F5D46]'
                }`}
              >
                {dayNumber}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default GymDiaryCalendarSection