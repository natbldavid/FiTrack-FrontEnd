export const ROUTES = {
  OPENING: '/opening',
  LOGIN: '/login',
  CREATE_ACCOUNT: '/create-account',
  CHANGE_PASSCODE: '/change-passcode',
  TODAY: '/today',
  FOOD: '/food',
  FOOD_ADD_VIEW: '/food/add',
  FOOD_ADD_TO_MEAL: '/food/add-to-meal',
  CREATE_FOOD: '/food/create-food',
  CREATE_MEAL: '/food/create-meal',
  VIEW_FOOD: '/food/items/:foodId',
  VIEW_MEAL: '/food/meals/:mealId',
  ACTIVITIES: '/activities',
  LOG_ACTIVITY: '/log-activity',
  GYM_DIARY: '/gym-diary',
  WORKOUT_SESSIONS: '/workout-sessions/:sessionId',
  WORKOUT_DASHBOARD: '/workout-dashboard',
  ADD_WORKOUT_DAY: '/workout-dashboard/add-workout-day',
  WORKOUT_DAY_EXERCISES: '/workout-dashboard/:workoutDayId/exercises',
  EXERCISE_SUMMARY: '/workout-dashboard/:workoutDayId/exercises/:exerciseId',
  ACTION: '/action',
  WEIGHT_LOGS: '/weightlogs',
  GYM_LIVE: '/gym-live',
  MORE: '/more',
}

export const getViewMealRoute = (mealId) =>
  ROUTES.VIEW_MEAL.replace(':mealId', String(mealId))

export const getViewFoodRoute = (foodId) =>
  ROUTES.VIEW_FOOD.replace(':foodId', String(foodId))