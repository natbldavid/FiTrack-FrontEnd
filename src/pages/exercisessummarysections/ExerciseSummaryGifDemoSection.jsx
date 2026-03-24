function ExerciseSummaryGifDemoSection({ exerciseName, gifUrl }) {
  if (!gifUrl) {
    return (
      <section className="mb-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <p className="text-sm text-slate-500">
          No exercise demo available yet.
        </p>
      </section>
    )
  }

  return (
    <section className="mb-4 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
      <div className="overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={gifUrl}
          alt={`${exerciseName || 'Exercise'} demo`}
          className="h-64 w-full object-cover"
          loading="lazy"
        />
      </div>
    </section>
  )
}

export default ExerciseSummaryGifDemoSection