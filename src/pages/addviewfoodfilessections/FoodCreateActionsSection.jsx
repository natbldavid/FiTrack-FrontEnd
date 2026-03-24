import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../routes/routePaths'

function PlusIcon({ className = 'h-5 w-5' }) {
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
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

function ActionButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-green-600 shadow-sm ring-1 ring-slate-200/70"
    >
      <PlusIcon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  )
}

function FoodCreateActionsSection() {
  const navigate = useNavigate()

  return (
    <section className="pb-4">
      <div className="grid grid-cols-2 gap-3">
        <ActionButton
          label="Create Food"
          onClick={() => navigate(ROUTES.CREATE_FOOD)}
        />
        <ActionButton
          label="Create Meal"
          onClick={() => navigate(ROUTES.CREATE_MEAL)}
        />
      </div>
    </section>
  )
}

export default FoodCreateActionsSection