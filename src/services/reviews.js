import ordersApi from '../api/ordersApi'

/**
 * Califica a un vendedor por una orden entregada.
 * Requiere que el usuario esté autenticado (JWT inyectado por ordersApi).
 * @param {string} orderId - UUID de la orden en estado 'delivered'.
 * @param {{ sellerId: string|number, score: number, comment?: string|null }} params
 * @returns {Promise<{ id: string, order_id: string, seller_id: string, score: number, comment: string|null, created_at: string }>}
 * @throws {AxiosError} 403 si la orden no pertenece al usuario, 409 si ya fue calificado o la orden no está entregada.
 */
export async function createSellerReview(orderId, { sellerId, score, comment }) {
  const { data } = await ordersApi.post(`/orders/${orderId}/reviews`, {
    seller_id: String(sellerId),
    score,
    comment: comment ?? null,
  })
  return data
}

/**
 * Obtiene la reputación pública de un vendedor (no requiere autenticación).
 * @param {string|number} sellerId - ID del vendedor.
 * @returns {Promise<{ seller_id: string, average_score: number|null, review_count: number, reviews: Array }>}
 */
export async function getSellerReputation(sellerId) {
  const { data } = await ordersApi.get(`/orders/reviews/sellers/${sellerId}`)
  return data
}

/**
 * Califica un producto por una orden entregada.
 * Requiere que el usuario esté autenticado (JWT inyectado por ordersApi).
 * @param {string} orderId - UUID de la orden en estado 'delivered'.
 * @param {{ productId: string|number, score: number, comment?: string|null }} params
 * @returns {Promise<{ id: string, order_id: string, product_id: string, score: number, comment: string|null, created_at: string }>}
 * @throws {AxiosError} 403 si la orden no pertenece al usuario, 409 si ya fue calificado o la orden no está entregada.
 */
export async function createProductReview(orderId, { productId, score, comment }) {
  const { data } = await ordersApi.post(`/orders/${orderId}/product-reviews`, {
    product_id: String(productId),
    score,
    comment: comment ?? null,
  })
  return data
}

/**
 * Obtiene la reputación pública de un producto (no requiere autenticación).
 * @param {string|number} productId - ID del producto.
 * @returns {Promise<{ product_id: string, average_score: number|null, review_count: number, reviews: Array }>}
 */
export async function getProductReputation(productId) {
  const { data } = await ordersApi.get(`/orders/product-reviews/${productId}`)
  return data
}

/**
 * Formatea el puntaje promedio para mostrar en la UI.
 * @param {number|null} average
 * @returns {string} Puntaje con un decimal, o '-' si no hay calificaciones.
 */
export function formatAverageScore(average) {
  if (average === null || average === undefined) return '-'
  return Number(average).toFixed(1)
}
