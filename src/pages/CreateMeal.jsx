import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { createMeal } from '../api/mealApi'
import { ROUTES } from '../routes/routePaths'

function BackIcon({ className = 'h-6 w-6' }) {
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
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

const formatNumber = (value) => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0
  return Math.round(safeValue)
}

const formatMacroNumber = (value) => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0
  return Math.round(safeValue * 10) / 10
}

const buildDonutSegments = (protein, carbs, fat) => {
  const total = protein + carbs + fat

  if (total <= 0) {
    return []
  }

  const segments = [
    { key: 'carbs', value: carbs, color: '#3b82f6' },
    { key: 'fat', value: fat, color: '#8b5cf6' },
    { key: 'protein', value: protein, color: '#f97316' },
  ]

  let accumulated = 0

  return segments.map((segment) => {
    const percentage = segment.value / total
    const startAngle = accumulated * 360
    const endAngle = (accumulated + percentage) * 360
    accumulated += percentage

    return {
      ...segment,
      percentage,
      startAngle,
      endAngle,
    }
  })
}

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

const describeArc = (x, y, radius, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(' ')
}

function MacroDonut({ calories, protein, carbs, fat }) {
  const segments = buildDonutSegments(protein, carbs, fat)

  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <circle
          cx="60"
          cy="60"
          r="42"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
        />

        {segments.map((segment) => (
          <path
            key={segment.key}
            d={describeArc(60, 60, 42, segment.startAngle, segment.endAngle)}
            fill="none"
            stroke={segment.color}
            strokeWidth="8"
            strokeLinecap="round"
          />
        ))}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-black">{formatNumber(calories)}</div>
        <div className="text-xs font-medium text-slate-500">cal</div>
      </div>
    </div>
  )
}

function MacroStat({ label, grams, percentage, colorClassName }) {
  return (
    <div className="text-center">
      <div className={`text-[11px] font-semibold ${colorClassName}`}>
        {percentage}%
      </div>
      <div className="mt-1 text-lg font-semibold text-black">{grams}g</div>
      <div className="mt-1 text-xs font-medium text-slate-500">{label}</div>
    </div>
  )
}

function CreateMeal() {
  const navigate = useNavigate()
  const location = useLocation()

  const [mealName, setMealName] = useState(location.state?.draftMeal?.name || '')
  const [mealItems, setMealItems] = useState(location.state?.draftMeal?.items || [])
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const draftMeal = location.state?.draftMeal

    if (draftMeal) {
      setMealName(draftMeal.name || '')
      setMealItems(Array.isArray(draftMeal.items) ? draftMeal.items : [])
    }
  }, [location.state])

  const totals = useMemo(() => {
    return mealItems.reduce(
      (accumulator, item) => {
        accumulator.calories += Number(item.calories) || 0
        accumulator.protein += Number(item.protein) || 0
        accumulator.carbs += Number(item.carbs) || 0
        accumulator.fat += Number(item.fat) || 0
        return accumulator
      },
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      }
    )
  }, [mealItems])

  const macroTotal = totals.carbs + totals.fat + totals.protein

  const carbPercentage =
    macroTotal > 0 ? Math.round((totals.carbs / macroTotal) * 100) : 0
  const fatPercentage =
    macroTotal > 0 ? Math.round((totals.fat / macroTotal) * 100) : 0
  const proteinPercentage =
    macroTotal > 0 ? Math.round((totals.protein / macroTotal) * 100) : 0

  const isSaveDisabled = !mealName.trim() || mealItems.length === 0 || isSaving

  const handleAddFood = () => {
    navigate(ROUTES.FOOD_ADD_VIEW, {
      state: {
        origin: 'create-meal',
        selectedMealSlot: null,
        draftMeal: {
          name: mealName,
          items: mealItems,
        },
      },
    })
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setErrorMessage('')

      await createMeal({
        name: mealName.trim(),
        description: '',
        isFavorite: false,
        items: mealItems.map((item) => ({
          foodId: item.foodId,
          quantity: item.quantity,
        })),
      })

      navigate(-1)
    } catch {
      setErrorMessage('Unable to create meal.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-3xl px-4 pb-8 pt-4">
        <div className="flex items-center justify-between pb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
            aria-label="Go back"
          >
            <BackIcon />
          </button>

          <h1 className="text-lg font-semibold text-black">Create a Meal</h1>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-green-600 shadow-sm ring-1 ring-slate-200 disabled:text-slate-300"
          >
            Save
          </button>
        </div>

        {errorMessage ? (
          <div className="mb-4 rounded-2xl bg-white px-4 py-3 text-sm text-red-500 shadow-sm ring-1 ring-slate-200/70">
            {errorMessage}
          </div>
        ) : null}

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <label className="block">
            <div className="mb-2 text-sm font-medium text-slate-700">
              Name Your Meal
            </div>
            <input
              type="text"
              value={mealName}
              onChange={(event) => setMealName(event.target.value)}
              placeholder="Chicken Rice Bowl"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-slate-400 focus:border-slate-300"
            />
          </label>

          <div className="mt-6 flex items-center justify-between gap-4">
            <MacroDonut
              calories={totals.calories}
              protein={totals.protein}
              carbs={totals.carbs}
              fat={totals.fat}
            />

            <div className="grid flex-1 grid-cols-3 gap-3">
              <MacroStat
                label="Carbs"
                grams={formatMacroNumber(totals.carbs)}
                percentage={carbPercentage}
                colorClassName="text-blue-500"
              />
              <MacroStat
                label="Fat"
                grams={formatMacroNumber(totals.fat)}
                percentage={fatPercentage}
                colorClassName="text-purple-500"
              />
              <MacroStat
                label="Protein"
                grams={formatMacroNumber(totals.protein)}
                percentage={proteinPercentage}
                colorClassName="text-orange-500"
              />
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-black">Meal Items</h2>

            <button
              type="button"
              onClick={handleAddFood}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-green-600 ring-1 ring-green-200"
            >
              Add Food
            </button>
          </div>

          {mealItems.length === 0 ? (
            <div className="pt-4 text-sm text-slate-500">
              No food items added yet.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {mealItems.map((item, index) => (
                <div
                  key={`${item.foodId}-${index}`}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-black">
                      {item.name}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {item.servingDescription || 'No serving description'}
                    </div>
                  </div>

                  <div className="shrink-0 text-sm font-medium text-slate-600">
                    {formatNumber(item.calories)} cal
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default CreateMeal