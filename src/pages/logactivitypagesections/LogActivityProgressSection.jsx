function LogActivityProgressSection({ currentStep, totalSteps = 2 }) {
  const progressPercentage = Math.round((currentStep / totalSteps) * 100)

  return (
    <section className="pb-6">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">
          Step {currentStep} of {totalSteps}
        </p>
        <p className="text-sm font-semibold text-emerald-600">
          {progressPercentage}%
        </p>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
<div
  className="h-full rounded-full transition-all duration-300"
  style={{
    width: `${progressPercentage}%`,
    backgroundColor: '#24870b',
  }}
/>
      </div>
    </section>
  )
}

export default LogActivityProgressSection