import { useState, useEffect } from 'react'
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
import { enablePinForAccount, isPinSetOnDevice, verifyPin } from '../services/pin'
import { COLORS } from '../constants/colors'
import Logo from '../components/Logo'
import PinPad from '../components/PinPad'

const MIN_PIN_LENGTH = 6
const STEP_ENTER = 'enter'
const STEP_CONFIRM = 'confirm'
const STEP_VERIFY_EXISTING = 'verify_existing'

export default function PinSetupScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()

  // null = cargando, true/false = resultado
  const [devicePinExists, setDevicePinExists] = useState(null)

  const [step, setStep] = useState(STEP_ENTER)
  const [firstPin, setFirstPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [verifyPin_, setVerifyPin_] = useState('')  // para el modo "vincular al PIN existente"
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function checkDevicePin() {
      const exists = await isPinSetOnDevice()
      setDevicePinExists(exists)
      if (exists) setStep(STEP_VERIFY_EXISTING)
    }
    checkDevicePin()
  }, [])

  // Pin que se muestra en los dots según el paso actual
  const currentPin =
    step === STEP_ENTER ? firstPin :
    step === STEP_CONFIRM ? confirmPin :
    verifyPin_

  function handleDigit(d) {
    if (currentPin.length >= MIN_PIN_LENGTH) return
    setError('')
    if (step === STEP_ENTER) setFirstPin(prev => prev + d)
    else if (step === STEP_CONFIRM) setConfirmPin(prev => prev + d)
    else setVerifyPin_(prev => prev + d)
  }

  function handleDelete() {
    setError('')
    if (step === STEP_ENTER) setFirstPin(prev => prev.slice(0, -1))
    else if (step === STEP_CONFIRM) setConfirmPin(prev => prev.slice(0, -1))
    else setVerifyPin_(prev => prev.slice(0, -1))
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
    await savePin(firstPin)
  }

  async function handleVerifyExisting() {
    if (verifyPin_.length < MIN_PIN_LENGTH) {
      setError(`El PIN debe tener al menos ${MIN_PIN_LENGTH} dígitos`)
      return
    }
    setSaving(true)
    try {
      const correct = await verifyPin(verifyPin_)
      if (!correct) {
        setError('PIN incorrecto. Verificá e intentá nuevamente.')
        setVerifyPin_('')
        return
      }
      await savePin(verifyPin_)
    } finally {
      setSaving(false)
    }
  }

  async function savePin(pin) {
    setSaving(true)
    try {
      const refreshToken =
        params.refreshToken ?? (await AsyncStorage.getItem('refreshToken'))
      const email = params.email ?? null
      const name = params.name ?? params.email ?? 'Usuario'
      const avatarUrl = params.avatarUrl ?? null
      await enablePinForAccount(pin, email, name, avatarUrl, refreshToken)

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
  const isStepConfirm = step === STEP_CONFIRM
  const isStepVerifyExisting = step === STEP_VERIFY_EXISTING
  const canAdvance = currentPin.length >= MIN_PIN_LENGTH

  if (devicePinExists === null) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.primaryLight} />
      </View>
    )
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.screen}>
        <Logo />

        <View style={styles.card}>
          <Text style={styles.title}>
            {isStepVerifyExisting ? 'VINCULAR AL PIN' :
             isStepEnter ? 'CONFIGURAR PIN' : 'CONFIRMAR PIN'}
          </Text>
          <Text style={styles.subtitle}>
            {isStepVerifyExisting
              ? 'Este dispositivo ya tiene un PIN. Ingresalo para vincular tu cuenta también.'
              : isStepEnter
              ? `Ingresá un PIN de al menos ${MIN_PIN_LENGTH} dígitos`
              : 'Ingresá el mismo PIN para confirmar'}
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.dotsRow}>
            {pinDots.map((filled, i) => (
              <View key={i} style={[styles.dot, filled && styles.dotFilled]} />
            ))}
          </View>

          <PinPad onDigit={handleDigit} onDelete={handleDelete} disabled={saving} />

          <TouchableOpacity
            style={[styles.button, (!canAdvance || saving) && styles.buttonDisabled]}
            onPress={
              isStepVerifyExisting ? handleVerifyExisting :
              isStepEnter ? handleContinue : handleConfirm
            }
            disabled={!canAdvance || saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>
                  {isStepVerifyExisting ? 'VINCULAR' :
                   isStepEnter ? 'CONTINUAR' : 'CONFIRMAR'}
                </Text>
                <Ionicons
                  name={isStepEnter ? 'arrow-forward' : 'checkmark'}
                  size={18}
                  color={COLORS.white}
                />
              </View>
            )}
          </TouchableOpacity>

          {/* Siempre ocupa el mismo espacio; invisible en los pasos que no lo necesitan */}
          <TouchableOpacity
            style={[styles.backButton, !isStepConfirm && styles.invisible]}
            onPress={() => { setStep(STEP_ENTER); setConfirmPin(''); setError('') }}
            disabled={!isStepConfirm}
          >
            <Text style={styles.backButtonText}>← Volver a ingresar PIN</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={() => router.back()}>
            <Text style={styles.skipButtonText}>Configurar más tarde</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
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
    lineHeight: 20,
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
  invisible: {
    opacity: 0,
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
