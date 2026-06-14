import { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import api from '../api/api'
import {
  verifyPin,
  getPinAccounts,
  getPinRefreshTokenForAccount,
  incrementFailedAttempts,
  resetFailedAttempts,
  isLockedOut,
  getLockoutRemainingSeconds,
  removePinAccount,
} from '../services/pin'
import AccountSelectorSheet from '../components/AccountSelectorSheet'
import { registerForPushNotifications } from '../services/notifications'
import { COLORS } from '../constants/colors'
import Logo from '../components/Logo'
import PinPad from '../components/PinPad'
import { buildPostAuthDestination, buildAuthScreenNavigation } from '../utils/authRedirect'
import { useCartContext } from '../context/CartContext'

const MAX_PIN_LENGTH = 8
const MIN_PIN_LENGTH = 6

export default function PinLoginScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { refresh: refreshCart } = useCartContext()

  const [pinEntry, setPinEntry] = useState('')
  const pinRef = useRef('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lockedOut, setLockedOut] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [accountSelectorVisible, setAccountSelectorVisible] = useState(false)
  const [pendingAccounts, setPendingAccounts] = useState([])

  // Verificar estado de bloqueo al montar y cuando cambia lockedOut
  const checkLockout = useCallback(async () => {
    const locked = await isLockedOut()
    setLockedOut(locked)
    if (locked) {
      const secs = await getLockoutRemainingSeconds()
      setRemainingSeconds(secs)
    }
  }, [])

  useEffect(() => {
    checkLockout()
  }, [checkLockout])

  // Countdown cuando está bloqueado
  useEffect(() => {
    if (!lockedOut || remainingSeconds <= 0) return
    const timer = setInterval(async () => {
      const locked = await isLockedOut()
      if (!locked) {
        setLockedOut(false)
        setRemainingSeconds(0)
        clearInterval(timer)
      } else {
        const secs = await getLockoutRemainingSeconds()
        setRemainingSeconds(secs)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [lockedOut, remainingSeconds])

  function handleDigit(d) {
    if (loading || pinRef.current.length >= MAX_PIN_LENGTH) return
    const next = pinRef.current + d
    pinRef.current = next
    setPinEntry(next)
    setError('')
    if (next.length >= MIN_PIN_LENGTH) {
      handleSubmitPin(next)
    }
  }

  function handleDelete() {
    const next = pinRef.current.slice(0, -1)
    pinRef.current = next
    setPinEntry(next)
    setError('')
  }

  async function handleSubmitPin(pin) {
    setLoading(true)
    try {
      const locked = await isLockedOut()
      if (locked) {
        setLockedOut(true)
        const secs = await getLockoutRemainingSeconds()
        setRemainingSeconds(secs)
        setPinEntry('')
        return
      }

      const correct = await verifyPin(pin)
      if (!correct) {
        const attempts = await incrementFailedAttempts()
        pinRef.current = ''
        setPinEntry('')
        const remaining = Math.max(0, 3 - attempts)
        if (remaining <= 0) {
          setLockedOut(true)
          const secs = await getLockoutRemainingSeconds()
          setRemainingSeconds(secs)
          setError('')
        } else {
          setError(`PIN incorrecto. Intentos restantes: ${remaining}`)
        }
        return
      }

      // PIN correcto — determinar con qué cuenta continuar
      const accounts = await getPinAccounts()
      if (accounts.length === 0) {
        setError('Datos de PIN no encontrados. Configuralo de nuevo desde tu perfil.')
        return
      }

      await resetFailedAttempts()

      if (accounts.length === 1) {
        await loginWithAccount(accounts[0])
      } else {
        // Múltiples cuentas: mostrar selector
        pinRef.current = ''
        setPinEntry('')
        setPendingAccounts(accounts)
        setAccountSelectorVisible(true)
      }
    } catch (err) {
      pinRef.current = ''
      setPinEntry('')
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  async function loginWithAccount(account) {
    try {
      const storedRefreshToken = await getPinRefreshTokenForAccount(account.email)
      if (!storedRefreshToken) {
        await removePinAccount(account.email)
        setError('Sesión de esta cuenta no encontrada. Reactivá el PIN desde el perfil.')
        return
      }

      const response = await api.post('/auth/refresh', { refreshToken: storedRefreshToken })
      const newToken = response.data.accessToken
      await AsyncStorage.setItem('token', newToken)

      try { await registerForPushNotifications() } catch {}
      try { await refreshCart() } catch {}

      router.replace(buildPostAuthDestination(params))
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        await removePinAccount(account.email)
        const remaining = (await getPinAccounts()).filter(a => a.email !== account.email)
        if (remaining.length > 0) {
          setPendingAccounts(remaining)
          setError('La sesión de esa cuenta expiró. Seleccioná otra.')
        } else {
          setAccountSelectorVisible(false)
          if (err.response?.status === 403) {
            setError('Tu cuenta está suspendida. Ingresá con email y contraseña.')
          } else {
            setError('Tu sesión expiró. Ingresá con email y contraseña para reactivar el PIN.')
          }
        }
      } else {
        setError('Error de conexión. Intentá de nuevo.')
      }
    }
  }

  function handleUseEmailPassword() {
    router.replace(buildAuthScreenNavigation('/login', params))
  }

  const pinDots = Array.from({ length: MIN_PIN_LENGTH }).map((_, i) => i < pinEntry.length)

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <View style={styles.screen}>
      <AccountSelectorSheet
        visible={accountSelectorVisible}
        accounts={pendingAccounts}
        onSelect={(account) => {
          setAccountSelectorVisible(false)
          loginWithAccount(account)
        }}
        onCancel={() => {
          setAccountSelectorVisible(false)
          pinRef.current = ''
          setPinEntry('')
        }}
      />
      <Logo />

      <View style={styles.card}>
        <Text style={styles.title}>INGRESAR CON PIN</Text>

        {lockedOut ? (
          <View style={styles.lockoutContainer}>
            <Ionicons name="lock-closed" size={48} color={COLORS.error} style={styles.lockIcon} />
            <Text style={styles.lockoutTitle}>Acceso bloqueado</Text>
            <Text style={styles.lockoutText}>
              Superaste el límite de intentos. Podés intentar de nuevo en:
            </Text>
            <Text style={styles.lockoutTimer}>{formatTime(remainingSeconds)}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.subtitle}>Ingresá tu PIN para continuar</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.dotsRow}>
              {pinDots.map((filled, i) => (
                <View key={i} style={[styles.dot, filled && styles.dotFilled]} />
              ))}
            </View>

            <PinPad onDigit={handleDigit} onDelete={handleDelete} disabled={loading} />

            {loading && (
              <ActivityIndicator color={COLORS.primary} style={styles.loader} />
            )}
          </>
        )}

        <TouchableOpacity style={styles.emailButton} onPress={handleUseEmailPassword}>
          <View style={styles.emailButtonContent}>
            <Ionicons name="mail-outline" size={16} color={COLORS.primary} />
            <Text style={styles.emailButtonText}>Usar email y contraseña</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  error: {
    color: COLORS.error,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 24,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: COLORS.primary,
  },
  loader: {
    marginTop: 16,
  },
  lockoutContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  lockIcon: {
    marginBottom: 12,
  },
  lockoutTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.error,
    marginBottom: 8,
  },
  lockoutText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  lockoutTimer: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 8,
  },
  emailButton: {
    marginTop: 20,
    paddingVertical: 10,
  },
  emailButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emailButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
})
