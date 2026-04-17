import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons'

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...FontAwesome.font,
    ...MaterialCommunityIcons.font,
  })

  if (!fontsLoaded) return null

  return (
    <Stack screenOptions={{ headerShown: false }} />
  )
}
