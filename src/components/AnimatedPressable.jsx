import React, { useRef } from 'react'
import { Animated, Pressable } from 'react-native'
import { useReduceMotion } from '../utils/useReduceMotion'

// Pressable animado: el transform se aplica sobre el propio Pressable (no sobre un
// View extra), para no alterar el layout del consumidor (ej. tabs con flex:1).
const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable)

/**
 * Pressable con micro-feedback de escala al tocar (press-in baja a `scaleTo`,
 * press-out vuelve a 1 con spring). Para chips, tabs y toques chicos donde no
 * aplica el AnimatedButton (CTA con label/success). Reenvía todas las props de
 * Pressable (incluido `style`, que conserva su `flex`/layout) y respeta reduce-motion.
 *
 * @param {number} [props.scaleTo=0.9]  Escala mínima durante el press.
 */
export default function AnimatedPressable({
  style,
  onPressIn,
  onPressOut,
  scaleTo = 0.9,
  children,
  ...rest
}) {
  const reduceMotion = useReduceMotion()
  const scale = useRef(new Animated.Value(1)).current

  const handlePressIn = (e) => {
    if (!reduceMotion) {
      Animated.spring(scale, { toValue: scaleTo, useNativeDriver: true, speed: 50, bounciness: 0 }).start()
    }
    onPressIn?.(e)
  }
  const handlePressOut = (e) => {
    if (!reduceMotion) {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 24, bounciness: 10 }).start()
    }
    onPressOut?.(e)
  }

  // `style` puede ser objeto, array o función (API de Pressable). Lo normalizamos
  // a un array y le sumamos el transform al final.
  const composedStyle =
    typeof style === 'function'
      ? (state) => [style(state), { transform: [{ scale }] }]
      : [style, { transform: [{ scale }] }]

  return (
    <AnimatedPressableBase
      style={composedStyle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...rest}
    >
      {children}
    </AnimatedPressableBase>
  )
}
