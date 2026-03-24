import api from './axios'

export const getFoods = async () => {
  const response = await api.get('/foods')
  return response.data
}

export const createFood = async (payload) => {
  const response = await api.post('/foods', payload)
  return response.data
}