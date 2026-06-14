import AsyncStorage from '@react-native-async-storage/async-storage'
import SecureStore from './secureStore'

const PIN_VALUE_KEY = 'pin_value'
const PIN_ACCOUNTS_KEY = 'pin_accounts'
const PIN_FAILED_ATTEMPTS_KEY = 'pin_failed_attempts'
const PIN_LOCKED_UNTIL_KEY = 'pin_locked_until'

// Legacy keys from old single-account model — used only for migration detection
const LEGACY_PIN_ENABLED_KEY = 'pin_enabled'
const LEGACY_PIN_REFRESH_TOKEN_KEY = 'pin_refresh_token'

const MAX_ATTEMPTS = 3
const LOCKOUT_DURATION_MS = 5 * 60 * 1000 // 5 minutos

// ─── Migración desde modelo legacy ───────────────────────────────────────────

/**
 * Detecta datos del modelo anterior (single-account) y los migra al nuevo esquema
 * multi-cuenta. Si hay una sesión activa, intenta asociar el PIN legacy a ese usuario.
 * Si no hay sesión, descarta los datos legacy.
 */
async function migrateLegacyIfNeeded() {
  const legacyFlag = await SecureStore.getItemAsync(LEGACY_PIN_ENABLED_KEY)
  if (!legacyFlag) return

  try {
    const legacyPin = await SecureStore.getItemAsync(PIN_VALUE_KEY)
    const legacyRefreshToken = await SecureStore.getItemAsync(LEGACY_PIN_REFRESH_TOKEN_KEY)

    if (legacyFlag === 'true' && legacyPin && legacyRefreshToken) {
      const token = await AsyncStorage.getItem('token')
      if (token) {
        // Hay sesión activa: intentar obtener el perfil para asociar la cuenta
        try {
          const { default: api } = await import('../api/api')
          const res = await api.get('/users/me', {
            headers: { Authorization: `Bearer ${token}` },
          })
          const email = res.data.email ?? res.data.mail
          const name = res.data.name ?? res.data.username ?? email
          const avatarUrl = res.data.avatar ?? res.data.profilePicture ?? null
          if (email) {
            await _addOrUpdateAccount(PIN_ACCOUNTS_KEY, { email, name, avatarUrl, refreshToken: legacyRefreshToken })
          }
        } catch {
          // Si el fetch falla, descartamos el PIN legacy
        }
      }
    }
  } finally {
    // Siempre eliminamos las claves legacy
    await SecureStore.deleteItemAsync(LEGACY_PIN_ENABLED_KEY)
    await SecureStore.deleteItemAsync(LEGACY_PIN_REFRESH_TOKEN_KEY)
  }
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

async function _getAccounts(key) {
  const raw = await SecureStore.getItemAsync(key)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

async function _saveAccounts(key, accounts) {
  await SecureStore.setItemAsync(key, JSON.stringify(accounts))
}

async function _addOrUpdateAccount(key, entry) {
  const accounts = await _getAccounts(key)
  const idx = accounts.findIndex(a => a.email === entry.email)
  if (idx >= 0) {
    accounts[idx] = entry
  } else {
    accounts.push(entry)
  }
  await _saveAccounts(key, accounts)
}

// ─── API pública de PIN ───────────────────────────────────────────────────────

/**
 * Indica si hay un PIN configurado en este dispositivo (alguna cuenta vinculada).
 * @returns {Promise<boolean>}
 */
export async function isPinSetOnDevice() {
  await migrateLegacyIfNeeded()
  const pin = await SecureStore.getItemAsync(PIN_VALUE_KEY)
  if (!pin) return false
  const accounts = await _getAccounts(PIN_ACCOUNTS_KEY)
  return accounts.length > 0
}

/**
 * Indica si la cuenta con ese email tiene el PIN activado en este dispositivo.
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export async function isPinEnabledForAccount(email) {
  await migrateLegacyIfNeeded()
  const accounts = await _getAccounts(PIN_ACCOUNTS_KEY)
  return accounts.some(a => a.email === email)
}

/**
 * Devuelve todas las cuentas vinculadas al PIN en este dispositivo.
 * @returns {Promise<Array<{email: string, name: string, avatarUrl: string|null, refreshToken: string}>>}
 */
export async function getPinAccounts() {
  await migrateLegacyIfNeeded()
  return await _getAccounts(PIN_ACCOUNTS_KEY)
}

/**
 * Activa el PIN para una cuenta específica. Si es la primera cuenta, guarda el valor
 * del PIN en el dispositivo. Si ya hay un PIN guardado, se usa el existente (no lo reemplaza).
 * @param {string} pin
 * @param {string} email
 * @param {string} name
 * @param {string|null} avatarUrl
 * @param {string} refreshToken
 */
export async function enablePinForAccount(pin, email, name, avatarUrl, refreshToken) {
  await migrateLegacyIfNeeded()
  // Solo guardamos el valor del PIN si aún no hay uno (dispositivo-level)
  const existing = await SecureStore.getItemAsync(PIN_VALUE_KEY)
  if (!existing) {
    await SecureStore.setItemAsync(PIN_VALUE_KEY, pin)
  }
  await _addOrUpdateAccount(PIN_ACCOUNTS_KEY, { email, name, avatarUrl: avatarUrl ?? null, refreshToken })
  await SecureStore.deleteItemAsync(PIN_FAILED_ATTEMPTS_KEY)
  await SecureStore.deleteItemAsync(PIN_LOCKED_UNTIL_KEY)
}

/**
 * Desvincula la cuenta del PIN en este dispositivo.
 * Si no quedan cuentas vinculadas, elimina el valor del PIN del dispositivo.
 * @param {string} email
 */
export async function disablePinForAccount(email) {
  const accounts = await _getAccounts(PIN_ACCOUNTS_KEY)
  const updated = accounts.filter(a => a.email !== email)
  if (updated.length === 0) {
    await SecureStore.deleteItemAsync(PIN_ACCOUNTS_KEY)
    await SecureStore.deleteItemAsync(PIN_VALUE_KEY)
    await SecureStore.deleteItemAsync(PIN_FAILED_ATTEMPTS_KEY)
    await SecureStore.deleteItemAsync(PIN_LOCKED_UNTIL_KEY)
  } else {
    await _saveAccounts(PIN_ACCOUNTS_KEY, updated)
  }
}

/**
 * Elimina una cuenta de la lista de PIN (uso interno cuando expira la sesión).
 * Equivalente a disablePinForAccount pero sin semántica de "el usuario lo desactivó".
 * @param {string} email
 */
export async function removePinAccount(email) {
  return disablePinForAccount(email)
}

/**
 * Recupera el refresh token del PIN para una cuenta específica.
 * @param {string} email
 * @returns {Promise<string|null>}
 */
export async function getPinRefreshTokenForAccount(email) {
  const accounts = await _getAccounts(PIN_ACCOUNTS_KEY)
  const account = accounts.find(a => a.email === email)
  return account?.refreshToken ?? null
}

/**
 * Verifica si el PIN ingresado coincide con el almacenado en el dispositivo.
 * @param {string} pin
 * @returns {Promise<boolean>}
 */
export async function verifyPin(pin) {
  const stored = await SecureStore.getItemAsync(PIN_VALUE_KEY)
  if (!stored) return false
  return stored === pin
}

// ─── Intentos fallidos y bloqueo (device-level) ───────────────────────────────

/**
 * Obtiene la cantidad de intentos fallidos consecutivos.
 * @returns {Promise<number>}
 */
export async function getFailedAttempts() {
  const raw = await SecureStore.getItemAsync(PIN_FAILED_ATTEMPTS_KEY)
  return raw ? parseInt(raw, 10) : 0
}

/**
 * Incrementa el contador de intentos fallidos. Al alcanzar MAX_ATTEMPTS,
 * guarda el timestamp de fin del bloqueo temporal.
 * @returns {Promise<number>} Nuevo total de intentos fallidos.
 */
export async function incrementFailedAttempts() {
  const current = await getFailedAttempts()
  const next = current + 1
  await SecureStore.setItemAsync(PIN_FAILED_ATTEMPTS_KEY, String(next))
  if (next >= MAX_ATTEMPTS) {
    const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString()
    await SecureStore.setItemAsync(PIN_LOCKED_UNTIL_KEY, lockedUntil)
  }
  return next
}

/**
 * Resetea el contador de intentos fallidos y levanta el bloqueo temporal.
 */
export async function resetFailedAttempts() {
  await SecureStore.deleteItemAsync(PIN_FAILED_ATTEMPTS_KEY)
  await SecureStore.deleteItemAsync(PIN_LOCKED_UNTIL_KEY)
}

/**
 * Indica si el acceso por PIN está bloqueado temporalmente.
 * @returns {Promise<boolean>}
 */
export async function isLockedOut() {
  const raw = await SecureStore.getItemAsync(PIN_LOCKED_UNTIL_KEY)
  if (!raw) return false
  return Date.now() < new Date(raw).getTime()
}

/**
 * Devuelve los segundos restantes de bloqueo, o 0 si no hay bloqueo activo.
 * @returns {Promise<number>}
 */
export async function getLockoutRemainingSeconds() {
  const raw = await SecureStore.getItemAsync(PIN_LOCKED_UNTIL_KEY)
  if (!raw) return 0
  const remaining = Math.ceil((new Date(raw).getTime() - Date.now()) / 1000)
  return remaining > 0 ? remaining : 0
}
