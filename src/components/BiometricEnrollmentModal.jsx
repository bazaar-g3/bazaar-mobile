import { useMemo } from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../theme/ThemeContext'

/**
 * Modal que aparece tras un login exitoso con email/contraseña para invitar al usuario
 * a activar el acceso biométrico (CA1 de la historia de login biométrico).
 *
 * @param {boolean} visible - Controla si el modal es visible.
 * @param {Function} onEnable - Callback cuando el usuario acepta activar la biométrica.
 * @param {Function} onSkip - Callback cuando el usuario elige no activarla ahora.
 */
export default function BiometricEnrollmentModal({ visible, onEnable, onSkip }) {
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Ionicons name="finger-print" size={52} color={theme.color.accent} style={styles.icon} />
          <Text style={styles.title}>Activar login biométrico</Text>
          <Text style={styles.description}>
            ¿Querés habilitar el acceso rápido con huella dactilar o reconocimiento facial para la próxima vez?
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={onEnable}>
            <Text style={styles.primaryButtonText}>Sí, activar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onSkip}>
            <Text style={styles.secondaryButtonText}>Ahora no</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const makeStyles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.color.surface,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.color.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: theme.color.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: theme.color.accent,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: theme.color.onAccent,
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.color.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
})
