import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { COLORS } from '../constants/colors'
import { SPACING, FONT } from '../constants/theme'

export default function EditableStockStepper({ value, onChange, min = 0 }) {
  function handleDecrease() {
    if (value <= min) return
    onChange?.(value - 1)
  }

  function handleIncrease() {
    onChange?.(value + 1)
  }

  const disableDecrease = value <= min

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, disableDecrease && styles.buttonDisabled]}
        onPress={handleDecrease}
        disabled={disableDecrease}
      >
        <Text style={[styles.buttonText, disableDecrease && styles.buttonTextDisabled]}>
          −
        </Text>
      </TouchableOpacity>

      <Text style={styles.value}>{value}</Text>

      <TouchableOpacity style={styles.button} onPress={handleIncrease}>
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  button: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },

  buttonDisabled: {
    borderColor: COLORS.divider,
    backgroundColor: COLORS.background,
  },

  buttonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
    lineHeight: 12,
  },

  buttonTextDisabled: {
    color: COLORS.textMuted,
  },

  value: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
})