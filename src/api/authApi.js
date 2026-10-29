import api from './axios'

export const registerUser = (payload) => api.post('/api/auth/register', payload)
export const loginUser = (payload) => api.post('/api/auth/login', payload, { skipRefresh: true })
export const refreshToken = () => api.post('/api/auth/refresh', null, { skipAuth: true, skipRefresh: true })
export const logoutUser = () => api.post('/api/auth/logout')
