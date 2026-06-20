import React, { useEffect, useMemo, useRef } from 'react'
import { Animated, StyleSheet, Text } from 'react-native'
import { useTheme } from '../theme/ThemeContext'
import { useCartContext } from '../context/CartContext'
import { useReduceMotion } from '../utils/useReduceMotion'

/**
 * Badge del contador del carrito.
 *
 * Se suscribe al conteo del CartContext (no recibe llamadas del botón: reacciona
 * al estado, manteniendo el desacople UI→estado). Cuando el conteo se INCREMENTA
 * hace un micro-bounce (escala 1→1.3→1, spring). No anima en el mount inicial ni
 * en decrementos, y respeta reduce-motion.
 *
 * No renderiza nada cuando el conteo es 0.
 */
export default function CartBadge() {
  const { count } = useCartContext()
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])
  const reduceMotion = useReduceMotion()

  const scale = useRef(new Animated.Value(1)).current
  const prevCount = useRef(count)

  useEffect(() => {
    const increased = count > prevCount.current
    prevCount.current = count

    if (!increased || reduceMotion) return

    scale.setValue(1)
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.3, useNativeDriver: true, speed: 20, bounciness: 12 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 12 }),
    ]).start()
  }, [count, reduceMotion, scale])

  if (count <= 0) return null

  return (
    <Animated.View
      style={[styles.badge, { transform: [{ scale }] }]}
      accessibilityLabel={`${count} ítems en el carrito`}
    >
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </Animated.View>
  )
}

const makeStyles = (theme) =>
  StyleSheet.create({
    badge: {
      position: 'absolute',
      top: -4,
      right: -8,
      backgroundColor: theme.color.notification,
      borderRadius: theme.radius.pill,
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
  })
