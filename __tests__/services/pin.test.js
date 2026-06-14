
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

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => { }),
  removeItem: jest.fn(async () => { }),
}))

jest.mock('../../src/api/api', () => ({
  default: { get: jest.fn() },
}))

const SecureStore = require('expo-secure-store')

import {
  isPinSetOnDevice,
  isPinEnabledForAccount,
  getPinAccounts,
  enablePinForAccount,
  disablePinForAccount,
  removePinAccount,
  getPinRefreshTokenForAccount,
  verifyPin,
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

// ─── isPinSetOnDevice ─────────────────────────────────────────────────────────

describe('isPinSetOnDevice', () => {
  it('devuelve false cuando no hay cuentas ni PIN', async () => {
    expect(await isPinSetOnDevice()).toBe(false)
  })

  it('devuelve true cuando hay cuentas y PIN configurado', async () => {
    await enablePinForAccount('123456', 'a@b.com', 'A', null, 'tok')
    expect(await isPinSetOnDevice()).toBe(true)
  })

  it('devuelve false si hay pin_value pero sin cuentas (estado inconsistente)', async () => {
    await SecureStore.setItemAsync('pin_value', '123456')
    expect(await isPinSetOnDevice()).toBe(false)
  })
})

// ─── isPinEnabledForAccount ───────────────────────────────────────────────────

describe('isPinEnabledForAccount', () => {
  it('devuelve false cuando no hay cuentas', async () => {
    expect(await isPinEnabledForAccount('a@b.com')).toBe(false)
  })

  it('devuelve true solo para la cuenta registrada', async () => {
    await enablePinForAccount('123456', 'a@b.com', 'A', null, 'tok')
    expect(await isPinEnabledForAccount('a@b.com')).toBe(true)
    expect(await isPinEnabledForAccount('other@b.com')).toBe(false)
  })
})

// ─── getPinAccounts ───────────────────────────────────────────────────────────

describe('getPinAccounts', () => {
  it('devuelve array vacío cuando no hay cuentas', async () => {
    expect(await getPinAccounts()).toEqual([])
  })

  it('devuelve las cuentas registradas', async () => {
    await enablePinForAccount('123456', 'a@b.com', 'Alice', 'http://img', 'tok-a')
    await enablePinForAccount('123456', 'b@b.com', 'Bob', null, 'tok-b')
    const accounts = await getPinAccounts()
    expect(accounts).toHaveLength(2)
    expect(accounts.find(a => a.email === 'a@b.com')).toMatchObject({ name: 'Alice', refreshToken: 'tok-a' })
    expect(accounts.find(a => a.email === 'b@b.com')).toMatchObject({ name: 'Bob', refreshToken: 'tok-b' })
  })
})

// ─── enablePinForAccount ─────────────────────────────────────────────────────

describe('enablePinForAccount', () => {
  it('guarda el PIN y la cuenta', async () => {
    await enablePinForAccount('123456', 'a@b.com', 'Alice', null, 'tok')
    expect(await SecureStore.getItemAsync('pin_value')).toBe('123456')
    const accounts = await getPinAccounts()
    expect(accounts).toHaveLength(1)
    expect(accounts[0]).toMatchObject({ email: 'a@b.com', name: 'Alice', refreshToken: 'tok' })
  })

  it('no reemplaza el PIN si ya existe al agregar una segunda cuenta', async () => {
    await enablePinForAccount('123456', 'a@b.com', 'A', null, 'tok-a')
    await enablePinForAccount('999999', 'b@b.com', 'B', null, 'tok-b')
    expect(await SecureStore.getItemAsync('pin_value')).toBe('123456')
  })

  it('actualiza el refreshToken si la cuenta ya existía', async () => {
    await enablePinForAccount('123456', 'a@b.com', 'A', null, 'old-tok')
    await enablePinForAccount('123456', 'a@b.com', 'A', null, 'new-tok')
    const accounts = await getPinAccounts()
    expect(accounts).toHaveLength(1)
    expect(accounts[0].refreshToken).toBe('new-tok')
  })

  it('resetea bloqueo e intentos al activar', async () => {
    await SecureStore.setItemAsync('pin_failed_attempts', '2')
    await SecureStore.setItemAsync('pin_locked_until', new Date(Date.now() + 60000).toISOString())
    await enablePinForAccount('123456', 'a@b.com', 'A', null, 'tok')
    expect(await SecureStore.getItemAsync('pin_failed_attempts')).toBeNull()
    expect(await SecureStore.getItemAsync('pin_locked_until')).toBeNull()
  })
})

// ─── disablePinForAccount ─────────────────────────────────────────────────────

describe('disablePinForAccount', () => {
  it('remueve la cuenta y mantiene el PIN si quedan otras cuentas', async () => {
    await enablePinForAccount('123456', 'a@b.com', 'A', null, 'tok-a')
    await enablePinForAccount('123456', 'b@b.com', 'B', null, 'tok-b')
    await disablePinForAccount('a@b.com')
    expect(await isPinEnabledForAccount('a@b.com')).toBe(false)
    expect(await isPinEnabledForAccount('b@b.com')).toBe(true)
    expect(await SecureStore.getItemAsync('pin_value')).toBe('123456')
  })

  it('elimina el PIN del dispositivo cuando no quedan cuentas', async () => {
    await enablePinForAccount('123456', 'a@b.com', 'A', null, 'tok')
    await disablePinForAccount('a@b.com')
    expect(await SecureStore.getItemAsync('pin_value')).toBeNull()
    expect(await SecureStore.getItemAsync('pin_accounts')).toBeNull()
    expect(await isPinSetOnDevice()).toBe(false)
  })

  it('no falla si se intenta desactivar una cuenta inexistente', async () => {
    await enablePinForAccount('123456', 'a@b.com', 'A', null, 'tok')
    await expect(disablePinForAccount('other@b.com')).resolves.not.toThrow()
    expect(await isPinEnabledForAccount('a@b.com')).toBe(true)
  })
})

// ─── removePinAccount ────────────────────────────────────────────────────────

describe('removePinAccount', () => {
  it('funciona igual que disablePinForAccount', async () => {
    await enablePinForAccount('123456', 'a@b.com', 'A', null, 'tok')
    await removePinAccount('a@b.com')
    expect(await isPinEnabledForAccount('a@b.com')).toBe(false)
  })
})

// ─── getPinRefreshTokenForAccount ─────────────────────────────────────────────

describe('getPinRefreshTokenForAccount', () => {
  it('retorna el token de la cuenta correcta', async () => {
    await enablePinForAccount('123456', 'a@b.com', 'A', null, 'tok-a')
    await enablePinForAccount('123456', 'b@b.com', 'B', null, 'tok-b')
    expect(await getPinRefreshTokenForAccount('a@b.com')).toBe('tok-a')
    expect(await getPinRefreshTokenForAccount('b@b.com')).toBe('tok-b')
  })

  it('retorna null si la cuenta no existe', async () => {
    expect(await getPinRefreshTokenForAccount('noexiste@b.com')).toBeNull()
  })
})

// ─── verifyPin ────────────────────────────────────────────────────────────────

describe('verifyPin', () => {
  it('retorna true cuando el PIN coincide', async () => {
    await enablePinForAccount('123456', 'a@b.com', 'A', null, 'tok')
    expect(await verifyPin('123456')).toBe(true)
  })

  it('retorna false cuando el PIN es incorrecto', async () => {
    await enablePinForAccount('123456', 'a@b.com', 'A', null, 'tok')
    expect(await verifyPin('999999')).toBe(false)
  })

  it('retorna false cuando no hay PIN almacenado', async () => {
    expect(await verifyPin('123456')).toBe(false)
  })

  it('distingue entre PINs diferentes del mismo largo', async () => {
    await enablePinForAccount('111111', 'a@b.com', 'A', null, 'tok')
    expect(await verifyPin('111112')).toBe(false)
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

// ─── isLockedOut ──────────────────────────────────────────────────────────────

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