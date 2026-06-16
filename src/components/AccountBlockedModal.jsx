import { useMemo } from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../theme/ThemeContext'

/**
 * Modal de cuenta suspendida que se muestra cuando un usuario bloqueado
 * intenta iniciar sesión en la plataforma Bazaar.
 *
 * Presenta un mensaje claro con ícono de advertencia, explicación del estado
 * y una acción para cerrar el modal. El modal es permanente (no se descarta
 * tocando fuera) para asegurarse de que el usuario lea el mensaje.
 *
 * @param {{ visible: boolean, onClose: () => void }} props
 * @param {boolean} props.visible - Controla si el modal está visible.
 * @param {() => void} props.onClose - Callback invocado al presionar "Entendido".
 * @returns {JSX.Element} Modal de cuenta suspendida.
 */
export default function AccountBlockedModal({ visible, onClose }) {
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Ícono */}
          <View style={styles.iconContainer}>
            <Ionicons name="ban" size={48} color={theme.color.error} />
          </View>

          {/* Título */}
          <Text style={styles.title}>Cuenta suspendida</Text>

          {/* Cuerpo */}
          <Text style={styles.body}>
            Tu cuenta ha sido suspendida por incumplimiento de nuestras políticas de uso.
          </Text>
          <Text style={styles.bodySecondary}>
            Si creés que esto es un error, contactate con nuestro equipo de soporte a través de: bazaar.recuperaciones@gmail.com
          </Text>

          {/* Botón */}
          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const makeStyles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.color.surface,
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 36,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.color.textPrimary,
    textAlign: 'center',
    marginBottom: 14,
  },
  body: {
    fontSize: 15,
    color: theme.color.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 10,
  },
  bodySecondary: {
    fontSize: 13,
    color: theme.color.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: theme.color.error,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: theme.color.onAccent,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
})
