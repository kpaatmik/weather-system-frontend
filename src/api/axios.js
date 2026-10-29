import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

let accessToken = localStorage.getItem('weather_access_token')
let refreshPromise = null

export function setAccessToken(token) {
  accessToken = token
  if (token) localStorage.setItem('weather_access_token', token)
  else localStorage.removeItem('weather_access_token')
}

export function getAccessToken() {
  return accessToken
}

function clearAuthAndRedirect() {
  setAccessToken(null)
  localStorage.removeItem('weather_user')
  window.dispatchEvent(new Event('weather:logout'))
  if (window.location.pathname !== '/login') window.location.assign('/login')
}

api.interceptors.request.use((config) => {
  if (accessToken && !config.skipAuth) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status !== 401 || originalRequest?._retry || originalRequest?.skipRefresh) {
      return Promise.reject(error)
    }

    originalRequest._retry = true
    refreshPromise ||= api.post('/api/auth/refresh', null, { skipAuth: true, skipRefresh: true })
      .then(({ data }) => {
        setAccessToken(data.accessToken)
        return data.accessToken
      })
      .catch((refreshError) => {
        clearAuthAndRedirect()
        throw refreshError
      })
      .finally(() => { refreshPromise = null })

    try {
      const token = await refreshPromise
      originalRequest.headers.Authorization = `Bearer ${token}`
      return api(originalRequest)
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  },
)

export function normalizeApiError(error) {
  const status = error.response?.status
  const data = error.response?.data || {}
  const fieldErrors = data.errors || {}
  const fallbackByStatus = {
    403: "You don't have permission to perform this action.",
    404: 'The requested resource was not found.',
    409: 'This record already exists.',
    500: 'Something went wrong on the server. Please try again later.',
    502: 'The weather service is temporarily unavailable.',
  }
  return {
    status,
    fieldErrors,
    message: data.message || fallbackByStatus[status] || 'Something went wrong. Please try again.',
  }
}

export default api
