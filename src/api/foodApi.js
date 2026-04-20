import api from './axios'

export const getFoods = async () => {
  const response = await api.get('/foods')
  return response.data
}

export const getFoodById = async (foodId) => {
  const response = await api.get(`/foods/${foodId}`)
  return response.data
}

export const createFood = async (payload) => {
  const response = await api.post('/foods', payload)
  return response.data
}

export const updateFood = async (foodId, payload) => {
  const response = await api.put(`/foods/${foodId}`, payload)
  return response.data
}

export const deleteFood = async (foodId) => {
  await api.delete(`/foods/${foodId}`)
}