const TOKEN_KEY = 'fitrack_token'
const USER_KEY = 'fitrack_user'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const getStoredUser = () => {
  const rawUser = localStorage.getItem(USER_KEY)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser)
  } catch {
    return null
  }
}

export const setAuthStorage = (authData) => {
  localStorage.setItem(TOKEN_KEY, authData.token)
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      userId: authData.userId,
      username: authData.username,
    })
  )
}

export const clearAuthStorage = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}