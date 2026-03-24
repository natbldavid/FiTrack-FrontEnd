function SectionCard({ title, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {title ? (
        <div className="border-b border-slate-200 bg-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-black">{title}</h2>
        </div>
      ) : null}
      <div>{children}</div>
    </div>
  )
}

function GymLiveWelcomeSection({ onNew, onLoad }) {
  return (
    <div className="space-y-5">
      <SectionCard>
        <div className="px-5 py-6 text-center">
          <h2 className="text-2xl font-bold text-black">Welcome to Gym Live</h2>
          <p className="mt-2 text-sm text-slate-500">
            Log your live gym session in this easy-to-use area.
          </p>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={onNew}
              className="w-full rounded-full px-4 py-3 text-base font-semibold text-white"
              style={{ backgroundColor: '#23a802' }}
            >
              New
            </button>

            <button
              type="button"
              onClick={onLoad}
              className="w-full rounded-full border border-[#23a802] bg-white px-4 py-3 text-base font-semibold text-[#23a802]"
            >
              Load
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

export default GymLiveWelcomeSection