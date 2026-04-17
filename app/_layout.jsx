import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons'

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
