import { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import api from '../api/api'
import { verifyPin, disablePin } from '../services/pin'
import { COLORS } from '../constants/colors'
import PinPad from './PinPad'

const MODE_PIN = 'pin'
const MODE_PASSWORD = 'password'
const MAX_PIN_LENGTH = 8

/**
 * Modal de confirmación para desactivar el PIN.
 * El usuario debe verificar su identidad usando el PIN actual o su contraseña
 * de cuenta antes de poder desactivarlo.
 *
 * @param {boolean} visible - Controla la visibilidad del modal.
 * @param {string} userEmail - Email de la cuenta, necesario para verificar por contraseña.
 * @param {Function} onSuccess - Callback invocado tras desactivar el PIN correctamente.
 * @param {Function} onCancel - Callback invocado al cancelar la operación.
 */
export default function DisablePinModal({ visible, userEmail, onSuccess, onCancel }) {
  const [mode, setMode] = useState(MODE_PIN)
  const [pinEntry, setPinEntry] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function resetState() {
    setMode(MODE_PIN)
    setPinEntry('')
    setPassword('')
    setError('')
    setLoading(false)
    setShowPassword(false)
  }

  function handleCancel() {
    resetState()
    onCancel()
  }

  function handleDigit(d) {
    if (pinEntry.length >= MAX_PIN_LENGTH) return
    setPinEntry(prev => prev + d)
    setError('')
  }

  function handleDelete() {
    setPinEntry(prev => prev.slice(0, -1))
    setError('')
  }

  async function handleConfirmPin() {
    if (pinEntry.length < 6) {
      setError('El PIN debe tener al menos 6 dígitos')
      return
    }
    setLoading(true)
    try {
      const ok = await verifyPin(pinEntry)
      if (!ok) {
        setError('PIN incorrecto. Verificá e intentá nuevamente.')
        setPinEntry('')
        return
      }
      await disablePin()
      resetState()
      onSuccess()
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmPassword() {
    if (!password) {
      setError('Ingresá tu contraseña')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/login', { email: userEmail, password })
      await disablePin()
      resetState()
      onSuccess()
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 422) {
        setError('Contraseña incorrecta')
      } else if (err.response?.status === 403) {
        setError('Tu cuenta está suspendida')
      } else {
        setError('Error al verificar. Intentá de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  const pinDots = Array.from({ length: 6 }).map((_, i) => i < pinEntry.length)

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Desactivar PIN</Text>
          <Text style={styles.subtitle}>Verificá tu identidad para continuar</Text>

          {/* Tabs de modo */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, mode === MODE_PIN && styles.tabActive]}
              onPress={() => { setMode(MODE_PIN); setError(''); setPinEntry('') }}
            >
              <Text style={[styles.tabText, mode === MODE_PIN && styles.tabTextActive]}>
                Usar PIN
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === MODE_PASSWORD && styles.tabActive]}
              onPress={() => { setMode(MODE_PASSWORD); setError(''); setPassword('') }}
            >
              <Text style={[styles.tabText, mode === MODE_PASSWORD && styles.tabTextActive]}>
                Usar contraseña
              </Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {mode === MODE_PIN ? (
            <>
              <View style={styles.dotsRow}>
                {pinDots.map((filled, i) => (
                  <View key={i} style={[styles.dot, filled && styles.dotFilled]} />
                ))}
              </View>
              <PinPad onDigit={handleDigit} onDelete={handleDelete} disabled={loading} />
              <TouchableOpacity
                style={[styles.confirmButton, (pinEntry.length < 6 || loading) && styles.buttonDisabled]}
                onPress={handleConfirmPin}
                disabled={pinEntry.length < 6 || loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={v => { setPassword(v); setError('') }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeButton}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.confirmButton, (!password || loading) && styles.buttonDisabled]}
                onPress={handleConfirmPassword}
                disabled={!password || loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={loading}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    width: '100%',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  error: {
    color: COLORS.error,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 20,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: COLORS.primary,
  },
  confirmButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
  cancelButton: {
    width: '100%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  inputWrapper: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    paddingVertical: 0,
  },
  eyeButton: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
})
