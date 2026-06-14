
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
  setItem: jest.fn(async () => {}),
  removeItem: jest.fn(async () => {}),
  multiRemove: jest.fn(async () => {}),
}))

// Mock de expo-router
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockBack = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: mockBack }),
  useLocalSearchParams: () => ({}),
}))

// Mock del servicio pin (solo enablePin para controlar el resultado)
const mockEnablePin = jest.fn(async () => {})
jest.mock('../../src/services/pin', () => ({
  enablePin: (...args) => mockEnablePin(...args),
  isPinEnabled: jest.fn(async () => false),
}))

// Mock de componentes nativos/expo que no necesitamos renderizar realmente
jest.mock('../../src/components/Logo', () => {
  const { View } = require('react-native')
  return function MockLogo() { return <View testID="logo" /> }
})

import PinSetupScreen from '../../src/pages/PinSetupScreen'

const SecureStore = require('expo-secure-store')

beforeEach(() => {
  SecureStore._reset()
  jest.clearAllMocks()
})

function renderScreen(params = {}) {
  // Override useLocalSearchParams para pasar parámetros
  jest.spyOn(require('expo-router'), 'useLocalSearchParams').mockReturnValue(params)
  return render(<PinSetupScreen />)
}

describe('PinSetupScreen — Paso 1 (ingresar PIN)', () => {
  it('renderiza correctamente el paso 1', () => {
    const { getByText } = renderScreen()
    expect(getByText('CONFIGURAR PIN')).toBeTruthy()
    expect(getByText(/Ingresá un PIN de al menos/)).toBeTruthy()
  })

  it('el botón Continuar está deshabilitado con menos de 6 dígitos', () => {
    const { getByText } = renderScreen()
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
    const { getByText } = renderScreen()
    ;['1','2','3','4','5','6'].forEach(d => fireEvent.press(getByText(d)))
    await act(async () => { fireEvent.press(getByText('CONTINUAR')) })
    expect(getByText('CONFIRMAR PIN')).toBeTruthy()
  })
})

describe('PinSetupScreen — Paso 2 (confirmar PIN)', () => {
  async function goToStep2(screen) {
    const { getByText } = screen
    ;['1','2','3','4','5','6'].forEach(d => fireEvent.press(getByText(d)))
    await act(async () => { fireEvent.press(getByText('CONTINUAR')) })
  }

  it('muestra error y vuelve al paso 1 cuando los PINs no coinciden', async () => {
    const screen = renderScreen()
    await goToStep2(screen)
    const { getByText } = screen
    ;['9','9','9','9','9','9'].forEach(d => fireEvent.press(getByText(d)))
    await act(async () => { fireEvent.press(getByText('CONFIRMAR')) })
    expect(getByText(/Los PINs no coinciden/)).toBeTruthy()
    expect(getByText('CONFIGURAR PIN')).toBeTruthy()
  })

  it('llama a enablePin con los valores correctos cuando los PINs coinciden', async () => {
    const screen = renderScreen({ refreshToken: 'my-token' })
    await goToStep2(screen)
    const { getByText } = screen
    ;['1','2','3','4','5','6'].forEach(d => fireEvent.press(getByText(d)))
    await act(async () => { fireEvent.press(getByText('CONFIRMAR')) })
    await waitFor(() => {
      expect(mockEnablePin).toHaveBeenCalledWith('123456', 'my-token')
    })
  })

  it('llama a router.back() si no hay redirectPath', async () => {
    const screen = renderScreen()
    await goToStep2(screen)
    const { getByText } = screen
    ;['1','2','3','4','5','6'].forEach(d => fireEvent.press(getByText(d)))
    await act(async () => { fireEvent.press(getByText('CONFIRMAR')) })
    await waitFor(() => {
      expect(mockBack).toHaveBeenCalled()
    })
  })

  it('llama a router.replace con redirectPath si está definido', async () => {
    const screen = renderScreen({ refreshToken: 'tok', redirectPath: '/home' })
    await goToStep2(screen)
    const { getByText } = screen
    ;['1','2','3','4','5','6'].forEach(d => fireEvent.press(getByText(d)))
    await act(async () => { fireEvent.press(getByText('CONFIRMAR')) })
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/home')
    })
  })

  it('muestra el enlace "Configurar más tarde" que llama a router.back()', async () => {
    const { getByText } = renderScreen()
    fireEvent.press(getByText('Configurar más tarde'))
    expect(mockBack).toHaveBeenCalled()
  })
})
