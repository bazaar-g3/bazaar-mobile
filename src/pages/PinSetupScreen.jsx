import { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { enablePinForAccount, isPinSetOnDevice, verifyPin } from '../services/pin'
import { useTheme } from '../theme/ThemeContext'
import Logo from '../components/Logo'
import PinPad from '../components/PinPad'
import { makeStyles } from '../styles/pinSetupStyles'

const MIN_PIN_LENGTH = 6
const STEP_ENTER = 'enter'
const STEP_CONFIRM = 'confirm'
const STEP_VERIFY_EXISTING = 'verify_existing'

export default function PinSetupScreen() {
  const { theme } = useTheme()
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

  const styles = useMemo(() => makeStyles(theme), [theme])

  const pinDots = Array.from({ length: MIN_PIN_LENGTH }).map((_, i) => i < currentPin.length)
  const isStepEnter = step === STEP_ENTER
  const isStepConfirm = step === STEP_CONFIRM
  const isStepVerifyExisting = step === STEP_VERIFY_EXISTING
  const canAdvance = currentPin.length >= MIN_PIN_LENGTH

  if (devicePinExists === null) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={theme.color.accent} />
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
              <ActivityIndicator color={theme.color.onAccent} />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>
                  {isStepVerifyExisting ? 'VINCULAR' :
                   isStepEnter ? 'CONTINUAR' : 'CONFIRMAR'}
                </Text>
                <Ionicons
                  name={isStepEnter ? 'arrow-forward' : 'checkmark'}
                  size={18}
                  color={theme.color.onAccent}
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
