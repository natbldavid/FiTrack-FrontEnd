import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getFoods } from '../api/foodApi'
import { ROUTES } from '../routes/routePaths'
import FoodSearchSection from './addviewfoodfilessections/FoodSearchSection'

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

function PlusCircleButton({ onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-green-600 disabled:opacity-50"
      aria-label="Add food item"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    </button>
  )
}

const formatCalories = (value) => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0
  return Math.round(safeValue)
}

const normalizeSearchValue = (value) => String(value || '').trim().toLowerCase()

const includesSearchTerm = (value, searchTerm) => {
  if (!searchTerm) return true
  return normalizeSearchValue(value).includes(normalizeSearchValue(searchTerm))
}

const filterFoodsBySearch = (foods, searchTerm) => {
  return foods.filter((food) => {
    return (
      includesSearchTerm(food.name, searchTerm) ||
      includesSearchTerm(food.servingDescription, searchTerm)
    )
  })
}

function FoodResultCard({ food, onAdd, disabled = false }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200/70">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-black">
            {food.name}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {formatCalories(food.calories)} cal
            {food.servingDescription ? ` · ${food.servingDescription}` : ''}
          </div>
        </div>

        <PlusCircleButton
          onClick={() => onAdd(food)}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

function AddFoodItemsToMeal() {
  const navigate = useNavigate()
  const location = useLocation()

  const [searchTerm, setSearchTerm] = useState('')
  const [foods, setFoods] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const draftMeal = location.state?.draftMeal || { name: '', items: [] }

  useEffect(() => {
    let isMounted = true

    const loadFoods = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const foodsResponse = await getFoods()

        if (!isMounted) return

        setFoods(Array.isArray(foodsResponse) ? foodsResponse : [])
      } catch {
        if (!isMounted) return
        setFoods([])
        setErrorMessage('Unable to load foods.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadFoods()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredFoods = useMemo(() => {
    return filterFoodsBySearch(foods, searchTerm)
  }, [foods, searchTerm])

  const handleAddFoodToMealDraft = async (food) => {
    try {
      setIsSubmitting(true)
      setFeedbackMessage('')

      const nextDraftMeal = {
        name: draftMeal.name || '',
        items: [
          ...(Array.isArray(draftMeal.items) ? draftMeal.items : []),
          {
            foodId: food.id,
            name: food.name,
            servingDescription: food.servingDescription,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            quantity: 1,
          },
        ],
      }

      setFeedbackMessage('Item Added')

      window.setTimeout(() => {
  navigate(ROUTES.CREATE_MEAL, {
    replace: true,
    state: {
      draftMeal: nextDraftMeal,
      returnedFromFoodItemPicker: true,
    },
  })
}, 700)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-4xl px-4 pb-6 pt-4">
        <section className="pb-4">
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="absolute left-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
              aria-label="Go back"
            >
              <BackIcon />
            </button>

            <h1 className="text-lg font-semibold text-black">
              Select Food Item
            </h1>
          </div>
        </section>

        <FoodSearchSection
          searchTerm={searchTerm}
          onChangeSearchTerm={setSearchTerm}
        />

        {isLoading ? (
          <div className="rounded-2xl bg-white px-4 py-4 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200/70">
            Loading...
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl bg-white px-4 py-4 text-sm text-red-500 shadow-sm ring-1 ring-slate-200/70">
            {errorMessage}
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="rounded-2xl bg-white px-4 py-4 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200/70">
            No foods found.
          </div>
        ) : (
          <section>
            <div className="space-y-3">
              {filteredFoods.map((food) => (
                <FoodResultCard
                  key={food.id}
                  food={food}
                  onAdd={handleAddFoodToMealDraft}
                  disabled={isSubmitting}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {feedbackMessage ? (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white shadow-lg">
          {feedbackMessage}
        </div>
      ) : null}
    </div>
  )
}

export default AddFoodItemsToMeal