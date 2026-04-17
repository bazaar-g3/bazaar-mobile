import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'

WebBrowser.maybeCompleteAuthSession()

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    ...FontAwesome.font,
    ...MaterialCommunityIcons.font,
  })

  if (!fontsLoaded && !fontError) return null

  return (
    <Stack screenOptions={{ headerShown: false }} />
  )
}
