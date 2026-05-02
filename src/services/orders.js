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

export function getOrdersErrorMessage(error, fallback = 'No se pudieron cargar las órdenes.') {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail
  return error?.message || fallback
}
