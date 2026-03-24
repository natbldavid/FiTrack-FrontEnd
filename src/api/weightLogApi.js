import api from './axios'

export const getWeightTrend = async () => {
  const response = await api.get('/WeightLogs/trend')
  return response.data
}

export const createWeightLog = async (payload) => {
  const response = await api.post('/WeightLogs', payload)
  return response.data
}