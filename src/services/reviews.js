import ordersApi from '../api/ordersApi'

export async function createSellerReview(orderId, { sellerId, score, comment }) {
  const { data } = await ordersApi.post(`/orders/${orderId}/reviews`, {
    seller_id: String(sellerId),
    score,
    comment: comment ?? null,
  })
  return data
}

export async function getSellerReputation(sellerId) {
  const { data } = await ordersApi.get(`/orders/reviews/sellers/${sellerId}`)
  return data
}

export async function createProductReview(orderId, { productId, score, comment }) {
  const { data } = await ordersApi.post(`/orders/${orderId}/product-reviews`, {
    product_id: String(productId),
    score,
    comment: comment ?? null,
  })
  return data
}

export async function getProductReputation(productId) {
  const { data } = await ordersApi.get(`/orders/product-reviews/${productId}`)
  return data
}

export function formatAverageScore(average) {
  if (average === null || average === undefined) return '-'
  return Number(average).toFixed(1)
}
