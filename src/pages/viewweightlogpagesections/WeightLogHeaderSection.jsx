import { useState } from 'react'
import { createWeightLog } from '../../api/weightLogApi'

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

function PlusIcon({ className = 'h-5 w-5' }) {
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
    isSaving ||
    !weight ||
    Number(weight) <= 0 ||
    !/^\d+(\.\d{0,2})?$/.test(weight)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
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

function WeightLogHeaderSection({ title = 'Weight Logs', onBack, onLogAdded }) {
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false)
  const [logDate, setLogDate] = useState(getTodayDateString())
  const [weight, setWeight] = useState('')
  const [isSavingWeight, setIsSavingWeight] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleWeightChange = (value) => {
    if (value === '') {
      setWeight('')
      return
    }

    if (/^\d+(\.\d{0,2})?$/.test(value)) {
      setWeight(value)
    }
  }

  const handleOpenModal = () => {
    setErrorMessage('')
    setLogDate(getTodayDateString())
    setWeight('')
    setIsWeightModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsWeightModalOpen(false)
    setErrorMessage('')
  }

  const handleSubmitWeightLog = async () => {
    if (!weight || Number(weight) <= 0) {
      setErrorMessage('Enter a valid weight.')
      return
    }

    setErrorMessage('')
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

      if (typeof onLogAdded === 'function') {
        onLogAdded()
      }
    } catch (err) {
      console.error(err)
      setErrorMessage(
        err.response?.data?.message || 'Could not submit weight log.'
      )
    } finally {
      setIsSavingWeight(false)
    }
  }

  return (
    <>
      <section className="pb-4">
        <div className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={onBack}
            className="absolute left-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
            aria-label="Go back"
          >
            <BackIcon />
          </button>

          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>

          <button
            type="button"
            onClick={handleOpenModal}
            className="absolute right-0 inline-flex h-9 items-center gap-1.5 rounded-full border border-[#23a802] bg-white px-3 text-sm font-semibold text-[#23a802] shadow-sm"
            aria-label="Add weight log"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Log</span>
          </button>
        </div>

        {errorMessage ? (
          <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
        ) : null}
      </section>

      {isWeightModalOpen ? (
        <AddWeightModal
          logDate={logDate}
          weight={weight}
          isSaving={isSavingWeight}
          onChangeDate={setLogDate}
          onChangeWeight={handleWeightChange}
          onClose={handleCloseModal}
          onSubmit={handleSubmitWeightLog}
        />
      ) : null}
    </>
  )
}

export default WeightLogHeaderSection