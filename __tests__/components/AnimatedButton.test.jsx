import React from 'react'
import { Text } from 'react-native'
import { render, fireEvent, act } from '@testing-library/react-native'
import { ThemeProvider } from '../../src/theme/ThemeContext'
import AnimatedButton from '../../src/components/AnimatedButton'

// ThemeProvider lee la preferencia de tema desde AsyncStorage al montar
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
}))

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(async () => {}),
  NotificationFeedbackType: { Success: 'success' },
}))

// Controlamos reduce-motion por test (evita tocar AccessibilityInfo nativo)
let mockReduceMotion = false
jest.mock('../../src/utils/useReduceMotion', () => ({
  useReduceMotion: () => mockReduceMotion,
}))

function renderButton(props) {
  return render(
    <ThemeProvider>
      <AnimatedButton label="Agregar al carrito" onPress={jest.fn()} testID="btn" {...props} />
    </ThemeProvider>
  )
}

beforeEach(() => {
  mockReduceMotion = false
  jest.clearAllMocks()
})

describe('AnimatedButton', () => {
  it('renderiza el label y el ícono', () => {
    const { getByText, getByTestId } = renderButton({
      icon: <Text testID="icon">+</Text>,
    })
    expect(getByText('Agregar al carrito')).toBeTruthy()
    expect(getByTestId('icon')).toBeTruthy()
  })

  it('dispara onPress al tocar', () => {
    const onPress = jest.fn()
    const { getByTestId } = renderButton({ onPress })
    fireEvent.press(getByTestId('btn'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('no dispara onPress si está disabled', () => {
    const onPress = jest.fn()
    const { getByTestId } = renderButton({ onPress, disabled: true })
    fireEvent.press(getByTestId('btn'))
    expect(onPress).not.toHaveBeenCalled()
  })

  it('con showSuccess y promesa resuelta entra en success y revierte tras successDurationMs', async () => {
    // reduce-motion activo → transiciones instantáneas (test determinista)
    mockReduceMotion = true
    jest.useFakeTimers()
    const onPress = jest.fn(() => Promise.resolve())
    const { getByTestId } = renderButton({ onPress, showSuccess: true, successDurationMs: 1000 })

    await act(async () => {
      fireEvent.press(getByTestId('btn'))
    })
    expect(getByTestId('btn').props.accessibilityState.busy).toBe(true)

    await act(async () => {
      jest.advanceTimersByTime(1000)
    })
    expect(getByTestId('btn').props.accessibilityState.busy).toBe(false)

    jest.useRealTimers()
  })

  it('con promesa rechazada no muestra success', async () => {
    const onPress = jest.fn(() => Promise.reject(new Error('falló')))
    const { getByTestId } = renderButton({ onPress, showSuccess: true })

    await act(async () => {
      fireEvent.press(getByTestId('btn'))
    })
    expect(getByTestId('btn').props.accessibilityState.busy).toBe(false)
  })

  it('con reduce-motion activo no rompe y dispara onPress', () => {
    mockReduceMotion = true
    const onPress = jest.fn()
    const { getByTestId } = renderButton({ onPress, showSuccess: true })
    fireEvent.press(getByTestId('btn'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})
