import api from './axios'

export const loginUser = async (payload) => {
  const response = await api.post('/users/login', payload)
  return response.data
}

export const registerUser = async (payload) => {
  const response = await api.post('/users/register', payload)
  return response.data
}

export const changePasscode = async (payload) => {
  const response = await api.put('/users/change-passcode', payload)
  return response.data
}