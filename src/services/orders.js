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

export function getOrdersErrorMessage(error, fallback = 'No se pudieron cargar las órdenes.') {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail
  return error?.message || fallback
}

export function getCheckoutErrorMessage(error) {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail
  const status = error?.response?.status
  if (status === 400) return 'El carrito tiene productos no disponibles.'
  if (status === 402) return 'Error al iniciar el pago. Intentá de nuevo.'
  if (status === 409) return 'Ya existe una orden activa para esta compra.'
  if (status === 503) return 'El servicio de pagos no está disponible. Intentá en unos minutos.'
  return error?.message || 'No se pudo iniciar el pago.'
}
