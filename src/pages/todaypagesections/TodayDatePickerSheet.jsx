import { useEffect, useMemo, useRef, useState } from 'react'

function CloseIcon({ className = 'h-6 w-6' }) {
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
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  )
}

function CheckIcon({ className = 'h-6 w-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const ITEM_HEIGHT = 40
const VISIBLE_SIDE_ITEMS = 2
const DRAG_STEP_PX = 22
const TODAY_ANIMATION_TICK_MS = 48
const DAY_BY_DAY_ANIMATION_LIMIT = 14

const getTodayAtStartOfDay = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

const normalizeDate = (date) => {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

const getDaysInMonth = (year, monthIndex) => {
  return new Date(year, monthIndex + 1, 0).getDate()
}

const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value))
}

const mod = (value, length) => {
  return ((value % length) + length) % length
}

const clampDay = (year, monthIndex, day) => {
  return Math.min(day, getDaysInMonth(year, monthIndex))
}

const buildYearOptions = () => {
  const currentYear = new Date().getFullYear()
  const startYear = currentYear - 80
  const endYear = currentYear + 20

  const years = []
  for (let year = startYear; year <= endYear; year += 1) {
    years.push(year)
  }

  return years
}

const datesMatch = (a, b) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const getDayDifference = (fromDate, toDate) => {
  const oneDayMs = 24 * 60 * 60 * 1000
  const from = normalizeDate(fromDate).getTime()
  const to = normalizeDate(toDate).getTime()
  return Math.round((to - from) / oneDayMs)
}

function WheelPicker({
  items,
  value,
  onChange,
  getLabel,
  loop = false,
  className = '',
}) {
  const pointerStateRef = useRef({
    isDragging: false,
    lastY: 0,
  })

  const selectedIndex = Math.max(
    0,
    items.findIndex((item) => item === value)
  )

  const totalVisibleRows = VISIBLE_SIDE_ITEMS * 2 + 1
  const pickerHeight = totalVisibleRows * ITEM_HEIGHT

  const stepBy = (delta) => {
    if (!items.length) return

    let nextIndex = selectedIndex + delta

    if (loop) {
      nextIndex = mod(nextIndex, items.length)
    } else {
      nextIndex = clamp(nextIndex, 0, items.length - 1)
    }

    const nextValue = items[nextIndex]
    if (nextValue !== undefined && nextValue !== value) {
      onChange(nextValue)
    }
  }

  const handleWheel = (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (Math.abs(event.deltaY) < 4) return
    stepBy(event.deltaY > 0 ? 1 : -1)
  }

  const handlePointerDown = (event) => {
    pointerStateRef.current = {
      isDragging: true,
      lastY: event.clientY,
    }

    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event) => {
    const state = pointerStateRef.current
    if (!state.isDragging) return

    const deltaY = event.clientY - state.lastY

    if (Math.abs(deltaY) >= DRAG_STEP_PX) {
      const steps = Math.trunc(deltaY / DRAG_STEP_PX)
      if (steps !== 0) {
        stepBy(-steps)
        state.lastY = event.clientY
      }
    }
  }

  const handlePointerUp = () => {
    pointerStateRef.current.isDragging = false
  }

  const renderRows = () => {
    const rows = []

    for (
      let offset = -VISIBLE_SIDE_ITEMS;
      offset <= VISIBLE_SIDE_ITEMS;
      offset += 1
    ) {
      let itemIndex = selectedIndex + offset

      if (loop) {
        itemIndex = mod(itemIndex, items.length)
      }

      if (!loop && (itemIndex < 0 || itemIndex >= items.length)) {
        rows.push(
          <div
            key={`empty-${offset}`}
            className="absolute left-0 right-0"
            style={{
              top: '50%',
              height: `${ITEM_HEIGHT}px`,
              transform: `translateY(${offset * ITEM_HEIGHT - ITEM_HEIGHT / 2}px)`,
              opacity: 0,
              pointerEvents: 'none',
            }}
          />
        )
        continue
      }

      const item = items[itemIndex]
      const distance = Math.abs(offset)
      const isSelected = offset === 0

      const rotateX = offset * -22
      const translateY = offset * ITEM_HEIGHT
      const scale = isSelected ? 1 : Math.max(0.82, 1 - distance * 0.07)
      const opacity = isSelected
  ? 1
  : distance === 1
    ? 0.5
    : distance === 2
      ? 0.3
      : 0.18
      const blur = isSelected ? 0 : Math.min(distance * 0.35, 1.1)

      rows.push(
        <button
          key={`${String(item)}-${offset}`}
          type="button"
          onClick={() => onChange(item)}
          className="absolute left-0 right-0 flex items-center justify-center text-center transition-transform duration-150"
          style={{
            top: '50%',
            height: `${ITEM_HEIGHT}px`,
            transform: `translateY(${translateY - ITEM_HEIGHT / 2}px) rotateX(${rotateX}deg) scale(${scale})`,
            transformStyle: 'preserve-3d',
            opacity,
            filter: `blur(${blur}px)`,
            pointerEvents: opacity < 0.1 ? 'none' : 'auto',
          }}
        >
          <span
            className={`whitespace-nowrap px-2 text-xl ${
              isSelected
                ? 'font-semibold text-black'
                : 'font-normal text-slate-400'
            }`}
          >
            {getLabel(item)}
          </span>
        </button>
      )
    }

    return rows
  }

  return (
    <div
      className={`relative select-none touch-none ${className}`}
      style={{
        height: `${pickerHeight}px`,
        perspective: '1000px',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)',
        maskImage:
          'linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)',
      }}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {renderRows()}
    </div>
  )
}

function TodayDatePickerSheet({
  isOpen,
  selectedDate,
  onClose,
  onConfirm,
}) {
  const normalizedSelectedDate = useMemo(
    () => normalizeDate(selectedDate),
    [selectedDate]
  )

  const [draftDate, setDraftDate] = useState(normalizedSelectedDate)
  const [isAnimatingToToday, setIsAnimatingToToday] = useState(false)

  const years = useMemo(() => buildYearOptions(), [])
  const animationTimeoutRef = useRef(null)
  const previousIsOpenRef = useRef(false)

  const selectedYear = draftDate.getFullYear()
  const selectedMonth = draftDate.getMonth()
  const selectedDay = draftDate.getDate()

  const days = useMemo(() => {
    const totalDays = getDaysInMonth(selectedYear, selectedMonth)
    return Array.from({ length: totalDays }, (_, index) => index + 1)
  }, [selectedYear, selectedMonth])

  useEffect(() => {
    if (isOpen && !previousIsOpenRef.current) {
      setDraftDate(normalizedSelectedDate)
      setIsAnimatingToToday(false)
    }

    previousIsOpenRef.current = isOpen
  }, [isOpen, normalizedSelectedDate])

  useEffect(() => {
    if (!isOpen) return undefined

    const { body } = document
    const previousOverflow = body.style.overflow
    const previousTouchAction = body.style.touchAction

    body.style.overflow = 'hidden'
    body.style.touchAction = 'none'

    return () => {
      body.style.overflow = previousOverflow
      body.style.touchAction = previousTouchAction
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  const stopTodayAnimation = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = null
    }
    setIsAnimatingToToday(false)
  }

  const setYear = (year) => {
    stopTodayAnimation()
    const safeDay = clampDay(year, selectedMonth, selectedDay)
    setDraftDate(new Date(year, selectedMonth, safeDay))
  }

  const setMonth = (monthIndex) => {
    stopTodayAnimation()
    const safeDay = clampDay(selectedYear, monthIndex, selectedDay)
    setDraftDate(new Date(selectedYear, monthIndex, safeDay))
  }

  const setDay = (day) => {
    stopTodayAnimation()
    setDraftDate(new Date(selectedYear, selectedMonth, day))
  }

  const handleConfirm = () => {
    const confirmedDate = normalizeDate(draftDate)
    onConfirm(confirmedDate)
    onClose()
  }

  const animateThroughDates = (dateSequence, index = 0) => {
    if (index >= dateSequence.length) {
      stopTodayAnimation()
      return
    }

    setDraftDate(dateSequence[index])

    animationTimeoutRef.current = setTimeout(() => {
      animateThroughDates(dateSequence, index + 1)
    }, TODAY_ANIMATION_TICK_MS)
  }

  const handleTodayPress = () => {
    const today = getTodayAtStartOfDay()

    if (datesMatch(draftDate, today)) {
      return
    }

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = null
    }

    const diffDays = getDayDifference(draftDate, today)

    if (Math.abs(diffDays) <= DAY_BY_DAY_ANIMATION_LIMIT) {
      const direction = diffDays > 0 ? 1 : -1
      const steps = Math.abs(diffDays)

      const sequence = Array.from({ length: steps }, (_, index) => {
        const nextDate = new Date(draftDate)
        nextDate.setDate(draftDate.getDate() + direction * (index + 1))
        nextDate.setHours(0, 0, 0, 0)
        return nextDate
      })

      setIsAnimatingToToday(true)
      animateThroughDates(sequence)
      return
    }

    const sequence = []
    const current = new Date(draftDate)

    while (current.getFullYear() !== today.getFullYear()) {
      const direction = current.getFullYear() < today.getFullYear() ? 1 : -1
      const nextYear = current.getFullYear() + direction
      const safeDay = clampDay(nextYear, current.getMonth(), current.getDate())
      current.setFullYear(nextYear, current.getMonth(), safeDay)
      current.setHours(0, 0, 0, 0)
      sequence.push(new Date(current))
    }

    while (current.getMonth() !== today.getMonth()) {
      const direction = current.getMonth() < today.getMonth() ? 1 : -1
      const tentativeMonth = current.getMonth() + direction
      const tempDate = new Date(
        current.getFullYear(),
        tentativeMonth,
        current.getDate()
      )
      const safeDay = clampDay(
        tempDate.getFullYear(),
        tempDate.getMonth(),
        current.getDate()
      )
      current.setFullYear(tempDate.getFullYear(), tempDate.getMonth(), safeDay)
      current.setHours(0, 0, 0, 0)
      sequence.push(new Date(current))
    }

    while (current.getDate() !== today.getDate()) {
      const direction = current.getDate() < today.getDate() ? 1 : -1
      current.setDate(current.getDate() + direction)
      current.setHours(0, 0, 0, 0)
      sequence.push(new Date(current))
    }

    if (!sequence.length || !datesMatch(sequence[sequence.length - 1], today)) {
      sequence.push(today)
    }

    setIsAnimatingToToday(true)
    animateThroughDates(sequence)
  }

  const handleOverlayWheel = (event) => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <>
      <div
        onClick={onClose}
        onWheel={handleOverlayWheel}
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-200 ${
          isOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
      />

      <div
        onWheel={handleOverlayWheel}
        className={`fixed right-0 bottom-0 left-0 z-50 rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: '34vh', minHeight: '320px', maxHeight: '390px' }}
        role="dialog"
        aria-modal="true"
        aria-label="Change date"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center text-slate-700"
            aria-label="Close date picker"
          >
            <CloseIcon />
          </button>

          <h3 className="text-base font-semibold text-black">Change Date</h3>

          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex h-8 w-8 items-center justify-center text-slate-700"
            aria-label="Confirm date"
          >
            <CheckIcon />
          </button>
        </div>

        <div className="flex justify-center px-4 pt-2">
          <button
            type="button"
            onClick={handleTodayPress}
            disabled={isAnimatingToToday}
            className="text-sm font-medium text-blue-600 transition disabled:opacity-60"
          >
            Today
          </button>
        </div>

    <div className="h-[calc(100%-94px)] px-3 pb-4 pt-1">
  <div className="relative flex h-full items-center">
    <div
      className="pointer-events-none absolute inset-x-0 z-10 rounded-xl bg-slate-100/90"
      style={{
        height: `${ITEM_HEIGHT}px`,
        top: '50%',
        transform: `translateY(-50%)`,
      }}
    />

    <div className="relative z-20 flex w-full items-center">
      <WheelPicker
        items={days}
        value={selectedDay}
        onChange={setDay}
        getLabel={(value) => String(value)}
        loop={true}
        className="flex-1"
      />

      <WheelPicker
        items={MONTH_NAMES.map((_, index) => index)}
        value={selectedMonth}
        onChange={setMonth}
        getLabel={(value) => MONTH_NAMES[value]}
        loop={true}
        className="flex-[1.35]"
      />

      <WheelPicker
        items={years}
        value={selectedYear}
        onChange={setYear}
        getLabel={(value) => String(value)}
        loop={false}
        className="flex-1"
      />
    </div>
  </div>
</div>
      </div>
    </>
  )
}

export default TodayDatePickerSheet