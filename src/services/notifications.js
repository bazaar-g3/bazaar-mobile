import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../api/api'

const PUSH_TOKEN_KEY = 'push_token'

/*
 Registra el dispositivo para recibir notificaciones push.
 Llama a notifications-api para guardar el token en Firestore.
 Debe llamarse al iniciar sesión.
*/
export async function registerForPushNotifications() {
  try {
    if (Platform.OS === 'web') return null
    if (!Device.isDevice) return null

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

    // getDevicePushTokenAsync() devuelve el token FCM nativo (Android) o APNs (iOS),
    // que es lo que espera Firebase Admin SDK en el backend.
    // getExpoPushTokenAsync() devuelve un token del proxy de Expo que NO es válido para FCM directo.
    const { data: fcmToken } = await Notifications.getDevicePushTokenAsync()

    await AsyncStorage.setItem(PUSH_TOKEN_KEY, fcmToken)
    await api.post('/notifications/register-device', { token: fcmToken, platform: Platform.OS })
    console.log('Push token FCM registrado:', fcmToken)
    return fcmToken
  } catch (error) {
    console.warn('No se pudo registrar el dispositivo para push notifications', error)
    return null
  }
}

/*
 Da de baja el token push del dispositivo.
 Debe llamarse al cerrar sesión.
*/
export async function unregisterPushNotifications() {
  try {
    const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY)
    if (!token) return
    await api.delete('/notifications/unregister-device', { data: { token } })
    await AsyncStorage.removeItem(PUSH_TOKEN_KEY)
  } catch (error) {
    console.warn('No se pudo dar de baja el dispositivo de push notifications', error)
  }
}