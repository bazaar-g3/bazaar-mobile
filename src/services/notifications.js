import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import api from './api'

// Configurar comportamiento de notificaciones cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

/**
 * Registra el dispositivo para recibir notificaciones push.
 * Llama a notifications-api para guardar el FCM token en Supabase.
 * Debe llamarse al iniciar sesión.
 */
export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Las push notifications solo funcionan en dispositivo físico')
    return
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.log('Permiso de notificaciones denegado')
    return
  }

  // Obtener el token FCM del dispositivo
  const { data: fcmToken } = await Notifications.getExpoPushTokenAsync()

  // TODO: enviar el token al notifications-api para guardarlo en Supabase
  // await api.post('/notifications/register-device', { device_token: fcmToken })

  return fcmToken
}
