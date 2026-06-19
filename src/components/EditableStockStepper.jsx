import { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '../theme/ThemeContext'
import { SPACING, FONT } from '../constants/theme'

export default function EditableStockStepper({ value, onChange, min = 0 }) {
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

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

const makeStyles = (theme) => StyleSheet.create({
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
    borderColor: theme.color.border,
    backgroundColor: theme.color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },

  buttonDisabled: {
    borderColor: theme.color.border,
    backgroundColor: theme.color.surfaceSubtle,
  },

  buttonText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.color.textSecondary,
    lineHeight: 12,
  },

  buttonTextDisabled: {
    color: theme.color.textMuted,
  },

  value: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 13,
    color: theme.color.textSecondary,
    fontWeight: '600',
  },
})