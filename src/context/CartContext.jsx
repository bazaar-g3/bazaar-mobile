import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(undefined)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])

  const value = useMemo(
    () => ({
      cartItems,
      addToCart: (item) => setCartItems((prev) => [...prev, item]),
      removeFromCart: (itemId) =>
        setCartItems((prev) => prev.filter((item) => item.id !== itemId)),
      clearCart: () => setCartItems([]),
    }),
    [cartItems]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCartContext() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider')
  }
  return context
}
