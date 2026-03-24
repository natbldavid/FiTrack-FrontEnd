function MacroDonut({
  title,
  consumed = 0,
  goal = 0,
  color = '#3b82f6',
}) {
  const safeGoal = goal > 0 ? goal : 1
  const remaining = Math.max(goal - consumed, 0)
  const progress = Math.min(consumed / safeGoal, 1)

  const radius = 32
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-0">
      <h4
        className="text-center text-sm font-semibold leading-none -mb-4"
        style={{ color }}
      >
        {title}
      </h4>

      <div className="relative flex h-40 w-40 items-center justify-center sm:h-44 sm:w-44">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold leading-none text-black">
            {consumed}
          </span>
          <span className="mt-0 text-xs text-slate-500">/{goal}g</span>
        </div>
      </div>

      <span className="text-center text-xs leading-none -mt-4 text-slate-500">
        {remaining}g left
      </span>
    </div>
  )
}

function MacrosCardSection({
  carbGoal = 0,
  fatGoal = 0,
  proteinGoal = 0,
  carbsConsumed = 0,
  fatConsumed = 0,
  proteinConsumed = 0,
}) {
  return (
    <section className="px-4 pt-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-black">Macros</h3>

        <div className="mt-4 flex w-full items-start justify-between gap-1 sm:gap-2">
          <MacroDonut
            title="Carbs"
            consumed={carbsConsumed}
            goal={carbGoal}
            color="#2bb8b3"
          />

          <MacroDonut
            title="Fat"
            consumed={fatConsumed}
            goal={fatGoal}
            color="#7e22ce"
          />

          <MacroDonut
            title="Protein"
            consumed={proteinConsumed}
            goal={proteinGoal}
            color="#f5a623"
          />
        </div>
      </div>
    </section>
  )
}

export default MacrosCardSection