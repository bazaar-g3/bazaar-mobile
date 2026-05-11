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
 * Inicia el proceso de checkout.
 * @param {{ calle: string, altura: string, codigo_postal: string, zona?: string, departamento?: string }} deliveryAddress
 * @param {string} idempotencyKey - UUID único por intento de pago.
 * @returns {{ order_id, status, total, delivery_address, items, init_point }}
 */
export async function checkout(deliveryAddress, idempotencyKey) {
  const { data } = await ordersApi.post('/orders/checkout', {
    delivery_address: deliveryAddress,
    idempotency_key: idempotencyKey,
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
 */
export async function confirmDelivery(orderId) {
  const { data } = await ordersApi.post(`/orders/${orderId}/confirm-delivery`)
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