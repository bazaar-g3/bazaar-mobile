import api from '../api/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

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

export async function logout() {
    try {
        await api.post('/auth/logout')
    } catch {
        // Si falla el logout en el servidor igual limpiamos local
    } finally {
        await AsyncStorage.multiRemove(['token', 'refreshToken'])
    }
}