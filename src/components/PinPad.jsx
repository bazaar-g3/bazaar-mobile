import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../constants/colors'

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  [null, '0', 'del'],
]

/**
 * Teclado numérico visual estilo lockscreen para ingreso de PIN.
 *
 * @param {Function} onDigit - Callback invocado con el dígito pulsado (string).
 * @param {Function} onDelete - Callback invocado al presionar borrar.
 * @param {boolean} [disabled] - Deshabilita todos los botones cuando es true.
 */
export default function PinPad({ onDigit, onDelete, disabled = false }) {
  return (
    <View style={styles.container}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key, colIndex) => {
            if (key === null) return <View key={colIndex} style={styles.emptyCell} />

            const isDel = key === 'del'
            return (
              <TouchableOpacity
                key={colIndex}
                style={[styles.button, disabled && styles.buttonDisabled]}
                onPress={() => (isDel ? onDelete() : onDigit(key))}
                disabled={disabled}
                activeOpacity={0.7}
              >
                {isDel ? (
                  <Ionicons name="backspace-outline" size={26} color={disabled ? COLORS.textMuted : COLORS.primary} />
                ) : (
                  <Text style={[styles.digit, disabled && styles.digitDisabled]}>{key}</Text>
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 20,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  emptyCell: {
    width: 70,
    height: 70,
  },
  digit: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.primary,
  },
  digitDisabled: {
    color: COLORS.textMuted,
  },
})
