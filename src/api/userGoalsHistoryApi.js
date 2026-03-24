import api from './axios'

export const getUserGoalsHistory = async () => {
  const response = await api.get('/UserGoalsHistory')
  return response.data
}

export const createUserGoalsHistory = async (payload) => {
  const response = await api.post('/UserGoalsHistory', payload)
  return response.data
}

export const updateUserGoalsHistory = async (id, payload) => {
  const response = await api.put(`/UserGoalsHistory/${id}`, payload)
  return response.data
}