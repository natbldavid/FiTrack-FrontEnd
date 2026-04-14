import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getViewFoodRoute, ROUTES } from '../../routes/routePaths'

const MEAL_SECTIONS = [
  { key: 'breakfast', title: 'Breakfast' },
  { key: 'lunch', title: 'Lunch' },
  { key: 'dinner', title: 'Dinner' },
  { key: 'snack', title: 'Snacks' },
]

const DELETE_THRESHOLD = 90
const DRAG_START_THRESHOLD = 8
const TAP_THRESHOLD = 8

const formatCalories = (value) => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0
  return Math.round(safeValue)
}

const normalizeMealSlot = (mealSlot) => {
  return String(mealSlot || '')
    .trim()
    .toLowerCase()
}

const groupItemsByMealSlot = (items) => {
  return items.reduce(
    (groups, item) => {
      const mealSlot = normalizeMealSlot(item.mealSlot)

      if (groups[mealSlot]) {
        groups[mealSlot].push(item)
      }

      return groups
    },
    {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    }
  )
}

const getLoggedFoodId = (item) => {
  if (!item || typeof item !== 'object') {
    return null
  }

  return item.foodId ?? item.sourceFoodId ?? item.loggedFoodId ?? item.food?.id ?? null
}

function SwipeableFoodItem({
  item,
  isLastItem,
  selectedDate,
  onDeleteFoodLog,
  onRowSwipeStart,
  onRowSwipeEnd,
}) {
  const navigate = useNavigate()

  const rowRef = useRef(null)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const dragModeRef = useRef(null)
  const isTouchingRef = useRef(false)
  const shouldSuppressClickRef = useRef(false)

  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const foodId = getLoggedFoodId(item)
  const isFoodRow = foodId !== null && foodId !== undefined

  const resetSwipe = () => {
    setTranslateX(0)
    setIsDragging(false)
    setIsDeleting(false)
    isTouchingRef.current = false
    dragModeRef.current = null
    onRowSwipeEnd?.()
  }

  const openLoggedFood = () => {
    if (!isFoodRow || isDeleting) {
      return
    }

    navigate(getViewFoodRoute(foodId), {
      state: {
        viewMode: 'view',
        mealSlot: item.mealSlot,
        selectedDate: selectedDate?.toISOString?.() ?? null,
      },
    })
  }

  const handleTouchStart = (event) => {
    if (isDeleting) {
      return
    }

    const touch = event.touches[0]
    startXRef.current = touch.clientX
    startYRef.current = touch.clientY
    dragModeRef.current = null
    isTouchingRef.current = true
    shouldSuppressClickRef.current = false
    setIsDragging(true)
  }

  const handleTouchMove = (event) => {
    if (!isTouchingRef.current || isDeleting) {
      return
    }

    const touch = event.touches[0]
    const deltaX = touch.clientX - startXRef.current
    const deltaY = touch.clientY - startYRef.current

    if (dragModeRef.current === null) {
      if (
        Math.abs(deltaX) < DRAG_START_THRESHOLD &&
        Math.abs(deltaY) < DRAG_START_THRESHOLD
      ) {
        return
      }

      dragModeRef.current =
        Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical'

      shouldSuppressClickRef.current = true

      if (dragModeRef.current === 'horizontal') {
        onRowSwipeStart?.()
      }
    }

    if (dragModeRef.current !== 'horizontal') {
      return
    }

    event.preventDefault()

    if (deltaX >= 0) {
      setTranslateX(0)
      return
    }

    const rowWidth = rowRef.current?.offsetWidth ?? 0
    const maxLeftSwipe = rowWidth > 0 ? rowWidth : 320
    const nextTranslate = Math.max(deltaX, -maxLeftSwipe)

    setTranslateX(nextTranslate)
  }

  const handleTouchEnd = async () => {
    if (!isTouchingRef.current || isDeleting) {
      return
    }

    isTouchingRef.current = false

    const deltaX = translateX
    const rowWidth = rowRef.current?.offsetWidth ?? 0
    const hasPassedDeleteThreshold = Math.abs(translateX) >= DELETE_THRESHOLD
    const wasTap =
      dragModeRef.current === null && Math.abs(deltaX) < TAP_THRESHOLD

    if (dragModeRef.current === 'horizontal' && hasPassedDeleteThreshold) {
      try {
        setIsDeleting(true)
        setIsDragging(false)

        setTranslateX(-(rowWidth || 500))

        await onDeleteFoodLog(item.id)
      } catch (error) {
        console.error('Failed to delete food log:', error)
        setTranslateX(0)
        setIsDeleting(false)
        setIsDragging(false)
        dragModeRef.current = null
        onRowSwipeEnd?.()
      }

      return
    }

    setTranslateX(0)
    setIsDragging(false)

    if (dragModeRef.current === 'horizontal') {
      onRowSwipeEnd?.()
    }

    dragModeRef.current = null

    if (wasTap && isFoodRow) {
      shouldSuppressClickRef.current = true
      openLoggedFood()
    }
  }

  const handleTouchCancel = () => {
    resetSwipe()
  }

  const handleClick = () => {
    if (shouldSuppressClickRef.current) {
      shouldSuppressClickRef.current = false
      return
    }

    openLoggedFood()
  }

  const swipeDistance = Math.abs(translateX)
  const cancelOpacity = Math.min(swipeDistance / DELETE_THRESHOLD, 1)

  return (
    <div ref={rowRef}>
      <div className="relative overflow-hidden select-none">
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-center bg-red-100 px-4"
          style={{
            width: `${Math.max(swipeDistance, 0)}px`,
            opacity: cancelOpacity,
          }}
        >
          <span className="text-sm font-semibold tracking-wide text-red-500">
            CANCEL
          </span>
        </div>

        <div
          role={isFoodRow ? 'button' : undefined}
          tabIndex={isFoodRow ? 0 : undefined}
          className={`relative bg-white ${isFoodRow ? 'cursor-pointer' : ''}`}
          style={{
            transform: `translateX(${translateX}px)`,
            transition: isDragging ? 'none' : 'transform 220ms ease',
            touchAction: 'pan-y',
          }}
          onClick={handleClick}
          onKeyDown={(event) => {
            if (!isFoodRow) return

            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              openLoggedFood()
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
        >
          <div className="flex items-start justify-between gap-4 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-normal text-black">
                {item.nameSnapshot}
              </div>

              {item.servingDescriptionSnapshot ? (
                <div className="mt-0.5 text-xs text-slate-400">
                  {item.servingDescriptionSnapshot}
                </div>
              ) : null}
            </div>

            <div className="shrink-0 text-sm font-medium text-slate-600">
              {formatCalories(item.calories)}
            </div>
          </div>
        </div>
      </div>

      {!isLastItem ? <div className="border-t border-slate-100" /> : null}
    </div>
  )
}

function MealSection({
  title,
  items,
  selectedDate,
  onAddFood,
  onDeleteFoodLog,
  onRowSwipeStart,
  onRowSwipeEnd,
}) {
  const mealCalories = items.reduce(
    (total, item) => total + formatCalories(item.calories),
    0
  )

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-black">{title}</h3>
        {items.length > 0 ? (
          <span className="text-sm font-semibold text-slate-500">
            {mealCalories}
          </span>
        ) : null}
      </div>

      <div className="mt-3 border-t border-slate-200" />

      {items.length === 0 ? (
        <div className="pt-3">
          <button
            type="button"
            onClick={onAddFood}
            className="text-sm font-semibold tracking-wide text-green-600"
          >
            ADD FOOD
          </button>
        </div>
      ) : (
        <div className="pt-2">
          {items.map((item, index) => (
            <SwipeableFoodItem
              key={item.id ?? `${item.nameSnapshot}-${index}`}
              item={item}
              isLastItem={index === items.length - 1}
              selectedDate={selectedDate}
              onDeleteFoodLog={onDeleteFoodLog}
              onRowSwipeStart={onRowSwipeStart}
              onRowSwipeEnd={onRowSwipeEnd}
            />
          ))}

          <div className="pt-2">
            <button
              type="button"
              onClick={onAddFood}
              className="text-sm font-semibold tracking-wide text-green-600"
            >
              ADD FOOD
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function FoodLogging({
  dailySummary,
  selectedDate,
  onDeleteFoodLog,
  onRowSwipeStart,
  onRowSwipeEnd,
}) {
  const navigate = useNavigate()
  const items = Array.isArray(dailySummary?.items) ? dailySummary.items : []
  const groupedItems = groupItemsByMealSlot(items)

  const handleAddFood = (mealSlot) => {
    navigate(ROUTES.FOOD_ADD_VIEW, {
      state: {
        mealSlot,
        selectedDate: selectedDate?.toISOString?.() ?? null,
      },
    })
  }

  return (
    <section className="px-4 pt-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
        {MEAL_SECTIONS.map((section, index) => (
          <div key={section.key}>
            <MealSection
              title={section.title}
              items={groupedItems[section.key]}
              selectedDate={selectedDate}
              onAddFood={() => handleAddFood(section.key)}
              onDeleteFoodLog={onDeleteFoodLog}
              onRowSwipeStart={onRowSwipeStart}
              onRowSwipeEnd={onRowSwipeEnd}
            />

            {index < MEAL_SECTIONS.length - 1 ? (
              <div className="my-5 h-px bg-slate-300" />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}

export default FoodLogging