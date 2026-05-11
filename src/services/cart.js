import ordersApi from '../api/ordersApi'

/**
 * Obtiene el carrito de compras del usuario.
 * @returns El carrito de compras.
 */
export async function getCart() {
  const { data } = await ordersApi.get('/cart/')
  return data
}

/**
 * Agrega un ítem al carrito de compras del usuario.
 * @param productId - ID del producto.
 * @param quantity - Cantidad del producto.
 * @returns El ítem agregado al carrito.
 */
export async function addCartItem(productId, quantity = 1) {
  const { data } = await ordersApi.post('/cart/items', {
    product_id: productId,
    quantity,
  })
  return data
}

/**
 * Actualiza un ítem del carrito de compras del usuario.
 * @param productId - ID del producto.
 * @param quantity - Nueva cantidad del producto.
 * @returns El ítem actualizado del carrito.
 */
export async function updateCartItem(productId, quantity) {
  const { data } = await ordersApi.patch(`/cart/items/${productId}`, { quantity })
  return data
}

/**
 * Elimina un ítem del carrito de compras del usuario.
 * @param productId - ID del producto.
 * @returns Verdadero si se eliminó el ítem, falso si no existía.
 */
export async function removeCartItem(productId) {
  const { data } = await ordersApi.delete(`/cart/items/${productId}`)
  return data
}

/**
 * Obtiene un mensaje de error para el carrito.
 * @param error - El error recibido de la API.
 * @param fallback - Mensaje de error por defecto.
 * @returns El mensaje de error.
 */
export function getCartErrorMessage(error, fallback = 'No se pudo actualizar el carrito.') {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail
  return error?.message || fallback
}