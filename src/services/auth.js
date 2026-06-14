import api from '../api/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { unregisterPushNotifications } from './notifications'

/**
 * Inicia sesión con OAuth.
 * @param provider - Proveedor de OAuth.
 * @param providerId - ID del proveedor.
 * @param email - Correo electrónico del usuario.
 * @param fullName - Nombre completo del usuario.
 * @param avatarUrl - URL del avatar del usuario.
 * @returns El token de acceso.
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
    return token
}

/**
 * Cierra sesión del usuario.
 */
export async function logout() {
    // Dar de baja el token push antes de limpiar el JWT (necesita auth)
    await unregisterPushNotifications()

    try {
        await api.post('/auth/logout')
    } catch {
        // Si falla el logout en el servidor igual limpiamos local
    } finally {
        await AsyncStorage.multiRemove(['token', 'refreshToken'])
    }
}