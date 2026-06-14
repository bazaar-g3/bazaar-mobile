import api from '../api/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { registerForPushNotifications, unregisterPushNotifications } from './notifications'

/**
 * Inicia sesión con OAuth.
 * Después de guardar el token, registra el dispositivo para push notifications.
 */
export async function loginWithOAuth({ provider, providerId, email, fullName, avatarUrl }) {
    const res = await api.post('/auth/oauth/callback', {
        provider,
        providerId,
        email,
        fullName,
        avatarUrl,
    })
    const token = res.data.accessToken ?? res.data.access_token
    const refreshToken = res.data.refreshToken
    if (!token) throw new Error('Missing access token')
    await AsyncStorage.setItem('token', token)
    if (refreshToken) {
        await AsyncStorage.setItem('refreshToken', refreshToken)
    }
    // Registrar dispositivo para push notifications
    await registerForPushNotifications()
    return token
}

/**
 * Cierra sesión del usuario.
 * Antes de limpiar el token, da de baja el dispositivo de push notifications.
 */
export async function logout() {
    await unregisterPushNotifications()
    try {
        await api.post('/auth/logout')
    } catch {
        // Si falla el logout en el servidor igual limpiamos local
    } finally {
        await AsyncStorage.multiRemove(['token', 'refreshToken'])
    }
}
