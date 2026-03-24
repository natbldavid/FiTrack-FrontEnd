import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { ROUTES } from '../../routes/routePaths'
import ActionSheet from '../navigation/ActionSheet'

function TodayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
    >
      <rect x="3.75" y="4.75" width="16.5" height="15.5" rx="2.5" />
      <path strokeLinecap="round" d="M8 3.5v3M16 3.5v3M3.75 9.25h16.5" />
    </svg>
  )
}

function FoodIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 4.5c-.3 0-.5.3-.5.5v2.5h-1V5c0-.3-.2-.5-.5-.5s-.5.3-.5.5v2.5h-1V5c0-.3-.2-.5-.5-.5s-.5.3-.5.5v3.3c0 .9.7 1.6 1.5 1.7v7c0 .6.4 1 1 1s1-.4 1-1v-7c.8-.1 1.5-.8 1.5-1.7V5c0-.2-.2-.5-.5-.5zM9 5v6h1v6c0 .6.4 1 1 1s1-.4 1-1V2c-1.7 0-3 1.3-3 3zm7-1c-1.4 0-2.5 1.5-2.5 3.3-.1 1.2.5 2.3 1.5 3V17c0 .6.4 1 1 1s1-.4 1-1v-6.7c1-.7 1.6-1.8 1.5-3C18.5 5.5 17.4 4 16 4z"
      />
    </svg>
  )
}

function ActivitiesIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 14h3l2-4 3 8 2-5h6"
      />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
    >
      <circle cx="12" cy="5.5" r="1.25" />
      <circle cx="12" cy="12" r="1.25" />
      <circle cx="12" cy="18.5" r="1.25" />
    </svg>
  )
}

const navItems = [
  { label: 'Today', to: ROUTES.TODAY, icon: TodayIcon },
  { label: 'Food', to: ROUTES.FOOD, icon: FoodIcon },
  { label: 'Activities', to: ROUTES.ACTIVITIES, icon: ActivitiesIcon },
  { label: 'More', to: ROUTES.MORE, icon: MoreIcon },
]

function BottomNavBar() {
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false)

  return (
    <>
      <nav className="sticky bottom-0 z-40 border-t border-slate-200 bg-white px-2 pb-3 pt-2">
        <div className="mx-auto grid max-w-4xl grid-cols-5 items-end">
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 py-1 ${
                    isActive ? 'text-black' : 'text-slate-400'
                  }`
                }
              >
                <Icon />
                <span className="text-[11px] font-medium leading-none">
                  {item.label}
                </span>
              </NavLink>
            )
          })}

          <div className="flex items-center justify-center">
   <button
  type="button"
  onClick={() => setIsActionSheetOpen(true)}
  aria-label="Open actions"
  className="grid h-12 w-12 place-items-center rounded-full text-white shadow-md transition hover:scale-[1.02]"
  style={{ backgroundColor: '#23a802' }}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
</button>
          </div>

          {navItems.slice(2).map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 py-1 ${
                    isActive ? 'text-black' : 'text-slate-400'
                  }`
                }
              >
                <Icon />
                <span className="text-[11px] font-medium leading-none">
                  {item.label}
                </span>
              </NavLink>
            )
          })}
        </div>
      </nav>

      <ActionSheet
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
      />
    </>
  )
}

export default BottomNavBar