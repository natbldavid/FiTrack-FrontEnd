import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { uploadImageToCloudinary } from '../api/cloudinaryApi'
import { createFoodLog } from '../api/foodLogApi'
import { getFoodById, updateFood } from '../api/foodApi'

const PLACEHOLDER_IMAGE = '/food-and-meal-image-placeholder.png'

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

function CameraIcon({ className = 'h-6 w-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7h3l2-2h6l2 2h3v12H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  )
}

function AddPhotoSheet({ onClose, onTakePhoto, onChoosePhoto }) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-x-4 bottom-4 z-50 rounded-3xl bg-white p-4 shadow-2xl">
        <div className="mb-3 text-center text-sm font-semibold text-slate-700">
          Add Photo
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={onTakePhoto}
            className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-black"
          >
            Open Camera
          </button>

          <button
            type="button"
            onClick={onChoosePhoto}
            className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-black"
          >
            Choose From Files
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
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
        <div className="text-2xl font-bold text-black">
          {formatNumber(calories)}
        </div>
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const formatLogDate = (value) => {
  if (!value) return null

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const hasValidImage = (imageUrl) => {
  const normalizedValue = String(imageUrl ?? '').trim().toLowerCase()

  return Boolean(
    normalizedValue &&
      normalizedValue !== 'null' &&
      normalizedValue !== 'undefined'
  )
}

function ViewFoodPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { foodId } = useParams()

  const cameraInputRef = useRef(null)
  const fileInputRef = useRef(null)

  const viewMode = location.state?.viewMode || 'log'
  const isViewOnly = viewMode === 'view'

  const selectedMealSlot =
    location.state?.mealSlot ?? location.state?.selectedMealSlot ?? null

  const selectedDate = location.state?.selectedDate ?? null

  const [food, setFood] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLogging, setIsLogging] = useState(false)
  const [isUpdatingImage, setIsUpdatingImage] = useState(false)
  const [showPhotoSheet, setShowPhotoSheet] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [logErrorMessage, setLogErrorMessage] = useState('')
  const [photoErrorMessage, setPhotoErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadFood = async () => {
      if (!foodId) {
        setErrorMessage('Food not found.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setErrorMessage('')

        const response = await getFoodById(foodId)

        if (!isMounted) return

        setFood(response)
      } catch {
        if (!isMounted) return
        setFood(null)
        setErrorMessage('Unable to load food.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadFood()

    return () => {
      isMounted = false
    }
  }, [foodId])

  const totals = useMemo(() => {
    return {
      calories: Number(food?.calories) || 0,
      protein: Number(food?.protein) || 0,
      carbs: Number(food?.carbs) || 0,
      fat: Number(food?.fat) || 0,
    }
  }, [food])

  const macroTotal = totals.protein + totals.carbs + totals.fat

  const carbPercentage =
    macroTotal > 0 ? Math.round((totals.carbs / macroTotal) * 100) : 0
  const fatPercentage =
    macroTotal > 0 ? Math.round((totals.fat / macroTotal) * 100) : 0
  const proteinPercentage =
    macroTotal > 0 ? Math.round((totals.protein / macroTotal) * 100) : 0

  const foodHasRealImage = hasValidImage(food?.imageUrl)
  const foodImageSrc = foodHasRealImage ? food.imageUrl : PLACEHOLDER_IMAGE
  const formattedLogDate = formatLogDate(selectedDate)
  const isUsingPlaceholderImage = !foodHasRealImage

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleLogFood = async () => {
    try {
      setIsLogging(true)
      setLogErrorMessage('')
      setSuccessMessage('')

      if (!food?.id) {
        setLogErrorMessage('Food not found.')
        return
      }

      if (!selectedMealSlot || !formattedLogDate) {
        setLogErrorMessage(
          'Missing meal slot or selected date. Please go back and try again.'
        )
        return
      }

      await createFoodLog({
        logDate: formattedLogDate,
        loggedAt: new Date().toISOString(),
        sourceType: 'food',
        foodId: Number(food.id),
        mealId: 0,
        customName: food.name || '',
        calories: Number(food.calories) || 0,
        protein: Number(food.protein) || 0,
        carbs: Number(food.carbs) || 0,
        fat: Number(food.fat) || 0,
        quantity: 1,
        mealSlot: selectedMealSlot,
        note: '',
      })

      setSuccessMessage('Food Logged')
      await sleep(700)
      navigate(-2)
    } catch (error) {
      console.error('Failed to log food:', error)
      setLogErrorMessage('Unable to log food.')
    } finally {
      setIsLogging(false)
    }
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]

    if (!file || !food) {
      event.target.value = ''
      return
    }

    try {
      setIsUpdatingImage(true)
      setPhotoErrorMessage('')
      setSuccessMessage('')
      setShowPhotoSheet(false)

      const uploadResult = await uploadImageToCloudinary(file, 'fitrack/foods')
      const nextImageUrl = uploadResult.secureUrl

      const payload = {
        name: food.name || '',
        servingDescription: food.servingDescription || '',
        imageUrl: nextImageUrl,
        calories: Number(food.calories) || 0,
        protein: Number(food.protein) || 0,
        carbs: Number(food.carbs) || 0,
        fat: Number(food.fat) || 0,
        isFavorite: Boolean(food.isFavorite),
      }

      const updatedFood = await updateFood(food.id, payload)

      setFood((currentFood) => ({
        ...currentFood,
        ...updatedFood,
        imageUrl: updatedFood?.imageUrl || nextImageUrl,
      }))

      setSuccessMessage('Photo updated')
      await sleep(1200)
      setSuccessMessage('')
    } catch (error) {
      console.error('Failed to update food image:', error)
      setPhotoErrorMessage('Unable to update photo.')
    } finally {
      setIsUpdatingImage(false)
      event.target.value = ''
    }
  }

  const isLogDisabled =
    isLogging || !food || !selectedMealSlot || !formattedLogDate

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 pt-6 text-sm text-slate-500">
        Loading...
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 pt-6">
        <div className="text-sm text-red-500">{errorMessage}</div>

        <button
          type="button"
          onClick={handleGoBack}
          className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-28">
      {successMessage ? (
        <div className="fixed inset-x-4 top-4 z-50 rounded-2xl bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg">
          {successMessage}
        </div>
      ) : null}

      <section className="relative h-[30vh] min-h-[220px] w-full overflow-hidden bg-slate-200">
        <img
          src={foodImageSrc}
          alt={food?.name || 'Food'}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.src = PLACEHOLDER_IMAGE
          }}
        />

        {isUsingPlaceholderImage ? (
          <>
            <div className="absolute inset-0 z-10 bg-black/35" />

            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setShowPhotoSheet(true)}
                disabled={isUpdatingImage}
                className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg disabled:opacity-60"
                aria-label="Add food photo"
              >
                <CameraIcon className="h-7 w-7" />
              </button>
            </div>
          </>
        ) : null}
      </section>

      <section className="px-4 pt-4">
        <div className="relative flex min-h-10 items-center justify-center">
          <button
            type="button"
            onClick={handleGoBack}
            className="absolute left-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
            aria-label="Go back"
          >
            <BackIcon />
          </button>

          <h1 className="max-w-[70%] text-center text-xl font-bold text-black">
            {food?.name || 'Food'}
          </h1>
        </div>
      </section>

      {photoErrorMessage ? (
        <div className="px-4 pt-4 text-sm text-red-500">{photoErrorMessage}</div>
      ) : null}

      <section className="px-4 pt-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <div className="flex items-center justify-between gap-4">
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

          <div className="mt-5 border-t border-slate-200 pt-4">
            <div className="text-sm font-medium text-slate-700">
              Serving
            </div>
            <div className="mt-1 text-sm text-slate-500">
              {food?.servingDescription || 'No serving description'}
            </div>
          </div>
        </div>
      </section>

      {logErrorMessage ? (
        <div className="px-4 pt-4 text-sm text-red-500">{logErrorMessage}</div>
      ) : null}

      {!isViewOnly ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 pb-5 pt-3 backdrop-blur">
          <div className="mx-auto w-full max-w-3xl">
            <button
              type="button"
              onClick={handleLogFood}
              disabled={isLogDisabled}
              className="w-full rounded-2xl bg-green-600 px-4 py-4 text-base font-semibold text-white disabled:bg-slate-300"
            >
              {isLogging ? 'Logging...' : 'Log Food'}
            </button>
          </div>
        </div>
      ) : null}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {showPhotoSheet ? (
        <AddPhotoSheet
          onClose={() => setShowPhotoSheet(false)}
          onTakePhoto={() => cameraInputRef.current?.click()}
          onChoosePhoto={() => fileInputRef.current?.click()}
        />
      ) : null}
    </div>
  )
}

export default ViewFoodPage