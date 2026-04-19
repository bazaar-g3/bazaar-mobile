import { useWindowDimensions } from 'react-native'

/**
 * Hook que expone el ancho de pantalla y breakpoints para layouts responsivos.
 *
 * @returns {{ width: number, isSmall: boolean, isMedium: boolean, isTablet: boolean }}
 */
export function useResponsive() {
  const { width } = useWindowDimensions()
  return {
    width,
    isSmall: width < 500,
    isMedium: width >= 500 && width <= 768,
    isTablet: width > 768,
  }
}
