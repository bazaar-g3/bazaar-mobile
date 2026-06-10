import * as SecureStore from 'expo-secure-store'

const PIN_ENABLED_KEY = 'pin_enabled'
const PIN_VALUE_KEY = 'pin_value'
const PIN_REFRESH_TOKEN_KEY = 'pin_refresh_token'
const PIN_FAILED_ATTEMPTS_KEY = 'pin_failed_attempts'
const PIN_LOCKED_UNTIL_KEY = 'pin_locked_until'

const MAX_ATTEMPTS = 3
const LOCKOUT_DURATION_MS = 5 * 60 * 1000 // 5 minutos

/**
 * Verifica si el usuario tiene PIN configurado en este dispositivo.
 * @returns {Promise<boolean>}
 */
export async function isPinEnabled() {
  const flag = await SecureStore.getItemAsync(PIN_ENABLED_KEY)
  return flag === 'true'
}

/**
 * Activa el acceso por PIN guardando el PIN y el refresh token en almacenamiento seguro.
 * Resetea cualquier bloqueo o contador de intentos previo.
 * @param {string} pin - PIN numérico a guardar.
 * @param {string} refreshToken - Refresh token asociado al usuario autenticado.
 */
export async function enablePin(pin, refreshToken) {
  await SecureStore.setItemAsync(PIN_VALUE_KEY, pin)
  await SecureStore.setItemAsync(PIN_REFRESH_TOKEN_KEY, refreshToken)
  await SecureStore.setItemAsync(PIN_ENABLED_KEY, 'true')
  await SecureStore.deleteItemAsync(PIN_FAILED_ATTEMPTS_KEY)
  await SecureStore.deleteItemAsync(PIN_LOCKED_UNTIL_KEY)
}

/**
 * Desactiva el acceso por PIN y elimina todos sus datos del almacenamiento seguro.
 */
export async function disablePin() {
  await SecureStore.deleteItemAsync(PIN_VALUE_KEY)
  await SecureStore.deleteItemAsync(PIN_REFRESH_TOKEN_KEY)
  await SecureStore.deleteItemAsync(PIN_ENABLED_KEY)
  await SecureStore.deleteItemAsync(PIN_FAILED_ATTEMPTS_KEY)
  await SecureStore.deleteItemAsync(PIN_LOCKED_UNTIL_KEY)
}

/**
 * Verifica si el PIN ingresado coincide con el almacenado.
 * @param {string} pin - PIN ingresado por el usuario.
 * @returns {Promise<boolean>}
 */
export async function verifyPin(pin) {
  const stored = await SecureStore.getItemAsync(PIN_VALUE_KEY)
  if (!stored) return false
  return stored === pin
}

/**
 * Recupera el refresh token guardado para autenticación por PIN.
 * @returns {Promise<string|null>}
 */
export async function getPinRefreshToken() {
  return await SecureStore.getItemAsync(PIN_REFRESH_TOKEN_KEY)
}

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
 * @returns {Promise<number>} - Nuevo total de intentos fallidos.
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
 * Se llama tras un acceso exitoso por PIN.
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
