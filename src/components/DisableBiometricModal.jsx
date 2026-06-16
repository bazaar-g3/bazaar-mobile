import { useState, useMemo } from 'react'
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
import { authenticateWithBiometrics, disableBiometricForAccount } from '../services/biometric'
import { useTheme } from '../theme/ThemeContext'

const MODE_BIOMETRIC = 'biometric'
const MODE_PASSWORD = 'password'

/**
 * Modal de confirmación para desactivar el login biométrico.
 * El usuario debe verificar su identidad usando biometría o contraseña.
 *
 * @param {boolean} visible
 * @param {string} email - Email de la cuenta a desvincular.
 * @param {string} userEmail - Email para verificar por contraseña (puede ser el mismo).
 * @param {Function} onSuccess
 * @param {Function} onCancel
 */
export default function DisableBiometricModal({ visible, email, userEmail, onSuccess, onCancel }) {
  const [mode, setMode] = useState(MODE_BIOMETRIC)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  function resetState() {
    setMode(MODE_BIOMETRIC)
    setPassword('')
    setError('')
    setLoading(false)
    setShowPassword(false)
  }

  function handleCancel() {
    resetState()
    onCancel()
  }

  async function handleConfirmBiometric() {
    setLoading(true)
    setError('')
    try {
      const result = await authenticateWithBiometrics()
      if (!result.success) {
        if (result.error !== 'user_cancel' && result.error !== 'system_cancel') {
          setError('No se pudo verificar tu identidad. Intentá de nuevo.')
        }
        return
      }
      await disableBiometricForAccount(email ?? userEmail)
      resetState()
      onSuccess()
    } catch {
      setError('Error al verificar. Intentá de nuevo.')
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
      await disableBiometricForAccount(email ?? userEmail)
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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Desactivar biometría</Text>
          <Text style={styles.subtitle}>Verificá tu identidad para continuar</Text>

          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, styles.tabFirst, mode === MODE_BIOMETRIC && styles.tabActive]}
              onPress={() => { setMode(MODE_BIOMETRIC); setError('') }}
            >
              <Text style={[styles.tabText, mode === MODE_BIOMETRIC && styles.tabTextActive]}>
                Usar biometría
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, styles.tabLast, mode === MODE_PASSWORD && styles.tabActive]}
              onPress={() => { setMode(MODE_PASSWORD); setError(''); setPassword('') }}
            >
              <Text style={[styles.tabText, mode === MODE_PASSWORD && styles.tabTextActive]}>
                Usar contraseña
              </Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {mode === MODE_BIOMETRIC ? (
            <>
              <Ionicons name="finger-print" size={52} color={theme.color.accent} style={styles.biometricIcon} />
              <Text style={styles.biometricHint}>
                Usá tu huella dactilar o reconocimiento facial para confirmar
              </Text>
              <TouchableOpacity
                style={[styles.confirmButton, loading && styles.buttonDisabled]}
                onPress={handleConfirmBiometric}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.color.onAccent} />
                ) : (
                  <Text style={styles.confirmButtonText}>Verificar con biometría</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.color.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor={theme.color.textMuted}
                  value={password}
                  onChangeText={v => { setPassword(v); setError('') }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeButton}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={theme.color.textMuted}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.confirmButton, (!password || loading) && styles.buttonDisabled]}
                onPress={handleConfirmPassword}
                disabled={!password || loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.color.onAccent} />
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

const makeStyles = (theme) => StyleSheet.create({
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
    backgroundColor: theme.color.surface,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.color.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: theme.color.textSecondary,
    marginBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    width: '100%',
    borderWidth: 1.5,
    borderColor: theme.color.border,
    borderRadius: 10,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabFirst: {
    borderTopLeftRadius: 9,
    borderBottomLeftRadius: 9,
  },
  tabLast: {
    borderTopRightRadius: 9,
    borderBottomRightRadius: 9,
  },
  tabActive: {
    backgroundColor: theme.color.accent,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.color.textMuted,
  },
  tabTextActive: {
    color: theme.color.onAccent,
  },
  error: {
    color: theme.color.error,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 10,
  },
  biometricIcon: {
    marginTop: 8,
    marginBottom: 12,
  },
  biometricHint: {
    fontSize: 13,
    color: theme.color.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  confirmButton: {
    width: '100%',
    backgroundColor: theme.color.accent,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  confirmButtonText: {
    color: theme.color.onAccent,
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
    color: theme.color.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  inputWrapper: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderColor: theme.color.border,
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
    color: theme.color.textPrimary,
    fontSize: 15,
    paddingVertical: 0,
  },
  eyeButton: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
})
