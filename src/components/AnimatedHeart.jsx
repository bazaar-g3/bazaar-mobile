import React, { useEffect, useRef, useState } from 'react'
import { Animated, Platform, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../theme/ThemeContext'
import { useReduceMotion } from '../utils/useReduceMotion'

/**
 * Botón de wishlist (corazón) con "like-pop".
 *
 * Al pasar a favorito hace un pop de escala (1→1.25→1, spring) y cambia a corazón
 * lleno (coral del theme); al quitar, vuelve a outline sin pop. Es optimista: togglea
 * el estado visual al instante y avisa al padre con el nuevo valor. Respeta reduce-motion
 * (sin pop) y dispara un haptic liviano en iOS.
 *
 * @param {object} props
 * @param {boolean} props.liked         Estado actual (controlado por el padre).
 * @param {(next: boolean) => void} props.onToggle  Avisa el nuevo valor al tocar.
 * @param {number} [props.size=20]      Tamaño del ícono.
 * @param {object} [props.style]        Estilo del Pressable contenedor.
 * @param {object} [props.hitSlop]
 * @param {string} [props.inactiveColor]  Color del corazón sin marcar (default textMuted).
 */
export default function AnimatedHeart({
  liked,
  onToggle,
  size = 20,
  style,
  hitSlop,
  inactiveColor,
}) {
  const { theme } = useTheme()
  const reduceMotion = useReduceMotion()
  const scale = useRef(new Animated.Value(1)).current

  const [internal, setInternal] = useState(Boolean(liked))
  useEffect(() => { setInternal(Boolean(liked)) }, [liked])

  const handlePress = () => {
    const next = !internal
    setInternal(next)

    if (next && !reduceMotion) {
      scale.setValue(1)
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.25, useNativeDriver: true, speed: 20, bounciness: 14 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 14 }),
      ]).start()
    }

    if (Platform.OS === 'ios') {
      Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Light).catch?.(() => {})
    }

    onToggle?.(next)
  }

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={hitSlop}
      style={style}
      accessibilityRole="button"
      accessibilityLabel={internal ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={internal ? 'heart' : 'heart-outline'}
          size={size}
          color={internal ? theme.color.like : inactiveColor || theme.color.textMuted}
        />
      </Animated.View>
    </Pressable>
  )
}
