import { useMemo, useState } from 'react'
import AuthContext from './authContext'
import {
  clearAuthStorage,
  getStoredUser,
  getToken,
  setAuthStorage,
} from '../services/authStorage'

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => getToken())
  const [user, setUser] = useState(() => getStoredUser())

  const login = (authData) => {
    setAuthStorage(authData)
    setToken(authData.token)
    setUser({
      userId: authData.userId,
      username: authData.username,
    })
  }

  const logout = () => {
    clearAuthStorage()
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}