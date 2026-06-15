import { useEffect, useRef } from 'react'
import { Stack, useRouter } from 'expo-router'
import { View, Platform } from 'react-native'
import { useFonts } from 'expo-font'
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'
import * as Notifications from 'expo-notifications'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { CartProvider } from '../src/context/CartContext'
import BottomNavBar from '../src/components/BottomNavBar'

WebBrowser.maybeCompleteAuthSession()

// Mostrar notificaciones aunque la app esté en primer plano (no aplica en web)
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })
}

// Canal Android con importancia HIGH → activa el banner emergente cuando la app está en background
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'Bazaar',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#0B3A46',
    sound: 'default',
  })
}

export default function RootLayout() {
  const router = useRouter()
  const notificationListener = useRef(null)

  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    ...FontAwesome.font,
    ...MaterialCommunityIcons.font,
  })

  // Al tocar una notificación te lleva al detalle de la orden
  useEffect(() => {
    const navigateToOrder = (response) => {
      if (!response) return
      const data = response.notification.request.content.data
      if (data?.order_id) {
        // Pequeño delay para asegurar que el router esté listo
        setTimeout(() => {
          router.push(`/orders?orderId=${data.order_id}`)
        }, 300)
      }
    }

    if (Platform.OS !== 'web') {
      // Caso 2 y 3: app venía de background o estaba cerrada
      Notifications.getLastNotificationResponseAsync().then(navigateToOrder)

      // Caso 1 y 2: listener activo mientras la app está corriendo
      notificationListener.current = Notifications.addNotificationResponseReceivedListener(navigateToOrder)
    }

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove()
      }
    }
  }, [router])

  if (!fontsLoaded && !fontError) return null

  return (
    <SafeAreaProvider>
      <CartProvider>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
          <BottomNavBar />
        </View>
      </CartProvider>
    </SafeAreaProvider>
  )
}