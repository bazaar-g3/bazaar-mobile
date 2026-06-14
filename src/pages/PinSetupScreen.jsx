import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { enablePin } from '../services/pin'
import { COLORS } from '../constants/colors'
import Logo from '../components/Logo'
import PinPad from '../components/PinPad'

const MIN_PIN_LENGTH = 6
const MAX_PIN_LENGTH = 8
const STEP_ENTER = 'enter'
const STEP_CONFIRM = 'confirm'

export default function PinSetupScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()

  const [step, setStep] = useState(STEP_ENTER)
  const [firstPin, setFirstPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const currentPin = step === STEP_ENTER ? firstPin : confirmPin
  const setCurrentPin = step === STEP_ENTER ? setFirstPin : setConfirmPin

  function handleDigit(d) {
    if (currentPin.length >= MAX_PIN_LENGTH) return
    setCurrentPin(prev => prev + d)
    setError('')
  }

  function handleDelete() {
    setCurrentPin(prev => prev.slice(0, -1))
    setError('')
  }

  function handleContinue() {
    if (firstPin.length < MIN_PIN_LENGTH) {
      setError(`El PIN debe tener al menos ${MIN_PIN_LENGTH} dígitos`)
      return
    }
    setError('')
    setStep(STEP_CONFIRM)
  }

  async function handleConfirm() {
    if (confirmPin.length < MIN_PIN_LENGTH) {
      setError(`El PIN debe tener al menos ${MIN_PIN_LENGTH} dígitos`)
      return
    }
    if (firstPin !== confirmPin) {
      setError('Los PINs no coinciden. Intentá de nuevo.')
      setFirstPin('')
      setConfirmPin('')
      setStep(STEP_ENTER)
      return
    }

    setSaving(true)
    try {
      const refreshToken =
        params.refreshToken ?? (await AsyncStorage.getItem('refreshToken'))
      await enablePin(firstPin, refreshToken)

      const redirectPath = params.redirectPath
      if (redirectPath) {
        router.replace(redirectPath)
      } else {
        router.back()
      }
    } catch {
      setError('No se pudo guardar el PIN. Intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const pinDots = Array.from({ length: MIN_PIN_LENGTH }).map((_, i) => i < currentPin.length)
  const isStepEnter = step === STEP_ENTER
  const canAdvance = currentPin.length >= MIN_PIN_LENGTH

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.screen}>
        <Logo />

        <View style={styles.card}>
          <Text style={styles.title}>
            {isStepEnter ? 'CONFIGURAR PIN' : 'CONFIRMAR PIN'}
          </Text>
          <Text style={styles.subtitle}>
            {isStepEnter
              ? `Ingresá un PIN de al menos ${MIN_PIN_LENGTH} dígitos`
              : 'Ingresá el mismo PIN para confirmar'}
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Indicadores de dígitos */}
          <View style={styles.dotsRow}>
            {pinDots.map((filled, i) => (
              <View key={i} style={[styles.dot, filled && styles.dotFilled]} />
            ))}
          </View>

          <PinPad onDigit={handleDigit} onDelete={handleDelete} disabled={saving} />

          <TouchableOpacity
            style={[styles.button, (!canAdvance || saving) && styles.buttonDisabled]}
            onPress={isStepEnter ? handleContinue : handleConfirm}
            disabled={!canAdvance || saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>
                  {isStepEnter ? 'CONTINUAR' : 'CONFIRMAR'}
                </Text>
                <Ionicons
                  name={isStepEnter ? 'arrow-forward' : 'checkmark'}
                  size={18}
                  color={COLORS.white}
                />
              </View>
            )}
          </TouchableOpacity>

          {!isStepEnter && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => { setStep(STEP_ENTER); setConfirmPin(''); setError('') }}
            >
              <Text style={styles.backButtonText}>← Volver a ingresar PIN</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.skipButton} onPress={() => router.back()}>
            <Text style={styles.skipButtonText}>Configurar más tarde</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  error: {
    color: COLORS.error,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 24,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: COLORS.primary,
  },
  button: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  backButton: {
    marginBottom: 4,
    paddingVertical: 8,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 10,
  },
  skipButtonText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
})
