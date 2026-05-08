import ordersApi from '../api/ordersApi'

export async function getOrders(status = null) {
  const params = status ? { status } : {}
  const { data } = await ordersApi.get('/orders/', { params })
  return data
}

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

export function getOrdersErrorMessage(error, fallback = 'No se pudieron cargar las órdenes.') {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail
  return error?.message || fallback
}

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
