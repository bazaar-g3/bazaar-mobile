import { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../theme/ThemeContext'

const REQUIREMENTS = [
  { key: 'length',    label: 'Al menos 8 caracteres',    test: (p) => p.length >= 8 },
  { key: 'uppercase', label: 'Al menos una mayúscula',   test: (p) => /[A-Z]/.test(p) },
  { key: 'lowercase', label: 'Al menos una minúscula',   test: (p) => /[a-z]/.test(p) },
  { key: 'number',    label: 'Al menos un número',       test: (p) => /[0-9]/.test(p) },
]

function getStrength(password) {
  if (!password) return 0
  return REQUIREMENTS.reduce((score, req) => score + (req.test(password) ? 1 : 0), 0)
}

const STRENGTH_CONFIG = [
  null,
  { label: 'Muy débil', color: '#C62828', bars: 1 },
  { label: 'Débil',     color: '#E64A19', bars: 2 },
  { label: 'Media',     color: '#F9A825', bars: 3 },
  { label: 'Fuerte',    color: '#117a37', bars: 4 },
]

export default function PasswordStrengthMeter({ password }) {
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])
  const strength = getStrength(password)
  const config = password.length > 0 ? STRENGTH_CONFIG[strength] : null

  return (
    <View style={styles.container}>
      {/* Barra de progreso */}
      <View style={styles.barsRow}>
        {[1, 2, 3, 4].map((level) => (
          <View
            key={level}
            style={[
              styles.bar,
              config && level <= config.bars
                ? { backgroundColor: config.color }
                : styles.barInactive,
            ]}
          />
        ))}
        {config && (
          <Text style={[styles.strengthLabel, { color: config.color }]}>
            {config.label}
          </Text>
        )}
      </View>

      {/* Lista de requisitos */}
      <View style={styles.requirementsList}>
        {REQUIREMENTS.map((req) => {
          const met = req.test(password)
          return (
            <View key={req.key} style={styles.requirementRow}>
              <Ionicons
                name={met ? 'checkmark-circle' : 'ellipse-outline'}
                size={14}
                color={met ? theme.color.success : theme.color.textMuted}
                style={styles.requirementIcon}
              />
              <Text
                style={[
                  styles.requirementText,
                  met ? styles.requirementMet : styles.requirementPending,
                ]}
              >
                {req.label}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

const makeStyles = (theme) => StyleSheet.create({
  container: {
    marginTop: 6,
    marginBottom: 4,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  bar: {
    flex: 1,
    height: 5,
    borderRadius: 4,
  },
  barInactive: {
    backgroundColor: '#DDE0E3',
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    minWidth: 70,
  },
  requirementsList: {
    gap: 4,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementIcon: {
    marginRight: 6,
  },
  requirementText: {
    fontSize: 12,
  },
  requirementMet: {
    color: theme.color.success,
  },
  requirementPending: {
    color: theme.color.textMuted,
  },
})
