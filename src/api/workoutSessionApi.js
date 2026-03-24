import api from './axios'

export const getWorkoutSessions = async () => {
  const response = await api.get('/WorkoutSessions')
  return response.data
}

export const getWorkoutSessionById = async (id) => {
  const response = await api.get(`/WorkoutSessions/${id}`)
  return response.data
}

export const startWorkoutSession = async (payload) => {
  const response = await api.post('/WorkoutSessions/start', payload)
  return response.data
}

export const updateWorkoutSessionSet = async (sessionId, payload) => {
  const response = await api.put(`/WorkoutSessions/${sessionId}/sets`, payload)
  return response.data
}

export const completeWorkoutSession = async (id, payload) => {
  const response = await api.post(`/WorkoutSessions/${id}/Complete`, payload)
  return response.data
}