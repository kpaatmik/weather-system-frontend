import { createContext, useContext, useEffect, useState } from 'react'
import { loginUser, logoutUser, registerUser } from '../api/authApi'
import { getAccessToken, setAccessToken } from '../api/axios'

const AuthContext = createContext(null)

function readUser() {
  try { return JSON.parse(localStorage.getItem('weather_user')) } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser)
  const [accessToken, setToken] = useState(getAccessToken())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleLogout = () => { setUser(null); setToken(null) }
    window.addEventListener('weather:logout', handleLogout)
    return () => window.removeEventListener('weather:logout', handleLogout)
  }, [])

  async function login(credentials) {
    setIsLoading(true)
    try {
      const { data } = await loginUser(credentials)
      const nextUser = { username: data.username, role: data.role }
      setAccessToken(data.accessToken); setToken(data.accessToken); setUser(nextUser)
      localStorage.setItem('weather_user', JSON.stringify(nextUser))
      return nextUser
    } finally { setIsLoading(false) }
  }

  async function register(payload) {
    setIsLoading(true)
    try {
      return await registerUser(payload)
    } finally {
      setIsLoading(false)
    }
  }

  async function logout() {
    try { await logoutUser() } catch { /* the local session still needs to end */ }
    setAccessToken(null); setToken(null); setUser(null)
    localStorage.removeItem('weather_user')
  }

  return <AuthContext.Provider value={{ user, accessToken, isAuthenticated: Boolean(user && accessToken), isLoading, login, register, logout }}>
    {children}
  </AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }
