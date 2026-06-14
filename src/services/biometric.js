import * as LocalAuthentication from 'expo-local-authentication'
import SecureStore from './secureStore'

const BIOMETRIC_REFRESH_TOKEN_KEY = 'biometric_refresh_token'
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled'

/**
 * Verifica si el dispositivo tiene hardware biométrico disponible y credenciales enroladas.
 * @returns {Promise<boolean>} - true si el dispositivo soporta biométrica y tiene datos enrolados.
 */
export async function isBiometricHardwareAvailable() {
  const compatible = await LocalAuthentication.hasHardwareAsync()
  const enrolled = await LocalAuthentication.isEnrolledAsync()
  return compatible && enrolled
}

/**
 * Verifica si el usuario habilitó el login biométrico en esta app.
 * @returns {Promise<boolean>} - true si el usuario activó la opción de login biométrico.
 */
export async function isBiometricEnabled() {
  const flag = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY)
  return flag === 'true'
}

/**
 * Activa el login biométrico guardando el refresh token en almacenamiento seguro.
 * @param {string} refreshToken - El refresh token a asociar con la autenticación biométrica.
 */
export async function enableBiometric(refreshToken) {
  await SecureStore.setItemAsync(BIOMETRIC_REFRESH_TOKEN_KEY, refreshToken)
  await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true')
}

/**
 * Desactiva el login biométrico y elimina el refresh token del almacenamiento seguro.
 */
export async function disableBiometric() {
  await SecureStore.deleteItemAsync(BIOMETRIC_REFRESH_TOKEN_KEY)
  await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY)
}

/**
 * Recupera el refresh token guardado para uso con biométrica.
 * @returns {Promise<string|null>} - El refresh token almacenado, o null si no existe.
 */
export async function getBiometricRefreshToken() {
  return await SecureStore.getItemAsync(BIOMETRIC_REFRESH_TOKEN_KEY)
}

/**
 * Lanza el prompt nativo de autenticación biométrica del dispositivo.
 * @returns {Promise<LocalAuthentication.LocalAuthenticationResult>} - Resultado con `success: true` si el usuario se autenticó correctamente, o `success: false` con el motivo del fallo.
 */
export async function authenticateWithBiometrics() {
  return await LocalAuthentication.authenticateAsync({
    promptMessage: 'Iniciá sesión con tu huella o reconocimiento facial',
    cancelLabel: 'Cancelar',
    disableDeviceFallback: false,
  })
}
