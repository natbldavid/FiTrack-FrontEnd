import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../routes/routePaths'

function ActionPage() {
  const navigate = useNavigate()

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold">Quick Actions</h2>

      <div className="mt-6 grid gap-3">
        <button
          type="button"
          onClick={() => navigate(ROUTES.GYM_LIVE)}
          className="rounded-md bg-slate-900 px-4 py-2 text-white"
        >
          Start Gym Live
        </button>

        <button type="button" className="rounded-md border px-4 py-2">
          Add Food
        </button>

        <button type="button" className="rounded-md border px-4 py-2">
          Add Weight
        </button>

        <button type="button" className="rounded-md border px-4 py-2">
          Add Exercise
        </button>
      </div>
    </div>
  )
}

export default ActionPage