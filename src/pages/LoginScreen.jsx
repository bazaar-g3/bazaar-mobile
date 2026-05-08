import { useState } from 'react'
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

export default function LoginScreen() {
  const router = useRouter()
  const { refresh: refreshCart } = useCartContext()
  const params = useLocalSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const successMessage = params.passwordReset === 'success'
    ? 'Se ha actualizado tu contraseña correctamente. Inicia sesión con la nueva contraseña.'
    : ''

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

      if (!token) {
        throw new Error('Missing access token')
      }

      await AsyncStorage.setItem('token', token)

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

      router.replace(buildPostAuthDestination(params))
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Dirección de correo electrónico o contraseña incorrectas')
      } else if (err.response?.status === 422) {
        setError('Ingrese una dirección de correo electrónico válida')
      } else {
        setError('Algo salió mal. Por favor, inténtalo de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
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
    marginBottom: 20,
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