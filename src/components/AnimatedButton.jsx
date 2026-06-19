import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../theme/ThemeContext'
import { useReduceMotion } from '../utils/useReduceMotion'

/**
 * Botón animado reutilizable (primitivo compartido).
 *
 * Animaciones:
 *  - Press feedback (siempre): escala 1→0.96 + opacidad 1→0.9 al tocar, spring de vuelta.
 *  - Loading (automático): si `onPress` devuelve una promesa, muestra un spinner y queda
 *    no-interactivo hasta que resuelve/rechaza (idle→loading→success/idle).
 *  - Confirmación de éxito (opt-in vía `showSuccess`): si `onPress` resuelve OK, el
 *    contenido (ícono + label) hace cross-fade hacia un check ✓ con un pop de escala,
 *    se mantiene `successDurationMs` y revierte a idle. Si `onPress` rechaza, vuelve a
 *    idle sin mostrar éxito (el manejo de error existente se encarga del feedback).
 *
 * Respeta reduce-motion: con movimiento reducido los cambios de estado son instantáneos
 * (el check aparece sin pop ni spring).
 *
 * @param {object} props
 * @param {string} props.label                 Texto del botón. Siempre se usa como accessibilityLabel.
 * @param {() => (void | Promise<any>)} props.onPress  Handler; puede ser async.
 * @param {'cta'|'wishlist'|'secondary'} [props.variant='cta']  CTA→teal, wishlist→coral, secondary→superficie.
 * @param {React.ReactNode} [props.icon]        Ícono opcional a la izquierda del label.
 * @param {boolean} [props.showSuccess=false]   Si true, morphea a check al resolver.
 * @param {number} [props.successDurationMs=1100]  Cuánto se mantiene el estado de éxito.
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.compact=false]       Render ícono-solo (cuadrado); `label` queda solo para a11y.
 * @param {string} [props.testID]
 */
export default function AnimatedButton({
  label,
  onPress,
  variant = 'cta',
  icon,
  showSuccess = false,
  successDurationMs = 1100,
  disabled = false,
  compact = false,
  testID,
}) {
  const { theme } = useTheme()
  const s = useMemo(() => makeStyles(theme), [theme])
  const reduceMotion = useReduceMotion()

  const [state, setState] = useState('idle') // 'idle' | 'loading' | 'success'

  const scale = useRef(new Animated.Value(1)).current
  const opacity = useRef(new Animated.Value(1)).current
  const contentOpacity = useRef(new Animated.Value(1)).current
  const checkOpacity = useRef(new Animated.Value(0)).current

  const successTimer = useRef(null)
  const mounted = useRef(true)
  useEffect(() => () => {
    mounted.current = false
    if (successTimer.current) clearTimeout(successTimer.current)
  }, [])

  const isLoading = state === 'loading'
  const isBusy = state !== 'idle' // loading o success → no-interactivo
  const isDisabled = disabled || isBusy

  const pressIn = () => {
    if (reduceMotion || isDisabled) return
    Animated.parallel([
      Animated.timing(scale, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.9, duration: 100, useNativeDriver: true }),
    ]).start()
  }

  const pressOut = () => {
    if (reduceMotion) return
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(opacity, { toValue: 1, useNativeDriver: true }),
    ]).start()
  }

  const exitSuccess = () => {
    if (reduceMotion) {
      checkOpacity.setValue(0)
      contentOpacity.setValue(1)
      if (mounted.current) setState('idle')
      return
    }
    Animated.parallel([
      Animated.timing(checkOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start(() => { if (mounted.current) setState('idle') })
  }

  const enterSuccess = () => {
    setState('success')
    // Haptic de éxito (expo-haptics ya es dependencia; si fallara, se ignora)
    Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType.Success).catch?.(() => {})

    if (reduceMotion) {
      contentOpacity.setValue(0)
      checkOpacity.setValue(1)
    } else {
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(checkOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.08, duration: 120, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
        ]),
      ]).start()
    }
    successTimer.current = setTimeout(() => exitSuccess(), successDurationMs)
  }

  const enterLoading = () => {
    setState('loading')
    contentOpacity.setValue(0) // el spinner reemplaza al contenido
  }

  const exitLoading = () => {
    contentOpacity.setValue(1)
    setState('idle')
  }

  const handlePress = async () => {
    if (isDisabled) return

    let result
    try {
      result = onPress?.()
    } catch {
      return // onPress síncrono lanzó: nada que animar (el error UI se encarga)
    }

    const isPromise = result && typeof result.then === 'function'

    if (isPromise) {
      // Acción async: mostramos spinner hasta resolver/rechazar
      enterLoading()
      try {
        await result
        if (!mounted.current) return
        if (showSuccess) enterSuccess()
        else exitLoading()
      } catch {
        // Rechazo: volvemos a idle sin success. El manejo de error existente
        // (alert/toast) ya muestra el feedback; no lo duplicamos acá.
        if (mounted.current) exitLoading()
      }
    } else if (showSuccess) {
      enterSuccess()
    }
  }

  const variantStyle =
    variant === 'wishlist' ? s.wishlist : variant === 'secondary' ? s.secondary : s.cta
  // onAccent (blanco) sobre teal/coral es el par de CTA ya usado en toda la app.
  const textColor = variant === 'secondary' ? theme.color.textPrimary : theme.color.onAccent

  return (
    <Animated.View
      style={[
        compact ? s.wrapCompact : s.wrapFull,
        { transform: [{ scale }], opacity },
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={isDisabled}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled, busy: isBusy }}
        style={[
          s.base,
          compact ? s.compact : s.full,
          variantStyle,
          disabled && s.disabled,
        ]}
      >
        <Animated.View style={[s.content, { opacity: contentOpacity }]} pointerEvents="none">
          {icon ? <View style={s.iconWrap}>{icon}</View> : null}
          {!compact && label ? (
            <Text style={[s.label, { color: textColor }]} numberOfLines={1}>
              {label}
            </Text>
          ) : null}
        </Animated.View>

        <Animated.View
          style={[s.checkOverlay, { opacity: checkOpacity }]}
          pointerEvents="none"
          testID={testID ? `${testID}-success` : undefined}
        >
          <Ionicons name="checkmark" size={compact ? 20 : 22} color={textColor} />
        </Animated.View>

        {isLoading ? (
          <View
            style={s.checkOverlay}
            pointerEvents="none"
            testID={testID ? `${testID}-loading` : undefined}
          >
            <ActivityIndicator size="small" color={textColor} />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  )
}

const makeStyles = (theme) =>
  StyleSheet.create({
    wrapFull: { alignSelf: 'stretch' },
    wrapCompact: { alignSelf: 'flex-start' },

    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    full: {
      minHeight: theme.button.minHeight,
      paddingHorizontal: theme.space.lg,
      paddingVertical: theme.space.md,
      borderRadius: theme.radius.md,
    },
    compact: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.pill,
    },

    cta: { backgroundColor: theme.color.accent },
    wishlist: { backgroundColor: theme.color.like },
    secondary: {
      backgroundColor: theme.color.surfaceSubtle,
      borderWidth: 1,
      borderColor: theme.color.border,
    },
    disabled: { backgroundColor: theme.color.textMuted },

    content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.space.sm,
    },
    iconWrap: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontSize: theme.type.label.size,
      fontWeight: '800',
      letterSpacing: 0.3,
    },

    checkOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
  })
