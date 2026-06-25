import { useState, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import api from '../api/api'
import Logo from '../components/Logo'
import { useTheme } from '../theme/ThemeContext'
import { makeStyles } from '../styles/forgotPasswordStyles'

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