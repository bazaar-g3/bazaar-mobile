import React from 'react'
import { Text } from 'react-native'
import { render, fireEvent } from '@testing-library/react-native'
import AnimatedPressable from '../../src/components/AnimatedPressable'

let mockReduceMotion = false
jest.mock('../../src/utils/useReduceMotion', () => ({
  useReduceMotion: () => mockReduceMotion,
}))

beforeEach(() => {
  mockReduceMotion = false
})

describe('AnimatedPressable', () => {
  it('renderiza children y dispara onPress', () => {
    const onPress = jest.fn()
    const { getByText } = render(
      <AnimatedPressable onPress={onPress}>
        <Text>Chip</Text>
      </AnimatedPressable>
    )
    fireEvent.press(getByText('Chip'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('no rompe en pressIn/pressOut y respeta callbacks propios', () => {
    const onPressIn = jest.fn()
    const onPressOut = jest.fn()
    const { getByText } = render(
      <AnimatedPressable onPress={jest.fn()} onPressIn={onPressIn} onPressOut={onPressOut}>
        <Text>X</Text>
      </AnimatedPressable>
    )
    fireEvent(getByText('X'), 'pressIn')
    fireEvent(getByText('X'), 'pressOut')
    expect(onPressIn).toHaveBeenCalled()
    expect(onPressOut).toHaveBeenCalled()
  })

  it('funciona con reduce-motion activo', () => {
    mockReduceMotion = true
    const onPress = jest.fn()
    const { getByText } = render(
      <AnimatedPressable onPress={onPress}>
        <Text>Y</Text>
      </AnimatedPressable>
    )
    fireEvent(getByText('Y'), 'pressIn')
    fireEvent.press(getByText('Y'))
    expect(onPress).toHaveBeenCalled()
  })
})
