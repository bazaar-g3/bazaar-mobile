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
    if (!token) throw new Error('Missing access token')
    await AsyncStorage.setItem('token', token)
    return token
}