import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useMemo } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../theme/ThemeContext'

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
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

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
                  <Ionicons name="backspace-outline" size={26} color={disabled ? theme.color.textMuted : theme.color.accent} />
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

const makeStyles = (theme) => StyleSheet.create({
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
    backgroundColor: theme.color.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.color.border,
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
    color: theme.color.accent,
  },
  digitDisabled: {
    color: theme.color.textMuted,
  },
})
