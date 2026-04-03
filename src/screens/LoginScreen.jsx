import { useState } from 'react'
import {
  Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, ScrollView
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLocalSearchParams, useRouter } from 'expo-router'
import api from '../services/api'
import { registerForPushNotifications } from '../services/notifications'

export default function LoginScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const successMessage = params.passwordReset === 'success'
    ? 'Your password was updated. Sign in with the new one.'
    : ''

  function validate() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address'
    if (!password) return 'Password is required'
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
      router.replace('/home')
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid email or password')
      } else if (err.response?.status === 422) {
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
      <Text style={styles.title}>Sign In</Text>

      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}
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
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Sign In</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/forgot-password')}>
        <Text style={styles.secondaryLink}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:  { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title:      { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input:      { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  button:     { backgroundColor: '#007AFF', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  error:      { color: 'red', marginBottom: 16, textAlign: 'center' },
  success:    { color: '#117a37', marginBottom: 16, textAlign: 'center' },
  secondaryLink: { color: '#4b5563', textAlign: 'center', marginBottom: 16 },
  link:       { color: '#007AFF', textAlign: 'center' },
})
