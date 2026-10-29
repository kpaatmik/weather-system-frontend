import api from './axios'

export const getWeather = (cityId) => api.get(`/api/cities/weather/${cityId}`)
