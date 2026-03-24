import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../routes/routePaths'

function PlusIcon({ className = 'h-6 w-6' }) {
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

function BicepIcon({ className = 'h-6 w-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8.5 13.5c.7-1.9.8-3.5.2-5l2.2-1.8 2.1 2.1-.8 1.7c1.3.2 2.4.8 3.3 1.8 1.2 1.3 1.8 2.9 1.8 4.7v.5H9.8c-1.6 0-2.9-.5-3.8-1.5-.8-.8-1.2-1.8-1.2-2.9 0-1 .3-1.9 1-2.6.7-.8 1.6-1.3 2.7-1.5Z" />
      <path d="M9 13c.8.8 1.8 1.2 3 1.2h1.8" />
    </svg>
  )
}

function DumbbellIcon({ className = 'h-6 w-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 10v4" />
      <path d="M6 8v8" />
      <path d="M18 8v8" />
      <path d="M21 10v4" />
      <path d="M6 12h12" />
      <path d="M9 9v6" />
      <path d="M15 9v6" />
    </svg>
  )
}

function CalendarIcon({ className = 'h-6 w-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 3v3" />
      <path d="M16 3v3" />
      <path d="M4 9h16" />
      <rect x="3" y="5" width="18" height="16" rx="3" />
    </svg>
  )
}

const ACTION_CARDS = [
  {
    title: 'Log Activity',
    icon: PlusIcon,
    iconColorClass: 'text-emerald-600',
    iconBackgroundClass: 'bg-emerald-100',
    route: ROUTES.LOG_ACTIVITY,
  },
  {
    title: 'Gym Live',
    icon: BicepIcon,
    iconColorClass: 'text-rose-600',
    iconBackgroundClass: 'bg-rose-100',
    route: ROUTES.GYM_LIVE,
  },
  {
    title: 'Workouts',
    icon: DumbbellIcon,
    iconColorClass: 'text-violet-600',
    iconBackgroundClass: 'bg-violet-100',
    route: ROUTES.WORKOUT_DASHBOARD,
  },
  {
    title: 'Gym Diary',
    icon: CalendarIcon,
    iconColorClass: 'text-amber-600',
    iconBackgroundClass: 'bg-amber-100',
    route: ROUTES.GYM_DIARY,
  },
]

function QuickActionCardsSection() {
  const navigate = useNavigate()

  return (
    <section className="px-4 pt-4">
      <div className="grid grid-cols-2 gap-3">
        {ACTION_CARDS.map((card) => {
          const Icon = card.icon

          return (
            <button
              key={card.title}
              type="button"
              onClick={() => navigate(card.route)}
              className="rounded-3xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-100 transition active:scale-[0.98]"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${card.iconBackgroundClass}`}
              >
                <Icon className={`h-6 w-6 ${card.iconColorClass}`} />
              </div>

              <div className="mt-4">
                <p className="text-sm font-semibold leading-5 text-slate-900">
                  {card.title}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default QuickActionCardsSection