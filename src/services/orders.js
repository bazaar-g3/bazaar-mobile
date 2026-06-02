import ordersApi from '../api/ordersApi'

/**
 * Obtiene la lista de órdenes.
 * @param {string|null} status - Estado de las órdenes a filtrar.
 * @returns {Promise<Array>} - Lista de órdenes.
 */
export async function getOrders(status = null) {
  const params = status ? { status } : {}
  const { data } = await ordersApi.get('/orders/', { params })
  return data
}

/**
 * Obtiene los detalles de una orden por su ID.
 * @param {string} orderId - ID de la orden.
 * @returns {Promise<Object>} - Detalles de la orden.
 */
export async function getOrderById(orderId) {
  const { data } = await ordersApi.get(`/orders/${orderId}`)
  return data
}

/**
 * Previsualiza el desglose de precios del carrito con cupón opcional.
 * No consume el cupón ni reserva stock — solo calcula el descuento.
 * @param {string|null} couponCode - Código del cupón a evaluar, o null para sin descuento.
 * @returns {{ subtotal, discount_amount, total, coupon_code, coupon_valid, coupon_error }}
 */
export async function previewCart(couponCode = null) {
  const { data } = await ordersApi.post('/orders/cart/preview', {
    coupon_code: couponCode,
  })
  return data
}

/**
 * Inicia el proceso de checkout.
 * @param {{ calle: string, altura: string, codigo_postal: string, zona?: string, departamento?: string }} deliveryAddress
 * @param {string} idempotencyKey - UUID único por intento de pago.
 * @param {string|null} couponCode - Código de cupón a aplicar, o null.
 * @returns {{ order_id, status, subtotal, discount_amount, total, coupon_code, delivery_address, items, init_point }}
 */
export async function checkout(deliveryAddress, idempotencyKey, couponCode = null) {
  const { data } = await ordersApi.post('/orders/checkout', {
    delivery_address: deliveryAddress,
    idempotency_key: idempotencyKey,
    coupon_code: couponCode,
  })
  return data
}

/**
 * Obtiene las ventas confirmadas del vendedor (órdenes que contienen sus productos).
 * @param {number} sellerCatalogId - El ID entero del vendedor en catalog-api (= profile.id).
 * @returns {Array<{ order_id, created_at, buyer_id, delivery_address, items, seller_subtotal }>}
 */
export async function getSellerSales(sellerCatalogId) {
  const { data } = await ordersApi.get('/orders/seller-sales', {
    params: { seller_catalog_id: sellerCatalogId },
  })
  return data
}

/**
 * Obtiene un mensaje de error para las órdenes.
 * @param {Object} error - El error recibido de la API.
 * @param {string} [fallback='No se pudieron cargar las órdenes.'] - Mensaje de error por defecto.
 * @returns {string} - El mensaje de error.
 */
export function getOrdersErrorMessage(error, fallback = 'No se pudieron cargar las órdenes.') {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail
  return error?.message || fallback
}

/**
 * Obtiene un mensaje de error para el proceso de checkout.
 * @param {Object} error - El error recibido de la API.
 * @returns {string} - El mensaje de error.
 */
export function getCheckoutErrorMessage(error) {
  const detail = error?.response?.data?.detail
  const status = error?.response?.status

  // detail puede ser string (mensaje directo) u objeto {message, items} (stock insuficiente)
  if (typeof detail === 'string') return detail
  if (detail?.message) return detail.message

  if (status === 400) return 'El carrito tiene productos no disponibles.'
  if (status === 402) return 'Error al iniciar el pago. Intentá de nuevo.'
  if (status === 409) return 'Stock insuficiente para uno o más productos.'
  if (status === 503) return 'No se pudo verificar el stock. Intentá nuevamente en unos segundos.'
  return error?.message || 'No se pudo iniciar el pago.'
}

/**
 * Confirma la recepción del pedido (comprador).
 * La orden pasa de 'shipped' a 'delivered'.
 * @param {string} orderId - UUID de la orden.
 * @param {string} sellerId - ID del vendedor (catalog_id) que despachó la orden.
 */
export async function confirmDelivery(orderId, sellerId) {
  const { data } = await ordersApi.post(`/orders/${orderId}/confirm-delivery`, null, {
    params: { seller_id: sellerId },
  })
  return data
}

/**
 * Actualiza el estado de una orden (vendedor).
 * @param {string} orderId
 * @param {{ new_status: string, tracking_code?: string }} body
 * @param {number} sellerCatalogId
 */
export async function updateOrderStatus(orderId, body, sellerCatalogId) {
  const { data } = await ordersApi.patch(`/orders/${orderId}/status`, body, {
    params: { seller_catalog_id: sellerCatalogId },
  })
  return data
}