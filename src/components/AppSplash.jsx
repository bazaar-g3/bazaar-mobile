import { useMemo } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import Logo from './Logo'
import { useTheme } from '../theme/ThemeContext'

/**
 * Pantalla de carga inicial: muestra el logo de Bazaar centrado sobre la
 * superficie del theme con un indicador de actividad. Se renderiza desde el
 * layout raíz mientras la app termina de inicializar (ver _layout.jsx).
 * El logo no es presionable acá para que no navegue durante la carga.
 *
 * @param {(event: import('react-native').LayoutChangeEvent) => void} [props.onLayout]
 *   Callback que se dispara cuando el contenedor ya está pintado. El layout raíz
 *   lo usa para ocultar el splash nativo recién cuando esta vista es visible,
 *   evitando el parpadeo blanco en la transición.
 */
export default function AppSplash({ onLayout }) {
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  return (
    <View style={styles.container} onLayout={onLayout}>
      <Logo size={72} textSize={40} pressable={false} />
      <ActivityIndicator size="small" color={theme.color.accent} />
    </View>
  )
}

const makeStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.color.surface,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.space.xxl,
    },
  })
