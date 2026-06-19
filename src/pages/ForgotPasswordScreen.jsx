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
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import api from '../api/api'
import Logo from '../components/Logo'
import { useTheme } from '../theme/ThemeContext'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function validate() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Ingrese una dirección de correo electrónico válida'
    return null
  }

  async function handleSubmit() {
    setError('')
    setSuccess('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/password-recovery/request', { email })
      const normalizedEmail = email.trim().toLowerCase()

      setSuccess(
        res.data.message || 'Si el correo electrónico está registrado en el sistema, te enviaremos un código de recuperación de contraseña en breve.'
      )

      router.push({ pathname: '/reset-password', params: { email: normalizedEmail } })
    } catch (err) {
      if (err.response?.status === 422) {
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
          <Text style={styles.title}>RECUPERAR CLAVE</Text>
          <Text style={styles.description}>
            Ingresa tu correo electrónico y te enviaremos un código de un solo uso para restablecer tu contraseña.
          </Text>

          {success ? <Text style={styles.success}>{success}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}

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

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.color.onAccent} />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>ENVIAR CÓDIGO</Text>
                <Ionicons name="paper-plane-outline" size={18} color={theme.color.onAccent} />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={styles.link}>Volver a iniciar sesión</Text>
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
    maxWidth: 380,
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
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: theme.color.textSecondary,
    marginBottom: 22,
    textAlign: 'center',
    lineHeight: 20,
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
  button: {
    backgroundColor: theme.color.accent,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 18,
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
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  link: {
    color: theme.color.accent,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  error: {
    color: theme.color.error,
    textAlign: 'center',
    marginBottom: 14,
    fontSize: 14,
  },
  success: {
    color: theme.color.success,
    textAlign: 'center',
    marginBottom: 14,
    fontSize: 14,
  },
})