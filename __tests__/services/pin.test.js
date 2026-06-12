
jest.mock('expo-secure-store', () => {
  const store = {}
  return {
    getItemAsync: jest.fn(async (key) => store[key] ?? null),
    setItemAsync: jest.fn(async (key, value) => { store[key] = value }),
    deleteItemAsync: jest.fn(async (key) => { delete store[key] }),
    _store: store,
    _reset: () => { Object.keys(store).forEach(k => delete store[k]) },
  }
})

const SecureStore = require('expo-secure-store')

import {
  isPinEnabled,
  enablePin,
  disablePin,
  verifyPin,
  getPinRefreshToken,
  getFailedAttempts,
  incrementFailedAttempts,
  resetFailedAttempts,
  isLockedOut,
  getLockoutRemainingSeconds,
} from '../../src/services/pin'

beforeEach(() => {
  SecureStore._reset()
  jest.clearAllMocks()
})

// ─── isPinEnabled ────────────────────────────────────────────────────────────

describe('isPinEnabled', () => {
  it('devuelve false cuando no hay dato almacenado', async () => {
    expect(await isPinEnabled()).toBe(false)
  })

  it('devuelve true cuando pin_enabled = "true"', async () => {
    await SecureStore.setItemAsync('pin_enabled', 'true')
    expect(await isPinEnabled()).toBe(true)
  })

  it('devuelve false cuando pin_enabled tiene otro valor', async () => {
    await SecureStore.setItemAsync('pin_enabled', 'false')
    expect(await isPinEnabled()).toBe(false)
  })
})

// ─── enablePin ───────────────────────────────────────────────────────────────

describe('enablePin', () => {
  it('guarda el PIN, el refreshToken y activa el flag', async () => {
    await enablePin('123456', 'refresh-abc')
    expect(await SecureStore.getItemAsync('pin_value')).toBe('123456')
    expect(await SecureStore.getItemAsync('pin_refresh_token')).toBe('refresh-abc')
    expect(await SecureStore.getItemAsync('pin_enabled')).toBe('true')
  })

  it('resetea intentos fallidos y bloqueo al activar', async () => {
    await SecureStore.setItemAsync('pin_failed_attempts', '2')
    await SecureStore.setItemAsync('pin_locked_until', new Date(Date.now() + 60000).toISOString())
    await enablePin('123456', 'token')
    expect(await SecureStore.getItemAsync('pin_failed_attempts')).toBeNull()
    expect(await SecureStore.getItemAsync('pin_locked_until')).toBeNull()
  })

  it('isPinEnabled retorna true después de enablePin', async () => {
    await enablePin('654321', 'tok')
    expect(await isPinEnabled()).toBe(true)
  })
})

// ─── disablePin ──────────────────────────────────────────────────────────────

describe('disablePin', () => {
  it('borra todas las claves PIN del almacenamiento', async () => {
    await enablePin('123456', 'refresh-abc')
    await SecureStore.setItemAsync('pin_failed_attempts', '1')
    await disablePin()
    expect(await SecureStore.getItemAsync('pin_value')).toBeNull()
    expect(await SecureStore.getItemAsync('pin_refresh_token')).toBeNull()
    expect(await SecureStore.getItemAsync('pin_enabled')).toBeNull()
    expect(await SecureStore.getItemAsync('pin_failed_attempts')).toBeNull()
    expect(await SecureStore.getItemAsync('pin_locked_until')).toBeNull()
  })

  it('isPinEnabled retorna false después de disablePin', async () => {
    await enablePin('123456', 'token')
    await disablePin()
    expect(await isPinEnabled()).toBe(false)
  })
})

// ─── verifyPin ───────────────────────────────────────────────────────────────

describe('verifyPin', () => {
  it('retorna true cuando el PIN coincide', async () => {
    await enablePin('123456', 'tok')
    expect(await verifyPin('123456')).toBe(true)
  })

  it('retorna false cuando el PIN es incorrecto', async () => {
    await enablePin('123456', 'tok')
    expect(await verifyPin('999999')).toBe(false)
  })

  it('retorna false cuando no hay PIN almacenado', async () => {
    expect(await verifyPin('123456')).toBe(false)
  })

  it('distingue entre PINs diferentes del mismo largo', async () => {
    await enablePin('111111', 'tok')
    expect(await verifyPin('111112')).toBe(false)
  })
})

// ─── getPinRefreshToken ──────────────────────────────────────────────────────

describe('getPinRefreshToken', () => {
  it('retorna el token guardado', async () => {
    await enablePin('123456', 'my-refresh-token')
    expect(await getPinRefreshToken()).toBe('my-refresh-token')
  })

  it('retorna null si no hay token', async () => {
    expect(await getPinRefreshToken()).toBeNull()
  })
})

// ─── intentos fallidos y bloqueo ─────────────────────────────────────────────

describe('getFailedAttempts', () => {
  it('retorna 0 cuando no hay intentos registrados', async () => {
    expect(await getFailedAttempts()).toBe(0)
  })

  it('retorna el valor almacenado', async () => {
    await SecureStore.setItemAsync('pin_failed_attempts', '2')
    expect(await getFailedAttempts()).toBe(2)
  })
})

describe('incrementFailedAttempts', () => {
  it('incrementa de 0 a 1', async () => {
    const result = await incrementFailedAttempts()
    expect(result).toBe(1)
    expect(await getFailedAttempts()).toBe(1)
  })

  it('incrementa de 1 a 2', async () => {
    await SecureStore.setItemAsync('pin_failed_attempts', '1')
    const result = await incrementFailedAttempts()
    expect(result).toBe(2)
  })

  it('al llegar a 3 guarda pin_locked_until en el futuro (bloqueo 5 min)', async () => {
    await SecureStore.setItemAsync('pin_failed_attempts', '2')
    const before = Date.now()
    await incrementFailedAttempts()
    const lockedUntilRaw = await SecureStore.getItemAsync('pin_locked_until')
    expect(lockedUntilRaw).not.toBeNull()
    const lockedUntil = new Date(lockedUntilRaw).getTime()
    // Debe estar en el futuro (entre 4:55 y 5:05 minutos)
    expect(lockedUntil).toBeGreaterThan(before + 4 * 60 * 1000)
    expect(lockedUntil).toBeLessThan(before + 6 * 60 * 1000)
  })

  it('antes de 3 intentos NO guarda pin_locked_until', async () => {
    await incrementFailedAttempts() // 1
    expect(await SecureStore.getItemAsync('pin_locked_until')).toBeNull()
    await incrementFailedAttempts() // 2
    expect(await SecureStore.getItemAsync('pin_locked_until')).toBeNull()
  })
})

describe('resetFailedAttempts', () => {
  it('borra el contador y el timestamp de bloqueo', async () => {
    await SecureStore.setItemAsync('pin_failed_attempts', '3')
    await SecureStore.setItemAsync('pin_locked_until', new Date(Date.now() + 60000).toISOString())
    await resetFailedAttempts()
    expect(await getFailedAttempts()).toBe(0)
    expect(await SecureStore.getItemAsync('pin_locked_until')).toBeNull()
  })
})

// ─── isLockedOut ─────────────────────────────────────────────────────────────

describe('isLockedOut', () => {
  it('retorna false cuando no hay pin_locked_until', async () => {
    expect(await isLockedOut()).toBe(false)
  })

  it('retorna true cuando el timestamp es en el futuro', async () => {
    const future = new Date(Date.now() + 5 * 60 * 1000).toISOString()
    await SecureStore.setItemAsync('pin_locked_until', future)
    expect(await isLockedOut()).toBe(true)
  })

  it('retorna false cuando el timestamp ya expiró', async () => {
    const past = new Date(Date.now() - 1000).toISOString()
    await SecureStore.setItemAsync('pin_locked_until', past)
    expect(await isLockedOut()).toBe(false)
  })
})

// ─── getLockoutRemainingSeconds ───────────────────────────────────────────────

describe('getLockoutRemainingSeconds', () => {
  it('retorna 0 cuando no hay bloqueo', async () => {
    expect(await getLockoutRemainingSeconds()).toBe(0)
  })

  it('retorna 0 cuando el bloqueo ya expiró', async () => {
    const past = new Date(Date.now() - 1000).toISOString()
    await SecureStore.setItemAsync('pin_locked_until', past)
    expect(await getLockoutRemainingSeconds()).toBe(0)
  })

  it('retorna un número positivo aproximado para bloqueo de 5 min', async () => {
    const future = new Date(Date.now() + 5 * 60 * 1000).toISOString()
    await SecureStore.setItemAsync('pin_locked_until', future)
    const secs = await getLockoutRemainingSeconds()
    expect(secs).toBeGreaterThan(295)
    expect(secs).toBeLessThanOrEqual(300)
  })
})
