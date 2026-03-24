import api from './axios'

export const getActivityTypes = async () => {
  const response = await api.get('/ActivityTypes')
  return response.data
}