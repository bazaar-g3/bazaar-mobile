import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  buildTheme,
  lightColors,
  darkColors,
  lightOrderStatusColor,
  darkOrderStatusColor,
} from './index'

const STORAGE_KEY = '@bazaar_theme_mode'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState('light')

  // Cargar preferencia guardada al montar
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'dark' || saved === 'light') setModeState(saved)
      })
      .catch(() => {})
  }, [])

  const setMode = useCallback((m) => {
    setModeState(m)
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {})
  }, [])

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {})
      return next
    })
  }, [])

  const theme = useMemo(() => {
    const color = mode === 'light' ? lightColors : darkColors
    return {
      ...buildTheme(color),
      orderStatusColor: mode === 'light' ? lightOrderStatusColor : darkOrderStatusColor,
    }
  }, [mode])

  const value = useMemo(() => ({ mode, theme, toggle, setMode }), [mode, theme, toggle, setMode])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
