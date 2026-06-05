import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import * as WebBrowser from 'expo-web-browser'

/**
 * Página intermediaria para el redirect de OAuth.
 * expo-router intercepta bazaar://oauthredirect?code=...
 * y renderiza este componente, que completa la sesión y
 * cierra el browser automáticamente.
 */
export default function OAuthRedirect() {
  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession()
  }, [])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  )
}
