import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'

// TODO: reemplazar con la URL del AWS API Gateway en producción
const API_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL || 'http://localhost:8001'

const api = axios.create({
  baseURL: API_URL,
})

// Interceptor: agrega el JWT en cada request automáticamente
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: si el token expiró limpia storage y redirige al login
api.interceptors.response.use(
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

export default api
