import { AccessibilityInfo } from 'react-native'
import { renderHook, waitFor } from '@testing-library/react-native'
import { useReduceMotion } from '../../src/utils/useReduceMotion'

describe('useReduceMotion', () => {
  beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockReturnValue({ remove: jest.fn() })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('arranca en false por defecto', () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false)
    const { result } = renderHook(() => useReduceMotion())
    expect(result.current).toBe(false)
  })

  it('refleja true cuando reduce-motion está activo en el SO', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true)
    const { result } = renderHook(() => useReduceMotion())
    await waitFor(() => expect(result.current).toBe(true))
  })
})
