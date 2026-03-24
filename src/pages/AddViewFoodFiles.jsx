import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getFoods } from '../api/foodApi'
import { getMeals, getMealById } from '../api/mealApi'
import { createFoodLog } from '../api/foodLogApi'
import { ROUTES } from '../routes/routePaths'
import FoodSelectionHeaderSection from './addviewfoodfilessections/FoodSelectionHeaderSection'
import FoodSearchSection from './addviewfoodfilessections/FoodSearchSection'
import FoodFilterTabsSection from './addviewfoodfilessections/FoodFilterTabsSection'
import FoodCreateActionsSection from './addviewfoodfilessections/FoodCreateActionsSection'
import FoodResultsSection from './addviewfoodfilessections/FoodResultsSection'

const DEFAULT_MEAL_SLOT = 'breakfast'

const formatLogDate = (dateValue) => {
  const date = new Date(dateValue)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function AddViewFoodFiles() {
  const navigate = useNavigate()
  const location = useLocation()

  const origin = location.state?.origin || 'food-page'

  const [selectedMealSlot, setSelectedMealSlot] = useState(
    location.state?.mealSlot || DEFAULT_MEAL_SLOT
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('all')
  const [foods, setFoods] = useState([])
  const [meals, setMeals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedDate = location.state?.selectedDate || null
  const draftMeal = location.state?.draftMeal || { name: '', items: [] }

  useEffect(() => {
    let isMounted = true

    const loadFoodLibraryData = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const [foodsResponse, mealsResponse] = await Promise.all([
          getFoods(),
          getMeals(),
        ])

        if (!isMounted) return

        setFoods(Array.isArray(foodsResponse) ? foodsResponse : [])
        setMeals(Array.isArray(mealsResponse) ? mealsResponse : [])
      } catch {
        if (!isMounted) return
        setErrorMessage('Unable to load foods and meals.')
        setFoods([])
        setMeals([])
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadFoodLibraryData()

    return () => {
      isMounted = false
    }
  }, [])

  const showTemporaryBanner = (message) => {
    setFeedbackMessage(message)
    window.setTimeout(() => {
      setFeedbackMessage('')
    }, 1200)
  }

  const handleAddFoodToMealDraft = (food) => {
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
        state: {
          draftMeal: nextDraftMeal,
        },
      })
    }, 700)
  }

  const handleLogSingleFood = async (food) => {
    if (!selectedDate || !selectedMealSlot) {
      showTemporaryBanner('Missing date or meal slot')
      return
    }

    try {
      setIsSubmitting(true)

      await createFoodLog({
        logDate: formatLogDate(selectedDate),
        loggedAt: new Date().toISOString(),
        sourceType: 'food',
        foodId: food.id,
        mealId: null,
        customName: null,
        calories: null,
        protein: null,
        carbs: null,
        fat: null,
        quantity: 1,
        mealSlot: selectedMealSlot,
        note: '',
      })

      showTemporaryBanner('Food Logged!')
    } catch {
      showTemporaryBanner('Unable to log food')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogMealAsIndividualFoods = async (meal) => {
    if (!selectedDate || !selectedMealSlot) {
      showTemporaryBanner('Missing date or meal slot')
      return
    }

    try {
      setIsSubmitting(true)

      const mealDetails = await getMealById(meal.id)
      const mealItems = Array.isArray(mealDetails?.items) ? mealDetails.items : []

      if (!mealItems.length) {
        showTemporaryBanner('Meal has no items')
        return
      }

      await Promise.all(
        mealItems.map((item) =>
          createFoodLog({
            logDate: formatLogDate(selectedDate),
            loggedAt: new Date().toISOString(),
            sourceType: 'food',
            foodId: item.foodId,
            mealId: null,
            customName: null,
            calories: null,
            protein: null,
            carbs: null,
            fat: null,
            quantity: Number(item.quantity) || 1,
            mealSlot: selectedMealSlot,
            note: '',
          })
        )
      )

      showTemporaryBanner('Food Logged!')
    } catch {
      showTemporaryBanner('Unable to log meal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddFood = async (food) => {
    if (origin === 'create-meal') {
      handleAddFoodToMealDraft(food)
      return
    }

    await handleLogSingleFood(food)
  }

  const handleAddMeal = async (meal) => {
    if (origin === 'create-meal') {
      showTemporaryBanner('Meals cannot be added here')
      return
    }

    await handleLogMealAsIndividualFoods(meal)
  }

  const pageState = useMemo(
    () => ({
      origin,
      selectedMealSlot,
      selectedDate,
      searchTerm,
      selectedTab,
      foods,
      meals,
      isLoading,
      errorMessage,
      isSubmitting,
      onAddFood: handleAddFood,
      onAddMeal: handleAddMeal,
    }),
    [
      origin,
      selectedMealSlot,
      selectedDate,
      searchTerm,
      selectedTab,
      foods,
      meals,
      isLoading,
      errorMessage,
      isSubmitting,
    ]
  )

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-4xl px-4 pb-6 pt-4">
        <FoodSelectionHeaderSection
          selectedMealSlot={selectedMealSlot}
          onChangeMealSlot={setSelectedMealSlot}
          onBack={() => navigate(-1)}
        />

        <FoodSearchSection
          searchTerm={searchTerm}
          onChangeSearchTerm={setSearchTerm}
        />

        <FoodFilterTabsSection
          selectedTab={selectedTab}
          onChangeTab={setSelectedTab}
        />

        <FoodCreateActionsSection />

        <FoodResultsSection pageState={pageState} />
      </div>

      {feedbackMessage ? (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white shadow-lg">
          {feedbackMessage}
        </div>
      ) : null}
    </div>
  )
}

export default AddViewFoodFiles