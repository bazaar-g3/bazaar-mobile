import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import Constants from 'expo-constants'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../api/api'

// Configurar comportamiento de notificaciones cuando la app está abierta
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })
} catch {
  // Ignorar si no está disponible (ej. simulador o error de inicialización)
}

const PUSH_TOKEN_KEY = 'push_token'

/*
 Registra el dispositivo para recibir notificaciones push.
 Obtiene el Expo Push Token y lo envía a notifications-api.
 Debe llamarse al iniciar sesión (ya con el JWT en AsyncStorage).
*/
export async function registerForPushNotifications() {
  try {
    if (Platform.OS === 'web') {
      return null
    }

    if (!Device.isDevice) {
      console.log('Las push notifications solo funcionan en dispositivo físico')
      return null
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.log('Permiso de notificaciones denegado')
      return null
    }

    // Obtener el Expo Push Token del dispositivo
    const projectId = Constants.expoConfig?.extra?.eas?.projectId
    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    )

    // Guardar el token localmente para poder darlo de baja al logout
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, expoPushToken)

    // Registrar el token en notifications-api
    await api.post('/notifications/register-device', {
      token: expoPushToken,
      platform: 'expo',
    })

    return expoPushToken
  } catch (error) {
    console.warn('No se pudo registrar el dispositivo para push notifications', error)
    return null
  }
}

/*
 Da de baja el token push del dispositivo actual en notifications-api.
 Debe llamarse al cerrar sesión.
*/
export async function unregisterPushNotifications() {
  try {
    const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY)
    if (!token) return

    await api.delete('/notifications/unregister-device', {
      data: { token },
    })

    await AsyncStorage.removeItem(PUSH_TOKEN_KEY)
  } catch (error) {
    // Fire & forget: si falla la baja, no bloqueamos el logout
    console.warn('No se pudo dar de baja el dispositivo de push notifications', error)
  }
}
