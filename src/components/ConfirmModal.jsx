import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { COLORS } from '../constants/colors'
import { FONT, SPACING } from '../constants/theme'
import { useResponsive } from '../utils/responsive'

export default function ConfirmModal({
  visible,
  title = 'Confirmar',
  message = '',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  destructive = false,
  onConfirm,
  onCancel,
}) {
  const { isSmall } = useResponsive()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            { padding: isSmall ? SPACING.md : SPACING.lg },
          ]}
        >
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={onCancel}
              style={[styles.button, styles.buttonCancel]}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonCancelText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              style={[
                styles.button,
                destructive ? styles.buttonDestructive : styles.buttonConfirm,
              ]}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonConfirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
  title: {
    fontSize: FONT.large,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: FONT.regular,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
    borderRadius: 10,
    minWidth: 110,
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.divider,
  },
  buttonCancelText: {
    color: COLORS.textPrimary,
    fontSize: FONT.regular,
    fontWeight: '700',
  },
  buttonConfirm: {
    backgroundColor: COLORS.primary,
  },
  buttonDestructive: {
    backgroundColor: COLORS.error,
  },
  buttonConfirmText: {
    color: COLORS.white,
    fontSize: FONT.regular,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
})