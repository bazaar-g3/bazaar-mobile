import * as LocalAuthentication from 'expo-local-authentication'
import SecureStore from './secureStore'

const BIOMETRIC_ACCOUNTS_KEY = 'biometric_accounts'

// Legacy keys from old single-account model — used only for migration detection
const LEGACY_BIOMETRIC_ENABLED_KEY = 'biometric_enabled'
const LEGACY_BIOMETRIC_REFRESH_TOKEN_KEY = 'biometric_refresh_token'

// ─── Migración desde modelo legacy ───────────────────────────────────────────

/**
 * Detecta datos del modelo anterior (single-account) y los descarta.
 * No podemos migrar porque no sabemos a qué cuenta pertenecía la biometría.
 */
async function migrateLegacyIfNeeded() {
  const legacyFlag = await SecureStore.getItemAsync(LEGACY_BIOMETRIC_ENABLED_KEY)
  if (!legacyFlag) return
  await SecureStore.deleteItemAsync(LEGACY_BIOMETRIC_ENABLED_KEY)
  await SecureStore.deleteItemAsync(LEGACY_BIOMETRIC_REFRESH_TOKEN_KEY)
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

async function _getAccounts() {
  const raw = await SecureStore.getItemAsync(BIOMETRIC_ACCOUNTS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

async function _saveAccounts(accounts) {
  await SecureStore.setItemAsync(BIOMETRIC_ACCOUNTS_KEY, JSON.stringify(accounts))
}

// ─── API pública de biometría ─────────────────────────────────────────────────

/**
 * Verifica si el dispositivo tiene hardware biométrico disponible y credenciales enroladas.
 * @returns {Promise<boolean>}
 */
export async function isBiometricHardwareAvailable() {
  const compatible = await LocalAuthentication.hasHardwareAsync()
  const enrolled = await LocalAuthentication.isEnrolledAsync()
  return compatible && enrolled
}

/**
 * Indica si la cuenta con ese email tiene la biometría activada en este dispositivo.
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export async function isBiometricEnabledForAccount(email) {
  await migrateLegacyIfNeeded()
  const accounts = await _getAccounts()
  return accounts.some(a => a.email === email)
}

/**
 * Devuelve todas las cuentas vinculadas a biometría en este dispositivo.
 * @returns {Promise<Array<{email: string, name: string, avatarUrl: string|null, refreshToken: string}>>}
 */
export async function getBiometricAccounts() {
  await migrateLegacyIfNeeded()
  return await _getAccounts()
}

/**
 * Activa el login biométrico para una cuenta específica.
 * @param {string} email
 * @param {string} name
 * @param {string|null} avatarUrl
 * @param {string} refreshToken
 */
export async function enableBiometricForAccount(email, name, avatarUrl, refreshToken) {
  await migrateLegacyIfNeeded()
  const accounts = await _getAccounts()
  const idx = accounts.findIndex(a => a.email === email)
  const entry = { email, name, avatarUrl: avatarUrl ?? null, refreshToken }
  if (idx >= 0) {
    accounts[idx] = entry
  } else {
    accounts.push(entry)
  }
  await _saveAccounts(accounts)
}

/**
 * Desvincula la cuenta del login biométrico en este dispositivo.
 * @param {string} email
 */
export async function disableBiometricForAccount(email) {
  const accounts = await _getAccounts()
  const updated = accounts.filter(a => a.email !== email)
  if (updated.length === 0) {
    await SecureStore.deleteItemAsync(BIOMETRIC_ACCOUNTS_KEY)
  } else {
    await _saveAccounts(updated)
  }
}

/**
 * Elimina una cuenta de la lista biométrica (uso interno cuando expira la sesión).
 * @param {string} email
 */
export async function removeBiometricAccount(email) {
  return disableBiometricForAccount(email)
}

/**
 * Recupera el refresh token biométrico para una cuenta específica.
 * @param {string} email
 * @returns {Promise<string|null>}
 */
export async function getBiometricRefreshTokenForAccount(email) {
  const accounts = await _getAccounts()
  const account = accounts.find(a => a.email === email)
  return account?.refreshToken ?? null
}

/**
 * Lanza el prompt nativo de autenticación biométrica del dispositivo.
 * @returns {Promise<LocalAuthentication.LocalAuthenticationResult>}
 */
export async function authenticateWithBiometrics() {
  return await LocalAuthentication.authenticateAsync({
    promptMessage: 'Iniciá sesión con tu huella o reconocimiento facial',
    cancelLabel: 'Cancelar',
    disableDeviceFallback: false,
  })
}
