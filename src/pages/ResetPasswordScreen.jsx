import { useState } from 'react'
import {
  Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, ScrollView
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import api from '../api/api'

const PASSWORD_RULES_MESSAGE =
  'Password must have at least 8 characters, one uppercase letter, and one number.'

function getFirstParamValue(value) {
  return Array.isArray(value) ? value[0] : value
}

export default function ResetPasswordScreen() {
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

  function validate() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address'
    if (!/^\d{6}$/.test(otpCode)) return 'Enter the 6-digit recovery code'
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return PASSWORD_RULES_MESSAGE
    }
    if (newPassword !== confirmPassword) {
      return 'Passwords do not match'
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
        setError('This recovery code is invalid or expired. Request a new one.')
      } else if (err.response?.status === 422) {
        setError('Check the email, code, and password format.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Enter recovery code</Text>
      <Text style={styles.description}>
        Enter the 6-digit code from your email and choose a new password.
      </Text>

      {success ? <Text style={styles.success}>{success}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Recovery code"
        value={otpCode}
        onChangeText={(value) => setOtpCode(value.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="New password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Update password</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/forgot-password')}>
        <Text style={styles.link}>Need another recovery code?</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:  { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title:      { fontSize: 28, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  description:{ fontSize: 15, color: '#4b5563', marginBottom: 24, textAlign: 'center', lineHeight: 22 },
  input:      { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  button:     { backgroundColor: '#007AFF', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  error:      { color: 'red', marginBottom: 16, textAlign: 'center' },
  success:    { color: '#117a37', marginBottom: 16, textAlign: 'center' },
  link:       { color: '#007AFF', textAlign: 'center' },
})
