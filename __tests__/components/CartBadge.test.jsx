import React from 'react'
import { Animated } from 'react-native'
import { render } from '@testing-library/react-native'
import { ThemeProvider } from '../../src/theme/ThemeContext'
import CartBadge from '../../src/components/CartBadge'

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
}))

let mockReduceMotion = false
jest.mock('../../src/utils/useReduceMotion', () => ({
  useReduceMotion: () => mockReduceMotion,
}))

// Conteo controlable: simulamos el store del carrito
let mockCount = 0
jest.mock('../../src/context/CartContext', () => ({
  useCartContext: () => ({ count: mockCount }),
}))

function renderBadge() {
  return render(
    <ThemeProvider>
      <CartBadge />
    </ThemeProvider>
  )
}

beforeEach(() => {
  mockReduceMotion = false
  mockCount = 0
  jest.clearAllMocks()
})

describe('CartBadge', () => {
  it('no renderiza nada cuando el conteo es 0', () => {
    const { queryByText } = renderBadge()
    expect(queryByText('0')).toBeNull()
  })

  it('muestra el conteo y topea en 99+', () => {
    mockCount = 150
    const { getByText } = renderBadge()
    expect(getByText('99+')).toBeTruthy()
  })

  it('no anima en el mount inicial', () => {
    const seqSpy = jest.spyOn(Animated, 'sequence')
    mockCount = 2
    renderBadge()
    expect(seqSpy).not.toHaveBeenCalled()
    seqSpy.mockRestore()
  })

  it('hace bounce cuando el conteo se incrementa', () => {
    const seqSpy = jest.spyOn(Animated, 'sequence')
    mockCount = 1
    const { rerender } = renderBadge()
    expect(seqSpy).not.toHaveBeenCalled()

    mockCount = 2
    rerender(
      <ThemeProvider>
        <CartBadge />
      </ThemeProvider>
    )
    expect(seqSpy).toHaveBeenCalled()
    seqSpy.mockRestore()
  })

  it('no anima en decremento', () => {
    mockCount = 3
    const { rerender } = renderBadge()
    const seqSpy = jest.spyOn(Animated, 'sequence')

    mockCount = 2
    rerender(
      <ThemeProvider>
        <CartBadge />
      </ThemeProvider>
    )
    expect(seqSpy).not.toHaveBeenCalled()
    seqSpy.mockRestore()
  })

  it('no anima con reduce-motion activo aunque incremente', () => {
    mockReduceMotion = true
    mockCount = 1
    const { rerender } = renderBadge()
    const seqSpy = jest.spyOn(Animated, 'sequence')

    mockCount = 5
    rerender(
      <ThemeProvider>
        <CartBadge />
      </ThemeProvider>
    )
    expect(seqSpy).not.toHaveBeenCalled()
    seqSpy.mockRestore()
  })
})
