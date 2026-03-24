import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../routes/routePaths'

const MEAL_SECTIONS = [
  { key: 'breakfast', title: 'Breakfast' },
  { key: 'lunch', title: 'Lunch' },
  { key: 'dinner', title: 'Dinner' },
  { key: 'snack', title: 'Snacks' },
]

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

function MealSection({ title, items, onAddFood }) {
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
            <div key={item.id ?? `${item.nameSnapshot}-${index}`}>
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

              {index < items.length - 1 ? (
                <div className="border-t border-slate-100" />
              ) : null}
            </div>
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

function FoodLogging({ dailySummary, selectedDate }) {
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
              onAddFood={() => handleAddFood(section.key)}
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