import { useState, useMemo } from 'react'
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
import { Ionicons } from '@expo/vector-icons'
import api from '../api/api'
import Logo from '../components/Logo'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'
import { useTheme } from '../theme/ThemeContext'
import { buildAuthScreenNavigation, buildPostAuthDestination } from '../utils/authRedirect'

export default function RegisterScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function validate() {
    if (!fullName.trim()) return 'Se requiere ingresar un nombre'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'El correo electrónico no es válido'
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
    if (!/[A-Z]/.test(password)) return 'La contraseña debe tener al menos una letra mayúscula'
    if (!/[a-z]/.test(password)) return 'La contraseña debe tener al menos una letra minúscula'
    if (!/[0-9]/.test(password)) return 'La contraseña debe tener al menos un número'
    return null
  }

  async function handleRegister() {
    setError('')
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/register', { fullName, email, password })
      const token = res.data.accessToken ?? res.data.access_token

      if (!token) {
        throw new Error('Missing access token')
      }

      await AsyncStorage.setItem('token', token)
      router.replace(buildPostAuthDestination(params))
    } catch (err) {
      if (err.response?.status === 409) {
        setError('No se pudo completar el registro con los datos proporcionados. Verificá los datos e intentá nuevamente.')
      } else {
        setError('Ha ocurrido un error. Reintente nuevamente.')
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
          <Text style={styles.title}>CREAR CUENTA</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.inputWrapper}>
            <Ionicons
              name="person-outline"
              size={20}
              color={theme.color.textMuted}
              style={styles.leftIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor={theme.color.textMuted}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={theme.color.textMuted}
              style={styles.leftIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor={theme.color.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={theme.color.textMuted}
              style={styles.leftIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={theme.color.textMuted}
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
                color={theme.color.textMuted}
              />
            </TouchableOpacity>
          </View>

          <PasswordStrengthMeter password={password} />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.color.onAccent} />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>REGISTRARME</Text>
                <Ionicons name="person-add" size={18} color={theme.color.onAccent} />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push(buildAuthScreenNavigation('/login', params))}
          >
            <Text style={styles.registerText}>
              ¿Ya tienes una cuenta? <Text style={styles.registerLink}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const makeStyles = (theme) => StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: theme.color.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.color.surface,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.color.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputWrapper: {
    height: 52,
    borderWidth: 1.5,
    borderColor: theme.color.border,
    borderRadius: 10,
    backgroundColor: theme.color.surface,
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
    color: theme.color.textPrimary,
    fontSize: 15,
    paddingVertical: 0,
  },
  rightIconButton: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
  button: {
    backgroundColor: theme.color.accent,
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
    color: theme.color.onAccent,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  registerText: {
    textAlign: 'center',
    color: theme.color.textPrimary,
    fontSize: 14,
  },
  registerLink: {
    color: theme.color.accent,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  error: {
    color: theme.color.error,
    textAlign: 'center',
    marginBottom: 14,
    fontSize: 14,
  },
})
