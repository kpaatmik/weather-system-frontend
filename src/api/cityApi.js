import api from './axios'

export const getActiveCities = () => api.get('/api/cities/active')
export const getAllCities = () => api.get('/api/admin/cities')
export const searchCities = (query) => api.get('/api/admin/cities/sugesstion', { params: { q: query } })
export const addCity = (city) => api.post('/api/admin/cities/save', city)
export const deactivateCity = (cityId) => api.patch(`/api/admin/cities/${cityId}/deactivate`)
export const deleteCity = (cityId) => api.delete(`/api/admin/cities/${cityId}`)
