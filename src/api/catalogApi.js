import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'

// El refresh siempre se hace contra el User API
const USER_API_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL
const CATALOG_API_URL = process.env.EXPO_PUBLIC_CATALOG_API_URL

const catalogApi = axios.create({
  baseURL: CATALOG_API_URL,
})

catalogApi.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

catalogApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = await AsyncStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const response = await axios.post(`${USER_API_URL}/auth/refresh`, { refreshToken })
          const newToken = response.data.accessToken
          await AsyncStorage.setItem('token', newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return catalogApi(originalRequest)
        } catch {
          await AsyncStorage.multiRemove(['token', 'refreshToken'])
          router.replace('/login')
        }
      } else {
        await AsyncStorage.removeItem('token')
        router.replace('/login')
      }
    }

    return Promise.reject(error)
  }
)

export function getCatalogApiBaseUrl() {
  return (catalogApi.defaults.baseURL ?? CATALOG_API_URL).replace(/\/$/, '')
}

export default catalogApi