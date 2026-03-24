import api from './axios'

export const getExercises = async () => {
  const response = await api.get('/exercisecatalog')
  return response.data
}