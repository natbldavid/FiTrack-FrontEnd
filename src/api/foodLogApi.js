import api from './axios'

export const getDailyFoodSummary = async (logDate) => {
  const response = await api.get(`/foodlogs/daily/${logDate}`)
  return response.data
}

export const createFoodLog = async (payload) => {
  const response = await api.post('/foodlogs', payload)
  return response.data
}