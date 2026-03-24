import { useMemo, useState } from 'react'

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

function ChevronDownIcon({ className = 'h-5 w-5' }) {
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
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

const MEAL_SLOT_OPTIONS = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snack', label: 'Snack' },
]

function FoodSelectionHeaderSection({
  selectedMealSlot,
  onChangeMealSlot,
  onBack,
}) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedLabel = useMemo(() => {
    return (
      MEAL_SLOT_OPTIONS.find((option) => option.key === selectedMealSlot)
        ?.label || 'Breakfast'
    )
  }, [selectedMealSlot])

  return (
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

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="inline-flex items-center gap-1 text-lg font-semibold text-green-600"
          >
            <span>{selectedLabel}</span>
            <ChevronDownIcon className="h-5 w-5" />
          </button>

          {isOpen ? (
            <div className="absolute left-1/2 top-full z-20 mt-2 w-44 -translate-x-1/2 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-slate-200">
              {MEAL_SLOT_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    onChangeMealSlot(option.key)
                    setIsOpen(false)
                  }}
                  className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-sm ${
                    option.key === selectedMealSlot
                      ? 'bg-slate-100 font-semibold text-black'
                      : 'text-slate-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default FoodSelectionHeaderSection