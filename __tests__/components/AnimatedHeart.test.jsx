import React from 'react'
import { Animated } from 'react-native'
import { render, fireEvent } from '@testing-library/react-native'
import { ThemeProvider } from '../../src/theme/ThemeContext'
import AnimatedHeart from '../../src/components/AnimatedHeart'

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
}))

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(async () => {}),
  ImpactFeedbackStyle: { Light: 'light' },
}))

let mockReduceMotion = false
jest.mock('../../src/utils/useReduceMotion', () => ({
  useReduceMotion: () => mockReduceMotion,
}))

function renderHeart(props) {
  return render(
    <ThemeProvider>
      <AnimatedHeart liked={false} onToggle={jest.fn()} {...props} />
    </ThemeProvider>
  )
}

beforeEach(() => {
  mockReduceMotion = false
  jest.clearAllMocks()
})

describe('AnimatedHeart', () => {
  it('renderiza con accesibilidad de "agregar" cuando no está marcado', () => {
    const { getByLabelText } = renderHeart({ liked: false })
    expect(getByLabelText('Agregar a favoritos')).toBeTruthy()
  })

  it('avisa onToggle(true) al marcar', () => {
    const onToggle = jest.fn()
    const { getByLabelText } = renderHeart({ liked: false, onToggle })
    fireEvent.press(getByLabelText('Agregar a favoritos'))
    expect(onToggle).toHaveBeenCalledWith(true)
  })

  it('hace pop (sequence) al marcar y NO al desmarcar', () => {
    const seqSpy = jest.spyOn(Animated, 'sequence')
    const { getByLabelText } = renderHeart({ liked: false })

    // marcar → pop
    fireEvent.press(getByLabelText('Agregar a favoritos'))
    expect(seqSpy).toHaveBeenCalledTimes(1)

    // desmarcar → sin pop
    fireEvent.press(getByLabelText('Quitar de favoritos'))
    expect(seqSpy).toHaveBeenCalledTimes(1)
    seqSpy.mockRestore()
  })

  it('no anima con reduce-motion activo', () => {
    mockReduceMotion = true
    const seqSpy = jest.spyOn(Animated, 'sequence')
    const { getByLabelText } = renderHeart({ liked: false })
    fireEvent.press(getByLabelText('Agregar a favoritos'))
    expect(seqSpy).not.toHaveBeenCalled()
    seqSpy.mockRestore()
  })
})
