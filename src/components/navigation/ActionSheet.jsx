import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createWeightLog } from '../../api/weightLogApi'
import { ROUTES } from '../../routes/routePaths'

function MagnifyingGlassIcon({ className = 'h-6 w-6' }) {
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
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l5 5" />
    </svg>
  )
}

function SportsShoeIcon({ className = 'h-6 w-6' }) {
  return (
    <svg
      viewBox="0 0 296.236 296.236"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M289.941,160.434c-4.063-3.77-9.936-6.39-17.457-7.789c-25.156-4.678-44.832-11.033-60.486-17.794L196.08,163.05
      c-1.471,2.604-4.182,4.068-6.975,4.068c-1.332,0-2.682-0.333-3.924-1.034c-3.848-2.172-5.207-7.052-3.035-10.899l15.381-27.245
      c-4.258-2.237-8.145-4.471-11.703-6.66l-23.178,25.761c-1.58,1.756-3.762,2.649-5.951,2.649c-1.906,0-3.818-0.678-5.348-2.053
      c-3.285-2.955-3.551-8.014-0.596-11.298l21.633-24.044c-2.752-1.982-5.258-3.857-7.547-5.573
      c-6.838-5.126-12.412-9.293-18.053-11.514c-22.414-34.187-30.93-34.195-34.35-34.195c-0.209,0-0.416,0.006-0.621,0.018
      c-8.844,0.491-14.023,10.197-19.795,37.09c-1.037,4.834-1.953,9.633-2.727,13.961c-2.168,0.11-4.439,0.173-6.834,0.173
      c-36.594,0-45.779-23.519-46.127-24.449c-0.951-2.709-3.279-4.7-6.103-5.22c-2.818-0.518-5.705,0.514-7.559,2.707
      c-0.748,0.886-17.717,21.352-21.672,55.558c7.615-0.593,20.641-0.668,35.043,3.344c20.457,5.695,47.549,20.907,61.328,60.878
      c6.377-0.817,13.08-1.356,20.641-1.356c17.193,0,37.344,1.997,56.832,3.928c20.016,1.983,40.711,4.034,58.943,4.034
      c4.068,0,7.953-0.104,11.549-0.307c8.6-0.486,16.949-2.641,24.324-5.929c-6.25,8.834-15.838,13.781-27.916,13.781H20.686
      l0.781-8.11c6.559,0.785,12.881,1.18,19.131,1.18c14.779,0,26.973-2.189,38.764-4.306c0.648-0.116,1.295-0.232,1.941-0.348
      c-9.443-25.346-26.094-41.5-49.553-48.032c-13.916-3.875-26.281-3.208-31.734-2.605c-0.326,24.329,4.52,41.357,6.129,46.309
      l-2.228,23.146c-0.217,2.245,0.525,4.477,2.041,6.146c1.516,1.669,3.666,2.621,5.922,2.621h229.863
      c14.584,0,27.723-5.521,36.994-15.548c7.986-8.634,12.92-20.297,14.514-34.11c1.703-3.157,2.734-6.442,2.945-9.759
      C296.568,169.981,294.346,164.521,289.941,160.434z M129.123,97.741c-0.008,0.015-0.018,0.027-0.023,0.043
      c-0.627,0.917-6.141,8.267-23.18,12.124c2.752-14.344,5.775-25.58,8.1-30.998C117.467,82.134,122.824,88.702,129.123,97.741z" />
    </svg>
  )
}

function ScalesIcon({ className = 'h-6 w-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M14 22.75H10C4.57 22.75 2.25 20.43 2.25 15V9C2.25 3.57 4.57 1.25 10 1.25H14C19.43 1.25 21.75 3.57 21.75 9V15C21.75 20.43 19.43 22.75 14 22.75ZM10 2.75C5.39 2.75 3.75 4.39 3.75 9V15C3.75 19.61 5.39 21.25 10 21.25H14C18.61 21.25 20.25 19.61 20.25 15V9C20.25 4.39 18.61 2.75 14 2.75H10Z" />
      <path d="M15.0701 12.54C14.8901 12.54 14.7101 12.47 14.5701 12.35C13.1101 11.05 10.8901 11.05 9.43011 12.35C9.27011 12.5 9.05011 12.56 8.82011 12.53C8.60011 12.5 8.41011 12.37 8.29011 12.18L6.11011 8.68001C5.92011 8.37001 5.98011 7.97001 6.25011 7.72001C9.53011 4.81001 14.4701 4.81001 17.7501 7.72001C18.0201 7.96001 18.0801 8.37001 17.8901 8.68001L15.7101 12.18C15.5901 12.37 15.4001 12.49 15.1801 12.53C15.1401 12.53 15.1001 12.54 15.0701 12.54ZM12.0001 9.87001C13.0001 9.87001 13.9901 10.15 14.8601 10.7L16.2601 8.45001C13.7301 6.57001 10.2601 6.57001 7.73011 8.45001L9.13011 10.7C10.0101 10.14 11.0001 9.87001 12.0001 9.87001Z" />
    </svg>
  )
}

function PlusIcon({ className = 'h-6 w-6' }) {
  return (
    <svg
      viewBox="-2 -3 24 24"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M7.116 10.749L6 1.948l-1.116 8.8H1c-.552 0-1-.437-1-.976a.99.99 0 0 1 1-.978h2.116l.9-7.086C4.15.636 5.15-.124 6.245.008c.91.11 1.626.81 1.739 1.7l.899 7.086h1.974L12 16.04l1.142-7.245H19c.552 0 1 .438 1 .978s-.448.977-1 .977h-4.142l-.881 5.587a1.978 1.978 0 0 1-1.672 1.634c-1.092.165-2.113-.567-2.282-1.634l-.88-5.587H7.115z" />
    </svg>
  )
}

function CloseIcon({ className = 'h-5 w-5' }) {
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
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  )
}

const formatDateString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getTodayDateString = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return formatDateString(today)
}

const getNowIsoString = () => {
  return new Date().toISOString()
}

function QuickActionCard({ title, icon: Icon, iconBgClass, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center rounded-3xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-100 transition active:scale-[0.98]"
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${iconBgClass}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold leading-5 text-slate-900">
          {title}
        </p>
      </div>
    </button>
  )
}

function AddWeightModal({
  logDate,
  weight,
  isSaving,
  onChangeDate,
  onChangeWeight,
  onClose,
  onSubmit,
}) {
  const isSubmitDisabled =
    isSaving || !weight || Number(weight) <= 0 || !/^\d+(\.\d{0,2})?$/.test(weight)

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-t-3xl bg-black/20 px-5">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Add Weight Log
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700"
            aria-label="Close weight log modal"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="weightLogDate"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Date
            </label>
            <input
              id="weightLogDate"
              type="date"
              value={logDate}
              onChange={(event) => onChangeDate(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div>
            <label
              htmlFor="weightKg"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Weight (kg)
            </label>
            <input
              id="weightKg"
              type="text"
              inputMode="decimal"
              placeholder="Enter weight in kg"
              value={weight}
              onChange={(event) => onChangeWeight(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
            <p className="mt-2 text-xs text-slate-500">
              Enter up to 2 decimal places.
            </p>
          </div>
        </div>

        <div className="pt-6">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitDisabled}
            className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              isSubmitDisabled
                ? 'cursor-not-allowed border-slate-200 bg-slate-200 text-slate-500'
                : 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm active:scale-[0.99]'
            }`}
          >
            {isSaving ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ActionSheet({ isOpen, onClose }) {
  const navigate = useNavigate()

  const [isVisible, setIsVisible] = useState(false)
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false)
  const [logDate, setLogDate] = useState(getTodayDateString())
  const [weight, setWeight] = useState('')
  const [isSavingWeight, setIsSavingWeight] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const actionItems = useMemo(
    () => [
      {
        title: 'Log Food',
        icon: MagnifyingGlassIcon,
        iconBgClass: 'bg-emerald-500',
        onClick: () => handleNavigate(ROUTES.FOOD),
      },
      {
        title: 'Log Activity',
        icon: PlusIcon,
        iconBgClass: 'bg-blue-500',
        onClick: () => handleNavigate(ROUTES.LOG_ACTIVITY),
      },
      {
        title: 'Gym Live',
        icon: SportsShoeIcon,
        iconBgClass: 'bg-violet-500',
        onClick: () => handleNavigate(ROUTES.GYM_LIVE),
      },
      {
        title: 'Log Weight',
        icon: ScalesIcon,
        iconBgClass: 'bg-rose-500',
        onClick: () => {
          setErrorMessage('')
          setSuccessMessage('')
          setLogDate(getTodayDateString())
          setWeight('')
          setIsWeightModalOpen(true)
        },
      },
    ],
    []
  )

  const handleClose = () => {
    setIsVisible(false)
    setIsWeightModalOpen(false)

    setTimeout(() => {
      onClose()
    }, 300)
  }

  const handleNavigate = (to) => {
    setIsVisible(false)

    setTimeout(() => {
      onClose()
      navigate(to)
    }, 300)
  }

  const handleWeightChange = (value) => {
    if (value === '') {
      setWeight('')
      return
    }

    if (/^\d+(\.\d{0,2})?$/.test(value)) {
      setWeight(value)
    }
  }

  const handleSubmitWeightLog = async () => {
    if (!weight || Number(weight) <= 0) {
      setErrorMessage('Enter a valid weight.')
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    setIsSavingWeight(true)

    try {
      await createWeightLog({
        logDate,
        loggedAt: getNowIsoString(),
        weight: Number(weight),
        note: '',
      })

      setIsWeightModalOpen(false)
      setWeight('')
      setLogDate(getTodayDateString())
      setSuccessMessage('Weight Log submitted')

      setTimeout(() => {
        setSuccessMessage('')
      }, 2500)
    } catch (err) {
      console.error(err)
      setErrorMessage(
        err.response?.data?.message || 'Could not submit weight log.'
      )
    } finally {
      setIsSavingWeight(false)
    }
  }

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const openTimer = setTimeout(() => {
      setIsVisible(true)
    }, 10)

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (isWeightModalOpen) {
          setIsWeightModalOpen(false)
          return
        }

        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(openTimer)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isWeightModalOpen])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close actions"
        onClick={handleClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        className={`absolute inset-x-0 bottom-0 h-[50vh] rounded-t-3xl bg-white shadow-2xl transition-all duration-300 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-center pt-3">
            <div className="h-1.5 w-12 rounded-full bg-slate-300" />
          </div>

          <div className="px-5 pb-4 pt-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-black">Quick actions</h2>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Choose what you want to do next.
            </p>

            {successMessage ? (
              <div className="mt-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                {successMessage}
              </div>
            ) : null}

            {errorMessage ? (
              <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
            ) : null}
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-6">
            <div className="grid grid-cols-2 gap-3">
              {actionItems.map((item) => (
                <QuickActionCard
                  key={item.title}
                  title={item.title}
                  icon={item.icon}
                  iconBgClass={item.iconBgClass}
                  onClick={item.onClick}
                />
              ))}
            </div>
          </div>

          {isWeightModalOpen ? (
            <AddWeightModal
              logDate={logDate}
              weight={weight}
              isSaving={isSavingWeight}
              onChangeDate={setLogDate}
              onChangeWeight={handleWeightChange}
              onClose={() => {
                setIsWeightModalOpen(false)
                setErrorMessage('')
              }}
              onSubmit={handleSubmitWeightLog}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default ActionSheet