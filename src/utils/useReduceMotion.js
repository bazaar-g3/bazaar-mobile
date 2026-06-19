import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

/**
 * Hook que expone si el usuario activó "reducir movimiento" en el SO.
 * Se usa para omitir animaciones (springs/bounces) por accesibilidad.
 * Implementado sobre AccessibilityInfo porque este repo no usa Reanimated.
 *
 * @returns {boolean} true si reduce-motion está activo.
 */
export function useReduceMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    let mounted = true
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => { if (mounted) setReduced(Boolean(value)) })
      .catch(() => {})
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) =>
      setReduced(Boolean(value))
    )
    return () => {
      mounted = false
      sub?.remove?.()
    }
  }, [])

  return reduced
}
