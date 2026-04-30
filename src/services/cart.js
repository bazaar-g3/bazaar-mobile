import ordersApi from '../api/ordersApi'

export async function getCart() {
  const { data } = await ordersApi.get('/cart/')
  return data
}

export async function addCartItem(productId, quantity = 1) {
  const { data } = await ordersApi.post('/cart/items', {
    product_id: productId,
    quantity,
  })
  return data
}

export async function updateCartItem(productId, quantity) {
  const { data } = await ordersApi.patch(`/cart/items/${productId}`, { quantity })
  return data
}

export async function removeCartItem(productId) {
  const { data } = await ordersApi.delete(`/cart/items/${productId}`)
  return data
}

export function getCartErrorMessage(error, fallback = 'No se pudo actualizar el carrito.') {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail
  return error?.message || fallback
}