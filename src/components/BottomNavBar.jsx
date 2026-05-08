import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { usePathname, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { COLORS } from '../constants/colors'
import { buildLoginRedirect } from '../utils/authRedirect'
import { useCartContext } from '../context/CartContext'

const TABS = [
  { label: 'Inicio',      icon: 'home-outline',    activeIcon: 'home',    path: '/home' },
  { label: 'Carrito',     icon: 'cart-outline',    activeIcon: 'cart',    path: '/cart',   requiresAuth: true },
  { label: 'Mis órdenes', icon: 'receipt-outline', activeIcon: 'receipt', path: '/orders', requiresAuth: true },
  { label: 'Perfil',      icon: 'person-outline',  activeIcon: 'person',  path: '/profile', requiresAuth: true },
]

export default function BottomNavBar() {
  const router = useRouter()
  const pathname = usePathname()
  const { count } = useCartContext()

  const HIDDEN_ON = ['/login', '/register', '/forgot-password', '/reset-password', '/checkout']
  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null

  async function handlePress(tab) {
    if (tab.requiresAuth) {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        router.push(buildLoginRedirect({ redirectPath: tab.path }))
        return
      }
    }
    router.push(tab.path)
  }

  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = pathname === tab.path || pathname.startsWith(tab.path + '/')
        const iconName = isActive ? tab.activeIcon : tab.icon
        const isCart = tab.path === '/cart'

        return (
          <TouchableOpacity
            key={tab.path}
            style={styles.tab}
            onPress={() => handlePress(tab)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              <Ionicons
                name={iconName}
                size={26}
                color={isActive ? COLORS.primary : COLORS.textMuted}
              />
              {isCart && count > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {count > 99 ? '99+' : count}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingBottom: 20,
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.third,
    borderRadius: 999,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
})
