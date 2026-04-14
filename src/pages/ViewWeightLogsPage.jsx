import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../routes/routePaths'
import WeightLogHeaderSection from './viewweightlogpagesections/WeightLogHeaderSection'
import WeightLogTrendGraphSection from './viewweightlogpagesections/WeightLogTrendGraphSection'
import WeightLogLogsSection from './viewweightlogpagesections/WeightLogLogsSection'

function ViewWeightLogsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen w-screen bg-slate-100">
      <div className="mx-auto w-full max-w-4xl px-4 py-4">
        <WeightLogHeaderSection
          title="Weight Logs"
          onBack={() => navigate(ROUTES.TODAY)}
        />
        <WeightLogTrendGraphSection />
        <WeightLogLogsSection />
      </div>
    </div>
  )
}

export default ViewWeightLogsPage