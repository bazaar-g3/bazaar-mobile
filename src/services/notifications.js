import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import Constants from 'expo-constants'

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

/*
 Registra el dispositivo para recibir notificaciones push.
 Llama a notifications-api para guardar el FCM token en Supabase.
 Debe llamarse al iniciar sesión.
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

    // Obtener el token FCM del dispositivo
    const projectId = Constants.expoConfig?.extra?.eas?.projectId
    const { data: fcmToken } = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    )

    // TODO: enviar el token al notifications-api para guardarlo en Supabase
    return fcmToken
  } catch (error) {
    console.warn('No se pudo registrar el dispositivo para push notifications', error)
    return null
  }
}
