import AsyncStorage from '@react-native-async-storage/async-storage'

const ORDERS_API_BASE_URL =
  process.env.EXPO_PUBLIC_ORDERS_API_URL || 'http://localhost:8003'

export async function listSellerSales(status = null) {
  const token = await AsyncStorage.getItem('token')

  const params = new URLSearchParams()

  if (status && status !== 'all') {
    params.append('status', status)
  }

  const url = `${ORDERS_API_BASE_URL}/seller/sales/${
    params.toString() ? `?${params.toString()}` : ''
  }`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail || 'No se pudieron cargar las ventas')
  }

  return data
}