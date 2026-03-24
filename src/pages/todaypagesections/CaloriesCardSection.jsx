function GoalIcon({ className = 'h-full w-full text-blue-500' }) {
  return (
    <svg
      viewBox="-12 0 512 512"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M64 96L112 96 112 448 64 448 64 96ZM144 96L424 96 352 216 424 336 144 336 144 96Z" />
    </svg>
  )
}

function FoodIcon({ className = 'h-full w-full text-orange-300' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      className={className}
      fill="currentColor"
    >
      <path d="M13 0.8c0-0.5-0.4-0.8-0.8-0.8h-0.2c-1.7 0-3 1.9-3 4.7v0.9c0 1 0.5 1.9 1.4 2.4-0.3 1.2-0.4 2.5-0.4 2.5v4c0 0.8 0.7 1.5 1.5 1.5s1.5-0.7 1.5-1.5v-4c0-0.4-0.1-1.4-0.3-2.3 0.2-0.2 0.3-0.4 0.3-0.7v-6.7z" />
      <path d="M7.2 0h-0.2v3.5c0 0.3-0.2 0.5-0.5 0.5s-0.5-0.2-0.5-0.5v-3c0-0.3-0.2-0.5-0.5-0.5s-0.5 0.2-0.5 0.5v3c0 0.3-0.2 0.5-0.5 0.5s-0.5-0.2-0.5-0.5v-3.5h-0.2c-0.4 0-0.8 0.4-0.8 0.8v3.7c0 1 0.6 1.9 1.5 2.3-0.4 1.6-0.5 3.7-0.5 3.7v4c0 0.8 0.7 1.5 1.5 1.5s1.5-0.7 1.5-1.5v-4c0-0.5-0.1-2.3-0.4-3.7 0.8-0.4 1.4-1.3 1.4-2.3v-3.7c0-0.4-0.4-0.8-0.8-0.8z" />
    </svg>
  )
}

function CaloriesCardSection({ calorieGoal = 0, foodCalories = 0 }) {
  const safeGoal = calorieGoal > 0 ? calorieGoal : 1
  const remaining = calorieGoal - foodCalories
  const isOver = remaining < 0
  const displayNumber = Math.abs(remaining)

  const progress = Math.min(foodCalories / safeGoal, 1)
  const circumference = 2 * Math.PI * 42
  const dashOffset = circumference * (1 - progress)

  const progressColor = isOver ? '#dc2626' : '#23a802'
  const centerLabel = isOver ? 'over' : 'remaining'

  return (
    <section className="px-4 pt-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-black">Calories</h3>

        <div className="mt-0 flex items-center justify-between gap-4">
          <div className="relative flex h-36 w-36 items-center justify-center">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="42"
                stroke="#e5e7eb"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="42"
                stroke={progressColor}
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-black">
                {displayNumber}
              </span>
              <span className="mt-1 text-xs font-medium text-slate-500">
                {centerLabel}
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-stretch gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                <GoalIcon />
              </div>

              <div className="flex flex-col justify-center">
                <span className="text-sm text-slate-500">Base Goal</span>
                <span className="text-sm font-semibold text-black">
                  {calorieGoal}
                </span>
              </div>
            </div>

            <div className="flex items-stretch gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                <FoodIcon />
              </div>

              <div className="flex flex-col justify-center">
                <span className="text-sm text-slate-500">Food</span>
                <span className="text-sm font-semibold text-black">
                  {foodCalories}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CaloriesCardSection