import { useEffect, useMemo, useRef, useState } from 'react'

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

const isSameMonth = (dateA, dateB) => {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth()
  )
}

const getMonthStart = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

const addMonths = (date, months) => {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

const formatMonthYear = (date) => {
  return date.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

const buildMonthGrid = (monthDate) => {
  const monthStart = getMonthStart(monthDate)
  const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

  const startDayOfWeek = monthStart.getDay()
  const daysInMonth = monthEnd.getDate()

  const cells = []

  for (let i = 0; i < startDayOfWeek; i += 1) {
    const date = new Date(monthStart)
    date.setDate(monthStart.getDate() - (startDayOfWeek - i))
    cells.push({
      dateString: formatDateString(date),
      date,
      isCurrentMonth: false,
    })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
    cells.push({
      dateString: formatDateString(date),
      date,
      isCurrentMonth: true,
    })
  }

  while (cells.length % 7 !== 0) {
    const lastDate = cells[cells.length - 1].date
    const date = new Date(lastDate)
    date.setDate(lastDate.getDate() + 1)
    cells.push({
      dateString: formatDateString(date),
      date,
      isCurrentMonth: false,
    })
  }

  return cells
}

const buildMonthRange = (centerDateString, monthsBefore = 12, monthsAfter = 12) => {
  const centerDate = parseDateString(centerDateString)
  const centerMonth = getMonthStart(centerDate)
  const months = []

  for (let i = -monthsBefore; i <= monthsAfter; i += 1) {
    months.push(addMonths(centerMonth, i))
  }

  return months
}

function GymDiaryPopUpCalendarSection({
  isOpen,
  selectedDate,
  onClose,
  onSelectDate,
  completedWorkoutDateSet,
}) {
  const scrollRef = useRef(null)
  const hasAutoPositionedRef = useRef(false)

  const [months, setMonths] = useState(() => buildMonthRange(selectedDate, 12, 12))
  const [visibleMonthYear, setVisibleMonthYear] = useState(() =>
    formatMonthYear(parseDateString(selectedDate))
  )

  useEffect(() => {
    if (!isOpen) {
      hasAutoPositionedRef.current = false
      return
    }

    const monthExists = months.some((month) =>
      isSameMonth(month, parseDateString(selectedDate))
    )

    if (!monthExists) {
      setMonths(buildMonthRange(selectedDate, 12, 12))
      hasAutoPositionedRef.current = false
    }

    setVisibleMonthYear(formatMonthYear(parseDateString(selectedDate)))
  }, [isOpen, selectedDate, months])

  useEffect(() => {
    if (!isOpen) return
    if (!scrollRef.current) return

    const container = scrollRef.current
    const selectedMonthKey = selectedDate.slice(0, 7)
    const targetEl = container.querySelector(`[data-month="${selectedMonthKey}"]`)

    if (targetEl && !hasAutoPositionedRef.current) {
      targetEl.scrollIntoView({
        behavior: 'auto',
        block: 'start',
      })
      hasAutoPositionedRef.current = true
    }
  }, [isOpen, selectedDate, months])

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const updateVisibleMonth = () => {
    const container = scrollRef.current
    if (!container) return

    const monthEls = Array.from(container.querySelectorAll('[data-month]'))
    if (!monthEls.length) return

    const containerTop = container.scrollTop
    const containerMiddle = containerTop + container.clientHeight / 2

    let closestEl = null
    let closestDistance = Infinity

    for (const el of monthEls) {
      const elMiddle = el.offsetTop + el.offsetHeight / 2
      const distance = Math.abs(elMiddle - containerMiddle)

      if (distance < closestDistance) {
        closestDistance = distance
        closestEl = el
      }
    }

    if (closestEl) {
      const year = Number(closestEl.getAttribute('data-year'))
      const monthIndex = Number(closestEl.getAttribute('data-month-index'))

      if (!Number.isNaN(year) && !Number.isNaN(monthIndex)) {
        setVisibleMonthYear(formatMonthYear(new Date(year, monthIndex, 1)))
      }
    }
  }

  const handleScroll = () => {
    const container = scrollRef.current
    if (!container) return

    updateVisibleMonth()

    const threshold = 500
    const nearTop = container.scrollTop < threshold
    const nearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < threshold

    if (nearTop) {
      const firstMonth = months[0]
      const newMonths = []

      for (let i = 12; i >= 1; i -= 1) {
        newMonths.push(addMonths(firstMonth, -i))
      }

      const previousScrollHeight = container.scrollHeight
      setMonths((prev) => [...newMonths, ...prev])

      requestAnimationFrame(() => {
        const newScrollHeight = container.scrollHeight
        container.scrollTop += newScrollHeight - previousScrollHeight
        updateVisibleMonth()
      })
    }

    if (nearBottom) {
      const lastMonth = months[months.length - 1]
      const newMonths = []

      for (let i = 1; i <= 12; i += 1) {
        newMonths.push(addMonths(lastMonth, i))
      }

      setMonths((prev) => [...prev, ...newMonths])

      requestAnimationFrame(() => {
        updateVisibleMonth()
      })
    }
  }

  const monthSections = useMemo(() => {
    return months.map((monthDate) => {
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`

      return {
        monthDate,
        monthKey,
        cells: buildMonthGrid(monthDate),
      }
    })
  }, [months])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close calendar"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div
        className="
          absolute inset-x-0 bottom-0 h-[60dvh]
          rounded-t-[2rem] bg-white shadow-2xl
          animate-[slideUp_240ms_ease-out]
          overflow-hidden
        "
      >
        <style>
          {`
            @keyframes slideUp {
              from {
                transform: translateY(100%);
              }
              to {
                transform: translateY(0);
              }
            }
          `}
        </style>

        <div className="flex h-full flex-col">
          <div className="shrink-0 border-b border-slate-100 px-4 pb-4 pt-3">
            <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-slate-200" />

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {visibleMonthYear}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Select a completed workout date
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-y-2">
              {DAY_SHORT_LABELS.map((label) => (
                <div
                  key={label}
                  className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-400"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="
              flex-1 overflow-y-auto px-4 pb-8 pt-4
              [scrollbar-width:none] [-ms-overflow-style:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            <div className="space-y-6">
              {monthSections.map(({ monthDate, monthKey, cells }) => (
                <section
                  key={monthKey}
                  data-month={monthKey}
                  data-year={monthDate.getFullYear()}
                  data-month-index={monthDate.getMonth()}
                >
                  <div className="mb-3 px-1">
                    <h3 className="text-base font-semibold text-slate-800">
                      {formatMonthYear(monthDate)}
                    </h3>
                  </div>

                  <div className="grid grid-cols-7 gap-y-3">
                    {cells.map(({ dateString, date, isCurrentMonth }) => {
                      const isSelected = dateString === selectedDate
                      const hasCompletedWorkout = completedWorkoutDateSet.has(dateString)
                      const isToday = dateString === formatDateString(new Date())

                      return (
                        <button
                          key={`${monthKey}-${dateString}`}
                          type="button"
                          onClick={() => {
                            onSelectDate(dateString)
                            onClose()
                          }}
                          className="flex items-center justify-center"
                        >
                          <div
                            className={`flex h-12 w-12 flex-col items-center justify-center rounded-full transition ${
                              isSelected
                                ? 'bg-[#2F7D57] text-white'
                                : isCurrentMonth
                                  ? 'text-slate-900'
                                  : 'text-slate-300'
                            }`}
                          >
                            <span
                              className={`text-sm font-semibold leading-none ${
                                isToday && !isSelected ? 'text-[#2F7D57]' : ''
                              }`}
                            >
                              {date.getDate()}
                            </span>

                            <span
                              className={`mt-1 h-1.5 w-1.5 rounded-full ${
                                hasCompletedWorkout
                                  ? isSelected
                                    ? 'bg-white'
                                    : 'bg-[#2F7D57]'
                                  : 'bg-transparent'
                              }`}
                            />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GymDiaryPopUpCalendarSection