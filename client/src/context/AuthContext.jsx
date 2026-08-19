import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

const TOKEN_KEY = 'algovista_token'
const USER_KEY = 'algovista_user'

const AuthContext = createContext(null)

const readLocalJson = (key) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  } catch (_error) {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [user, setUser] = useState(() => readLocalJson(USER_KEY))
  const [bootstrapping, setBootstrapping] = useState(Boolean(localStorage.getItem(TOKEN_KEY)))

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setBootstrapping(false)
        return
      }

      try {
        const data = await api.me(token)
        setUser(data.user)
        localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      } catch (_error) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setToken('')
        setUser(null)
      } finally {
        setBootstrapping(false)
      }
    }

    bootstrap()
  }, [token])

  const saveSession = (sessionToken, sessionUser) => {
    setToken(sessionToken)
    setUser(sessionUser)
    localStorage.setItem(TOKEN_KEY, sessionToken)
    localStorage.setItem(USER_KEY, JSON.stringify(sessionUser))
  }

  const logout = () => {
    setToken('')
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token && user), bootstrapping, saveSession, logout }),
    [token, user, bootstrapping],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
