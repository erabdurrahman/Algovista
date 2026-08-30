import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

const TOKEN_KEY = 'algovista_token'
const USER_KEY = 'algovista_user'

const AuthContext = createContext(null)

const readLocalJson = (key) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [user, setUser] = useState(() => readLocalJson(USER_KEY))
  const [bootstrapping, setBootstrapping] = useState(false)

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      if (!storedToken) {
        setBootstrapping(false)
        return
      }

      try {
        const data = await api.me(storedToken)
        if (data && data.user) {
          setUser(data.user)
          localStorage.setItem(USER_KEY, JSON.stringify(data.user))
        }
      } catch (err) {
        // Only clear session if token is explicitly invalid/expired (401/403)
        const errMsg = (err.message || '').toLowerCase()
        if (errMsg.includes('token') || errMsg.includes('unauthorized') || errMsg.includes('forbidden')) {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          setToken('')
          setUser(null)
        }
        // If it's a network glitch or cold start, keep the local user intact!
      } finally {
        setBootstrapping(false)
      }
    }

    bootstrap()
  }, [])

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
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      bootstrapping,
      saveSession,
      logout,
    }),
    [token, user, bootstrapping],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
