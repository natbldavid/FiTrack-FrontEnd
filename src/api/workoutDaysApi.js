import api from './axios'

export const getWorkoutDays = async () => {
  const response = await api.get('/WorkoutDays')
  return response.data
}

export const getWorkoutDayById = async (id) => {
  const response = await api.get(`/WorkoutDays/${id}`)
  return response.data
}

export const createWorkoutDay = async (payload) => {
  const response = await api.post('/workoutdays', payload)
  return response.data
}

export const updateWorkoutDay = async (id, payload) => {
  const response = await api.put(`/WorkoutDays/${id}`, payload)
  return response.data
}