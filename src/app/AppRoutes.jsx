import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AuthLayout from '../layouts/AuthLayout'
import MainLayout from '../layouts/MainLayout'
import LoginPage from '../pages/LoginPage'
import CreateAccountPage from '../pages/CreateAccountPage'
import ChangePasscodePage from '../pages/ChangePasscodePage'
import TodayPage from '../pages/TodayPage'
import FoodPage from '../pages/FoodPage'
import ActivitiesPage from '../pages/ActivitiesPage'
import ActionPage from '../pages/ActionPage'
import GymLivePage from '../pages/GymLive'
import LogActivityPage from '../pages/LogActivityPage'
import GymDiaryPage from '../pages/GymDiaryPage'
import WorkoutSessionsPage from '../pages/WorkoutSessionsPage'
import MorePage from '../pages/MorePage'
import NotFoundPage from '../pages/NotFoundPage'
import OpeningPage from '../pages/OpeningPage'
import AddViewFoodFiles from '../pages/AddViewFoodFiles'
import AddFoodItemsToMeal from '../pages/AddFoodItemsToMeal'
import CreateFood from '../pages/CreateFood'
import CreateMeal from '../pages/CreateMeal'
import WorkoutDashboard from '../pages/WorkoutDashboard'
import AddWorkoutDaysForm from '../pages/AddWorkoutDaysForm'
import WorkoutDaysExercises from '../pages/WorkoutDaysExercises'
import ExercisesSummary from '../pages/ExercisesSummary'
import WeightLogs from '../pages/ViewWeightLogsPage'
import ViewMealsPage from '../pages/ViewMealsPage'
import ViewFoodPage from '../pages/ViewFoodPage'
import { ROUTES } from '../routes/routePaths'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.OPENING} replace />} />

      <Route path={ROUTES.OPENING} element={<OpeningPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.CREATE_ACCOUNT} element={<CreateAccountPage />} />

      <Route element={<AuthLayout />}>
        <Route path={ROUTES.CHANGE_PASSCODE} element={<ChangePasscodePage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.FOOD_ADD_VIEW} element={<AddViewFoodFiles />} />
        <Route path={ROUTES.FOOD_ADD_TO_MEAL} element={<AddFoodItemsToMeal />} />
        <Route path={ROUTES.CREATE_FOOD} element={<CreateFood />} />
        <Route path={ROUTES.CREATE_MEAL} element={<CreateMeal />} />
        <Route path={ROUTES.VIEW_FOOD} element={<ViewFoodPage />} />
        <Route path={ROUTES.VIEW_MEAL} element={<ViewMealsPage />} />
        <Route path={ROUTES.WORKOUT_DASHBOARD} element={<WorkoutDashboard />} />
        <Route path={ROUTES.ADD_WORKOUT_DAY} element={<AddWorkoutDaysForm />} />
        <Route
          path={ROUTES.WORKOUT_DAY_EXERCISES}
          element={<WorkoutDaysExercises />}
        />
        <Route
          path={ROUTES.EXERCISE_SUMMARY}
          element={<ExercisesSummary />}
        />

        <Route path={ROUTES.GYM_LIVE} element={<GymLivePage />} />
        <Route path={ROUTES.LOG_ACTIVITY} element={<LogActivityPage />} />
        <Route path={ROUTES.GYM_DIARY} element={<GymDiaryPage />} />
        <Route path={ROUTES.WORKOUT_SESSIONS} element={<WorkoutSessionsPage />} />
        <Route path={ROUTES.WEIGHT_LOGS} element={<WeightLogs />} />

        <Route element={<MainLayout />}>
          <Route path={ROUTES.TODAY} element={<TodayPage />} />
          <Route path={ROUTES.FOOD} element={<FoodPage />} />
          <Route path={ROUTES.ACTIVITIES} element={<ActivitiesPage />} />
          <Route path={ROUTES.ACTION} element={<ActionPage />} />
          <Route path={ROUTES.MORE} element={<MorePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes