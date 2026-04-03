import { useState } from 'react'
import {
  Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, ScrollView
} from 'react-native'
import { useRouter } from 'expo-router'
import api from '../services/api'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function validate() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address'
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
        res.data.message || 'If the email exists, we will send a password recovery code shortly.'
      )
      router.push({ pathname: '/reset-password', params: { email: normalizedEmail } })
    } catch (err) {
      if (err.response?.status === 422) {
        setError('Enter a valid email address')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Forgot password</Text>
      <Text style={styles.description}>
        Enter your email and we will send you a one-time code to reset your password.
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

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Send recovery code</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/login')}>
        <Text style={styles.link}>Back to sign in</Text>
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
