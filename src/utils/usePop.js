import { useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import { useReduceMotion } from './useReduceMotion'

/**
 * Devuelve un Animated.Value de escala que hace un "pop" (1→peak→1, spring) cada vez
 * que `value` cambia — no en el mount inicial. Respeta reduce-motion (sin pop).
 * Pensado para envolver un nodo en <Animated.View style={{ transform: [{ scale }] }}>.
 *
 * @param {*} value          Valor a observar; el pop se dispara cuando cambia.
 * @param {{peak?: number}} [opts]  `peak` es la escala máxima del pop (default 1.3).
 * @returns {Animated.Value} escala animada.
 */
export function usePop(value, { peak = 1.3 } = {}) {
  const reduceMotion = useReduceMotion()
  const scale = useRef(new Animated.Value(1)).current
  const prev = useRef(value)

  useEffect(() => {
    const changed = value !== prev.current
    prev.current = value
    if (!changed || reduceMotion) return

    scale.setValue(1)
    Animated.sequence([
      Animated.spring(scale, { toValue: peak, useNativeDriver: true, speed: 20, bounciness: 12 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 12 }),
    ]).start()
  }, [value, reduceMotion, scale, peak])

  return scale
}
