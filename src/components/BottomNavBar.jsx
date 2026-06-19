import { Animated, View, Text, StyleSheet } from 'react-native'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../theme/ThemeContext'
import { useReduceMotion } from '../utils/useReduceMotion'
import { buildLoginRedirect } from '../utils/authRedirect'
import CartBadge from './CartBadge'
import AnimatedPressable from './AnimatedPressable'

const TABS = [
  { label: 'Inicio', icon: 'home-outline', activeIcon: 'home', path: '/home' },
  { label: 'Carrito', icon: 'cart-outline', activeIcon: 'cart', path: '/cart', requiresAuth: true },
  { label: 'Mis órdenes', icon: 'receipt-outline', activeIcon: 'receipt', path: '/orders', requiresAuth: true },
  { label: 'Perfil', icon: 'person-outline', activeIcon: 'person', path: '/profile', requiresAuth: true },
]

// Ancho del pill (resaltado) que se desliza detrás del ícono activo
const PILL_WIDTH = 56
const PILL_HEIGHT = 38

export default function BottomNavBar() {
  const router = useRouter()
  const pathname = usePathname()
  const insets = useSafeAreaInsets()
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])
  const reduceMotion = useReduceMotion()

  const activeIndex = TABS.findIndex(
    (t) => pathname === t.path || pathname.startsWith(t.path + '/')
  )

  const [tabWidth, setTabWidth] = useState(0)
  const pillX = useRef(new Animated.Value(0)).current
  const iconPop = useRef(new Animated.Value(1)).current
  const positioned = useRef(false)
  const prevIndex = useRef(activeIndex)

  // Desliza el pill al tab activo (la primera vez salta sin animar para no entrar desde el borde)
  useEffect(() => {
    if (tabWidth <= 0 || activeIndex < 0) return
    const target = activeIndex * tabWidth + (tabWidth - PILL_WIDTH) / 2
    if (!positioned.current || reduceMotion) {
      pillX.setValue(target)
      positioned.current = true
    } else {
      Animated.spring(pillX, { toValue: target, useNativeDriver: true, speed: 16, bounciness: 8 }).start()
    }
  }, [activeIndex, tabWidth, reduceMotion, pillX])

  // Pop del ícono que pasa a estar activo
  useEffect(() => {
    if (activeIndex === prevIndex.current) return
    prevIndex.current = activeIndex
    if (reduceMotion || activeIndex < 0) return
    iconPop.setValue(1)
    Animated.sequence([
      Animated.spring(iconPop, { toValue: 1.2, useNativeDriver: true, speed: 20, bounciness: 12 }),
      Animated.spring(iconPop, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 12 }),
    ]).start()
  }, [activeIndex, reduceMotion, iconPop])

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

  const pillVisible = activeIndex >= 0 && tabWidth > 0

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View
        style={styles.tabsRow}
        onLayout={(e) => setTabWidth(e.nativeEvent.layout.width / TABS.length)}
      >
        {pillVisible && (
          <Animated.View
            pointerEvents="none"
            style={[styles.pill, { transform: [{ translateX: pillX }] }]}
          />
        )}

        {TABS.map((tab, index) => {
          const isActive = index === activeIndex
          const iconName = isActive ? tab.activeIcon : tab.icon
          const isCart = tab.path === '/cart'

          return (
            <AnimatedPressable
              key={tab.path}
              style={styles.tab}
              onPress={() => handlePress(tab)}
            >
              <View style={styles.iconWrapper}>
                <Animated.View style={isActive ? { transform: [{ scale: iconPop }] } : null}>
                  <Ionicons
                    name={iconName}
                    size={26}
                    color={isActive ? theme.color.accent : theme.color.textMuted}
                  />
                </Animated.View>
                {isCart && <CartBadge />}
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
            </AnimatedPressable>
          )
        })}
      </View>
    </View>
  )
}

const makeStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.color.surface,
    borderTopWidth: 1,
    borderTopColor: theme.color.border,
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    position: 'relative',
  },
  // Pill que se desliza detrás del ícono activo
  pill: {
    position: 'absolute',
    left: 0,
    top: 1,
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    borderRadius: 100,
    backgroundColor: theme.color.accentTint,
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
