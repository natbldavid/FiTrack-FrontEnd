const formatNumber = (value) => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0
  return Math.round(safeValue)
}

function StatBlock({ value, label, valueClassName = 'text-black' }) {
  return (
    <div className="min-w-0 flex-1 text-center">
      <div className={`text-2xl font-bold ${valueClassName}`}>{value}</div>
      <div className="mt-1 text-xs font-medium text-slate-400">{label}</div>
    </div>
  )
}

function CalorieCountCard({ dailySummary, selectedGoals }) {
  const goalCalories = formatNumber(selectedGoals?.dailyCalorieGoal)
  const foodCalories = formatNumber(dailySummary?.totalCalories)
  const remainingCalories = goalCalories - foodCalories

  return (
    <section className="px-4 pt-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
        <h2 className="text-base font-semibold text-black">
          Calories Remaining
        </h2>

        <div className="mt-2 flex items-center justify-between gap-2">
          <StatBlock value={goalCalories} label="Goal" />

          <div className="shrink-0 text-2xl font-semibold text-slate-300">−</div>

          <StatBlock value={foodCalories} label="Food" />

          <div className="shrink-0 text-2xl font-semibold text-slate-300">=</div>

          <StatBlock
            value={remainingCalories}
            label="Remaining"
            valueClassName="text-green-600"
          />
        </div>
      </div>
    </section>
  )
}

export default CalorieCountCard