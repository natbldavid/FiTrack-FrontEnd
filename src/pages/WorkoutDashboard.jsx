import WorkoutHeaderSection from './workoutdashboardsections/WorkoutHeaderSection'
import WorkoutStatsSection from './workoutdashboardsections/WorkoutStatsSection'
import WorkoutDaysSection from './workoutdashboardsections/WorkoutDaysSection'

function WorkoutDashboard() {
  return (
    <div className="min-h-screen w-screen bg-slate-100">
      <div className="mx-auto w-full max-w-4xl px-4 py-4">
        <WorkoutHeaderSection />
        <WorkoutStatsSection />
        <WorkoutDaysSection />
      </div>
    </div>
  )
}

export default WorkoutDashboard