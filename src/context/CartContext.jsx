import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
} from '../services/cart'

const CartContext = createContext(undefined)

const EMPTY_STATE = { items: [], total: 0, hasUnavailable: false }

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [hasUnavailable, setHasUnavailable] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const applyResponse = useCallback((data) => {
    if (!data) {
      setItems([]); setTotal(0); setHasUnavailable(false)
      return
    }
    setItems(Array.isArray(data.items) ? data.items : [])
    setTotal(Number(data.total) || 0)
    setHasUnavailable(Boolean(data.has_unavailable_items))
  }, [])

  const refresh = useCallback(async () => {
    const token = await AsyncStorage.getItem('token')
    if (!token) {
      setItems([]); setTotal(0); setHasUnavailable(false); setError(null)
      return
    }
    setLoading(true); setError(null)
    try {
      const data = await getCart()
      applyResponse(data)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [applyResponse])

  const addItem = useCallback(async (productId, quantity = 1) => {
    const data = await addCartItem(productId, quantity)
    applyResponse(data)
    return data
  }, [applyResponse])

  const updateQuantity = useCallback(async (productId, quantity) => {
    const data = await updateCartItem(productId, quantity)
    applyResponse(data)
    return data
  }, [applyResponse])

  const removeItem = useCallback(async (productId) => {
    const data = await removeCartItem(productId)
    applyResponse(data)
    return data
  }, [applyResponse])

  const clearLocal = useCallback(() => {
    setItems([]); setTotal(0); setHasUnavailable(false); setError(null)
  }, [])

  // Sync inicial al montar (silencioso si no hay sesión)
  useEffect(() => { refresh() }, [refresh])

  const count = useMemo(
    () => items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0),
    [items]
  )

  const value = useMemo(() => ({
    items,
    total,
    count,
    hasUnavailable,
    loading,
    error,
    refresh,
    addItem,
    updateQuantity,
    removeItem,
    clearLocal,
  }), [items, total, count, hasUnavailable, loading, error,
       refresh, addItem, updateQuantity, removeItem, clearLocal])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCartContext() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider')
  }
  return context
}