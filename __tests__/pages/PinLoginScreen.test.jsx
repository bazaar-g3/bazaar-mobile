
import React from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react-native'

// Mock de expo-secure-store
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

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
  removeItem: jest.fn(async () => {}),
  multiRemove: jest.fn(async () => {}),
}))

// Mock de expo-router
const mockReplace = jest.fn()
const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
  useLocalSearchParams: () => ({}),
}))

// Mock de la API
jest.mock('../../src/api/api', () => ({
  post: jest.fn(),
}))

// Mock de notificaciones
jest.mock('../../src/services/notifications', () => ({
  registerForPushNotifications: jest.fn(async () => {}),
}))

// Mock del CartContext
jest.mock('../../src/context/CartContext', () => ({
  useCartContext: () => ({ refresh: jest.fn(async () => {}) }),
}))

// Mock del servicio pin (controlable por test)
const mockVerifyPin = jest.fn()
const mockGetPinRefreshToken = jest.fn()
const mockIncrementFailedAttempts = jest.fn()
const mockResetFailedAttempts = jest.fn()
const mockIsLockedOut = jest.fn()
const mockGetLockoutRemainingSeconds = jest.fn()
const mockDisablePin = jest.fn()

jest.mock('../../src/services/pin', () => ({
  verifyPin: (...args) => mockVerifyPin(...args),
  getPinRefreshToken: (...args) => mockGetPinRefreshToken(...args),
  incrementFailedAttempts: (...args) => mockIncrementFailedAttempts(...args),
  resetFailedAttempts: (...args) => mockResetFailedAttempts(...args),
  isLockedOut: (...args) => mockIsLockedOut(...args),
  getLockoutRemainingSeconds: (...args) => mockGetLockoutRemainingSeconds(...args),
  disablePin: (...args) => mockDisablePin(...args),
}))

// Mock del componente Logo
jest.mock('../../src/components/Logo', () => {
  const { View } = require('react-native')
  return function MockLogo() { return <View testID="logo" /> }
})

const api = require('../../src/api/api')

import PinLoginScreen from '../../src/pages/PinLoginScreen'

beforeEach(() => {
  jest.clearAllMocks()
  mockIsLockedOut.mockResolvedValue(false)
  mockGetLockoutRemainingSeconds.mockResolvedValue(0)
  mockVerifyPin.mockResolvedValue(false)
  mockGetPinRefreshToken.mockResolvedValue('stored-refresh')
  mockIncrementFailedAttempts.mockResolvedValue(1)
  mockResetFailedAttempts.mockResolvedValue(undefined)
  mockDisablePin.mockResolvedValue(undefined)
})

describe('PinLoginScreen — estado inicial', () => {
  it('muestra el PinPad cuando no está bloqueado', async () => {
    const { getByText } = render(<PinLoginScreen />)
    await waitFor(() => {
      expect(getByText('INGRESAR CON PIN')).toBeTruthy()
    })
    expect(getByText('1')).toBeTruthy()
    expect(getByText('0')).toBeTruthy()
  })

  it('muestra mensaje de bloqueo y oculta PinPad cuando está bloqueado al montar', async () => {
    mockIsLockedOut.mockResolvedValue(true)
    mockGetLockoutRemainingSeconds.mockResolvedValue(240)
    const { getByText, queryByText } = render(<PinLoginScreen />)
    await waitFor(() => {
      expect(getByText('Acceso bloqueado')).toBeTruthy()
    })
    expect(queryByText('1')).toBeNull()
  })

  it('siempre muestra el enlace para usar email y contraseña', async () => {
    const { getByText } = render(<PinLoginScreen />)
    await waitFor(() => {
      expect(getByText('Usar email y contraseña')).toBeTruthy()
    })
  })
})

describe('PinLoginScreen — login exitoso', () => {
  it('navega al destino tras PIN correcto y refresh exitoso', async () => {
    mockVerifyPin.mockResolvedValue(true)
    api.post.mockResolvedValue({ data: { accessToken: 'new-access-token' } })

    const { getByText } = render(<PinLoginScreen />)
    await waitFor(() => expect(getByText('1')).toBeTruthy())

    await act(async () => {
      ;['1','2','3','4','5','6'].forEach(d => fireEvent.press(getByText(d)))
    })

    await waitFor(() => {
      expect(mockVerifyPin).toHaveBeenCalledWith('123456')
      expect(api.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'stored-refresh' })
      expect(mockResetFailedAttempts).toHaveBeenCalled()
      expect(mockReplace).toHaveBeenCalled()
    })
  })
})

describe('PinLoginScreen — intentos fallidos y bloqueo', () => {
  it('muestra error con intentos restantes tras PIN incorrecto', async () => {
    mockVerifyPin.mockResolvedValue(false)
    mockIncrementFailedAttempts.mockResolvedValue(1)

    const { getByText } = render(<PinLoginScreen />)
    await waitFor(() => expect(getByText('1')).toBeTruthy())

    await act(async () => {
      ;['9','9','9','9','9','9'].forEach(d => fireEvent.press(getByText('9')))
    })

    await waitFor(() => {
      expect(getByText(/PIN incorrecto/)).toBeTruthy()
      expect(getByText(/Intentos restantes: 2/)).toBeTruthy()
    })
  })

  it('muestra bloqueo cuando incrementFailedAttempts devuelve 3', async () => {
    mockVerifyPin.mockResolvedValue(false)
    mockIncrementFailedAttempts.mockResolvedValue(3)
    // Mount check returns false (no bloqueado aún); llamadas posteriores retornan true
    mockIsLockedOut.mockResolvedValueOnce(false).mockResolvedValue(true)
    mockGetLockoutRemainingSeconds.mockResolvedValue(300)

    const { getByText } = render(<PinLoginScreen />)
    await waitFor(() => expect(getByText('1')).toBeTruthy())

    await act(async () => {
      ;['9','9','9','9','9','9'].forEach(d => fireEvent.press(getByText('9')))
    })

    await waitFor(() => {
      expect(getByText('Acceso bloqueado')).toBeTruthy()
    })
  })

  it('limpiar PIN y pedir login completo si el refresh token está expirado (401)', async () => {
    mockVerifyPin.mockResolvedValue(true)
    api.post.mockRejectedValue({ response: { status: 401 } })

    const { getByText } = render(<PinLoginScreen />)
    await waitFor(() => expect(getByText('1')).toBeTruthy())

    await act(async () => {
      ;['1','2','3','4','5','6'].forEach(d => fireEvent.press(getByText(d)))
    })

    await waitFor(() => {
      expect(mockDisablePin).toHaveBeenCalled()
      expect(getByText(/Tu sesión expiró/)).toBeTruthy()
    })
  })
})

describe('PinLoginScreen — navegación de escape', () => {
  it('el enlace de email/contraseña navega de vuelta al login', async () => {
    const { getByText } = render(<PinLoginScreen />)
    await waitFor(() => expect(getByText('Usar email y contraseña')).toBeTruthy())
    fireEvent.press(getByText('Usar email y contraseña'))
    expect(mockReplace).toHaveBeenCalled()
  })
})
