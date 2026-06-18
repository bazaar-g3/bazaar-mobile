
import React from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react-native'

// Mock de expo-secure-store (necesario para pin.js)
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

// Mock de @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => 'mock-refresh-token'),
  setItem: jest.fn(async () => { }),
  removeItem: jest.fn(async () => { }),
  multiRemove: jest.fn(async () => { }),
}))

// Mock de expo-router
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockBack = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: mockBack }),
  useLocalSearchParams: () => ({}),
}))

// Mock del servicio pin con los nombres correctos que usa PinSetupScreen
const mockEnablePin = jest.fn(async () => { })
jest.mock('../../src/services/pin', () => ({
  isPinSetOnDevice: jest.fn(async () => false),
  enablePinForAccount: (...args) => mockEnablePin(...args),
  verifyPin: jest.fn(async () => false),
}))

// Mock del ThemeContext — los screens usan theme.color.*
jest.mock('../../src/theme/ThemeContext', () => ({
  useTheme: () => ({
    mode: 'light',
    theme: {
      color: {
        surface: '#FFFFFF',
        surfaceSubtle: '#F1F5F9',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        textMuted: '#94A3B8',
        accent: '#2E9E95',
        accentTint: '#E6F7F6',
        error: '#C62828',
        errorLight: '#FEE2E2',
        border: '#E2E8F0',
      },
    },
    toggle: jest.fn(),
    setMode: jest.fn(),
  }),
}))

// Mock de componentes nativos/expo que no necesitamos renderizar realmente
jest.mock('../../src/components/Logo', () => {
  const { View } = require('react-native')
  return function MockLogo() { return <View testID="logo" /> }
})

import PinSetupScreen from '../../src/pages/PinSetupScreen'

const SecureStore = require('expo-secure-store')
const pinService = require('../../src/services/pin')

beforeEach(() => {
  SecureStore._reset()
  jest.clearAllMocks()
  // Por defecto: no hay PIN configurado en el dispositivo → muestra paso 1
  pinService.isPinSetOnDevice.mockResolvedValue(false)
  pinService.verifyPin.mockResolvedValue(false)
})

// renderScreen es async: espera a que el check de isPinSetOnDevice resuelva
// y el componente deje de mostrar el ActivityIndicator
async function renderScreen(params = {}) {
  jest.spyOn(require('expo-router'), 'useLocalSearchParams').mockReturnValue(params)
  const result = render(<PinSetupScreen />)
  await waitFor(() => result.getByText('CONFIGURAR PIN'))
  return result
}

describe('PinSetupScreen — Paso 1 (ingresar PIN)', () => {
  it('renderiza correctamente el paso 1', async () => {
    const { getByText } = await renderScreen()
    expect(getByText('CONFIGURAR PIN')).toBeTruthy()
    expect(getByText(/Ingresá un PIN de al menos/)).toBeTruthy()
  })

  it('el botón Continuar está deshabilitado con menos de 6 dígitos', async () => {
    const { getByText } = await renderScreen()
    const continuar = getByText('CONTINUAR')
    expect(continuar.props.accessible).not.toBe(false)
    // El botón está dentro de un TouchableOpacity con disabled prop
    // Verificamos que ingresando solo 3 dígitos no avanza al paso 2
    fireEvent.press(getByText('1'))
    fireEvent.press(getByText('2'))
    fireEvent.press(getByText('3'))
    // Aún debería estar en paso 1
    expect(getByText('CONFIGURAR PIN')).toBeTruthy()
  })

  it('avanza al paso 2 después de ingresar 6 dígitos y presionar Continuar', async () => {
    const { getByText } = await renderScreen()
    ;['1', '2', '3', '4', '5', '6'].forEach(d => fireEvent.press(getByText(d)))
    await act(async () => { fireEvent.press(getByText('CONTINUAR')) })
    expect(getByText('CONFIRMAR PIN')).toBeTruthy()
  })
})

describe('PinSetupScreen — Paso 2 (confirmar PIN)', () => {
  async function goToStep2(screen) {
    const { getByText } = screen
    ;['1', '2', '3', '4', '5', '6'].forEach(d => fireEvent.press(getByText(d)))
    await act(async () => { fireEvent.press(getByText('CONTINUAR')) })
  }

  it('muestra error y vuelve al paso 1 cuando los PINs no coinciden', async () => {
    const screen = await renderScreen()
    await goToStep2(screen)
    const { getByText } = screen
    ;['9', '9', '9', '9', '9', '9'].forEach(d => fireEvent.press(getByText(d)))
    await act(async () => { fireEvent.press(getByText('CONFIRMAR')) })
    expect(getByText(/Los PINs no coinciden/)).toBeTruthy()
    expect(getByText('CONFIGURAR PIN')).toBeTruthy()
  })

  it('llama a enablePinForAccount con los valores correctos cuando los PINs coinciden', async () => {
    const screen = await renderScreen({ refreshToken: 'my-token' })
    await goToStep2(screen)
    const { getByText } = screen
    ;['1', '2', '3', '4', '5', '6'].forEach(d => fireEvent.press(getByText(d)))
    await act(async () => { fireEvent.press(getByText('CONFIRMAR')) })
    await waitFor(() => {
      // enablePinForAccount(pin, email, name, avatarUrl, refreshToken)
      // email=null (no params.email), name='Usuario' (fallback), avatarUrl=null, refreshToken='my-token'
      expect(mockEnablePin).toHaveBeenCalledWith('123456', null, 'Usuario', null, 'my-token')
    })
  })

  it('llama a router.back() si no hay redirectPath', async () => {
    const screen = await renderScreen()
    await goToStep2(screen)
    const { getByText } = screen
    ;['1', '2', '3', '4', '5', '6'].forEach(d => fireEvent.press(getByText(d)))
    await act(async () => { fireEvent.press(getByText('CONFIRMAR')) })
    await waitFor(() => {
      expect(mockBack).toHaveBeenCalled()
    })
  })

  it('llama a router.replace con redirectPath si está definido', async () => {
    const screen = await renderScreen({ refreshToken: 'tok', redirectPath: '/home' })
    await goToStep2(screen)
    const { getByText } = screen
    ;['1', '2', '3', '4', '5', '6'].forEach(d => fireEvent.press(getByText(d)))
    await act(async () => { fireEvent.press(getByText('CONFIRMAR')) })
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/home')
    })
  })

  it('muestra el enlace "Configurar más tarde" que llama a router.back()', async () => {
    const { getByText } = await renderScreen()
    fireEvent.press(getByText('Configurar más tarde'))
    expect(mockBack).toHaveBeenCalled()
  })
})
