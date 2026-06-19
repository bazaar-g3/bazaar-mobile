import { Animated } from 'react-native'
import { renderHook } from '@testing-library/react-native'
import { usePop } from '../../src/utils/usePop'

jest.mock('../../src/utils/useReduceMotion', () => ({
  useReduceMotion: () => false,
}))

describe('usePop', () => {
  it('no anima en el mount inicial', () => {
    const seqSpy = jest.spyOn(Animated, 'sequence')
    renderHook(() => usePop(1))
    expect(seqSpy).not.toHaveBeenCalled()
    seqSpy.mockRestore()
  })

  it('hace pop cuando el valor cambia', () => {
    const seqSpy = jest.spyOn(Animated, 'sequence')
    const { rerender } = renderHook(({ v }) => usePop(v), { initialProps: { v: 1 } })
    rerender({ v: 2 })
    expect(seqSpy).toHaveBeenCalled()
    seqSpy.mockRestore()
  })
})
