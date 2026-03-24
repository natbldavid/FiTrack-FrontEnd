function GymDiarySessionCardsSection({
  sessions,
  isLoading,
  onSelectSession,
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Sessions</h2>
        <p className="mt-1 text-sm text-slate-600">
          Your completed workouts for the selected day.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <p className="text-sm text-slate-600">Loading sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <p className="text-sm text-slate-600">
            No workout sessions found for this day.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => onSelectSession(session)}
              className="relative w-full overflow-hidden rounded-3xl p-4 text-left shadow-sm ring-1 ring-slate-100 transition active:scale-[0.99]"
              style={{
                backgroundImage:
                  'url(https://media.istockphoto.com/id/625739874/photo/heavy-weight-exercise.jpg?s=612x612&w=0&k=20&c=B1uzJW1DBei2Rx5hnt139tt9dt3L7TbKrpgwbMR-LrI=)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-black/45" />

              <div className="relative z-10">
                <p className="text-base font-bold text-white">
                  {session.sessionName}
                </p>
                <p className="mt-1 text-sm text-white/90">
                  {session.muscleFocus}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

export default GymDiarySessionCardsSection