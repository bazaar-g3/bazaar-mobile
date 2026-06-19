/**
 * Tests para src/services/orders.js
 *
 * Cubre:
 *  - getCheckoutErrorMessage: mapeo de status codes a mensajes de usuario
 *  - getOrdersErrorMessage: mensajes genéricos de error para listado
 *  - getOrders / getOrderById: llamadas GET con params
 *  - previewCart / checkout: POST con payload correcto
 *  - confirmDelivery / updateOrderStatus: acciones de cambio de estado
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
  removeItem: jest.fn(async () => {}),
  multiRemove: jest.fn(async () => {}),
}))

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}))

// Mock del cliente HTTP de orders-api
jest.mock('../../src/api/ordersApi', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}))

// ─── Imports ──────────────────────────────────────────────────────────────────

import ordersApi from '../../src/api/ordersApi'

import {
  getOrders,
  getOrderById,
  previewCart,
  checkout,
  getSellerSales,
  getOrdersErrorMessage,
  getCheckoutErrorMessage,
  confirmDelivery,
  updateOrderStatus,
} from '../../src/services/orders'

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
})

// ─── getCheckoutErrorMessage ───────────────────────────────────────────────────

describe('getCheckoutErrorMessage', () => {
  it('retorna el detail string cuando la API lo provee directamente', () => {
    const error = { response: { status: 400, data: { detail: 'Cupón inválido.' } } }
    expect(getCheckoutErrorMessage(error)).toBe('Cupón inválido.')
  })

  it('retorna detail.message cuando detail es un objeto (stock insuficiente)', () => {
    const error = {
      response: {
        status: 409,
        data: { detail: { message: 'Stock insuficiente para "Remera"', items: [] } },
      },
    }
    expect(getCheckoutErrorMessage(error)).toBe('Stock insuficiente para "Remera"')
  })

  it('retorna mensaje de 400 cuando no hay detail string ni message', () => {
    const error = { response: { status: 400, data: { detail: null } } }
    expect(getCheckoutErrorMessage(error)).toBe('El carrito tiene productos no disponibles.')
  })

  it('retorna mensaje de 402 para error de pago', () => {
    const error = { response: { status: 402, data: {} } }
    expect(getCheckoutErrorMessage(error)).toBe('Error al iniciar el pago. Intentá de nuevo.')
  })

  it('retorna mensaje de 409 para stock insuficiente sin detail', () => {
    const error = { response: { status: 409, data: {} } }
    expect(getCheckoutErrorMessage(error)).toBe('Stock insuficiente para uno o más productos.')
  })

  it('retorna mensaje de 503 para servicios no disponibles', () => {
    const error = { response: { status: 503, data: {} } }
    expect(getCheckoutErrorMessage(error)).toBe(
      'No se pudo verificar el stock. Intentá nuevamente en unos segundos.'
    )
  })

  it('retorna error.message como fallback para errores de red', () => {
    const error = { message: 'Network Error' }
    expect(getCheckoutErrorMessage(error)).toBe('Network Error')
  })

  it('retorna mensaje genérico cuando no hay info útil', () => {
    expect(getCheckoutErrorMessage({})).toBe('No se pudo iniciar el pago.')
  })

  it('prioriza el detail string sobre el status code', () => {
    // Aunque el status sea 409, si hay detail string se usa ese
    const error = {
      response: { status: 409, data: { detail: 'No hay stock del producto X.' } },
    }
    expect(getCheckoutErrorMessage(error)).toBe('No hay stock del producto X.')
  })
})

// ─── getOrdersErrorMessage ─────────────────────────────────────────────────────

describe('getOrdersErrorMessage', () => {
  it('retorna el detail string cuando está disponible', () => {
    const error = { response: { data: { detail: 'No autorizado.' } } }
    expect(getOrdersErrorMessage(error)).toBe('No autorizado.')
  })

  it('retorna error.message como segundo fallback', () => {
    const error = { message: 'Request failed with status 500' }
    expect(getOrdersErrorMessage(error)).toBe('Request failed with status 500')
  })

  it('retorna el fallback por defecto cuando no hay info', () => {
    expect(getOrdersErrorMessage({})).toBe('No se pudieron cargar las órdenes.')
  })

  it('acepta un fallback personalizado', () => {
    expect(getOrdersErrorMessage({}, 'Error al cargar ventas.')).toBe('Error al cargar ventas.')
  })
})

// ─── getOrders ────────────────────────────────────────────────────────────────

describe('getOrders', () => {
  it('llama a GET /orders/ sin params cuando no se especifica status', async () => {
    ordersApi.get.mockResolvedValue({ data: [] })
    await getOrders()
    expect(ordersApi.get).toHaveBeenCalledWith('/orders/', { params: {} })
  })

  it('llama a GET /orders/ con params cuando se especifica status', async () => {
    ordersApi.get.mockResolvedValue({ data: [] })
    await getOrders('confirmed')
    expect(ordersApi.get).toHaveBeenCalledWith('/orders/', { params: { status: 'confirmed' } })
  })

  it('retorna los datos de la respuesta', async () => {
    const mockOrders = [{ id: 'abc', status: 'confirmed' }]
    ordersApi.get.mockResolvedValue({ data: mockOrders })
    const result = await getOrders()
    expect(result).toEqual(mockOrders)
  })

  it('propaga el error si la API falla', async () => {
    const apiError = new Error('Network error')
    ordersApi.get.mockRejectedValue(apiError)
    await expect(getOrders()).rejects.toThrow('Network error')
  })
})

// ─── getOrderById ─────────────────────────────────────────────────────────────

describe('getOrderById', () => {
  it('llama a GET /orders/:id con el ID correcto', async () => {
    const mockOrder = { id: 'order-123', status: 'shipped' }
    ordersApi.get.mockResolvedValue({ data: mockOrder })

    const result = await getOrderById('order-123')

    expect(ordersApi.get).toHaveBeenCalledWith('/orders/order-123')
    expect(result).toEqual(mockOrder)
  })
})

// ─── previewCart ──────────────────────────────────────────────────────────────

describe('previewCart', () => {
  it('llama a POST /orders/cart/preview con coupon_code null por defecto', async () => {
    const mockPreview = { subtotal: 100, discount_amount: 0, total: 100 }
    ordersApi.post.mockResolvedValue({ data: mockPreview })

    const result = await previewCart()

    expect(ordersApi.post).toHaveBeenCalledWith('/orders/cart/preview', { coupon_code: null })
    expect(result).toEqual(mockPreview)
  })

  it('envía el coupon_code cuando se proporciona', async () => {
    ordersApi.post.mockResolvedValue({
      data: { subtotal: 100, discount_amount: 20, total: 80, coupon_valid: true },
    })

    await previewCart('VERANO20')

    expect(ordersApi.post).toHaveBeenCalledWith('/orders/cart/preview', {
      coupon_code: 'VERANO20',
    })
  })
})

// ─── checkout ────────────────────────────────────────────────────────────────

describe('checkout', () => {
  const deliveryAddress = {
    calle: 'Av. Siempreviva',
    altura: '742',
    codigo_postal: '1234',
  }
  const idempotencyKey = 'uuid-1234-abcd'

  it('llama a POST /orders/checkout con el payload correcto', async () => {
    ordersApi.post.mockResolvedValue({
      data: { order_id: 'new-order', status: 'pending_payment', init_point: 'https://mp.com' },
    })

    await checkout(deliveryAddress, idempotencyKey)

    expect(ordersApi.post).toHaveBeenCalledWith('/orders/checkout', {
      delivery_address: deliveryAddress,
      idempotency_key: idempotencyKey,
      coupon_code: null,
    })
  })

  it('incluye coupon_code cuando se proporciona', async () => {
    ordersApi.post.mockResolvedValue({ data: { order_id: 'new-order' } })

    await checkout(deliveryAddress, idempotencyKey, 'PROMO10')

    expect(ordersApi.post).toHaveBeenCalledWith('/orders/checkout', {
      delivery_address: deliveryAddress,
      idempotency_key: idempotencyKey,
      coupon_code: 'PROMO10',
    })
  })

  it('retorna los datos del checkout (incluyendo init_point de MercadoPago)', async () => {
    const mockResponse = {
      order_id: 'order-abc',
      status: 'pending_payment',
      total: 1500,
      init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=abc',
    }
    ordersApi.post.mockResolvedValue({ data: mockResponse })

    const result = await checkout(deliveryAddress, idempotencyKey)

    expect(result).toEqual(mockResponse)
  })

  it('propaga error 409 cuando hay stock insuficiente', async () => {
    const stockError = {
      response: {
        status: 409,
        data: { detail: { message: 'Stock insuficiente', items: ['prod-1'] } },
      },
    }
    ordersApi.post.mockRejectedValue(stockError)

    await expect(checkout(deliveryAddress, idempotencyKey)).rejects.toMatchObject(stockError)
  })
})

// ─── confirmDelivery ──────────────────────────────────────────────────────────

describe('confirmDelivery', () => {
  it('llama a POST /orders/:id/confirm-delivery con seller_id como param', async () => {
    ordersApi.post.mockResolvedValue({ data: { status: 'delivered' } })

    await confirmDelivery('order-abc', '7')

    expect(ordersApi.post).toHaveBeenCalledWith(
      '/orders/order-abc/confirm-delivery',
      null,
      { params: { seller_id: '7' } }
    )
  })

  it('retorna los datos actualizados de la orden', async () => {
    ordersApi.post.mockResolvedValue({ data: { id: 'order-abc', status: 'delivered' } })
    const result = await confirmDelivery('order-abc', '7')
    expect(result).toMatchObject({ status: 'delivered' })
  })
})

// ─── updateOrderStatus ────────────────────────────────────────────────────────

describe('updateOrderStatus', () => {
  it('llama a PATCH /orders/:id/status con el body y seller_catalog_id', async () => {
    ordersApi.patch.mockResolvedValue({ data: { status: 'shipped' } })

    await updateOrderStatus('order-abc', { new_status: 'shipped', tracking_code: 'TRK001' }, 7)

    expect(ordersApi.patch).toHaveBeenCalledWith(
      '/orders/order-abc/status',
      { new_status: 'shipped', tracking_code: 'TRK001' },
      { params: { seller_catalog_id: 7 } }
    )
  })

  it('funciona sin tracking_code (cambio de estado sin envío)', async () => {
    ordersApi.patch.mockResolvedValue({ data: { status: 'in_preparation' } })

    await updateOrderStatus('order-abc', { new_status: 'in_preparation' }, 7)

    expect(ordersApi.patch).toHaveBeenCalledWith(
      '/orders/order-abc/status',
      { new_status: 'in_preparation' },
      { params: { seller_catalog_id: 7 } }
    )
  })
})

// ─── getSellerSales ───────────────────────────────────────────────────────────

describe('getSellerSales', () => {
  it('llama a GET /orders/seller-sales con seller_catalog_id', async () => {
    const mockSales = [{ order_id: 'ord-1', seller_subtotal: 500 }]
    ordersApi.get.mockResolvedValue({ data: mockSales })

    const result = await getSellerSales(7)

    expect(ordersApi.get).toHaveBeenCalledWith('/orders/seller-sales', {
      params: { seller_catalog_id: 7 },
    })
    expect(result).toEqual(mockSales)
  })
})
