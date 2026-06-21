import { useState, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import api from '../api/api'
import Logo from '../components/Logo'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'
import { useTheme } from '../theme/ThemeContext'
import { makeStyles } from '../styles/resetPasswordStyles'

const PASSWORD_RULES_MESSAGE =
  'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.'

function getFirstParamValue(value) {
  return Array.isArray(value) ? value[0] : value
}

export default function ResetPasswordScreen() {
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])
  const router = useRouter()
  const params = useLocalSearchParams()
  const initialEmail = getFirstParamValue(params.email) || ''

  const [email, setEmail] = useState(initialEmail)
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  function validate() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Ingrese una dirección de correo electrónico válida'
    if (!/^\d{6}$/.test(otpCode)) return 'Ingrese el código de recuperación de 6 dígitos'
    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      return PASSWORD_RULES_MESSAGE
    }
    if (newPassword !== confirmPassword) {
      return 'Las contraseñas ingresadas no coinciden'
    }
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
      const res = await api.post('/auth/password-recovery/confirm', {
        email: email.trim().toLowerCase(),
        otpCode,
        newPassword,
      })

      setSuccess(res.data.message || 'Password updated successfully.')
      router.replace({ pathname: '/login', params: { passwordReset: 'success' } })
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Este código de recuperación es inválido o ha expirado. Solicita uno nuevo.')
      } else if (err.response?.status === 422) {
        setError('Verifica el correo electrónico, el código y el formato de la contraseña.')
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
          <Text style={styles.title}>RESTABLECER CLAVE</Text>
          <Text style={styles.description}>
            Ingresa el código de 6 dígitos que recibiste por email y elige una nueva contraseña.
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

          <View style={styles.inputWrapper}>
            <Ionicons
              name="key-outline"
              size={20}
              color={theme.color.textMuted}
              style={styles.leftIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Código de recuperación"
              placeholderTextColor={theme.color.textMuted}
              value={otpCode}
              onChangeText={(value) => setOtpCode(value.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
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
              placeholder="Nueva contraseña"
              placeholderTextColor={theme.color.textMuted}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.rightIconButton}
            >
              <Ionicons
                name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={theme.color.textMuted}
              />
            </TouchableOpacity>
          </View>

          <PasswordStrengthMeter password={newPassword} />

          <View style={styles.inputWrapper}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={theme.color.textMuted}
              style={styles.leftIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmar nueva contraseña"
              placeholderTextColor={theme.color.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.rightIconButton}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={theme.color.textMuted}
              />
            </TouchableOpacity>
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
                <Text style={styles.buttonText}>ACTUALIZAR CLAVE</Text>
                <Ionicons name="refresh" size={18} color={theme.color.onAccent} />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/forgot-password')}>
            <Text style={styles.link}>¿Necesitas otro código de recuperación?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}