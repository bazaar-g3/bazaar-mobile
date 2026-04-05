import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'

const CATALOG_API_URL = process.env.EXPO_PUBLIC_CATALOG_API_URL || 'http://localhost:8002'

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
    if (error.response?.status === 401) {
      const token = await AsyncStorage.getItem('token')
      if (token) {
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
