import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useMemo } from 'react'
import { usePathname, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../theme/ThemeContext'
import { buildLoginRedirect } from '../utils/authRedirect'
import { useCartContext } from '../context/CartContext'

const TABS = [
  { label: 'Inicio', icon: 'home-outline', activeIcon: 'home', path: '/home' },
  { label: 'Carrito', icon: 'cart-outline', activeIcon: 'cart', path: '/cart', requiresAuth: true },
  { label: 'Mis órdenes', icon: 'receipt-outline', activeIcon: 'receipt', path: '/orders', requiresAuth: true },
  { label: 'Perfil', icon: 'person-outline', activeIcon: 'person', path: '/profile', requiresAuth: true },
]

export default function BottomNavBar() {
  const router = useRouter()
  const pathname = usePathname()
  const { count } = useCartContext()
  const insets = useSafeAreaInsets()
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

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
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
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
                color={isActive ? theme.color.accent : theme.color.textMuted}
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

const makeStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.color.surface,
    borderTopWidth: 1,
    borderTopColor: theme.color.border,
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
    borderRadius: 100,
    paddingHorizontal: 18,
    paddingVertical: 7,
    backgroundColor: theme.color.accentSubtle,
  },
  iconWrapperActive: {
    backgroundColor: theme.color.accent,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: theme.color.notification,
    borderRadius: 999,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: theme.color.surface,
    fontSize: 10,
    fontWeight: '800',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.color.textMuted,
  },
  labelActive: {
    color: theme.color.accent,
    fontWeight: '800',
  },
})
