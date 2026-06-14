import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { useRouter } from 'expo-router'

/**
 * Página intermediaria para el redirect de OAuth.
 * expo-router intercepta bazaar://oauthredirect?code=...
 * y renderiza este componente, que completa la sesión y
 * cierra el browser automáticamente.
 *
 * Si onSuccess() navega a /home antes de los 10s, este componente se
 * desmonta y el clearTimeout del cleanup cancela el redirect de fallback.
 */
export default function OAuthRedirect() {
  const router = useRouter()

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession()

    const timeout = setTimeout(() => {
      router.replace('/login')
    }, 10000)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  )
}
