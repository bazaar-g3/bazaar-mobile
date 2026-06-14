import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { Ionicons, FontAwesome } from '@expo/vector-icons'
import * as Google from 'expo-auth-session/providers/google'
import { useState, useEffect, useRef } from 'react'
import { loginWithOAuth } from '../services/auth'
import { COLORS } from '../constants/colors'

export default function OAuthButtons({ onSuccess, onError }) {
    const [loadingProvider, setLoadingProvider] = useState(null)

    // Si no hay Google client ID configurado (ej: build de preview sin variables de entorno),
    // pasamos null para deshabilitar el request y evitar un crash nativo en Android.
    const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || null

    // En APK nativa usamos el cliente Android con SHA-1 registrado en Google Cloud Console.
    // Esto evita el Expo Auth Proxy (deprecado) y funciona con APKs standalone firmadas.
    const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || undefined
    const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || undefined

    const [, googleResponse, promptGoogleAsync] = Google.useAuthRequest(
        googleClientId
            ? {
                webClientId: googleClientId,
                ...(androidClientId ? { androidClientId } : {}),
                ...(iosClientId ? { iosClientId } : {}),
            }
            : null
    )

    // Ref para evitar doble procesamiento si tanto la promesa como el useEffect
    // intentan procesar el mismo token (puede ocurrir en condiciones de carrera).
    const processedTokenRef = useRef(null)

    // En Android con Chrome Custom Tabs existe una condición de carrera:
    // la pestaña se cierra antes de que el listener de Linking procese la URL de redirect,
    // por lo que promptGoogleAsync() puede resolver con { type: 'dismiss' } aunque
    // el usuario completó el OAuth. googleResponse se actualiza correctamente vía
    // el listener interno de expo-auth-session incluso después de ese dismiss.
    useEffect(() => {
        if (!googleResponse) return

        if (googleResponse.type !== 'success') {
            setLoadingProvider(null)
            return
        }

        const accessToken = googleResponse.authentication?.accessToken
        if (!accessToken || accessToken === processedTokenRef.current) return
        processedTokenRef.current = accessToken

        setLoadingProvider('GOOGLE')
        ;(async () => {
            try {
                const userInfoRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                })
                const userInfo = await userInfoRes.json()
                await loginWithOAuth({
                    provider: 'GOOGLE',
                    providerId: userInfo.id,
                    email: userInfo.email,
                    fullName: userInfo.name,
                    avatarUrl: userInfo.picture,
                })
                onSuccess()
            } catch {
                processedTokenRef.current = null
                onError('No se pudo iniciar sesión con Google')
            } finally {
                setLoadingProvider(null)
            }
        })()
    }, [googleResponse])

    function handleGoogle() {
        if (!googleClientId || !promptGoogleAsync) {
            onError('Google Sign-In no está disponible en este entorno.')
            return
        }
        processedTokenRef.current = null
        setLoadingProvider('GOOGLE')
        promptGoogleAsync()
    }

    return (
        <View style={styles.container}>
            <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o continuá con</Text>
                <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
                style={styles.oauthButton}
                onPress={handleGoogle}
                disabled={!!loadingProvider}
            >
                {loadingProvider === 'GOOGLE'
                    ? <ActivityIndicator size="small" color={COLORS.textPrimary} />
                    : <>
                        <FontAwesome name="google" size={18} color="#EA4335" />
                        <Text style={styles.oauthButtonText}>Continuar con Google</Text>
                    </>
                }
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { marginTop: 4 },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
        gap: 8,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    dividerText: {
        color: COLORS.textMuted,
        fontSize: 13,
    },
    oauthButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        height: 52,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: COLORS.white,
    },
    oauthButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
})