import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import api from '../api/api'
import { registerForPushNotifications } from '../services/notifications'
import { COLORS } from '../constants/colors'
import Logo from '../components/Logo'
import { buildAuthScreenNavigation, buildPostAuthDestination } from '../utils/authRedirect'
import OAuthButtons from '../components/OAuthButtons'
import { useCartContext } from '../context/CartContext'
import AccountBlockedModal from '../components/AccountBlockedModal'
import BiometricEnrollmentModal from '../components/BiometricEnrollmentModal'
import {
  isBiometricHardwareAvailable,
  isBiometricEnabled,
  enableBiometric,
  disableBiometric,
  getBiometricRefreshToken,
  authenticateWithBiometrics,
} from '../services/biometric'

export default function LoginScreen() {
  const router = useRouter()
  const { refresh: refreshCart } = useCartContext()
  const params = useLocalSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [blockedModalVisible, setBlockedModalVisible] = useState(false)

  // Estado de biométrica
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [biometricLoading, setBiometricLoading] = useState(false)
  const [enrollmentModalVisible, setEnrollmentModalVisible] = useState(false)
  const [pendingRefreshToken, setPendingRefreshToken] = useState(null)

  const successMessage = params.passwordReset === 'success'
    ? 'Se ha actualizado tu contraseña correctamente. Inicia sesión con la nueva contraseña.'
    : ''

  // Al montar la pantalla verificamos si el dispositivo tiene biométrica disponible y habilitada
  useEffect(() => {
    async function checkBiometric() {
      const available = await isBiometricHardwareAvailable()
      if (!available) return
      setBiometricAvailable(true)
      const enabled = await isBiometricEnabled()
      setBiometricEnabled(enabled)
    }
    checkBiometric()
  }, [])

  function validate() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Ingrese una dirección de correo electrónico válida'
    if (!password) return 'La contraseña es requerida'
    return null
  }

  async function handleLogin() {
    setError('')
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const token = res.data.accessToken ?? res.data.access_token
      const refreshToken = res.data.refreshToken

      if (!token) {
        throw new Error('Missing access token')
      }

      await AsyncStorage.setItem('token', token)
      if (refreshToken) {
        await AsyncStorage.setItem('refreshToken', refreshToken)
      }

      try {
        await registerForPushNotifications()
      } catch (notificationError) {
        console.warn('Push notification registration failed after login', notificationError)
      }

      try {
        await refreshCart()
      } catch (cartError) {
        console.warn('Cart refresh failed after login', cartError)
      }

      // CA1: si el dispositivo soporta biométrica y el usuario no la activó aún, ofrecer activación
      const available = await isBiometricHardwareAvailable()
      const alreadyEnabled = await isBiometricEnabled()
      if (available && !alreadyEnabled && refreshToken) {
        setPendingRefreshToken(refreshToken)
        setEnrollmentModalVisible(true)
      } else {
        router.replace(buildPostAuthDestination(params))
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setBlockedModalVisible(true)
      } else if (err.response?.status === 401) {
        setError('Dirección de correo electrónico o contraseña incorrectas')
      } else if (err.response?.status === 422) {
        setError('Ingrese una dirección de correo electrónico válida')
      } else if (err.response?.status === 429) {
        setError('Demasiados intentos fallidos. Esperá unos minutos antes de volver a intentarlo.')
      } else {
        setError('Algo salió mal. Por favor, inténtalo de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * CA1: el usuario aceptó activar el login biométrico desde el modal de enrolamiento.
   * Guarda el refresh token en almacenamiento seguro y navega al destino post-login.
   */
  async function handleEnrollBiometric() {
    try {
      await enableBiometric(pendingRefreshToken)
      setBiometricEnabled(true)
    } catch {
      // si falla el guardado igual dejamos pasar al usuario
    } finally {
      setEnrollmentModalVisible(false)
      router.replace(buildPostAuthDestination(params))
    }
  }

  /**
   * El usuario eligió no activar biométrica ahora. Solo navega al destino post-login.
   */
  function handleSkipEnrollment() {
    setEnrollmentModalVisible(false)
    router.replace(buildPostAuthDestination(params))
  }

  /**
   * CA2 y CA3: intenta autenticar al usuario usando la biométrica del dispositivo.
   * Si la autenticación biométrica falla o la sesión expiró, muestra el error correspondiente.
   * CA4: si el refresh token almacenado ya no es válido (sesión expirada), limpia los datos
   * biométricos y pide al usuario que vuelva a ingresar con correo y contraseña.
   */
  async function handleBiometricLogin() {
    setBiometricLoading(true)
    setError('')
    try {
      // Prompt nativo del dispositivo (huella / face ID)
      const result = await authenticateWithBiometrics()

      // CA3: la validación biométrica falló o fue cancelada por el usuario
      if (!result.success) {
        if (result.error !== 'user_cancel' && result.error !== 'system_cancel') {
          setError('No se pudo verificar tu identidad. Intentá de nuevo o usá tu contraseña.')
        }
        return
      }

      // CA2: biométrica validada — recuperar el refresh token guardado
      const storedRefreshToken = await getBiometricRefreshToken()
      if (!storedRefreshToken) {
        await disableBiometric()
        setBiometricEnabled(false)
        setError('No se encontraron datos biométricos. Ingresá con tu correo y contraseña.')
        return
      }

      const response = await api.post('/auth/refresh', { refreshToken: storedRefreshToken })
      const newToken = response.data.accessToken
      await AsyncStorage.setItem('token', newToken)

      try {
        await registerForPushNotifications()
      } catch {}
      try {
        await refreshCart()
      } catch {}

      router.replace(buildPostAuthDestination(params))
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        // CA4: sesión expirada o usuario bloqueado — limpiar biométrica y pedir login manual
        await disableBiometric()
        setBiometricEnabled(false)
        if (err.response?.status === 403) {
          setBlockedModalVisible(true)
        } else {
          setError('Tu sesión expiró. Ingresá con tu correo y contraseña para continuar.')
        }
      } else {
        setError('No se pudo iniciar sesión. Intentá de nuevo.')
      }
    } finally {
      setBiometricLoading(false)
    }
  }

  return (
    <>
      <AccountBlockedModal
        visible={blockedModalVisible}
        onClose={() => setBlockedModalVisible(false)}
      />
      <BiometricEnrollmentModal
        visible={enrollmentModalVisible}
        onEnable={handleEnrollBiometric}
        onSkip={handleSkipEnrollment}
      />
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.screen}>
        <Logo />

        <View style={styles.card}>
          <Text style={styles.title}>INICIAR SESIÓN</Text>

          {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} style={styles.leftIcon} />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.leftIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.rightIconButton}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/forgot-password')}>
            <Text style={styles.secondaryLink}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
                <Ionicons name="person" size={18} color={COLORS.white} />
              </View>
            )}
          </TouchableOpacity>

          {/* CA2: botón de login biométrico — solo visible si el usuario lo activó previamente */}
          {biometricAvailable && biometricEnabled && (
            <TouchableOpacity
              style={[styles.biometricButton, biometricLoading && styles.buttonDisabled]}
              onPress={handleBiometricLogin}
              disabled={biometricLoading}
            >
              {biometricLoading ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="finger-print" size={22} color={COLORS.primary} />
                  <Text style={styles.biometricButtonText}>Ingresar con biométrica</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => router.replace('/home')}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.guestButtonText}>Continuar como invitado</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
            </View>
          </TouchableOpacity>

          <OAuthButtons
            onSuccess={() => router.replace(buildPostAuthDestination(params))}
            onError={(msg) => setError(msg)}
          />

          <TouchableOpacity
            onPress={() => router.push(buildAuthScreenNavigation('/register', params))}
          >
            <Text style={styles.registerText}>
              ¿No tienes cuenta? <Text style={styles.registerLink}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </>
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  logoText: {
    fontSize: 30,
    fontWeight: '900',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  logoB: { color: COLORS.logoB },
  logoA: { color: COLORS.logoA },
  logoZ: { color: COLORS.logoZ },
  logoA2: { color: COLORS.logoA2 },
  logoA3: { color: COLORS.logoA3 },
  logoR: { color: COLORS.logoR },

  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 28,
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
    marginBottom: 24,
  },
  inputWrapper: {
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  leftIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    paddingVertical: 0,
  },
  rightIconButton: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.75,
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
  biometricButton: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  biometricButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  secondaryLink: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 13,
    textDecorationLine: 'underline',
    marginTop: 2,
  },
  registerText: {
    textAlign: 'center',
    color: '#2f2f2f',
    fontSize: 14,
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  error: {
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 14,
    fontSize: 14,
  },
  success: {
    color: COLORS.success,
    textAlign: 'center',
    marginBottom: 14,
    fontSize: 14,
  },
  guestButton: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  guestButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
})
